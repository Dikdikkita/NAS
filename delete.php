<?php
include 'config.php';
$id = $_GET['id'];
$result = $conn->query("SELECT * FROM files WHERE id=$id");
$file = $result->fetch_assoc();

if ($file) {
    if (file_exists($file['filepath'])) {
        unlink($file['filepath']);
    }
    $conn->query("DELETE FROM files WHERE id=$id");
}
header("Location: index.php");
