-- BeyChoc Database Structure

DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    weight INT,
    description TEXT,
    image_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO products (product_code, name, category, weight, description, image_path) VALUES
('CHOC001', 'Premium Dark Chocolate Bar', 'dark', 100, 'Rich 70% dark chocolate with smooth texture and intense cocoa flavor.', 'uploads/choc001.jpg'),
('CHOC002', 'White Chocolate Truffles', 'white', 150, 'Luxurious white chocolate truffles with vanilla bean notes.', 'uploads/choc002.jpg'),
('CHOC003', 'Milk Chocolate Assortment', 'milk', 200, 'Assorted milk chocolate pieces with various fillings.', 'uploads/choc003.jpg'),
('CHOC004', 'Artisan Chocolate Box', 'packages', 300, 'Premium selection of handcrafted chocolates in elegant packaging.', 'uploads/choc004.jpg');