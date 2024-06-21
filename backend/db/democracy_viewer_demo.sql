-- CREATE DATABASE democracy_viewer;

CREATE TABLE users (
    username VARCHAR(20) PRIMARY KEY NOT NULL,
    password VARCHAR(60) NOT NULL,
    email VARCHAR(30) NOT NULL,
    title VARCHAR(20),
    first_name VARCHAR(20),
    last_name VARCHAR(20),
    suffix VARCHAR(10),
    orcid VARCHAR(16),
    linkedin_link VARCHAR(50),
    website VARCHAR(50)
);

CREATE TABLE distributed_connections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    owner VARCHAR(20) NOT NULL,
    region VARCHAR(288) NOT NULL,
    bucket VARCHAR(288) NOT NULL,
    dir VARCHAR(288) NOT NULL DEFAULT '',
    key_ VARCHAR(288) DEFAULT NULL,
    secret VARCHAR(288) DEFAULT NULL,
    FOREIGN KEY(owner) REFERENCES users(username) ON DELETE CASCADE
);

# CREATE TABLE private_groups (
#     id SERIAL PRIMARY KEY,
#     name VARCHAR(50),
#     description NVARCHAR(255)
# );

CREATE TABLE dataset_metadata (
    table_name VARCHAR(100) PRIMARY KEY NOT NULL,
    username VARCHAR(20) NOT NULL,
--     private_group BIGINT,
    title VARCHAR(50),
    description VARCHAR(200),
    author VARCHAR(50),
    date_collected DATE,
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    clicks INT DEFAULT 0 NOT NULL,
    preprocessing_type VARCHAR(5) DEFAULT 'none' NOT NULL,
    embeddings BOOLEAN DEFAULT FALSE NOT NULL,
    pos BOOLEAN DEFAULT FALSE NOT NULL,
    date_posted DATE NOT NULL,
    embed_col VARCHAR(50) DEFAULT NULL,
    language VARCHAR(20) DEFAULT 'English' NOT NULL,
    likes INT DEFAULT 0 NOT NULL,
    embeddings_done BOOLEAN DEFAULT FALSE NOT NULL,
    pos_done BOOLEAN DEFAULT FALSE NOT NULL,
    tokens_done BOOLEAN DEFAULT FALSE NOT NULL,
    distributed BIGINT UNSIGNED DEFAULT NULL,
    FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY(distributed) REFERENCES distributed_connections(id)
--     FOREIGN KEY(private_group) REFERENCES private_groups(id) ON DELETE CASCADE
);

# CREATE TABLE group_invites (
#     private_group BIGINT,
#     username VARCHAR(20),
#     PRIMARY KEY(private_group, username),
#     FOREIGN KEY(private_group) REFERENCES private_groups(id) ON DELETE CASCADE,
#     FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE
# );

# CREATE TABLE group_members (
#     private_group BIGINT,
#     member VARCHAR(20),
#     member_rank INT,
#     PRIMARY KEY(private_group, member),
#     FOREIGN KEY(private_group) REFERENCES private_groups(id) ON DELETE CASCADE,
#     FOREIGN KEY(member) REFERENCES users(username) ON DELETE CASCADE
# );

CREATE TABLE tags (
    tag_name VARCHAR(25) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    PRIMARY KEY(tag_name, table_name),
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE
);

CREATE TABLE dataset_all_cols (
    table_name VARCHAR(100) NOT NULL,
    col VARCHAR(50) NOT NULL,
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE,
    PRIMARY KEY(table_name, col)
);

CREATE TABLE dataset_text_cols (
    table_name VARCHAR(100) NOT NULL,
    col VARCHAR(50) NOT NULL,
    FOREIGN KEY(table_name, col) REFERENCES dataset_all_cols(table_name, col) ON DELETE CASCADE,
    PRIMARY KEY(table_name, col)
);

CREATE TABLE liked_datasets (
    user VARCHAR(20) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    FOREIGN KEY(user) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE,
    PRIMARY KEY(user, table_name)
);

CREATE TABLE text_updates (
    id SERIAL PRIMARY KEY,
    user VARCHAR(20) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    idx INT UNSIGNED NOT NULL,
    col INT UNSIGNED NOT NULL,
    start INT UNSIGNED NOT NULL,
    end INT UNSIGNED NOT NULL,
    new_text VARCHAR(100),
    FOREIGN KEY(user) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE
);