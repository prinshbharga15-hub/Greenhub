<?php

class Database {
    private static $bridgeUrl = "http://127.0.0.1:5000/db";

    private static $apiKey = null;

    private static function getApiKey() {
        if (self::$apiKey === null) {
            self::$apiKey = getenv('BRIDGE_API_KEY') ?: 'greenhub_bridge_dev_key_' . strtolower(php_uname('n'));
        }
        return self::$apiKey;
    }

    private static function request($endpoint, $payload) {
        $ch = curl_init(self::$bridgeUrl . "/" . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'X-Api-Key: ' . self::getApiKey()
        ]);
        
        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            error_log("DB Bridge Connection Error: " . $err);
            return ['success' => false, 'error' => $err];
        }

        $decoded = json_decode($response, true);
        if ($decoded === null) {
            return ['success' => false, 'error' => 'Invalid JSON response from DB bridge'];
        }

        return $decoded;
    }

    public static function find($collection, $filter = [], $options = []) {
        $res = self::request('find', [
            'collection' => $collection,
            'filter' => $filter,
            'options' => $options
        ]);
        return isset($res['success']) && $res['success'] ? $res['data'] : [];
    }

    public static function findOne($collection, $filter = [], $options = []) {
        $res = self::request('findOne', [
            'collection' => $collection,
            'filter' => $filter,
            'options' => $options
        ]);
        return isset($res['success']) && $res['success'] ? $res['data'] : null;
    }

    public static function insertOne($collection, $document) {
        $res = self::request('insertOne', [
            'collection' => $collection,
            'document' => $document
        ]);
        return isset($res['success']) && $res['success'] ? $res['data'] : null;
    }

    public static function updateOne($collection, $filter, $update, $options = []) {
        $res = self::request('updateOne', [
            'collection' => $collection,
            'filter' => $filter,
            'update' => $update,
            'options' => $options
        ]);
        return isset($res['success']) && $res['success'] ? $res['data'] : null;
    }

    public static function updateMany($collection, $filter, $update, $options = []) {
        $res = self::request('updateMany', [
            'collection' => $collection,
            'filter' => $filter,
            'update' => $update,
            'options' => $options
        ]);
        return isset($res['success']) && $res['success'] ? $res['data'] : null;
    }

    public static function deleteOne($collection, $filter) {
        $res = self::request('deleteOne', [
            'collection' => $collection,
            'filter' => $filter
        ]);
        return isset($res['success']) && $res['success'] ? $res['data'] : null;
    }

    public static function deleteMany($collection, $filter) {
        $res = self::request('deleteMany', [
            'collection' => $collection,
            'filter' => $filter
        ]);
        return isset($res['success']) && $res['success'] ? $res['data'] : null;
    }

    public static function countDocuments($collection, $filter = []) {
        $res = self::request('countDocuments', [
            'collection' => $collection,
            'filter' => $filter
        ]);
        return isset($res['success']) && $res['success'] ? $res['data'] : 0;
    }

    public static function aggregate($collection, $pipeline = []) {
        $res = self::request('aggregate', [
            'collection' => $collection,
            'pipeline' => $pipeline
        ]);
        return isset($res['success']) && $res['success'] ? $res['data'] : [];
    }
}
