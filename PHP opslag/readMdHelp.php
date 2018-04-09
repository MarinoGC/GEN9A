<?PHP
header('Access-Control-Allow-Origin: *');
//readMdHelp.php

$body = file_get_contents("php://input");
//$tus = json_decode($body);
$ext = json_decode($body, true);

$NowDir = getcwd();
$pictName = $ext['name'];

$mdFile = getcwd() . '/help/' . $ext['name'] . '.md';

if (file_exists($mdFile)) {
    $myFile = fopen($mdFile, "rb") or die('unable to open file');
    $contents = fread($myFile, filesize($mdFile));
    fclose($myFile);

    $cc = json_decode($contents, true);
} else {
    $cc = (object) ['help' => 'geen help file gevonden'];
}

$res = json_encode($cc);
echo($res);

return;
