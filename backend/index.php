<?php
$allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: http://localhost:5173");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/helpers/JWT.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';

require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/ProductController.php';
require_once __DIR__ . '/controllers/CategoryController.php';
require_once __DIR__ . '/controllers/CartController.php';
require_once __DIR__ . '/controllers/WishlistController.php';
require_once __DIR__ . '/controllers/OrderController.php';
require_once __DIR__ . '/controllers/ReviewController.php';
require_once __DIR__ . '/controllers/AdminController.php';

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];
$route = trim($requestUri, '/');
$inputData = json_decode(file_get_contents('php://input'), true) ?? [];

function matchRoute($pattern, $route, &$params = []) {
    $regex = '^' . preg_replace('/:[a-zA-Z0-9_-]+/', '([a-zA-Z0-9_-]+)', $pattern) . '$';
    if (preg_match('#' . $regex . '#', $route, $matches)) {
        array_shift($matches);
        $params = $matches;
        return true;
    }
    return false;
}

function checkRateLimit($key, $maxAttempts = 10, $windowSeconds = 60) {
    $rateDir = __DIR__ . '/tmp/rate_limits';
    if (!is_dir($rateDir)) @mkdir($rateDir, 0755, true);
    $file = $rateDir . '/' . md5($key) . '.json';
    $now = time();
    $data = file_exists($file) ? json_decode(file_get_contents($file), true) : ['attempts' => [], 'blocked_until' => 0];
    if (!$data) $data = ['attempts' => [], 'blocked_until' => 0];
    if (isset($data['blocked_until']) && $data['blocked_until'] > $now) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many requests. Please try again later.']);
        exit;
    }
    $data['attempts'] = array_values(array_filter($data['attempts'] ?? [], fn($t) => $t > $now - $windowSeconds));
    $data['attempts'][] = $now;
    if (count($data['attempts']) > $maxAttempts) {
        $data['blocked_until'] = $now + $windowSeconds;
        file_put_contents($file, json_encode($data));
        http_response_code(429);
        echo json_encode(['error' => 'Too many requests. Please try again later.']);
        exit;
    }
    file_put_contents($file, json_encode($data));
}

try {
    $params = [];
    
    if ($route === 'api/auth/register' && $requestMethod === 'POST') {
        checkRateLimit($_SERVER['REMOTE_ADDR'] . ':register', 100, 60);
        AuthController::register($inputData);
    } elseif ($route === 'api/auth/login' && $requestMethod === 'POST') {
        checkRateLimit($_SERVER['REMOTE_ADDR'] . ':login', 100, 60);
        AuthController::login($inputData);
    } elseif ($route === 'api/auth/me' && $requestMethod === 'GET') {
        AuthController::me();
    } elseif ($route === 'api/auth/forgot-password' && $requestMethod === 'POST') {
        checkRateLimit($_SERVER['REMOTE_ADDR'] . ':forgot-password', 100, 60);
        AuthController::forgotPassword($inputData);
    } elseif ($route === 'api/auth/reset-password' && $requestMethod === 'POST') {
        AuthController::resetPassword($inputData);
    } elseif ($route === 'api/profile' && $requestMethod === 'PUT') {
        AuthController::updateProfile($inputData);
        
    } elseif ($route === 'api/products/upload' && $requestMethod === 'POST') {
        AdminController::uploadImage();
    } elseif ($route === 'api/products' && $requestMethod === 'GET') {
        ProductController::getProducts();
    } elseif (matchRoute('api/products/:id', $route, $params) && $requestMethod === 'GET') {
        ProductController::getProductById($params[0]);
    } elseif ($route === 'api/products' && $requestMethod === 'POST') {
        AdminController::addProduct($inputData);
    } elseif (matchRoute('api/products/:id', $route, $params) && $requestMethod === 'PUT') {
        AdminController::editProduct($params[0], $inputData);
    } elseif (matchRoute('api/products/:id', $route, $params) && $requestMethod === 'DELETE') {
        AdminController::deleteProduct($params[0]);

    } elseif ($route === 'api/categories' && $requestMethod === 'GET') {
        CategoryController::getCategories();
    } elseif ($route === 'api/categories' && $requestMethod === 'POST') {
        AdminController::addCategory($inputData);
    } elseif (matchRoute('api/categories/:id', $route, $params) && $requestMethod === 'PUT') {
        AdminController::editCategory($params[0], $inputData);
    } elseif (matchRoute('api/categories/:id', $route, $params) && $requestMethod === 'DELETE') {
        AdminController::deleteCategory($params[0]);

    } elseif ($route === 'api/cart' && $requestMethod === 'GET') {
        CartController::getCart();
    } elseif ($route === 'api/cart' && $requestMethod === 'POST') {
        CartController::addToCart($inputData);
    } elseif ($route === 'api/cart' && $requestMethod === 'PUT') {
        CartController::updateQuantity($inputData);
    } elseif (matchRoute('api/cart/:productId', $route, $params) && $requestMethod === 'DELETE') {
        CartController::removeFromCart($params[0]);
    } elseif ($route === 'api/cart' && $requestMethod === 'DELETE') {
        CartController::clearCart();

    } elseif ($route === 'api/wishlist' && $requestMethod === 'GET') {
        WishlistController::getWishlist();
    } elseif ($route === 'api/wishlist' && $requestMethod === 'POST') {
        WishlistController::toggleWishlist($inputData);

    } elseif ($route === 'api/orders' && $requestMethod === 'POST') {
        OrderController::createOrder($inputData);
    } elseif ($route === 'api/orders' && $requestMethod === 'GET') {
        OrderController::getOrders();
    } elseif (matchRoute('api/orders/:id', $route, $params) && $requestMethod === 'GET') {
        OrderController::getOrderById($params[0]);
    } elseif ($route === 'api/coupons/validate' && $requestMethod === 'POST') {
        OrderController::validateCoupon($inputData);

    } elseif (matchRoute('api/reviews/:productId', $route, $params) && $requestMethod === 'GET') {
        ReviewController::getReviews($params[0]);
    } elseif ($route === 'api/reviews' && $requestMethod === 'POST') {
        ReviewController::addReview($inputData);

    } elseif ($route === 'api/admin/dashboard' && $requestMethod === 'GET') {
        AdminController::getDashboardStats();
    } elseif ($route === 'api/admin/orders' && $requestMethod === 'GET') {
        AdminController::getOrders();
    } elseif (matchRoute('api/admin/orders/:id', $route, $params) && $requestMethod === 'PUT') {
        AdminController::updateOrderStatus($params[0], $inputData);
    } elseif (matchRoute('api/admin/orders/:id', $route, $params) && $requestMethod === 'DELETE') {
        AdminController::deleteOrder($params[0]);
    } elseif ($route === 'api/admin/users' && $requestMethod === 'GET') {
        AdminController::getUsers();
    } elseif (matchRoute('api/admin/users/:id', $route, $params) && $requestMethod === 'DELETE') {
        AdminController::deleteUser($params[0]);

    } else {
        http_response_code(404);
        echo json_encode(['error' => 'API Endpoint Not Found']);
    }

} catch (Exception $e) {
    http_response_code(500);
    error_log('GreenHub API Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    echo json_encode(['error' => 'An internal server error occurred.']);
}
