<?PHP
header('Access-Control-Allow-Origin: *');
//wachtTo.php

$body = file_get_contents("php://input");
//$tus = json_decode($body);
$ext = json_decode($body, true);

$sourceInfo = $ext['source'];
$goalInfo =$ext['goal'];

$SourceFiles = $sourceInfo['files'];
$SourcePath = $sourceInfo['path'];
$SourceNav = $sourceInfo['nav'];

$GoalFiles = $goalInfo['files'];
$GoalPath = $goalInfo['path'];
$GoalNav = $goalInfo['nav'];

$NowDir = getcwd();
$SourceDir = $NowDir . ltrim($SourcePath, '.');
$GoalDir = $NowDir . ltrim($GoalPath, '.');

$SourceNew = array();
$GoalNew = array();
for ($n = 1; $n < sizeof($GoalFiles); $n++) {
    array_push($GoalNew, $GoalFiles[$n]);
}

$SourceCounter = 0;
$GoalCounter = sizeof($GoalNew);

for ($n = 1; $n < sizeof($SourceFiles); $n++) {
    if($SourceFiles[$n]['sel']) {
        $item = ['name' => $SourceFiles[$n]['name'], 'nr' => $GoalCounter, 'sel' => false, 'width' => $SourceFiles[$n]['width'], 'height' => $SourceFiles[$n]['height']];
        array_push($GoalNew, $item);
        $GoalCounter++;
        rename($SourceDir . $SourceFiles[$n]['name'], $GoalDir . $SourceFiles[$n]['name']);
    } else {
        $item = ['name' => $SourceFiles[$n]['name'], 'nr' => $SourceCounter, 'sel' => false, 'width' => $SourceFiles[$n]['width'], 'height' => $SourceFiles[$n]['height']];
        array_push($SourceNew, $item);
        $SourceCounter++;
    }
}

$item = ['upToDate' => true];
array_unshift($SourceNew, $item);
array_unshift($GoalNew, $item);

$NodeSourceFile = $SourceDir . $SourceNav . '.md';
$myFile = fopen($NodeSourceFile, 'w') or die('unable to open file');
fwrite($myFile, json_encode($SourceNew));
fclose($myFile);
chmod($myFile, 0755);

$NodeGoalFile = $GoalDir . $GoalNav . '.md';
$myFile = fopen($NodeGoalFile, 'w') or die('unable to open file');
fwrite($myFile, json_encode($GoalNew));
fclose($myFile);
chmod($myFile, 0755);

$cc = (object) ['goal' => $GoalNew, 'goalP' => $GoalPath, 'source' => $SourceNew, 'sourceP' => $SourcePath];
$res = json_encode($cc);
echo($res);
return;
