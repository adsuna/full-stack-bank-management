CREATE TABLE IF NOT EXISTS users (
  phone_number VARCHAR(15) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_phone VARCHAR(15) NOT NULL,
  account_type VARCHAR(50) NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_phone) REFERENCES users(phone_number) ON DELETE CASCADE,
  UNIQUE (user_phone, account_type)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_phone VARCHAR(15) NOT NULL,
  from_account_id INT NULL,
  to_account_id INT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type ENUM('deposit', 'withdrawal', 'transfer', 'bill_payment') NOT NULL,
  description TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_phone) REFERENCES users(phone_number) ON DELETE CASCADE,
  FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
  FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE TABLE loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_phone VARCHAR(15) NOT NULL,
  loan_type ENUM('home', 'car', 'personal') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  term_months INT NOT NULL,
  next_due_date DATE NULL,
  status ENUM('pending', 'approved', 'rejected', 'active', 'closed') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_phone) REFERENCES users(phone_number) ON DELETE CASCADE
);

CREATE TABLE investments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_phone VARCHAR(15) NOT NULL,
  investment_type ENUM('fd', 'mutual_fund', 'stock') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NULL,
  term_months INT NULL,
  status ENUM('active', 'matured', 'withdrawn') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_phone) REFERENCES users(phone_number) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_user_accounts ON accounts(user_phone);
CREATE INDEX idx_user_transactions ON transactions(user_phone);
CREATE INDEX idx_transaction_date ON transactions(date);
