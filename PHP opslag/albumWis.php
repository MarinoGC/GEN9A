<?php
header('Access-Control-Allow-Origin: *');
//albumWis.php | een kleine aanpassing aan 'albumWrite.php'

$body = file_get_contents("php://input");
$mdTot = [];
$startDirS = '/album';
$startDir ='.' . $startDirS;
$albumSel = [];
$thumbSel = [];
$weesMd = [];
$weesImg = [];
$mdInv = [];

$NowDir = getcwd();
$goalDir = $startDir . '/restrict';
$goalDirLong = $NowDir . $startDirS . '/restrict';
$thumbDir = $startDir . '/thumb';
$thumbDirLong = $NowDir . $startDirS . '/thumb';

imgInv($goalDir);

thumbInv($thumbDir);

$res = json_encode($mdInv);
echo($res);

return;

//______________________________________________________________________________________________________
//______________een inventarisatie van de image-files maken en deze checken tegen de md-file
function imgInv($goalDir)
{
    global $albumSel;
    global $weesMd;
    global $weesImg;
    global $mdInv;
    global $goalDirLong;
    $count = 0;

    //____________de image files in de md file bepalen
    // aanpassing t.o.v. 'albumWrite.php': indien zo'n image file een 'true' sel-waarde heeft,
    // deze image file negeren en de desbetreffende image file in de directory wissen. Deze actie wordt nu (in tegenstelling
    // tot 'albumWrite.php' eerst uitgevoerd.

    $mdFile = $goalDir . '/album.md';
    $imgTot = [];
    if (file_exists($mdFile)) {
        $myFile = fopen($mdFile, "rb") or die('unable to open file');
        $contents = fread($myFile, filesize($mdFile));
        fclose($myFile);
    }
    $cc = json_decode($contents, true);
    $lengte = sizeof($cc);
    for ($n = 0; $n < $lengte; $n++) {
        $item= $cc[$n];
        if ($item['sel']) {
            unlink($goalDirLong . '/' . $item['name']);     //de aanpassing
        } else {
            array_push($imgTot, $item);
        }
    };

    //_____________image files bepalen in de directory
    $albumTot = scandir($goalDir);
    for ($n = 0; $n < sizeof($albumTot); $n++) {
        if (!(substr($albumTot[$n], 0, 1) == '.') && !(pathinfo($albumTot[$n], PATHINFO_EXTENSION) == 'md')) {
            array_push($albumSel, $albumTot[$n]);
        }
    }

    //________de verweesde files in de md-file bepalen (en deze niet meenemen)
    $weesMd = [];
    for ($n = 0; $n < sizeof($imgTot); $n++) {
        $bingo = false;
        for ($m = 0; $m < sizeof($albumSel); $m++) {
            if ($imgTot[$n]['name'] == $albumSel[$m]) {
                $bingo = true;
                array_push($mdInv, ['name' => $imgTot[$n]['name'], 'id' => $imgTot[$n]['id'], 'sel' => $imgTot[$n]['sel']]);
                $count++;
                $m = sizeof($albumSel);
            }
        }
        if (!$bingo) {
            array_push($weesMd, $imgTot[$n]);
        }
    }

    //________$mdInv sorteren op id en deze voozien van oplopende nummers vanaf 0
    sortArrayByKey($mdInv, 'id', true);
    for ($n = 0; $n < sizeof($mdInv); $n++) {
        $mdInv[$n]['id'] = $n;
    }

    //________de verweesde files in de image-directory bepalen (en die toevoegen aan de md-file)
   $weesImg = [];
    for ($m = 0; $m < sizeof($albumSel); $m++) {
        $bingo = false;
        for ($n = 0; $n < sizeof($mdInv); $n++) {
            if ($mdInv[$n]['name'] == $albumSel[$m]) {
                $bingo = true;
                $n = sizeof($mdInv);
            }
        }
        if (!$bingo) {
            array_push($weesImg, $albumSel[$m]);
            array_push($mdInv, ['name' => $albumSel[$m], 'id' => $count, 'sel' => false]);
            $count++;
        }
    }

    //_______het eindresultaat schrijven in de md-file
    $myFile = fopen($mdFile, 'w') or die('unable to open file');
    fwrite($myFile, json_encode($mdInv, true));
    fclose($myFile);
    chmod($myFile, 0755);
}

