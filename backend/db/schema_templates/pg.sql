-- CREATE DATABASE your_database_name;

CREATE TABLE dataset_metadata (
    table_name VARCHAR(250) PRIMARY KEY NOT NULL,
    username VARCHAR(20) NOT NULL,
    title VARCHAR(50),
    description VARCHAR(200),
    author VARCHAR(50),
    date_collected DATE,
    is_public BOOLEAN DEFAULT 0 NOT NULL,
    clicks INT DEFAULT 0 NOT NULL,
    record_count BIGINT DEFAULT 0 NOT NULL,
    preprocessing_type VARCHAR(5) DEFAULT 'none' NOT NULL,
    date_posted DATE NOT NULL
);

CREATE TABLE tags (
    tag_name VARCHAR(15) NOT NULL,
    table_name VARCHAR(250) NOT NULL,
    PRIMARY KEY(tag_name, table_name),
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE
);

CREATE TABLE dataset_download (
    id SERIAL PRIMARY KEY NOT NULL,
    table_name VARCHAR(250) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    current_page INTEGER NOT NULL,
    total_pages INTEGER NOT NULL,
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE
);

CREATE TABLE dataset_text_cols (
    table_name VARCHAR(250) NOT NULL,
    col VARCHAR(100) NOT NULL,
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE,
    PRIMARY KEY(table_name, col)
);

CREATE TABLE dataset_split_text (
    table_name VARCHAR(250) NOT NULL,
    record_id BIGINT NOT NULL,
    word VARCHAR(100) NOT NULL,
    count BIGINT NOT NULL,
    col VARCHAR(100) NOT NULL,
    FOREIGN KEY(table_name, col) REFERENCES dataset_text_cols(table_name, col) ON DELETE CASCADE,
    PRIMARY KEY(table_name, record_id, word, col)
);