import React, { useState, useEffect } from 'react';
import Card3D from '../../animations/Card3D';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import LoadingSpinner from '../../ui/LoadingSpinner';
import QRCode from '../../ui/QRCode';
import QRScanner from '../../ui/QRScanner';
import PaymentStatusIndicator from '../../ui/PaymentStatusIndicator';
import { useWalletStore } from '../../../stores/walletStore';
import { useTransactionStore } from '../../../stores/transactionStore';
import { PaymentService } from '../../../services/bitcoin/paymentService';
import { AlbyService, InvoiceService } from '../../../services/lightning';
import { PaymentRequest } from '../../../types/transaction';
import { LightningInvoice, LightningPayment } from '../../../types/lightning';
import { generatePaymentQRData, parseBitcoinURI } from '../../../utils/bitcoin';

interface PaymentStatus {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  txId?: string;
}

type PaymentType = 'bitcoin' | 'lightning';

interface LightningPaymentData {
  invoice?: string;
  amount?: number;
  description?: string;
}

const Pay: React.FC = () => {
  const { connectedWallets, lightningState, connectLightning } = useWalletStore();
  const { createTransaction } = useTransactionStore();
  
  const [paymentType, setPaymentType] = useState<PaymentType>('bitcoin');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'idle' });
  const [balance, setBalance] = useState<{ confirmed: number; unconfirmed: number; total: number } | null>(null);
  const [lightningBalance, setLightningBalance] = useState<number | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [isLoadingFee, setIsLoadingFee] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [lightningInvoice, setLightningInvoice] = useState<string>('');
  const [generatedInvoice, setGeneratedInvoice] = useState<LightningInvoice | null>(null);

  // Set default wallet when connected wallets change
  useEffect(() => {
    if (connectedWallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(connectedWallets[0].id);
    }
  }, [connectedWallets, selectedWalletId]);

  // Load balance when wallet selection changes
  useEffect(() => {
    if (selectedWalletId) {
      loadWalletBalance();
    }
  }, [selectedWalletId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Estimate fee when amount changes
  useEffect(() => {
    if (selectedWalletId && amount && parseFloat(amount) > 0) {
      estimateTransactionFee();
    } else {
      setEstimatedFee(null);
    }
  }, [selectedWalletId, amount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load Lightning balance when connected
  useEffect(() => {
    if (lightningState.isConnected) {
      loadLightningBalance();
    }
  }, [lightningState.isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadWalletBalance = async () => {
    if (!selectedWalletId) return;
    
    setIsLoadingBalance(true);
    try {
      const balanceInfo = await PaymentService.getWalletBalance(selectedWalletId);
      setBalance(balanceInfo);
    } catch (error) {
      console.error('Error loading balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const estimateTransactionFee = async () => {
    if (!selectedWalletId || !amount) return;
    
    setIsLoadingFee(true);
    try {
      const fee = await PaymentService.estimateTransactionFee(parseFloat(amount), selectedWalletId);
      setEstimatedFee(fee);
    } catch (error) {
      console.error('Error estimating fee:', error);
    } finally {
      setIsLoadingFee(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWalletId || !recipientAddress || !amount) {
      setPaymentStatus({
        status: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setPaymentStatus({
        status: 'error',
        message: 'Please enter a valid amount'
      });
      return;
    }

    setPaymentStatus({ status: 'processing', message: 'Processing payment...' });

    try {
      const paymentRequest: PaymentRequest = {
        recipientAddress,
        amount: amountNum,
        description,
        walletId: selectedWalletId,
      };

      const result = await PaymentService.processPayment(paymentRequest);

      if (result.success && result.transaction) {
        // Add transaction to store
        await createTransaction({
          user_id: 'current-user-id', // This should come from auth store
          type: result.transaction.type,
          amount: result.transaction.amount,
          recipient: result.transaction.recipient,
          sender: result.transaction.sender,
          status: result.transaction.status,
          tx_hash: result.transaction.tx_hash,
          payment_type: 'bitcoin',
        });

        setPaymentStatus({
          status: 'success',
          message: 'Payment sent successfully!',
          txId: result.transaction.tx_hash,
        });

        // Clear form
        setRecipientAddress('');
        setAmount('');
        setDescription('');

        // Refresh balance
        loadWalletBalance();
      } else {
        setPaymentStatus({
          status: 'error',
          message: result.error || 'Payment failed'
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Payment failed'
      });
    }
  };

  const handleLightningConnect = async () => {
    setPaymentStatus({ status: 'processing', message: 'Connecting to Lightning Network...' });
    
    try {
      const success = await connectLightning();
      if (success) {
        setPaymentStatus({ status: 'success', message: 'Connected to Lightning Network!' });
        loadLightningBalance();
      } else {
        setPaymentStatus({ 
          status: 'error', 
          message: 'Failed to connect to Lightning Network. Please ensure you have a WebLN-compatible wallet extension installed.' 
        });
      }
    } catch (error) {
      setPaymentStatus({ 
        status: 'error', 
        message: 'Lightning connection failed. Please try again.' 
      });
    }
  };

  const loadLightningBalance = async () => {
    try {
      const balance = await AlbyService.getBalance();
      if (balance) {
        setLightningBalance(balance.spendableBalance);
      }
    } catch (error) {
      console.error('Failed to load Lightning balance:', error);
    }
  };

  const handleLightningPayment = async () => {
    if (!lightningInvoice.trim()) {
      setPaymentStatus({
        status: 'error',
        message: 'Please enter a Lightning invoice'
      });
      return;
    }

    // Validate invoice format
    if (!InvoiceService.validateInvoice(lightningInvoice)) {
      setPaymentStatus({
        status: 'error',
        message: 'Invalid Lightning invoice format'
      });
      return;
    }

    setPaymentStatus({ status: 'processing', message: 'Processing Lightning payment...' });

    try {
      const payment = await AlbyService.payInvoice(lightningInvoice);
      
      if (payment.status === 'succeeded') {
        // Add transaction to store
        await createTransaction({
          user_id: 'current-user-id', // This should come from auth store
          type: 'sent',
          amount: payment.amount / 100000000, // Convert sats to BTC
          recipient: 'Lightning Network',
          sender: lightningState.nodeInfo?.alias || 'Lightning Wallet',
          status: 'completed',
          tx_hash: payment.paymentHash,
          payment_type: 'lightning',
        });

        setPaymentStatus({
          status: 'success',
          message: 'Lightning payment sent successfully!',
          txId: payment.paymentHash,
        });

        // Clear form
        setLightningInvoice('');
        setDescription('');

        // Refresh balance
        loadLightningBalance();
      } else {
        setPaymentStatus({
          status: 'error',
          message: payment.failureReason || 'Lightning payment failed'
        });
      }
    } catch (error) {
      console.error('Lightning payment error:', error);
      setPaymentStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Lightning payment failed'
      });
    }
  };

  const handleCreateInvoice = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setPaymentStatus({
        status: 'error',
        message: 'Please enter a valid amount'
      });
      return;
    }

    const amountSats = Math.floor(parseFloat(amount) * 100000000);
    
    setPaymentStatus({ status: 'processing', message: 'Creating Lightning invoice...' });

    try {
      const invoice = await AlbyService.createInvoice(amountSats, description);
      
      if (invoice) {
        setGeneratedInvoice(invoice);
        setPaymentStatus({
          status: 'success',
          message: 'Lightning invoice created successfully!'
        });
      } else {
        setPaymentStatus({
          status: 'error',
          message: 'Failed to create Lightning invoice'
        });
      }
    } catch (error) {
      console.error('Invoice creation error:', error);
      setPaymentStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create Lightning invoice'
      });
    }
  };

  const formatBTC = (satoshis: number): string => {
    return (satoshis / 100000000).toFixed(8);
  };

  const formatSats = (satoshis: number): string => {
    return satoshis.toLocaleString() + ' sats';
  };

  const selectedWallet = connectedWallets.find(w => w.id === selectedWalletId);

  return (
    <div className="space-y-6">
      {/* Payment Form */}
      <Card3D intensity="medium" className="transform-gpu">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-secondary-900">
              Send Payment
            </h2>
            
            {/* Payment Type Toggle */}
            <div className="flex bg-secondary-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setPaymentType('bitcoin')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  paymentType === 'bitcoin'
                    ? 'bg-white text-secondary-900 shadow-sm'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                Bitcoin
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('lightning')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  paymentType === 'lightning'
                    ? 'bg-white text-secondary-900 shadow-sm'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                Lightning
              </button>
            </div>
          </div>
          
          {paymentType === 'lightning' && !lightningState.isConnected ? (
            <div className="text-center py-8">
              <p className="text-secondary-600 mb-4">Lightning Network not connected</p>
              <p className="text-sm text-secondary-500 mb-4">
                Connect to Lightning Network to send instant, low-fee payments.
              </p>
              <Button
                onClick={handleLightningConnect}
                variant="primary"
                disabled={paymentStatus.status === 'processing'}
              >
                {paymentStatus.status === 'processing' ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" color="text-white" />
                    <span className="ml-2">Connecting...</span>
                  </div>
                ) : (
                  'Connect Lightning Network'
                )}
              </Button>
            </div>
          ) : paymentType === 'bitcoin' && connectedWallets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary-600 mb-4">No wallets connected</p>
              <p className="text-sm text-secondary-500">
                Please connect a wallet from the Home section to send payments.
              </p>
            </div>
          ) : paymentType === 'lightning' ? (
            <div className="space-y-6">
              {/* Lightning Payment Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-secondary-900">Pay Lightning Invoice</h3>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-secondary-700">
                      Lightning Invoice
                    </label>
                    <QRScanner
                      onScan={(invoice) => {
                        setLightningInvoice(invoice);
                        setPaymentStatus({ status: 'idle' });
                      }}
                      onError={(error) => {
                        setPaymentStatus({ status: 'error', message: error });
                      }}
                    />
                  </div>
                  <textarea
                    value={lightningInvoice}
                    onChange={(e) => setLightningInvoice(e.target.value)}
                    placeholder="lnbc1..."
                    className="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleLightningPayment}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={paymentStatus.status === 'processing' || !lightningInvoice.trim()}
                >
                  {paymentStatus.status === 'processing' ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" color="text-white" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : (
                    'Pay Lightning Invoice'
                  )}
                </Button>
              </div>

              {/* Lightning Invoice Creation */}
              <div className="border-t border-secondary-200 pt-6">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">Create Lightning Invoice</h3>
                
                <div className="space-y-4">
                  <Input
                    label="Amount (BTC)"
                    type="number"
                    step="0.00000001"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00100000"
                  />

                  <Input
                    label="Description (Optional)"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Payment for..."
                  />

                  <Button
                    onClick={handleCreateInvoice}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    disabled={paymentStatus.status === 'processing' || !amount}
                  >
                    {paymentStatus.status === 'processing' ? (
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Creating...</span>
                      </div>
                    ) : (
                      'Create Invoice'
                    )}
                  </Button>

                  {generatedInvoice && (
                    <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                      <h4 className="font-medium text-secondary-900 mb-2">Generated Invoice</h4>
                      <div className="space-y-3">
                        <div className="flex justify-center">
                          <QRCode value={generatedInvoice.paymentRequest} size={200} />
                        </div>
                        <div className="text-sm break-all bg-white p-3 rounded border">
                          {generatedInvoice.paymentRequest}
                        </div>
                        <div className="text-sm text-secondary-600">
                          Amount: {formatSats(generatedInvoice.amount)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Wallet Selection */}
              {connectedWallets.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    From Wallet
                  </label>
                  <select
                    value={selectedWalletId}
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                    className="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {connectedWallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} {wallet.balance !== undefined && `(${wallet.balance.toFixed(8)} BTC)`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Recipient Address */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-secondary-700">
                    Recipient Bitcoin Address
                  </label>
                  <div className="flex items-center space-x-2">
                    <QRScanner
                      onScan={(address) => {
                        // Try to parse as Bitcoin URI first
                        const parsedURI = parseBitcoinURI(address);
                        if (parsedURI) {
                          setRecipientAddress(parsedURI.address);
                          if (parsedURI.amount) {
                            setAmount(parsedURI.amount.toString());
                          }
                          if (parsedURI.message) {
                            setDescription(parsedURI.message);
                          }
                        } else {
                          setRecipientAddress(address);
                        }
                        setPaymentStatus({ status: 'idle' }); // Clear any previous status
                      }}
                      onError={(error) => {
                        setPaymentStatus({ status: 'error', message: error });
                      }}
                    />
                    {recipientAddress && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowQRCode(!showQRCode)}
                        className="text-xs"
                      >
                        {showQRCode ? 'Hide QR' : 'Show QR'}
                      </Button>
                    )}
                  </div>
                </div>
                <Input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                  required
                />
                {showQRCode && recipientAddress && (
                  <div className="mt-3 flex flex-col items-center space-y-2">
                    <QRCode 
                      value={generatePaymentQRData({
                        address: recipientAddress,
                        amount: amount ? parseFloat(amount) : undefined,
                        message: description || undefined
                      })} 
                      size={150} 
                    />
                    <p className="text-xs text-secondary-600 text-center">
                      {amount ? `Payment request for ${amount} BTC` : 'Bitcoin address QR code'}
                    </p>
                  </div>
                )}
              </div>

              {/* Amount */}
              <Input
                label="Amount (BTC)"
                type="number"
                step="0.00000001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00100000"
                required
              />

              {/* Fee Estimation */}
              {estimatedFee !== null && (
                <div className="text-sm text-secondary-600">
                  <span>Estimated fee: </span>
                  {isLoadingFee ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <span className="font-medium">{estimatedFee.toFixed(8)} BTC</span>
                  )}
                </div>
              )}

              {/* Description (Optional) */}
              <Input
                label="Description (Optional)"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Payment for..."
              />

              {/* Payment Status */}
              {paymentStatus.status !== 'idle' && (
                <PaymentStatusIndicator
                  status={paymentStatus.status === 'success' ? 'completed' : 
                          paymentStatus.status === 'error' ? 'failed' : 
                          paymentStatus.status}
                  message={paymentStatus.message}
                  txId={paymentStatus.txId}
                />
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={paymentStatus.status === 'processing' || !selectedWalletId}
              >
                {paymentStatus.status === 'processing' ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" color="text-white" />
                    <span className="ml-2">Processing...</span>
                  </div>
                ) : (
                  'Send Payment'
                )}
              </Button>
            </form>
          )}
        </div>
      </Card3D>

      {/* Balance Display */}
      <Card3D intensity="subtle" glowEffect className="transform-gpu">
        <div className="bg-gradient-to-br from-bitcoin-50 to-bitcoin-100 rounded-xl shadow-sm border border-bitcoin-200 p-6 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-bitcoin-900 mb-4">
            Current Balance
          </h2>

          {/* Lightning Balance */}
          {lightningState.isConnected && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-800">Lightning Network</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-yellow-700">Connected</span>
                </div>
              </div>
              
              {lightningState.nodeInfo && (
                <div className="text-xs text-yellow-700 mb-2">
                  Node: {lightningState.nodeInfo.alias}
                </div>
              )}
              
              <div className="text-lg font-bold text-yellow-900">
                {lightningBalance !== null ? formatSats(lightningBalance) : 'Loading...'}
              </div>
            </div>
          )}
          
          {selectedWallet ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-bitcoin-700">Wallet:</span>
                <div className="flex items-center space-x-2">
                  <img 
                    src={selectedWallet.logo} 
                    alt={selectedWallet.name}
                    className="w-5 h-5"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="font-medium text-bitcoin-800">{selectedWallet.name}</span>
                </div>
              </div>
              
              {isLoadingBalance ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="md" color="text-bitcoin-500" />
                </div>
              ) : balance ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-bold text-bitcoin-900">
                      {formatBTC(balance.confirmed)} ₿
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={loadWalletBalance}
                      className="text-bitcoin-700 hover:text-bitcoin-800"
                    >
                      Refresh
                    </Button>
                  </div>
                  
                  {balance.unconfirmed > 0 && (
                    <div className="text-sm text-bitcoin-600">
                      Unconfirmed: {formatBTC(balance.unconfirmed)} ₿
                    </div>
                  )}
                  
                  <div className="text-xs text-bitcoin-500">
                    Total: {formatBTC(balance.total)} ₿
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-bitcoin-600">Unable to load balance</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={loadWalletBalance}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-bitcoin-600">No wallet selected</p>
              <p className="text-sm text-bitcoin-500 mt-1">
                Connect a wallet to view balance
              </p>
            </div>
          )}
        </div>
      </Card3D>
    </div>
  );
};

export default Pay;