-- CREATE DATABASE democracy_viewer_demo;

CREATE TABLE users (
    username VARCHAR(20) PRIMARY KEY,
    password VARCHAR(60),
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
    processed BIT DEFAULT false,
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

CREATE TABLE dataset_split_text (
    table_name VARCHAR(250),
    record_id BIGINT,
    word VARCHAR(100),
    count BIGINT,
    col VARCHAR(100),
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE,
    PRIMARY KEY(table_name, record_id, word, col)
);

CREATE TABLE dataset_word_embeddings (
    table_name VARCHAR(250),
    word VARCHAR(100),
    X1 FLOAT,
    X2 FLOAT,
    X3 FLOAT,
    X4 FLOAT,
    PRIMARY KEY(table_name, word),
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE
);

-- Additional tables will be dynamically generated for uploaded datasets