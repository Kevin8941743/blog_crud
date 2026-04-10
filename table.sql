CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY, 
    title TEXT,
    content TEXT,
    category TEXT,
    tags TEXT[]
);

