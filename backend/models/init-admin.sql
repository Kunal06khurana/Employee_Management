-- The password here is 'admin123' - hashed with bcrypt
INSERT INTO Admin (Username, Password, Email) VALUES
('admin', '$2a$10$rQHmfEIZ0jYvJGFO7V3w2OQYs0m3YOARrwHXP1hYB0J9TyXhHQOeC', 'admin@company.com')
ON DUPLICATE KEY UPDATE
Username = VALUES(Username),
Password = VALUES(Password),
Email = VALUES(Email); 