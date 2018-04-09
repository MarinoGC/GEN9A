<?PHP
header('Access-Control-Allow-Origin: *');
//readAlbumMd.php

$body = file_get_contents("php://input");
$ext = json_decode($body, true);

$NowDir = getcwd();
$loc = $ext['loc'];

$mdFile = getcwd() . $loc;

if (file_exists($mdFile)) {
    $myFile = fopen($mdFile, "rb") or die('unable to open file');
    $contents = fread($myFile, filesize($mdFile));
    fclose($myFile);

    $cc = json_decode($contents, true);
} else {
    $cc = (object) ['name' => 'leeg', 'id' => '-1', 'sel' => 'false'];
}

$res = json_encode($cc);
echo($res);

return;
