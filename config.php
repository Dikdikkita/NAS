<?php
$host = "localhost";
$user = "dikakita";
$pass = "Dika_HD5";
$db = "nas";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}
?>
