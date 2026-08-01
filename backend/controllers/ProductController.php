<?php
require_once __DIR__ . '/../config/db.php';

class ProductController {
    public static function getProducts() {
        $category = isset($_GET['category']) ? $_GET['category'] : '';
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $sort = isset($_GET['sort']) ? $_GET['sort'] : '';
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $page = max(1, $page);
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
        $limit = min(max(1, $limit), 100);

        $filter = [];

        if (!empty($category)) {
            $filter['category'] = (string)$category;
        }

        if (!empty($search)) {
            $filter['name'] = [
                '$regex' => preg_quote($search, '/'),
                '$options' => 'i'
            ];
        }

        $sortOptions = [];
        if ($sort === 'price-asc') {
            $sortOptions['price'] = 1;
        } elseif ($sort === 'price-desc') {
            $sortOptions['price'] = -1;
        } elseif ($sort === 'name-asc') {
            $sortOptions['name'] = 1;
        } elseif ($sort === 'name-desc') {
            $sortOptions['name'] = -1;
        } else {
            $sortOptions['createdAt'] = -1;
        }

        $skip = ($page - 1) * $limit;

        $totalItems = Database::countDocuments('products', $filter);
        $products = Database::find('products', $filter, [
            'sort' => $sortOptions,
            'skip' => $skip,
            'limit' => $limit
        ]);

        $totalPages = ceil($totalItems / $limit);

        echo json_encode([
            'products' => $products,
            'pagination' => [
                'totalItems' => $totalItems,
                'totalPages' => $totalPages,
                'currentPage' => $page,
                'limit' => $limit
            ]
        ]);
    }

    public static function getProductById($id) {
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

        $reviews = Database::find('reviews', ['productId' => $id], ['sort' => ['createdAt' => -1]]);
        $product['reviews'] = $reviews;

        echo json_encode($product);
    }
}
