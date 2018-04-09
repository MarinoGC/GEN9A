<?PHP
header('Access-Control-Allow-Origin: *');
//nodeMdWrite.php

$body = file_get_contents("php://input");
//$tus = json_decode($body);
$ext = json_decode($body, true);
$nav = $ext['nav'];
$path = getcwd() . $ext['path'];
$nodeInv = $path . $nav . '.md';

$storeFiles = $ext['fileSel'];
$actueelFiles = dirToArray($path);

if (file_exists($nodeInv)) {
    $myFile = fopen($nodeInv, "rb") or die('unable to open file');
    $nodeJson = fread($myFile, filesize($nodeInv));
    $nodeFiles = json_decode($nodeJson, true);
    fclose($myFile);
}
/*
Er zijn nu drie files, die info bevatten over de node en deze moeten gelijkstemmig zijn:

1) $actueelFiles De files aangetroffen in de node. Dit is de werkelijke situatie,
 maar gegevens over de volgorde of selectie ontbreken.

2) $storeFiles De files zoals ze in de data-store van de computer staan. Deze bevatten gegevens over de volgorde en de selectie.

3) $nodeFiles De gegevens zoals opgeschreven in de md-file in de node. Deze bevat gegevens over de volgorde.

de files in $nodeFiles en $actueelFiles moeten met elkaar kloppen, wat betreft aantal en naam.
$nodeFiles bevat daarnaast nog gegevens over de volgorde.
$storeFiles moet deze situatie weergeven en dient zich, bij afwijkingen, aan te passen.

Dus is de check:
VERGELIJK $nodeFiles en $actueelFiles
Afwijkingen kunnen ontstaan door verplaatsingen van files (shuffle-acties tussen directories)
of extern ingrijpen in de directory structuur of bugs.

TOEVOEGING: ER KUNNEN OOK AFWIJKINGEN ONTSTAAN DOORDAT INFO IS VERANDERD IN DE MD-GEGEVENS
BIJ EEN INDIVIDUEEL PLAATJE DOOR DE LATER TOEGEVOEGDE UITGEBREIDERE

Er zijn drie categorieen:
A)  Files, die in beiden voorkomen. Deze files worden in het eindresultaat ($resFiles) voorop gezet met als volgorde en sel
    die wordt voorgeschteven door $nodeFiles
B)  Files , die alleen in $nodeFiles voorkomen. Deze worden genegeerd in het eind resultaat.
C)  Files, die alleen in $actueelFiles voorkomen. Deze worden in willekeurige volgorde achteraan gezet in het eindresultaat.

Als CatB en CatC leeg zijn, hoeft de $nodeFile niet te worden aangepast

Dit eindresultaat zou moeten overeenkomen met $actueelFiles.
Indien dat het geval is, hoeft TREEMD niet te worden aangepast, anders moet het eind resultaat in TREEMD geschreven worden.
*/

//__________________________________________vergelijk $nodeFiles en $actueelFiles
$catA = array();
$catB = array();
$catC = array();
$count = 0;

$sizeNode = sizeof($nodeFiles);
$sizeActueel = sizeof($actueelFiles);

for ($n = 0; $n < $sizeNode; $n++) {
    $bingo = false;
    for ($m = 0; $m < $sizeActueel; $m++) {
        if ($actueelFiles[$m] == $nodeFiles[$n]['name']) {
            $bingo = true;
            $m = $sizeActueel;
        }
    }
    if ($bingo) {
        array_push($catA, $nodeFiles[$n]);
    } else {
        array_push($catB, $nodeFiles[$n]);
    }
}
for ($m = 0; $m < $sizeActueel; $m++) {
    $bingo = false;
    for ($n = 0; $n < $sizeNode; $n++) {
        if ($actueelFiles[$m] == $nodeFiles[$n]['name']) {
            $bingo = true;
            $n = $sizeNode;
        }
    }
    if (!$bingo) {
        array_push($catC,['name' => $actueelFiles[$m], 'nr' => $count, 'sel' => false]);
        $count++;
    }
}

