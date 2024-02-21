-- CREATE DATABASE your_database_name;

CREATE TABLE dataset_metadata (
    table_name VARCHAR(250) PRIMARY KEY,
    username VARCHAR(20),
    title VARCHAR(50),
    description VARCHAR(200),
    is_public BOOLEAN DEFAULT false,
    clicks INT DEFAULT 0,
    record_count BIGINT DEFAULT 0,
    date_posted DATE
);

CREATE TABLE tags (
    tag_name VARCHAR(15),
    table_name VARCHAR(250),
    PRIMARY KEY(tag_name, table_name),
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE
);

CREATE TABLE dataset_download (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(250),
    timestamp TIMESTAMP,
    current_page INTEGER,
    total_pages INTEGER,
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE
);

CREATE TABLE dataset_text_cols (
    table_name VARCHAR(250),
    col VARCHAR(100),
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE,
    PRIMARY KEY(table_name, col)
);

CREATE TABLE dataset_split_text (
    table_name VARCHAR(250),
    record_id BIGINT,
    word VARCHAR(100),
    count BIGINT,
    col VARCHAR(100),
    FOREIGN KEY(table_name, col) REFERENCES dataset_text_cols(table_name, col) ON DELETE CASCADE,
    PRIMARY KEY(table_name, record_id, word, col)
);