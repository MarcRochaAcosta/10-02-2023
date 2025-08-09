<?php
$notesFile = __DIR__ . '/notes.txt';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $note = trim($_POST['note'] ?? '');
    if ($note !== '') {
        $date = date('d/m/Y');
        $line = $note . "||" . $date . "\n";
        file_put_contents($notesFile, $line, FILE_APPEND | LOCK_EX);
    }
}
