CREATE DATABASE todo;

CREATE TABLE account(
    user_id UUUID DEFAULT uuid_generate_v4(), 
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    PRIMARY KEY(user_id)
);

CREATE TABLE todo(
    todo_id SERIAL,
    user_id UUID ,
    description VARCHAR(255) NOT NULL,
    PRIMARY KEY(todo_id),
    FOREIGN KEY (user_id) REFERENCES account(user_id)
);
