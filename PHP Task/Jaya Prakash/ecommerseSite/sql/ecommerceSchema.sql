-- Active: 1775629728003@@127.0.0.1@5432@ecommerce@public
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(25) NOT NULL,
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

ALTER TABLE categories ADD COLUMN status BOOLEAN DEFAULT TRUE;

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(30) NOT NULL,
    category_id INT REFERENCES categories (id) ON DELETE CASCADE,
    stock INT NOT NULL DEFAULT 0 check (stock >= 0),
    price NUMERIC(10, 2) NOT NULL check (price > 0),
    product_description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

ALTER TABLE products ADD COLUMN product_image TEXT NOT NULL;

ALTER TABLE products ADD COLUMN status BOOLEAN DEFAULT true;

CREATE TABLE address (
    id SERIAL PRIMARY KEY,
    address TEXT NOT NULL,
    city VARCHAR(30) NOT NULL,
    state VARCHAR(30) NOT NULL,
    country VARCHAR(30) NOT NULL,
    pin_code VARCHAR(6) NOT NULL check (length(pin_code) = 6),
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE customer_address (
    customer_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    address_id INT NOT NULL REFERENCES address (id) ON DELETE CASCADE
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(10) UNIQUE NOT NULL check (length(phone_number) = 10),
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

ALTER TABLE users ADD COLUMN status BOOLEAN DEFAULT true;

ALTER TABLE users ADD COLUMN password TEXT NOT NULL;

ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'customer';

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    ordered_date DATE DEFAULT current_date,
    total_amount NUMERIC(10, 2) NOT NULL,
    order_status VARCHAR(10) DEFAULT 'Pending' check (
        order_status IN (
            'Pending',
            'Shipped',
            'Delivered',
            'Cancelled'
        )
    ),
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

ALTER TABLE orders ADD COLUMN address_id INT REFERENCES address (id);

CREATE TABLE order_details (
    order_id INT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products (id),
    quantity INT DEFAULT 1 check (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL check (unit_price >= 0),
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

ALTER TABLE order_details add COLUMN id SERIAL PRIMARY KEY;

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders (id),
    payment_type VARCHAR(25) DEFAULT 'COD' check (
        payment_type IN (
            'COD',
            'UPI',
            'CC',
            'DC',
            'NEFT'
        )
    ),
    amount NUMERIC(10, 2) NOT NULL check (amount >= 0),
    payment_date TIMESTAMP DEFAULT current_timestamp,
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

ALTER TABLE payments
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (
    payment_status IN (
        'PENDING',
        'SUCCESS',
        'FAILED'
    )
);

CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id),
    token VARCHAR(20) UNIQUE NOT NULL,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '10 days',
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    customer_id INT UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT REFERENCES carts (id) ON DELETE CASCADE,
    product_id INT REFERENCES products (id),
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT current_timestamp,
    updated_at TIMESTAMP DEFAULT current_timestamp
);

--------------------admin insert-------------------------------

INSERT INTO
    users (
        first_name,
        last_name,
        email,
        phone_number,
        password,
        role
    )
VALUES (
        'Admin',
        'admin',
        'admin@gmail.com',
        '0000000000',
        md5('admin@123'),
        'ADMIN'
    );

----------------------------------------------------------------

SELECT * from cart_items;

SELECT * from users;

SELECT concat(first_name, ' ', last_name) as fullname from users;

SELECT concat(first_name, ' ', last_name) as full_name
FROM users u
    INNER JOIN user_tokens ut ON u.id = ut.user_id
WHERE
    expires_at > CURRENT_TIMESTAMP
    AND status = true
    AND token = '941hvlXI6HLuXOY2ZsDF';

SELECT 1 FROM users WHERE id = 2 AND role = 'ADMIN';

SELECT * from orders;

SELECT * from products;

SELECT * FROM carts;

SELECT sum(p.price) * sum(ci.quantity) as total_cart_price
FROM cart_items ci
    INNER JOIN products p ON ci.product_id = p.id
WHERE
    cart_id = 1
GROUP BY
    ci.cart_id;

SELECT
    c.id as cart_id,
    product_id,
    product_name,
    product_image,
    ct.quantity,
    price,
    stock
FROM
    carts c
    INNER JOIN cart_items ct ON c.id = ct.cart_id
    JOIN products p on p.id = ct.product_id
WHERE
    c.customer_id = 1;

SELECT * from categories;

SELECT p.id, p.product_name, p.stock, p.price, p.product_description, p.product_image, c.category_name
FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.id DESC

SELECT
    o.id,
    CONCAT(
        u.first_name,
        ' ',
        u.last_name
    ) AS customer_name,
    concat(
        address,
        ' ',
        city,
        ' ',
        state,
        ' ',
        country,
        ' ',
        pin_code
    ) as full_address,
    o.total_amount,
    o.order_status,
    o.ordered_date
FROM
    orders o
    JOIN users u ON o.customer_id = u.id
    JOIN address a on o.address_id = a.id
ORDER BY o.id DESC;

SELECT * FROM address;

SELECT * FROM payments;

SELECT cart_id, ci.product_id, ci.quantity, p.price
FROM cart_items ci
    INNER JOIN products p on ci.product_id = p.id;

SELECT * FROM order_details;

SELECT p.product_name, p.product_image, od.unit_price, od.quantity, o.ordered_date, o.order_status, o.address_id
FROM
    orders o
    JOIN order_details od ON o.id = od.order_id
    INNER JOIN products p ON od.product_id = p.id
WHERE
    o.customer_id = 1;

-------------------------------------------------------------------------
-- INSERT INTO
--     categories (category_name)
-- VALUES ('Electronics'),
--     ('Clothing'),
--     ('Books'),
--     ('Home'),
--     ('Sports'),
--     ('Toys'),
--     ('Beauty'),
--     ('Groceries'),
--     ('Furniture'),
--     ('Automotive');

-- INSERT INTO
--     customers (
--         first_name,
--         last_name,
--         email,
--         phone_number
--     )
-- VALUES (
--         'Rahul',
--         'Sharma',
--         'rahul.sharma@gmail.com',
--         '9876543210'
--     ),
--     (
--         'Priya',
--         'Reddy',
--         'priya.reddy@gmail.com',
--         '9123456780'
--     ),
--     (
--         'Amit',
--         'Kumar',
--         'amit.kumar@gmail.com',
--         '9988776655'
--     ),
--     (
--         'Sneha',
--         'Patel',
--         'sneha.patel@gmail.com',
--         '9090909090'
--     ),
--     (
--         'Vikram',
--         'Singh',
--         'vikram.singh@gmail.com',
--         '9812345678'
--     ),
--     (
--         'Anjali',
--         'Mehta',
--         'anjali.mehta@gmail.com',
--         '9765432109'
--     ),
--     (
--         'Kiran',
--         'Verma',
--         'kiran.verma@gmail.com',
--         '9345678901'
--     ),
--     (
--         'Pooja',
--         'Nair',
--         'pooja.nair@gmail.com',
--         '9654321870'
--     ),
--     (
--         'Arjun',
--         'Das',
--         'arjun.das@gmail.com',
--         '9871234560'
--     ),
--     (
--         'Neha',
--         'Joshi',
--         'neha.joshi@gmail.com',
--         '9012345678'
--     ),
--     (
--         'Aditya',
--         'Varma',
--         'aditya.varma@gmail.com',
--         '9012345671'
--     ),
--     (
--         'Rohit',
--         'Agarwal',
--         'rohit.agarwal@gmail.com',
--         '9023456782'
--     ),
--     (
--         'Sanjay',
--         'Gupta',
--         'sanjay.gupta@gmail.com',
--         '9034567893'
--     ),
--     (
--         'Deepika',
--         'Shah',
--         'deepika.shah@gmail.com',
--         '9045678904'
--     );

-- INSERT INTO
--     address (
--         address,
--         city,
--         state,
--         country,
--         pin_code
--     )
-- VALUES (
--         '12-3-45, MG Road',
--         'Hyderabad',
--         'Telangana',
--         'India',
--         '500001'
--     ),
--     (
--         '45/A, Banjara Hills',
--         'Hyderabad',
--         'Telangana',
--         'India',
--         '500034'
--     ),
--     (
--         '221B Baker Street',
--         'Mumbai',
--         'Maharashtra',
--         'India',
--         '400001'
--     ),
--     (
--         '77, Brigade Road',
--         'Bangalore',
--         'Karnataka',
--         'India',
--         '560001'
--     ),
--     (
--         '10, Park Street',
--         'Kolkata',
--         'West Bengal',
--         'India',
--         '700016'
--     ),
--     (
--         '5-9-22, Himayat Nagar',
--         'Hyderabad',
--         'Telangana',
--         'India',
--         '500029'
--     ),
--     (
--         'Sector 15, Noida',
--         'Noida',
--         'Uttar Pradesh',
--         'India',
--         '201301'
--     ),
--     (
--         'Anna Salai',
--         'Chennai',
--         'Tamil Nadu',
--         'India',
--         '600002'
--     ),
--     (
--         'MG Road',
--         'Pune',
--         'Maharashtra',
--         'India',
--         '411001'
--     ),
--     (
--         'Civil Lines',
--         'Delhi',
--         'Delhi',
--         'India',
--         '110054'
--     );

-- INSERT INTO
--     customer_address (customer_id, address_id)
-- VALUES (1, 1),
--     (2, 2),
--     (3, 3),
--     (4, 4),
--     (5, 5),
--     (6, 6),
--     (7, 7),
--     (8, 8),
--     (9, 9),
--     (10, 10);

-- INSERT INTO
--     products (
--         product_name,
--         category_id,
--         stock,
--         price,
--         product_description
--     )
-- VALUES (
--         'iPhone 13',
--         1,
--         10,
--         60000,
--         'Apple smartphone with A15 chip'
--     ),
--     (
--         'Samsung TV',
--         1,
--         5,
--         45000,
--         '50-inch smart LED TV'
--     ),
--     (
--         'Men T-Shirt',
--         2,
--         50,
--         799,
--         'Cotton casual t-shirt'
--     ),
--     (
--         'Women Kurti',
--         2,
--         30,
--         1299,
--         'Traditional wear for women'
--     ),
--     (
--         'Data Structures Book',
--         3,
--         20,
--         499,
--         'Learn DSA concepts'
--     ),
--     (
--         'Cookware Set',
--         4,
--         15,
--         2999,
--         'Non-stick kitchen set'
--     ),
--     (
--         'Cricket Bat',
--         5,
--         25,
--         1999,
--         'Professional wooden bat'
--     ),
--     (
--         'Toy Car',
--         6,
--         40,
--         299,
--         'Remote control toy car'
--     ),
--     (
--         'Face Cream',
--         7,
--         35,
--         399,
--         'Skin care cream'
--     ),
--     (
--         'Office Chair',
--         9,
--         8,
--         7000,
--         'Ergonomic chair for work'
--     ),
--     (
--         'Laptop Dell Inspiron',
--         1,
--         7,
--         55000,
--         '15-inch laptop with i5 processor'
--     ),
--     (
--         'Bluetooth Speaker',
--         1,
--         20,
--         2499,
--         'Portable wireless speaker'
--     ),
--     (
--         'Jeans for Men',
--         2,
--         40,
--         1499,
--         'Slim fit denim jeans'
--     ),
--     (
--         'Women Saree',
--         2,
--         25,
--         1999,
--         'Silk saree for occasions'
--     ),
--     (
--         'Python Programming Book',
--         3,
--         18,
--         699,
--         'Beginner to advanced Python guide'
--     ),
--     (
--         'Wall Clock',
--         4,
--         12,
--         799,
--         'Analog wall clock'
--     ),
--     (
--         'Football',
--         5,
--         30,
--         999,
--         'Standard size football'
--     ),
--     (
--         'Doll Set',
--         6,
--         22,
--         499,
--         'Kids doll toy set'
--     ),
--     (
--         'Shampoo',
--         7,
--         50,
--         299,
--         'Hair care shampoo'
--     ),
--     (
--         'Dining Table',
--         9,
--         5,
--         15000,
--         'Wooden dining table set'
--     ),
--     (
--         'Microwave Oven',
--         1,
--         6,
--         12000,
--         'Convection microwave oven'
--     ),
--     (
--         'Formal Shirt',
--         2,
--         35,
--         1199,
--         'Office wear shirt'
--     ),
--     (
--         'Notebook Pack',
--         3,
--         60,
--         199,
--         'Set of 5 notebooks'
--     ),
--     (
--         'Bedsheet Set',
--         4,
--         20,
--         999,
--         'Cotton bedsheet with pillow covers'
--     ),
--     (
--         'Badminton Racket',
--         5,
--         28,
--         1499,
--         'Lightweight racket'
--     ),
--     (
--         'Puzzle Game',
--         6,
--         18,
--         399,
--         'Brain teaser puzzle'
--     ),
--     (
--         'Perfume',
--         7,
--         27,
--         899,
--         'Long-lasting fragrance'
--     ),
--     (
--         'Sofa Set',
--         9,
--         3,
--         30000,
--         'Comfortable 3-seater sofa'
--     ),
--     (
--         'Headphones',
--         1,
--         15,
--         1999,
--         'Noise cancelling headphones'
--     ),
--     (
--         'Jacket',
--         2,
--         20,
--         2499,
--         'Winter wear jacket'
--     ),
--     (
--         'Story Book',
--         3,
--         45,
--         299,
--         'Children story book'
--     ),
--     (
--         'Kitchen Mixer',
--         4,
--         10,
--         3500,
--         'Multi-purpose mixer grinder'
--     ),
--     (
--         'Tennis Ball Pack',
--         5,
--         50,
--         499,
--         'Pack of 6 balls'
--     ),
--     (
--         'RC Helicopter',
--         6,
--         10,
--         1299,
--         'Remote control helicopter'
--     ),
--     (
--         'Face Wash',
--         7,
--         40,
--         249,
--         'Daily skin cleanser'
--     ),
--     (
--         'Wardrobe',
--         9,
--         4,
--         20000,
--         'Wooden wardrobe'
--     ),
--     (
--         'HP Pavilion Laptop',
--         1,
--         6,
--         65000,
--         '15.6 inch laptop with Ryzen processor'
--     ),
--     (
--         'Nike Running Shoes',
--         2,
--         25,
--         3499,
--         'Comfortable running shoes'
--     ),
--     (
--         'Wooden Study Table',
--         9,
--         4,
--         12000,
--         'Compact study table'
--     ),
--     (
--         'Samsung Refrigerator',
--         1,
--         3,
--         30000,
--         'Double door fridge'
--     ),
--     (
--         'Yoga Mat',
--         5,
--         50,
--         999,
--         'Non-slip yoga mat'
--     ),
--     (
--         'Baby Stroller',
--         6,
--         8,
--         5000,
--         'Comfort stroller for babies'
--     );

-- INSERT INTO
--     orders (
--         customer_id,
--         total_amount,
--         order_status
--     )
-- VALUES (1, 60799, 'Pending'),
--     (2, 45000, 'Delivered'),
--     (3, 2298, 'Delivered'),
--     (4, 1299, 'Pending'),
--     (5, 499, 'Delivered'),
--     (6, 2999, 'Delivered'),
--     (7, 1999, 'Pending'),
--     (8, 299, 'Delivered'),
--     (9, 399, 'Pending'),
--     (10, 7000, 'Delivered'),
--     (1, 55000, 'Delivered'),
--     (2, 2499, 'Pending'),
--     (3, 1499, 'Delivered'),
--     (4, 1999, 'Delivered'),
--     (5, 699, 'Pending'),
--     (6, 799, 'Delivered'),
--     (7, 999, 'Delivered'),
--     (8, 499, 'Pending'),
--     (9, 299, 'Delivered'),
--     (10, 15000, 'Pending'),
--     (1, 65000, 'Delivered'),
--     (2, 3499, 'Delivered'),
--     (3, 12000, 'Pending'),
--     (4, 30000, 'Delivered'),
--     (5, 999, 'Delivered'),
--     (6, 5000, 'Pending');

-- INSERT INTO
--     orders (
--         customer_id,
--         total_amount,
--         order_status
--     )
-- VALUES (2, 45000, 'Delivered');

-- INSERT INTO
--     order_details (
--         order_id,
--         product_id,
--         quantity,
--         unit_price
--     )
-- VALUES (27, 43, 1, 60000),
--     (27, 45, 1, 799),
--     (28, 44, 1, 45000),
--     (29, 45, 2, 799),
--     (30, 46, 1, 1299),
--     (31, 47, 1, 499),
--     (32, 48, 1, 2999),
--     (33, 49, 1, 1999),
--     (34, 50, 1, 299),
--     (35, 51, 1, 399),
--     (36, 52, 1, 7000),
--     (37, 53, 1, 55000),
--     (38, 54, 1, 2499),
--     (39, 55, 1, 1499),
--     (40, 56, 1, 1999),
--     (41, 57, 1, 699),
--     (42, 58, 1, 799),
--     (43, 59, 1, 999),
--     (44, 60, 1, 499),
--     (45, 61, 1, 299),
--     (46, 62, 1, 15000),
--     (59, 43, 1, 60000);

-- INSERT INTO
--     payments (
--         order_id,
--         payment_type,
--         amount
--     )
-- VALUES (27, 'COD', 60799),
--     (28, 'UPI', 45000),
--     (29, 'UPI', 2298),
--     (30, 'CC', 1299),
--     (31, 'UPI', 499),
--     (32, 'DC', 2999),
--     (33, 'UPI', 1999),
--     (34, 'COD', 299),
--     (35, 'UPI', 399),
--     (36, 'UPI', 7000),
--     (37, 'CC', 55000),
--     (38, 'UPI', 2499),
--     (39, 'UPI', 1499),
--     (40, 'DC', 1999),
--     (41, 'UPI', 699),
--     (42, 'COD', 799),
--     (43, 'UPI', 999),
--     (44, 'UPI', 499),
--     (45, 'DC', 299),
--     (46, 'CC', 15000),
--     (47, 'UPI', 1200),
--     (48, 'UPI', 800),
--     (49, 'UPI', 1500),
--     (50, 'UPI', 2000),
--     (51, 'COD', 500),
--     (52, 'CC', 55000);

-- INSERT INTO
--     orders (
--         customer_id,
--         total_amount,
--         order_status,
--         ordered_date
--     )
-- VALUES (
--         6,
--         5000,
--         'Pending',
--         CURRENT_DATE - INTERVAL '95 days'
--     );
-----------------------------------------------------------------------------

-- **Queries**
-- List all the customer Details(basic)
SELECT * FROM customers;

-- List CustomerName, No of Orders
SELECT concat(first_name, ' ', last_name) as customer_name, count(*) as No_of_orders
from customers c
    INNER JOIN orders o ON c.id = o.customer_id
GROUP BY
    customer_name,
    c.id
ORDER BY count(*);

-- List CustomerName, No of Orders(Delivered, In Progress)
SELECT
    concat(first_name, ' ', last_name) as customer_name,
    count(*) as No_of_orders,
    o.order_status as statue
from customers c
    INNER JOIN orders o ON c.id = o.customer_id
WHERE
    order_status IN ('Delivered', 'Pending')
GROUP BY
    customer_name,
    c.id,
    o.order_status
ORDER BY count(*);

-- List Categoryname, product Details
SELECT c.category_name, p.product_name, p.stock, p.price, p.product_description
FROM categories c
    JOIN products p ON c.id = p.category_id;

-- Get No.of orders with paymode
SELECT payment_type, count(order_id) as no_of_orders
FROM payments
GROUP BY
    payment_type;

-- List Customer with no orders
SELECT
    c.id,
    concat(first_name, ' ', last_name) as customer_name,
    email,
    phone_number,
    o.id as orders
from customers c
    LEFT JOIN orders o ON c.id = o.customer_id
WHERE
    o.id is NULL;

-----------------------------------------------------------------
-- INSERT INTO
--     orders (
--         customer_id,
--         ordered_date,
--         total_amount,
--         order_status
--     )
-- VALUES (
--         11,
--         current_date - INTERVAL '100 days',
--         55000,
--         'Delivered'
--     );

-- INSERT INTO
--     order_details (
--         order_id,
--         product_id,
--         quantity,
--         unit_price
--     )
-- VALUES (61, 53, 1, 55000);

-- INSERT INTO
--     payments (
--         order_id,
--         payment_type,
--         amount,
--         payment_date
--     )
-- VALUES (
--         61,
--         'UPI',
--         55000,
--         current_date - INTERVAL '90 days'
--     );
-----------------------------------------------------------------

-- List Customer with no orders in the last 90 days
SELECT *
FROM customers c
WHERE
    c.id NOT IN (
        SELECT customer_id
        FROM orders
        WHERE
            ordered_date >= current_date - INTERVAL '90 days'
    );
-- AND c.id NOT IN (
--     SELECT c.id
--     from customers c
--         LEFT JOIN orders o ON c.id = o.customer_id
--     WHERE
--         o.id is NULL
-- );

-- List top 10 sold products in th last 90 days.
SELECT p.id, product_name, sum(od.quantity) as total_orders
from
    products p
    INNER JOIN order_details od ON p.id = od.product_id
    JOIN orders o ON od.order_id = o.id
WHERE
    current_date - ordered_date <= 90
GROUP BY
    p.id,
    product_name
ORDER BY total_orders DESC
LIMIT 10;

-- Get all products with price > 500
SELECT * FROM products WHERE price > 500 ORDER BY price;

-- Get customers from a specific city like 'Hyderabad'
SELECT concat(first_name, ' ', last_name) as customer_name, city
from
    customers c
    JOIN customer_address ca ON c.id = ca.customer_id
    JOIN address a ON ca.address_id = a.id
WHERE
    city = 'Hyderabad';

-- Get all order basic details with customer names
SELECT
    concat(first_name, ' ', last_name) as customer_name,
    o.id as order_id,
    p.product_name,
    od.unit_price,
    od.quantity,
    o.total_amount
FROM
    customers c
    INNER JOIN orders o ON c.id = o.customer_id
    JOIN order_details od ON o.id = od.order_id
    JOIN products p ON od.product_id = p.id;

-- Get order items with product name
SELECT o.id as order_id, p.product_name, od.unit_price, od.quantity, o.total_amount
FROM
    orders o
    JOIN order_details od ON o.id = od.order_id
    JOIN products p ON od.product_id = p.id
ORDER BY o.id;

-- Get total items in each order (Order Id and items in that order)
SELECT o.id as order_id, sum(od.quantity) as total_items
FROM orders o
    JOIN order_details od ON o.id = od.order_id
GROUP BY
    o.id
ORDER BY total_items DESC, o.id;

-- Get total spending by each customer
SELECT
    concat(first_name, ' ', last_name) as customer_name,
    sum(o.total_amount) as total_spendings
from customers c
    INNER JOIN orders o ON c.id = o.customer_id
GROUP BY
    customer_name
ORDER BY total_spendings DESC;

-- Get top 5 most expensive products
SELECT
    product_name,
    price,
    product_description
FROM products
ORDER BY price DESC
LIMIT 5;

-- Get most sold product (by quantity)
SELECT
    product_name as most_sold_product,
    sum(quantity) as total_units_sold
FROM products p
    INNER JOIN order_details od ON p.id = od.product_id
GROUP BY
    p.id
ORDER BY total_units_sold DESC
LIMIT 1;

-- Get 2nd highest order till now.

SELECT *
FROM orders
WHERE
    total_amount < (
        SELECT max(total_amount)
        FROM orders
    )
ORDER BY total_amount DESC
LIMIT 1
OFFSET
    4;

-- List all products that were never ordered
SELECT p.product_name
FROM products p
    LEFT JOIN order_details od ON p.id = od.product_id
WHERE
    od.order_id is NULL;

-- List customers who placed more than 5 orders
SELECT concat(first_name, ' ', last_name) as customer_name, count(o.customer_id) no_of_orders
FROM customers c
    INNER JOIN orders o ON c.id = o.customer_id
GROUP BY
    o.customer_id,
    customer_name
HAVING (count(o.customer_id) > 5);

-- Find total revenue generated
SELECT sum(amount) as total_revenue from payments;

-- Find total revenue generated per category
SELECT category_name, od.quantity, sum(od.unit_price * od.quantity) as revenue
FROM
    categories c
    INNER JOIN products p ON c.id = p.category_id
    INNER JOIN order_details od ON p.id = od.product_id
GROUP BY
    category_name,
    od.quantity
ORDER BY revenue DESC;

-- List all orders placed in the last 30 days
SELECT
    product_name,
    order_id,
    ordered_date
FROM
    products p
    INNER JOIN order_details od ON p.id = od.product_id
    JOIN orders o ON o.id = od.order_id
WHERE
    current_date - o.ordered_date <= 30;

-- Get average order value (Total revenue / number of orders)
SELECT ROUND(
        sum(total_amount) / count(*), 2
    ) as average_order_value
FROM orders;

-- Find the number of products in each category
SELECT category_name, count(*) as no_of_products
FROM categories c
    JOIN products p ON c.id = p.category_id
GROUP BY
    category_name
ORDER BY no_of_products DESC;

-- Find customers who used UPI payment more than 3 times
SELECT
    concat(first_name, ' ', last_name) as customer_name,
    p.payment_type,
    count(*) as no_of_times_used
FROM
    customers c
    INNER JOIN orders o ON c.id = o.customer_id
    JOIN payments p ON o.id = p.order_id
WHERE
    p.payment_type = 'UPI'
GROUP BY
    customer_name,
    p.payment_type
HAVING
    count(*) > 3;

--------------------------------------------------------------------------
-- INSERT INTO orders (customer_id, total_amount)
-- VALUES (1, 60000);

-- INSERT INTO order_details (order_id, product_id, quantity, unit_price)
-- VALUES (60, 43, 1, 60000);
--------------------------------------------------------------------------

-- Find customers who ordered the same product more than once
SELECT concat(first_name, ' ', last_name) as customer_name, p.product_name, count(*)
FROM
    customers c
    INNER JOIN orders o ON c.id = o.customer_id
    JOIN order_details od ON o.id = od.order_id
    JOIN products p ON od.product_id = p.id
GROUP BY
    c.id,
    p.product_name
HAVING
    count(*) > 1;

-- List orders where total amount is greater than average order amount
SELECT *
FROM orders
WHERE
    total_amount > (
        SELECT avg(total_amount)
        from orders
    );

-- Get category-wise highest priced product
SELECT
    category_name,
    max(price) as height_priced_product
FROM products p
    JOIN categories c ON p.category_id = c.id
GROUP BY
    category_name;

-- Find customers who never used 'Cash' payment mode
SELECT concat(first_name, ' ', last_name) as customer_name
FROM customers
    INNER JOIN orders ON customers.id = orders.customer_id
WHERE
    customers.id NOT IN (
        SELECT o.customer_id
        FROM orders o
            JOIN payments p ON o.id = p.order_id
        WHERE
            payment_type = 'COD'
    );

-- Get orders where at least one product price > ₹5000
SELECT DISTINCT
    o.id as order_id,
    max(unit_price) as unit_price_5000
FROM
    orders o
    JOIN order_details od ON o.id = od.order_id
    INNER JOIN products p ON od.product_id = p.id
WHERE
    price > 5000
GROUP BY
    o.id;

-- CustName, DeliveredOrders, InProgressOrders
-- AAA,      10,              15
SELECT
    concat(first_name, ' ', last_name) as customer_name,
    COUNT(
        CASE
            WHEN o.order_status = 'Delivered' THEN 1
        END
    ) AS DeliveredOrders,
    COUNT(
        CASE
            WHEN o.order_status = 'Pending' THEN 1
        END
    ) AS InProgressOrders
FROM customers c
    JOIN orders o ON c.id = o.customer_id
GROUP BY
    customer_name;

-- AAA, 10, 'Delivered'
-- AAA, 15, 'Pending'
SELECT
    concat(first_name, ' ', last_name) as customer_name,
    count(*) as No_of_orders,
    o.order_status as statue
from customers c
    INNER JOIN orders o ON c.id = o.customer_id
WHERE
    order_status IN ('Delivered', 'Pending')
GROUP BY
    o.order_status,
    c.id
ORDER BY c.id, order_status;