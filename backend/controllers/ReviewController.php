<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ReviewController {
    public static function getReviews($productId) {
        if (empty($productId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required.']);
            return;
        }

        $reviews = Database::find('reviews', ['productId' => $productId], ['sort' => ['createdAt' => -1]]);
        echo json_encode($reviews);
    }

    public static function addReview($data) {
        $user = AuthMiddleware::requireAuth();
        $userId = $user['_id'];
        $userName = $user['name'];

        $productId = isset($data['productId']) ? $data['productId'] : '';
        $rating = isset($data['rating']) ? (int)$data['rating'] : 0;
        $comment = isset($data['comment']) ? htmlspecialchars(trim($data['comment']), ENT_QUOTES, 'UTF-8') : '';

        if (strlen($comment) > 2000) {
            http_response_code(400);
            echo json_encode(['error' => 'Review comment must not exceed 2000 characters.']);
            return;
        }

        if (empty($productId) || $rating < 1 || $rating > 5 || empty($comment)) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID, rating (1-5), and comment are required.']);
            return;
        }

        $product = Database::findOne('products', ['_id' => $productId]);
        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found.']);
            return;
        }

        $existingReview = Database::findOne('reviews', [
            'productId' => $productId,
            'userId' => $userId
        ]);

        $newReview = [
            'productId' => $productId,
            'userId' => $userId,
            'userName' => htmlspecialchars($user['name'], ENT_QUOTES, 'UTF-8'),
            'rating' => $rating,
            'comment' => $comment,
            'createdAt' => new DateTime()
        ];

        if ($existingReview) {
            Database::updateOne('reviews', ['_id' => $existingReview['_id']], ['$set' => $newReview]);
        } else {
            Database::insertOne('reviews', $newReview);
        }

        $allReviews = Database::find('reviews', ['productId' => $productId]);
        $totalRating = 0;
        $count = count($allReviews);
        foreach ($allReviews as $rev) {
            $totalRating += (int)$rev['rating'];
        }
        $averageRating = $count > 0 ? round($totalRating / $count, 1) : 0.0;

        Database::updateOne('products', ['_id' => $productId], [
            '$set' => [
                'rating' => $averageRating,
                'reviewsCount' => $count
            ]
        ]);

        echo json_encode([
            'message' => 'Review submitted successfully',
            'review' => $newReview,
            'averageRating' => $averageRating,
            'reviewsCount' => $count
        ]);
    }
}
