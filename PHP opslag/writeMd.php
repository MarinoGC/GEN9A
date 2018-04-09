<?PHP
header('Access-Control-Allow-Origin: *');
//writeMd.php

$body = file_get_contents("php://input");
//$tus = json_decode($body);
$ext = json_decode($body, true);

$NowDir = getcwd();
$pictName = $ext['md'];
$infoMd = clean($ext['info']);
$title1 = clean($infoMd['title1']);
$alpha = clean($infoMd['alpha']);
$inhoud = clean($infoMd['inhoud']);
$extra = clean($infoMd['extra']);

$path = $ext['path'];

//$DataDir = $NowDir . '/' . $locatie;

$mdDir = getcwd() . '/md';
if (!is_dir($mdDir)) {
    mkdir ($mdDir, 0755);
}

$mdFile = $mdDir . '/' . pathinfo($pictName, PATHINFO_FILENAME) . '.md';
$ext = [];
$empty = (object) ['inhoud' => $inhoud, 'extra' => $extra, 'title1' => $title1, 'alpha' => $alpha];
array_push($ext, $empty);
$empty1 = json_encode($empty);
$myFile = fopen($mdFile, 'w') or die('unable to open file');
fwrite($myFile, $empty1);
fclose($myFile);
chmod($myFile, 0755);

$res = json_encode('written md-file: ' . $mdFile . '  |  ' . $NowDir );
echo($res);

return;

//_____________________
function clean($s) {
    if ($s == null) {
        return '';
    } else {
        return $s;
    }
}
