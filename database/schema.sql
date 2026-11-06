
-- SQLAlchemy models.py に合わせたスキーマ
-- MySQL 8.4

-- ========================================
-- 1. 状態マスター
-- ========================================
CREATE TABLE status_types (
    status_type_id INT AUTO_INCREMENT PRIMARY KEY,
    status_code VARCHAR(50) NOT NULL UNIQUE,
    status_name VARCHAR(100) NOT NULL,
    counts_as_present BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ========================================
-- 2. ユーザー情報
-- ========================================
CREATE TABLE usertable (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    card_id VARCHAR(100) NOT NULL UNIQUE,
    grade VARCHAR(30) NOT NULL,

    current_status_type_id INT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    is_active BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_user_status
        FOREIGN KEY (current_status_type_id)
        REFERENCES status_types(status_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ========================================
-- 3. カード読み取り履歴
-- ========================================
CREATE TABLE scan_logs (
    scan_log_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    scanned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    scan_value VARCHAR(255),
    device_id VARCHAR(100),
    result_code VARCHAR(30) NOT NULL,
    request_key VARCHAR(100) UNIQUE,

    CONSTRAINT fk_scan_user
        FOREIGN KEY (user_id)
        REFERENCES usertable(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ========================================
-- 4. 状態変更履歴
-- ========================================
CREATE TABLE statuslogs (
    status_log_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    status_type_id INT NOT NULL,

    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    scan_log_id INT,
    changed_by_user_id INT,
    change_reason VARCHAR(255),

    CONSTRAINT fk_statuslog_user
        FOREIGN KEY (user_id)
        REFERENCES usertable(user_id),

    CONSTRAINT fk_statuslog_status
        FOREIGN KEY (status_type_id)
        REFERENCES status_types(status_type_id),

    CONSTRAINT fk_statuslog_scan
        FOREIGN KEY (scan_log_id)
        REFERENCES scan_logs(scan_log_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
