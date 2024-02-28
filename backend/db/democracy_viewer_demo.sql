-- CREATE DATABASE democracy_viewer_demo;

CREATE TABLE users (
    username VARCHAR(20) PRIMARY KEY,
    password VARCHAR(60) NOT NULL,
    email VARCHAR(30),
    title VARCHAR(20),
    first_name VARCHAR(20),
    last_name VARCHAR(20),
    suffix VARCHAR(10),
    orcid VARCHAR(16),
    linkedin_link VARCHAR(50),
    website VARCHAR(50)
);

CREATE TABLE private_groups (
    id BIGINT PRIMARY KEY IDENTITY,
    name VARCHAR(50),
    description NVARCHAR(255)
);

CREATE TABLE dataset_metadata (
    table_name VARCHAR(250) PRIMARY KEY,
    username VARCHAR(20),
    private_group BIGINT,
    title VARCHAR(50),
    description VARCHAR(200),
    is_public BIT DEFAULT false,
    clicks INT DEFAULT 0,
    record_count BIGINT DEFAULT 0,
    date_posted DATE,
    FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY(private_group) REFERENCES private_groups(id) ON DELETE CASCADE
);

CREATE TABLE group_invites (
    private_group BIGINT,
    username VARCHAR(20),
    PRIMARY KEY(private_group, username),
    FOREIGN KEY(private_group) REFERENCES private_groups(id) ON DELETE CASCADE,
    FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE group_members (
    private_group BIGINT,
    member VARCHAR(20),
    member_rank INT,
    PRIMARY KEY(private_group, member),
    FOREIGN KEY(private_group) REFERENCES private_groups(id) ON DELETE CASCADE,
    FOREIGN KEY(member) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE tags (
    tag_name VARCHAR(15),
    table_name VARCHAR(250),
    PRIMARY KEY(tag_name, table_name),
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE
);

CREATE TABLE dataset_download (
    id BIGINT PRIMARY KEY IDENTITY,
    username VARCHAR(20),
    table_name VARCHAR(250),
    timestamp DATETIME,
    current_page INTEGER,
    total_pages INTEGER,
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE,
    FOREIGN KEY(username) REFERENCES users(username),
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

CREATE TABLE database_connections (
    id BIGINT PRIMARY KEY IDENTITY,
    name VARCHAR(50) NOT NULL,
    owner VARCHAR(20) NOT NULL,
    host VARCHAR(288) NOT NULL,
    port VARCHAR(288),
    db VARCHAR(288) NOT NULL,
    username VARCHAR(288) NOT NULL,
    password VARCHAR(288),
    client VARCHAR(10) NOT NULL,
    FOREIGN KEY(owner) REFERENCES users(username) ON DELETE CASCADE
);

-- Additional tables will be dynamically generated for uploaded datasets