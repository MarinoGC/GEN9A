<?php
header("Access-Control-Allow-Origin: *");
//upload1.php

$fileName = $_FILES['file']['name'];
$fileType = $_FILES['file']['type'];
$fileSize = $_FILES['file']['size'];
$fileError = $_FILES['file']['error'];


//WORKAROUND: iPad noemt alle files <image.jpg>.
if (strtolower($fileName) == "image.jpg") {             // Test of het de beruchte file naam is
    $fileName = $fileSize . $fileName;                  // Maak de file "uniek" met de file size
}                                                       // Geen datum genomen. EXIF in $filetmp bevat geen creation date meer

$info = $_POST;

$NowDir = getcwd();
$path = 'raw/';
$goalDir = $NowDir . "/raw";
if (!is_dir($goalDir)) {
    mkdir($goalDir, 0755);
}

$generatedName = md5($_FILES['file']['tmp_name']).$ext;
$filePath = $path.$generatedName;

// Check if file already exists

$full_filename = $NowDir . "/raw/" . $fileName;

if (file_exists($full_filename)) {
    $dir = $NowDir . "/inventarisatie";
    $dirTus = '';
    $dirFound = '';
    $dir = searchFile($dir, $fileName);
    if ($dirFound == '') {
        $dirFound = $fileName . ' only exists in upload directory';
    } else {
        $dirFound = $fileName . ' already exists in: ' .  strtoupper($dirFound);
    }
    echo json_encode(array(
        'pict' => $fileName,
        'status'   => false,
        'melding'  => $dirFound
    ));
    exit;
}

$extra = array(
    "name" => $fileName,
    "type" => $fileType,
    "size" => $fileSize,
    "error" => $fileError,
);

if (move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
    $newPath = $path.$fileName;
    $ren = rename($filePath, $newPath);

    $Orentation = 1;
    $exif = exif_read_data($newPath);
    if(!empty($exif['Orientation'])) {
        $Orientation = $exif['Orientation'];
        adjustPicOrientation($newPath, $Orientation);
    };
}

echo json_encode(array(
    'pict' => pathinfo($fileName, PATHINFO_FILENAME) . '.jpg',
    'status'   => true,
    'melding'  => $fileName . ' uploaded',
));
return;
//______________________________________________________________________________________________________________________
function searchFile($dir, $fileName) {
    global $dirTus;
    global $dirFound;
    foreach (scandir($dir) as $node) {
        $ext = strtolower(pathinfo($node, PATHINFO_EXTENSION));
        if ($node == '.' || $node == '..' || $ext == 'ds_store' || $ext == 'md') continue;
        if (is_dir($dir . '/' . $node)) {
            $dirTus = $node;
            searchFile($dir . '/' . $node, $fileName);
        } else {
            if ($node == $fileName){
                $dirFound = $dirTus;
            }
        }
    }
    return $dirTus;
}
//______________________________________________________________________________________________________________________
function adjustPicOrientation($full_filename, $Orientation){
    if($Orientation != 1){
        $img = imagecreatefromjpeg($full_filename);
        $mirror = false;
        $deg    = 0;
        switch ($Orientation) {
            case 2:
                $mirror = true;
                break;
            case 3:
                $deg = 180;
                break;
            case 4:
                $deg = 180;
                $mirror = true;
                break;
            case 5:
                $deg = 270;
                $mirror = true;
                break;
            case 6:
                $deg = 270;
                break;
            case 7:
                $deg = 90;
                $mirror = true;
                break;
            case 8:
                $deg = 90;
                break;
        }
        if ($deg) $img = imagerotate($img, $deg, 0);
        if ($mirror) $img = _mirrorImage($img);
        imagejpeg($img, $full_filename, 95);
        imagedestroy($img);
    }
    return $full_filename;
}
//______________________________________________________________________________________________________________________
