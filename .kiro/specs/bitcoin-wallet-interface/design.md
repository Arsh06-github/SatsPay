# Design Document

## Overview

SatsPay is a comprehensive Bitcoin wallet interface that provides users with a professional dashboard for managing Bitcoin transactions, wallet connections, and automated payments through x402 protocol. The application features modern 3D graphics, smooth animations, and cross-platform compatibility using React with future React Native support.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   State Layer   │    │   Services      │
│   (React/CRA)   │◄──►│   (Zustand)     │◄──►│   (Bitcoin/LN)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   Local Storage │    │   External APIs │
│   (Tailwind)    │    │   (Encrypted)   │    │   (Mempool/etc) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack Integration

- **Frontend**: React 18 with TypeScript for type safety
- **Build Tool**: Create React App (CRA) for stable development and builds
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: Zustand for lightweight, scalable state
- **Bitcoin Logic**: bitcoinjs-lib for transaction handling
- **Lightning Network**: Alby SDK (WebLN) for Lightning integration
- **Database**: Supabase local instance for data persistence
- **Scheduling**: node-cron for x402 autopay monitoring
- **Security**: Shamir's Secret Sharing for credential encryption

## Components and Interfaces

### Core Components Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   └── AuthLayout.tsx
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── Navigation.tsx
│   │   └── sections/
│   │       ├── Home.tsx
│   │       ├── Pay.tsx
│   │       ├── Transactions.tsx
│   │       └── X402.tsx
│   ├── wallet/
│   │   ├── WalletList.tsx
│   │   ├── WalletCard.tsx
│   │   └── WalletConnector.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   └── animations/
│       ├── PageTransition.tsx
│       └── HapticFeedback.tsx
├── services/
│   ├── bitcoin/
│   │   ├── walletService.ts
│   │   ├── transactionService.ts
│   │   └── faucetService.ts
│   ├── lightning/
│   │   ├── albyService.ts
│   │   └── invoiceService.ts
│   ├── x402/
│   │   ├── autopayService.ts
│   │   └── conditionMonitor.ts
│   ├── auth/
│   │   ├── credentialService.ts
│   │   └── encryptionService.ts
│   └── api/
│       ├── mempoolApi.ts
│       └── supabaseClient.ts
├── stores/
│   ├── authStore.ts
│   ├── walletStore.ts
│   ├── transactionStore.ts
│   └── x402Store.ts
├── types/
│   ├── auth.ts
│   ├── wallet.ts
│   ├── transaction.ts
│   └── x402.ts
└── utils/
    ├── constants.ts
    ├── formatters.ts
    └── validators.ts
```

### Key Interfaces

```typescript
// User Authentication
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

interface AuthCredentials {
  email: string;
  pin: string;
}

// Wallet Management
interface Wallet {
  id: string;
  name: string;
  type: 'mobile' | 'web' | 'cross-platform';
  logo: string;
  isConnected: boolean;
  balance?: number;
  address?: string;
}

// Transaction Handling
interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  recipient?: string;
  sender?: string;
  status: 'pending' | 'completed' | 'failed' | 'autopay';
  timestamp: Date;
  txHash?: string;
}

// x402 Autopay
interface AutopayRule {
  id: string;
  recipientWalletId: string;
  amount: number;
  condition: string;
  isActive: boolean;
  lastTriggered?: Date;
}
```

## Data Models

### Database Schema (Supabase)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  age INTEGER NOT NULL,
  encrypted_credentials TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallets table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_connected BOOLEAN DEFAULT FALSE,
  connection_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  wallet_id UUID REFERENCES wallets(id),
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(16,8) NOT NULL,
  recipient VARCHAR(255),
  sender VARCHAR(255),
  status VARCHAR(20) NOT NULL,
  tx_hash VARCHAR(255),
  autopay_rule_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Autopay rules table
CREATE TABLE autopay_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  recipient_wallet_id VARCHAR(255) NOT NULL,
  amount DECIMAL(16,8) NOT NULL,
  condition TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Local Storage Schema

```typescript
// Encrypted credential storage
interface EncryptedCredentials {
  ibanLikeFormat: string; // Converted credentials
  encryptedData: string;  // Shamir's Secret Sharing encrypted
  shares: string[];       // Secret shares for recovery
  timestamp: number;
}

