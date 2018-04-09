<?PHP
header('Access-Control-Allow-Origin: *');
//readMd.php

$body = file_get_contents("php://input");
//$tus = json_decode($body);
$ext = json_decode($body, true);

$NowDir = getcwd();
$pictName = $ext['md'];

$mdFile = getcwd() . '/md/' . pathinfo($pictName, PATHINFO_FILENAME) . '.md';

if (file_exists($mdFile)) {
    $myFile = fopen($mdFile, "rb") or die('unable to open file');
    $contents = fread($myFile, filesize($mdFile));
    fclose($myFile);

    $cc = json_decode($contents, true);
} else {
    $cc = ['inhoud' => '', 'extra' => '', 'title1' => '', 'alpha' => 100];
}

$res = json_encode($cc);
echo $res;

return;
