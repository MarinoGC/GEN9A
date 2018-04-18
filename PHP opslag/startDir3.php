<?PHP
header('Access-Control-Allow-Origin: *');
//startDir3.php

$body = file_get_contents("php://input");
$ext = json_decode($body, true);

$NowDir = getcwd();
$locatie = $ext['loc'];
$short = $ext['short'];
$loc = $locatie;
$DataDir = $NowDir . '/' . $locatie;

//==========================================================================
if ($short) {
    $InfoFile = $DataDir . '/' . 'DataInfoShort.md';
} else {
    $InfoFile = $DataDir . '/' . 'DataInfo.md';
}

$init1 = !(file_exists($InfoFile));

$diepteStart = sizeof(explode('/', $DataDir));
$diepteDif = 0;
//___________________________________________________________________________

$res = dirToArray($DataDir);

$contents1 = new StdClass();
$pathTot = array();
dirToArray1($DataDir);

$res1 = listFolders($NowDir, $locatie);

$count = 0;
$counter = 0;
$tree = array();
$res2 = listFoldersShort($NowDir, $locatie);
//___________________________________________________________________________
$max = sizeof($res2);
$menu1 = array();
$menu1Filter = array();
$menu2 = array();
$menu2Filter = array();

for ($n=0; $n < $max; $n++) {
    $pieces = explode('/', $res2[$n]);
    $l = sizeof($pieces);

    $level2 = array([], []);
    $level2[0] = $pieces[$l-2];
    $level2[1] = $pieces[$l-1];

    array_push($menu1, $level2);
    if (!filterRes($level2[0]) && !filterRes($level2[1])) {
        array_push($menu1Filter, $level2);
    }

    $levelT = array();
    for ($m=0; $m < $l; $m++) {
        array_push($levelT, $pieces[$m]);
    }
    array_push($menu2, $levelT);
    if (!filterRes($level2[0]) && !filterRes($level2[1])) {
        array_push($menu2Filter, $level2);
    }
}

//___________________________________________________________________________
if ($short) {
    $dirFile = $NowDir . '/' . $locatie . '/directoryShort.md';
} else {
    $dirFile = $NowDir . '/' . $locatie . '/directory.md';
}

if (file_exists($dirFile)) {
    $myFile = fopen($dirFile, "rb") or die('unable to open file');
    $tus= fread($myFile, filesize($dirFile));
    fclose($myFile);
    $menu1Old = json_decode($tus, true);
    if (sizeof($menu1Old) == sizeof($menu1)) {
        $menu1 = $menu1Old;
    }
}

$element = ['menu1' => [], 'menu2' => [], 'color' => [], 'visible' => false];
$filter = [];
for ($n = 0; $n < $res[1]; $n++) {
    array_push($filter, $element);
}

//___________________________________________________________________________
$ext = (object) ['contents' => $contents1,
    'diepte' => $res[1],
    'menu1' => $menu1,
    'loc' => $loc,
    'nr' => $count,
    'structure' => $pathTot,
    'prepath' => $NowDir,
    'filter' => $filter];
$ext1 = json_encode($ext);

//leg een extra DataInfo file aan
$myFile = fopen($InfoFile, "w") or die("Unable to open file!");
fwrite($myFile, $ext1);
fclose($myFile);

echo $ext1;
return;
//___________________________________________________________________________
function filterRes($plek) {
    return ($plek == 'opslag' || $plek == 'trash' || $plek == 'wachtkamer' || $plek == 'show');
}
//___________________________________________________________________________
//___________________________________________________________________________
function dirToArray($dir) {
    global $diepteStart;
    global $diepteDif;
    global $contents1;
    global $count;
    global $counter;
    global $short;
    global $NowDir;
    $pathTot = array();
    $contents = array();
    $contentsTus = array();
    $path = explode('/', $dir);
    $pathNow = "./";
    $diepteNow = sizeof($path);

    if ($diepteDif < ($diepteNow - $diepteStart)) {
        $diepteDif = $diepteNow - $diepteStart;
    }

    for ($n = ($diepteStart - 1); $n < $diepteNow; $n++) {
        $pathNow = $pathNow . $path[$n] . "/";
    }
    array_push($pathTot, $pathNow);

    $counter = 0;
    foreach (scandir($dir) as $node) {
        $ext = strtolower(pathinfo($node, PATHINFO_EXTENSION));
        if ($node == '.' || $node == '..' || $ext == 'ds_store' || $ext == 'md') continue;
        if (filterRes($node) && $short) continue;
        if (is_dir($dir . '/' . $node)) {
            $contents[$node] = dirToArray($dir . '/' . $node);
            $count++;
        } else {
            $contents[] = $node;
            list($width, $height) = getimagesize(($dir . '/' . $node));
            $contentsTus[] = (object)  ['name' => $node,
                'nr' => $counter,
                'sel' => false,
                'width' => $width,
                'height' => $height];
            $counter++;
        }
    }
    if (sizeof($contentsTus) > 0) {
        $contents1-> {$pathNow} = $contentsTus;
    }
    return [$contents, $diepteDif];
}

//___________________________________________________________________________
function dirToArray1($dir) {
    global $diepteStart;
    global $contents1;
    global $pathTot;
    global $counter;
    global $short;
    global $NowDir;
    $contents = array();
    $contentsTus = array();
    $path = explode('/', $dir);
    $pathShort = "";
    $diepteNow = sizeof($path);

    array_push($contentsTus, ['upToDate' => false]);

    for ($n = ($diepteStart - 1); $n < $diepteNow; $n++) {
        $pathShort = $pathShort . $path[$n] . "/";
    }
    $pathNow = "./" . $pathShort;
    array_push($pathTot, $pathShort);

    $counter = 0;
    foreach (scandir($dir) as $node) {
        $ext = strtolower(pathinfo($node, PATHINFO_EXTENSION));
        if ($node == '.' || $node == '..' || $ext == 'ds_store' || $ext == 'md') continue;
        if (filterRes($node) && $short) continue;
        if (is_dir($dir . '/' . $node)) {
            $contents[$node] = dirToArray1($dir . '/' . $node);
        } else {
            $contents[] = $node;
            list($width, $height) = getimagesize(($dir . '/' . $node));
            $contentsTus[] = (object)  ['name' => $node,
                'nr' => $counter,
                'sel' => false,
                'width' => $width,
                'height' => $height];
            $counter++;
        }
    }

//    if (sizeof($contentsTus) > 0) {
    $contents1->{$pathNow} = $contentsTus;
//    }
    return;
}

//___________________________________________________________________________
function listFolders($root, $locatie){
    global $ret_array;
    global $short;
    $dir = $root.'/'.$locatie;
    $dh = scandir($dir);
    foreach($dh as $folder){
        if($folder != '.' && $folder != '..')
        {
            if(is_dir($dir.'/'.$folder)){
                $ret_array[$locatie][]  = $locatie.'/'.$folder;
                if (filterRes($folder) && $short) continue;
                listFolders($root, $locatie.'/'.$folder);
            }
        }
    }
    return $ret_array;
}
//___________________________________________________________________________
function listFoldersShort($root, $locatie){
    global $count;
    global $tree;
    global $short;
    $dh = scandir($root . '/' . $locatie);
    foreach ($dh as $folder) {
        if ($folder != '.' && $folder != '..') {
            if (is_dir($root . '/' . $locatie . '/' . $folder)) {
                if (filterRes($folder) && $short) continue;
                array_push($tree, $locatie . '/' . $folder);
                $count++;
                listFoldersShort($root, $locatie . '/' . $folder);
            }
        }
    }
    return $tree;
}
//___________________________________________________________________________
