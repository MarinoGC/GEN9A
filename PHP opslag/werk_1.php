<?php
//werk_1.php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type");

require('Parsedown.php');

$body = file_get_contents("php://input");
//_______________________________hier begint het markdown proces, input $body

$Parsedown = new Parsedown();
$mark = $Parsedown->text($body);

//_______________________________hier eindigt het markdown proces, output $mark
$ext = json_encode($mark);

echo $ext;

return;
