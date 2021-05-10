
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
//スタートポジション選択フラグ
var editStartPosFlg = false;
//マップチップエクスポートフラグ
var exportMapChipFlg = false;
//スタートポジションX
var startPosX;
//スタートポジションY
var startPosY;
//トリガーリスト
var triggerLists = [
    "トリガー設定なし",
    "Aボタン",
    "進入",
]
//セット可能イベントリスト
var settingEvents = [
    "talk",
    "question",
    "transition",
    "battle",
    "tool",
]
//セット可能オブジェクト
var settingObjects = [
    "tool",
    "character",
]

//現在選択中登録済みイベント
var currentRegisteredEvent = '';

//現在選択中登録済みオブジェクトイベント
var currentRegisteredObjEvent = '';

//================================ 各種エレメント ===============================================//
//スタートプロジェクト設定コンテナ
var setStartProjectContainer = document.getElementById('setStartProjectContainer');
//スタートポジション編集コンテナ
var editStartPositionContainer = document.getElementById('editStartPositionContainer');
//スタートポジション表示
var startPos = document.getElementById('startPos');
//スタートポジション設定
var saveStartPos = document.getElementById('saveStartPos');
//スタートポジション設定ストップ
var stopEditStartPos = document.getElementById('stopEditStartPos');
//現在マップキャンバス
var currentMapCanvas = document.getElementById('currentMapCanvas');
var currentMapContext = currentMapCanvas.getContext('2d');
//プロジェクト名
var projectName = document.getElementById('projectName');
//プロジェクトのマップ
var maps = document.getElementsByClassName('maps');
//マップ名
var mapNames = document.getElementsByClassName('mapNames');
//マップ通り抜け設定値
var mapPassProperty = document.getElementById('mapPassProperty');
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
//マップオブジェクト
var mapObject = document.getElementById('mapObject');
//オブジェクト編集コンテナ
var editObjectContainer = document.getElementById('editObjectContainer');
//オブジェクトリスト
var objLists = document.getElementById('objLists');
//オブジェクトリスト
var objEventLists = document.getElementById('objEventLists');
//マップ保存
var saveMap = document.getElementById('saveMap');
// //キャラオブジェクト
// var objCharas = document.getElementsByClassName('obj_charas');
// //ツールオブジェクト
// var objTools = document.getElementsByClassName('obj_tools');


///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////　　以下イベント   ////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener('load', setDefault, false);
for (var i=0; i<maps.length; i++) {
	maps[i].addEventListener('click', function(evt) {setEditMap(evt);}, false);
}
//setStartProject.addEventListener('click', setStartProjectThisMap, false);
saveStartPos.addEventListener('click', saveStartPosition, false);
stopEditStartPos.addEventListener('click', stopEditStartPosition, false);
currentMapCanvas.addEventListener('click', function(evt) {showMapTipData(evt);}, false);
saveMap.addEventListener('click', saveMapToServer, false);
// for (var i=0; i<objCharas.length; i++) {
//     objCharas[i].addEventListener('click', function(evt) {selectObjectImage(evt);}, false);
// }

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
    //登録済みのイベントとオブジェクトを描画
    drawEvtAndObj();
    //グリッド表示
    drawGrid();
}


//編集マップをリロード
function reloadEditMap() {
    //マップをいったんクリアして際描画
    currentMapContext.clearRect(0, 0, currentMapCanvas.width, currentMapCanvas.height);
    currentMapContext.drawImage(currentMapImage, 0, 0);
    //スタートプロジェクトかチェック
    checkIsStartProject();
    //イベントとオブジェクト描画
    drawEvtAndObj();
    //グリッド表示
    drawGrid();
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
        xhr.setRequestHeader('Pragma', 'no-cache');
		xhr.setRequestHeader('Cache-Control', 'no-cache');
		xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');
        xhr.send(null);
        mapObj[mapNames[i].innerText] = JSON.parse(xhr.responseText);
    }
    //プロジェクトデータをロードする
    var url = 'projects/' + projectName.innerText + '/projectData.json';
    var xhr = new XMLHttpRequest();
    //同期処理なので、ここで毎回取得
    xhr.open('GET', url, false);
    xhr.setRequestHeader('Pragma', 'no-cache');
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');
    xhr.send(null);
    projectDataObj = JSON.parse(xhr.responseText);
}

//マップ選択時スタートプロジェクトかチェックする
function checkIsStartProject() {
    var isStart = false;
    if (projectDataObj['startMap'] == currrentMapName) {
        isStart = true;
    }
    //スタートプロジェクトのマップだった場合
    if (isStart) {
        //現在設定済みスタートポジション取得
        var currentStartPos = '(' + projectDataObj['startPosX'] + ':' + projectDataObj['startPosY'] + ')';
        var html = '<p>スタートポジション：' + currentStartPos + '</p>';
        html += '<p id="setStartProject" onclick="changeStartProjectThisMap(\'remove\')">スタートプロジェクトを解除する</p>';
        setStartProjectContainer.innerHTML = html;
    //スタートプロジェクトのマップじゃなかった場合
    } else {
        var html;
        if (projectDataObj['startMap'] == 'null') {
            html = '<p>現在スタートプロジェクトは設定されていません</p>';
        } else {
            html = '<p>現在のスタートプロジェクトは「' + projectDataObj['startMap'] + '」です。</p>';
        }
        html += '<p id="setStartProject" onclick="changeStartProjectThisMap(\'set\')">このマップをスタートプロジェクトに設定する</p>';
        setStartProjectContainer.innerHTML = html;
    }
}

//スタートプロジェクトの状態を変更する
function changeStartProjectThisMap(mode) {
    if (mode == 'remove') {
        var res = confirm('スタートプロジェクトから解除してもよろしいですか？');
        if (res) {
            projectDataObj['startMap'] = 'null';
            projectDataObj['startPosX'] = 'null';
            projectDataObj['startPosY'] = 'null';
            //結果更新
            checkIsStartProject();
        }
    } else if (mode == 'set') {
        var res = confirm('このマップをスタートプロジェクトに設定しますか？');
        if (res) {
            //スタートポジション選択フラグをtrueに
            editStartPosFlg = true;
            //スタートポジション編集コンテナ表示
            editStartPositionContainer.style.display = 'block';
        }
    } else {

    }
}

//スタートポジションをオブジェクトに設定する
function saveStartPosition() {
    //バリデーション
    var selectedMapTip  = currrentMapObj[startPosY][startPosX];
    //今のところスタートとして許可するのは「地形」のみ
    if (selectedMapTip.maptipType != 3) {
        alert('スタートポジションに設定できるのは、「地形通りぬけ」のマップチップのみです!');
        return;
    }

    //編集フラグをOFFに
    editStartPosFlg = false;

    //プロジェクトデータに保存
    projectDataObj['startMap'] = currrentMapName;
    projectDataObj['startPosX'] = startPosX;
    projectDataObj['startPosY'] = startPosY;
    //結果更新
    editStartPositionContainer.style.display = 'none';
    checkIsStartProject();
}

//スタートポジション編集を取りやめる
function stopEditStartPosition() {
    //やめるか聞く
    var res = confirm('スタートポジション編集をやめますか？');
    if (res) {
        //編集フラグをOFFに
        editStartPosFlg = false;
        //結果更新
        startPos.innerText = '';
        editStartPositionContainer.style.display = 'none';
        checkIsStartProject();
    }
}

