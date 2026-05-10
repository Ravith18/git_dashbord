CREATE DATABASE IF NOT EXISTS tsb_journal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tsb_journal;

CREATE TABLE IF NOT EXISTS trades (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  trade_date DATE NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  side ENUM('LONG','SHORT') NOT NULL,
  entry_price DECIMAL(12,4) NULL,
  exit_price DECIMAL(12,4) NULL,
  pnl DECIMAL(12,2) NULL,
  rr DECIMAL(8,2) NULL,
  session_name VARCHAR(60) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_trade_date (trade_date),
  INDEX idx_symbol (symbol)
);

INSERT INTO trades (trade_date, symbol, side, entry_price, exit_price, pnl, rr, session_name, notes)
VALUES
  (CURDATE(), 'XAUUSD', 'LONG', 2350.2500, 2355.1000, 48.50, 2.10, 'NY Open', 'Sample seed row'),
  (DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'XAUUSD', 'SHORT', 2360.0000, 2356.2000, 38.00, 1.85, 'London', 'Break and retest setup'),
  (DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'XAUUSD', 'LONG', 2348.4000, 2353.9000, 55.00, 2.30, 'NY Open', 'Sweep then CHoCH long'),
  (DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'XAUUSD', 'SHORT', 2359.7500, 2361.1000, -13.50, 0.70, 'Asia', 'Early entry, low conviction'),
  (DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'XAUUSD', 'LONG', 2345.1000, 2350.5000, 54.00, 2.00, 'NY-London Overlap', 'OB + FVG confluence');
