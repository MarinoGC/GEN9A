<?php
//werk_3.php ,een bewerkt md-file wegschrijven en daarna alle weer inlezen zoals in prepare_1.php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type");

$body = file_get_contents("php://input");
//$ext = json_decode($body);
$ext1 = json_decode($body, true);

//_____________________________________schrijf de veranderde gegevens van de desbetreffende file weg
$content1 = $ext1['content1'];
$content2 = $ext1['content2'];
$veld = $ext1['veldNu'];
$pag = $ext1['pagNu'];
$veldenM = intval($ext1['velden']);
$pagM = intval($ext1['pag']);
$titel = $ext1['titel'];
$volgnr = intval($ext1['volgnr']);

$sub = (object)['content1' => $content1, 'content2' => $content2, 'veld' => $veld, 'pag' => $pag, 'titel' => $titel, 'volgnr' => $volgnr];
$veldL = str_pad($veld,2,"0",STR_PAD_LEFT);

$NowDir = getcwd();

$FileDir = $NowDir . '/werk/';
$FileName = $FileDir . $pag . $veldL . '.md';

unlink($FileName);
$myFile = fopen($FileName, 'w') or die('unable to open file');
fwrite($myFile, json_encode($sub));
fclose($myFile);
//chmod($myFile, 0777);

//____________________________________wacht 1 sec om de vorige acties af te maken
sleep(1);
//____________________________________lees alle werkfiles in en lever ze uit
$count = 0;
$data = [];
$idN = 0;
$val0 = [];

$myDirectory = opendir($FileDir);
while($entryName = readdir($myDirectory)) {
    if (substr("$entryName", 0, 1) != ".") {
        $ext = strtolower(pathinfo($entryName, PATHINFO_EXTENSION));
        if ( $ext == 'md' ) {                                                                  // continue only if this is a md file
            $filename = $FileDir . $entryName;

            $handle = fopen($filename, "r");
            $contents = fread($handle, filesize($filename));
            fclose($handle);

            $cc = json_decode($contents, true);
            $iVeld = intval($cc['veld']);
            $iPag = intval($cc['pag']);
            $idN = $iVeld + $iPag * $veldenM;

            array_push($data, $cc);
            array_push($val0, $idN);

            $count++;
        }
    }
}
closedir($myDirectory);


//sorteren op de $val0-waarde
if ($count > 0) {
    $n = 0;
    while ($n < ($count - 1)) {
        if ($val0[$n] > $val0[$n + 1]) {
            $A = $val0[$n];
            $val0[$n] = $val0[$n + 1];
            $val0[$n + 1] = $A;

            $m = $data[$n];
            $data[$n] = $data[$n + 1];
            $data[$n + 1] = $m;

            $n = -1;
        }
        $n++;
    }
}
//ontbrekende md files aanmaken
$count = 0;
$ext1 = [];
$ext1Sort = [];
for ($i = 0; $i < $pagM; $i++) {
    $ext = [];
    $mdInv = [];
    $iS = strval($i);
    for ($j = 0; $j < $veldenM; $j++) {
        $jS = str_pad(strval($j),2,"0",STR_PAD_LEFT);
        $idN = $j + $i * $veldenM;
        if ($val0[$count] === $idN) {
            $count++;
            $sub = (object)['content1' => $data[$idN]['content1'], 'content2' => $data[$idN]['content2'], 'veld' => $jS, 'pag' => $iS, 'titel' => $data[$idN]['titel'], 'volgnr' => $data[$idN]['volgnr']];
            array_push($ext, $sub);
            if ($data[$idN]['volgnr'] > -1) {
                array_push($mdInv, ['content1' => $data[$idN]['content1'], 'content2' => $data[$idN]['content2'], 'veld' => $jS, 'pag' => $iS, 'titel' => $data[$idN]['titel'], 'volgnr' => $data[$idN]['volgnr']]);
            }
        }  else {
            $empty = (object)['content1' => '', 'content2' => '', 'veld' => $jS, 'pag' => $iS, 'titel' => '', 'volgnr' => -1];
            array_push($ext, $empty);
            $empty1 = json_encode($empty);
            $myFileName = $FileDir . $iS . $jS . '.md';
            $myFile = fopen($myFileName, 'w') or die('unable to open file');
            fwrite($myFile, $empty1);
            fclose($myFile);
            chmod($myFile, 0777);
        }
    }
    array_push($ext1, $ext);
    sortArrayByKey($mdInv, 'volgnr', false);
    array_push($ext1Sort, $mdInv);
}

//____________maak de nieuwe gefilterde en gesorteerde 'docSort.md' file aan_____________
$ext2 = json_encode($ext1Sort);
$mdFile = $NowDir . '/inventarisatie/docSort.md';
$myFile = fopen($mdFile, 'w') or die('unable to open file');
fwrite($myFile, $ext2);
fclose($myFile);
chmod($myFile, 0755);

//____________maak de nieuwe 'documenten.md' file aan_____________
$ext2 = json_encode($ext1);
$mdFile = $NowDir . '/inventarisatie/documenten.md';
$myFile = fopen($mdFile, 'w') or die('unable to open file');
fwrite($myFile, $ext2);
fclose($myFile);
chmod($myFile, 0755);

echo $ext2;
return;

//____________________________________________________________________
//____________________________________________________________________sorteer functie
function sortArrayByKey(&$array,$key,$string = false,$asc = true){
    if($string){
        usort($array,function ($a, $b) use(&$key,&$asc)
        {
            if($asc)    return strcmp(strtolower($a[$key]), strtolower($b[$key]));
            else        return strcmp(strtolower($b[$key]), strtolower($a[$key]));
        });
    }else{
        usort($array,function ($a, $b) use(&$key,&$asc)
        {
            if($a[$key] == $b[$key]){return 0;}
            if($asc) return ($a[$key] < $b[$key]) ? -1 : 1;
            else     return ($a[$key] > $b[$key]) ? -1 : 1;

        });
    }
}

