-- Create Database
CREATE DATABASE email_autoresponder;
USE email_autoresponder;

-- Table: users
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: emails
CREATE TABLE emails (
    email_id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sentiment ENUM('positive', 'neutral', 'negative') DEFAULT 'neutral',
    needs_escalation BOOLEAN DEFAULT FALSE
);

-- Table: email_responses
CREATE TABLE email_responses (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    email_id INT NOT NULL,
    content TEXT NOT NULL,
    response_type ENUM('automated', 'manual') DEFAULT 'automated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email_id) REFERENCES emails(email_id) ON DELETE CASCADE
);

-- Table: knowledge_base
CREATE TABLE knowledge_base (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: analytics
CREATE TABLE analytics (
    analytics_id INT AUTO_INCREMENT PRIMARY KEY,
    total_emails INT NOT NULL,
    average_response_time INT NOT NULL,
    automated_responses INT NOT NULL,
    escalated_emails INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimization
CREATE INDEX idx_sender_email ON emails (sender_email);
CREATE INDEX idx_received_at ON emails (received_at);
CREATE INDEX idx_uploaded_at ON knowledge_base (uploaded_at);