// Wallet connection persistence
interface WalletConnectionState {
  connectedWallets: {
    [walletId: string]: {
      isConnected: boolean;
      connectionData: any;
      lastConnected: number;
    };
  };
}
```

## Error Handling

### Error Categories

1. **Authentication Errors**
   - Invalid credentials
   - PIN validation failures
   - Session expiration

2. **Wallet Connection Errors**
   - Wallet not available
   - Connection timeout
   - SDK initialization failures

3. **Transaction Errors**
   - Insufficient balance
   - Invalid recipient address
   - Network connectivity issues
   - Transaction broadcast failures

4. **x402 Autopay Errors**
   - Condition evaluation failures
   - Payment execution errors
   - Scheduling service issues

### Error Handling Strategy

```typescript
// Centralized error handling
class ErrorHandler {
  static handle(error: AppError): void {
    switch (error.type) {
      case 'WALLET_CONNECTION':
        // Show user-friendly wallet connection error
        break;
      case 'TRANSACTION_FAILED':
        // Display transaction failure with retry option
        break;
      case 'AUTOPAY_ERROR':
        // Notify user of autopay issue
        break;
      default:
        // Generic error handling
    }
  }
}

// Error boundaries for React components
class ErrorBoundary extends Component {
  // Catch and handle component errors gracefully
}
```

## Testing Strategy

### Testing Approach

1. **Unit Testing**
   - Service layer functions
   - Utility functions
   - State management logic
   - Encryption/decryption functions

2. **Integration Testing**
   - Wallet connection flows
   - Transaction processing
   - x402 autopay execution
   - API integrations

3. **End-to-End Testing**
   - Complete user workflows
   - Cross-browser compatibility
   - Performance testing

### Testing Environment

- **Local Bitcoin Network**: Nigiri for regtest environment
- **Mock APIs**: Local mocked Mempool API for fee estimation
- **Test Wallets**: Simulated wallet connections for testing
- **Faucet Integration**: Custom Nigiri faucet for test Bitcoin generation

### Test Data Management

```typescript
// Test fixtures for consistent testing
const testUsers = {
  validUser: {
    name: 'Test User',
    email: 'test@example.com',
    age: 25,
    pin: '1234'
  }
};

const testWallets = {
  blueWallet: {
    name: 'BlueWallet',
    type: 'mobile',
    logo: '/logos/bluewallet.png'
  }
};
```

## Security Considerations

### Credential Security

1. **IBAN-like Format Conversion**
   - Transform user credentials into structured format
   - Add checksum and validation characters
   - Obfuscate original data structure

2. **Shamir's Secret Sharing**
   - Split encrypted credentials into multiple shares
   - Require threshold of shares for reconstruction
   - Store shares in different locations

3. **Local Encryption**
   - Use strong encryption algorithms (AES-256)
   - Generate unique encryption keys per user
   - Implement secure key derivation

### Transaction Security

1. **Input Validation**
   - Validate all Bitcoin addresses
   - Sanitize user inputs
   - Implement amount limits

2. **Secure Communication**
   - HTTPS for all API communications
   - Certificate pinning for critical endpoints
   - Request signing for sensitive operations

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**
   - Lazy load dashboard sections
   - Dynamic imports for wallet SDKs
   - Route-based code splitting

2. **State Management**
   - Efficient Zustand store structure
   - Selective component re-renders
   - Memoization for expensive calculations

3. **Animation Performance**
   - Hardware-accelerated CSS animations
   - Optimized 3D graphics rendering
   - Smooth 60fps interactions

### Backend Optimization

1. **Database Queries**
   - Indexed queries for transactions
   - Efficient pagination
   - Connection pooling

2. **Caching Strategy**
   - Cache wallet connection states
   - Memoize API responses
   - Local storage for frequently accessed data

## Deployment Architecture

### Development Environment

```
Local Development:
├── CRA Dev Server (localhost:3000)
├── Supabase Local (localhost:54321)
├── Nigiri Bitcoin Network (localhost:18443)
└── Custom Faucet API (localhost:3001)
```

### Production Considerations

1. **Build Optimization**
   - Create React App production builds
   - Asset optimization with webpack
   - Bundle size analysis with webpack-bundle-analyzer

2. **Environment Configuration**
   - Environment-specific configs
   - API endpoint management
   - Feature flags for testing

3. **Cross-Platform Preparation**
   - Shared component library
   - Platform-specific adapters
   - React Native compatibility layer