<?php
//treeNode.php, de tree naar de node schrijven

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type");

$body = file_get_contents("php://input");
//$ext = json_decode($body);
$ext1 = json_decode($body, true);

$nav = $ext1['nav'];
$path = getcwd() . $ext1['path'];
$nodeInv = $path . $nav . '.md';

$fileSel = $ext1['fileSel'];

//$resFiles = array();
$resFiles[0] = ['upToDate' => false];
for ($m = 1; $m < sizeof($fileSel); $m++) {
        $item = [   'name' => $fileSel[$m]['name'],
                    'nr' => $m - 1,
                    'sel' => $fileSel[$m]['sel'],
                    'width' => $fileSel[$m]['width'],
                    'height' => $fileSel[$m]['height']];
        array_push($resFiles, $item);
    }

//____________________________________________________________schrijf de nodeFile
$myFile = fopen($nodeInv, 'w') or die('unable to open file');
fwrite($myFile, json_encode($resFiles));
fclose($myFile);
chmod($myFile, 0755);
//___________________________________________________________vergelijk $resFiles met $storeFiles


echo json_encode($ext1);
return;
