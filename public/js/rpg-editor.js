
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
//スタートポジションX
var startPosX;
//スタートポジションY
var startPosY;
//トリガーリスト
var triggerLists = [
    "トリガー設定なし",
    "Aボタン",
    "衝突",
]
//セット可能イベントリスト
var settingEvents = [
    "talk",
    "question",
    "transition",
    "enter",
    "encounter",
    "tool",
]
//現在選択中登録済みイベント
var currentRegisteredEvent = '';

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
//マップ保存
var saveMap = document.getElementById('saveMap');


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
    }

    //イベントのHTMLを更新
    updateMapEventHTML();

}

function changeEventOrder(evt, order) {
    if (currentRegisteredEvent == '') {
        alert('移動対象のイベントが選択されていません!');
        return;
    }
    // 選択中のイベントのインデックス
    var targetIndex;
    //登録ずみイベントのキーを取得
    var evtKeys = Object.keys(currentMapTip.events)
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
    }
    //入れ替えように一時的にイベントを入れておくための変数
    var tmp;
    //後にキーがeventsのオブジェクトとして上書きするようのオブジェクト
    var eventsObj = new Object();
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
    
    //イベントのHTMLを更新
    updateMapEventHTML();

    var events = document.getElementsByClassName('registerdEvents');
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
    //イベント削除ボタン
    mapEvent.innerHTML += '<p id="deleteEvent" onclick="deleteEvent()">イベントを削除</p>'
    //イベント順番マイナスボタン
    mapEvent.innerHTML += '<p class="changeEventOrder" onclick="changeEventOrder(event,\'minus\')">↑</p>'
    //イベント順番プラスボタン
    mapEvent.innerHTML += '<p class="changeEventOrder" onclick="changeEventOrder(event,\'plus\')">↓</p>'
}

