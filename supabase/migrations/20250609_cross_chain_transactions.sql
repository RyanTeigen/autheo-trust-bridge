
-- Create cross_chain_transactions table
CREATE TABLE IF NOT EXISTS cross_chain_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    from_network TEXT NOT NULL,
    to_network TEXT NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    amount TEXT NOT NULL,
    theo_amount TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'bridging', 'completed', 'failed')),
    tx_hash TEXT,
    bridge_tx_hash TEXT,
    estimated_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE cross_chain_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
CREATE POLICY "Users can view own cross_chain_transactions" ON cross_chain_transactions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        from_address = (SELECT wallet_address FROM profiles WHERE id = auth.uid()) OR
        to_address = (SELECT wallet_address FROM profiles WHERE id = auth.uid())
    );

-- Policy: Users can insert their own transactions
CREATE POLICY "Users can insert own cross_chain_transactions" ON cross_chain_transactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        from_address = (SELECT wallet_address FROM profiles WHERE id = auth.uid())
    );

-- Policy: Users can update their own transactions
CREATE POLICY "Users can update own cross_chain_transactions" ON cross_chain_transactions
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        from_address = (SELECT wallet_address FROM profiles WHERE id = auth.uid())
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cross_chain_transactions_user_id ON cross_chain_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cross_chain_transactions_status ON cross_chain_transactions(status);
CREATE INDEX IF NOT EXISTS idx_cross_chain_transactions_from_address ON cross_chain_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_cross_chain_transactions_to_address ON cross_chain_transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_cross_chain_transactions_created_at ON cross_chain_transactions(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_cross_chain_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cross_chain_transactions_updated_at
    BEFORE UPDATE ON cross_chain_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_cross_chain_transactions_updated_at();
