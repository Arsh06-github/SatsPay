-- Seed data for development and testing

-- Insert test users
INSERT INTO users (id, name, email, age, encrypted_credentials) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Alice Johnson', 'alice@example.com', 28, 'encrypted_test_data_alice'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Bob Smith', 'bob@example.com', 35, 'encrypted_test_data_bob'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Charlie Brown', 'charlie@example.com', 42, 'encrypted_test_data_charlie');

-- Insert test wallets
INSERT INTO wallets (id, user_id, name, type, is_connected, balance, address) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'BlueWallet', 'mobile', true, 0.05000000, 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'),
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Sparrow', 'web', false, 0.00000000, null),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Phoenix', 'mobile', true, 0.12500000, 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Electrum', 'web', true, 0.08750000, 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3');

-- Insert test transactions
INSERT INTO transactions (id, user_id, wallet_id, type, amount, recipient, sender, status, tx_hash) VALUES
  ('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'sent', 0.02000000, 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'completed', 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'),
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'received', 0.02000000, 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'completed', 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'sent', 0.01500000, 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'pending', null),
  ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'received', 0.01500000, 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'pending', null),
  ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'sent', 0.00500000, 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'failed', null);

-- Insert test autopay rules
INSERT INTO autopay_rules (id, user_id, recipient_wallet_id, amount, condition, is_active) VALUES
  ('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 0.01000000, 'daily at 09:00', true),
  ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3', 0.00750000, 'weekly on Monday', false);

-- Insert autopay transaction
INSERT INTO transactions (id, user_id, wallet_id, type, amount, recipient, sender, status, tx_hash, autopay_rule_id) VALUES
  ('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'sent', 0.01000000, 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'autopay', 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567', '880e8400-e29b-41d4-a716-446655440000');