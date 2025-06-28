-- SurveyKu Database Schema
-- PostgreSQL Setup untuk Web Hosting

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    age INTEGER,
    gender VARCHAR(10),
    education VARCHAR(50),
    occupation VARCHAR(100),
    income VARCHAR(50),
    city VARCHAR(100),
    profile_completeness INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Surveys table
CREATE TABLE IF NOT EXISTS surveys (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reward DECIMAL(10,2) NOT NULL,
    duration INTEGER,
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User surveys junction table
CREATE TABLE IF NOT EXISTS user_surveys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
    cpx_survey_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'started',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    reward_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    type VARCHAR(20) NOT NULL, -- 'earning', 'withdrawal', 'bonus'
    status VARCHAR(20) DEFAULT 'completed',
    reference_id VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_surveys_user_id ON user_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_surveys_cpx_id ON user_surveys(cpx_survey_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Sample data untuk testing
INSERT INTO surveys (title, description, reward, duration, category) VALUES
('Consumer Preferences Survey', 'Share your shopping habits and preferences', 2.50, 15, 'Shopping'),
('Technology Usage Survey', 'Tell us about your technology usage patterns', 3.00, 20, 'Technology'),
('Health & Wellness Survey', 'Help us understand health and wellness trends', 2.75, 12, 'Health'),
('Entertainment Preferences', 'Share your entertainment and media preferences', 2.25, 10, 'Entertainment'),
('Travel & Lifestyle Survey', 'Tell us about your travel and lifestyle choices', 3.50, 25, 'Travel')
ON CONFLICT DO NOTHING;

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_surveys_updated_at ON surveys;
CREATE TRIGGER update_surveys_updated_at 
    BEFORE UPDATE ON surveys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_surveys_updated_at ON user_surveys;
CREATE TRIGGER update_user_surveys_updated_at 
    BEFORE UPDATE ON user_surveys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();