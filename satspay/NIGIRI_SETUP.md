# Nigiri Bitcoin Testing Environment Setup

This document explains how to set up and use the local Bitcoin testing environment using Nigiri for SatsPay development.

## Overview

The Nigiri setup provides:
- Local Bitcoin regtest network
- Electrs indexer for blockchain data
- Lightning Network daemon (LND)
- Custom Bitcoin faucet API
- All services containerized with Docker

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ for the faucet API
- At least 2GB free disk space

## Quick Start

1. **Setup the environment:**
   ```bash
   npm run nigiri:setup
   ```

2. **Start services individually:**
   ```bash
   npm run nigiri:start
   ```

3. **View logs:**
   ```bash
   npm run nigiri:logs
   ```

4. **Stop services:**
   ```bash
   npm run nigiri:stop
   ```

## Service URLs

Once running, the following services are available:

- **Bitcoin RPC**: `http://localhost:18443`
  - Username: `admin`
  - Password: `123`
- **Electrs**: `http://localhost:60401`
- **LND gRPC**: `localhost:10009`
- **LND REST**: `http://localhost:8080`
- **Faucet API**: `http://localhost:3001`

## Faucet API Endpoints

### Get Faucet Information
```bash
curl http://localhost:3001/api/faucet/info
```

### Request Test Bitcoin
```bash
curl -X POST http://localhost:3001/api/faucet/send \
  -H "Content-Type: application/json" \
  -d '{
    "address": "bcrt1q...",
    "amount": 0.02
  }'
```

### Generate Test Address
```bash
curl http://localhost:3001/api/faucet/generate-address
```

### Health Check
```bash
curl http://localhost:3001/health
```

## Available Faucet Amounts

The faucet supports the following predefined amounts:
- 0.02 BTC
- 0.035 BTC
- 0.05 BTC
- 0.1 BTC

## Environment Variables

The following environment variables are used:

### Bitcoin Network
- `REACT_APP_BITCOIN_NETWORK=regtest`
- `REACT_APP_BITCOIN_RPC_HOST=localhost`
- `REACT_APP_BITCOIN_RPC_PORT=18443`

### Faucet Configuration
- `REACT_APP_FAUCET_API_URL=http://localhost:3001`
- `REACT_APP_ENABLE_FAUCET=true`
- `REACT_APP_ENABLE_REGTEST=true`

## Development Workflow

1. **Start the full development environment:**
   ```bash
   npm run dev:full
   ```

2. **Start only Bitcoin services:**
   ```bash
   npm run dev:bitcoin
   ```

3. **Use the faucet in the UI:**
   - Navigate to the Home section
   - Find the "Bitcoin Faucet" panel (only visible in development)
   - Select an amount and enter/generate a Bitcoin address
   - Click "Request Bitcoin" to receive test funds

## Troubleshooting

### Services won't start
- Check if Docker is running
- Ensure ports 18443, 60401, 10009, 8080, and 3001 are available
- Try `docker-compose down` and restart

### Faucet shows "Offline"
- Check if Bitcoin service is running: `docker-compose logs bitcoin`
- Verify the faucet API is healthy: `curl http://localhost:3001/health`
- Restart the faucet service: `docker-compose restart faucet-api`

### No coins available
- The faucet automatically generates blocks on startup
- If balance is low, restart the Bitcoin service to generate more blocks

### Transaction not confirming
- Transactions are automatically confirmed by generating a block
- Check the transaction in the UI or via Bitcoin RPC

## Manual Bitcoin RPC Commands

You can interact directly with the Bitcoin node:

```bash
# Get balance
curl -u admin:123 -X POST http://localhost:18443 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"test","method":"getbalance","params":[]}'

# Generate blocks
curl -u admin:123 -X POST http://localhost:18443 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"test","method":"generatetoaddress","params":[1,"bcrt1q..."]}'

# Get new address
curl -u admin:123 -X POST http://localhost:18443 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"1.0","id":"test","method":"getnewaddress","params":[]}'
```

## Integration with SatsPay

The faucet is integrated with SatsPay's transaction history:
- Faucet transactions appear in the Transactions section
- Transactions are marked with sender "Bitcoin Faucet"
- All faucet requests are automatically confirmed
- Transaction history includes the Bitcoin transaction ID

## Security Notes

- This setup is for development only
- Uses regtest network with no real Bitcoin value
- All private keys and addresses are for testing
- Do not use any of these addresses or keys on mainnet