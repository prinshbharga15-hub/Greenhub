<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class OrderController {
    public static function createOrder($data) {
        $user = AuthMiddleware::requireAuth();
        $userId = $user['_id'];

        $shippingAddress = isset($data['shippingAddress']) ? $data['shippingAddress'] : null;
        $couponCode = isset($data['couponCode']) ? trim($data['couponCode']) : '';

        if (!$shippingAddress || empty($shippingAddress['fullName']) || empty($shippingAddress['address']) || empty($shippingAddress['city']) || empty($shippingAddress['zip']) || empty($shippingAddress['phone'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid shipping address details are required.']);
            return;
        }

        $cart = Database::findOne('carts', ['userId' => $userId]);
        if (!$cart || empty($cart['items'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Your cart is empty.']);
            return;
        }

        $subtotal = 0;
        $itemsToOrder = [];
        
        foreach ($cart['items'] as $item) {
            $product = Database::findOne('products', ['_id' => $item['productId']]);
            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => "Product not found: " . $item['productId']]);
                return;
            }

            if ($product['stockQuantity'] < $item['quantity']) {
                http_response_code(400);
                echo json_encode(['error' => "Insufficient stock for: " . $product['name'] . ". Available: " . $product['stockQuantity']]);
                return;
            }

            $price = isset($product['discountPrice']) && $product['discountPrice'] > 0 ? (float)$product['discountPrice'] : (float)$product['price'];
            $itemTotal = $price * $item['quantity'];
            $subtotal += $itemTotal;

            $itemsToOrder[] = [
                'productId' => $item['productId'],
                'name' => $product['name'],
                'price' => $price,
                'quantity' => $item['quantity'],
                'image' => $product['images'][0] ?? ''
            ];
        }

        $discountAmount = 0.0;
        if (!empty($couponCode)) {
            // Check if user already used this coupon
            $existingUsage = Database::findOne('coupon_usage', [
                'userId' => $user['_id'],
                'couponCode' => $couponCode
            ]);
            if ($existingUsage) {
                http_response_code(400);
                echo json_encode(['error' => 'This coupon has already been used.']);
                return;
            }

            $coupon = Database::findOne('coupons', ['code' => $couponCode, 'active' => true]);
            if ($coupon) {
                $expiry = isset($coupon['expiryDate']) ? new DateTime($coupon['expiryDate']) : null;
                if (!$expiry || $expiry > new DateTime()) {
                    if ($coupon['discountType'] === 'percentage') {
                        $discountAmount = $subtotal * ((float)$coupon['discountValue'] / 100.0);
                    } else {
                        $discountAmount = (float)$coupon['discountValue'];
                    }
                }
            }
        }

        $totalAmount = max(0.0, $subtotal - $discountAmount);

        $paymentMethod = isset($data['paymentMethod']) ? trim($data['paymentMethod']) : 'COD';
        if (!in_array($paymentMethod, ['COD', 'Card', 'UPI'])) {
            $paymentMethod = 'COD';
        }

        // Insert order FIRST before stock decrements
        $newOrder = [
            'userId' => $userId,
            'shippingAddress' => $shippingAddress,
            'paymentMethod' => $paymentMethod,
            'orderStatus' => 'pending',
            'subtotal' => $subtotal,
            'discountAmount' => $discountAmount,
            'couponCode' => $couponCode,
            'totalAmount' => $totalAmount,
            'createdAt' => new DateTime()
        ];

        $insertedOrder = Database::insertOne('orders', $newOrder);
        if (!$insertedOrder) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to place the order.']);
            return;
        }

        $orderId = $insertedOrder['_id'];

        // Atomic stock decrement with condition check
        foreach ($cart['items'] as $item) {
            $result = Database::updateOne('products', [
                '_id' => $item['productId'],
                'stockQuantity' => ['$gte' => $item['quantity']]
            ], [
                '$inc' => ['stockQuantity' => -$item['quantity']]
            ]);

            if (!$result || $result['matchedCount'] === 0) {
                // Stock insufficient — mark order as failed
                Database::updateOne('orders', ['_id' => $orderId], [
                    '$set' => ['orderStatus' => 'failed']
                ]);
                http_response_code(400);
                echo json_encode(['error' => 'Insufficient stock. Order could not be completed.']);
                return;
            }
        }

        foreach ($itemsToOrder as $orderItem) {
            $orderItem['orderId'] = $orderId;
            Database::insertOne('order_items', $orderItem);
        }

        // Record coupon usage if applicable
        if ($couponCode) {
            Database::insertOne('coupon_usage', [
                'userId' => $user['_id'],
                'couponCode' => $couponCode,
                'orderId' => $orderId,
                'usedAt' => date('c')
            ]);
        }

        Database::updateOne('carts', ['userId' => $userId], ['$set' => ['items' => []]]);

        echo json_encode([
            'message' => 'Order placed successfully',
            'order' => [
                'id' => $orderId,
                'totalAmount' => $totalAmount,
                'paymentMethod' => 'COD',
                'orderStatus' => 'pending'
            ]
        ]);
    }

    public static function getOrders() {
        $user = AuthMiddleware::requireAuth();
        $userId = $user['_id'];

        $orders = Database::find('orders', ['userId' => $userId], ['sort' => ['createdAt' => -1]]);
        
        foreach ($orders as &$order) {
            $items = Database::find('order_items', ['orderId' => $order['_id']]);
            $order['items'] = $items;
        }

        echo json_encode(['orders' => $orders]);
    }

    public static function getOrderById($id) {
        $user = AuthMiddleware::requireAuth();
        $userId = $user['_id'];

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

        if ($order['userId'] !== $userId && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden. Access denied.']);
            return;
        }

        $items = Database::find('order_items', ['orderId' => $id]);
        $order['items'] = $items;

        echo json_encode($order);
    }

    public static function validateCoupon($data) {
        AuthMiddleware::requireAuth();
        $couponCode = isset($data['couponCode']) ? trim($data['couponCode']) : '';

        if (empty($couponCode)) {
            http_response_code(400);
            echo json_encode(['error' => 'Coupon code is required.']);
            return;
        }

        $coupon = Database::findOne('coupons', ['code' => $couponCode]);
        if (!$coupon) {
            http_response_code(404);
            echo json_encode(['error' => 'Invalid coupon code.']);
            return;
        }

        if (!$coupon['active']) {
            http_response_code(400);
            echo json_encode(['error' => 'Coupon is inactive.']);
            return;
        }

        $expiry = isset($coupon['expiryDate']) ? new DateTime($coupon['expiryDate']) : null;
        if ($expiry && $expiry < new DateTime()) {
            http_response_code(400);
            echo json_encode(['error' => 'Coupon has expired.']);
            return;
        }

        echo json_encode([
            'message' => 'Coupon validated successfully',
            'coupon' => [
                'code' => $coupon['code'],
                'discountType' => $coupon['discountType'],
                'discountValue' => (float)$coupon['discountValue']
            ]
        ]);
    }
}
