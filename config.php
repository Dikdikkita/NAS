<?php
$host = "localhost";
$user = "";
$pass = "";
$db = "nas";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}
?>
