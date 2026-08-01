<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class WishlistController {
    public static function getWishlist() {
        $user = AuthMiddleware::requireAuth();
        $userId = $user['_id'];

        $wishlist = Database::findOne('wishlists', ['userId' => $userId]);
        if (!$wishlist || !isset($wishlist['productIds'])) {
            echo json_encode(['products' => []]);
            return;
        }

        $products = [];
        foreach ($wishlist['productIds'] as $productId) {
            $product = Database::findOne('products', ['_id' => $productId]);
            if ($product) {
                $products[] = $product;
            }
        }

        echo json_encode(['products' => $products]);
    }

    public static function toggleWishlist($data) {
        $user = AuthMiddleware::requireAuth();
        $userId = $user['_id'];

        $productId = isset($data['productId']) ? $data['productId'] : '';
        if (empty($productId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required.']);
            return;
        }

        $productExists = Database::findOne('products', ['_id' => $productId]);
        if (!$productExists) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found.']);
            return;
        }

        $wishlist = Database::findOne('wishlists', ['userId' => $userId]);
        if (!$wishlist) {
            $newWishlist = [
                'userId' => $userId,
                'productIds' => [$productId]
            ];
            Database::insertOne('wishlists', $newWishlist);
            $action = 'added';
        } else {
            $productIds = $wishlist['productIds'] ?? [];
            if (in_array($productId, $productIds)) {
                $productIds = array_values(array_diff($productIds, [$productId]));
                $action = 'removed';
            } else {
                $productIds[] = $productId;
                $action = 'added';
            }
            Database::updateOne('wishlists', ['userId' => $userId], ['$set' => ['productIds' => $productIds]]);
        }

        $updatedWishlist = Database::findOne('wishlists', ['userId' => $userId]);
        $products = [];
        if ($updatedWishlist && isset($updatedWishlist['productIds'])) {
            foreach ($updatedWishlist['productIds'] as $pid) {
                $p = Database::findOne('products', ['_id' => $pid]);
                if ($p) $products[] = $p;
            }
        }

        echo json_encode([
            'message' => "Product successfully $action wishlist.",
            'action' => $action,
            'products' => $products
        ]);
    }
}
