-- CREATE DATABASE democracy_viewer;

CREATE TABLE users (
    email VARCHAR(30) PRIMARY KEY,
    password VARCHAR(60) NOT NULL,
    title VARCHAR(20),
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    suffix VARCHAR(10),
    orcid VARCHAR(16),
    linkedin_link VARCHAR(200),
    website VARCHAR(200)
);

CREATE TABLE password_reset_codes (
    email VARCHAR(30) PRIMARY KEY,
    code VARCHAR(60) NOT NULL,
    expires DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY(email) REFERENCES users(email) ON DELETE CASCADE
);

CREATE TABLE distributed_connections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    owner VARCHAR(30) NOT NULL,
    region VARCHAR(288) NOT NULL,
    bucket VARCHAR(288) NOT NULL,
    dir VARCHAR(288) NOT NULL DEFAULT '',
    key_ VARCHAR(288) DEFAULT NULL,
    secret VARCHAR(288) DEFAULT NULL,
    FOREIGN KEY(owner) REFERENCES users(email) ON DELETE CASCADE
);

# CREATE TABLE private_groups (
#     id SERIAL PRIMARY KEY,
#     name VARCHAR(50),
#     description NVARCHAR(255)
# );

CREATE TABLE dataset_metadata (
    table_name VARCHAR(100) PRIMARY KEY NOT NULL,
    email VARCHAR(30) NOT NULL,
--     private_group BIGINT,
    title VARCHAR(100),
    description VARCHAR(500),
    author VARCHAR(200),
    date_collected DATE,
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    clicks INT DEFAULT 0 NOT NULL,
    preprocessing_type VARCHAR(5) DEFAULT 'none' NOT NULL,
    embeddings BOOLEAN DEFAULT FALSE NOT NULL,
    date_posted DATE NOT NULL,
    embed_col VARCHAR(50) DEFAULT NULL,
    language VARCHAR(20) DEFAULT 'English' NOT NULL,
    likes INT DEFAULT 0 NOT NULL,
    embeddings_done BOOLEAN DEFAULT FALSE NOT NULL,
    tokens_done BOOLEAN DEFAULT FALSE NOT NULL,
    distributed BIGINT UNSIGNED DEFAULT NULL,
    unprocessed_updates INT UNSIGNED NOT NULL DEFAULT 0,
    uploaded BOOLEAN DEFAULT FALSE NOT NULL,
    num_records INT UNSIGNED NOT NULL DEFAULT 0,
    license VARCHAR(200),
    reprocess_start BOOLEAN DEFAULT FALSE NOT NULL,
    num_batches INT DEFAULT 1 NOT NULL,
    batches_done INT DEFAULT 0 NOT NULL,
    FOREIGN KEY(email) REFERENCES users(email) ON DELETE CASCADE,
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

CREATE TABLE dataset_temp_cols (
    table_name VARCHAR(100) NOT NULL,
    col VARCHAR(50) NOT NULL,
    PRIMARY KEY(table_name, col)
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

CREATE TABLE dataset_embed_cols (
    table_name VARCHAR(100) NOT NULL,
    col VARCHAR(50) NOT NULL,
    FOREIGN KEY(table_name, col) REFERENCES dataset_all_cols(table_name, col) ON DELETE CASCADE,
    PRIMARY KEY(table_name, col)
);

CREATE TABLE liked_datasets (
    email VARCHAR(30) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    FOREIGN KEY(email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE,
    PRIMARY KEY(email, table_name)
);

CREATE TABLE text_updates (
    id SERIAL PRIMARY KEY,
    post_date DATE NOT NULL,
    email VARCHAR(30) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT UNSIGNED NOT NULL,
    col VARCHAR(50) NOT NULL,
    start INT UNSIGNED NOT NULL,
    end INT UNSIGNED NOT NULL,
    new_text VARCHAR(100) NOT NULL DEFAULT '',
    old_text VARCHAR(100) NOT NULL DEFAULT '',
    FOREIGN KEY(email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE,
    FOREIGN KEY(table_name, col) REFERENCES dataset_all_cols(table_name, col) ON DELETE CASCADE
);

CREATE TABLE graph_metadata (
    id SERIAL PRIMARY KEY,
    email VARCHAR(30) NOT NULL,
    s3_id VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    clicks INT DEFAULT 0 NOT NULL,
    date_posted DATE NOT NULL,
    likes INT DEFAULT 0 NOT NULL,
    FOREIGN KEY(email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE
);

CREATE TABLE liked_graphs (
    email VARCHAR(30) NOT NULL,
    graph_id BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY(email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY(graph_id) REFERENCES graph_metadata(id) ON DELETE CASCADE,
    PRIMARY KEY(email, graph_id)
);