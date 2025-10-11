const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Nigiri Bitcoin testing environment...');

// Check if Docker is running
try {
  execSync('docker --version', { stdio: 'ignore' });
  console.log('✅ Docker is available');
} catch (error) {
  console.error('❌ Docker is not available. Please install Docker first.');
  process.exit(1);
}

// Check if docker-compose is available
try {
  execSync('docker-compose --version', { stdio: 'ignore' });
  console.log('✅ Docker Compose is available');
} catch (error) {
  console.error('❌ Docker Compose is not available. Please install Docker Compose first.');
  process.exit(1);
}

// Create faucet-api directory if it doesn't exist
const faucetApiDir = path.join(__dirname, '../faucet-api');
if (!fs.existsSync(faucetApiDir)) {
  console.log('📁 Creating faucet-api directory...');
  fs.mkdirSync(faucetApiDir, { recursive: true });
}

// Install faucet API dependencies
console.log('📦 Installing faucet API dependencies...');
try {
  execSync('npm install', { 
    cwd: faucetApiDir, 
    stdio: 'inherit' 
  });
  console.log('✅ Faucet API dependencies installed');
} catch (error) {
  console.error('❌ Failed to install faucet API dependencies');
  process.exit(1);
}

// Start the Bitcoin services
console.log('🐳 Starting Bitcoin and Lightning Network services...');
try {
  execSync('docker-compose up -d bitcoin electrs lnd faucet-api', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('✅ Bitcoin services started');
} catch (error) {
  console.error('❌ Failed to start Bitcoin services');
  process.exit(1);
}

// Wait for services to be ready
console.log('⏳ Waiting for services to be ready...');
setTimeout(() => {
  console.log('🎉 Nigiri setup complete!');
  console.log('');
  console.log('📋 Service URLs:');
  console.log('  - Bitcoin RPC: http://localhost:18443 (user: admin, pass: 123)');
  console.log('  - Electrs: http://localhost:60401');
  console.log('  - LND gRPC: localhost:10009');
  console.log('  - LND REST: http://localhost:8080');
  console.log('  - Faucet API: http://localhost:3001');
  console.log('');
  console.log('🔧 Useful commands:');
  console.log('  - npm run nigiri:logs    # View logs');
  console.log('  - npm run nigiri:stop    # Stop services');
  console.log('  - npm run nigiri:start   # Start services');
  console.log('');
  console.log('💰 Test the faucet:');
  console.log('  curl http://localhost:3001/api/faucet/info');
}, 10000);