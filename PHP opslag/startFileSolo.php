<?php
header('Access-Control-Allow-Origin: *');
//startFileSolo.php

ini_set('memory_limit', '256M');    //nodig voor "imagerotate", die nogal wat nodig heeft

$body = file_get_contents("php://input");
$ext = json_decode($body, true);

$NowDir = getcwd();
$source = $ext['source'];
$goal = $ext['goal'];
$pictFile = $ext['file'];
$res = $ext['verticalRes'];
$number = $ext['number'];

$sourceFile = $NowDir . $source . $pictFile;
$goalDir = $NowDir . $goal;
$goalFile = $goalDir. $pictFile;

$info = getimagesize($sourceFile);
$mime = $info['mime'];

switch ($mime) {
    case 'image/jpeg':
        $img = imagecreatefromjpegexif($sourceFile);
        break;

    case 'image/png':
        $img = imagecreatefrompng($sourceFile);
        break;
    default:  // Geen jpg- of png-file. Niets doen.
        $ext2 = json_encode($pictFile);
        echo $ext2;
        return;
//            throw new Exception('Unknown image type.');
}

list($width, $height) = getimagesize($sourceFile);
$factor = ($res / $height);
$newHeight = $res;
$newWidth = $width * $factor;
$tmp_img = imagecreatetruecolor($newWidth, $newHeight);                                     // create a new temporary image
imagecopyresampled($tmp_img, $img, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);     // copy and resize old image into new image

imagejpeg($tmp_img, $goalFile);
chmod($goalFile, 0755);

$ext2 = json_encode($pictFile);
echo $ext2;
return;

//___________________________________________________________________________
function imagecreatefromjpegexif($filename) {
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
//___________________________________________________________________________
