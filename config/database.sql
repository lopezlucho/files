-- Database: files_db
CREATE DATABASE IF NOT EXISTS files_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE files_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(64) NOT NULL UNIQUE,
    source ENUM('local', 'usb') NOT NULL DEFAULT 'local',
    path VARCHAR(1000) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    is_folder TINYINT(1) NOT NULL DEFAULT 0,
    password VARCHAR(255) NULL,
    expires_at DATETIME NULL,
    downloads INT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT NULL,
    ip VARCHAR(45) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX (user_id),
    INDEX (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin if not exists (username: admin, password: arcadia)
INSERT IGNORE INTO users (id, username, password, name, role) 
VALUES (1, 'admin', '$2y$10$E0LZAlarCw3VFLu8gOWCw.dAuyT5aj.tMtkkIMlWT1Sbkq4Csyo12', 'Administrador', 'admin');
