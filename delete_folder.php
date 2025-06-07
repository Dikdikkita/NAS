<?php
include 'config.php';

$folderId = $_GET['id'] ?? null;

$stmt = $conn->prepare("SELECT name FROM folders WHERE id = ?");
$stmt->bind_param("i", $folderId);
$stmt->execute();
$stmt->bind_result($folderName);
$stmt->fetch();
$stmt->close();

if (!$folderName) {
    die("Folder tidak ditemukan.");
}

$folderPath = "uploads/" . $folderName;
if (is_dir($folderPath)) {
    // hapus isi folder
    array_map('unlink', glob("$folderPath/*.*"));
    rmdir($folderPath);
}

// hapus dari database
$conn->query("DELETE FROM folders WHERE id = $folderId");

echo "Folder berhasil dihapus.";
