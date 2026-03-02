<?php
$url = 'https://wa.muhammadarifrs.my.id/enqueue';

function test_payload($data) {
    global $url;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $resp = curl_exec($ch);
    curl_close($ch);
    echo "Payload: " . json_encode($data) . "\nResponse: " . $resp . "\n\n";
}

test_payload(['phone' => '6281234567890', 'message' => 'Test']);
test_payload(['number' => '6281234567890', 'message' => 'Test']);
test_payload(['target' => '6281234567890', 'message' => 'Test']);
test_payload(['to' => '6281234567890', 'message' => 'Test']);
test_payload(['jid' => '6281234567890', 'message' => 'Test']);
test_payload(['whatsapp' => '6281234567890', 'message' => 'Test']);
test_payload(['pesan' => 'Test']);
