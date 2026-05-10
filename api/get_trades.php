<?php
declare(strict_types=1);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/db.php";

try {
    $stmt = $pdo->query("
        SELECT
            id,
            trade_date,
            symbol,
            side,
            entry_price,
            exit_price,
            pnl,
            rr,
            session_name
        FROM trades
        ORDER BY trade_date DESC, id DESC
        LIMIT 200
    ");

    echo json_encode($stmt->fetchAll());
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Failed to fetch trades",
        "details" => $e->getMessage()
    ]);
}
