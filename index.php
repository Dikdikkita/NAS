<?php include 'config.php'; ?>
<!DOCTYPE html>
<html>
<head>
    <title>NAS File Manager</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        h2, h3 { margin-top: 30px; }
        #progressBar { width: 100%; height: 20px; background: #eee; margin-top: 10px; border-radius: 5px; overflow: hidden; }
        #progressBar div { height: 100%; width: 0; background: #4CAF50; text-align: center; color: white; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #aaa; padding: 8px; text-align: left; }
        ul { margin-top: 10px; }
        .folder { margin: 5px 0; }
    </style>
</head>
<body>

<h2>NAS File Manager</h2>

<!-- Form Buat Folder -->
<form action="create_folder.php" method="post" style="margin-bottom: 20px;">
    <input type="text" name="folder_name" placeholder="Nama Folder Baru" required>
    <button type="submit">+ Buat Folder</button>
</form>

<!-- Form Upload File -->
<form id="uploadForm" enctype="multipart/form-data">
    <div id="dropzone" style="border: 2px dashed #aaa; padding: 30px; text-align: center; margin-bottom: 15px; background: #f9f9f9;">
        <p>Drag & drop file ke sini atau klik untuk memilih file</p>
        <input type="file" name="files[]" id="fileInput" multiple style="display: none;">
        <button type="button" onclick="document.getElementById('fileInput').click()">Pilih File</button>
    </div>
    <label>Upload ke folder:</label>
    <select name="folder_id" id="folderSelect">
        <option value="">(root)</option>
        <?php
        $folders = $conn->query("SELECT * FROM folders ORDER BY name");
        while ($folder = $folders->fetch_assoc()) {
            echo "<option value='{$folder['id']}'>{$folder['name']}</option>";
        }
        ?>
    </select>
    <button type="submit">Upload File</button>
</form>

<!-- Preview & Progress -->
<div id="file-list"></div>
<div id="progressBar"><div id="progressValue">0%</div></div>
<div id="uploadStatus"></div>

<script>
document.getElementById('fileInput').addEventListener('change', function () {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = "<h4>File yang dipilih:</h4><ul>";
    for (let file of this.files) {
        fileList.innerHTML += `<li>${file.name}</li>`;
    }
    fileList.innerHTML += "</ul>";
});

document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData();
    const files = document.getElementById('fileInput').files;
    const folderId = document.getElementById('folderSelect').value;

    for (let i = 0; i < files.length; i++) {
        formData.append("files[]", files[i]);
    }
    formData.append("folder_id", folderId);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'upload.php', true);

    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            const progressBar = document.getElementById('progressValue');
            progressBar.style.width = percent + '%';
            progressBar.textContent = percent + '%';
        }
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            document.getElementById('uploadStatus').innerHTML = xhr.responseText;
        } else {
            document.getElementById('uploadStatus').innerHTML = "Upload gagal.";
        }
        document.getElementById('progressValue').style.width = '0%';
        document.getElementById('progressValue').textContent = '0%';
        document.getElementById('fileInput').value = '';
        document.getElementById('file-list').innerHTML = '';
    };

    xhr.send(formData);
});
</script>
<script>
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('file-list');
    let droppedFiles = []; // simpan file hasil drag & drop

    dropzone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropzone.style.background = '#e0f7fa';
    });

    dropzone.addEventListener('dragleave', function () {
        dropzone.style.background = '#f9f9f9';
    });

    dropzone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropzone.style.background = '#f9f9f9';

        droppedFiles = Array.from(e.dataTransfer.files); // simpan file drag & drop
        previewFiles(droppedFiles);
    });

    fileInput.addEventListener('change', function () {
        droppedFiles = Array.from(this.files); // ambil file dari file input
        previewFiles(droppedFiles);
    });

    function previewFiles(files) {
        fileList.innerHTML = "<h4>File yang dipilih:</h4><ul>";
        for (let file of files) {
            fileList.innerHTML += `<li>${file.name}</li>`;
        }
        fileList.innerHTML += "</ul>";
    }

    document.getElementById('uploadForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData();
        const folderId = document.getElementById('folderSelect').value;

        droppedFiles.forEach(file => {
            formData.append("files[]", file);
        });

        formData.append("folder_id", folderId);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'upload.php', true);

        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                const progressBar = document.getElementById('progressValue');
                progressBar.style.width = percent + '%';
                progressBar.textContent = percent + '%';
            }
        };

        xhr.onload = function () {
            if (xhr.status === 200) {
                document.getElementById('uploadStatus').innerHTML = xhr.responseText;
            } else {
                document.getElementById('uploadStatus').innerHTML = "Upload gagal.";
            }
            document.getElementById('progressValue').style.width = '0%';
            document.getElementById('progressValue').textContent = '0%';
            fileInput.value = '';
            fileList.innerHTML = '';
            droppedFiles = [];
        };

        xhr.send(formData);
    });
