<?php
$url = 'https://wa.muhammadarifrs.my.id/enqueue';

// Try JSON
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
$data = json_encode(['phone' => '6281234567890', 'message' => 'Tes dari server']);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$respJson = curl_exec($ch);
curl_close($ch);
echo "JSON response: " . $respJson . "\n";

// Try Form
$ch2 = curl_init($url);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, http_build_query(['phone' => '6281234567890', 'message' => 'Tes form']));
$respForm = curl_exec($ch2);
curl_close($ch2);
echo "FORM response: " . $respForm . "\n";
