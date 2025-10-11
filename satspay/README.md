# SatsPay - Bitcoin Wallet Interface

A comprehensive Bitcoin wallet interface built with React, TypeScript, and Tailwind CSS. Features modern 3D graphics, smooth animations, and cross-platform compatibility.

## Features

- **Professional UI**: Modern design with professional color palette and smooth animations
- **Multi-Wallet Support**: Connect to various Bitcoin wallets (mobile, web, cross-platform)
- **Bitcoin Payments**: Send and receive Bitcoin with transaction tracking
- **Lightning Network**: Integration with Alby SDK for Lightning payments
- **x402 Autopay**: Automated payments based on conditions
- **Secure Storage**: Local encrypted credential storage using Shamir's Secret Sharing
- **Cross-Platform**: Built with React for web, prepared for React Native mobile

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with professional color palette
- **State Management**: Zustand with persistence
- **Bitcoin**: bitcoinjs-lib for transaction handling
- **Lightning**: Alby SDK (WebLN) for Lightning Network
- **Scheduling**: node-cron for autopay monitoring
- **Security**: Shamir's Secret Sharing for credential encryption
- **Build Tool**: Create React App with CRACO

## Getting Started

### Prerequisites

- Node.js 16+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Available Scripts

- `pnpm start` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run tests
- `pnpm eject` - Eject from CRA (not recommended)

### Development

The app runs on [http://localhost:3000](http://localhost:3000) in development mode.

#### Bitcoin Testing Environment

For development and testing, SatsPay includes a local Bitcoin faucet powered by Nigiri:

```bash
# Setup Bitcoin testing environment
pnpm run nigiri:setup

# Start Bitcoin services only
pnpm run dev:bitcoin

# Start full development environment
pnpm run dev:full
```

The faucet provides:
- Local Bitcoin regtest network
- Test Bitcoin generation (0.02, 0.035, 0.05, 0.1 BTC amounts)
- Automatic transaction confirmation
- Integration with transaction history

See [NIGIRI_SETUP.md](./NIGIRI_SETUP.md) for detailed setup instructions.

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard and navigation
│   ├── wallet/         # Wallet management
│   ├── ui/             # Reusable UI components
│   └── animations/     # Animation components
├── services/           # Business logic services
│   ├── bitcoin/        # Bitcoin-related services
│   ├── lightning/      # Lightning Network services
│   ├── x402/           # Autopay services
│   ├── auth/           # Authentication services
│   └── api/            # External API clients
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Supported Wallets

### Mobile Wallets
- BlueWallet
- Munn
- Phoenix
- Zengo
- Breez
- Éclair
- Klever

### Web Wallets
- Sparrow
- Electrum Web

### Cross-Platform Wallets
- Casa
- Blockstream Green
- Unstoppable

## Development Setup

This project is set up with:
- TypeScript for type safety
- Tailwind CSS for styling with professional color palette
- Zustand for state management
- CRACO for Create React App configuration
- Professional animations and 3D graphics support

## Next Steps

1. Implement authentication system (Task 2)
2. Build dashboard layout and navigation (Task 3)
3. Add wallet connection functionality (Task 4)
4. Develop Bitcoin payment features (Task 5)
5. Set up transaction history (Task 6)
6. Implement x402 autopay system (Task 7)

## License

Private project - All rights reserved.