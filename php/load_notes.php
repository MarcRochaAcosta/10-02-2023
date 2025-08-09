<?php
$notesFile = __DIR__ . '/notes.txt';

header('Content-Type: application/json; charset=UTF-8');

if (file_exists($notesFile)) {
    $lines = file($notesFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $notes = [];
    foreach ($lines as $line) {
        $parts = explode('||', $line);
        if (count($parts) === 2) {
            $notes[] = ['text' => $parts[0], 'date' => $parts[1]];
        }
    }
    echo json_encode($notes, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([]);
}
