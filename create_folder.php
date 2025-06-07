<?php
include 'config.php';

$folderName = trim($_POST['folder_name'] ?? '');
$parentId = $_POST['parent_id'] ?? null;

if ($folderName === '') {
    die("Nama folder tidak boleh kosong.");
}

// Simpan ke database
$stmt = $conn->prepare("INSERT INTO folders (name, parent_id) VALUES (?, ?)");
$stmt->bind_param("si", $folderName, $parentId);
if ($stmt->execute()) {
    $folderPath = "uploads/" . $folderName;
    if (!file_exists($folderPath)) {
        mkdir($folderPath, 0777, true);
    }
    echo "Folder berhasil dibuat.";
} else {
    echo "Gagal membuat folder: " . $stmt->error;
}
