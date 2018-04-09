<?php
header('Access-Control-Allow-Origin: *');
//albumWrite.php

$body = file_get_contents("php://input");
$ext = json_decode($body, true);
$goalDir = $ext['loc'];
$album = $ext['info'];

$newMd = [];

$l = sizeof($album);
for ($n = 0; $n < $l; $n++) {
    $item = ['name' => $album[$n]['name'], 'id' => $album[$n]['id'], 'sel' => $album[$n]['sel']];
    array_push($newMd, $item);
}

$mdFile = $goalDir . 'album.md';
$myFile = fopen($mdFile, 'w') or die('unable to open file');
fwrite($myFile, json_encode($newMd, true));
fclose($myFile);
chmod($myFile, 0755);

echo(json_encode('new album.md file written'));

return;
