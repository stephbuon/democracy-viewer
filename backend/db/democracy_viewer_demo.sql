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
    linkedin_link VARCHAR(50)
);

CREATE TABLE private_groups (
    id BIGINT PRIMARY KEY IDENTITY,
    name VARCHAR(50)
);

CREATE TABLE dataset_metadata (
    table_name VARCHAR(50) PRIMARY KEY,
    username VARCHAR(20),
    private_group BIGINT,
    title VARCHAR(20),
    description VARCHAR(200),
    is_public BIT,
    clicks INT DEFAULT 0,
    FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY(private_group) REFERENCES private_groups(id) ON DELETE CASCADE
);

CREATE TABLE group_members (
    id BIGINT PRIMARY KEY IDENTITY,
    private_group BIGINT,
    member VARCHAR(20),
    member_rank INT,
    FOREIGN KEY(private_group) REFERENCES private_groups(id) ON DELETE CASCADE,
    FOREIGN KEY(member) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE tags (
    tag_name VARCHAR(15),
    table_name VARCHAR(50),
    PRIMARY KEY(tag_name, table_name),
    FOREIGN KEY(table_name) REFERENCES dataset_metadata(table_name) ON DELETE CASCADE
);

-- Additional tables will be dynamically generated for uploaded datasets