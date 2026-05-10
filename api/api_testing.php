<?php
declare(strict_types=1);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/db.php";

try {
    $stmt = $pdo->query("
        // to be filled
    ");

    echo json_encode($stmt->fetchAll());
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Failed to fetch trades",
        "details" => $e->getMessage()
    ]);
}
