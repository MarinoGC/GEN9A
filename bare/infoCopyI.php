<?PHP
header('Access-Control-Allow-Origin: *');
//infoCopyI.php

ini_set('memory_limit', '256M');    //veel geheugen om te kunnen copieren
set_time_limit(0);                  //neem de tijd

$body = file_get_contents("php://input");
//$tus = json_decode($body);
$extTot = json_decode($body, true);
$data = $extTot[0];
$ext = $extTot[1];

$NowDir = getcwd() . '/';
$pathStart = explode('/', $NowDir);
$diepteStart = sizeof($pathStart);
$parentDir = '/';
for ($n = 1; $n < ($diepteStart - 2); $n++) {
    $parentDir = $parentDir . $pathStart[$n] . '/';
}

$pathLast = $NowDir;
$tree = [];

//___________________________________________________________________________
foreach ($ext as $element) {
    copyInfo($element);
}

//___________________________________________________________________________
echo(json_encode('info gecopieerd'));
return;
//___________________________________________________________________________
//___________________________________________________________________________
function copyInfo($dir) {
    global $parentDir;
    global $NowDir;
    global $data;
    $werk = $NowDir . $dir;
    $goalDir = $parentDir . $data . $dir;
    if (file_exists($goalDir)) {
        rrmdir($goalDir);
        rmdir($goalDir);
    }
    dirToArray1($werk);      // bouwt de directory structuur op in de goal directory
    dirToArray2($werk);
}
//___________________________________________________________________________
function dirToArray1($dir) {
    global $diepteStart;
    global $parentDir;
    global $pathLast;
    global $data;
    global $tree;

    $pathTot = array();
    $path = explode('/', $dir);
    $pathNow = "/";
    $diepteNow = sizeof($path);

    for ($n = ($diepteStart - 1); $n < $diepteNow; $n++) {
        $pathNow = $pathNow . $path[$n] . "/";
    }
    array_push($pathTot, $pathNow);

    foreach (scandir($dir) as $node) {
        $ext = strtolower(pathinfo($node, PATHINFO_EXTENSION));
        if ($node == '.' || $node == '..' || $ext == 'ds_store') continue;
        $plek = $path[sizeof($path) - 1];
        if (filterRes($plek)) continue;
        if (is_dir($dir . '/' . $node)) {
            dirToArray1($dir . '/' . $node);
        } else {
            $goalDir = $parentDir . $data . $pathNow;
//_________________________
//            if (!($ext == 'md' || $plek == 'thumb' || $plek == 'raw' || $plek == 'md' || $plek == 'werk')) {
                array_push($tree, pathinfo($node)['filename']);
//            }
//_________________________
            if ($pathNow != $pathLast) {
                checkGoalDir($goalDir, $diepteStart);
                $pathLast = $pathNow;
            }
        }
    }
    return;
}
//___________________________________________________________________________
function dirToArray2($dir) {
    global $diepteStart;
    global $parentDir;
    global $data;
    global $tree;

    $pathTot = array();
    $path = explode('/', $dir);
    $pathNow = "/";
    $diepteNow = sizeof($path);

    for ($n = ($diepteStart - 1); $n < $diepteNow; $n++) {
        $pathNow = $pathNow . $path[$n] . "/";
    }
    array_push($pathTot, $pathNow);

    foreach (scandir($dir) as $node) {
        $ext = strtolower(pathinfo($node, PATHINFO_EXTENSION));
        if ($node == '.' || $node == '..' || $ext == 'ds_store') continue;
        $plek = $path[sizeof($path) - 1];
        if (filterRes($plek)) continue;
        $source = $dir . '/' . $node;
        if (is_dir($source)) {
            dirToArray2($source);
        } else {
            $goal = $parentDir . $data . $pathNow . $node;
            $naam = pathinfo($node)['filename'];
            $plek = $path[sizeof($path) - 1];
            $strikt = ($plek == 'raw' || $plek == 'md' || $plek == 'thumb');
            if ($strikt) {
                for ($n = 0; $n < (sizeof($tree)); $n++) {
                    if ($naam == $tree[$n] && $strikt) {
                        copy($source, $goal);
                        $n = sizeof($tree);
                    }
                    $bingo = false;
                }
            } else {
                $bingo = true;
                copy($source, $goal);
            }

        }
    }
    return;
}
//___________________________________________________________________________
//___________________________________________________________________________
function checkGoalDir($goalDir, $diepteStart) {
    $path = explode('/', $goalDir);
    $pathIncrement = '/';
    for ($n = 1; $n < (sizeof($path) - 1); $n++) {
        $pathIncrement =  $pathIncrement . $path[$n] . '/';
        if ($n > ($diepteStart - 3)) {
            if (!file_exists($pathIncrement)) {
                mkdir($pathIncrement);
            }
        }
    }
    return;
}
//___________________________________________________________________________
function rrmdir($src) {
    $dir = opendir($src);
    while(false !== ( $file = readdir($dir)) ) {
        if (( $file != '.' ) && ( $file != '..' )) {
            $full = $src . '/' . $file;
            if ( is_dir($full) ) {
                rrmdir($full);
            }
            else {
                unlink($full);
            }
        }
    }
    closedir($dir);
    rmdir($src);
}
//___________________________________________________________________________
function filterRes($plek) {
    return ($plek == 'opslag' || $plek == 'trash' || $plek == 'wachtkamer' || $plek == 'show');
}
//___________________________________________________________________________
