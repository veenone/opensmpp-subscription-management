# External Synchronization Service Implementation

## Overview

A comprehensive External Synchronization Service has been implemented for the SMPP Subscription Management System to handle real-time processing of external database changes, cache invalidation, webhook notifications, and Amarisoft bridge integration.

## Architecture Components

### 1. Core Entities and Repositories

**ExternalChange Entity** (`com.smpp.subscription.entity.ExternalChange`)
- Maps to the `external_changes` table created by V3 migration
- Tracks external database changes with full audit trail
- Supports JSON data storage for old/new values
- Includes processing status and error handling

**ExternalChangeRepository** (`com.smpp.subscription.repository.ExternalChangeRepository`)
- Comprehensive queries for unprocessed changes
- Batch processing support
- Performance metrics and bottleneck detection
- Cleanup operations for old processed changes

### 2. Core Services

**ExternalSyncService** (`com.smpp.subscription.service.ExternalSyncService`)
- Primary service for processing external changes
- Batch processing with configurable sizes
- Cache invalidation integration
- Webhook notification triggers
- Amarisoft bridge integration
- Comprehensive metrics and monitoring
- Thread-safe operations with proper error handling

**SyncScheduler** (`com.smpp.subscription.service.SyncScheduler`)
- Scheduled processing every 30 seconds
- Health monitoring and alerting
- Processing bottleneck detection
- Automatic recovery from stuck processing
- Daily cleanup of old changes
- Spring Boot health indicator implementation

**WebhookService** (`com.smpp.subscription.service.WebhookService`)
- Configurable webhook endpoints
- Retry logic with exponential backoff
- HMAC signature verification
- Async webhook notifications
- Comprehensive webhook testing capabilities

**AmarisoftBridge** (`com.smpp.subscription.service.AmarisoftBridge`)
- Integration with Amarisoft system
- In-memory subscription cache
- Real-time change notifications
- Connection management and health monitoring
- Async refresh operations

### 3. REST API Controller

**SyncController** (`com.smpp.subscription.controller.SyncController`)
- Manual synchronization triggers
- Status and health monitoring endpoints
- Cache invalidation controls
- Webhook testing capabilities
- External change browsing and filtering
- Scheduler enable/disable controls

## API Endpoints

### Synchronization Control
- `POST /api/v1/sync/trigger` - Manual synchronization trigger
- `POST /api/v1/sync/scheduler/toggle` - Enable/disable scheduler
- `POST /api/v1/sync/cache/invalidate` - Manual cache invalidation

### Monitoring and Status
- `GET /api/v1/sync/status` - Comprehensive sync status
- `GET /api/v1/sync/health` - Health check information
- `GET /api/v1/sync/external-changes` - List unprocessed changes
- `GET /api/v1/sync/external-changes/{id}` - Get specific change

### Webhook Management
- `POST /api/v1/sync/webhook/test` - Test webhook endpoints

## Configuration

### Application Properties (application.yml)
```yaml
app:
  sync:
    external:
      enabled: true
      polling-interval: 30000      # 30 seconds
      batch-size: 100
      max-retries: 3
      retry-delay: 1000
      max-processing-time-minutes: 10
      health-check-threshold-minutes: 5
      cleanup-retention-days: 30
    webhook:
      enabled: true
      timeout: 5000
      max-retries: 3
      retry-delay: 1000
      secret: ${WEBHOOK_SECRET:your-webhook-signing-secret}
      endpoints:
        - ${WEBHOOK_ENDPOINT_1:}
        - ${WEBHOOK_ENDPOINT_2:}
        - ${WEBHOOK_ENDPOINT_3:}
    amarisoft:
      enabled: true
      host: ${AMARISOFT_HOST:localhost}
      port: ${AMARISOFT_PORT:8080}
      username: ${AMARISOFT_USERNAME:admin}
      password: ${AMARISOFT_PASSWORD:admin}
      timeout: 5000
      max-retries: 3
```

### Environment Variables
- `WEBHOOK_SECRET` - Secret key for webhook HMAC signatures
- `WEBHOOK_ENDPOINT_1/2/3` - Webhook endpoint URLs
- `AMARISOFT_HOST/PORT` - Amarisoft system connection details
- `AMARISOFT_USERNAME/PASSWORD` - Amarisoft authentication credentials

## Key Features

### Real-time Processing
- External changes detected within 30 seconds
- Automatic cache invalidation for affected subscriptions
- Immediate Amarisoft in-memory data refresh
- Async webhook notifications to external systems

