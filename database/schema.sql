
-- MySQL 8.0.16以降を想定
-- 事前に対象データベースを選択しておくこと

-- ========================================
-- 1. メンバー情報
-- ========================================
CREATE TABLE usertable (
    member_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_code VARCHAR(16) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    card_id VARCHAR(32) NOT NULL UNIQUE,
    role VARCHAR(10) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT chk_member_role
        CHECK (role IN ('student', 'teacher'))
) ENGINE=InnoDB;


-- ========================================
-- 2. 状態マスター
-- ========================================
CREATE TABLE status_types (
    status_id TINYINT UNSIGNED PRIMARY KEY,
    status_name VARCHAR(20) NOT NULL UNIQUE,
    is_present BOOLEAN NOT NULL
) ENGINE=InnoDB;


-- ========================================
-- 3. ICカード操作ログ
-- ========================================
CREATE TABLE scan_logs (
    scan_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_id INT UNSIGNED NOT NULL,
    requested_status_id TINYINT UNSIGNED NOT NULL,
    result VARCHAR(20) NOT NULL,
    scanned_at DATETIME(3) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT fk_scan_member
        FOREIGN KEY (member_id)
        REFERENCES usertable(member_id),

    CONSTRAINT fk_scan_status
        FOREIGN KEY (requested_status_id)
        REFERENCES status_types(status_id),

    CONSTRAINT chk_scan_result
        CHECK (result IN (
            'success',
            'no_change',
            'duplicate',
            'error'
        ))
) ENGINE=InnoDB;


-- ========================================
-- 4. 状態変更・訂正ログ
-- ========================================
CREATE TABLE status_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    member_id INT UNSIGNED NOT NULL,
    status_id TINYINT UNSIGNED NOT NULL,

    recorded_at DATETIME(3) NOT NULL,
    created_at DATETIME(3) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(3),

    is_valid BOOLEAN NOT NULL DEFAULT TRUE,
    source VARCHAR(10) NOT NULL,

    scan_log_id BIGINT UNSIGNED UNIQUE,
    created_by INT UNSIGNED,

    remarks TEXT,
    reason TEXT,

    invalidated_at DATETIME(3),
    invalidated_by INT UNSIGNED,
    invalidation_reason TEXT,

    CONSTRAINT fk_status_member
        FOREIGN KEY (member_id)
        REFERENCES usertable(member_id),

    CONSTRAINT fk_status_type
        FOREIGN KEY (status_id)
        REFERENCES status_types(status_id),

    CONSTRAINT fk_status_scan
        FOREIGN KEY (scan_log_id)
        REFERENCES scan_logs(scan_id),

    CONSTRAINT fk_status_creator
        FOREIGN KEY (created_by)
        REFERENCES usertable(member_id),

    CONSTRAINT fk_status_invalidator
        FOREIGN KEY (invalidated_by)
        REFERENCES usertable(member_id),

    CONSTRAINT chk_status_source
        CHECK (source IN ('card', 'manual')),

    CONSTRAINT chk_status_valid
        CHECK (
            (
                is_valid = TRUE
                AND invalidated_at IS NULL
                AND invalidated_by IS NULL
                AND invalidation_reason IS NULL
            )
            OR
            (
                is_valid = FALSE
                AND invalidated_at IS NOT NULL
                AND invalidated_by IS NOT NULL
                AND invalidation_reason IS NOT NULL
            )
        ),

    CONSTRAINT chk_status_origin
        CHECK (
            (
                source = 'card'
                AND scan_log_id IS NOT NULL
                AND created_by IS NULL
            )
            OR
            (
                source = 'manual'
                AND scan_log_id IS NULL
                AND created_by IS NOT NULL
            )
        ),

    INDEX idx_status_member_valid_time (
        member_id,
        is_valid,
        recorded_at
    )
) ENGINE=InnoDB;
