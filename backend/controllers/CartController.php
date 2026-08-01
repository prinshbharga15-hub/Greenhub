<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class CartController {
    public static function getCart() {
        $user = AuthMiddleware::requireAuth();
        $userId = $user['_id'];

        $cart = Database::findOne('carts', ['userId' => $userId]);
        if (!$cart) {
            echo json_encode(['items' => []]);
            return;
        }

        $populatedItems = [];
        foreach ($cart['items'] as $item) {
            $product = Database::findOne('products', ['_id' => $item['productId']]);
            if ($product) {
                $populatedItems[] = [
                    'productId' => $item['productId'],
                    'quantity' => (int)$item['quantity'],
                    'product' => [
                        'name' => $product['name'],
                        'price' => (float)$product['price'],
                        'discountPrice' => isset($product['discountPrice']) ? (float)$product['discountPrice'] : null,
                        'images' => $product['images'],
                        'stockQuantity' => (int)$product['stockQuantity'],
                        'category' => $product['category']
                    ]
                ];
            }
        }

        echo json_encode(['items' => $populatedItems]);
    }

    public static function addToCart($data) {
        $user = AuthMiddleware::requireAuth();
        $userId = $user['_id'];

        $productId = isset($data['productId']) ? $data['productId'] : '';
        $quantity = isset($data['quantity']) ? (int)$data['quantity'] : 1;

        if (empty($productId) || $quantity <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID and positive quantity are required.']);
            return;
        }

        $product = Database::findOne('products', ['_id' => $productId]);
        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found.']);
            return;
        }

        // Check existing cart quantity for cumulative stock validation
        $cart = Database::findOne('carts', ['userId' => $userId]);
        $existingQty = 0;
        if ($cart) {
            foreach ($cart['items'] as $cartItem) {
                if ($cartItem['productId'] === $productId) {
                    $existingQty = (int)$cartItem['quantity'];
                    break;
                }
            }
        }

        if ($product['stockQuantity'] < ($existingQty + $quantity)) {
            http_response_code(400);
            echo json_encode(['error' => 'Requested quantity exceeds stock availability.']);
            return;
        }

        // Re-use the cart fetched above or fetch if not yet loaded
        if (!$cart) $cart = null;
        if (!$cart) {
            $newCart = [
                'userId' => $userId,
                'items' => [
                    ['productId' => $productId, 'quantity' => $quantity]
                ]
            ];
            Database::insertOne('carts', $newCart);
        } else {
            $items = $cart['items'];
            $found = false;
            foreach ($items as &$item) {
                if ($item['productId'] === $productId) {
                    $item['quantity'] += $quantity;
                    $found = true;
                    break;
                }
            }

            if (!$found) {
                $items[] = ['productId' => $productId, 'quantity' => $quantity];
            }

            Database::updateOne('carts', ['userId' => $userId], ['$set' => ['items' => $items]]);
        }

        self::getCart();
    }

    public static function updateQuantity($data) {
        $user = AuthMiddleware::requireAuth();
        $userId = $user['_id'];

        $productId = isset($data['productId']) ? $data['productId'] : '';
        $quantity = isset($data['quantity']) ? (int)$data['quantity'] : 1;

        if (empty($productId) || $quantity <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID and positive quantity are required.']);
            return;
        }

        $product = Database::findOne('products', ['_id' => $productId]);
        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found.']);
            return;
        }

        if ($product['stockQuantity'] < $quantity) {
            http_response_code(400);
            echo json_encode(['error' => 'Requested quantity exceeds stock availability.']);
            return;
        }

        $cart = Database::findOne('carts', ['userId' => $userId]);
        if (!$cart) {
            http_response_code(404);
            echo json_encode(['error' => 'Cart not found.']);
            return;
        }

        $items = $cart['items'];
        foreach ($items as &$item) {
            if ($item['productId'] === $productId) {
                $item['quantity'] = $quantity;
                break;
            }
        }

        Database::updateOne('carts', ['userId' => $userId], ['$set' => ['items' => $items]]);
        self::getCart();
    }

    public static function removeFromCart($productId) {
        $user = AuthMiddleware::requireAuth();
        $userId = $user['_id'];

        if (empty($productId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required.']);
            return;
        }

        $cart = Database::findOne('carts', ['userId' => $userId]);
        if (!$cart) {
            http_response_code(404);
            echo json_encode(['error' => 'Cart not found.']);
            return;
        }

        $items = $cart['items'];
        $newItems = array_filter($items, function($item) use ($productId) {
            return $item['productId'] !== $productId;
        });

        $newItems = array_values($newItems);

        Database::updateOne('carts', ['userId' => $userId], ['$set' => ['items' => $newItems]]);
        self::getCart();
    }

    public static function clearCart() {
        $user = AuthMiddleware::requireAuth();
        $userId = $user['_id'];

        Database::updateOne('carts', ['userId' => $userId], ['$set' => ['items' => []]]);
        echo json_encode(['message' => 'Cart cleared successfully', 'items' => []]);
    }
}