//マップチップのデータを表示する
//param1 : クリック時イベント情報
function showMapTipData(evt) {

    //現在選択中のイベントをクリア
    currentRegisteredEvent = '';

	//クリックした座標を取得する
	var mousePos = getMousePosition(currentMapCanvas, evt);
    //クリックしたマップチップを特定
	colNum = Math.floor(mousePos.x/mapLength);
    rowNum = Math.floor(mousePos.y/mapLength);
    
    //スタートポジション選択フラグがtrueの場合
    if (editStartPosFlg) {
        startPos.innerText = '(' + colNum + ':' + rowNum + ')';
        startPosX = colNum;
        startPosY = rowNum;
        return;
    }

    if (exportMapChipFlg) {
        var dist = document.getElementById('exportDist');
        dist.innerHTML = '(<span id="expX">' + colNum + '</span>:<span id="expY">' + rowNum + '</span>)';
        return;
    }

    //現在マップオブジェクトから、選択したマップの情報を取得
    currentMapTip = currrentMapObj[rowNum][colNum];
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
        case 6:
            mapTypeName.innerText = '地形繰り返し (' + colNum + ':' + rowNum + ')';
            break;
        case 7:
            mapTypeName.innerText = '地形交互 (' + colNum + ':' + rowNum + ')';
            break;
    }

    mapTypeName.innerHTML += '<button onclick="exportMapChip()">エクスポート</button>';

    //イベント追加ウィンドウを閉じる
    editEventContainer.style.display = 'none';
    editEvent.style.display = 'none';

    //イベントのHTMLを更新
    updateMapEventHTML();

}

function exportMapChip() {
    exportMapChipFlg = true;
    var mapDataContainer = document.getElementById("mapDataContainer");
    mapDataContainer.style.pointerEvents = 'none';
    mapDataContainer.style.backgroundColor = 'gray';
    var html = '';
    html += '<p>エクスポート先のマップチップをクリックしてください</p>';
    html += '<p>エクスポート先：<span id="exportDist"></span></p>';
    html += '<button onclick="quitExportMapChip()">やめる</button>';
    html += '<button onclick="doExportMapChip()">上記にエクスポート</button>';
    editEvent.innerHTML = html;
    editEvent.style.display = 'inline-block';
}

function quitExportMapChip() {
    exportMapChipFlg = false;
    var mapDataContainer = document.getElementById("mapDataContainer");
    mapDataContainer.style.pointerEvents = '';
    mapDataContainer.style.backgroundColor = '';
    editEvent.innerHTML = '';
    editEvent.style.display = 'none';
}

function doExportMapChip() {
    var expX = document.getElementById("expX");
    var expY = document.getElementById("expY");

    if (expX == null || expY == null) {
        alert('エクスポート先を選択してください！');
        return;
    }

    expX = expX.innerText;
    expY = expY.innerText;

    if (!confirm('エクスポート先に設定している情報は消えてしまいます。\nよろしいですか？')) {
        return;
    }
    //トリガー、イベント、オブジェクト、マップパスをエクスポート
    if (currentMapTip.hasOwnProperty('trigger')) {
        currrentMapObj[expY][expX].trigger = currentMapTip.trigger;
        delete currentMapTip.trigger;
    }
    if (currentMapTip.hasOwnProperty('events')) {
        currrentMapObj[expY][expX].events = currentMapTip.events;
        delete currentMapTip.events;
    }
    if (currentMapTip.hasOwnProperty('object')) {
        currrentMapObj[expY][expX].object = currentMapTip.object;
        delete currentMapTip.object;
    }
    if (currentMapTip.hasOwnProperty('pass')) {
        if (currrentMapObj[expY][expX].maptipType != 3) {
            currrentMapObj[expY][expX].object = currentMapTip.object;
        } else {
            alert('エクスポート失敗：エクスポート先は地形通り抜けなので、pass属性はエクスポートされませんでした。');
        }
        delete currentMapTip.pass;
    }
    exportMapChipFlg = false;
    var mapDataContainer = document.getElementById("mapDataContainer");
    mapDataContainer.style.pointerEvents = '';
    mapDataContainer.style.backgroundColor = '';
    editEvent.innerHTML = '';
    editEvent.style.display = 'none';
    updateMapEventHTML();
}

function changeEventOrder(evt, order, objFlg = false) {
    // 選択中のイベントのインデックス
    var targetIndex;
    //登録ずみイベントのキーを取得
    if (objFlg == false) {
        var evtKeys = Object.keys(currentMapTip.events)
    } else {
        var evtKeys = Object.keys(currentMapTip.object.events)
    }
    //選択中のイベントと一致するイベントのインデックスを取得
    for (var i=0; i<evtKeys.length; i++) {
        if (evtKeys[i] == currentRegisteredEvent) {
            targetIndex = i;
            //０番目と最後の場合のバリデーション
            if((targetIndex == 0 && order == 'minus') || (targetIndex == evtKeys.length-1 && order == 'plus')) {
                return;
            }
            break;
        }
        if (i == evtKeys.length-1) {
            //最後まで見つからなかった場合、イベントが選択されていないため、リターン
            alert('移動対象のイベントが選択されていません!');
            return;
        }
    }
    //入れ替えように一時的にイベントを入れておくための変数
    var tmp;
    //後にキーがeventsのオブジェクトとして上書きするようのオブジェクト
    var eventsObj = new Object();
    if (objFlg == false) {
        switch (order) {
            case 'minus':
                for (var i=0; i<evtKeys.length; i++) {
                    //選択中のイベント-1のイベントだったら
                    if (i == targetIndex-1) {
                        tmp = currentMapTip.events[evtKeys[i]]
                        continue;
                    }
                    //選択中のイベントだったら
                    if (i == targetIndex) {
                        //まずは普通に代入
                        eventsObj[evtKeys[i]] = currentMapTip.events[evtKeys[i]];
                        //退避しておいた一個前のオブジェクトを代入
                        eventsObj[evtKeys[i-1]] = tmp;
                        continue;
                    }
                    //通常
                    eventsObj[evtKeys[i]] = currentMapTip.events[evtKeys[i]];
                }
            break;
            case 'plus':
                for (var i=0; i<evtKeys.length; i++) {
                    //選択中のイベントだったら
                    if (i == targetIndex) {
                        tmp = currentMapTip.events[evtKeys[i]]
                        continue;
                    }
                    //選択中のイベント+1のイベントだったら
                    if (i == targetIndex+1) {
                        //まずは普通に代入
                        eventsObj[evtKeys[i]] = currentMapTip.events[evtKeys[i]];
                        //退避しておいた一個前のオブジェクトを代入
                        eventsObj[evtKeys[i-1]] = tmp;
                        continue;
                    }
                    //通常
                    eventsObj[evtKeys[i]] = currentMapTip.events[evtKeys[i]];
                }
            break;
        }

        //eventsを更新
        currentMapTip.events = eventsObj;

    } else {
        switch (order) {
            case 'minus':
                for (var i=0; i<evtKeys.length; i++) {
                    //選択中のイベント-1のイベントだったら
                    if (i == targetIndex-1) {
                        tmp = currentMapTip.object.events[evtKeys[i]]
                        continue;
                    }
                    //選択中のイベントだったら
                    if (i == targetIndex) {
                        //まずは普通に代入
                        eventsObj[evtKeys[i]] = currentMapTip.object.events[evtKeys[i]];
                        //退避しておいた一個前のオブジェクトを代入
                        eventsObj[evtKeys[i-1]] = tmp;
                        continue;
                    }
                    //通常
                    eventsObj[evtKeys[i]] = currentMapTip.object.events[evtKeys[i]];
                }
            break;
            case 'plus':
                for (var i=0; i<evtKeys.length; i++) {
                    //選択中のイベントだったら
                    if (i == targetIndex) {
                        tmp = currentMapTip.object.events[evtKeys[i]]
                        continue;
                    }
                    //選択中のイベント+1のイベントだったら
                    if (i == targetIndex+1) {
                        //まずは普通に代入
                        eventsObj[evtKeys[i]] = currentMapTip.object.events[evtKeys[i]];
                        //退避しておいた一個前のオブジェクトを代入
                        eventsObj[evtKeys[i-1]] = tmp;
                        continue;
                    }
                    //通常
                    eventsObj[evtKeys[i]] = currentMapTip.object.events[evtKeys[i]];
                }
            break;
        }

        //eventsを更新
        currentMapTip.object.events = eventsObj;
    }
    
    //イベントのHTMLを更新
    updateMapEventHTML();

    if (objFlg == false) {
        var events = document.getElementsByClassName('registerdEvents');
    } else {
        var events = document.getElementsByClassName('registerdEventsForObj');
    }
    events = Array.from(events);
    events.forEach(function(event) {
        if (event.innerHTML == currentRegisteredEvent) {
            event.style.backgroundColor = 'yellow';
        }
    });
}

