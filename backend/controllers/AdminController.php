<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminController {
    
    public static function addProduct($data) {
        AuthMiddleware::requireAdmin();

        $name = isset($data['name']) ? trim($data['name']) : '';
        $description = isset($data['description']) ? trim($data['description']) : '';
        $price = isset($data['price']) ? (float)$data['price'] : 0.0;
        $discountPrice = isset($data['discountPrice']) && $data['discountPrice'] !== '' ? (float)$data['discountPrice'] : null;
        $stockQuantity = isset($data['stockQuantity']) ? (int)$data['stockQuantity'] : 0;
        $category = isset($data['category']) ? trim($data['category']) : '';
        $images = isset($data['images']) ? $data['images'] : [];

        if (empty($name) || empty($description) || $price <= 0.0 || empty($category)) {
            http_response_code(400);
            echo json_encode(['error' => 'Product name, description, price, and category are required.']);
            return;
        }

        $newProduct = [
            'name' => $name,
            'description' => $description,
            'price' => $price,
            'discountPrice' => $discountPrice,
            'stockQuantity' => $stockQuantity,
            'images' => $images,
            'category' => $category,
            'rating' => 0.0,
            'reviewsCount' => 0,
            'availabilityStatus' => $stockQuantity > 0 ? 'in_stock' : 'out_of_stock',
            'createdAt' => new DateTime()
        ];

        $inserted = Database::insertOne('products', $newProduct);

        if (!$inserted) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create product.']);
            return;
        }

        echo json_encode(['message' => 'Product created successfully', 'product' => $inserted]);
    }

    public static function editProduct($id, $data) {
        AuthMiddleware::requireAdmin();

        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required.']);
            return;
        }

        $product = Database::findOne('products', ['_id' => $id]);
        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found.']);
            return;
        }

        if (isset($data['price']) && (float)$data['price'] <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Price must be greater than zero.']);
            return;
        }
        if (isset($data['stockQuantity']) && (int)$data['stockQuantity'] < 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Stock quantity cannot be negative.']);
            return;
        }
        if (isset($data['discountPrice']) && isset($data['price']) && (float)$data['discountPrice'] >= (float)$data['price']) {
            http_response_code(400);
            echo json_encode(['error' => 'Discount price must be less than regular price.']);
            return;
        }

        $updateFields = [];
        if (isset($data['name'])) $updateFields['name'] = trim($data['name']);
        if (isset($data['description'])) $updateFields['description'] = trim($data['description']);
        if (isset($data['price'])) $updateFields['price'] = (float)$data['price'];
        if (isset($data['discountPrice'])) {
            $updateFields['discountPrice'] = $data['discountPrice'] !== '' && $data['discountPrice'] !== null ? (float)$data['discountPrice'] : null;
        }
        if (isset($data['stockQuantity'])) {
            $updateFields['stockQuantity'] = (int)$data['stockQuantity'];
            $updateFields['availabilityStatus'] = $updateFields['stockQuantity'] > 0 ? 'in_stock' : 'out_of_stock';
        }
        if (isset($data['category'])) $updateFields['category'] = trim($data['category']);
        if (isset($data['images'])) $updateFields['images'] = $data['images'];

        Database::updateOne('products', ['_id' => $id], ['$set' => $updateFields]);

        $updatedProduct = Database::findOne('products', ['_id' => $id]);

        echo json_encode(['message' => 'Product updated successfully', 'product' => $updatedProduct]);
    }

    public static function deleteProduct($id) {
        AuthMiddleware::requireAdmin();

        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required.']);
            return;
        }

        $result = Database::deleteOne('products', ['_id' => $id]);
        
        if (!$result || $result['deletedCount'] === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found or already deleted.']);
            return;
        }

        echo json_encode(['message' => 'Product deleted successfully']);
    }

    public static function uploadImage() {
        AuthMiddleware::requireAdmin();

        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'No image file uploaded or upload error occurred.']);
            return;
        }

        if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['error' => 'File size must not exceed 5MB.']);
            return;
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $_FILES['image']['tmp_name']);
        finfo_close($finfo);
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($mimeType, $allowedMimes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.']);
            return;
        }

        $uploadDir = __DIR__ . '/../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileTmpPath = $_FILES['image']['tmp_name'];
        $fileName = $_FILES['image']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($fileExtension, $allowedExtensions)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file extension. Only JPG, JPEG, PNG, GIF, and WEBP files are allowed.']);
            return;
        }

        $newFileName = uniqid('prod_', true) . '.' . $fileExtension;
        $destPath = $uploadDir . $newFileName;

        if (move_uploaded_file($fileTmpPath, $destPath)) {
            $fileUrl = '/uploads/' . $newFileName;
            echo json_encode(['message' => 'Image uploaded successfully', 'url' => $fileUrl]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to move uploaded file. Check directory permissions.']);
        }
    }

    public static function addCategory($data) {
        AuthMiddleware::requireAdmin();

        $name = isset($data['name']) ? trim($data['name']) : '';
        $slug = isset($data['slug']) ? trim($data['slug']) : strtolower(str_replace(' ', '-', $name));
        $image = isset($data['image']) ? trim($data['image']) : '';

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Category name is required.']);
            return;
        }

        $existing = Database::findOne('categories', ['slug' => $slug]);
        if ($existing) {
            http_response_code(400);
            echo json_encode(['error' => 'Category slug already exists.']);
            return;
        }

        $newCategory = [
            'name' => $name,
            'slug' => $slug,
            'image' => $image
        ];

        $inserted = Database::insertOne('categories', $newCategory);
        echo json_encode(['message' => 'Category created successfully', 'category' => $inserted]);
    }

    public static function editCategory($id, $data) {
        AuthMiddleware::requireAdmin();

        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Category ID is required.']);
            return;
        }

        $category = Database::findOne('categories', ['_id' => $id]);
        if (!$category) {
            http_response_code(404);
            echo json_encode(['error' => 'Category not found.']);
            return;
        }

        $updateFields = [];
        if (isset($data['name'])) $updateFields['name'] = trim($data['name']);
        if (isset($data['slug'])) $updateFields['slug'] = trim($data['slug']);
        if (isset($data['image'])) $updateFields['image'] = trim($data['image']);

        Database::updateOne('categories', ['_id' => $id], ['$set' => $updateFields]);
        $updated = Database::findOne('categories', ['_id' => $id]);

        echo json_encode(['message' => 'Category updated successfully', 'category' => $updated]);
    }

    public static function deleteCategory($id) {
        AuthMiddleware::requireAdmin();

        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Category ID is required.']);
            return;
        }

        $result = Database::deleteOne('categories', ['_id' => $id]);
        if (!$result || $result['deletedCount'] === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Category not found or already deleted.']);
            return;
        }

        echo json_encode(['message' => 'Category deleted successfully']);
    }

    public static function getOrders() {
        AuthMiddleware::requireAdmin();

        $orders = Database::find('orders', [], ['sort' => ['createdAt' => -1]]);
        
        foreach ($orders as &$order) {
            $items = Database::find('order_items', ['orderId' => $order['_id']]);
            $order['items'] = $items;
            
            $customer = Database::findOne('users', ['_id' => $order['userId']]);
            $order['customerName'] = $customer['name'] ?? 'Unknown Customer';
            $order['customerEmail'] = $customer['email'] ?? '';
        }

        echo json_encode(['orders' => $orders]);
    }

    public static function updateOrderStatus($id, $data) {
        AuthMiddleware::requireAdmin();

        $status = isset($data['orderStatus']) ? trim($data['orderStatus']) : '';
        $allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (empty($status) || !in_array($status, $allowedStatuses)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid order status.']);
            return;
        }

        $order = Database::findOne('orders', ['_id' => $id]);
        if (!$order) {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found.']);
            return;
        }

        Database::updateOne('orders', ['_id' => $id], ['$set' => ['orderStatus' => $status]]);
        echo json_encode(['message' => 'Order status updated successfully', 'orderStatus' => $status]);
    }

    public static function getUsers() {
        AuthMiddleware::requireAdmin();

        $users = Database::find('users', [], ['sort' => ['createdAt' => -1]]);
        foreach ($users as &$u) {
            unset($u['passwordHash']);
        }

        echo json_encode(['users' => $users]);
    }

    public static function getDashboardStats() {
        AuthMiddleware::requireAdmin();

        $totalProducts = Database::countDocuments('products');
        $totalUsers = Database::countDocuments('users', ['role' => 'user']);
        $orders = Database::find('orders');
        $totalOrders = count($orders);

        $totalSales = 0.0;
        $dailySales = [];
        foreach ($orders as $o) {
            if ($o['orderStatus'] !== 'cancelled') {
                $totalSales += (float)$o['totalAmount'];

                $dateStr = '';
                if (isset($o['createdAt'])) {
                    if (is_array($o['createdAt']) && isset($o['createdAt']['date'])) {
                        $dateStr = substr($o['createdAt']['date'], 0, 10);
                    } elseif (is_string($o['createdAt'])) {
                        $dateStr = substr($o['createdAt'], 0, 10);
                    } elseif ($o['createdAt'] instanceof DateTime) {
                        $dateStr = $o['createdAt']->format('Y-m-d');
                    }
                }
                if (empty($dateStr)) {
                    $dateStr = date('Y-m-d');
                }

                if (!isset($dailySales[$dateStr])) {
                    $dailySales[$dateStr] = 0.0;
                }
                $dailySales[$dateStr] += (float)$o['totalAmount'];
            }
        }
        krsort($dailySales);
        $dailySales = array_slice($dailySales, 0, 7, true);

        $orderItems = Database::find('order_items');
        $categorySales = [];
        $productSales = [];
        
        foreach ($orderItems as $item) {
            $prodId = $item['productId'] ?? '';
            $product = Database::findOne('products', ['_id' => $prodId]);
            $category = $product['category'] ?? 'uncategorized';
            
            $itemTotal = (float)$item['price'] * (int)$item['quantity'];
            if (!isset($categorySales[$category])) {
                $categorySales[$category] = 0.0;
            }
            $categorySales[$category] += $itemTotal;

            if (!empty($prodId)) {
                if (!isset($productSales[$prodId])) {
                    $productSales[$prodId] = [
                        'revenue' => 0.0,
                        'quantity' => 0
                    ];
                }
                $productSales[$prodId]['revenue'] += $itemTotal;
                $productSales[$prodId]['quantity'] += (int)$item['quantity'];
            }
        }

        $recentOrders = Database::find('orders', [], ['sort' => ['createdAt' => -1], 'limit' => 5]);
        foreach ($recentOrders as &$ro) {
            $items = Database::find('order_items', ['orderId' => $ro['_id']]);
            $ro['items'] = $items;
            
            $customer = Database::findOne('users', ['_id' => $ro['userId']]);
            $ro['customerName'] = $customer['name'] ?? 'Unknown Customer';
        }

        echo json_encode([
            'metrics' => [
                'totalSales' => round($totalSales, 2),
                'totalOrders' => $totalOrders,
                'totalCustomers' => $totalUsers,
                'totalProducts' => $totalProducts
            ],
            'categorySales' => $categorySales,
            'productSales' => $productSales,
            'dailySales' => $dailySales,
            'recentOrders' => $recentOrders
        ]);
    }

    public static function deleteUser($id) {
        AuthMiddleware::requireAdmin();
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required.']);
            return;
        }

        $user = Database::findOne('users', ['_id' => $id]);
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found.']);
            return;
        }

        $currentAdmin = AuthMiddleware::requireAuth();
        if ((string)$user['_id'] === (string)$currentAdmin['_id']) {
            http_response_code(400);
            echo json_encode(['error' => 'You cannot delete your own admin account.']);
            return;
        }

        $deleted = Database::deleteOne('users', ['_id' => $id]);
        if (!$deleted) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete user.']);
            return;
        }

        echo json_encode(['message' => 'User deleted successfully.']);
    }

    public static function deleteOrder($id) {
        AuthMiddleware::requireAdmin();
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Order ID is required.']);
            return;
        }

        $order = Database::findOne('orders', ['_id' => $id]);
        if (!$order) {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found.']);
            return;
        }

        $deleted = Database::deleteOne('orders', ['_id' => $id]);
        if (!$deleted) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete order.']);
            return;
        }

        Database::deleteMany('order_items', ['orderId' => $id]);

        echo json_encode(['message' => 'Order deleted successfully.']);
    }
}
