<?php
include 'config.php';
$id = $_GET['id'];
$result = $conn->query("SELECT * FROM files WHERE id=$id");
$file = $result->fetch_assoc();

if ($file && file_exists($file['filepath'])) {
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="'.basename($file['filename']).'"');
    readfile($file['filepath']);
    exit;
} else {
    echo "File tidak ditemukan.";
}
