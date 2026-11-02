
-- 状態マスター初期データ

INSERT INTO status_types (
    status_code,
    status_name,
    counts_as_present,
    sort_order,
    is_active
)
VALUES
    ('OUT', '退室', FALSE, 0, TRUE),
    ('IN', '入室', TRUE, 1, TRUE),
    ('AWAY', '一時退室', FALSE, 2, TRUE);