//___________________________________________________________stel het eind resultaat $resFiles op
$resFiles = $catA;
$sizeRes = sizeof($resFiles);

for ($n = 0; $n < $sizeRes; $n++) {
    $resFiles[$n]['nr'] = $n;
    $resFiles[$n]['sel'] = false;
}
for ($n = 0; $n < sizeof($catC); $n++) {
    $item = ['name' => $catC[$n]['name'], 'nr' => $catC[$n]['nr'] + $sizeRes, 'sel' => false];
    array_push($resFiles, $item);
}
//___________________________________________________________vergelijk $resFiles met $storeFiles
$info[0] = ['upToDate' => true];
$infoTree = array();

$count = 0;
$storeSize = sizeof($storeFiles);
$resSize = sizeof($resFiles);
for ($i = 0; $i < $storeSize; $i++) {                //neem eerst de files, in de goede volgorde, die in de store-file voorkomen
    if ($storeFiles[$i]['name'] != '-') {
        for ($j = 0; $j < $resSize; $j++) {
            if ($resFiles[$j]['name'] == $storeFiles[$i]) {
                $item = ['name' => $storeFiles[$i]['name'], 'nr' => $count, 'sel' => $storeFiles[$i]['sel']];
                array_push($info, $item);
                $count++;
                $resFiles[$j]['name'] = '-';                     //markeer als verwerkt
                $j = $resSize;
            }
        }
    }
}
for ($j = 0; $j < $resSize; $j++) {             //voeg de overgebleven resFiles toe.
    if ($resFiles[$j]['name'] != '-') {
        array_push($info, $resFiles[$j]);
        $count++;
    }
}

//voeg extra informatie toe (breedte, hoogte, beschrijvings files)
$infoLong[0] = ['upToDate' => true];
for ($j = 1; $j < sizeof($info); $j++) {
    list($width, $height) = getimagesize($path . $info[$j]['name']);
    $mdInfo = mapMdInfo(getcwd() . '/md/' . pathinfo($info[$j]['name'], PATHINFO_FILENAME) . '.md');
    $contentsTus = ['name' => $info[$j]['name'],
                    'nr' => $j,
                    'sel' => false,
                    'width' => $width,
                    'height' => $height,
                    'extra' => $mdInfo[0],
                    'title1' => $mdInfo[1],
                    'alpha' => $mdInfo[2]];
    array_push($infoLong, $contentsTus);
}

//__________________________________________________________________
$ext1 = json_encode($infoLong);
$extTree1 = json_encode($infoTree);

//____________________________________________________________schrijf de nodeFile
$myFile = fopen($nodeInv, 'w') or die('unable to open file');
fwrite($myFile, $ext1);
fclose($myFile);
chmod($myFile, 0755);

//______________________________________________________________________
echo($ext1);
return;
//___________________________________________________________________________
//___________________________________________________________________________
function dirToArray($dir) {
    $contents = array();
    foreach (scandir($dir) as $node) {
        $ext = strtolower(pathinfo($node, PATHINFO_EXTENSION));
        if ($node == '.' || $node == '..' || $ext == 'ds_store' || $ext == 'md' || $ext == 'txt') continue;
        if (!is_dir($dir . '/' . $node)) {
            if ($node != 'trash') {
                array_push($contents, $node);
            }
        }
    }
    return $contents;
}
//___________________________________________________________________________
function mapMdInfo($pictFile){
    if (file_exists($pictFile)) {
        $myFile = fopen($pictFile, "rb") or die('unable to open file');
        $contJ = fread($myFile, filesize($pictFile));
        fclose($myFile);
        $contents = json_decode($contJ, true);
        if ($contents['extra'] == null) {$extra = '';} else {$extra = $contents['extra'];}
        if ($contents['title1'] == null) {$title1 = '';} else {$title1 = $contents['title1'];}
        if ($contents['alpha'] == null) {$alpha = 100;} else {$alpha = $contents['alpha'];}
        $cc = [$extra, $title1, $alpha];
    } else {
        $cc = ['', '', 100];
    }
    return $cc;
}
//___________________________________________________________________________
