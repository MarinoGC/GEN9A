<?PHP
header('Access-Control-Allow-Origin: *');
//trash.php

$body = file_get_contents("php://input");
//$tus = json_decode($body);
$ext = json_decode($body, true);

$NowDir = getcwd();

$locDir = $NowDir . $ext['loc'];
$rawDir = $NowDir. $ext['raw'];
$mdDir = $NowDir . $ext['md'];
$thumbDir = $NowDir . $ext['thumb'];
$trashDir = $NowDir . $ext['trash'];

$eraseRaw = $NowDir . '/eraseRaw';
if (!is_dir($eraseRaw)) {
    mkdir ($eraseRaw, 0755);
}
$eraseMd = $NowDir . '/eraseMd';
if (!is_dir($eraseMd)) {
    mkdir ($eraseMd, 0755);
}

$files = array();
dirToArray($locDir);

$deleted = [];

for ($n = 0; $n < sizeof($files); $n++) {
    $rawPictFile = $rawDir . $files[$n];
    $erasePictFile = $eraseRaw . '/' . $files[$n];
    if (file_exists($rawPictFile)) {
        rename($rawPictFile, $erasePictFile);
    }

    $mdFile = pathinfo($files[$n], PATHINFO_FILENAME) . '.md';
    $mdPictFile = $mdDir . $mdFile;
    $erasePictFile = $eraseMd . '/' . $mdFile;
    if (file_exists($mdPictFile)) {
        rename($mdPictFile, $erasePictFile);
    }
}

$myFile = fopen($locDir . 'TRASH.md', 'w') or die('unable to open file');
$item = array();
fwrite($myFile, json_encode($item));
fclose($myFile);
chmod($myFile, 0755);

$res = json_encode($deleted);
echo($res);
return;
//__________________________________________________________________________
function dirToArray($dir) {
    global $files;

    foreach (scandir($dir) as $node) {
        $ext = strtolower(pathinfo($node, PATHINFO_EXTENSION));
        if ($node == '.' || $node == '..' || $ext == 'ds_store' || $ext == 'md') continue;
        if (!is_dir($dir . '/' . $node)) {
            array_push($files, $node);
        }
    }
    return;
}

