DROP TABLE IF EXISTS `____CMDB_TABLE_NAME____`;
DROP TABLE IF EXISTS `____CMDB_TABLE_NAME_JNL____`;

-- ----テーブル作成
CREATE TABLE `____CMDB_TABLE_NAME____`
(
    ROW_ID                  VARCHAR(40),
    DATA_JSON               LONGTEXT,
    NOTE                    TEXT,
    DISUSE_FLAG             VARCHAR(1),
    LAST_UPDATE_TIMESTAMP   DATETIME(6),
    LAST_UPDATE_USER        VARCHAR(40),
    PRIMARY KEY(ROW_ID)
)ENGINE = InnoDB, CHARSET = utf8mb4, COLLATE = utf8mb4_bin, ROW_FORMAT=COMPRESSED ,KEY_BLOCK_SIZE=8;

-- ----履歴テーブル作成
CREATE TABLE `____CMDB_TABLE_NAME_JNL____`
(
    JOURNAL_SEQ_NO          VARCHAR(40),
    JOURNAL_REG_DATETIME    DATETIME(6),
    JOURNAL_ACTION_CLASS    VARCHAR(8),
    ROW_ID                  VARCHAR(40),
    DATA_JSON               LONGTEXT,
    NOTE                    TEXT,
    DISUSE_FLAG             VARCHAR(1),
    LAST_UPDATE_TIMESTAMP   DATETIME(6),
    LAST_UPDATE_USER        VARCHAR(40),
    PRIMARY KEY(JOURNAL_SEQ_NO)
)ENGINE = InnoDB, CHARSET = utf8mb4, COLLATE = utf8mb4_bin, ROW_FORMAT=COMPRESSED ,KEY_BLOCK_SIZE=8;

-- ----INDEX
CREATE INDEX `IND_____CMDB_TABLE_NAME____` ON `____CMDB_TABLE_NAME____` (DISUSE_FLAG)
