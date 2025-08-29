-- Create Subscriptions Table
CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    msisdn VARCHAR(20) NOT NULL UNIQUE,
    impi VARCHAR(255) NOT NULL UNIQUE,
    impu VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance optimization
CREATE INDEX idx_subscription_msisdn ON subscriptions(msisdn);
CREATE INDEX idx_subscription_status ON subscriptions(status);

-- Audit Trigger for Tracking Changes
CREATE TABLE subscription_audit_log (
    id BIGSERIAL PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);