### Error Handling and Recovery
- Automatic retry logic with exponential backoff
- Failed change tracking and manual retry capabilities
- Processing bottleneck detection and recovery
- Stuck processing detection and automatic recovery

### Performance Monitoring
- Comprehensive metrics with Micrometer integration
- Processing time tracking
- Success/failure rate monitoring
- Cache hit ratio tracking
- Webhook delivery statistics

### Health Monitoring
- Spring Boot health indicator integration
- Processing lag monitoring
- Connection status to external systems
- Automatic health threshold alerting

### Security
- HMAC signature verification for webhooks
- Secure credential management
- Audit trail for all operations
- Role-based access control for API endpoints

## Database Integration

### Trigger-based Change Detection
The service integrates with PostgreSQL triggers (V3 migration) that automatically detect external changes:
- Subscription INSERT/UPDATE/DELETE operations
- JSON-based old/new value tracking
- Change source identification
- Automatic audit log entries

### External Change Processing Flow
1. External system modifies subscription data
2. PostgreSQL trigger captures change in `external_changes` table
3. SyncScheduler detects unprocessed changes (every 30 seconds)
4. ExternalSyncService processes changes in batches
5. Cache invalidation performed for affected subscriptions
6. Amarisoft bridge refreshes in-memory data
7. Webhook notifications sent to external systems
8. Change marked as processed with success/failure status

## Performance Characteristics

### Scalability
- Configurable batch processing (default: 100 changes)
- Async processing for non-blocking operations
- Connection pooling for external system calls
- Efficient database queries with proper indexing

### Throughput
- Processes up to 100 changes per 30-second cycle
- Supports burst processing for large change volumes
- Automatic cleanup of old processed changes
- Optimized JSON-based change data storage

### Latency
- Maximum processing lag: 30 seconds for scheduled processing
- Immediate processing available via manual triggers
- Async operations don't block main processing flow
- Real-time health and status monitoring

## Monitoring and Observability

### Metrics
- `sync.changes.processed` - Total processed changes
- `sync.changes.failed` - Failed change processing
- `sync.cache.invalidations` - Cache invalidation operations
- `sync.webhook.notifications` - Webhook notifications sent
- `amarisoft.refresh.success/failure` - Amarisoft operations

### Health Indicators
- Processing lag monitoring (threshold: 5 minutes)
- Unprocessed change count (threshold: 1000 changes)
- External system connectivity status
- Processing bottleneck detection

### Audit Trail
- All sync operations logged to audit system
- External system connection events
- Manual sync triggers and cache invalidations
- Webhook delivery success/failure tracking

## Security Considerations

### Authentication and Authorization
- JWT-based API authentication
- Role-based access control (ADMIN, SYNC_MANAGER, SYNC_VIEWER)
- Secure external system credentials

### Data Protection
- HMAC signature verification for webhooks
- Encrypted sensitive configuration data
- Audit trail with immutable logging
- Secure connection to external systems

### Operational Security
- Manual intervention controls for emergency scenarios
- Health monitoring with automatic alerting
- Processing isolation to prevent cascading failures
- Comprehensive error logging for forensics

## Usage Examples

### Manual Sync Trigger
```bash
curl -X POST "http://localhost:8080/api/v1/sync/trigger?batchSize=50" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Cache Invalidation
```bash
curl -X POST "http://localhost:8080/api/v1/sync/cache/invalidate" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "cacheName=subscription-by-msisdn&key=+1234567890"
```

### Health Check
```bash
curl -X GET "http://localhost:8080/api/v1/sync/health" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Webhook Test
```bash
curl -X POST "http://localhost:8080/api/v1/sync/webhook/test" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "endpoint=https://external-system.com/webhook"
```

## Maintenance and Operations

### Daily Operations
- Monitor sync status via `/api/v1/sync/status` endpoint
- Review processing metrics in Prometheus/Grafana
- Check webhook delivery success rates
- Validate Amarisoft connectivity status

### Troubleshooting
1. **High Processing Lag**: Check batch size configuration and database performance
2. **Failed Webhooks**: Verify endpoint URLs and network connectivity
3. **Amarisoft Connection Issues**: Check credentials and network access
4. **Processing Stuck**: Manual recovery via scheduler toggle endpoints

### Performance Tuning
- Adjust batch sizes based on processing capacity
- Configure retry policies for external systems
- Optimize cleanup retention periods
- Scale processing thread pools for high volume

This implementation provides a robust, scalable, and maintainable solution for external synchronization with comprehensive monitoring, error handling, and security features.