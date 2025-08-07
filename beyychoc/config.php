<?php
// Database connection settings
// For local development (XAMPP)
$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "beyychoc_db";

// For production (InfinityFree)
// $servername = "sql300.infinityfree.com";
// $username   = "if0_39649803";
// $password   = "hYaBFuOBg187r";
// $dbname     = "if0_39649803_beyychoc_db";

define('DB_HOST', $servername);
define('DB_NAME', $dbname);
define('DB_USER', $username);
define('DB_PASS', $password);

function getDBConnection() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";port=3305;dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }
    return $pdo;
}
?>