function updateMapEventHTML() {
    //通り抜けチェック
    if ( currentMapTip.maptipType != 3) {
        //地形通り抜け以外のマップチップの場合
        if (currentMapTip.hasOwnProperty('pass')) {
            mapPassProperty.innerHTML = '<p>通り抜け設定：有り<button onclick="setPassProperty(\'del\')">削除する</button></p>';
        } else {
            mapPassProperty.innerHTML = '<p>通り抜け設定：無し<button onclick="setPassProperty(\'add\')">追加する</button></p>';
        }
    } else {
        mapPassProperty.innerHTML = '';
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
    mapEvent.innerHTML += '<p id="addEvent" onclick="addEvent()">イベントを追加</p>';
    //イベント削除ボタン
    mapEvent.innerHTML += '<p id="deleteEvent" onclick="deleteEvent()">イベントを削除</p>';
    //イベント順番マイナスボタン
    mapEvent.innerHTML += '<p class="changeEventOrder" onclick="changeEventOrder(event,\'minus\')">↑</p>';
    //イベント順番プラスボタン
    mapEvent.innerHTML += '<p class="changeEventOrder" onclick="changeEventOrder(event,\'plus\')">↓</p>';

    //オブジェクトチェック
    if (currentMapTip.hasOwnProperty('object')) {
        var objName = currentMapTip.object.objName;
        var imgName = currentMapTip.object.imgName;
        var img = document.getElementById(imgName);
        mapObject.innerHTML = '<p>オブジェクト名：' + objName + '</p>';
        mapObject.innerHTML += '<img src="' + decodeURI(img.src) +'"></img>';
        mapObject.innerHTML += '<p id="deleteObject" onclick="deleteObject()">オブジェクトを削除する※注意</p>';
        if (objName == 'tool') {
            //拾いイベントだけ
            mapObject.innerHTML += '<p>拾いイベントのみです</p>';
        } else if (objName == 'character') {
            mapObject.innerHTML += '<p>トリガはAボタン</p>';
            //mapObject.innerHTML += '<p>クリーチャーを選択</p>';
            //イベントチェック
            if (currentMapTip['object'].hasOwnProperty('events')) {
                //登録ずみイベント一覧を表示
                showMapTipEvents(true);
            } else {
                mapObject.innerHTML += '<p>イベントはありません</p>';
            }
            //イベント追加ボタン
            mapObject.innerHTML += '<p id="addEvent" onclick="addEvent(true)">イベントを追加</p>';
            //イベント削除ボタン
            mapObject.innerHTML += '<p id="deleteEvent" onclick="deleteEvent(true)">イベントを削除</p>';
            //イベント順番マイナスボタン
            mapObject.innerHTML += '<p class="changeEventOrder" onclick="changeEventOrder(event,\'minus\', true)">↑</p>';
            //イベント順番プラスボタン
            mapObject.innerHTML += '<p class="changeEventOrder" onclick="changeEventOrder(event,\'plus\', true)">↓</p>';
        } else {
        }
    } else {
        mapObject.innerHTML = '<p>オブジェクトはありません</p>';
        mapObject.innerHTML += '<p id="addObject" onclick="addObject()">オブジェクトを追加</p>';
        editObjectContainer.style.display = 'none'; //デフォルトは必ず非表示
    }

    reloadEditMap();
}

function deleteObject() {
    if (!confirm('※注意！\n\nオブジェクトを削除すると、オブジェクトに設定されているイベントも全て削除されます。\n\nよろしいですか？')) return;
    delete currentMapTip.object;
    updateMapEventHTML();
}

//マップにイベント追加のdivを表示する
function addObject(objFlg = false) {
    currentRegisteredEvent = '';
    //イベント編集divは閉じる
    editEvent.style.display = 'none';
    //登録済みイベント選択中を示す背景色をクリア
    if (objFlg == false) {
        var events = document.getElementsByClassName('registerdEvents');
    } else {
        var events = document.getElementsByClassName('registerdEventsForObj');
    }
    events = Array.from(events);
    events.forEach(function(event) {
        // いったん全部のイベントの背景色をクリアする
        event.style.backgroundColor = '';
    });
    currentRegisteredObjEvent = '';
    editObjectContainer.style.display = 'inline-block';
    var objListHtml = '<p>追加するオブジェクトを選択</p>';
    for (var i=0; i<settingObjects.length; i++) {
        objListHtml += '<p class="object" onclick="setObject(\'' + settingObjects[i] + '\')">' + settingObjects[i] +'</p>';
    }
    objLists.innerHTML = objListHtml;
}

//オブジェクトをマップチップにセットする
function setObject(objectName) {
        //objLists.innerHTML = '';
        //イベント一覧を更新
        //updateMapEventHTML();
        var html = '';
        //var objName = currentMapTip.object.objName;
        html += '<p>オブジェクト名：' + objectName + '</p>';
        html += '<span>選択中のオブジェクト</span><img id="selectedObjImage" src=""></img>';
        if (objectName == 'tool') {
            html += '<p>ツールを選択</p>';
            html += '<div class="imagesContainer">';
            var objTools = document.getElementById('toolObjContainer');
            html += objTools.innerHTML;
            html += '</div>'
            //拾いイベントだけ
        } else if (objectName == 'character') {
            //html += '<p>トリガはAボタン</p>';
            html += '<p>キャラクターを選択</p>';
            html += '<div class="imagesContainer">';
            var objCharas = document.getElementById('charaObjContainer');
            html += objCharas.innerHTML;
            html += '</div>'
        } else {
        }
        html += '<p onclick="registObject(\'' + objectName + '\')">オブジェクトを登録する</p>';
        //オブジェクトセットの際は、イベント編集ウィンドウをお借りする
        editEvent.innerHTML = html;
        editEvent.style.display = 'inline-block';
}

//選択したオブジェクトを、選択中オブジェクトに表示する
function selectObjectImage(evt) {
    var selectedObjImage = document.getElementById('selectedObjImage');
    var tmp = decodeURI(evt.target.src);
    selectedObjImage.src = tmp;
    
}

//選択したワイプを、選択中ワイプに表示する
function selectWipeImage(evt) {
    var selectedWipeImage = document.getElementById('selectedWipeImage');
    var tmp = decodeURI(evt.target.src);
    selectedWipeImage.src = tmp;
    
}

function registObject(objectName) {
    //オブジェクトをマップちっぷに登録
    currentMapTip.object = new Object(); 
    currentMapTip.object.objName = objectName;
    var fullSrc = decodeURI(document.getElementById('selectedObjImage').src);
    var imgName = fullSrc.split("/").reverse()[0]

    currentMapTip.object.imgName = imgName;
    currentMapTip.object.trigger = 'Aボタン'; //オブジェクトのトリガはAボタン固定なので、意味あるかわからないが、、
    currrentMapObj[rowNum][colNum] = currentMapTip;

    //イベント編集ウィンドウ、オブジェクト追加ウィンドウを閉じて、イベントコンテナ更新
    editEvent.style.display = 'none';
    editObjectContainer.style.display = 'none';
    //objLists.style.display = 'none';
    objLists.innerHTML = '';
    updateMapEventHTML();
}

//現在マップチップのトリガーを表示
function showMapTipTrigger(trigger) {
    var html = '<select id="trigger" onChange="saveTriggerToObj()">';
    for (var i=0; i<triggerLists.length; i++) {
        if (triggerLists[i] == trigger) {
            html += '<option value="' + triggerLists[i] + '" selected>' + triggerLists[i] + '</option>';
        } else {
            html += '<option value="' + triggerLists[i] + '">' + triggerLists[i] + '</option>';
        }
    }
    html += '</select>';
    eventTrigger.innerHTML = html;
}

//トリガーの変更をオブジェクトに保存する
function saveTriggerToObj() {
    currentMapTip.trigger = document.getElementById('trigger').value;
}

//現在マップチップのイベントを表示
function showMapTipEvents(objFlg = false) {
    var html = '<p>設定済みイベント一覧</p>';
    html += '<ul>';
    var evtIndex = 0;
    if (objFlg == false) {
        for( key in currentMapTip.events ) {
            html += '<li class="registerdEvents" onclick="selectRegisterdEvent(event, \'' + evtIndex + '\')">' + key + '</li>';
            evtIndex++;
        }
        html += '</ul>';
        mapEvent.innerHTML = html;
    } else {
        for( key in currentMapTip.object.events ) {
            html += '<li class="registerdEventsForObj" onclick="selectRegisterdEvent(event, \'' + evtIndex + '\', true)">' + key + '</li>';
            evtIndex++;
        }
        html += '</ul>';
        mapObject.innerHTML += html; //+=なのに注意。クリーチャーオブジェクトの場合、クリーチャーであることを直前のタグで表示しないと分かりづらいため。
    }
}

//登録済みイベントクリック時、イベントを選択状態にする。
function selectRegisterdEvent(e, evtIndex, objFlg = false) {
    //クリックしたイベントを選択状態にする
    var events = document.getElementsByClassName('registerdEvents');
    var eventsForObj = document.getElementsByClassName('registerdEventsForObj');
    events = Array.from(events);
    events.forEach(function(event) {
        // いったん全部のイベントの背景色をクリアする
        event.style.backgroundColor = '';
    });
    eventsForObj = Array.from(eventsForObj);
    eventsForObj.forEach(function(event) {
        // いったん全部のイベントの背景色をクリアする
        event.style.backgroundColor = '';
    });
    //クリックしたイベントの背景のみ背景色を変える
    e.target.style.backgroundColor = 'yellow';
    //選択した登録済みのイベントの詳細を表示する
    currentRegisteredEvent = e.target.innerHTML;
    if (objFlg == false) {
        //イベント追加ウィンドウを閉じる
        editEventContainer.style.display = 'none';
        editEvent.style.display = 'none';
        //登録時の入力内容をそのまま表示する
        setEvent(currentRegisteredEvent);
    } else {
        //イベント追加ウィンドウを閉じる
        editObjectContainer.style.display = 'none';
        editEvent.style.display = 'none';
        //登録時の入力内容をそのまま表示する
        setEvent(currentRegisteredEvent, true);
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

//マップにイベント追加のdivを表示する
function addEvent(objFlg = false) {
    currentRegisteredEvent = '';
    if (objFlg == false) {
        editEventContainer.style.display = 'inline-block';
    } else {
        editObjectContainer.style.display = 'inline-block';    
    }
    //イベント編集divは閉じる
    editEvent.style.display = 'none';
    //登録済みイベント選択中を示す背景色をクリア
    if (objFlg == false) {
        var events = document.getElementsByClassName('registerdEvents');
    } else {
        var events = document.getElementsByClassName('registerdEventsForObj');
    }
    events = Array.from(events);
    events.forEach(function(event) {
        // いったん全部のイベントの背景色をクリアする
        event.style.backgroundColor = '';
    });
    var evtListHtml = '<p>追加するイベントを選択</p>';
    if (objFlg == false) {
        for (var i=0; i<settingEvents.length; i++) {
            evtListHtml += '<p class="event" onclick="setEvent(\'' + settingEvents[i] + '\')">' + settingEvents[i] +'</p>';
        }
        eventLists.innerHTML = evtListHtml;
    } else {
        for (var i=0; i<settingEvents.length; i++) {
            evtListHtml += '<p class="event" onclick="setEvent(\'' + settingEvents[i] + '\', true)">' + settingEvents[i] +'</p>';
        }
        objEventLists.innerHTML = evtListHtml;
    }
}

//選択中のイベントを削除する
function deleteEvent(evt) {

    if (currentRegisteredEvent == '') {
        alert('削除対象のイベントが選択されていません!');
        return;
    }

    if (confirm('選択中のイベントを削除しますか？')) {
        //削除
        //対象のイベントを取得（ただ削除されるだけ、イベント名の先頭のインデックス番号は変更しない）
        //var delTarget = evt.target.innerHTML;
        //登録ずみイベントのキーを取得
        var evtKeys = Object.keys(currentMapTip.events)
        //一致するイベントを削除
        for (var i=0; i<evtKeys.length; i++) {
            if (evtKeys[i] == currentRegisteredEvent) {
                delete currentMapTip.events[currentRegisteredEvent];
                currentRegisteredEvent = '';
                break;
            }
        }
        //イベント編集ウィンドウを閉じる
        editEvent.style.display = 'none';
    }

    //イベントのHTMLを更新
    updateMapEventHTML();
}

//イベントのセッティング画面を表示する
//イベントが既存だった場合→編集
//イベントが新規だった場合→登録
function setEvent(eventName, objFlg = false) {
    var orgEvtName = eventName; //既存イベントの際に使用
    var registeredFlg = false;
    var firstLetter = eventName.substr(0, 1);
    //イベント名が数字始まりだった場合（既存のイベント）の処理。変なイベント登録仕様にした過去の自分に後悔。
    if (isNaN(firstLetter) == false) {
        //イベントネームを取得
        var index = eventName.indexOf('_');
        var eventName = eventName.substr(index+1);
        registeredFlg = true; //登録済みのイベントと判定
    }
    editEvent.style.display = 'inline-block';
    var html = '';
    if (objFlg == false) {
        html = '<p style="background-color:lime;" align="center">==マップイベント==</p>';
    } else {
        html = '<p style="background-color:violet;" align="center">==オブジェクトイベント==</p>';
    }
    switch (eventName) {
        case 'talk':
            var talkContent = '';
            var wipeSrc = '';
            if (objFlg == false) {
                if (registeredFlg) {
                    talkContent = currentMapTip.events[orgEvtName].talkContent;
                    if (currentMapTip.events[orgEvtName].hasOwnProperty('wipe')){
                        wipeSrc = decodeURI(document.getElementById(currentMapTip.events[orgEvtName].wipe).src);
                    }
                }
            } else {
                if (registeredFlg) {
                    talkContent = currentMapTip.object.events[orgEvtName].talkContent;
                    if (currentMapTip.object.events[orgEvtName].hasOwnProperty('wipe')){
                        wipeSrc = decodeURI(document.getElementById(currentMapTip.object.events[orgEvtName].wipe).src);
                    }
                }
            }
            html += '<p>【会話】</p>';
            html += '<p>ワイプを選択（なしでもOK）</p>';
            html += '<span>選択中のワイプ</span><img id="selectedWipeImage" src="' + wipeSrc + '"></img>';
            html += '<div class="imagesContainer">';
            html += document.getElementById('wipeContainer').innerHTML;
            html += '</div>';
            html += '<p>会話の内容を入力</p>';
            html += '<textarea id="talk">' + talkContent + '</textarea>';
            if (objFlg == false) {
                html += '<p id="registEvent" onclick="registEventToObj(\'talk\')">この内容でイベント登録</p>';
            } else {
                html += '<p id="registEvent" onclick="registEventToObj(\'talk\', true)">この内容でイベント登録</p>';
            }
            editEvent.innerHTML = html;
            break;
        case 'question':
            var questionContent = '';
            var wipeSrc = '';
            if (objFlg == false) {
                if (registeredFlg) {
                    questionContent = currentMapTip.events[orgEvtName].questionContent;
                    if (currentMapTip.events[orgEvtName].hasOwnProperty('wipe')){
                        wipeSrc = decodeURI(document.getElementById(currentMapTip.events[orgEvtName].wipe).src);
                    }
                }
            } else {
                if (registeredFlg) {
                    questionContent = currentMapTip.object.events[orgEvtName].questionContent;
                    if (currentMapTip.object.events[orgEvtName].hasOwnProperty('wipe')){
                        wipeSrc = decodeURI(document.getElementById(currentMapTip.object.events[orgEvtName].wipe).src);
                    }
                }
            }
            html += '<p>【質問】</p>';
            html += '<p>ワイプを選択（なしでもOK）</p>';
            html += '<span>選択中のワイプ</span><img id="selectedWipeImage" src="' + wipeSrc + '"></img>';
            html += '<div class="imagesContainer">';
            html += document.getElementById('wipeContainer').innerHTML;
            html += '</div>';
            html += '<p>質問の内容を入力</p>';
            html += '<textarea id="question">' + questionContent + '</textarea>';
            if (objFlg == false) {
                html += '<p id="registEvent" onclick="registEventToObj(\'question\')">この内容でイベント登録</p>';
            } else {
                html += '<p id="registEvent" onclick="registEventToObj(\'question\',true)">この内容でイベント登録</p>';
            }
            editEvent.innerHTML = html;
            break;
        case 'transition':
            var transitionMap = '';
            if (objFlg == false) {
                if (registeredFlg) {
                    transitionMap = currentMapTip.events[orgEvtName].transitionMap;
                }
            } else {
                if (registeredFlg) {
                    transitionMap = currentMapTip.object.events[orgEvtName].transitionMap;
                }
            }
            html += '<p>【遷移】</p>';
            html += '<p>遷移先マップを選択</p>';
            html += '<select id="setTransitionMap" onChange="setTransitionMap(this.value,\'' + orgEvtName + '\')">';
            html += '<option value=""></option>';
            for (var i=0; i<mapNames.length; i++) {
                if (mapNames[i].innerHTML == transitionMap) {
                    html += '<option value="' + mapNames[i].innerHTML + '" selected>' + mapNames[i].innerHTML + '</option>';
                } else {
                    html += '<option value="' + mapNames[i].innerHTML + '">' + mapNames[i].innerHTML + '</option>';
                }
            }
            html += '</select>';
            var transitionX = '';
            var transitionY = '';
            if (registeredFlg) {
                transitionX = currentMapTip.events[orgEvtName].transitionX;
                transitionY = currentMapTip.events[orgEvtName].transitionY;
            }
            html += '<p>遷移先マップチップを選択</p>';
            html += '<p>遷移先（<span id="transitionX">' + transitionX + '</span>：<span id="transitionY">' + transitionY + '</span>）</p>';
            //キャンバスで同じようにクリックで選択できるようにする
            //onChangeはマップ切り替え
            html += '<div id="transitionMap"><canvas id="transitionMapCanvas" onClick="getMousePositionOfTransition(event)"></canvas><img src="" id="transitionMapImage" style="display:none"></div>';
            //遷移後のディレクションを指定
            var directions = ['up','right','down','left'];
            var direction = '';
            if (registeredFlg) {
                direction = currentMapTip.events[orgEvtName].transitionDirection;
            }
            html += '<p>遷移後のディレクションを選択</p>';
            html += '<select id="transitionDirection" onChange="">';
            for (var i=0; i<directions.length; i++) {
                if (directions[i] == direction) {
                    html += '<option value="' + directions[i] + '" selected>' + directions[i] + '</option>';
                } else {
                    html += '<option value="' + directions[i] + '">' + directions[i] + '</option>';
                }
            }
            html += '</select>';
            if (objFlg == false) {
                html += '<p id="registEvent" onclick="registEventToObj(\'transition\')">この内容でイベント登録</p>';
            } else {
                html += '<p id="registEvent" onclick="registEventToObj(\'transition\',true)">この内容でイベント登録</p>';
            }
            editEvent.innerHTML = html;
            setTransitionMap(transitionMap, orgEvtName);
            break;
        case 'battle':
            //対戦相手や技の情報は、別画面で編集しておく仕様にしておき、ここではそこから選ぶだけの仕様にする
            //三体まで増やせるようにする
            var charaGroup = '';
            var isBoss = '';
            var charaId1 = '0';
            var charaId2 = '0';
            var charaId3 = '0';
            var chara1 = 'キャラ1';
            var chara2 = 'キャラ2（メイン）';
            var chara3 = 'キャラ3';
            if (objFlg == false) {
                if (registeredFlg) {
                    charaGroup = currentMapTip.events[orgEvtName].charaGroup;
                    isBoss = currentMapTip.events[orgEvtName].isBoss;
                    //キャラ1
                    charaId1 = currentMapTip.events[orgEvtName].chara1;
                    var chrIndex1 = currentMapTip.events[orgEvtName].chara1;
                    chara1 = projectDataObj['characters'][chrIndex1].chrName;
                    //キャラ2
                    charaId2 = currentMapTip.events[orgEvtName].chara2;
                    var chrIndex2 = currentMapTip.events[orgEvtName].chara2;
                    chara2 = projectDataObj['characters'][chrIndex2].chrName;
                    //キャラ3
                    charaId3 = currentMapTip.events[orgEvtName].chara3;
                    var chrIndex3 = currentMapTip.events[orgEvtName].chara3;
                    chara3 = projectDataObj['characters'][chrIndex3].chrName;
                }
            } else {
                if (registeredFlg) {
                    charaGroup = currentMapTip.object.events[orgEvtName].charaGroup;
                    isBoss = currentMapTip.object.events[orgEvtName].isBoss;
                    //キャラ1
                    charaId1 = currentMapTip.object.events[orgEvtName].chara1;
                    var chrIndex1 = currentMapTip.object.events[orgEvtName].chara1;
                    chara1 = projectDataObj['characters'][chrIndex1].chrName;
                    //キャラ2
                    charaId2 = currentMapTip.object.events[orgEvtName].chara2;
                    var chrIndex2 = currentMapTip.object.events[orgEvtName].chara2;
                    chara2 = projectDataObj['characters'][chrIndex2].chrName;
                    //キャラ3
                    charaId3 = currentMapTip.object.events[orgEvtName].chara3;
                    var chrIndex3 = currentMapTip.object.events[orgEvtName].chara3;
                    chara3 = projectDataObj['characters'][chrIndex3].chrName;
                }
            }
            html += '<p>【バトル】</p>';
            html += '<p>対戦キャラクターを選択</p>';
            html += '<span>グループ名</span><input type="text" value="' + charaGroup + '" id="charaGroup"/><br>';
            if (isBoss == 1) {
                html += '<span>グループタイプ</span><select id="isBoss"><option value="0">通常</option><option value="1" selected>ボス</option></select>';
            } else {
                html += '<span>グループタイプ</span><select id="isBoss"><option value="0" selected>通常</option><option value="1">ボス</option></select>';
            }
            html += '<div style="overflow:hidden;">'; //高さ認識用
            html += '<div class="eventCharacterContainer">';
            html += '<p id="chara1" title="' + charaId1 +'">' + chara1 + '</p>';
            html += '<div class="eventCharacter">';
            html += document.getElementById('characters').innerHTML;
            html += '</div>';
            html += '</div>';
            html += '<div class="eventCharacterContainer">';
            html += '<p id="chara2" title="' + charaId2 +'">' + chara2 + '</p>';
            html += '<div class="eventCharacter">';
            html += document.getElementById('characters').innerHTML;
            html += '</div>';
            html += '</div>';
            html += '<div class="eventCharacterContainer">';
            html += '<p id="chara3" title="' + charaId3 +'">' + chara3 + '</p>';
            html += '<div class="eventCharacter">';
            html += document.getElementById('characters').innerHTML;
            html += '</div>';
            html += '</div>';
            html += '</div>';
            if (objFlg == false) {
                html += '<p id="registEvent" onclick="registEventToObj(\'battle\')">この内容でイベント登録</p>';
            } else {
                html += '<p id="registEvent" onclick="registEventToObj(\'battle\',true)">この内容でイベント登録</p>';
            }
            editEvent.innerHTML = html;

            break;
        case 'tool':
            html += '<p>【道具】</p>';
            if (objFlg == false) {
                //マップイベントのときの分岐（取得・使用）
                //取得の場合　単に道具を取得して終わり
                //使用の場合　道具を持ってるか判定（道具ウィンドウから選択）→okなら、マップ通り抜け設定をするか判定後、次のイベント。ngの場合、ヒントコメントを表示して後続イベントごと終了。

                //ラジオボタンでバリューチェンジ（取得or使用)
                
                //取得の場合
                //道具一覧から、取得する道具を選択する(DBから引っ張り出し)

                //使用の場合
                //所持道具判定を行う道具を選択する。
                //マップ通りぬけ設定するかを選択する。
                //ヒントコメントの入力

                html += '';
                html += '<p id="registEvent" onclick="registEventToObj(\'tool\')">この内容でイベント登録</p>';
            } else {
                //オブジェクトイベントのときの分岐
                if (true) {
                    //オブジェクトイベント：キャラクターのときの分岐（取得・使用）
                    //取得の場合　単に道具を取得して終わり
                    //使用の場合　道具を持ってるか判定（道具ウィンドウから選択）→okなら次のイベント、ngの場合、ヒントコメントを表示して後続イベントごと終了。

                } else {
                    //オブジェクトイベント：toolのときの分岐（取得・使用）
                    //取得の場合　道具を取得して、対象のオブジェクトを描画リストから削除する（イベント終了後、際描画のタイミングオブジェクトが消える）
                    //使用の場合　道具を持ってるか判定（道具ウィンドウから選択）→okなら次のイベント、ngの場合、ヒントコメントを表示して後続イベントごと終了。

                }
                html += '<p id="registEvent" onclick="registEventToObj(\'tool\',true)">この内容でイベント登録</p>';
            }


            if (objFlg == false) {
                html += '<p id="registEvent" onclick="registEventToObj(\'tool\')">この内容でイベント登録</p>';
            } else {
                html += '<p id="registEvent" onclick="registEventToObj(\'tool\',true)">この内容でイベント登録</p>';
            }
            break;
    }
}

function setBattleCharacter(obj) {
    //キャラ1~3の名前表示のpタグが対象。nameにidを入れると言うなんか変な感じになったけど、、しょうがない、、
    obj.parentNode.parentNode.previousElementSibling.title = obj.id;
    //表示キャラ名
    obj.parentNode.parentNode.previousElementSibling.innerText = obj.alt;
}

function setTransitionMap(mapName, orgEvtName) {
    var transitionMapCanvas = document.getElementById('transitionMapCanvas');
    var transitionMapContext = transitionMapCanvas.getContext('2d');
    var transitionMapImage = document.getElementById('transitionMapImage');
    //遷移先マップをクリア    
    transitionMapContext.clearRect(0, 0, transitionMapCanvas.width, transitionMapCanvas.height);
    //選択したマップを表示（キャンバス表示用に使う、非表示画像）
    if (!currentMapTip.hasOwnProperty('events')) {
        for (var j=0; j<maps.length; j++) {
            if (maps[j].alt == mapName) {
                transitionMapImage.src = maps[j].getAttribute('src');
            }
        }
    } else {
        var keys = Object.keys(currentMapTip.events);
        for (var i=0; i<keys.length; i++) {
            if (keys[i] == orgEvtName) {
                for (var j=0; j<maps.length; j++) {
                    if (currentMapTip.events[orgEvtName].transitionMap == mapName) {
                        for (var j=0; j<maps.length; j++) {
                            if (maps[j].alt == mapName) {
                                transitionMapImage.src = maps[j].getAttribute('src');
                            }
                        }
                    var transitionX = currentMapTip.events[orgEvtName].transitionX;
                    var transitionY = currentMapTip.events[orgEvtName].transitionY;
                    document.getElementById('transitionX').innerHTML = transitionX;
                    document.getElementById('transitionY').innerHTML = transitionY;

                    var directions = ['up','right','down','left'];
                    var transitionDirection = currentMapTip.events[orgEvtName].transitionDirection;
                    for (var i=0; i<directions.length; i++) {
                        if (directions[i] == transitionDirection) {
                            document.getElementById('transitionDirection').selectedIndex = i;   
                        }
                    }
                    break;
                } else {
                    for (var j=0; j<maps.length; j++) {
                        if (maps[j].alt == mapName) {
                            transitionMapImage.src = maps[j].getAttribute('src');
                        }
                    }
                    document.getElementById('transitionX').innerHTML = '';
                    document.getElementById('transitionY').innerHTML = '';
        
                    document.getElementById('transitionDirection').selectedIndex = 0;   
                }
            }
        }
    }
    }
    
    //キャンバスの大きさを更新
    transitionMapCanvas.height = transitionMapImage.naturalHeight;
    transitionMapCanvas.width = transitionMapImage.naturalWidth;
    //新しいマップを描画
    transitionMapContext.drawImage(transitionMapImage, 0, 0);
}

//イベント持ち、オブジェクト持ちのマップチップ上に、それらを表示する
function drawEvtAndObj() {
    for (var i=0; i<Object.keys(currrentMapObj).length; i++) {
        for (var j=0; j<Object.keys(currrentMapObj[i]).length; j++) {
            if (currrentMapObj[i][j].hasOwnProperty('object')) {
                var objImgName;
                var img;
                if (currrentMapObj[i][j].object.hasOwnProperty('imgName')) {
                    objImgName = currrentMapObj[i][j].object.imgName;
                    img = document.getElementById(objImgName);
                    currentMapContext.drawImage(img, j*mapLength ,i*mapLength - 8); // 立体的に見せるため、縦にちょっとずらす。
                } else {
                    //多分もうここにくることはない
                    alert(i + ":" + j );
                }
            }
            if (currrentMapObj[i][j].hasOwnProperty('events')) {
                // パスをリセット
                currentMapContext.beginPath () ;
                // レクタングルの座標(50,50)とサイズ(75,50)を指定
                currentMapContext.rect(j*mapLength ,i*mapLength , 10, 10);
                // 塗りつぶしの色
                currentMapContext.fillStyle = "yellow"; //イベントは設定済みだが、トリガーを設定してない場合、黄色
                if (currrentMapObj[i][j].hasOwnProperty('trigger')) currentMapContext.fillStyle = "red"; //イベントもトリガーも設定している場合は赤
                //currentMapContext.fillStyle = "rgba(255,0,0,0.8)" ;
                // 塗りつぶしを実行
                currentMapContext.fill();
                // 線の色
                currentMapContext.strokeStyle = "purple" ;
                // 線の太さ
                currentMapContext.lineWidth =  1;
                // 線を描画を実行
                currentMapContext.stroke() ;
            }
        }
    }
}

function drawGrid(){
    for (var i=0; i<Object.keys(currrentMapObj).length; i++) {
        for (var j=0; j<Object.keys(currrentMapObj[i]).length; j++) {
                // パスをリセット
                currentMapContext.beginPath () ;
                // レクタングルの座標(50,50)とサイズ(75,50)を指定
                currentMapContext.rect(j*mapLength ,i*mapLength , mapLength, mapLength);
                // 塗りつぶしの色
                //currentMapContext.fillStyle = "rgba(255,0,0,0.8)" ;
                // 塗りつぶしを実行
                // currentMapContext.fill();
                // 線の色
                currentMapContext.strokeStyle = "purple" ;
                // 線の太さ
                currentMapContext.lineWidth =  0.1;
                // 線を描画を実行
                currentMapContext.stroke() ;
        }
    }   
}

//遷移先マップのポジションを取得する
function getMousePositionOfTransition(evt) {
    var transitionX = document.getElementById('transitionX');
    var transitionY = document.getElementById('transitionY');

    //クリックした座標を取得する
    var rect = evt.target.getBoundingClientRect();
    var x = evt.clientX - rect.left;
    var y = evt.clientY - rect.top;

    //クリックしたマップチップを特定
	var tipX = Math.floor(x/mapLength);
    var tipY = Math.floor(y/mapLength);
    
    //スタートポジション選択フラグがtrueの場合
    transitionX.innerHTML = tipX;
    transitionY.innerHTML = tipY;
}

//選択中のマップチップに通り抜け属性を付与する
function setPassProperty(mode) {
    if (mode == 'del') {
        delete currentMapTip['pass'];
    } else {
        //通り抜け属性を追加（バリューは何でも良い）
        currentMapTip['pass'] = '通れるよ';
    }
    updateMapEventHTML();
}

//マップオブジェクトに、イベントを登録する（サーバ保存はまだ）
//同時にイベント一覧も更新
//param1 : イベント所持フラグ(new→初イベント)
//param2 : イベントネーム
function registEventToObj(evtName, objFlg = false) {
    var res = confirm('この内容でイベントを登録しますか？');
    if (!res) {
        return;
    }

    var hasEventflg = false;
    //イベントチェック
    if (objFlg == false) {
        if (currentMapTip.hasOwnProperty('events')) {
            hasEventflg = true;
        }
    } else {
        if (currentMapTip.hasOwnProperty('object') && currentMapTip.object.hasOwnProperty('events')) {
            hasEventflg = true;
        }
    }

    var evtNameKey = getEventKey(evtName, objFlg);
    //イベントを登録する
    switch (evtName) {
        case 'talk':
            if (currentRegisteredEvent == '') {
                //新規のイベントの場合
                if (objFlg == false) {
                    //イベント名のキーごとにオブジェクトを作成
                    currentMapTip.events[evtNameKey] = new Object();
                    //トークのコンテンツを格納
                    currentMapTip.events[evtNameKey]['talkContent'] = document.getElementById('talk').value;
                    //ワイプを登録
                    var selectedWipeImage = document.getElementById('selectedWipeImage');
                    if (selectedWipeImage == null) {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
                        var fullSrc = decodeURI(selectedWipeImage.src);
                        var imgName = fullSrc.split("/").reverse()[0]
                        currentMapTip.events[evtNameKey]['wipe'] = imgName;
                    }
                } else {
                    //イベント名のキーごとにオブジェクトを作成
                    //currentMapTip.object['events'] = new Object(); これいらないな
                    currentMapTip.object.events[evtNameKey] = new Object();
                    //トークのコンテンツを格納
                    currentMapTip.object.events[evtNameKey].talkContent = document.getElementById('talk').value;
                    //ワイプを登録
                    var selectedWipeImage = document.getElementById('selectedWipeImage');
                    if (selectedWipeImage == null) {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
                        var fullSrc = decodeURI(selectedWipeImage.src);
                        var imgName = fullSrc.split("/").reverse()[0]
                        currentMapTip.object.events[evtNameKey]['wipe'] = imgName;
                    }
                }
            } else {
                //既存のイベントの場合
                //var evtNameKey = getEventKey(evtName, objFlg);
                if (objFlg == false) {
                    currentMapTip.events[currentRegisteredEvent]['talkContent'] = document.getElementById('talk').value;
                    //ワイプを登録
                    var selectedWipeImage = document.getElementById('selectedWipeImage');
                    if (selectedWipeImage == null) {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
                        var fullSrc = decodeURI(selectedWipeImage.src);
                        var imgName = fullSrc.split("/").reverse()[0]
                        currentMapTip.events[currentRegisteredEvent]['wipe'] = imgName;
                    }
                } else {
                    currentMapTip.object.events[currentRegisteredEvent]['talkContent'] = document.getElementById('talk').value;
                    //ワイプを登録
                    var selectedWipeImage = document.getElementById('selectedWipeImage');
                    if (selectedWipeImage == null) {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
                        var fullSrc = decodeURI(selectedWipeImage.src);
                        var imgName = fullSrc.split("/").reverse()[0]
                        currentMapTip.object.events[currentRegisteredEvent]['wipe'] = imgName;
                    }
                }
            }
        break;

        case 'question':
            if (currentRegisteredEvent == '') {
                //var evtNameKey = getEventKey(evtName, objFlg);
                if (objFlg == false) {
                    //イベント名のキーごとにオブジェクトを作成
                    currentMapTip.events[evtNameKey] = new Object(); 
                    //トークのコンテンツを格納
                    currentMapTip.events[evtNameKey]['questionContent'] = document.getElementById('question').value;
                    //ワイプを登録
                    var selectedWipeImage = document.getElementById('selectedWipeImage');
                    if (selectedWipeImage == null) {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
                        var fullSrc = decodeURI(selectedWipeImage.src);
                        var imgName = fullSrc.split("/").reverse()[0]
                        currentMapTip.events[evtNameKey]['wipe'] = imgName;
                    }
                } else {
                    //イベント名のキーごとにオブジェクトを作成
                    currentMapTip.object.events[evtNameKey] = new Object(); 
                    //トークのコンテンツを格納
                    currentMapTip.object.events[evtNameKey]['questionContent'] = document.getElementById('question').value;
                    //ワイプを登録
                    var selectedWipeImage = document.getElementById('selectedWipeImage');
                    if (selectedWipeImage == null) {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
                        var fullSrc = decodeURI(selectedWipeImage.src);
                        var imgName = fullSrc.split("/").reverse()[0]
                        currentMapTip.object.events[evtNameKey]['wipe'] = imgName;
                    }
                }

            } else {
                //既存のイベントの場合
                if (objFlg == false) {
                    currentMapTip.events[currentRegisteredEvent]['questionContent'] = document.getElementById('question').value;
                    //ワイプを登録
                    var selectedWipeImage = document.getElementById('selectedWipeImage');
                    if (selectedWipeImage == null) {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
                        var fullSrc = decodeURI(selectedWipeImage.src);
                        var imgName = fullSrc.split("/").reverse()[0]
                        currentMapTip.events[currentRegisteredEvent]['wipe'] = imgName;
                    }
                } else {
                    currentMapTip.object.events[currentRegisteredEvent]['questionContent'] = document.getElementById('question').value;
                    //ワイプを登録
                    var selectedWipeImage = document.getElementById('selectedWipeImage');
                    if (selectedWipeImage == null) {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
                        var fullSrc = decodeURI(selectedWipeImage.src);
                        var imgName = fullSrc.split("/").reverse()[0]
                        currentMapTip.object.events[currentRegisteredEvent]['wipe'] = imgName;
                    }
                }
            }
            
        break;

        case 'transition':
            if (currentRegisteredEvent == '') {
                //var evtNameKey = getEventKey(evtName, objFlg);
                if (objFlg == false) {
                    //イベント名のキーごとにオブジェクトを作成
                    currentMapTip.events[evtNameKey] = new Object(); 
                    //トークのコンテンツを格納
                    currentMapTip.events[evtNameKey]['transitionMap'] = document.getElementById('setTransitionMap').value;
                    //トークのコンテンツを格納
                    currentMapTip.events[evtNameKey]['transitionX'] = document.getElementById('transitionX').innerHTML;
                    currentMapTip.events[evtNameKey]['transitionY'] = document.getElementById('transitionY').innerHTML;
                    //トークのコンテンツを格納
                    currentMapTip.events[evtNameKey]['transitionDirection'] = document.getElementById('transitionDirection').value;
                } else {
                    //イベント名のキーごとにオブジェクトを作成
                    currentMapTip.object.events[evtNameKey] = new Object(); 
                    //トークのコンテンツを格納
                    currentMapTip.object.events[evtNameKey]['transitionMap'] = document.getElementById('setTransitionMap').value;
                    //トークのコンテンツを格納
                    currentMapTip.object.events[evtNameKey]['transitionX'] = document.getElementById('transitionX').innerHTML;
                    currentMapTip.object.events[evtNameKey]['transitionY'] = document.getElementById('transitionY').innerHTML;
                    //トークのコンテンツを格納
                    currentMapTip.object.events[evtNameKey]['transitionDirection'] = document.getElementById('transitionDirection').value;
                }
            } else {
                //既存のイベントの場合
                if (objFlg == false) {
                    //トークのコンテンツを格納
                    currentMapTip.events[currentRegisteredEvent]['transitionMap'] = document.getElementById('setTransitionMap').value;
                    //トークのコンテンツを格納
                    currentMapTip.events[currentRegisteredEvent]['transitionX'] = document.getElementById('transitionX').innerHTML;
                    currentMapTip.events[currentRegisteredEvent]['transitionY'] = document.getElementById('transitionY').innerHTML;
                    //トークのコンテンツを格納
                    currentMapTip.events[currentRegisteredEvent]['transitionDirection'] = document.getElementById('transitionDirection').value;
                } else {
                    //トークのコンテンツを格納
                    currentMapTip.object.events[currentRegisteredEvent]['transitionMap'] = document.getElementById('setTransitionMap').value;
                    //トークのコンテンツを格納
                    currentMapTip.object.events[currentRegisteredEvent]['transitionX'] = document.getElementById('transitionX').innerHTML;
                    currentMapTip.object.events[currentRegisteredEvent]['transitionY'] = document.getElementById('transitionY').innerHTML;
                    //トークのコンテンツを格納
                    currentMapTip.object.events[currentRegisteredEvent]['transitionDirection'] = document.getElementById('transitionDirection').value;
                }
            }
            
        break;

        case 'battle':
            if (currentRegisteredEvent == '') {
                //var evtNameKey = getEventKey(evtName, objFlg);
                if (objFlg == false) {
                    currentMapTip.events[evtNameKey] = new Object(); 
                    currentMapTip.events[evtNameKey].charaGroup = document.getElementById('charaGroup').value;
                    currentMapTip.events[evtNameKey].isBoss = document.getElementById('isBoss').value;
                    currentMapTip.events[evtNameKey]['chara1'] = document.getElementById('chara1').title;
                    currentMapTip.events[evtNameKey]['chara2'] = document.getElementById('chara2').title;
                    currentMapTip.events[evtNameKey]['chara3'] = document.getElementById('chara3').title;
                } else {
                    currentMapTip.object.events[evtNameKey] = new Object(); 
                    currentMapTip.object.events[evtNameKey].charaGroup = document.getElementById('charaGroup').value;
                    currentMapTip.object.events[evtNameKey].isBoss = document.getElementById('isBoss').value;
                    currentMapTip.object.events[evtNameKey]['chara1'] = document.getElementById('chara1').title;
                    currentMapTip.object.events[evtNameKey]['chara2'] = document.getElementById('chara2').title;
                    currentMapTip.object.events[evtNameKey]['chara3'] = document.getElementById('chara3').title;
                }

            } else {
                //既存のイベントの場合
                if (objFlg == false) {
                    currentMapTip.events[currentRegisteredEvent]['charaGroup'] = document.getElementById('charaGroup').value;
                    currentMapTip.events[currentRegisteredEvent]['isBoss'] = document.getElementById('isBoss').value;
                    currentMapTip.events[currentRegisteredEvent]['chara1'] = document.getElementById('chara1').title;
                    currentMapTip.events[currentRegisteredEvent]['chara2'] = document.getElementById('chara2').title;
                    currentMapTip.events[currentRegisteredEvent]['chara3'] = document.getElementById('chara3').title;
                } else {
                    currentMapTip.object.events[currentRegisteredEvent]['charaGroup'] = document.getElementById('charaGroup').value;
                    currentMapTip.object.events[currentRegisteredEvent]['isBoss'] = document.getElementById('isBoss').value;
                    currentMapTip.object.events[currentRegisteredEvent]['chara1'] = document.getElementById('chara1').title;
                    currentMapTip.object.events[currentRegisteredEvent]['chara2'] = document.getElementById('chara2').title;
                    currentMapTip.object.events[currentRegisteredEvent]['chara3'] = document.getElementById('chara3').title;
                }
            }   
        break;
    }
    //マップオブジェクトに現在マップオブジェクトの変更を反映
    currrentMapObj[rowNum][colNum] = currentMapTip;
    //新規イベント登録後はイベント編集divを閉じる（選択していないのにdivが開いているのが気持ち悪いため）。
    if (currentRegisteredEvent == '') editEvent.style.display = 'none';

    //イベント一覧を更新
    updateMapEventHTML();

    if (objFlg == false) {
        var events = document.getElementsByClassName('registerdEvents');
    } else {
        var events = document.getElementsByClassName('registerdEventsForObj');
    }
    events = Array.from(events);
    events.forEach(function(event) {
        if (event.innerHTML == currentRegisteredEvent) {
            event.style.backgroundColor = 'yellow';
        }
    });

    //マップリロード
    reloadEditMap();

    function getEventKey(evtName, objFlg){
        if (objFlg == false) {
            //新規イベントの場合
            if (!hasEventflg) {
                //イベントの配列用オブジェクト
                currentMapTip.events = new Object();
            }
        } else {
            //新規イベントの場合
            if (!hasEventflg) {
                //イベントの配列用オブジェクト
                currentMapTip.object.events = new Object();
            }
        }
        //イベントのキーを作成
        var now = new Date();
        var Year = String(now.getFullYear());
        var Month = String(now.getMonth()+1);
        var date = String(now.getDate());
        var Hour = String(now.getHours());
        var Min = String(now.getMinutes());
        var Sec = String(now.getSeconds());
        var evtNameKey = Year + Month + date + Hour + Hour + Min + Sec + '_' + evtName;
        return evtNameKey;
    }
}

//編集中マップ情報をサーバに保存する、同時にrpg-playerにもプロジェクトのファイルを同期する
//(続きの処理はRpgEditorController.saveEditedMap)
function saveMapToServer() {
    var res = confirm('編集内容をプロジェクトに保存しますか？');
    if (res) {
        //選択中マップオブジェクトをjsonにしてフォームにセット
        var mapObjTxt = JSON.stringify(currrentMapObj);
        var prjObjTxt = JSON.stringify(projectDataObj);
        
        document.forms['map_data'].elements['map_obj_data'].value = mapObjTxt;
        document.forms['map_data'].elements['map_save_name'].value = currrentMapName;
        document.forms['map_data'].elements['project_name'].value = projectName.innerText;
        document.forms['map_data'].elements['project_data'].value = prjObjTxt;
        document.forms['map_data'].submit();
    }
}
