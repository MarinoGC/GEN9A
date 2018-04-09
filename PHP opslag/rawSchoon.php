<?PHP
header('Access-Control-Allow-Origin: *');
//rawSchoon.php

$body = file_get_contents("php://input");
//$tus = json_decode($body);
$ext = json_decode($body, true);

$NowDir = getcwd();
$raw = $ext['goal'];
$rawDir = $NowDir . '/' . $raw;
$fileGood = [];
$fileBad = [];

foreach (scandir($rawDir) as $node) {
  $ext = strtolower(pathinfo($node, PATHINFO_EXTENSION));
  if ($node == '.' || $node == '..' || $ext == 'ds_store') continue;
  if (($ext == 'jpg') || ($ext == 'jpeg') || ($ext == png)) {
    array_push($fileGood, $node);
  } else {
    unlink($rawDir . '/' . $node);
    array_push($fileBad, $node);
  }
}

$res = (object) ['fileGood' => $fileGood, 'fileBad' => $fileBad];
$ext1 = json_encode($res);
echo $ext1;
return;
