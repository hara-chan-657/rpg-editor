<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>はらちゃんrpgエディタ</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="apple-touch-icon" href=".png">
<link rel="stylesheet" href="{{ asset('/css/rpg-editor.css') }}">
<link rel="stylesheet"
	href="https://use.fontawesome.com/releases/v5.5.0/css/all.css"
	integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU"
	crossorigin="anonymous">
</head>
<body>
    @component('components.rpg-editor-header')

    @endcomponent

    <div id='currentMapContainer'>
        <div id='currentMap'>
            <canvas id="currentMapCanvas"></canvas>
            <img src="" id="currentMapImage" style="display:none">
        </div>
    </div>
    <div id="mapDataContainer">
        <p id="mapTypeName"></p>
        <div id="eventTrigger">
        </div>
        <div id="mapEvent">
        </di>
    </div>
    <div id="editEventContainer">
        <div id="eventLists">
        </div>
        <div id="editEvent">
        </div>
    </div>
    <p id="projectName">{{$project}}</p>
    <ul>
    @foreach($pngFiles as $pngFile)
        <li>
            <p class="mapNames">{{$pngFile['baseName']}}</p>
            <img src={{$pngFile['path']}} class='maps' width="200" height="150" alt="{{$pngFile['baseName']}}">
        </li>
    @endforeach
    </ul>
    <div>
    @foreach($jsonFiles as $jsonFile)
        <p>{{$jsonFile}}</p>
    @endforeach
    </div>
    <div id="saveProjectContainer">
        <p id="saveProject">このマップを保存</p>
    </div>
<script src="{{ asset('/js/rpg-editor.js') }}"></script>
</body>


