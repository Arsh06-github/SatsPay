# Supabase Local Development Setup

This directory contains the configuration for running Supabase locally for the SatsPay Bitcoin wallet interface.

## Quick Start

1. **Start Supabase services:**
   ```bash
   pnpm run supabase:setup
   ```
   
   Or manually:
   ```bash
   docker-compose up -d
   ```

2. **Access services:**
   - **API Gateway**: http://127.0.0.1:54321
   - **Supabase Studio**: http://127.0.0.1:54323
   - **Database**: postgresql://postgres:your-super-secret-and-long-postgres-password@127.0.0.1:54322/postgres
   - **Email Testing (Inbucket)**: http://127.0.0.1:54324

3. **Stop services:**
   ```bash
   pnpm run supabase:stop
   ```

## Database Schema

The database includes the following tables:

### Users
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `age` (INTEGER)
- `encrypted_credentials` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

### Wallets
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `name` (VARCHAR)
- `type` (VARCHAR: 'mobile', 'web', 'cross-platform')
- `is_connected` (BOOLEAN)
- `connection_data` (JSONB)
- `balance` (DECIMAL)
- `address` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP)

### Transactions
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `wallet_id` (UUID, Foreign Key)
- `type` (VARCHAR: 'sent', 'received')
- `amount` (DECIMAL)
- `recipient`, `sender` (VARCHAR)
- `status` (VARCHAR: 'pending', 'completed', 'failed', 'autopay')
- `tx_hash` (VARCHAR)
- `autopay_rule_id` (UUID, Foreign Key)
- `created_at`, `updated_at` (TIMESTAMP)

### Autopay Rules
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `recipient_wallet_id` (VARCHAR)
- `amount` (DECIMAL)
- `condition` (TEXT)
- `is_active` (BOOLEAN)
- `last_triggered` (TIMESTAMP)
- `created_at`, `updated_at` (TIMESTAMP)

## API Keys

### Development Keys (Local Only)
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU`

## Seed Data

The database comes pre-populated with test data:
- 3 test users (Alice, Bob, Charlie)
- Multiple wallet connections
- Sample transactions (sent, received, pending, failed, autopay)
- Autopay rules for testing

## Troubleshooting

### Services won't start
- Ensure Docker is running
- Check if ports 54321-54324 are available
- Run `docker-compose logs` to see error messages

### Database connection issues
- Verify the database container is running: `docker-compose ps`
- Check database logs: `docker-compose logs db`

### API not responding
- Ensure Kong gateway is running: `docker-compose ps kong`
- Check Kong logs: `docker-compose logs kong`

## Development Workflow

1. Start Supabase: `pnpm run supabase:start`
2. Start React app: `pnpm start`
3. Access Supabase Studio at http://127.0.0.1:54323 for database management
4. Use the API at http://127.0.0.1:54321 for REST operations

## File Structure

```
supabase/
├── README.md                    # This file
├── config.toml                  # Supabase configuration
├── kong.yml                     # API Gateway configuration
├── migrations/                  # Database migrations
│   └── 20241009000001_initial_schema.sql
└── seed.sql                     # Test data
```