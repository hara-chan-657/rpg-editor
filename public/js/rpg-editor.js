
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////　　以下プロパティ   //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

//================================ 各種変数 ===============================================//
//戻る用配列

//１マップ大きさ
var mapLength = 32;
//プロジェクトのマップのオブジェクト
var mapObj = [];
//現在選択中マップオブジェクト;
var currrentMapObj;

//================================ 各種エレメント ===============================================//
//現在マップキャンバス
var currentMapCanvas = document.getElementById('currentMapCanvas');
var currentMapContext = currentMapCanvas.getContext('2d');
//プロジェクト名
var projectName = document.getElementById('projectName');
//プロジェクトのマップ
var maps = document.getElementsByClassName('maps');
//マップ名
var mapNames = document.getElementsByClassName('mapNames');
//マップタイプ名
var mapTypeName = document.getElementById('mapTypeName');
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////　　以下イベント   ////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener('load', setDefault, false);
for (var i=0; i<maps.length; i++) {
	maps[i].addEventListener('click', function(evt) {setEditMap(evt);}, false);
}
currentMapCanvas.addEventListener('click', function(evt) {showMapData(evt);}, false);

///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////　　以下ファンクション   //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
//デフォルト値設定
function setDefault() {
    loadJsonToObj();
}

//編集するマップをセットする
function setEditMap(evt) {
    //現在マップをクリア    
    currentMapContext.clearRect(0, 0, currentMapCanvas.width, currentMapCanvas.height);
    //選択したマップを表示（キャンバス表示用に使う、非表示画像）
    currentMapImage.src = evt.target.src; 
    //キャンバスの大きさを更新
    currentMapCanvas.height = currentMapImage.naturalHeight;
    currentMapCanvas.width = currentMapImage.naturalWidth;
    //新しいマップを表示
    currentMapContext.drawImage(currentMapImage, 0, 0);
    //現在選択中マップを更新
    currrentMapObj = mapObj[evt.target.alt];
}

//プロジェクトのjsonをすべてオブジェクトにロードする
function loadJsonToObj() {
    for (var i=0; i<mapNames.length; i++) {
        //なんでホスト名は要らないのか不明!謎！
        var url = 'projects/' + projectName.innerText + '/' + mapNames[i].innerText + '.json';
        var xhr = new XMLHttpRequest();
        //同期処理なので、ここで毎回取得
        xhr.open('GET', url, false);
        xhr.send(null);
        mapObj[mapNames[i].innerText] = JSON.parse(xhr.responseText);
    }
}

//マップのデータを表示する
//param1 : クリック時イベント情報
function showMapData(evt) {
	//クリックした座標を取得する
	var mousePos = getMousePosition(currentMapCanvas, evt);
    //クリックしたマップチップを特定
	var startX = Math.floor(mousePos.x/mapLength);
	var startY = Math.floor(mousePos.y/mapLength);

    //現在マップオブジェクトから、選択したマップの情報を取得
    var currentMapTip  = currrentMapObj[startX][startY];
    
    switch (currentMapTip.maptipType) {
        case 1:
            mapTypeName.innerText = 'キャラクター';
            break;
        case 2:
            mapTypeName.innerText = 'マップ';
            break;
        case 3:
            mapTypeName.innerText = 'マップ通りぬけ';
            break;
        case 4:
            mapTypeName.innerText = 'ツール';
            break;
        case 5:
            mapTypeName.innerText = '建物';
            break;
    }
}

//クリックされた座標を返す
//param1 : canvas要素
//param2 : eventオブジェクト
//return : クリックされたxy座標
function getMousePosition(currentMapCanvas, evt) {
    var rect = currentMapCanvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}
