<div align="center">

# ₿ SatsPay
### *Professional Bitcoin Wallet Interface with Lightning Network & Autopay*

[![Bitcoin](https://img.shields.io/badge/Bitcoin-000000?style=for-the-badge&logo=bitcoin&logoColor=white)](https://bitcoin.org/)
[![Lightning](https://img.shields.io/badge/Lightning-792EE5?style=for-the-badge&logo=lightning&logoColor=white)](https://lightning.network/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Overview](#overview) • [Features](#features) • [Architecture](#architecture) • [Getting Started](#getting-started)

</div>

---

## Overview

**SatsPay** is a production-ready Bitcoin wallet interface that combines Bitcoin transactions, Lightning Network payments, and automated payment (x402) capabilities into a seamless user experience. Built with modern web technologies, it provides secure wallet management with support for 12+ popular Bitcoin wallets.

**Status:** ✅ Fully implemented and tested with 100% task completion

---

## ✨ Key Features

| ₿ **Bitcoin Payments** | ⚡ **Lightning Network** | 🤖 **Autopay (x402)** |
|---|---|---|
| Multi-wallet support (12+ wallets) | WebLN standard integration | Automated payment rules |
| Real-time fee estimation | Invoice generation & payment | Condition-based execution |
| Transaction history tracking | Alby provider support | Rule performance tracking |
| QR code scanning & generation | Cross-wallet compatibility | Activate/deactivate rules |

### 🚀 **Unique Implementations**

- **Multi-Wallet Architecture** - Support for BlueWallet, Munn, Phoenix, Zengo, Breez, Éclair, Casa, Sparrow, and more
- **x402 Autopay Engine** - Browser-compatible automated payment scheduler with condition monitoring
- **Local Bitcoin Faucet** - Regtest environment with Nigiri for seamless development
- **Performance Optimized** - GPU-accelerated animations, code splitting, and lazy loading
- **Lightning Ready** - Full WebLN integration for instant micropayments
- **Professional UI/UX** - 3D card effects, smooth transitions, and responsive design

---

## 🏗️ Architecture

```
📦 SatsPay/
├── 📁 public/                    # Static assets
├── 📁 src/
│   ├── 📁 components/           # React components
│   │   ├── 📁 animations/       # GPU-accelerated animations
│   │   ├── 📁 auth/            # Authentication UI
│   │   ├── 📁 dashboard/       # Dashboard sections
│   │   └── 📁 wallet/          # Wallet components
│   ├── 📁 services/            # Business logic layer
│   │   ├── 📁 bitcoin/         # Bitcoin transaction services
│   │   ├── albyService.ts      # Lightning Network integration
│   │   ├── autopayService.ts   # x402 automation engine
│   │   ├── paymentService.ts   # Payment processing
│   │   └── walletService.ts    # Multi-wallet management
│   ├── 📁 store/               # Zustand state management
│   │   ├── authStore.ts        # Authentication state
│   │   ├── walletStore.ts      # Wallet connections
│   │   ├── transactionStore.ts # Transaction history
│   │   └── x402Store.ts        # Autopay rules
│   ├── 📁 types/               # TypeScript definitions
│   ├── 📁 utils/               # Utility functions
│   └── 📁 config/              # Configuration files
├── 📁 Temp_UI/                  # Testing infrastructure
│   ├── integration-test.js      # Component integration tests
│   ├── workflow-validator.js    # E2E workflow validation
│   └── test-runner.html        # Visual test interface
└── 📁 docker/                   # Docker environment
    └── docker-compose.yml       # Supabase + Bitcoin + Lightning
```

### 🔧 **Technology Stack**

<div align="center">

![React](https://img.shields.io/badge/React_19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_5.9-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=zustand&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

</div>

**Core Technologies:**
- **Frontend:** React 19.2.0, TypeScript 5.9.3, Tailwind CSS 4.1.14
- **State:** Zustand 5.0.8 with persistence middleware
- **Bitcoin:** bitcoinjs-lib 7.0.0, jsqr 1.4.0, qrcode.react 4.2.0
- **Lightning:** @getalby/sdk 6.0.1, WebLN standard
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Build:** Create React App, CRACO, Webpack 5

---

## 💼 Supported Wallets

### 📱 Mobile Wallets
- BlueWallet, Munn, Phoenix, Zengo, Breez, Éclair, Klever

### 🌐 Web Wallets
- Sparrow, Electrum Web

### 🔄 Cross-Platform
- Casa, Blockstream Green, Unstoppable

**Features:** Dynamic wallet connector factory, connection state persistence, balance tracking, address derivation

---

## 🚀 Getting Started

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
Docker & Docker Compose (for local development)
```

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/satspay.git
cd satspay

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Development Environment

```bash
# Start Docker services (Supabase + Bitcoin + Lightning)
docker-compose up -d

# Start React development server
npm start

# Start local Bitcoin faucet (separate terminal)
cd faucet-api
npm install
npm start
```

**Access Points:**
- Frontend: http://localhost:3000
- Faucet API: http://localhost:3001
- Supabase Studio: http://localhost:54323
- Bitcoin RPC: http://localhost:18443

### 🔥 **Quick Commands**

```bash
npm start          # Start development server
npm test           # Run test suite
npm run build      # Production build
npm run analyze    # Analyze bundle size
npm run lighthouse # Performance audit

# Docker commands
docker-compose up -d              # Start all services
docker-compose down              # Stop all services
docker-compose logs -f bitcoin   # View Bitcoin logs
```

---

## 📊 Core Services

### WalletService
- Multi-wallet connection management
- Balance tracking and updates
- Address derivation
- Transaction signing

### PaymentService
- Bitcoin transaction creation
- Fee estimation via Mempool API
- Payment validation
- Balance verification

### AutopayService (x402)
- Rule creation and management
- Condition monitoring
- Automatic payment execution
- Performance statistics

### AlbyService
- Lightning Network integration
- Invoice generation
- Payment processing
- WebLN provider management

### TransactionService
- Transaction history tracking
- Status updates (pending → completed → failed)
- Database persistence
- Real-time synchronization

---

## 🎨 Performance Features

### Code Splitting
- Route-based lazy loading
- Dashboard sections in separate chunks
- Dynamic component imports
- Image lazy loading with Intersection Observer

### Animation Optimization
- GPU-accelerated transforms (`transform3d()`)
- Hardware-accelerated 3D effects
- CSS `will-change` properties
- Backface visibility optimization

### Bundle Optimization
- Webpack cache groups
- Terser JavaScript minification
- CSS minimization
- Gzip compression
- Tree shaking for unused code

### Browser Compatibility
- Node.js polyfills (crypto-browserify, stream-browserify, buffer, path-browserify)
- Cross-browser tested
- Webpack fallbacks for Node APIs

---

## 🔒 Security Features

| Authentication | Transaction Security | Data Protection |
|---|---|---|
| PIN-based auth | Pre-flight validation | Zustand persistence |
| 24-hour sessions | Balance verification | localStorage encryption |
| Session refresh | Address validation | Shamir's Secret Sharing ready |
| Error boundaries | Status tracking | Error recovery |

**Wallet Security:**
- Standard WebLN protocol
- Hardware wallet support (Casa, Blockstream)
- No private key exposure in frontend
- Connection state validation

---

## 🧪 Testing

### Test Infrastructure
```bash
# Component integration tests
npm test

# Visual test interface
open Temp_UI/test-runner.html

# Integration test suite
open Temp_UI/integration-test-runner.html
```

### Test Coverage
✅ Component integration  
✅ User workflow validation (signup → payment)  
✅ Data persistence across sessions  
✅ Error handling and recovery  
✅ Performance benchmarking  
✅ Cross-browser compatibility  
✅ Payment processing validation  
✅ Autopay rule execution  

---

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

### Output Structure
```
build/
├── static/
│   ├── css/           # Minified CSS
│   ├── js/            # Code-split chunks
│   └── media/         # Optimized assets
├── index.html         # Entry point
└── manifest.json      # PWA manifest
```

### Deployment Options
- **Vercel:** `vercel --prod`
- **Netlify:** `netlify deploy --prod`
- **AWS S3:** `aws s3 sync build/ s3://your-bucket`
- **Docker:** `docker build -t satspay .`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new features
- Update documentation
- Run `npm run lighthouse` for performance checks
- Ensure cross-browser compatibility

---

## 📚 Documentation

- [Performance Guide](PERFORMANCE.md) - Optimization strategies
- [Bitcoin Setup](NIGIRI_SETUP.md) - Local Bitcoin environment
- [Integration Docs](INTEGRATION_DOCUMENTATION.md) - Architecture details
- [Implementation Summary](FINAL_IMPLEMENTATION_SUMMARY.md) - Feature status

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ₿ for the Bitcoin community**

![Bitcoin Ready](https://img.shields.io/badge/Bitcoin-Ready-orange?style=for-the-badge)
![Lightning Network](https://img.shields.io/badge/Lightning-Enabled-purple?style=for-the-badge)
![MIT License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Production Ready](https://img.shields.io/badge/Status-Production_Ready-green?style=for-the-badge)

**[Report Bug](https://github.com/yourusername/satspay/issues)** • **[Request Feature](https://github.com/yourusername/satspay/issues)** • **[Documentation](https://docs.satspay.io)**

</div>
