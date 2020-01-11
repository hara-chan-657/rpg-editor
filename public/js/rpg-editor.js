
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////　　以下プロパティ   //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

//================================ 各種変数 ===============================================//
//１マップ大きさ
var mapLength = 32;
//プロジェクトのマップオブジェクト用配列
var mapObj = [];
//プロジェクトのデータオブジェクト
var projectDataObj;
//現在選択中マップオブジェクト;
var currrentMapObj = null;
//現在選択中マップ名
var currrentMapName;
//現在選択中列番号
var colNum;
//現在選択中行番号
var rowNum;
//現在選択中マップチップ
var currentMapTip;
//トリガーリスト
var triggerLists = [
    "トリガー設定なし",
    "Aボタン",
    "衝突",
]
//セット可能イベントリスト
var settingEvents = [
    "会話",
    "質問",
    "通りぬけ",
    "遷移",
    "進入",
    "エンカウントバトル",
    "対人バトル",
    "道具発見",
]
//================================ 各種エレメント ===============================================//
//スタートプロジェクト設定コンテナ
var setStartProjectContainer = document.getElementById('setStartProjectContainer');
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
//マップ保存
var saveMap = document.getElementById('saveMap');


///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////　　以下イベント   ////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener('load', setDefault, false);
for (var i=0; i<maps.length; i++) {
	maps[i].addEventListener('click', function(evt) {setEditMap(evt);}, false);
}
setStartProject.addEventListener('click', setStartProjectThisMap, false);
currentMapCanvas.addEventListener('click', function(evt) {showMapTipData(evt);}, false);
saveMap.addEventListener('click', saveMapToServer, false);

///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////　　以下ファンクション   //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
//デフォルト値設定
function setDefault() {
    loadJsonToObj();
}

//編集するマップをセットする
function setEditMap(evt) {
    //本当は同じマップだったらスキップしたいけど後回し
    if (currrentMapObj != null){
        var res = confirm('プロジェクトに保存はしましたか？\nマップを変更すると変更内容は失われます。');
        if (!res) {
            return;
        }    
    }
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
    currrentMapName = evt.target.alt;
    //スタートプロジェクトかチェック
    checkIsStartProject();
}

//プロジェクトのjsonをすべてオブジェクトにロードする
function loadJsonToObj() {
    //マップのオブジェクトをロードする
    for (var i=0; i<mapNames.length; i++) {
        //なんでホスト名は要らないのか不明!謎！
        var url = 'projects/' + projectName.innerText + '/' + mapNames[i].innerText + '.json';
        var xhr = new XMLHttpRequest();
        //同期処理なので、ここで毎回取得
        xhr.open('GET', url, false);
        xhr.send(null);
        mapObj[mapNames[i].innerText] = JSON.parse(xhr.responseText);
    }
    //プロジェクトデータをロードする
    var url = 'projects/' + projectName.innerText + '/projectData.json';
    var xhr = new XMLHttpRequest();
    //同期処理なので、ここで毎回取得
    xhr.open('GET', url, false);
    xhr.send(null);
    projectDataObj = JSON.parse(xhr.responseText);
}

//スタートプロジェクトかチェックする
function checkIsStartProject() {
    var isStart = false;
    if (currrentMapObj['startMap'] == ) {
        isStart = true;
    }
    if (isStart) {
        setStartProjectContainer.innerHTML = '<p id="setStartProject">スタートプロジェクトを解除する</p>';
    } else {
        setStartProjectContainer.innerHTML = '<p id="setStartProject" onclick="setStartProjectThisMap()">スタートプロジェクトに設定する</p>';
    }
}

function setStartProjectThisMap() {
    currrentMapObj
}