//______________________________________________________________________________________________________
//______________een inventarisatie van de thumb-files maken en deze checken tegen de image-file
function thumbInv($thumbDir)
{   global $albumSel;
    global $thumbSel;
    global $goalDirLong;
    global $thumbDirLong;
    $count = 0;


    //_____________thumb files bepalen in de thumb directory
    $thumbTot = scandir($thumbDir);
    for ($n = 0; $n < sizeof($thumbTot); $n++) {
        if (!(substr($thumbTot[$n], 0, 1) == '.') && !(pathinfo($thumbTot[$n], PATHINFO_EXTENSION) == 'md')) {
            array_push($thumbSel, $thumbTot[$n]);
        }
    }

    //____________de verweesde thumb-files bepalen en deze wissen
    $weesThumb = [];
    for ($n = 0; $n < sizeof($thumbSel); $n++) {
        $bingo = false;
        for ($m = 0; $m < sizeof($albumSel); $m++) {
            if ($thumbSel[$n] == $albumSel[$m]) {
                $bingo = true;
                $m = sizeof($albumSel);
            }
        }
        if (!$bingo) {
            array_push($weesThumb, $thumbSel[$n]);
            unlink($thumbDir . '/' . $thumbSel[$n]);
        }
    }

    //___________de ontbrekende thumb-files bepalen en deze aanmaken
    $weesImg = [];
    for ($m = 0; $m < sizeof($albumSel); $m++) {
        $bingo = false;
        for ($n = 0; $n < sizeof($thumbSel); $n++) {
            if ($thumbSel[$n] == $albumSel[$m]) {
                $bingo = true;
                $n = sizeof($thumbSel);
            }
        }
        if (!$bingo) {
            array_push($weesImg, $albumSel[$m]);
            makeFile($goalDirLong . '/' . $albumSel[$m], $thumbDirLong . '/' . $albumSel[$m], $albumSel[$m], 120);
        }
    }
}


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

//_________________________________________________________________aanmaken thumfile
function makeFile($sourceDir, $goalDir, $goal, $res) {
    global $namePict;
    global $counterPict;
    global $doorgaan;
    global $max;

    $info = getimagesize($sourceDir);
    $mime = $info['mime'];

    switch ($mime) {
        case 'image/jpeg':
            $goalDirJ = $goalDir;
            $img = imagecreatefromjpegexif($sourceDir);
            break;

        case 'image/png':
            $goalDirJ = pathinfo($goalDir, PATHINFO_DIRNAME) . '/' . pathinfo($goalDir, PATHINFO_FILENAME) . '.jpg';
            $img = imagecreatefrompng($sourceDir);
            break;

        /*        case 'image/gif':
                    $img = 'imagecreatefromgif';
                    $image_save_func = 'imagegif';
                    $new_image_ext = 'gif';
                    break;
        */

        default:
            $counterPict++;
            $doorgaan = ($counterPict == $max);
            return;
//            throw new Exception('Unknown image type.');
    }

    list($width, $height) = getimagesize($sourceDir);
    $factor = ($res / $height);
    $newHeight = $res;
    $newWidth = $width * $factor;
    $tmp_img = imagecreatetruecolor($newWidth, $newHeight);                                     // create a new temporary image
    imagecopyresampled($tmp_img, $img, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);     // copy and resize old image into new image
    imagejpeg($tmp_img, $goalDirJ);
    chmod($goal, 0755);

    array_push($namePict, $goal);
    $counterPict++;

    $doorgaan = ($counterPict == $max);

    return;
}

//__________________________________________________________________goedzetten van de orientatie gebaseerd op EXIF
function imagecreatefromjpegexif($filename)
{
    $img = imagecreatefromjpeg($filename);
    $exif = exif_read_data($filename);
    if ($img && $exif && isset($exif['Orientation']))
    {
        $ort = $exif['Orientation'];

        if ($ort == 6 || $ort == 5)
            $img = imagerotate($img, 270, null);
        if ($ort == 3 || $ort == 4)
            $img = imagerotate($img, 180, null);
        if ($ort == 8 || $ort == 7)
            $img = imagerotate($img, 90, null);

        if ($ort == 5 || $ort == 4 || $ort == 7)
            imageflip($img, IMG_FLIP_HORIZONTAL);
    }
    return $img;
}
