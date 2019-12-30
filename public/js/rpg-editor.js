
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
//現在選択中マップチップ
var currentMapTip;
//セット可能イベントリスト
var settingEvents = [
    "会話",
    "質問",
    "通りぬけ",
    "遷移",
    "進入",
    "エンカウントバトル",
    "対人バトル",
]
//トリガーリスト
var triggerLists = [
    "トリガー設定なし",
    "Aボタン",
    "衝突",
]
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
//イベントトリガー
var eventTrigger = document.getElementById('eventTrigger');
//マップイベント
var mapEvent = document.getElementById('mapEvent');
//イベント編集コンテナ
var editEventContainer = document.getElementById('editEventContainer');
//イベントリスト
var eventLists = document.getElementById('eventLists');
//イベント編集
var editEvent = document.getElementById('editEvent');
//プロジェクト保存
var saveProject = document.getElementById('saveProject');


///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////　　以下イベント   ////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener('load', setDefault, false);
for (var i=0; i<maps.length; i++) {
	maps[i].addEventListener('click', function(evt) {setEditMap(evt);}, false);
}
currentMapCanvas.addEventListener('click', function(evt) {showMapData(evt);}, false);
saveProject.addEventListener('click', saveProject, false);

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
	var colNum = Math.floor(mousePos.x/mapLength);
	var rowNum = Math.floor(mousePos.y/mapLength);

    //現在マップオブジェクトから、選択したマップの情報を取得
    currentMapTip  = currrentMapObj[rowNum][colNum];
    switch (currentMapTip.maptipType) {
        case 1:
            mapTypeName.innerText = 'キャラクター (' + colNum + ':' + rowNum + ')';
            break;
        case 2:
            mapTypeName.innerText = '地形 (' + colNum + ':' + rowNum + ')';
            break;
        case 3:
            mapTypeName.innerText = '地形通りぬけ (' + colNum + ':' + rowNum + ')';
            break;
        case 4:
            mapTypeName.innerText = 'ツール (' + colNum + ':' + rowNum + ')';
            break;
        case 5:
            mapTypeName.innerText = '建物 (' + colNum + ':' + rowNum + ')';
            break;
    }

    //トリガーチェック
    if (currentMapTip.hasOwnProperty('trigger')) {
        //登録ずみトリガーを表示
        var html = '<select id="trigger">';
        for (i=0; i<triggerLists.length; i++) {
            if (currentMapTip.trigger == triggerLists[i]) {
                html += '<option value="' + triggerLists[i] + '" selected>' + triggerLists[i] + '</option>';
            }
            html += '<option value="' + triggerLists[i] + '">' + triggerLists[i] + '</option>';
        }
        html += '</select>';
        eventTrigger.innerHTML = html;
    } else {
        var html = '<select id="trigger">';
        for (i=0; i<triggerLists.length; i++) {
            html += '<option value="' + triggerLists[i] + '">' + triggerLists[i] + '</option>';
        }
        html += '</select>';
        eventTrigger.innerHTML = html;
    }

    //イベントチェック
    if (currentMapTip.hasOwnProperty('events')) {
        //登録ずみイベント一覧を表示
        
    } else {
        mapEvent.innerHTML = '<p>イベントはありません</p>';
    }
    mapEvent.innerHTML += '<p id="addEvent" onclick="addEvent()">イベントを追加</p>'
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

//マップにイベント追加のdivを表示する
function addEvent() {
    editEventContainer.style.display = 'block';
    var evtListHtml = '<p>追加するイベントを選択</p>';
    for (i=0; i<settingEvents.length; i++) {
        evtListHtml += '<p class="event" onclick="setEvent(\'' + settingEvents[i] + '\')">' + settingEvents[i] +'</p>';
    }
    eventLists.innerHTML = evtListHtml;
}

//イベントのセッティング画面を表示する
//イベントが既存だった場合→編集
//イベントが新規だった場合→登録
function setEvent(eventName) {
    editEvent.style.display = 'block';
    var html;
    //マップにイベントがセットされているかチェック
    if (currentMapTip.hasOwnProperty('events')) {
        //現在の登録内容を表示、編集
    } else {
        //新規、登録
        switch (eventName) {
            case '会話':
                html += '<p>会話</p>';
                html += '<p>会話の内容を入力</p>';
                html += '<textarea id="talk"></textarea>';
                html += '<p id="registEvent" onclick="registEventToObj(\'new\', \'talk\')">この内容でイベント追加</p>';
                editEvent.innerHTML = html;
                break;
            case '質問':
                break;
            case '通りぬけ':
                break;
            case '遷移':
                break;
            case '進入':
                break;
            case 'エンカウントバトル':
                break;
            case '対人バトル':
                break;
        }
    }
}

//マップオブジェクトに、イベントを登録する（サーバ保存はまだ）
function registEventToObj(flg, evtName) {
    switch (eventName) {
        case 'talk':
            if (flg == 'new') {
                currentMapTip.events = new Object();
            }
            currentMapTip.events.trigger = document.getElementById('talk').value;
        break; 
    }
}

//マップを保存する
function saveProject() {
    var res = confirm('プロジェクトを保存しますか？');
    if (res) {
        //登録処理、次のプロジェクトのフォルダに置きにいく
    }
}
