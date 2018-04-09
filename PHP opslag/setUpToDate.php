<?PHP
header('Access-Control-Allow-Origin: *');
//setUpToDate.php

$body = file_get_contents("php://input");
$ext = json_decode($body, true);
$invDir = $ext['inv'];
$NowDir = getcwd();

//__________________________________________________
$actueelInv = $NowDir . '/' . $invDir;
$diepteStart = sizeof(explode('/', $actueelInv));
$nodeMd = "ROOT.md";

dirToArray3($invDir);

$actie = ['test'];

//______________________________________________________________________
echo(json_encode($actie));
return;
//___________________________________________________________________________
//___________________________________________________________________________
function dirToArray3($dir) {
    global $diepteStart;
    global $pathTot;
    global $counter;
    global $nodeMd;
    $path = explode('/', $dir);
    $pathShort = "";
    $diepteNow = sizeof($path);

    for ($n = ($diepteStart - 1); $n < $diepteNow; $n++) {
        $pathShort = $pathShort . $path[$n] . "/";
    }
    array_push($pathTot, $pathShort);

    $counter = 0;
    foreach (scandir($dir) as $node) {
        $ext = strtolower(pathinfo($node, PATHINFO_EXTENSION));
        if ($node == '.' || $node == '..' || $ext == 'ds_store') continue;
        if (is_dir($dir . '/' . $node)) {
            $nodeMd = strtoupper($node) . ".md";
            dirToArray3($dir . '/' . $node);
        } else {
            if ($node == $nodeMd) {    // node md-file gevonden
                $mdFile = $dir . "/" . $nodeMd;

                $myFile = fopen($mdFile, "rb") or die('unable to open file');
                $contents = json_decode(fread($myFile, filesize($mdFile)), true);
                fclose($myFile);

                $contents[0] = ['upToDate' => false];

                $myFile = fopen($mdFile, 'w') or die('unable to open file');
                fwrite($myFile, json_encode($contents));
                fclose($myFile);
                chmod($myFile, 0755);
            }
        }
    }
    return;
}