//マップチップのデータを表示する
//param1 : クリック時イベント情報
function showMapTipData(evt) {
	//クリックした座標を取得する
	var mousePos = getMousePosition(currentMapCanvas, evt);
    //クリックしたマップチップを特定
	colNum = Math.floor(mousePos.x/mapLength);
	rowNum = Math.floor(mousePos.y/mapLength);

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
        showMapTipTrigger(currentMapTip.trigger);
    } else {
        //トリガーが設定されてない場合、トリガーリストを表示
        showMapTipTrigger('notrigger');
    }

    //イベントチェック
    if (currentMapTip.hasOwnProperty('events')) {
        //登録ずみイベント一覧を表示
        showMapTipEvents();
    } else {
        mapEvent.innerHTML = '<p>イベントはありません</p>';
    }
    //イベント追加ボタン
    mapEvent.innerHTML += '<p id="addEvent" onclick="addEvent()">イベントを追加</p>'
}

//現在マップチップのトリガーを表示
function showMapTipTrigger(trigger) {
    var html = '<select id="trigger">';
    for (i=0; i<triggerLists.length; i++) {
        if (triggerLists[i] == trigger) {
            html += '<option value="' + triggerLists[i] + '" selected>' + triggerLists[i] + '</option>';
        } else {
            html += '<option value="' + triggerLists[i] + '">' + triggerLists[i] + '</option>';
        }
    }
    html += '</select>';
    eventTrigger.innerHTML = html;
}

//現在マップチップのイベントを表示
function showMapTipEvents() {
    var html = '<p>設定済みイベント一覧</p>';
    html += '<ul>';
    for( key in currentMapTip.events ) {
        html += '<li onclick="">' + key + '</li>';
    }
    html += '</ul>';
    mapEvent.innerHTML = html;
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
    editEventContainer.style.display = 'inline-block';
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
    editEvent.style.display = 'inline-block';
    var html;
    switch (eventName) {
        case '会話':
            html = '<p>会話</p>';
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

//マップオブジェクトに、イベントを登録する（サーバ保存はまだ）
//同時にイベント一覧も更新
//param1 : イベント所持フラグ(new→初イベント)
//param2 : イベントネーム
function registEventToObj(flg, evtName) {
    var res = confirm('この内容でイベントを追加しますか？');
    if (!res) {
        return;
    }

    //トリガーを登録する(変わってなくても毎回処理実行)
    if (document.getElementById('trigger').selectedIndex == 0) {
        alert('トリガーを選択してください！');
        return;
    } else {
        currentMapTip.trigger = document.getElementById('trigger').value;
    }

    //イベントを登録する
    switch (evtName) {
        case 'talk':
            if (flg == 'new') {
                //イベントの配列用オブジェクト
                currentMapTip.events = new Object();
            }
            //現在マップチップのイベント数を数える
            var evtIndex = Object.keys(currentMapTip.events).length;
            //イベントのキーを作成
            var evtNameKey = evtIndex + '_' + evtName;
            //イベント名のキーごとにオブジェクトを作成
            currentMapTip.events[evtNameKey] = new Object();
            //トークのコンテンツを格納
            currentMapTip.events[evtNameKey]['talkContent'] = document.getElementById('talk').value;
        break; 
    }
    //マップオブジェクトに現在マップオブジェクトの変更を反映
    currrentMapObj[rowNum][colNum] = currentMapTip;
    //トリガーを更新
    showMapTipTrigger();
    //イベント一覧を更新
    showMapTipEvents();
}

//編集中マップ情報をサーバに保存する、同時にrpg-playerにもプロジェクトのファイルを同期する
//(続きの処理はRpgEditorController.saveEditedMap)
function saveMapToServer() {
    var res = confirm('編集内容をプロジェクトに保存しますか？');
    if (res) {
        //選択中マップオブジェクトをjsonにしてフォームにセット
        var objTxt = JSON.stringify(currrentMapObj);
        document.forms['map_data'].elements['map_obj_data'].value = objTxt;
        document.forms['map_data'].elements['map_save_name'].value = currrentMapName;
        document.forms['map_data'].elements['project_name'].value = projectName.innerText;
        document.forms['map_data'].submit();
    }
}
