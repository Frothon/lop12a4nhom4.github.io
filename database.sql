CREATE DATABASE IF NOT EXISTS lib_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lib_management;

-- 1. Table: Users (Bạn đọc/Học sinh)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY, -- Student ID (e.g., SV001)
    name VARCHAR(100) NOT NULL,
    class VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL, -- In production, use hashed passwords
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: Books (Sách)
CREATE TABLE IF NOT EXISTS books (
    id VARCHAR(50) PRIMARY KEY, -- Book ID (e.g., BK001)
    name VARCHAR(255) NOT NULL,
    author VARCHAR(100),
    category VARCHAR(100),
    image TEXT,
    description TEXT,
    content LONGTEXT,
    status ENUM('Còn', 'Đang mượn') DEFAULT 'Còn',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: Borrow Records (Lịch sử mượn trả)
CREATE TABLE IF NOT EXISTS borrow_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id VARCHAR(50),
    user_id VARCHAR(50), -- Optional: Link to users table if registered
    borrower_name VARCHAR(100), -- Store name directly for simple guests or redundancy
    borrow_date DATE DEFAULT (CURRENT_DATE),
    return_date DATE NULL,
    status ENUM('Đang mượn', 'Đã trả') DEFAULT 'Đang mượn',
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- SEED DATA (Dữ liệu mẫu)
-- --------------------------------------------------------

-- Insert Users
INSERT INTO users (id, name, class, password) VALUES
('SV001', 'Nguyễn Văn A', '12A1', '123456'),
('SV002', 'Trần Thị B', '11B2', '123456');

-- Insert Books (Based on initialBooks in script.js)
INSERT INTO books (id, name, author, category, image, description, content) VALUES
('BK001', 'HTML & CSS Căn Bản', 'Jon Duckett', 'Tin học', 'https://m.media-amazon.com/images/I/31b4K-hFH-L._SX342_SY445_.jpg', 'Sách nhập môn tuyệt vời về Web Design.', '<p>Nội dung đang cập nhật...</p>'),
('BK002', 'Tuổi Trẻ Đáng Giá Bao Nhiêu', 'Rosie Nguyễn', 'Kỹ năng', 'https://bizweb.dktcdn.net/100/197/269/products/tuoi-tre-dang-gia-bao-nhieu.jpg?v=1522312675973', 'Cuốn sách truyền cảm hứng cho giới trẻ Việt Nam.', '<p>Nội dung đang cập nhật...</p>'),
('BK003', 'Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 'Văn học', 'https://salt.tikicdn.com/cache/w1200/ts/product/2e/b5/35/2eb5357929d9553b3b4f99589a1c6a2b.jpg', 'Tác phẩm văn học thiếu nhi kinh điển của Việt Nam.', '<p>Nội dung đang cập nhật...</p>'),
('BK004', 'Nhà Giả Kim', 'Paulo Coelho', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/n/h/nha-gia-kim-tai-ban-2020.jpg', 'Hành trình đi tìm kho báu của chàng chăn cừu Santiago.', '<p>Nội dung đang cập nhật...</p>'),
('BK005', 'Clean Code', 'Robert C. Martin', 'Tin học', 'https://m.media-amazon.com/images/I/41xShlnTZTL._SX342_SY445_.jpg', 'Kinh thánh cho lập trình viên muốn viết code sạch.', '<p>Nội dung đang cập nhật...</p>'),
('BK006', 'Đắc Nhân Tâm', 'Dale Carnegie', 'Kỹ năng', 'https://upload.wikimedia.org/wikipedia/vi/a/a2/Dac_nhan_tam_bia.jpg', 'Nghệ thuật thu phục lòng người.', '<p>Nội dung đang cập nhật...</p>'),
('BK007', 'Mắt Biếc', 'Nguyễn Nhật Ánh', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/m/a/mat-biec_1.jpg', 'Câu chuyện tình đơn phương buồn của Ngạn.', '<p>Nội dung đang cập nhật...</p>'),
('BK008', 'Harry Potter và Hòn Đá Phù Thủy', 'J.K. Rowling', 'Văn học', 'https://cdn0.fahasa.com/media/catalog/product/8/9/8934974151745.jpg', 'Khởi đầu của cậu bé phù thủy Harry Potter.', '<p>Nội dung đang cập nhật...</p>');

-- Insert Sample Borrow Records
INSERT INTO borrow_records (book_id, user_id, borrower_name, borrow_date, status) VALUES
('BK001', 'SV001', 'Nguyễn Văn A', '2023-10-25', 'Đã trả');
