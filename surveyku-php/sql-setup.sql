-- SurveyKu Database Schema
-- MySQL/MariaDB Setup untuk Web Hosting

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    age INT,
    gender VARCHAR(10),
    education VARCHAR(50),
    occupation VARCHAR(100),
    income VARCHAR(50),
    city VARCHAR(100),
    profile_completeness INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Surveys table
CREATE TABLE IF NOT EXISTS surveys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reward DECIMAL(10,2) NOT NULL,
    duration INT,
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User surveys junction table
CREATE TABLE IF NOT EXISTS user_surveys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    survey_id INT,
    cpx_survey_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'started',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    reward_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    type VARCHAR(20) NOT NULL, -- 'earning', 'withdrawal', 'bonus'
    status VARCHAR(20) DEFAULT 'completed',
    reference_id VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_surveys_user_id ON user_surveys(user_id);
CREATE INDEX idx_user_surveys_cpx_id ON user_surveys(cpx_survey_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Sample data untuk testing
INSERT INTO surveys (title, description, reward, duration, category) VALUES
('Consumer Preferences Survey', 'Share your shopping habits and preferences', 2.50, 15, 'Shopping'),
('Technology Usage Survey', 'Tell us about your technology usage patterns', 3.00, 20, 'Technology'),
('Health & Wellness Survey', 'Help us understand health and wellness trends', 2.75, 12, 'Health'),
('Entertainment Preferences', 'Share your entertainment and media preferences', 2.25, 10, 'Entertainment'),
('Travel & Lifestyle Survey', 'Tell us about your travel and lifestyle choices', 3.50, 25, 'Travel');