//現在マップチップのトリガーを表示
function showMapTipTrigger(trigger) {
    var html = '<select id="trigger" onChange="saveTriggerToObj()">';
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

//トリガーの変更をオブジェクトに保存する
function saveTriggerToObj() {
    currentMapTip.trigger = document.getElementById('trigger').value;
}

//現在マップチップのイベントを表示
function showMapTipEvents() {
    var html = '<p>設定済みイベント一覧</p>';
    html += '<ul>';
    var evtIndex = 0;
    for( key in currentMapTip.events ) {
        html += '<li class="registerdEvents" onclick="selectRegisterdEvent(event, \'' + evtIndex + '\')">' + key + '</li>';
        evtIndex++;
    }
    html += '</ul>';
    mapEvent.innerHTML = html;
}

//登録済みイベントクリック時、イベントを選択状態にする。
function selectRegisterdEvent(e, evtIndex) {
    //クリックしたイベントを選択状態にする
    var events = document.getElementsByClassName('registerdEvents');
    events = Array.from(events);
    events.forEach(function(event) {
        // いったん全部のイベントの背景色をクリアする
        event.style.backgroundColor = '';
    });
    //クリックしたイベントの背景のみ背景色を変える
    e.target.style.backgroundColor = 'yellow';
    //選択した登録済みのイベントの詳細を表示する
    currentRegisteredEvent = e.target.innerHTML;
    //イベント追加ウィンドウを閉じる
    editEventContainer.style.display = 'none';
    editEvent.style.display = 'none';
    //登録時の入力内容をそのまま表示する
    setEvent(currentRegisteredEvent);

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
    currentRegisteredEvent = '';
    editEventContainer.style.display = 'inline-block';
    //イベント編集divは閉じる
    editEvent.style.display = 'none';
    //登録済みイベント選択中を示す背景色をクリア
    var events = document.getElementsByClassName('registerdEvents');
    events = Array.from(events);
    events.forEach(function(event) {
        // いったん全部のイベントの背景色をクリアする
        event.style.backgroundColor = '';
    });
    var evtListHtml = '<p>追加するイベントを選択</p>';
    for (i=0; i<settingEvents.length; i++) {
        evtListHtml += '<p class="event" onclick="setEvent(\'' + settingEvents[i] + '\')">' + settingEvents[i] +'</p>';
    }
    eventLists.innerHTML = evtListHtml;
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
function setEvent(eventName) {
    var orgEvtName = eventName; //既存イベントの際に使用
    var registeredFlg = false;
    var firstLetter = eventName.substr(0, 1);
    //イベント名が数字始まりだった場合（既存のイベント）の処理。変なイベント登録仕様にした過去の自分に後悔。
    if (isNaN(firstLetter) == false) {
        var eventName = eventName.substr(2);
        registeredFlg = true; //登録済みのイベントと判定
    }
    editEvent.style.display = 'inline-block';
    var html;
    switch (eventName) {
        case 'talk':
            var talkContent = '';
            if (registeredFlg) {
                talkContent = currentMapTip.events[orgEvtName].talkContent;
            }
            html = '<p>会話</p>';
            html += '<p>会話の内容を入力</p>';
            html += '<textarea id="talk">' + talkContent + '</textarea>';
            html += '<p id="registEvent" onclick="registEventToObj(\'talk\')">この内容でイベント登録</p>';
            editEvent.innerHTML = html;
            break;
        case 'question':
            var questionContent = '';
            if (registeredFlg) {
                questionContent = currentMapTip.events[orgEvtName].questionContent;
            }
            html = '<p>質問</p>';
            html += '<p>質問の内容を入力</p>';
            html += '<textarea id="question">' + questionContent + '</textarea>';
            html += '<p id="registEvent" onclick="registEventToObj(\'question\')">この内容でイベント登録</p>';
            editEvent.innerHTML = html;
            break;
        case 'transition':
            break;
        case 'enter':
            break;
        case 'encounter':
            break;
        case 'tool':
            break;
    }
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
function registEventToObj(evtName) {
    var res = confirm('この内容でイベントを登録しますか？');
    if (!res) {
        return;
    }

    var hasEventflg = false;
    //イベントチェック
    if (currentMapTip.hasOwnProperty('events')) {
        hasEventflg = true;
    }

    //イベントを登録する
    switch (evtName) {
        case 'talk':
            if (currentRegisteredEvent == '') {
                //新規イベントの場合
                if (!hasEventflg) {
                    //イベントの配列用オブジェクト
                    currentMapTip.events = new Object();
                }
                //現在マップチップのイベント数を数える
                var evtObj  = currentMapTip.events;
                var evtIndex = Object.keys(evtObj).length;
                //イベントのキーを作成
                var evtNameKey = evtIndex + '_' + evtName;
                //イベント名のキーごとにオブジェクトを作成
                currentMapTip.events[evtNameKey] = new Object();
                //トークのコンテンツを格納
                currentMapTip.events[evtNameKey]['talkContent'] = document.getElementById('talk').value;
            } else {
                //既存のイベントの場合
                currentMapTip.events[currentRegisteredEvent]['talkContent'] = document.getElementById('talk').value;
            }
        break;

        case 'question':
            if (currentRegisteredEvent == '') {
                //新規イベントの場合
                if (!hasEventflg) {
                    //イベントの配列用オブジェクト
                    currentMapTip.events = new Object();
                }
                //現在マップチップのイベント数を数える
                var evtObj  = currentMapTip.events;
                var evtIndex = Object.keys(evtObj).length;
                //イベントのキーを作成
                var evtNameKey = evtIndex + '_' + evtName;
                //イベント名のキーごとにオブジェクトを作成
                currentMapTip.events[evtNameKey] = new Object();
                //トークのコンテンツを格納
                currentMapTip.events[evtNameKey]['questionContent'] = document.getElementById('question').value;
            } else {
                //既存のイベントの場合
                currentMapTip.events[currentRegisteredEvent]['questionContent'] = document.getElementById('question').value;
            }
            
        break;
    }
    //マップオブジェクトに現在マップオブジェクトの変更を反映
    currrentMapObj[rowNum][colNum] = currentMapTip;
    
    //イベント一覧を更新
    updateMapEventHTML();

    var events = document.getElementsByClassName('registerdEvents');
    events = Array.from(events);
    events.forEach(function(event) {
        if (event.innerHTML == currentRegisteredEvent) {
            event.style.backgroundColor = 'yellow';
        }
    });
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
