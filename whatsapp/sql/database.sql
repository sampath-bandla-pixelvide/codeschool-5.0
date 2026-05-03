-- Active: 1775629700980@@127.0.0.1@5432@whatsapp@public
create Table users(
    id serial primary key,
    username varchar(50) unique not null,
    email varchar(255) unique not null,
    phone varchar(15)unique not null,
    password_hash text not null,
    aadhar_last4 char(4),
    aadhar_hash text,
    profile_picture TEXT,
    is_online boolean default false,
    last_seen timestamp,
    created_at timestamp default current_timestamp
);

ALTER TABLE users
DROP COLUMN aadhar_last4,
DROP COLUMN aadhar_hash;

SELECT * from users;
delete from users;

select * from sessions where status=true;

--otps
create TABLE otps(
    id serial PRIMARY KEY,
    phone VARCHAR(15) not null,
    otp_hash TEXT not null,
    purpose varchar(20) not null,  --register/login/forgetpassword
    attempts int default 0,
    is_used BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP default current_timestamp
);
ALTER TABLE otps
ADD COLUMN expires_at TIMESTAMP;
drop table otps;

--sessions
create table sessions(
    id serial primary key,
    user_id int references users(id) on delete cascade,
    token_hash text not null,
    expires_at timestamp,
    created_at timestamp default current_timestamp
);
ALTER TABLE sessions
ADD COLUMN status BOOLEAN DEFAULT true;

--conversations
create table conversations(
    id serial primary key,
    type VARCHAR(10) default 'direct',
    created_by int references users(id),
    created_at timestamp default current_timestamp,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
);

select * from conversations;
ALTER TABLE conversations 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

--participants
create Table conversation_participants(
    id serial PRIMARY KEY,
    conversation_id int REFERENCES conversations(id) on delete CASCADE,
    user_id int references users(id) on delete cascade,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--messages
create Table messages(
    id serial primary KEY,
    conversation_id int REFERENCES conversations(id) on delete cascade,
    sender_id int REFERENCES users(id),
    content TEXT,
    message_type varchar(20) default 'text',
    created_at TIMESTAMP DEFAULT current_timestamp,
    is_deleted boolean default false
);
ALTER TABLE messages
ADD COLUMN file_path TEXT;

ALTER TABLE messages 
ADD COLUMN deleted_for_everyone BOOLEAN DEFAULT false;

ALTER TABLE message_status 
ADD COLUMN deleted BOOLEAN DEFAULT false;

create table message_status(
    id serial PRIMARY key,
    message_id int REFERENCES messages(id) on delete CASCADE,
    user_id int references users(id),
    status VARCHAR(10) default 'sent',  --sent/read
    read_at TIMESTAMP
);

select * from message_status;

select *from messages;
UPDATE messages
SET created_at = created_at - INTERVAL '2 days'
WHERE id = 15;

update messages set content='jj' where id=2;