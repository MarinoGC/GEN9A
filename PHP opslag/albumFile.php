<?php
header('Access-Control-Allow-Origin: *');
//albumFile.php

$body = file_get_contents("php://input");
$info = json_decode($body, true);
$mdTot = [];
$goalDir ='./album';
$albumSel = [];
$weesMd = [];
$weesImg = [];
$mdInv = [];

$sourceFile = $info['path'] . $info['name'];

//_____________de geselecteerde file (zonodig) copieren naar 'album'

if (!file_exists($goalDir)) {
    mkdir($goalDir, 0777);
}

if (!file_exists($goalDir . '/restrict')) {
    mkdir($goalDir . '/restrict', 0777);
}

if (!file_exists($goalDir . '/thumb')) {
    mkdir($goalDir . '/thumb', 0777);
}

$new = false;
$goalFile = $goalDir . '/restrict/' . $info['name'];
if (!file_exists($goalFile)) {
    copy($sourceFile, $goalFile);
    $new = true;
}

if ($new) {
    $res = (object) ['name' => $info['name'], 'new' => true, 'melding'=> ' gecopieerd'];
} else {
    $res = (object) ['name' => $info['name'], 'sel' => false, 'melding'=> ' al aanwezig'];
}

echo(json_encode($res));

return;