</script>

<!-- Folder List -->
<h3>Daftar Folder</h3>
<?php
$folders = $conn->query("SELECT * FROM folders ORDER BY name");
if ($folders->num_rows > 0) {
    echo "<ul>";
    while ($folder = $folders->fetch_assoc()) {
        echo "<li class='folder'><strong>{$folder['name']}</strong>
            <a href='delete_folder.php?id={$folder['id']}' onclick=\"return confirm('Yakin hapus folder ini?')\">[hapus]</a></li>";
    }
    echo "</ul>";
} else {
    echo "<p><em>Belum ada folder.</em></p>";
}
?>

<!-- File List -->
<h3>Daftar File</h3>
<h3>Filter Folder untuk Menampilkan File</h3>
<form method="get" style="margin-bottom: 10px;">
    <select name="filter_folder" onchange="this.form.submit()">
        <option value="">Tampilkan semua folder</option>
        <?php
        $folders = $conn->query("SELECT * FROM folders ORDER BY name");
        while ($folder = $folders->fetch_assoc()) {
            $selected = (isset($_GET['filter_folder']) && $_GET['filter_folder'] == $folder['id']) ? "selected" : "";
            echo "<option value='{$folder['id']}' $selected>{$folder['name']}</option>";
        }
        ?>
    </select>
</form>
<table>
<tr>
    <th>Nama File</th>
    <th>Folder</th>
    <th>Waktu Upload</th>
    <th>Aksi</th>
</tr>
<?php
$filterFolder = $_GET['filter_folder'] ?? '';

if ($filterFolder !== '') {
    $stmt = $conn->prepare("SELECT f.*, fo.name AS folder_name FROM files f
        LEFT JOIN folders fo ON f.folder_id = fo.id
        WHERE f.folder_id = ?
        ORDER BY f.uploaded_at DESC");
    $stmt->bind_param("i", $filterFolder);
} else {
    $stmt = $conn->prepare("SELECT f.*, fo.name AS folder_name FROM files f
        LEFT JOIN folders fo ON f.folder_id = fo.id
        ORDER BY f.uploaded_at DESC");
}

$stmt->execute();
$result = $stmt->get_result();

while ($file = $result->fetch_assoc()) {
    echo "<tr>
        <td>{$file['filename']}</td>
        <td>" . ($file['folder_name'] ?? '(root)') . "</td>
        <td>{$file['uploaded_at']}</td>
        <td>
            <a href='{$file['filepath']}' download>Download</a> |
            <a href='delete.php?id={$file['id']}' onclick=\"return confirm('Yakin hapus file ini?')\">Hapus</a>
        </td>
    </tr>";
}
$stmt->close();

while ($file = $files->fetch_assoc()) {
    echo "<tr>
        <td>{$file['filename']}</td>
        <td>" . ($file['folder_name'] ?? '(root)') . "</td>
        <td>{$file['uploaded_at']}</td>
        <td>
            <a href='{$file['filepath']}' download>Download</a> |
            <a href='delete.php?id={$file['id']}' onclick=\"return confirm('Yakin hapus file ini?')\">Hapus</a>
        </td>
    </tr>";
}
?>
</table>

</body>
</html>
