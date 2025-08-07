<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config.php';

// Test database connection
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['test'])) {
    try {
        $pdo = getDBConnection();
        echo json_encode(['success' => true, 'message' => 'Database connection successful']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    }
    exit;
}

try {
    $pdo = getDBConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// GET - Fetch products
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $category = $_GET['category'] ?? '';
    $search = $_GET['search'] ?? '';
    
    $sql = "SELECT * FROM products WHERE 1=1";
    $params = [];
    
    if (!empty($category) && $category !== 'all') {
        $sql .= " AND category = ?";
        $params[] = $category;
    }
    
    if (!empty($search)) {
        // Check if search term is a number (ID search)
        if (is_numeric($search)) {
            $sql .= " AND (id = ? OR name LIKE ? OR product_code LIKE ? OR description LIKE ?)";
            $params[] = $search;
            $searchTerm = "%$search%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        } else {
            $sql .= " AND (name LIKE ? OR product_code LIKE ? OR description LIKE ?)";
            $searchTerm = "%$search%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
    }
    
    $sql .= " ORDER BY created_at DESC";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'products' => $products]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

// POST - Add new product (admin check)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? '';
    if ($auth !== 'Bearer admin123token') {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Log the received data for debugging
    error_log('Received product data: ' . json_encode($input));
    
    $required_fields = ['name', 'category', 'product_code', 'image_path'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Field '$field' is required"]);
            exit;
        }
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO products (name, category, product_code, weight, description, image_path) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $result = $stmt->execute([
            $input['name'],
            $input['category'],
            $input['product_code'],
            $input['weight'] ?? null,
            $input['description'] ?? '',
            $input['image_path']
        ]);
        
        if ($result) {
            $product_id = $pdo->lastInsertId();
            echo json_encode([
                'success' => true, 
                'message' => 'Product added successfully',
                'product_id' => $product_id
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to insert product']);
        }
        
    } catch (PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

// PUT - Edit product (admin check)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? '';
    if ($auth !== 'Bearer admin123token') {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Product id is required']);
        exit;
    }
    try {
        // Check if image_path is provided for update
        if (isset($input['image_path']) && !empty($input['image_path'])) {
            $stmt = $pdo->prepare("UPDATE products SET name=?, category=?, product_code=?, weight=?, description=?, image_path=? WHERE id=?");
            $stmt->execute([
                $input['name'],
                $input['category'],
                $input['product_code'],
                $input['weight'] ?? null,
                $input['description'] ?? '',
                $input['image_path'],
                $input['id']
            ]);
        } else {
            $stmt = $pdo->prepare("UPDATE products SET name=?, category=?, product_code=?, weight=?, description=? WHERE id=?");
            $stmt->execute([
                $input['name'],
                $input['category'],
                $input['product_code'],
                $input['weight'] ?? null,
                $input['description'] ?? '',
                $input['id']
            ]);
        }
        echo json_encode(['success' => true, 'message' => 'Product updated']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

// DELETE - Delete product (admin check)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? '';
    if ($auth !== 'Bearer admin123token') {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Product id is required']);
        exit;
    }
    try {
        $stmt = $pdo->prepare("DELETE FROM products WHERE id=?");
        $stmt->execute([$input['id']]);
        echo json_encode(['success' => true, 'message' => 'Product deleted']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}
?>