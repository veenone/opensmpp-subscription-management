-- V3__create_external_change_triggers.sql
-- Create triggers and functions for external change detection

-- Create table to track external changes
CREATE TABLE external_changes (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    entity_id BIGINT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    change_source VARCHAR(100),
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP,
    sync_status VARCHAR(20) DEFAULT 'PENDING',
    error_message TEXT
);

-- Create index for unprocessed changes
CREATE INDEX idx_external_changes_unprocessed ON external_changes(processed, changed_at) WHERE processed = false;
CREATE INDEX idx_external_changes_table_entity ON external_changes(table_name, entity_id);

-- Function to detect if change is from external source
CREATE OR REPLACE FUNCTION is_external_change()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the application has set a session variable indicating internal change
    -- If not set or not 'true', consider it external
    RETURN COALESCE(current_setting('app.internal_change', true), '') != 'true';
END;
$$ LANGUAGE plpgsql;

-- Function to log subscription external changes
CREATE OR REPLACE FUNCTION log_subscription_external_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if this is an external change
    IF is_external_change() THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO external_changes (table_name, operation, entity_id, new_data, change_source)
            VALUES ('subscriptions', TG_OP, NEW.id, row_to_json(NEW)::jsonb, 'EXTERNAL_DB');
            
            -- Also log to audit
            INSERT INTO audit_logs (entity_type, entity_id, action, user_name, 
                                   new_values, is_external_change, external_source)
            VALUES ('Subscription', NEW.id, 'CREATE', 'EXTERNAL', 
                   row_to_json(NEW)::text, true, 'DATABASE');
                   
        ELSIF TG_OP = 'UPDATE' THEN
            -- Only log if there are actual changes
            IF OLD IS DISTINCT FROM NEW THEN
                INSERT INTO external_changes (table_name, operation, entity_id, 
                                            old_data, new_data, change_source)
                VALUES ('subscriptions', TG_OP, NEW.id, 
                       row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, 'EXTERNAL_DB');
                
                -- Also log to audit
                INSERT INTO audit_logs (entity_type, entity_id, action, user_name, 
                                       old_values, new_values, is_external_change, external_source)
                VALUES ('Subscription', NEW.id, 'UPDATE', 'EXTERNAL', 
                       row_to_json(OLD)::text, row_to_json(NEW)::text, true, 'DATABASE');
            END IF;
            
        ELSIF TG_OP = 'DELETE' THEN
            INSERT INTO external_changes (table_name, operation, entity_id, old_data, change_source)
            VALUES ('subscriptions', TG_OP, OLD.id, row_to_json(OLD)::jsonb, 'EXTERNAL_DB');
            
            -- Also log to audit
            INSERT INTO audit_logs (entity_type, entity_id, action, user_name, 
                                   old_values, is_external_change, external_source)
            VALUES ('Subscription', OLD.id, 'DELETE', 'EXTERNAL', 
                   row_to_json(OLD)::text, true, 'DATABASE');
        END IF;
        
        -- Send notification via NOTIFY (optional, for real-time processing)
        PERFORM pg_notify('subscription_external_change', 
                         json_build_object(
                             'operation', TG_OP,
                             'entity_id', COALESCE(NEW.id, OLD.id),
                             'table', 'subscriptions'
                         )::text);
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription table
CREATE TRIGGER subscription_external_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION log_subscription_external_changes();

-- Function to mark changes as processed
CREATE OR REPLACE FUNCTION mark_external_change_processed(
    p_change_id BIGINT,
    p_status VARCHAR(20) DEFAULT 'SUCCESS',
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE external_changes
    SET processed = true,
        processed_at = CURRENT_TIMESTAMP,
        sync_status = p_status,
        error_message = p_error_message
    WHERE id = p_change_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get unprocessed external changes
CREATE OR REPLACE FUNCTION get_unprocessed_external_changes(
    p_limit INT DEFAULT 100
)
RETURNS TABLE (
    id BIGINT,
    table_name VARCHAR,
    operation VARCHAR,
    entity_id BIGINT,
    old_data JSONB,
    new_data JSONB,
    changed_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT ec.id, ec.table_name, ec.operation, ec.entity_id, 
           ec.old_data, ec.new_data, ec.changed_at
    FROM external_changes ec
    WHERE ec.processed = false
    ORDER BY ec.changed_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to set internal change flag (to be called by application)
CREATE OR REPLACE FUNCTION set_internal_change(p_is_internal BOOLEAN DEFAULT true)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.internal_change', p_is_internal::text, true);
END;
$$ LANGUAGE plpgsql;

-- Create stored procedure for cache invalidation notification
CREATE OR REPLACE FUNCTION notify_cache_invalidation(
    p_entity_type VARCHAR,
    p_entity_id BIGINT,
    p_msisdn VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    PERFORM pg_notify('cache_invalidation', 
                     json_build_object(
                         'entity_type', p_entity_type,
                         'entity_id', p_entity_id,
                         'msisdn', p_msisdn,
                         'timestamp', CURRENT_TIMESTAMP
                     )::text);
END;
$$ LANGUAGE plpgsql;

-- Add trigger to invalidate cache on subscription changes
CREATE OR REPLACE FUNCTION subscription_cache_invalidation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM notify_cache_invalidation('Subscription', OLD.id, OLD.msisdn);
    ELSE
        PERFORM notify_cache_invalidation('Subscription', NEW.id, NEW.msisdn);
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_cache_invalidation_trigger
    AFTER INSERT OR UPDATE OR DELETE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION subscription_cache_invalidation();

-- Create view for monitoring external changes
CREATE OR REPLACE VIEW v_external_changes_summary AS
SELECT 
    table_name,
    operation,
    sync_status,
    COUNT(*) as change_count,
    MIN(changed_at) as oldest_change,
    MAX(changed_at) as newest_change,
    COUNT(CASE WHEN processed = false THEN 1 END) as unprocessed_count
FROM external_changes
GROUP BY table_name, operation, sync_status;

-- Grant necessary permissions
GRANT SELECT ON v_external_changes_summary TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_unprocessed_external_changes TO PUBLIC;
GRANT EXECUTE ON FUNCTION mark_external_change_processed TO PUBLIC;
GRANT EXECUTE ON FUNCTION set_internal_change TO PUBLIC;