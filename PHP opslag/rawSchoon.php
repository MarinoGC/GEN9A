<?PHP
header('Access-Control-Allow-Origin: *');
//rawSchoon.php

$body = file_get_contents("php://input");
//$tus = json_decode($body);
$ext = json_decode($body, true);

$NowDir = getcwd();
$raw = $ext['goal'];
$rawDir = $NowDir . '/' . $raw;
$fileGood = [];
$fileBad = [];

foreach (scandir($rawDir) as $node) {
    $ext = strtolower(pathinfo($node, PATHINFO_EXTENSION));
    if ($node == '.' || $node == '..' || $ext == 'ds_store') continue;
    if (($ext == 'jpg') || ($ext == 'jpeg') || ($ext == png)) {

        // zet ev. de files recht
        $Orentation = 1;
        $newPath = $rawDir . '/' . $node;
        $exif = exif_read_data($newPath);
        if(!empty($exif['Orientation'])) {
            $Orientation = $exif['Orientation'];
            adjustPicOrientation($newPath, $Orientation);
        };

        array_push($fileGood, $node);
    } else {
        unlink($rawDir . '/' . $node);
        array_push($fileBad, $node);
    }
}

$res = (object) ['fileGood' => $fileGood, 'fileBad' => $fileBad];
$ext1 = json_encode($res);
echo $ext1;
return;

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
