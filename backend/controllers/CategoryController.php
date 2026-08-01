<?php
require_once __DIR__ . '/../config/db.php';

class CategoryController {
    public static function getCategories() {
        $categories = Database::find('categories', [], ['sort' => ['name' => 1]]);
        echo json_encode($categories);
    }
}
