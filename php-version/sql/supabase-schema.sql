-- Survey Platform Indonesia - Supabase Database Schema
-- Execute these SQL commands in your Supabase SQL editor

-- Enable UUID extension for better primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    education VARCHAR(50) CHECK (education IN ('smp', 'sma', 'diploma', 'sarjana', 'pascasarjana')),
    occupation VARCHAR(50) CHECK (occupation IN ('student', 'employee', 'entrepreneur', 'freelancer', 'housewife', 'other')),
    income VARCHAR(50) CHECK (income IN ('0-1000000', '1000000-3000000', '3000000-5000000', '5000000-10000000', '10000000+')),
    profile_completeness DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Surveys table (for CPX Research survey tracking)
CREATE TABLE IF NOT EXISTS surveys (
    id SERIAL PRIMARY KEY,
    cpx_survey_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    reward DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User surveys relationship table
CREATE TABLE IF NOT EXISTS user_surveys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    cpx_survey_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed', 'disqualified')),
    reward DECIMAL(10,2),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cpx_survey_id)
);

-- Transactions table for earnings and withdrawals
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('earning', 'withdrawal', 'bonus', 'penalty')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    cpx_transaction_id VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_surveys_user_id ON user_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_surveys_status ON user_surveys(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_cpx_id ON transactions(cpx_transaction_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at 
    BEFORE UPDATE ON surveys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_surveys_updated_at 
    BEFORE UPDATE ON user_surveys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample survey data
INSERT INTO surveys (cpx_survey_id, title, description, reward, duration, category) VALUES
('cpx_survey_1', 'Survei Konsumen Produk Teknologi', 'Berikan pendapat Anda tentang produk teknologi terbaru dan tren yang sedang berkembang', 5000, 15, 'Technology'),
('cpx_survey_2', 'Survei Gaya Hidup dan Belanja', 'Ceritakan kebiasaan belanja dan gaya hidup Anda untuk riset pasar konsumen', 7500, 20, 'Lifestyle'),
('cpx_survey_3', 'Survei Makanan dan Minuman', 'Bagikan preferensi Anda tentang makanan dan minuman untuk pengembangan produk baru', 6000, 12, 'Food & Beverage'),
('cpx_survey_4', 'Survei Media dan Hiburan', 'Pendapat Anda tentang platform streaming, musik, dan hiburan digital lainnya', 8000, 25, 'Entertainment'),
('cpx_survey_5', 'Survei Kesehatan dan Kebugaran', 'Rutinitas kesehatan dan pandangan Anda tentang produk-produk wellness', 5500, 18, 'Health')
ON CONFLICT (cpx_survey_id) DO NOTHING;

-- Create a view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    COALESCE(SUM(CASE WHEN t.type = 'earning' THEN t.amount ELSE 0 END), 0) as total_earnings,
    COUNT(CASE WHEN us.status = 'completed' THEN 1 END) as completed_surveys,
    COUNT(CASE WHEN us.status IN ('started', 'completed') THEN 1 END) as started_surveys,
    CASE 
        WHEN COUNT(CASE WHEN us.status IN ('started', 'completed') THEN 1 END) > 0 
        THEN ROUND((COUNT(CASE WHEN us.status = 'completed' THEN 1 END)::decimal / COUNT(CASE WHEN us.status IN ('started', 'completed') THEN 1 END)::decimal) * 100, 1)
        ELSE 0 
    END as completion_rate,
    u.profile_completeness
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
LEFT JOIN user_surveys us ON u.id = us.user_id
GROUP BY u.id, u.name, u.email, u.profile_completeness;