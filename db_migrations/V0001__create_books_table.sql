CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(300) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    year INTEGER,
    description TEXT,
    content TEXT NOT NULL,
    cover_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_title ON books(title);