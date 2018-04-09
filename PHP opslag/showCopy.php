<?PHP
header('Access-Control-Allow-Origin: *');
//showCopy.php

ini_set('memory_limit', '256M');    //veel geheugen om te kunnen copieren
set_time_limit(0);                  //neem de tijd

$body = file_get_contents("php://input");
$ext = json_decode($body, true);

$NowDir = getcwd() . '/';
$pathStart = explode('/', $NowDir);
$diepteStart = sizeof($pathStart);
$parentDir = '/';
for ($n = 1; $n < ($diepteStart - 2); $n++) {
    $parentDir = $parentDir . $pathStart[$n] . '/';
}

$showName = 'show';

$startDir = $NowDir . $showName;
$goalDir = $parentDir. $ext['test'] . '/' . $showName;

array_map('unlink', glob("$goalDir/*.*"));
rmdir($goalDir);
mkdir($goalDir, 0755);

foreach (scandir($startDir) as $node) {
    $ext = strtolower(pathinfo($node, PATHINFO_EXTENSION));
    if ($node == '.' || $node == '..' || $ext == 'ds_store') continue;
    copy(($startDir . '/' . $node), ($goalDir . '/' . $node));
}

//___________________________________________________________________________
echo(json_encode('show gecopieerd'));
return;
