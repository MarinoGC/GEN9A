<?PHP
header('Access-Control-Allow-Origin: *');
//inventRaw.php

$body = file_get_contents("php://input");
$ext = json_decode($body, true);
$rawDir = $ext['source'];
$thumbDir = $ext['goal2'];
$invDir = $ext['goal1'];
$NowDir = getcwd();

$actueelRaw = $NowDir . '/' . $rawDir;
$diepteStart = sizeof(explode('/', $actueelRaw));
$contents = array();
$short = array();
$long = array();
$counter = 0;

dirToArray1($rawDir);
$rawShort = $short;
$rawLong = $long;

//__________________________________________________
if (!is_dir($thumbDir)) {
    mkdir ($thumbDir, 0755);
}
//__________________________________________________
$actueelInv = $NowDir . '/' . $invDir;
$diepteStart = sizeof(explode('/', $actueelInv));
$contents = array();
$short = array();
$long = array();
$counter = 0;
dirToArray1($invDir);
$invShort = $short;
$invLong = $long;

$eraseDir = $NowDir . '/eraseInv';
if (!is_dir($eraseDir)) {
    mkdir ($eraseDir, 0755);
}
for ($n = 0; $n < sizeof($invShort); $n++) {
    $weg = true;
    for ($m = 0; $m < sizeof($rawShort); $m++) {
        if ($rawShort[$m] == $invShort[$n]) {
            $weg = false;
            $m = sizeof($rawShort);
        }
    }
    if ($weg) {
        $x = $NowDir . '/' . $invLong[$n];
        $y = $eraseDir . '/' . $invShort[$n];
        rename($x , $y);
    }
}

$writeInv = [];
for ($n = 0; $n < sizeof($rawShort); $n++) {
    $weg = true;
    for ($m = 0; $m < sizeof($invShort); $m++) {
        if ($rawShort[$n] == $invShort[$m]) {
            $weg = false;
            $m = sizeof($invShort);
        }
    }
    if ($weg) {
        array_push($writeInv, $rawShort[$n]);
    }
}
//__________________________________________________
$actueelThumb = $NowDir . '/' . $thumbDir;
$diepteStart = sizeof(explode('/', $actueelThumb));
$contents = array();
$short = array();
$long = array();
$counter = 0;
dirToArray1($thumbDir);
$thumbShort = $short;
$thumbLong = $long;

$eraseDir = $NowDir . '/eraseThumb';
if (!is_dir($eraseDir)) {
    mkdir ($eraseDir, 0755);
}
for ($n = 0; $n < sizeof($thumbShort); $n++) {
    $weg = true;
    for ($m = 0; $m < sizeof($rawShort); $m++) {
        if ($rawShort[$m] == $thumbShort[$n]) {
            $weg = false;
            $m = sizeof($rawShort);
        }
    }
    if ($weg) {
        $x = $NowDir . '/' . $thumbLong[$n];
        $y = $eraseDir . '/' . $thumbShort[$n];
        rename($x , $y);
    }
}

$writeThumb = [];
for ($n = 0; $n < sizeof($rawShort); $n++) {
    $weg = true;
    for ($m = 0; $m < sizeof($thumbShort); $m++) {
        if ($rawShort[$n] == $thumbShort[$m]) {
            $weg = false;
            $m = sizeof($thumbShort);
        }
    }
    if ($weg) {
        array_push($writeThumb, $rawShort[$n]);
    }
}
//__________________________________________________
$actie = ['writeInv' => $writeInv, 'writeThumb' => $writeThumb];

//______________________________________________________________________
echo(json_encode($actie));
return;
//___________________________________________________________________________
//___________________________________________________________________________
function dirToArray1($dir) {
    global $diepteStart;
    global $pathTot;
    global $counter;
    global $contents;
    global $short;
    global $long;
    $path = explode('/', $dir);
    $pathShort = "";
    $diepteNow = sizeof($path);

    for ($n = ($diepteStart - 1); $n < $diepteNow; $n++) {
        $pathShort = $pathShort . $path[$n] . "/";
    }
//    $pathNow = "./" . $pathShort;
    array_push($pathTot, $pathShort);

    $counter = 0;
    foreach (scandir($dir) as $node) {
        $ext = strtolower(pathinfo($node, PATHINFO_EXTENSION));
        if ($node == '.' || $node == '..' || $ext == 'ds_store' || $ext == 'md') continue;
        if (is_dir($dir . '/' . $node)) {
            $contents[$node] = dirToArray1($dir . '/' . $node);
        } else {
            $contents[] = $node;
            $counter++;
            array_push($short, $node);
            array_push($long, $dir . '/' . $node);
        }
    }
    return;
}

//___________________________________________________________________________
