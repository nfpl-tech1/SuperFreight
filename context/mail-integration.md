# Mail Integration Notes

## Current State

SuperFreight now treats Microsoft as a mailbox-service integration, not as primary identity.

Implemented pieces:

- Outlook onboarding page
- backend Outlook connection status endpoint
- backend connect URL generator
- backend completion/reconnect endpoints
- local connection/subscription persistence

## Current Simplification

The code stores:

- Outlook connection state
- mailbox identity
- subscription metadata

It does not yet implement full Graph token exchange, webhook validation, or message ingestion workers.

## Intended Next Steps

1. Implement Microsoft token exchange in the Outlook completion path.
2. Add Graph subscription create/renew logic.
3. Add webhook endpoint for mailbox events.
4. Add inquiry classification and quote-thread linking pipeline.
5. Persist only extracted business data plus thread references, not full email archives.
