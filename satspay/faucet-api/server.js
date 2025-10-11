const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bitcoin = require('bitcoinjs-lib');

const app = express();
const PORT = process.env.PORT || 3001;

// Bitcoin RPC configuration
const BITCOIN_RPC = {
  host: process.env.BITCOIN_HOST || 'localhost',
  port: process.env.BITCOIN_PORT || 18443,
  user: process.env.BITCOIN_USER || 'admin',
  password: process.env.BITCOIN_PASSWORD || '123'
};

// Middleware
app.use(cors());
app.use(express.json());

// Bitcoin RPC helper
async function bitcoinRPC(method, params = []) {
  try {
    const response = await axios.post(`http://${BITCOIN_RPC.host}:${BITCOIN_RPC.port}`, {
      jsonrpc: '1.0',
      id: 'faucet',
      method: method,
      params: params
    }, {
      auth: {
        username: BITCOIN_RPC.user,
        password: BITCOIN_RPC.password
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.result;
  } catch (error) {
    console.error('Bitcoin RPC Error:', error.response?.data || error.message);
    throw new Error(`Bitcoin RPC failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

// Generate blocks to ensure we have coins to distribute
async function ensureCoins() {
  try {
    const balance = await bitcoinRPC('getbalance');
    console.log('Current balance:', balance);
    
    if (balance < 1) {
      console.log('Generating blocks to create coins...');
      // Generate blocks to a new address
      const address = await bitcoinRPC('getnewaddress');
      await bitcoinRPC('generatetoaddress', [101, address]);
      console.log('Generated 101 blocks');
    }
  } catch (error) {
    console.error('Error ensuring coins:', error.message);
  }
}

// Faucet endpoints
app.get('/api/faucet/info', async (req, res) => {
  try {
    const balance = await bitcoinRPC('getbalance');
    const blockCount = await bitcoinRPC('getblockcount');
    
    res.json({
      success: true,
      data: {
        balance: balance,
        blockCount: blockCount,
        network: 'regtest',
        availableAmounts: [0.02, 0.035, 0.05, 0.1]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/faucet/send', async (req, res) => {
  try {
    const { address, amount } = req.body;
    
    if (!address || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Address and amount are required'
      });
    }

    // Validate amount is one of the allowed amounts
    const allowedAmounts = [0.02, 0.035, 0.05, 0.1];
    if (!allowedAmounts.includes(parseFloat(amount))) {
      return res.status(400).json({
        success: false,
        error: `Amount must be one of: ${allowedAmounts.join(', ')}`
      });
    }

    // Validate Bitcoin address format
    try {
      bitcoin.address.toOutputScript(address, bitcoin.networks.regtest);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Bitcoin address'
      });
    }

    // Send Bitcoin
    const txid = await bitcoinRPC('sendtoaddress', [address, parseFloat(amount)]);
    
    // Generate a block to confirm the transaction
    const newAddress = await bitcoinRPC('getnewaddress');
    await bitcoinRPC('generatetoaddress', [1, newAddress]);
    
    res.json({
      success: true,
      data: {
        txid: txid,
        amount: parseFloat(amount),
        address: address,
        confirmed: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/faucet/generate-address', async (req, res) => {
  try {
    const address = await bitcoinRPC('getnewaddress');
    
    res.json({
      success: true,
      data: {
        address: address
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Bitcoin Faucet API running on port ${PORT}`);
  console.log('Ensuring we have coins for the faucet...');
  await ensureCoins();
  console.log('Faucet ready!');
});