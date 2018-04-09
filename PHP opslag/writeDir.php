<?PHP
header('Access-Control-Allow-Origin: *');
//writeDir.php

$body = file_get_contents("php://input");
//$tus = json_decode($body);
$ext = json_decode($body, true);

$locatie = $ext['loc'];
$menu1 = $ext['menu1'];

$NowDir = getcwd();
$DataFile = $NowDir . '/' . $locatie . '/directory.md';
$res = json_encode($menu1);

$myFile = fopen($DataFile, 'w') or die('unable to open file');
fwrite($myFile, $res);
fclose($myFile);
chmod($myFile, 0755);

$menu2 = [];
for ($n=0; $n<sizeof($menu1); $n++) {
 if (!(filterRes($menu1[$n][0])) && !(filterRes($menu1[$n][1]))) {
     array_push($menu2, $menu1[$n]);
 }
}

$DataFileF = $NowDir . '/' . $locatie . '/directoryShort.md';
$resF = json_encode($menu2);

$myFile = fopen($DataFileF, 'w') or die('unable to open file');
fwrite($myFile, $resF);
fclose($myFileF);
chmod($myFileF);

echo($res);
return;

//___________________________________________________________________________
function filterRes($plek) {
    return ($plek == 'opslag' || $plek == 'trash' || $plek == 'wachtkamer' || $plek == 'show');
}
