<?php
include 'config.php';

$folderId = $_POST['folder_id'] ?? null;

// Ambil nama folder berdasarkan ID
$folderName = '';
if ($folderId) {
    $stmt = $conn->prepare("SELECT name FROM folders WHERE id = ?");
    $stmt->bind_param("i", $folderId);
    $stmt->execute();
    $stmt->bind_result($folderName);
    $stmt->fetch();
    $stmt->close();
}

// Tentukan path folder upload
$uploadDir = "uploads/";
if ($folderName !== '') {
    $uploadDir .= $folderName . "/";
}

// Buat folder jika belum ada
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Periksa apakah ada file dikirim
if (!isset($_FILES["files"])) {
    die("Tidak ada file yang dikirim.");
}

$files = $_FILES["files"];
$jumlahFile = count($files["name"]);

for ($i = 0; $i < $jumlahFile; $i++) {
    $filename = basename($files["name"][$i]);
    $tmpName = $files["tmp_name"][$i];
    $error = $files["error"][$i];

    // Debug: tampilkan error
    if ($error !== UPLOAD_ERR_OK) {
        echo "<p><strong>$filename:</strong> Gagal upload - ";
        switch ($error) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                echo "Ukuran file terlalu besar.</p>";
                break;
            case UPLOAD_ERR_PARTIAL:
                echo "File hanya terunggah sebagian.</p>";
                break;
            case UPLOAD_ERR_NO_FILE:
                echo "Tidak ada file yang diunggah.</p>";
                break;
            default:
                echo "Error kode $error.</p>";
        }
        continue;
    }

    $targetFile = $uploadDir . time() . "_" . $filename;

    // Pindahkan file
    if (!move_uploaded_file($tmpName, $targetFile)) {
        echo "<p><strong>$filename:</strong> Gagal menyimpan file ke folder.</p>";
        continue;
    }

    // Simpan ke database
    $stmt = $conn->prepare("INSERT INTO files (filename, filepath, folder_id) VALUES (?, ?, ?)");
    if (!$stmt) {
        echo "<p><strong>$filename:</strong> Gagal menyimpan ke database (prepare): " . $conn->error . "</p>";
        continue;
    }

    $stmt->bind_param("ssi", $filename, $targetFile, $folderId);
    if (!$stmt->execute()) {
        echo "<p><strong>$filename:</strong> Gagal menyimpan ke database (execute): " . $stmt->error . "</p>";
        continue;
    }

    echo "<p><strong>$filename:</strong> Berhasil diupload!</p>";
}

echo "<br><a href='index.php'>← Kembali ke halaman utama</a>";
?>
