
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
//移動チップモードフラグ
var setTargetMoveChipFlg = false;
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
    "effect",
    "move",
    "scene",
    "changeMainChara",
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
currentMapCanvas.addEventListener('click', function(evt) {
    if (selectObjModeFlg) {
        showSelectedNewMoveObjInfo(evt);
    } else {
        showMapTipData(evt);
    }
}, false);
currentMapCanvas.addEventListener('mousemove', function (evt) {showCursorPos(evt);}, false);
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
    drawEvtAndObjAndTurnChip();
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
    drawEvtAndObjAndTurnChip();
    //グリッド表示
    drawGrid();
    //選択チップ枠表示
    drawCurrentChipBorder();
    //選択チップでの、画面枠表示
    drawScreenBorder();
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

//マップチップ交互の編集モードにする
var turnChipModeFlg = false;
function setTurnChipMode() {

    if (turnChipModeFlg) {
        turnChipModeFlg = false;
        document.getElementById("setTurnChipMode").style.backgroundColor = "";
        document.getElementById("mapEventEditConntainer").style.display = 'inline-block';
        document.getElementById("turnChipEditContainer").style.display = 'none';

    } else {
        turnChipModeFlg = true;
        document.getElementById("setTurnChipMode").style.backgroundColor = "red";
        document.getElementById("mapEventEditConntainer").style.display = 'none';
        document.getElementById("turnChipEditContainer").style.display = 'inline-block';
    }

}

//マップチップ交互の編集モードを切り替える（↑と似てるので注意）
var turnChipPutMode = true;//（↑と似てるので注意）
function setTurnChipPutMode(mode) {

    if (mode == "put" && turnChipPutMode == false) {
        turnChipPutMode = true;
        document.getElementById("setTurnChipPutModePut").style.backgroundColor = "red";
        document.getElementById("setTurnChipPutModeDel").style.backgroundColor = "";
        document.getElementById("currentMapChipBG").style.backgroundColor = "white";

    } else if (mode == "del" && turnChipPutMode == true) {
        turnChipPutMode = false;
        document.getElementById("setTurnChipPutModePut").style.backgroundColor = "";
        document.getElementById("setTurnChipPutModeDel").style.backgroundColor = "red";
        document.getElementById("currentMapChipBG").style.backgroundColor = "red";
    }

}

//現在マップチップセット
var crtChip = []; //現在マップの情報格納配列
function setCurrentMapChip(type, name, evt) {
    //クリックしたチップのurl取得
    document.getElementById("currentMapChipType").innerText = type;
    document.getElementById("currentMapChipName").innerText = name;
    document.getElementById("currentMapChip").src = evt.target.src;
    crtChip['type'] = type;
    crtChip['name'] = name;
    //crtChip['src'] = evt.target.src; //いらないんだった
}

//移動チップの編集コンテナを追加する
function addTargetMoveChipContainer() {
    var childEle = document.getElementById("addChildEle").firstElementChild.cloneNode(true);
    var parentDiv = document.getElementById("targetMoveChipContainerParent");
    parentDiv.appendChild(childEle);
    return ;
}

//移動チップの編集コンテナを削除する
//選択中
function deleteTargetMoveChipContainer() {
    //選択していない場合NG
    if (currentMoveChip == undefined) {
        alert('削除対象を選択してください');
        return;
    }

    if (!confirm('本当に削除しても良いですか？')) { 
        return;
    }

    currentMoveChip.remove();

    //マップの設定情報を描画
    reloadEditMap();

}

function quitAddTargetMoveChip() {

    //確認
    var ret = confirm('入力中の情報はリセットされます。よろしいですか？');
    if (!ret) return;

    //戻すよ
    currentMoveChip = undefined;

    setTargetMoveChipFlg = false;
    var mapDataContainer = document.getElementById("mapDataContainer");
    mapDataContainer.style.pointerEvents = '';
    mapDataContainer.style.backgroundColor = '';
    editEvent.innerHTML = '';
    editEvent.style.display = 'none';

    //画面リセット
    //マップを描画
    currentMapContext.drawImage(currentMapImage, 0, 0);

    //マップの設定情報を描画
    reloadEditMap();
}

//対象のチップを切り替える
var currentMoveChip; //選択中のコンテナ
function changeTargetMoveChip() {
    //選択したチップのコンテナを強調する。
    //内部で今選択中であることがわかるようにするのもここでやる
    var elems = document.getElementsByName("targetMoveChip");
    for(var i = 1; i <elems.length; i++){ //クローン用の0番目を回避するためにこんな書き方にしている。
        if (elems[i].checked) {
            elems[i].parentNode.style.backgroundColor = "yellow";
            currentMoveChip = elems[i].parentNode;
        } else {
            elems[i].parentNode.style.backgroundColor = "";
        }
        //elems[i].checked でラジオボタンの選択を確認できる
    }

    //画面リセット
    //マップを描画
    currentMapContext.drawImage(currentMapImage, 0, 0);

    //マップの設定情報を描画
    reloadEditMap();

    //最初のチップを描画
    var sposY = 0;
    var sposX = 0;
    var fromY = currentMoveChip.getElementsByClassName("fromY");
    Array.from(fromY).forEach(function(event1) {sposY = Number(event1.innerText);});
    var fromX = currentMoveChip.getElementsByClassName("fromX");
    Array.from(fromX).forEach(function(event1) {sposX = Number(event1.innerText);});
    // パスをリセット
    currentMapContext.beginPath () ;
    // レクタングルの座標(50,50)とサイズ(75,50)を指定
    currentMapContext.rect(sposX*mapLength ,sposY*mapLength , 32, 32);
    // 線の色
    currentMapContext.strokeStyle = "darkorange";
    // 線の太さ
    currentMapContext.lineWidth = 5;
    // 線を描画を実行
    currentMapContext.stroke() ;

    //動線を描画
    var orders = currentMoveChip.getElementsByClassName("orders");
    Array.from(orders).forEach(function(event) {

        // //加算用変数
        // var tmpFromY = 0;
        // var tmpFromX = 0;

        //ordersを1個ずつに分解、ループ、描画していく
        var charas = event.innerText.split('');

        for (var i=0; i<charas.length; i++) {
            if (charas[i] == "0" || charas[i] == "1") { //下か上
                charas[i] == "0" ? sposY++ : sposY--;

            } else if (charas[i] == "2" || charas[i] == "3") { //右か左
                charas[i] == "2" ? sposX++ : sposX--;

            } else {

            }

            ////クリックしたマップチップを枠で囲う
            // パスをリセット
            currentMapContext.beginPath () ;
            // レクタングルの座標(50,50)とサイズ(75,50)を指定
            currentMapContext.rect(sposX*mapLength ,sposY*mapLength , 32, 32);
            // 線の色
            currentMapContext.strokeStyle = "orange";
            // 線の太さ
            currentMapContext.lineWidth =  3;
            // 線を描画を実行
            currentMapContext.stroke() ;

        }
    });


}

//ムーブチップの情報を取得する。
function setTargetMoveChip(evt) {

    if (currentMoveChip == undefined) {
        alert("まずは対象を選択してください");
        return;
    }

    //start
    var undefinedFlg = true;
    var fromX = currentMoveChip.getElementsByClassName("fromX");
    Array.from(fromX).forEach(function(event) {
        if (event.innerText != ""){
            undefinedFlg = false;
        }
    });
    var fromY = currentMoveChip.getElementsByClassName("fromY");
    Array.from(fromY).forEach(function(event) {
        if (event.innerText != ""){
            undefinedFlg = false;
        }
    });
    if (currentMoveChip != undefined && !undefinedFlg) {
        var ret = confirm('fromが既に指定してあります。変更しますか？');
        if (!ret) return;

        //設定情報をリセット
        var toX = currentMoveChip.getElementsByClassName("toX");
        Array.from(toX).forEach(function(event) {event.innerText = "";});                 //toX
        var toY = currentMoveChip.getElementsByClassName("toY");
        Array.from(toY).forEach(function(event) {event.innerText = "";});                 //toY
        var orders = currentMoveChip.getElementsByClassName("orders");
        Array.from(orders).forEach(function(event) {event.innerText = "";});    //orders

        //画面リセット
        //マップを描画
        currentMapContext.drawImage(currentMapImage, 0, 0);
        //マップの設定情報を描画
        reloadEditMap();
    }

    //クリックした座標を取得する
    var mousePos = getMousePosition(currentMapCanvas, evt);
    //クリックしたマップチップを特定
    var tmpColNum = Math.floor(mousePos.x/mapLength);
    var tmpRowNum = Math.floor(mousePos.y/mapLength);


    ////クリックしたマップチップを枠で囲う
    // パスをリセット
    currentMapContext.beginPath () ;
    // レクタングルの座標(50,50)とサイズ(75,50)を指定
    currentMapContext.rect(tmpColNum*mapLength ,tmpRowNum*mapLength , 32, 32);
    // 線の色
    currentMapContext.strokeStyle = "darkorange";
    // 線の太さ
    currentMapContext.lineWidth = 5;
    // 線を描画を実行
    currentMapContext.stroke() ;

    //編集対象の情報を編集
    //currentMoveChip.getElementByIdを使う
    //書き込む

    //start
    var fromX = currentMoveChip.getElementsByClassName("fromX");
    Array.from(fromX).forEach(function(event) {event.innerText = tmpColNum;});
    var fromY = currentMoveChip.getElementsByClassName("fromY");
    Array.from(fromY).forEach(function(event) {event.innerText = tmpRowNum;});

}

//命令を増やす
//マップのリロードも行う。
function addOrder(order) {

    if (currentMoveChip == undefined) {
        alert('対象チップを選択してください');
        return;
    }

    var undefinedFlg = false;
    var fromY = currentMoveChip.getElementsByClassName("fromY");
    Array.from(fromY).forEach(function(event1) {
        if (event1.innerText == "") undefinedFlg = true;
    });
    var fromX = currentMoveChip.getElementsByClassName("fromX");
    Array.from(fromX).forEach(function(event1) {
        if (event1.innerText == "") undefinedFlg = true;
    });

    if (undefinedFlg) {
        alert('fromを指定してください');
        return;
    }

    //命令番号を追加していく
    var orders = currentMoveChip.getElementsByClassName("orders");
    Array.from(orders).forEach(function(event) {
        event.innerText = event.innerText + order;
    });

    //命令番号をループして、toの値をずらしていく（初期表示もこの方法で）
    //この時、toの値毎に、マップに動線をつけていく（初期表示もこの方法で）

    var orders = currentMoveChip.getElementsByClassName("orders");
    Array.from(orders).forEach(function(event) {

        //加算用変数
        var tmpFromY = 0;
        var tmpFromX = 0;

        var fromY = currentMoveChip.getElementsByClassName("fromY");
        Array.from(fromY).forEach(function(event1) {tmpFromY = Number(event1.innerText);});
        var fromX = currentMoveChip.getElementsByClassName("fromX");
        Array.from(fromX).forEach(function(event1) {tmpFromX = Number(event1.innerText);});


        //ordersを1個ずつに分解、ループ、加算していく
        var charas = event.innerText.split('');

        for (var i=0; i<charas.length; i++) {
            if (charas[i] == "0" || charas[i] == "1") { //下か上
                charas[i] == "0" ? tmpFromY++ : tmpFromY--;

            } else if (charas[i] == "2" || charas[i] == "3") { //右か左
                charas[i] == "2" ? tmpFromX++ : tmpFromX--;

            } else {//止
                //charas[i] == "4"
            }

            ////クリックしたマップチップを枠で囲う
            // パスをリセット
            currentMapContext.beginPath () ;
            // レクタングルの座標(50,50)とサイズ(75,50)を指定
            currentMapContext.rect(tmpFromX*mapLength ,tmpFromY*mapLength , 32, 32);
            // 線の色
            currentMapContext.strokeStyle = "orange";
            // 線の太さ
            currentMapContext.lineWidth =  3;
            // 線を描画を実行
            currentMapContext.stroke() ;

        }

        //加算済みの値をtoに入れる
        var toY = currentMoveChip.getElementsByClassName("toY");
        Array.from(toY).forEach(function(event1) {event1.innerText = tmpFromY;});
        var toX = currentMoveChip.getElementsByClassName("toX");
        Array.from(toX).forEach(function(event1) {event1.innerText = tmpFromX;});

    });
    
}

//命令を減らす
//マップのリロードも行う。
function delOrder() {

    if (currentMoveChip == undefined) {
        alert('対象チップを選択してください');
        return;
    }

    var undefinedFlg = false;
    var fromY = currentMoveChip.getElementsByClassName("fromY");
    Array.from(fromY).forEach(function(event1) {
        if (event1.innerText == "") undefinedFlg = true;
    });
    var fromX = currentMoveChip.getElementsByClassName("fromX");
    Array.from(fromX).forEach(function(event1) {
        if (event1.innerText == "") undefinedFlg = true;
    });

    if (undefinedFlg) {
        alert('fromを指定してください');
        return;
    }

    //命令番号を減らす
    var orders = currentMoveChip.getElementsByClassName("orders");
    Array.from(orders).forEach(function(event) {
    
        //ordersの最後を取っ払う
        var charas = event.innerText.split('');
        charas.pop();
        var tmp  = ""
        for (var i=0; i<charas.length; i++) {
            tmp = tmp + charas[i];
        }
        event.innerText = tmp;
    });

    //命令番号をループして、toの値をずらしていく（初期表示もこの方法で）
    //この時、toの値毎に、マップに動線をつけていく（初期表示もこの方法で）

    //マップを描画
    currentMapContext.drawImage(currentMapImage, 0, 0);

    //マップの設定情報を描画
    reloadEditMap();

    var orders = currentMoveChip.getElementsByClassName("orders");
    Array.from(orders).forEach(function(event) {

        //加算用変数
        var tmpFromY = 0;
        var tmpFromX = 0;

        var fromY = currentMoveChip.getElementsByClassName("fromY");
        Array.from(fromY).forEach(function(event1) {tmpFromY = Number(event1.innerText);});
        var fromX = currentMoveChip.getElementsByClassName("fromX");
        Array.from(fromX).forEach(function(event1) {tmpFromX = Number(event1.innerText);});
        // パスをリセット
        currentMapContext.beginPath () ;
        // レクタングルの座標(50,50)とサイズ(75,50)を指定
        currentMapContext.rect(tmpFromX*mapLength ,tmpFromY*mapLength , 32, 32);
        // 線の色
        currentMapContext.strokeStyle = "darkorange";
        // 線の太さ
        currentMapContext.lineWidth = 5;
        // 線を描画を実行
        currentMapContext.stroke() ;

        //ordersを1個ずつに分解、ループ、加算していく
        var charas = event.innerText.split('');

        for (var i=0; i<charas.length; i++) {
            if (charas[i] == "0" || charas[i] == "1") { //下か上
                charas[i] == "0" ? tmpFromY++ : tmpFromY--;

            } else if (charas[i] == "2" || charas[i] == "3") { //右か左
                charas[i] == "2" ? tmpFromX++ : tmpFromX--;

            } else {

            }

            ////クリックしたマップチップを枠で囲う
            // パスをリセット
            currentMapContext.beginPath () ;
            // レクタングルの座標(50,50)とサイズ(75,50)を指定
            currentMapContext.rect(tmpFromX*mapLength ,tmpFromY*mapLength , 32, 32);
            // 線の色
            currentMapContext.strokeStyle = "orange";
            // 線の太さ
            currentMapContext.lineWidth =  3;
            // 線を描画を実行
            currentMapContext.stroke() ;
        }

        //加算済みの値をtoに入れる
        var toY = currentMoveChip.getElementsByClassName("toY");
        Array.from(toY).forEach(function(event1) {event1.innerText = tmpFromY;});
        var toX = currentMoveChip.getElementsByClassName("toX");
        Array.from(toX).forEach(function(event1) {event1.innerText = tmpFromX;});

    });
}

//
function setFixDir(directionIndex){

    if (currentMoveChip == undefined) {
        alert('対象チップを選択してください');
        return;
    }

    var newMoveObjInfo = currentMoveChip.getElementsByClassName("fixDir");

    switch(directionIndex) {
        case '3':
            Array.from(newMoveObjInfo).forEach(function(event1) {
                event1.innerText = 'left';
            });
        break;
        case '2':
            Array.from(newMoveObjInfo).forEach(function(event1) {
                event1.innerText = 'right';
            });
        break;
        case '1':
            Array.from(newMoveObjInfo).forEach(function(event1) {
                event1.innerText = 'up';
            });
        break;
        case '0':
            Array.from(newMoveObjInfo).forEach(function(event1) {
                event1.innerText = 'down';
            });
        break;
    }
}

function delFixDir() {
    if (currentMoveChip == undefined) {
        alert('対象チップを選択してください');
        return;
    }
    var newMoveObjInfo = currentMoveChip.getElementsByClassName("fixDir");
    Array.from(newMoveObjInfo).forEach(function(event1) {
        event1.innerText = '';
    });
}

//新ムーブオブジェクト選択モードにする
var selectObjModeFlg = false;
function startSelectObjMode() {

    if (!confirm("開始すると、オブジェクトを選択するまでやめれません。よろしいですか？（後で直す、、）")) return;

    //選択していない場合、リターン
    if (currentMoveChip == undefined) {
        alert('対象チップを選択してください');
        return;
    }

    //フラグを変える（後で戻す）
    selectObjModeFlg = true;

    //赤文字にする（後で戻す）
    document.getElementById("startSelectObjMode").style.backgroundColor = "red";

    //背景をグレーアウト（後で戻す）
    var editEvent = document.getElementById("editEvent");
    editEvent.style.pointerEvents = 'none';
    editEvent.style.backgroundColor = 'gray';

}

function showSelectedNewMoveObjInfo(evt) {

    //情報を取得して、newMoveObjInfoに表示する
    //クリックした座標を取得する
    var mousePos = getMousePosition(currentMapCanvas, evt);
    //クリックしたマップチップを特定
    var tmpColNum = Math.floor(mousePos.x/mapLength);
    var tmpRowNum = Math.floor(mousePos.y/mapLength);

    //現在マップオブジェクトから、選択したマップの情報を取得
    var tmpCurrentMapTip = currrentMapObj[tmpRowNum][tmpColNum];

    if (tmpCurrentMapTip.hasOwnProperty('object')) {

        var newMoveObjInfo = currentMoveChip.getElementsByClassName("newMoveObjInfo");
        Array.from(newMoveObjInfo).forEach(function(event1) {
            var html = '';
            if (tmpCurrentMapTip.object.objName == "tool") {
            //ツール
                html += '<p>オブジェクトタイプ：ツール</p>';
                html += '<p>設定済みイベント一覧</p>';
                html += '<ol>';
                html += '<li class="registerdEventsForObj" onclick="selectRegisterdEvent(event, 0, true)">拾いイベント（固定）</li>';
                html += '</ol>';
                var objTxt = JSON.stringify(tmpCurrentMapTip.object);
                html += '<p style="width:200px; overflow: scroll;">オブジェクトtxt：<span class="objTxt" style="font-size:10px; color:red;">' + objTxt + '</span></p>';
            } else {
            //キャラクター
                html += '<p>オブジェクトタイプ：キャラクター</p>';
                html += '<p>キャラ名：' + tmpCurrentMapTip.object.charaName + '</p>';
                html += '<p>設定済みイベント一覧</p>';
                html += '<ol>';
                var evtIndex = 0;
                for( key in tmpCurrentMapTip.object.events ) {
                    html += '<li class="registerdEventsForObj" onclick="selectRegisterdEvent(event, \'' + evtIndex + '\', true)">' + key + '</li>'; //やるとしたら、editEvent2に表示する感じにする
                    evtIndex++;
                }
                html += '</ol>';
                var objTxt = JSON.stringify(tmpCurrentMapTip.object);
                html += '<p style="width:200px; overflow: scroll;">オブジェクトtxt：<span class="objTxt" style="font-size:10px; color:red;">' + objTxt + '</span></p>';
            }
            event1.innerHTML = html;
        });
        

    } else {
        console.log("オブジェクトはありません");
        return;
    }

    //マップからは、オブジェクトは削除する
    delete currrentMapObj[tmpRowNum][tmpColNum]['object'];

    //後で戻すのものを全部戻す
    //フラグ
    selectObjModeFlg = false;
    //赤文字
    document.getElementById("startSelectObjMode").style.backgroundColor = "";
    //背景
    var editEvent = document.getElementById("editEvent");
    editEvent.style.pointerEvents = '';
    editEvent.style.backgroundColor = '';

    //マップを際描画する
    currentMapContext.drawImage(currentMapImage, 0, 0);
    //マップの設定情報を描画
    reloadEditMap();

}

//選択したオブジェクトを削除する（コンテナから情報を消せばOK）
function deleteSelectObjMode() {

    //選択していない場合、リターン
    if (currentMoveChip == undefined) {
        alert('対象チップを選択してください');
        return;
    }

    var newMoveObjInfo = currentMoveChip.getElementsByClassName("newMoveObjInfo");
    Array.from(newMoveObjInfo).forEach(function(event1) {
        event1.innerHTML = "";
    });
}


//シーンイベントの編集コンテナを追加する
function addSceneEventContainer() {
    var childEle = document.getElementById("addChildEle").firstElementChild.cloneNode(true);
    var parentDiv = document.getElementById("targetSceneEventContainerParent");
    parentDiv.appendChild(childEle);
    return ;
}


//マップ交互チップをデータにセットする
function setTurnChipToData(evt) {

    //現在選択中のイベントをクリア
    // currentRegisteredEvent = '';

    //クリックした座標を取得する
    var mousePos = getMousePosition(currentMapCanvas, evt);
    //クリックしたマップチップを特定
    colNum = Math.floor(mousePos.x/mapLength);
    rowNum = Math.floor(mousePos.y/mapLength);

    //jsonを編集
    if (turnChipPutMode) {

        if (crtChip['name'] === undefined) {
            alert("チップを選択してください");
            return;
        }

        var turnChipObj = new Object();
        turnChipObj.name = crtChip['name'];

        if (crtChip['type'] == 'turnChip') {
            if (currrentMapObj[rowNum][colNum].hasOwnProperty('turnChipPass')) delete currrentMapObj[rowNum][colNum].turnChipPass;
            currrentMapObj[rowNum][colNum].turnChip = turnChipObj;
        } else if (crtChip['type'] == 'turnChipPass'){
            if (currrentMapObj[rowNum][colNum].hasOwnProperty('turnChip')) delete currrentMapObj[rowNum][colNum].turnChip;
            currrentMapObj[rowNum][colNum].turnChipPass = turnChipObj;
        } else {}

    } else {
        delete currrentMapObj[rowNum][colNum].turnChipPass;
        delete currrentMapObj[rowNum][colNum].turnChip;
    }

    //マップを描画
    currentMapContext.drawImage(currentMapImage, 0, 0);

    //マップの設定情報を描画
    reloadEditMap();

}

//BGM編集モードにする
var editBGMContainer = document.getElementById("editBGMContainer");
var editBGM = document.getElementById("editBGM");
var editBGMflg = false;
function editBgm() {
    //汎用音楽コンテナを開く
    if (!editBGMflg) {
        editBGMflg = true;
        editBGMContainer.innerHTML = getSoundLists();
        editBGMContainer.innerHTML += '<button onClick="saveBGM()">保存する</button>'; 
        editBGMContainer.style.display = "inline-block";
        editBGM.style.backgroundColor = 'red';
    } else {
        editBGMflg = false;
        editBGMContainer.style.display = "none";
        editBGM.style.backgroundColor = '';
    }
}

//BGMを保存する
function saveBGM() {

    if (document.getElementById("selectedSound").innerText == '') {
        alert('選択してね');
        return;
    }

    //最初だけ作成
    if (!projectDataObj.hasOwnProperty('mapBGM')) {
        projectDataObj['mapBGM'] = new Object();
    }
    projectDataObj['mapBGM'][currrentMapName] = document.getElementById("selectedSound").innerText;
    document.getElementById("mapBGM").innerText = projectDataObj['mapBGM'][currrentMapName];
    editBGMContainer.style.display = "none";
    editBGM.style.backgroundColor = '';
}

//カーソル位置を表示
var cursorPos = document.getElementById("cursorPos");
function showCursorPos(evt) {
    //クリックした座標を取得する
    var mousePos = getMousePosition(currentMapCanvas, evt);
    var x = mousePos.x;
    var y = mousePos.y;

    var tmpPositionX = Math.floor(x/mapLength);
    var tmpPositionY = Math.floor(y/mapLength);

    cursorPos.innerText = tmpPositionX + "：" + tmpPositionY;

}

//マップチップのデータを表示する
//param1 : クリック時イベント情報
function showMapTipData(evt) {

    // 現在選択中のイベントをクリア、colNum, rowNumを更新する前にリターンする必要がある
    if (setTargetMoveChipFlg) {
        setTargetMoveChip(evt);
        return;
    }

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

    if (turnChipModeFlg) {
        setTurnChipToData(evt);
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
        mapObject.innerHTML = '<p style="background-color: yellow;">==オブジェクト情報==</p>';
        mapObject.innerHTML += '<p>オブジェクト名：' + objName + '</p>';
        mapObject.innerHTML += '<img src="' + decodeURI(img.src) +'"></img>';
        mapObject.innerHTML += '<span id="deleteObject" onclick="deleteObject()">オブジェクトを削除する※注意</span>';
        if (objName == 'tool') {
            //拾いイベントだけ
            mapObject.innerHTML += '<li class="registerdEventsForObj" onclick="selectRegisterdEvent(event, 0, true)">拾いイベント（固定）</li>';
            //html += '<li class="registerdEventsForObj" onclick="selectRegisterdEvent(event, \'' + evtIndex + '\', true)">' + key + '</li>';
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
            mapObject.innerHTML += '<div id="mapObjEvent"></div>';
            var mapObjEvent = document.getElementById("mapObjEvent");
            //イベント追加ボタン
            mapObjEvent.innerHTML += '<p id="addEvent" onclick="addEvent(true)">イベントを追加</p>';
            //イベント削除ボタン
            mapObjEvent.innerHTML += '<p id="deleteEvent" onclick="deleteEvent(true)">イベントを削除</p>';
            //イベント順番マイナスボタン
            mapObjEvent.innerHTML += '<p class="changeEventOrder" onclick="changeEventOrder(event,\'minus\', true)">↑</p>';
            //イベント順番プラスボタン
            mapObjEvent.innerHTML += '<p class="changeEventOrder" onclick="changeEventOrder(event,\'plus\', true)">↓</p>';

        } else {
        }
        editObjectContainer.style.display = 'none';
        objLists.style.display = 'none';
    } else {
        mapObject.innerHTML = '<p>オブジェクトはありません</p>';
        mapObject.innerHTML += '<p id="addObject" onclick="addObject()">オブジェクトを追加</p>';
        editObjectContainer.style.display = 'none'; //デフォルトは必ず非表示
        //objLists.style.display = 'none';
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
    objLists.style.display = 'inline-block';
}

//オブジェクトをマップチップにセットする
function setObject(objectName) {
        //objLists.innerHTML = '';
        //イベント一覧を更新
        //updateMapEventHTML();
        var html = '';
        html += '<p>オブジェクトタイプ：' + objectName + '</p>';
        html += '<p>オブジェクト名：<span id="selectedObjName"></span></p>';
        html += '<span>選択中のオブジェクト</span><img id="selectedObjImage" src=""></img>';
        if (objectName == 'tool') {
            //currentMapTip.object.objName  ここで、選択中のマップチップに登録されているツールオブジェクトの、どうぐIDを取得。
            html += '<p>ツールを選択</p>';
            html += '<div class="imagesContainer">';
            var objTools = document.getElementById('toolObjContainer');
            html += objTools.innerHTML;
            //html += '<textarea id="tool"></textarea>'; //ここで、DBに登録のどうぐ一覧を取得オブジェクトを登録
            html += '</div>'
            html += '<div id="selectToolContainer">';
            html += document.getElementById('toolContainer').innerHTML;
            html += '</div>';
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
        html += '<p id="registObject" onclick="registObject(\'' + objectName + '\')">オブジェクトを登録する</p>';
        //オブジェクトセットの際は、イベント編集ウィンドウをお借りする
        editEvent.innerHTML = html;
        editEvent.style.display = 'inline-block';

        //ちょっとスマートではないけど
        if (objectName == 'tool') {
            var tableElement = document.getElementById('selectToolContainer');
            var toolsElement = tableElement.getElementsByClassName('tools');
            //var toolsElement = tableElement.tools;
            var tools = Array.from(toolsElement);
            var cnt = 0;
            tools.forEach(function(tool) {
                //最初は絶対「設定」のみ、setToolInfoで変更する（rpg-editor.bladeにべたがき）
                toolsElement[cnt].innerText= '設定';
                cnt++;
            });
        }
}

function registObject(objectName) {
    var fullSrc = decodeURI(document.getElementById('selectedObjImage').src);
    let file_type = fullSrc.split('.').pop();
    if (file_type != "png") {
        alert("オブジェクト画像を選択してください");
        return;
    }
    var imgName = fullSrc.split("/").reverse()[0]

    var toolId = null;
    if (objectName == 'tool') {
        //ツールオブジェクトの場合
        toolId = document.getElementById('selectedTool');
        if (toolId == null) {
            alert("ツールを設定してください。");
            return;
        }
    } else {
        //キャラオブジェクトの場合

    }

    //問題なかったらnew Object()する
    //オブジェクトをマップちっぷに登録
    currentMapTip.object = new Object();
    if (objectName == 'tool') {
        currentMapTip.object.toolId = toolId.value;
    }

    currentMapTip.object.objName = objectName;

    if (objectName == 'character') {
        var charaName = document.getElementById('selectedObjName').innerText;
        currentMapTip.object.charaName = charaName;
    }

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
    var html = '<p style="background-color: yellow;">==マップ情報==</p>';
    html += '<p>設定済みイベント一覧</p>';
    html += '<p style="color:red">※Transitionは最後に設定してください</p>';
    html += '<ol>';
    var evtIndex = 0;
    if (objFlg == false) {
        for( key in currentMapTip.events ) {
            html += '<li class="registerdEvents" onclick="selectRegisterdEvent(event, \'' + evtIndex + '\')">' + key + '</li>';
            evtIndex++;
        }
        html += '</ol>';
        mapEvent.innerHTML = html;
    } else {
        for( key in currentMapTip.object.events ) {
            html += '<li class="registerdEventsForObj" onclick="selectRegisterdEvent(event, \'' + evtIndex + '\', true)">' + key + '</li>';
            evtIndex++;
        }
        html += '</ol>';
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
function deleteEvent(objFlg = false) {

    if (currentRegisteredEvent == '') {
        alert('削除対象のイベントが選択されていません!');
        return;
    }

    if (confirm('選択中のイベントを削除しますか？')) {
        //削除
        //対象のイベントを取得（ただ削除されるだけ、イベント名の先頭のインデックス番号は変更しない）
        //var delTarget = evt.target.innerHTML;
        //登録ずみイベントのキーを取得
        if (objFlg == false) {
            var evtKeys = Object.keys(currentMapTip.events)
            //一致するイベントを削除
            for (var i=0; i<evtKeys.length; i++) {
                if (evtKeys[i] == currentRegisteredEvent) {
                    delete currentMapTip.events[currentRegisteredEvent];
                    currentRegisteredEvent = '';

                    //イベントが0個になったら、eventsプロパティごと削除（エディタ画面にて、イベント0なのに登録はされているとみなされるから）
                    evtKeys = Object.keys(currentMapTip.events)
                    if(evtKeys.length == 0) {
                        delete currentMapTip['events'];
                    }

                    break;
                }
            }
        } else {
            var evtKeys = Object.keys(currentMapTip.object.events)
            //一致するイベントを削除
            for (var i=0; i<evtKeys.length; i++) {
                if (evtKeys[i] == currentRegisteredEvent) {
                    delete currentMapTip.object.events[currentRegisteredEvent];
                    currentRegisteredEvent = '';

                    //イベントが0個になったら、eventsプロパティごと削除（エディタ画面にて、イベント0なのに登録はされているとみなされるから）
                    evtKeys = Object.keys(currentMapTip.object.events)
                    if(evtKeys.length == 0) {
                        delete currentMapTip.object['events'];
                    }

                    break;
                }
            }
        }
        //イベント編集ウィンドウを閉じる
        editEvent.style.display = 'none';
    }

    //ムーブ用のフラグを戻す
    var mapDataContainer = document.getElementById("mapDataContainer");
    mapDataContainer.style.pointerEvents = '';
    mapDataContainer.style.backgroundColor = '';
    startSelectObjModeFlg = false;
    setTargetMoveChipFlg = false;

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
                        wipeSrc = currentMapTip.events[orgEvtName].wipe;
                    }
                }
            } else {
                if (registeredFlg) {
                    talkContent = currentMapTip.object.events[orgEvtName].talkContent;
                    if (currentMapTip.object.events[orgEvtName].hasOwnProperty('wipe')){
                        wipeSrc = currentMapTip.object.events[orgEvtName].wipe;
                    }
                }
            }
            html += '<p>【会話】</p>';
            html += getWipeLists(wipeSrc);
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
                        wipeSrc = currentMapTip.events[orgEvtName].wipe;
                    }
                }
            } else {
                if (registeredFlg) {
                    questionContent = currentMapTip.object.events[orgEvtName].questionContent;
                    if (currentMapTip.object.events[orgEvtName].hasOwnProperty('wipe')){
                        wipeSrc = currentMapTip.object.events[orgEvtName].wipe;
                    }
                }
            }
            html += '<p>【質問】</p>';
            html += getWipeLists(wipeSrc);
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
            var toolEventType = "";  
            if (objFlg == false) {
                if (registeredFlg) {
                    //ツールのイベントタイプ（ひろいor使用）を取得
                    toolEventType = currentMapTip.events[orgEvtName].type;
                }
                //マップイベントのときの分岐（取得・使用）
                //取得の場合　単に道具を取得して終わり
                //使用の場合　道具を持ってるか判定（道具ウィンドウから選択）→okなら、マップ通り抜け設定をするか判定後、次のイベント。ngの場合、ヒントコメントを表示して後続イベントごと終了。

                //ラジオボタンでバリューチェンジ（取得or使用)
                html += '<div>';
                html += '<input type="radio" name="changeToolEventRadio" onChange="setToolEventContainer(\'get\')" value="getTool" ';
                if(toolEventType=="get") html += 'checked';
                html += '>もらいイベント';
                html += '<input type="radio" name="changeToolEventRadio" onChange="setToolEventContainer(\'use\')" value="useTool" ';
                if(toolEventType=="use") html += 'checked';
                html += '>使用イベント';
                html += '</div>';
                html += '<div id="ToolEventContainer"></div>';
                html += '<p id="registEvent" onclick="registEventToObj(\'tool\')">この内容でイベント登録</p>';
            } else {
                if (registeredFlg) {
                    //ツールのイベントタイプ（ひろいor使用）を取得
                    toolEventType = currentMapTip.object.events[orgEvtName].type;
                }
                //オブジェクトイベントのときの分岐
                //ラジオボタンでバリューチェンジ（取得or使用)
                html += '<div>';
                html += '<input type="radio" name="changeToolEventRadio" onChange="setToolEventContainer(\'get\')" value="getTool" ';
                if(toolEventType=="get") html += 'checked';
                html += '>もらいイベント';
                html += '<input type="radio" name="changeToolEventRadio" onChange="setToolEventContainer(\'use\')" value="useTool" ';
                if(toolEventType=="use") html += 'checked';
                html += '>使用イベント';
                html += '</div>';
                html += '<div id="ToolEventContainer"></div>';
                html += '<p id="registEvent" onclick="registEventToObj(\'tool\',true)">この内容でイベント登録</p>';
            }


            // if (objFlg == false) {
            //     html += '<p id="registEvent" onclick="registEventToObj(\'tool\')">この内容でイベント登録</p>';
            // } else {
            //     html += '<p id="registEvent" onclick="registEventToObj(\'tool\',true)">この内容でイベント登録</p>';
            // }
            editEvent.innerHTML = html;
            if (toolEventType!="") {
                //わかりづらいけど、既存イベントの場合
                setToolEventContainer(toolEventType, true, orgEvtName, objFlg);
            }
            break;

        case 'effect':
            var effectTypes = ['shake', 'reaction', 'animation'];
            html += '<p>【効果】</p>';
            var effectType = "";  
            if (objFlg == false) {
                if (registeredFlg) {
                    //エフェクトのタイプを取得
                    effectType = currentMapTip.events[orgEvtName].type;
                }
                //ラジオボタンでバリューチェンジ（取得or使用)
                html += '<div>';
                for (var i=0; i<effectTypes.length; i++) {
                    html += '<input type="radio" name="changeEffectEventRadio" onChange="setEffectEventContainer(\'' + effectTypes[i] + '\')" value="" ';
                    if(effectType==effectTypes[i]) html += 'checked';
                    html += '>' + effectTypes[i];                    
                }
                html += '</div>';
                html += '<div id="effectEventContainer">';
                //既存の設定があれば、ここで表示
                if (registeredFlg) {
                    //エフェクトのタイプを取得
                    switch(effectType){
                        case 'shake':
                            html += '<div id="selectEffectContainer">';
                            html += '<p>※画面揺れの場合、揺れタイプと、音を設定</p>';
                            html += getShakeTypeLists(currentMapTip.events[orgEvtName].shakeType);
                            html += getSoundLists(currentMapTip.events[orgEvtName].sound);
                            html += '</div>';
                            currentEffectType = 'shake';
                        break;
                        case 'reaction':
                            html += '<div id="selectEffectContainer">';
                            html += '<p>※リアクションの場合、音と、表示するマークを設定</p>';
                            html += getSoundLists(currentMapTip.events[orgEvtName].sound);
                            html += getReactionLists(currentMapTip.events[orgEvtName].reactType);
                            html += '</div>';
                            currentEffectType = 'reaction';
                        break;
                        case 'animation':
                        break;
                    }
                }
                html += '</div>';
                html += '<p id="registEvent" onclick="registEventToObj(\'effect\')">この内容でイベント登録</p>';
            } else {
                if (registeredFlg) {
                    //エフェクトのタイプを取得
                    effectType = currentMapTip.object.events[orgEvtName].type;
                }
                //ラジオボタンでバリューチェンジ（取得or使用)
                html += '<div>';
                for (var i=0; i<effectTypes.length; i++) {
                    html += '<input type="radio" name="changeEffectEventRadio" onChange="setEffectEventContainer(\'' + effectTypes[i] + '\')" value="" ';
                    if(effectType==effectTypes[i]) html += 'checked';
                    html += '>' + effectTypes[i];                    
                }
                html += '</div>';
                html += '<div id="effectEventContainer">';
                //既存の設定があれば、ここで表示
                if (registeredFlg) {
                    //エフェクトのタイプを取得
                    switch(effectType){
                        case 'shake':
                            html += '<div id="selectEffectContainer">';
                            html += '<p>※面揺れの場合、揺れタイプと、音を設定</p>';
                            html += getShakeTypeLists(currentMapTip.object.events[orgEvtName].shakeType);
                            html += getSoundLists(currentMapTip.object.events[orgEvtName].sound);
                            html += '</div>';
                            currentEffectType = 'shake';
                        break;
                        case 'reaction':
                            html += '<div id="selectEffectContainer">';
                            html += '<p>※リアクションの場合、音と、表示するマークを設定</p>';
                            html += getSoundLists(currentMapTip.object.events[orgEvtName].sound);
                            html += getReactionLists(currentMapTip.object.events[orgEvtName].reactType);
                            html += '</div>';
                            currentEffectType = 'reaction';
                        break;
                        case 'animation':
                        break;
                    }
                }
                html += '</div>';
                html += '<p id="registEvent" onclick="registEventToObj(\'effect\',true)">この内容でイベント登録</p>';
            }

            //htmlを反映
            editEvent.innerHTML = html;
            break;

        case 'move':
            //必要な情報
            //①移動情報（以下セットで、複数指定可能にする）
            //　1 対象のチップ（x, y）
            //　2 命令（右とか左とか、対応する数字の羅列とかで良いかな）
            //　3 移動後削除フラグ
            //　4 対象のチップにキャラオブジェクトがない場合に表示するキャラオブジェクト※
            //　　 ※いつものキャラオブジェクトの追加の仕方と全く一緒、イベントとかもつけれるようにする
            //②移動速度
            //  drawSpeed = 9 遅い;　drawSpeed = ６　中くらい　;drawSpeed = ３　速い
            //その他、備考
            //　命令の動線は、視覚的に分かるようにする（命令を追加or削除するたびに再描画だな）
            //　命令の動線の開始点と終着点は、数字でも表示するようにする（前回移動からのつなぎを正確に把握するため）


            //まずはムーブモード用に切り替える
            setTargetMoveChipFlg = true;
            var mapDataContainer = document.getElementById("mapDataContainer");
            mapDataContainer.style.pointerEvents = 'none';
            mapDataContainer.style.backgroundColor = 'gray';
            //イベントの操作ボタンだけはクリックできるようにしておく
            var mapEvent = document.getElementById("mapEvent");
            mapEvent.style.pointerEvents = 'auto';

            //情報取得
            var chips = [];
            var chipIndex = 1;
            var drawSpeed;
            if (objFlg == false) {
                if (registeredFlg) {
                    drawSpeed = currentMapTip.events[orgEvtName].drawSpeed;
                    while(currentMapTip.events[orgEvtName].hasOwnProperty('chip_'+chipIndex)) {
                        chips.push(currentMapTip.events[orgEvtName]['chip_'+chipIndex]);
                        chipIndex++;
                    }
                }
            } else {
                if (registeredFlg) {
                    drawSpeed = currentMapTip.object.events[orgEvtName].drawSpeed;
                    while(currentMapTip.object.events[orgEvtName].hasOwnProperty('chip_'+chipIndex)) {
                        chips.push(currentMapTip.object.events[orgEvtName]['chip_'+chipIndex]);
                        chipIndex++;
                    }
                }
            }

            //これは追加用の0番目のコンテナ（見えない）
            html += '<p>【移動】</p>';
            html += '<button onclick="quitAddTargetMoveChip()">やめる</button>';
            html += '<button onclick="addTargetMoveChipContainer()">追加する</button>';
            html += '<button onclick="deleteTargetMoveChipContainer()">削除する</button>';
            html += '<div id="targetMoveChipContainerParent">';
            html += '  <div id="addChildEle" style="display:none">';
            html += '    <div class="targetMoveChipContainer">';
            html += '      <input type="radio" name="targetMoveChip" value="" onChange="changeTargetMoveChip()"></input>';
            html += '      <p>対象のチップ</p>';
            html += '      <p>from（<span class="fromX"></span>：<span class="fromY"></span>）</p>';
            html += '      <p>to（<span class="toX"></span>：<span class="toY"></span>）</p>';
            html += '      <p>命令</p>';
            html += '      <p>';
            html += '        <button onclick="addOrder(\'3\')">←</button>';
            html += '        <button onclick="addOrder(\'2\')">→</button>';
            html += '        <button onclick="addOrder(\'1\')">↑</button>';
            html += '        <button onclick="addOrder(\'0\')">↓</button>';
            html += '        <button onclick="addOrder(\'4\')">止</button>';
            html += '        <button onclick="delOrder()">削除</button>';
            html += '      </p>';
            html += '      <p class="orders"></p>';
            html += '      <p>移動後削除<span style="color:red; font-size:10px;"> ※一つだけ選択</span></p>';
            html += '      <input type="checkbox" name="finishDelFlg" class="finishDelFlg" value="false" onChange="">しない</input>';
            html += '      <input type="checkbox" name="finishDelFlg" class="finishDelFlg" value="true" onChange="">する</input>';
            html += '    <p>スライド<span style="color:red; font-size:10px;"> ※一つだけ選択</span></p>';
            html += '    <input type="checkbox" name="slideFlg" class="slideFlg" value="false">しない</input>';
            html += '    <input type="checkbox" name="slideFlg" class="slideFlg" value="true">する</input>';
            html += '    <p>固定向き</p>';
            html += '    <p class="fixDir"></p>';
            html += '    <p>';
            html += '      <button onclick="setFixDir(\'3\')">←</button>';
            html += '      <button onclick="setFixDir(\'2\')">→</button>';
            html += '      <button onclick="setFixDir(\'1\')">↑</button>';
            html += '      <button onclick="setFixDir(\'0\')">↓</button>';
            html += '      <button onclick="delFixDir()">削除</button>';
            html += '    </p>';
            html += '      <p>追加オブジェクト</p>';
            html += '      <button id="startSelectObjMode" onclick="startSelectObjMode()">オブジェクト選択を開始</button>';
            html += '      <button id="deleteSelectObjMode" onclick="deleteSelectObjMode()">削除</button>';
            html += '      <div class="newMoveObjInfo"></div>';
            html += '    </div>';
            html += '  </div>';
            // editEvent.innerHTML = html;
            //設定済みのチップを格納
            for (var i=0; i<chips.length; i++) {
                var toX = Number(chips[i]['fromX']);
                var toY = Number(chips[i]['fromY']);
                var charas = chips[i]['orders'].split('');
                for (var j=0; j<charas.length; j++) {
                    if (charas[j] == "0" || charas[j] == "1") { //下か上
                        charas[j] == "0" ? toY++ : toY--;
                    } else if (charas[j] == "2" || charas[j] == "3") { //右か左
                        charas[j] == "2" ? toX++ : toX--;
                    } else {
                    }
                }
                html += '  <div class="targetMoveChipContainer">';
                html += '    <input type="radio" name="targetMoveChip" value="" onChange="changeTargetMoveChip()"></input>';
                html += '    <p>対象のチップ</p>';
                html += '    <p>from（<span class="fromX">'+ chips[i]['fromX']+'</span>：<span class="fromY">'+ chips[i]['fromY'] +'</span>）</p>';
                html += '    <p>to（<span class="toX">'+ toX +'</span>：<span class="toY">'+ toY +'</span>）</p>';
                html += '    <p>命令</p>';
                html += '    <p>';
                html += '      <button onclick="addOrder(\'3\')">←</button>';
                html += '      <button onclick="addOrder(\'2\')">→</button>';
                html += '      <button onclick="addOrder(\'1\')">↑</button>';
                html += '      <button onclick="addOrder(\'0\')">↓</button>';
                html += '      <button onclick="addOrder(\'4\')">止</button>';
                html += '      <button onclick="delOrder()">削除</button>';
                html += '    </p>';
                html += '    <p class="orders">'+ chips[i]['orders'] +'</p>';
                html += '    <p>移動後削除<span style="color:red; font-size:10px;"> ※一つだけ選択</span></p>';
                var notDel = '';
                var Del = '';
                chips[i]['finishDelFlg'] == "true" ? Del = 'checked' : notDel = 'checked';
                html += '    <input type="checkbox" name="finishDelFlg" class="finishDelFlg" value="false" '+ notDel +'>しない</input>';
                html += '    <input type="checkbox" name="finishDelFlg" class="finishDelFlg" value="true" '+ Del +'>する</input>';
                var notSlide = '';
                var slide = '';
                chips[i]['slideFlg'] == "true" ? slide = 'checked' : notSlide = 'checked';
                html += '    <p>スライド<span style="color:red; font-size:10px;"> ※一つだけ選択</span></p>';
                html += '    <input type="checkbox" name="slideFlg" class="slideFlg" value="false" '+ notSlide +'>しない</input>';
                html += '    <input type="checkbox" name="slideFlg" class="slideFlg" value="true" '+ slide +'>する</input>';
                html += '    <p>固定向き</p>';
                html += '    <p class="fixDir">'+ chips[i]['fixDir'] +'</p>';
                var fixDir = '';
                html += '    <p>';
                html += '      <button onclick="setFixDir(\'3\')">←</button>';
                html += '      <button onclick="setFixDir(\'2\')">→</button>';
                html += '      <button onclick="setFixDir(\'1\')">↑</button>';
                html += '      <button onclick="setFixDir(\'0\')">↓</button>';
                html += '      <button onclick="delFixDir()">削除</button>';
                html += '    </p>';
                html += '    <p>追加オブジェクト</p>';
                html += '      <button id="startSelectObjMode" onclick="startSelectObjMode()">オブジェクト選択を開始</button>';
                html += '    <button id="deleteSelectObjMode" onclick="deleteSelectObjMode()">削除</button>';
                html += '    <div class="newMoveObjInfo">';
                if (chips[i].hasOwnProperty('newMoveObj')) {
                    if (chips[i]['newMoveObj']['objName'] == "tool") {
                    //ツール
                        html += '      <p>オブジェクトタイプ：ツール</p>';
                        html += '      <p>設定済みイベント一覧</p>';
                        html += '      <ol>';
                        html += '      <li class="registerdEventsForObj" onclick="selectRegisterdEvent(event, 0, true)">拾いイベント（固定）</li>';
                        html += '      </ol>';
                        var objTxt = JSON.stringify(chips[i]['newMoveObj']);
                        html += '      <p style="width:200px; overflow: scroll;">オブジェクトtxt：<span class="objTxt" style="font-size:10px; color:red;">' + objTxt + '</span></p>';                        
                    } else {
                    //キャラクター
                        html += '      <p>オブジェクトタイプ：キャラクター</p>';
                        html += '      <p>キャラ名：' + chips[i]['newMoveObj']['charaName'] + '</p>';
                        html += '      <p>設定済みイベント一覧</p>';
                        html += '      <ol>';
                        var evtIndex = 0;
                        for( key in chips[i]['newMoveObj']['events'] ) {
                            html += '      <li class="registerdEventsForObj" onclick="selectRegisterdEvent(event, \'' + evtIndex + '\', true)">' + key + '</li>'; //やるとしたら、editEvent2に表示する感じにする
                            evtIndex++;
                        }
                        html += '      </ol>';
                        var objTxt = JSON.stringify(chips[i]['newMoveObj']);
                        html += '      <p style="width:200px; overflow: scroll;">オブジェクトtxt：<span class="objTxt" style="font-size:10px; color:red;">' + objTxt + '</span></p>';
                    }
                }
                html += '    </div>';
                //オブジェクトセットの際は、イベント編集ウィンドウをお借りする
                // editEvent.innerHTML = html;
                html += '  </div>';
            }
            html += '</div>';
            var slow = '';
            var normal = '';
            var fast = '';
            drawSpeed == "9" ? slow = 'checked' : drawSpeed == "6" ? normal = 'checked' : fast = 'checked';
            html += '<p>移動速度</p>';
            html += '<input type="radio" name="moveSpeed" class="moveSpeed" value="9" '+ slow +'>遅い</input>';
            html += '<input type="radio" name="moveSpeed" class="moveSpeed" value="6" '+ normal +'>普通</input>';
            html += '<input type="radio" name="moveSpeed" class="moveSpeed" value="3" '+ fast +'>速い</input>';
            if (objFlg == false) {
                html += '<p id="registEvent" onclick="registEventToObj(\'move\')">この内容でイベント登録</p>';
            } else {
                html += '<p id="registEvent" onclick="registEventToObj(\'move\',true)">この内容でイベント登録</p>';
            }
            editEvent.innerHTML = html;
            break;

        case 'scene':
            //カットシーン
            //トーク（複数）
            //エフェクト（ズビシッみたいな）

            //情報取得
            var cutSceneSrc = '';
            var sceneEvts = [];
            var sceneEvtIndex = 1;
            if (objFlg == false) {
                if (registeredFlg) {
                    while(currentMapTip.events[orgEvtName].hasOwnProperty('sceneEvt_'+sceneEvtIndex)) {
                        sceneEvts.push(currentMapTip.events[orgEvtName]['sceneEvt_'+sceneEvtIndex]);
                        cutSceneSrc = currentMapTip.events[orgEvtName]['cutSceneSrc'];
                        sceneEvtIndex++;
                    }
                }
            } else {
                if (registeredFlg) {
                    while(currentMapTip.object.events[orgEvtName].hasOwnProperty('sceneEvt_'+sceneEvtIndex)) {
                        sceneEvts.push(currentMapTip.object.events[orgEvtName]['sceneEvt_'+sceneEvtIndex]);
                        cutSceneSrc = currentMapTip.object.events[orgEvtName]['cutSceneSrc'];
                        sceneEvtIndex++;
                    }
                }
            }

            //これは追加用の0番目のコンテナ（見えない）
            html += '<p>【シーン】</p>';
            html += getCutSceneLists(cutSceneSrc);//一応シーンもスペシャルスキルも全部選択肢に入れる。カットシーンで必殺技のイメージを使いたいケースも考えられるから。
            // html += '<button onclick="quitAddTargetMoveChip()">やめる</button>';
            html += '<button onclick="addSceneEventContainer()">追加する</button>';
            html += '<button onclick="deleteSceneEventContainer()">削除する</button>';
            html += '<div id="targetSceneEventContainerParent">';
            html += '  <div id="addChildEle" style="display:none">';
            html += '    <div class="targetSceneEventContainer">';
            html +=        getWipeLists();
            html += '      <p>会話の内容を入力</p>';
            html += '      <textarea id="talk" class="talkContent"></textarea>';
            html += '      <p>エフェクトを選択</p>';
            html +=        getShakeTypeLists();
            html +=        getSoundLists();
            html += '    </div>';
            html += '  </div>';
            //設定済みのシーンイベントを格納
            for (var i=0; i<sceneEvts.length; i++) {
                html += '  <div class="targetSceneEventContainer">';
                html +=      getWipeLists(sceneEvts[i].wipeSrc);
                html += '    <p>会話の内容を入力</p>';
                if (sceneEvts[i].hasOwnProperty("talkContent")){
                    html += '<textarea id="talk" class="talkContent">' + sceneEvts[i].talkContent + '</textarea>'; //あれば
                } else {
                    html += '<textarea id="talk" class="talkContent"></textarea>';
                }                
                html += '    <p>エフェクトを選択</p>';
                if (sceneEvts[i].hasOwnProperty("shakeType")){
                    html += getShakeTypeLists(sceneEvts[i].shakeType); //あれば
                } else {
                    html += getShakeTypeLists();
                }
                if (sceneEvts[i].hasOwnProperty("sound")) {
                    html += getSoundLists(sceneEvts[i].sound); //あれば
                } else {
                    html += getSoundLists();
                }
                html += '  </div>';
            }
            html += '</div>';
            if (objFlg == false) {
                html += '<p id="registEvent" onclick="registEventToObj(\'scene\')">この内容でイベント登録</p>';
            } else {
                html += '<p id="registEvent" onclick="registEventToObj(\'scene\',true)">この内容でイベント登録</p>';
            }
            editEvent.innerHTML = html;
            break;

        case 'changeMainChara':
            //情報取得
            var mainCharaName = '';
            if (objFlg == false) {
                if (registeredFlg) {
                    mainCharaName = currentMapTip.events[orgEvtName].name;
                }
            } else {
                if (registeredFlg) {
                    mainCharaName = currentMapTip.object.events[orgEvtName].name;
                }
            }
            html += '<p>【主人公変更】</p>';
            html += getCharaObjectsForMainChara(mainCharaName);//一応シーンもスペシャルスキルも全部選択肢に入れる。カットシーンで必殺技のイメージを使いたいケースも考えられるから。
            if (objFlg == false) {
                html += '<p id="registEvent" onclick="registEventToObj(\'changeMainChara\')">この内容でイベント登録</p>';
            } else {
                html += '<p id="registEvent" onclick="registEventToObj(\'changeMainChara\',true)">この内容でイベント登録</p>';
            }
            editEvent.innerHTML = html;


            break;
        case '拾いイベント（固定）':
            html += '<p>【拾いイベント（固定）】</p>';
            var imgName = currentMapTip.object.imgName;
            var img = document.getElementById(imgName);
            //var src = document.getElementById(currentMapTip.object.imgName)
            html += '<span>選択中のオブジェクト</span><img id="selectedObjImage" src="' + decodeURI(img.src) +'"></img>';
            html += '<p>ツールを選択</p>';
            html += '<div class="imagesContainer">';
            var objTools = document.getElementById('toolObjContainer');
            html += objTools.innerHTML;
            html += '</div>';
            html += '<div id="selectToolContainer">';
            html += '<form>';
            html += document.getElementById('toolContainer').innerHTML;
            html += '</div>';
            html += '</form>';
            html += '<p id="registEvent" onclick="registObject(\'tool\')">この内容でイベント登録</p>';
            //html += '<p id="registEvent" onclick="registEventToObj(\'拾いイベント（固定）\',true)">ここに来たよ</p>';
            editEvent.innerHTML = html;

            var tableElement = document.getElementById('selectToolContainer');
            var toolsElement = tableElement.getElementsByClassName('tools');
            //var toolsElement = tableElement.tools;
            var tools = Array.from(toolsElement);
            var cnt = 0;
            var toolId = currentMapTip.object.toolId;
            tools.forEach(function(tool) {
                if (tool.value == toolId) {
                    toolsElement[cnt].innerHTML= '設定中のツール<input type="hidden" id="selectedTool" value="'+toolId+'"></input>'; //すげー不細工だけど
                } else {
                    toolsElement[cnt].innerHTML= '設定';
                }
                cnt++;
            });
            break;
    }
}

//選択中ワイプ画像をリセット
function resetWipe(evt) {
    evt.target.nextElementSibling.nextElementSibling.src = '';
}

function resetCutScene(evt) {
    evt.target.nextElementSibling.nextElementSibling.src = '';
}

function resetSound(evt) {
    evt.target.nextElementSibling.nextElementSibling.innerText = '';
}

function resetShakeType(evt) {
    evt.target.nextElementSibling.nextElementSibling.innerText = '';
}

function resetReaction(evt) {
    evt.target.nextElementSibling.nextElementSibling.innerText = '';
}

var currentEffectType = '';
function setEffectEventContainer(type, exsistEvtFlg=false, evtNameKey='', objFlg=false) {
    if(!exsistEvtFlg) {
        var res = confirm('入力中の内容は消えてしまいます。よろしいですか？');
        if(!res) return;
    }

    //typeのhtmlを作成
    var html = '';
    var effectEventContainer = document.getElementById('effectEventContainer');

    switch (type) {
        //画面揺れ
        case 'shake':
            html += '<div id="selectEffectContainer">';
            html += '<p>※画面揺れの場合、揺れタイプと、音を設定</p>';
            html += getShakeTypeLists();
            html += getSoundLists();
            html += '</div>';
            effectEventContainer.innerHTML = html;
            effectEventContainer.style.display = 'inline-block';
        break;

        //リアクション
        case 'reaction':
            html += '<div id="selectEffectContainer">';
            html += '<p>※リアクションの場合、音と、表示するマークを設定</p>';
            html += getSoundLists();
            html += getReactionLists();
            html += '</div>';
            effectEventContainer.innerHTML = html;
            effectEventContainer.style.display = 'inline-block';
        break;

        //アニメーション
        case 'animation':

        break;
    }

    currentEffectType = type;
}

//////////////////////////////////エレメントの配置位置で表示エレメントを特定する（複数コンテナに対応するため）start
function getWipeLists(wipeSrc = '') {
    var html = "";
    if (wipeSrc != '') wipeSrc = decodeURI(document.getElementById(wipeSrc).src);
    html += '<p>ワイプを選択（なしでもOK）</p>';
    html += '<button onclick="resetWipe(event)">ワイプ削除</button>';
    html += '<p>選択中のワイプ</p>';
    html += '<img id="selectedWipeImage" class="selectedWipeImage" src="' + wipeSrc + '"></img>';
    html += '<div class="imagesContainer">';
    html += document.getElementById('wipeContainer').innerHTML;
    html += '</div>';
    return html;
}


//rpg-playerの、public/sounds以下の音源を取得
function getSoundLists(selectedSound = '') {
    var html = "";
    html += '<button onclick="resetSound(event)">サウンド削除</button>';
    html += '<p>選択中のサウンド</p>';
    html += '<p id="selectedSound" class="selectedSound" style="color: blue">' + selectedSound + '</p>';
    html += '<div id="soundLists">';
    html += document.getElementById("soundContainer").innerHTML;
    html += '</div>';
    return html;
}

//揺れタイプの一覧を返却
function getShakeTypeLists(selectedShakeType = '') {
    var html = "";
    html += '<button onclick="resetShakeType(event)">揺れタイプ削除</button>';
    html += '<p>選択中の揺れタイプ</p>';
    html += '<p id="selectedShakeType" class="selectedShakeType" style="color: blue">' + selectedShakeType + '</p>';
    html += '<div id="shakeTypeLists">';
    html += '<ol>';
    html += '<li onclick="setShakeTypeInfo(event, \'v\')">縦揺れ</li>';
    html += '<li onclick="setShakeTypeInfo(event, \'h\')">横揺れ</li>';
    html += '</ol>';
    html += '</div>';
    return html;
}

//リアクションの一覧を返却
function getReactionLists(selectedReaction = '') {
    var html = "";
    html += '<button onclick="resetReaction(event)">リアクション削除</button>';
    html += '<p>選択中のリアクション</p>';
    html += '<p id="selectedReaction" class="selectedReaction" style="color: blue">' + selectedReaction + '</p>';
    html += '<div id="reactionLists">';
    html += '<ol>';
    html += '<li onclick="setReactionInfo(event, \'びっくり\')">びっくり</li>';
    html += '<li onclick="setReactionInfo(event, \'ハート\')">ハート</li>';
    html += '<li onclick="setReactionInfo(event, \'いかり\')">いかり</li>';
    html += '<li onclick="setReactionInfo(event, \'汗\')">汗</li>';
    html += '</ol>';
    html += '</div>';
    return html;   
}


function getCutSceneLists(cutSceneSrc = '') {
    var html = "";
    if (cutSceneSrc != '') cutSceneSrc = decodeURI(document.getElementById(cutSceneSrc).src);
    html += '<button onclick="resetCutScene(event)">カットシーン削除</button>';
    html += '<p>選択中のカットシーン</p>';
    html += '<img id="selectedCutScene" class="selectedCutScene" src="' + cutSceneSrc + '"></img>';
    html += '<div id="cutSceneLists">';
    html += document.getElementById("cutScenes").innerHTML; //シーンもスペシャルスキルも包括しているコンテナであることに注意
    html += '</div>';
    return html;
}


function getCharaObjectsForMainChara(mainCharaName='') {
    var otherHtml = "";
    var mainHtml = "";
    mainHtml += '<p>変更メインキャラ</p>'
    mainHtml += '<img src="" id="newMainChara" alt="">';
    mainHtml += '<br>'
    // if (cutSceneSrc != '') cutSceneSrc = decodeURI(document.getElementById(cutSceneSrc).src);
    var charaElements = document.getElementsByClassName('obj_charas');
    var charas = Array.from(charaElements);
    charas.forEach(function(chara) {
        otherHtml += '<img src="'+chara.src+'" onclick="setChangeMainChara(\''+chara.src+'\', \''+chara.alt+'\')">'; 
        if (chara.alt == mainCharaName) {
            mainHtml = '<p>変更メインキャラ</p>'
            mainHtml += '<img src="'+chara.src+'" id="newMainChara" alt="'+chara.alt+'">';
            mainHtml += '<br>'
        }
    });
    mainHtml += otherHtml; 
    return mainHtml; 
}

//選択したオブジェクトを、選択中オブジェクトに表示する
function selectObjectImage(evt) {
    var selectedObjImage = document.getElementById('selectedObjImage');
    var selectedObjName = document.getElementById('selectedObjName');
    // var tmp = decodeURI(evt.target.src);
    var tmp = decodeURI(evt.target.src);
    selectedObjImage.src = tmp;
    selectedObjName.innerText = evt.target.alt;
    
}

//////////////////////////////////エレメントの配置位置で表示エレメントを特定する（複数コンテナに対応するため）kugiri
//選択したワイプを、選択中ワイプに表示する
function selectWipeImage(evt) {
    var selectedWipeImage = evt.target.parentNode.parentNode.previousElementSibling;
    var tmp = decodeURI(evt.target.src);
    selectedWipeImage.src = tmp;
    
}

//サウンド情報をセット
function setSoundInfo(evt, type, sub, file) {
    var selectedSound = evt.target.parentNode.parentNode.previousElementSibling;
    selectedSound.innerText = type + '/' + sub + '/' + file;
}

//揺れタイプ情報をセット
function setShakeTypeInfo(evt, type) {
    var selectedShakeType = evt.target.parentNode.parentNode.previousElementSibling;
    selectedShakeType.innerText = type;
}

//リアクション情報をセット
function setReactionInfo(evt, type) {
    var selectedReaction = evt.target.parentNode.parentNode.previousElementSibling;
    selectedReaction.innerText = type;
}

//カットシーン情報をセット
function selectCutSceneImage(evt) {
    var selectedCutScene = evt.target.parentNode.parentNode.parentNode.previousElementSibling;
    var tmp = decodeURI(evt.target.src);
    selectedCutScene.src = tmp;
}

//変更対象の主人公をセット
function setChangeMainChara(charaSrc, charaName) {
    document.getElementById('newMainChara').src = charaSrc;
    document.getElementById('newMainChara').alt = charaName;
}

//////////////////////////////////エレメントの配置位置で表示エレメントを特定する（複数コンテナに対応するため）end


function sound(soundId) {
    document.getElementById(soundId).currentTime = 0;
    document.getElementById(soundId).play();
}


var toolEventType = '';
//ツールイベント設定コンテナを表示する
//引数：ツールイベントタイプ, 既存イベントフラグ（既存ならtrue）, イベントキー（既存の場合に使用、ちょっと無理やりな実装）, オブジェクトフラグ（既存の場合に使用、同じくちょっと無理やり）
function setToolEventContainer(type, exsistEvtFlg=false, evtNameKey='', objFlg=false) {
    if(!exsistEvtFlg) {
        var res = confirm('入力中の内容は消えてしまいます。よろしいですか？');
        if(!res) return;
    }

    //typeのhtmlを作成
    var html = '';
    var ToolEventContainer = document.getElementById('ToolEventContainer');

    switch (type) {
        //getの場合、以下をhtmlにセット
        //道具一覧
        case 'get':
            html += '<div id="selectToolContainer">';
            html += document.getElementById('toolContainer').innerHTML;
            html += '</div>';
            ToolEventContainer.innerHTML = html;
            ToolEventContainer.style.display = 'inline-block';

            var toolId = "";
            if (exsistEvtFlg) {
                if (!objFlg) {
                    toolId = currentMapTip.events[evtNameKey].toolId;
                } else {
                    toolId = currentMapTip.object.events[evtNameKey].toolId;
                }
            }

            //ちょっとスマートではないけど
            var tableElement = document.getElementById('selectToolContainer');
            var toolsElement = tableElement.getElementsByClassName('tools');
            //var toolsElement = tableElement.tools;
            var tools = Array.from(toolsElement);
            var cnt = 0;
            if (exsistEvtFlg) {
                tools.forEach(function(tool) {
                    if (tool.value == toolId) {
                        toolsElement[cnt].innerHTML= '設定中のツール<input type="hidden" id="selectedTool" value="'+toolId+'"></input>';
                    } else {
                        toolsElement[cnt].innerHTML= '設定';
                    }
                    cnt++;
                });
            } else {
                tools.forEach(function(tool) {
                    //最初は絶対「設定」のみ、setToolInfoで変更する（rpg-editor.bladeにべたがき）
                    toolsElement[cnt].innerText= '設定';
                    cnt++;
                });
            }
        break;

        case 'use':
        //useの場合、以下をhtmlにセット
        //道具一覧、持っていた時のセリフ（ワイプ込）、持っていない時のセリフ（ワイプ込）、使用後削除フラグ、使用後通り抜けフラグ
            var toolId = "";
            var OKtalkContent = "";
            var NGtalkContent = "";
            var delToolFlg = "";
            var wipeSrc = "";
            if (exsistEvtFlg) {
                if (!objFlg) {
                    toolId = currentMapTip.events[evtNameKey].toolId;
                    OKtalkContent = currentMapTip.events[evtNameKey].OKtalkContent;
                    NGtalkContent = currentMapTip.events[evtNameKey].NGtalkContent;
                    delToolFlg = currentMapTip.events[evtNameKey].delToolFlg;
                    if (currentMapTip.events[evtNameKey].hasOwnProperty('wipe')) {
                        var wipe = currentMapTip.events[evtNameKey].wipe;
                        wipeSrc = currentMapTip.events[evtNameKey].wipe;
                    }
                } else {
                    toolId = currentMapTip.object.events[evtNameKey].toolId;
                    OKtalkContent = currentMapTip.object.events[evtNameKey].OKtalkContent;
                    NGtalkContent = currentMapTip.object.events[evtNameKey].NGtalkContent;
                    delToolFlg = currentMapTip.object.events[evtNameKey].delToolFlg;
                    if (currentMapTip.object.events[evtNameKey].hasOwnProperty('wipe')) {
                        var wipe = currentMapTip.object.events[evtNameKey].wipe;
                        wipeSrc = currentMapTip.object.events[evtNameKey].wipe;
                    }
                }

            }

            html += '※トリガー進入の際は、一歩戻ることに注意！';
            html += '<div id="selectToolContainer">';
            html += document.getElementById('toolContainer').innerHTML;
            html += '</div>';
            html += '<textarea id="OKtalkContent" placeholder="OKの場合" >'+OKtalkContent+'</textarea>';
            html += '<textarea id="NGtalkContent" placeholder="NGの場合" >'+NGtalkContent+'</textarea>';
            if (delToolFlg=="" || delToolFlg==0) {
                html += '<select id="delToolFlg" onChange=""><option value="0" checked>使用後に削除しない</option><option value="1">使用後に削除する</option></select>';
            } else {
                html += '<select id="delToolFlg" onChange=""><option value="0">使用後に削除しない</option><option value="1" selected>使用後に削除する</option></select>';
            }
            //var wipeSrc = '';
            html += getWipeLists(wipeSrc);
            ToolEventContainer.innerHTML = html;
            ToolEventContainer.style.display = 'inline-block';

            //ちょっとスマートではないけど
            var tableElement = document.getElementById('selectToolContainer');
            var toolsElement = tableElement.getElementsByClassName('tools');
            //var toolsElement = tableElement.tools;
            var tools = Array.from(toolsElement);
            var cnt = 0;
            if (exsistEvtFlg) {
                tools.forEach(function(tool) {
                    if (tool.value == toolId) {
                        toolsElement[cnt].innerHTML= '設定中のツール<input type="hidden" id="selectedTool" value="'+toolId+'"></input>';
                    } else {
                        toolsElement[cnt].innerHTML= '設定';
                    }
                    cnt++;
                });
            } else {
                tools.forEach(function(tool) {
                    //最初は絶対「設定」のみ、setToolInfoで変更する（rpg-editor.bladeにべたがき）
                    toolsElement[cnt].innerText= '設定';
                    cnt++;
                });
            }
        break;
    }

    toolEventType = type;

}

function setToolInfo(evt, toolId) {
    //currentMapTip.object.toolId = toolId;
    var tableElement = document.getElementById('selectToolContainer');
    var toolsElement = tableElement.getElementsByClassName('tools');
    //var toolsElement = tableElement.tools;
    var tools = Array.from(toolsElement);
    var cnt = 0;
    tools.forEach(function(tool) {
        if (tool.value == toolId) {
            toolsElement[cnt].innerHTML= '設定中のツール<input type="hidden" id="selectedTool" value="'+toolId+'"></input>'; //すげー不細工だけど
        } else {
            toolsElement[cnt].innerHTML= '設定';
        }
        cnt++;
    });
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
    //イベントを持っていなかったら
        for (var j=0; j<maps.length; j++) {
            if (maps[j].alt == mapName) {
                transitionMapImage.src = maps[j].getAttribute('src');
            }
        }
    } else {
    //イベントを持っていたら
        var keys = Object.keys(currentMapTip.events);
        for (var i=0; i<keys.length; i++) {
            if (keys[i] == orgEvtName) {
            //既存の遷移イベントと一致したら
                for (var j=0; j<maps.length; j++) {
                    if (currentMapTip.events[orgEvtName].transitionMap == mapName) {
                    //既存の遷移先イベントのマップと一致したら
                    //既存の遷移先データをセット
                        for (var k=0; k<maps.length; k++) {
                            if (maps[k].alt == mapName) {
                                transitionMapImage.src = maps[k].getAttribute('src');
                            }
                        }
                        var transitionX = currentMapTip.events[orgEvtName].transitionX;
                        var transitionY = currentMapTip.events[orgEvtName].transitionY;
                        document.getElementById('transitionX').innerHTML = transitionX;
                        document.getElementById('transitionY').innerHTML = transitionY;

                        var directions = ['up','right','down','left'];
                        var transitionDirection = currentMapTip.events[orgEvtName].transitionDirection;
                        for (var l=0; l<directions.length; l++) {
                            if (directions[l] == transitionDirection) {
                                document.getElementById('transitionDirection').selectedIndex = l;   
                            }
                        }
                    }
                }
            //break;
            } else {
            //既存の遷移イベントと一致しない場合、
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
    
    //キャンバスの大きさを更新
    transitionMapCanvas.height = transitionMapImage.naturalHeight;
    transitionMapCanvas.width = transitionMapImage.naturalWidth;
    //新しいマップを描画
    transitionMapContext.drawImage(transitionMapImage, 0, 0);
}

//イベント持ち、オブジェクト持ちのマップチップ上に、それらを表示する
function drawEvtAndObjAndTurnChip() {
    for (var i=0; i<Object.keys(currrentMapObj).length; i++) {
        for (var j=0; j<Object.keys(currrentMapObj[i]).length; j++) {
            //一番最初に、マップ分類に近いマップ交互のデータを描画
            if (currrentMapObj[i][j].hasOwnProperty('turnChip')) {
                var chipDirName;
                var img;
                chipDirName = currrentMapObj[i][j].turnChip.name;
                img = document.getElementById(chipDirName).nextElementSibling;
                //currentMapContext.drawImage(img, j*mapLength ,i*mapLength - 8); // 立体的に見せるため、縦にちょっとずらす。
                currentMapContext.drawImage(img, j*mapLength ,i*mapLength); // やっぱ立体的に見せない
                drawTags('turnChip',j,i);
            }
            if (currrentMapObj[i][j].hasOwnProperty('turnChipPass')) {
                var chipDirName;
                var img;
                chipDirName = currrentMapObj[i][j].turnChipPass.name;
                img = document.getElementById(chipDirName).nextElementSibling;
                //currentMapContext.drawImage(img, j*mapLength ,i*mapLength - 8); // 立体的に見せるため、縦にちょっとずらす。
                currentMapContext.drawImage(img, j*mapLength ,i*mapLength); // やっぱ立体的に見せない
                drawTags('turnChip',j,i);
            }
            //その後にオブジェクト、イベントを描画
            if (currrentMapObj[i][j].hasOwnProperty('object')) {
                var objImgName;
                var img;
                if (currrentMapObj[i][j].object.hasOwnProperty('imgName')) {
                    objImgName = currrentMapObj[i][j].object.imgName;
                    img = document.getElementById(objImgName);
                    //currentMapContext.drawImage(img, j*mapLength ,i*mapLength - 8); // 立体的に見せるため、縦にちょっとずらす。
                    currentMapContext.drawImage(img, j*mapLength ,i*mapLength); // やっぱ立体的に見せない
                } else {
                    //多分もうここにくることはない
                    alert(i + ":" + j );
                }
            }
            if (currrentMapObj[i][j].hasOwnProperty('events')) {
                drawTags('events',j,i);
            }
        }
    }
}

//タグを描画する（タイプ、x、y）
function drawTags(type, j, i) {

    switch(type) {

        case 'turnChip':
            // パスをリセット
            currentMapContext.beginPath () ;
            // レクタングルの座標(50,50)とサイズ(75,50)を指定
            currentMapContext.rect(j*mapLength ,i*mapLength , 10, 10);
            // 塗りつぶしの色
            currentMapContext.fillStyle = "lime"; //イベントは設定済みだが、トリガーを設定してない場合、黄色
            // 塗りつぶしを実行
            currentMapContext.fill();
            // 線の色
            currentMapContext.strokeStyle = "purple" ;
            // 線の太さ
            currentMapContext.lineWidth =  1;
            // 線を描画を実行
            currentMapContext.stroke() ;
        break;


        case 'events':
            // パスをリセット
            currentMapContext.beginPath () ;
            // レクタングルの座標(50,50)とサイズ(75,50)を指定
            currentMapContext.rect(j*mapLength ,i*mapLength , 10, 10);
            // 塗りつぶしの色
            currentMapContext.fillStyle = "yellow"; //イベントは設定済みだが、トリガーを設定してない場合、黄色
            if (currrentMapObj[i][j].hasOwnProperty('trigger') && currrentMapObj[i][j].trigger != "トリガー設定なし") currentMapContext.fillStyle = "red"; //イベントもトリガーも設定している場合は赤
            //currentMapContext.fillStyle = "rgba(255,0,0,0.8)" ;
            // 塗りつぶしを実行
            currentMapContext.fill();
            // 線の色
            currentMapContext.strokeStyle = "purple" ;
            // 線の太さ
            currentMapContext.lineWidth =  1;
            // 線を描画を実行
            currentMapContext.stroke() ;
        break;
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

function drawCurrentChipBorder() {
    ////クリックしたマップチップを枠で囲う
    // パスをリセット
    currentMapContext.beginPath () ;
    // レクタングルの座標(50,50)とサイズ(75,50)を指定
    currentMapContext.rect(colNum*mapLength ,rowNum*mapLength , 32, 32);
    // 塗りつぶしの色
    //currentMapContext.fillStyle = "lime"; //イベントは設定済みだが、トリガーを設定してない場合、黄色
    // 塗りつぶしを実行
    //currentMapContext.fill();
    // 線の色
    currentMapContext.strokeStyle = "red";
    // 線の太さ
    currentMapContext.lineWidth =  3;
    // 線を描画を実行
    currentMapContext.stroke() ;
}

//画面枠を描画する
//表示キャンバス横半径
var viewCanvasHalfWidth = (736 - 32) / 2;
//表示キャンバス縦半径
var viewCanvasHalfHeight = (480 - 32) / 2;
function drawScreenBorder() {
    ////クリックしたマップチップを枠で囲う
    // パスをリセット
    currentMapContext.beginPath () ;
    // レクタングルの座標(50,50)とサイズ(75,50)を指定
    currentMapContext.rect((colNum*mapLength)-viewCanvasHalfWidth ,(rowNum*mapLength)-viewCanvasHalfHeight , 736, 480);
    // 塗りつぶしの色
    //currentMapContext.fillStyle = "lime"; //イベントは設定済みだが、トリガーを設定してない場合、黄色
    // 塗りつぶしを実行
    //currentMapContext.fill();
    // 線の色
    currentMapContext.strokeStyle = "red";
    // 線の太さ
    currentMapContext.lineWidth =  3;
    // 線を描画を実行
    currentMapContext.stroke() ;
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

    //まずはバリデーション（ツールで初めて作成。他のイベントについても、必要を感じたら充実させていく）
    switch (evtName) {
        case 'talk':
            if (currentRegisteredEvent == '') {
                //新規のイベントの場合
                if (objFlg == false) {

                } else {

                }
            } else {
                //既存のイベントの場合
                if (objFlg == false) {

                } else {
                }
            }
        break;

        case 'question':
            if (currentRegisteredEvent == '') {
                if (objFlg == false) {

                } else {

                }

            } else {
                //既存のイベントの場合
                if (objFlg == false) {

                } else {

                }
            }
            
        break;

        case 'transition':
            if (currentRegisteredEvent == '') {
                //var evtNameKey = getEventKey(evtName, objFlg);
                if (objFlg == false) {

                } else {

                }
            } else {
                //既存のイベントの場合
                if (objFlg == false) {

                } else {

                }
            }
            
        break;

        case 'battle':
            if (currentRegisteredEvent == '') {
                //var evtNameKey = getEventKey(evtName, objFlg);
                if (objFlg == false) {

                } else {

                }

            } else {
                //既存のイベントの場合
                if (objFlg == false) {

                } else {

                }
            }   
        break;
        case 'tool':
            if (currentRegisteredEvent == '') {
                //新規イベントの場合
                if (objFlg == false) {
                    //メモ：もらいと使用の2パターンがある
                    //判定はどうしよう、チェックしてる方？
                    if (toolEventType == "get") {
                    //ひろい
                        var toolId = document.getElementById('selectedTool');
                        if (toolId == null) {
                            alert("ツールを設定してください。");
                            return;
                        }
                    } else {
                    //使用 toolEventType == "use"
                        var toolId = document.getElementById('selectedTool');
                        if (toolId == null) {
                            alert("ツールを設定してください。");
                            return;
                        }
                        var OKtalkContent = document.getElementById('OKtalkContent').value;
                        if (OKtalkContent == '' || OKtalkContent == null) {
                            alert("OKトークコンテンツを入力してください");
                            return;
                        }
                        var NGtalkContent = document.getElementById('NGtalkContent').value;
                        if (NGtalkContent == '' || NGtalkContent == null) {
                            alert("NGトークコンテンツを入力してください");
                            return;
                        }
                    }
                } else {
                    if (toolEventType == "get") {
                    //ひろい
                        var toolId = document.getElementById('selectedTool');
                        if (toolId == null) {
                            alert("ツールを設定してください。");
                            return;
                        }
                    } else {
                    //使用 toolEventType == "use"
                        var toolId = document.getElementById('selectedTool');
                        if (toolId == null) {
                            alert("ツールを設定してください。");
                            return;
                        };
                        var OKtalkContent = document.getElementById('OKtalkContent').value;
                        if (OKtalkContent == '' || OKtalkContent == null) {
                            alert("OKトークコンテンツを入力してください");
                            return;
                        }
                        var NGtalkContent = document.getElementById('NGtalkContent').value;
                        if (NGtalkContent == '' || NGtalkContent == null) {
                            alert("NGトークコンテンツを入力してください");
                            return;
                        }
                    }
                }
            } else {
                if (objFlg == false) {
                    //メモ：もらいと使用の2パターンがある
                    //判定はどうしよう、チェックしてる方？
                    if (toolEventType == "get") {
                    //ひろい
                        var toolId = document.getElementById('selectedTool');
                        if (toolId == null) {
                            alert("ツールを設定してください。");
                            return;
                        }
                    } else {
                    //使用 toolEventType == "use"
                        var toolId = document.getElementById('selectedTool');
                        if (toolId == null) {
                            alert("ツールを設定してください。");
                            return;
                        }
                        var OKtalkContent = document.getElementById('OKtalkContent').value;
                        if (OKtalkContent == '' || OKtalkContent == null) {
                            alert("OKトークコンテンツを入力してください");
                            return;
                        }
                        var NGtalkContent = document.getElementById('NGtalkContent').value;
                        if (NGtalkContent == '' || NGtalkContent == null) {
                            alert("NGトークコンテンツを入力してください");
                            return;
                        }
                    }
                } else {
                    if (toolEventType == "get") {
                    //ひろい
                        var toolId = document.getElementById('selectedTool');
                        if (toolId == null) {
                            alert("ツールを設定してください。");
                            return;
                        }
                    } else {
                    //使用 toolEventType == "use"
                        var toolId = document.getElementById('selectedTool');
                        if (toolId == null) {
                            alert("ツールを設定してください。");
                            return;
                        }
                        var OKtalkContent = document.getElementById('OKtalkContent').value;
                        if (OKtalkContent == '' || OKtalkContent == null) {
                            alert("OKトークコンテンツを入力してください");
                            return;
                        }
                        var NGtalkContent = document.getElementById('NGtalkContent').value;
                        if (NGtalkContent == '' || NGtalkContent == null) {
                            alert("NGトークコンテンツを入力してください");
                            return;
                        }
                    }
                }
            }
        break;
        case 'effect':
            if (currentRegisteredEvent == '') {
                //新規イベントの場合
                //shake、reaction、animationの3つがある
                switch (currentEffectType) {
                    case 'shake':
                        if (objFlg == false) {
                            var selectedSound = document.getElementById('selectedSound').innerText;
                            if (selectedSound == '' || selectedSound == null) {
                                alert("サウンドを入力してください：マップ");
                                return;
                            }
                            var selectedShakeType = document.getElementById('selectedShakeType').innerText;
                            if (selectedShakeType == '' || selectedShakeType == null) {
                                alert("揺れタイプを入力してください：マップ");
                                return;
                            }
                        } else {
                            var selectedSound = document.getElementById('selectedSound').innerText;
                            if (selectedSound == '' || selectedSound == null) {
                                alert("サウンドを入力してください：オブジェクト");
                                return;
                            }
                            var selectedShakeType = document.getElementById('selectedShakeType').innerText;
                            if (selectedShakeType == '' || selectedShakeType == null) {
                                alert("揺れタイプを入力してください：オブジェクト");
                                return;
                            }
                        }                
                    break;

                    case 'reaction':
                        if (objFlg == false) {
                            var selectedSound = document.getElementById('selectedSound').innerText;
                            if (selectedSound == '' || selectedSound == null) {
                                alert("サウンドを入力してください：マップ");
                                return;
                            }
                            var selectedReaction = document.getElementById('selectedReaction').innerText;
                            if (selectedReaction == '' || selectedReaction == null) {
                                alert("リアクションを入力してください：マップ");
                                return;
                            }
                        } else {
                            var selectedSound = document.getElementById('selectedSound').innerText;
                            if (selectedSound == '' || selectedSound == null) {
                                alert("サウンドを入力してください：オブジェクト");
                                return;
                            }
                            var selectedReaction = document.getElementById('selectedReaction').innerText;
                            if (selectedReaction == '' || selectedReaction == null) {
                                alert("リアクションを入力してください：オブジェクト");
                                return;
                            }
                        }
                    break;

                    case 'animation':
                    break;
                }
            } else {
                //既存イベントの場合
                //shake、reaction、animationの3つがある
                switch (currentEffectType) {
                    case 'shake':
                        if (objFlg == false) {
                            var selectedSound = document.getElementById('selectedSound').innerText;
                            if (selectedSound == '' || selectedSound == null) {
                                alert("サウンドを入力してください：マップ");
                                return;
                            }
                            var selectedShakeType = document.getElementById('selectedShakeType').innerText;
                            if (selectedShakeType == '' || selectedShakeType == null) {
                                alert("揺れタイプを入力してください：マップ");
                                return;
                            }
                        } else {
                            var selectedSound = document.getElementById('selectedSound').innerText;
                            if (selectedSound == '' || selectedSound == null) {
                                alert("サウンドを入力してください：オブジェクト");
                                return;
                            }
                            var selectedShakeType = document.getElementById('selectedShakeType').innerText;
                            if (selectedShakeType == '' || selectedShakeType == null) {
                                alert("揺れタイプを入力してください：マップ");
                                return;
                            }
                        }                
                    break;

                    case 'reaction':
                        if (objFlg == false) {
                            var selectedSound = document.getElementById('selectedSound').innerText;
                            if (selectedSound == '' || selectedSound == null) {
                                alert("サウンドを入力してください：マップ");
                                return;
                            }
                            var selectedReaction = document.getElementById('selectedReaction').innerText;
                            if (selectedReaction == '' || selectedReaction == null) {
                                alert("リアクションを入力してください：マップ");
                                return;
                            }
                        } else {
                            var selectedSound = document.getElementById('selectedSound').innerText;
                            if (selectedSound == '' || selectedSound == null) {
                                alert("サウンドを入力してください：オブジェクト");
                                return;
                            }
                            var selectedReaction = document.getElementById('selectedReaction').innerText;
                            if (selectedReaction == '' || selectedReaction == null) {
                                alert("リアクションを入力してください：オブジェクト");
                                return;
                            }
                        }
                    break;

                    case 'animation':
                    break;
                }
            }
        break;
        case 'move':

            //★雛形を無視してかく

            //マップイベントの場合
            //保存イメージ
            //イベントキー
            //　チップn（チップ分）
            //　　　x
            //     y
            //     order
            //　　　削除フラグ
            //　　　追加オブジェクト（ストリングをオブジェクトに戻す必要あり）
            //　移動スピード

            //ムーブスピード
            var errorFlg = true;
            var moveSpeed = document.getElementsByClassName("moveSpeed");
            Array.from(moveSpeed).forEach(function(event) {
                if (event.checked) errorFlg = false; //チェックされてればOK
            });
            if (errorFlg) {alert("移動速度を選択してください");return;}　

            //ここからチップごと
            var containerNumber = 0;
            var targetMoveChipContainer = document.getElementsByClassName("targetMoveChipContainer");
            Array.from(targetMoveChipContainer).forEach(function(event) {

                if (containerNumber == 0) {containerNumber++;return;}

                //fromX,fromY（toはいらない）
                errorFlg = true;
                var fromX = event.getElementsByClassName("fromX");
                Array.from(fromX).forEach(function(event1) {
                    if (event1.innerText != ""){
                        errorFlg = false;
                    }
                });
                var fromY = event.getElementsByClassName("fromY");
                Array.from(fromY).forEach(function(event1) {
                    if (event1.innerText != ""){
                        errorFlg = false;
                    }
                });
                if (errorFlg) {alert("fromを選択してください：コンテナ"+containerNumber);containerNumber++;return;}　

                //orders
                errorFlg = true;
                var orders = event.getElementsByClassName("orders");
                var ret = true;
                Array.from(orders).forEach(function(event1) {
                    if (event1.innerText == "" || event1.innerText == undefined){
                        ret = confirm("命令がありませんがよろしいですか？：コンテナ"+containerNumber); //ただ召喚したいだけのパターンがあるから
                    }
                });
                if (!ret) {containerNumber++;return;}

                //finishDelFlg
                errorFlg = true;
                var finishDelFlg = event.getElementsByClassName("finishDelFlg");
                Array.from(finishDelFlg).forEach(function(event1) {
                    if (event1.checked) errorFlg = false; //チェックされてればOK
                });
                if (errorFlg) {alert("削除フラグを選択してください：コンテナ"+containerNumber);containerNumber++;return;}　

                //slideFlg
                errorFlg = true;
                var slideFlg = event.getElementsByClassName("slideFlg");
                Array.from(slideFlg).forEach(function(event1) {
                    if (event1.checked) errorFlg = false; //チェックされてればOK
                });
                if (errorFlg) {alert("スライドフラグを選択してください：コンテナ"+containerNumber);containerNumber++;return;}　

                containerNumber++;
            });
            if (errorFlg) {alert("登録には進みません");return;}
        break;
        case 'scene':
            //カットシーンがあるかないかだけ確認
            var selectedCutScene = document.getElementById("selectedCutScene");
            var fullSrc = decodeURI(selectedCutScene.src);
            var imgName = fullSrc.split("/").reverse()[0]
            if (imgName == 'getProjectData') {
                //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                alert("カットシーンを選択してください");
                return;
            }

        break;
        case 'changeMainChara':
            if (document.getElementById('newMainChara').alt == '') {
                alert("変更メインキャラを選択してください");
                return;
            }
        break;        
        case '拾いイベント（固定）':

        break;
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

    //イベントのキー（日付入り）を取得
    var evtNameKey = getEventKey(evtName);

    //バリデーションも済んだこのタイミングで、現在選択中のマップチップにnew Object()
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
                    //やっぱりここで、「getProjectData」だった場合の対処にした方が良いな、想定外の値だったけど、今は終わらせることを優先、、
                    var fullSrc = decodeURI(selectedWipeImage.src);
                    var imgName = fullSrc.split("/").reverse()[0]
                    if (imgName == 'getProjectData') {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
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
                    var fullSrc = decodeURI(selectedWipeImage.src);
                    var imgName = fullSrc.split("/").reverse()[0]
                    if (imgName == 'getProjectData') {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
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
                    var fullSrc = decodeURI(selectedWipeImage.src);
                    var imgName = fullSrc.split("/").reverse()[0]
                    if (imgName == 'getProjectData') {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
                        currentMapTip.events[currentRegisteredEvent]['wipe'] = imgName;
                    }
                } else {
                    currentMapTip.object.events[currentRegisteredEvent]['talkContent'] = document.getElementById('talk').value;
                    //ワイプを登録
                    var selectedWipeImage = document.getElementById('selectedWipeImage');
                    var fullSrc = decodeURI(selectedWipeImage.src);
                    var imgName = fullSrc.split("/").reverse()[0]
                    if (imgName == 'getProjectData') {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
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
                    var fullSrc = decodeURI(selectedWipeImage.src);
                    var imgName = fullSrc.split("/").reverse()[0]
                    if (imgName == 'getProjectData') {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
                        currentMapTip.events[evtNameKey]['wipe'] = imgName;
                    }
                } else {
                    //イベント名のキーごとにオブジェクトを作成
                    currentMapTip.object.events[evtNameKey] = new Object(); 
                    //トークのコンテンツを格納
                    currentMapTip.object.events[evtNameKey]['questionContent'] = document.getElementById('question').value;
                    //ワイプを登録
                    var selectedWipeImage = document.getElementById('selectedWipeImage');
                    var fullSrc = decodeURI(selectedWipeImage.src);
                    var imgName = fullSrc.split("/").reverse()[0]
                    if (imgName == 'getProjectData') {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
                        currentMapTip.object.events[evtNameKey]['wipe'] = imgName;
                    }
                }

            } else {
                //既存のイベントの場合
                if (objFlg == false) {
                    currentMapTip.events[currentRegisteredEvent]['questionContent'] = document.getElementById('question').value;
                    //ワイプを登録
                    var selectedWipeImage = document.getElementById('selectedWipeImage');
                    var fullSrc = decodeURI(selectedWipeImage.src);
                    var imgName = fullSrc.split("/").reverse()[0]
                    if (imgName == 'getProjectData') {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
                        currentMapTip.events[currentRegisteredEvent]['wipe'] = imgName;
                    }
                } else {
                    currentMapTip.object.events[currentRegisteredEvent]['questionContent'] = document.getElementById('question').value;
                    //ワイプを登録
                    var selectedWipeImage = document.getElementById('selectedWipeImage');
                    var fullSrc = decodeURI(selectedWipeImage.src);
                    var imgName = fullSrc.split("/").reverse()[0]
                    if (imgName == 'getProjectData') {
                        //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                        //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                    } else {
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
        case 'tool':
            if (currentRegisteredEvent == '') {
                //新規イベントの場合
                if (objFlg == false) {
                    //メモ：もらいと使用の2パターンがある
                    //判定はどうしよう、チェックしてる方？
                    if (toolEventType == "get") {
                    //ひろい
                        currentMapTip.events[evtNameKey] = new Object(); 
                        currentMapTip.events[evtNameKey].type = toolEventType;
                        currentMapTip.events[evtNameKey].toolId = document.getElementById('selectedTool').value;
                    } else {
                    //使用 toolEventType == "use"
                        currentMapTip.events[evtNameKey] = new Object(); 
                        currentMapTip.events[evtNameKey].type = toolEventType;
                        currentMapTip.events[evtNameKey].toolId = document.getElementById('selectedTool').value;
                        currentMapTip.events[evtNameKey].OKtalkContent = document.getElementById('OKtalkContent').value;
                        currentMapTip.events[evtNameKey].NGtalkContent = document.getElementById('NGtalkContent').value;
                        currentMapTip.events[evtNameKey].delToolFlg = document.getElementById('delToolFlg').value;
                        var selectedWipeImage = document.getElementById('selectedWipeImage');
                        var fullSrc = decodeURI(selectedWipeImage.src);
                        var imgName = fullSrc.split("/").reverse()[0]
                        if (imgName == 'getProjectData') {
                            //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                            //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                        } else {
                            currentMapTip.events[evtNameKey].wipe = imgName;
                        }
                    }
                } else {
                    if (toolEventType == "get") {
                    //ひろい
                        currentMapTip.object.events[evtNameKey] = new Object(); 
                        currentMapTip.object.events[evtNameKey].type = toolEventType;
                        currentMapTip.object.events[evtNameKey].toolId = document.getElementById('selectedTool').value;
                    } else {
                    //使用 toolEventType == "use"
                        currentMapTip.object.events[evtNameKey] = new Object(); 
                        currentMapTip.object.events[evtNameKey].type = toolEventType;
                        currentMapTip.object.events[evtNameKey].toolId = document.getElementById('selectedTool').value
                        currentMapTip.object.events[evtNameKey].OKtalkContent = document.getElementById('OKtalkContent').value;
                        currentMapTip.object.events[evtNameKey].NGtalkContent = document.getElementById('NGtalkContent').value;
                        currentMapTip.object.events[evtNameKey].delToolFlg = document.getElementById('delToolFlg').value;
                        var selectedWipeImage = document.getElementById('selectedWipeImage');
                        var fullSrc = decodeURI(selectedWipeImage.src);
                        var imgName = fullSrc.split("/").reverse()[0]
                        if (imgName == 'getProjectData') {
                            //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                            //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                        } else {
                            currentMapTip.object.events[evtNameKey].wipe = imgName;
                        }
                    }
                }
            } else {
                if (objFlg == false) {
                    //メモ：もらいと使用の2パターンがある
                    //判定はどうしよう、チェックしてる方？
                    if (toolEventType == "get") {
                    //ひろい
                        currentMapTip.events[currentRegisteredEvent].type = toolEventType;
                        currentMapTip.events[currentRegisteredEvent].toolId = document.getElementById('selectedTool').value;
                    } else {
                    //使用 toolEventType == "use"
                        currentMapTip.events[currentRegisteredEvent].type = toolEventType;
                        currentMapTip.events[currentRegisteredEvent].toolId = document.getElementById('selectedTool').value;
                        currentMapTip.events[currentRegisteredEvent].OKtalkContent = document.getElementById('OKtalkContent').value;
                        currentMapTip.events[currentRegisteredEvent].NGtalkContent = document.getElementById('NGtalkContent').value;
                        currentMapTip.events[currentRegisteredEvent].delToolFlg = document.getElementById('delToolFlg').value;
                        var selectedWipeImage = document.getElementById('selectedWipeImage');
                        var fullSrc = decodeURI(selectedWipeImage.src);
                        var imgName = fullSrc.split("/").reverse()[0]
                        if (imgName == 'getProjectData') {
                            //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                            //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                        } else {
                            currentMapTip.events[currentRegisteredEvent].wipe = imgName;
                        }
                    }
                } else {
                    if (toolEventType == "get") {
                    //ひろい
                        currentMapTip.object.events[currentRegisteredEvent].type = toolEventType;
                        currentMapTip.object.events[evtNacurrentRegisteredEventmeKey].toolId = document.getElementById('selectedTool').value;
                    } else {
                    //使用 toolEventType == "use"
                        currentMapTip.object.events[currentRegisteredEvent].type = toolEventType;
                        currentMapTip.object.events[currentRegisteredEvent].toolId = document.getElementById('selectedTool').value;
                        currentMapTip.object.events[currentRegisteredEvent].OKtalkContent = document.getElementById('OKtalkContent').value;
                        currentMapTip.object.events[currentRegisteredEvent].NGtalkContent = document.getElementById('NGtalkContent').value;
                        currentMapTip.object.events[currentRegisteredEvent].delToolFlg = document.getElementById('delToolFlg').value;
                        var selectedWipeImage = document.getElementById('selectedWipeImage');
                        var fullSrc = decodeURI(selectedWipeImage.src);
                        var imgName = fullSrc.split("/").reverse()[0]
                        if (imgName == 'getProjectData') {
                            //ワイプを選択していない時の分岐。とりあえず何もしない仕様。
                            //「なし」と言う文字列を入れる仕様に変更した際はここにロジックを書く。
                        } else {
                            currentMapTip.object.events[currentRegisteredEvent].wipe = imgName;
                        }
                    }
                }
            }
        break;
        case 'effect':
            if (currentRegisteredEvent == '') {
            // 新規の場合
                if (objFlg == false) {
                    //マップイベントの場合
                    //shake、reaction、animationの3つがある
                    switch (currentEffectType) {
                        case 'shake':
                            currentMapTip.events[evtNameKey] = new Object(); 
                            currentMapTip.events[evtNameKey].type = 'shake'; //shake
                            currentMapTip.events[evtNameKey].shakeType = document.getElementById('selectedShakeType').innerText;
                            currentMapTip.events[evtNameKey].sound = document.getElementById('selectedSound').innerText;
                        break;

                        case 'reaction':
                            currentMapTip.events[evtNameKey] = new Object(); 
                            currentMapTip.events[evtNameKey].type = 'reaction'; //reaction
                            currentMapTip.events[evtNameKey].sound = document.getElementById('selectedSound').innerText;
                            currentMapTip.events[evtNameKey].reactType = document.getElementById('selectedReaction').innerText;
                        break;

                        case 'animation':
                        break;
                    }
                } else {
                    //オブジェクトイベントの場合
                    //shake、reaction、animationの3つがある
                    switch (currentEffectType) {
                        case 'shake':
                            currentMapTip.object.events[evtNameKey] = new Object(); 
                            currentMapTip.object.events[evtNameKey].type = 'shake'; //shake
                            currentMapTip.object.events[evtNameKey].shakeType = document.getElementById('selectedShakeType').innerText;
                            currentMapTip.object.events[evtNameKey].sound = document.getElementById('selectedSound').innerText;          
                        break;

                        case 'reaction':
                            currentMapTip.object.events[evtNameKey] = new Object(); 
                            currentMapTip.object.events[evtNameKey].type = 'reaction'; //reaction
                            currentMapTip.object.events[evtNameKey].sound = document.getElementById('selectedSound').innerText;
                            currentMapTip.object.events[evtNameKey].reactType = document.getElementById('selectedReaction').innerText;
                        break;

                        case 'animation':
                        break;
                    }
                }
            } else {
            // 既存の場合
                if (objFlg == false) {
                    //マップイベントの場合
                    //shake、reaction、animationの3つがある
                    switch (currentEffectType) {
                        case 'shake':
                            //currentMapTip.events[currentRegisteredEvent] = new Object(); 
                            currentMapTip.events[currentRegisteredEvent].type = 'shake'; //shake
                            currentMapTip.events[currentRegisteredEvent].shakeType = document.getElementById('selectedShakeType').innerText;
                            currentMapTip.events[currentRegisteredEvent].sound = document.getElementById('selectedSound').innerText;
                        break;

                        case 'reaction':
                            currentMapTip.events[currentRegisteredEvent].type = 'reaction'; //reaction
                            currentMapTip.events[currentRegisteredEvent].sound = document.getElementById('selectedSound').innerText;
                            currentMapTip.object.events[evtNameKey].reactType = document.getElementById('selectedReaction').innerText;
                        break;

                        case 'animation':
                        break;
                    }
                } else {
                    //オブジェクトイベントの場合
                    //shake、reaction、animationの3つがある
                    switch (currentEffectType) {
                        case 'shake':
                            //currentMapTip.object.events[currentRegisteredEvent] = new Object(); 
                            currentMapTip.object.events[currentRegisteredEvent].type = 'shake'; //shake
                            currentMapTip.object.events[currentRegisteredEvent].shakeType = document.getElementById('selectedShakeType').innerText;
                            currentMapTip.object.events[currentRegisteredEvent].sound = document.getElementById('selectedSound').innerText;          
                        break;

                        case 'reaction':
                            currentMapTip.object.events[currentRegisteredEvent].type = 'reaction'; //reaction
                            currentMapTip.object.events[currentRegisteredEvent].sound = document.getElementById('selectedSound').innerText;
                            currentMapTip.object.object.events[evtNameKey].reactType = document.getElementById('selectedReaction').innerText;
                        break;

                        case 'animation':
                        break;
                    }
                }
            }
        break;
        case 'move':
            if (currentRegisteredEvent == '') {
            // 新規の場合
                if (objFlg == false) {
                    //マップイベントの場合
                    //保存イメージ
                    //イベントキー
                    //　チップn（チップ分）
                    //　　　x
                    //     y
                    //     order
                    //　　　削除フラグ
                    //　　　追加オブジェクト（ストリングをオブジェクトに戻す必要あり）
                    //　移動スピード

                    //チップnでループする必要あり

                    currentMapTip.events[evtNameKey] = new Object(); 
        
                    //ムーブスピード
                    var moveSpeed = document.getElementsByClassName("moveSpeed");
                    Array.from(moveSpeed).forEach(function(event) {
                        if (event.checked) currentMapTip.events[evtNameKey].drawSpeed =　event.value;
                    });

                    //ここからチップごと
                    var tmpIndex = 0;
                    var targetMoveChipContainer = document.getElementsByClassName("targetMoveChipContainer");
                    Array.from(targetMoveChipContainer).forEach(function(event) {

                        var chipNameKey = "chip_" + tmpIndex;
                        currentMapTip.events[evtNameKey][chipNameKey] = new Object(); 

                        //fromX,fromY（toはいらない）
                        var fromX = event.getElementsByClassName("fromX");
                        Array.from(fromX).forEach(function(event1) {
                            currentMapTip.events[evtNameKey][chipNameKey]['fromX'] =　event1.innerText;
                        });
                        var fromY = event.getElementsByClassName("fromY");
                        Array.from(fromY).forEach(function(event1) {
                            currentMapTip.events[evtNameKey][chipNameKey]['fromY'] =　event1.innerText;
                        });

                        //orders
                        var orders = event.getElementsByClassName("orders");
                        Array.from(orders).forEach(function(event1) {
                            currentMapTip.events[evtNameKey][chipNameKey]['orders'] =　event1.innerText;
                        });

                        //finishDelFlg
                        var finishDelFlg = event.getElementsByClassName("finishDelFlg");
                        Array.from(finishDelFlg).forEach(function(event1) {
                            if (event1.checked) currentMapTip.events[evtNameKey][chipNameKey]['finishDelFlg'] =　event1.value;
                        });

                        //slideFlg
                        var slideFlg = event.getElementsByClassName("slideFlg");
                        Array.from(slideFlg).forEach(function(event1) {
                            if (event1.checked) currentMapTip.events[evtNameKey][chipNameKey]['slideFlg'] =　event1.value;
                        });

                        //fixDir
                        var fixDir = event.getElementsByClassName("fixDir");
                        Array.from(fixDir).forEach(function(event1) {
                            currentMapTip.events[evtNameKey][chipNameKey]['fixDir'] =　event1.innerText;
                        });

                        //追加オブジェクト
                        var newMoveObjInfo = event.getElementsByClassName("newMoveObjInfo");
                        Array.from(newMoveObjInfo).forEach(function(event1) {
                            if (event1.innerHTML != "") {
                                var objTxt = event1.getElementsByClassName("objTxt");
                                Array.from(objTxt).forEach(function(event2) {
                                    currentMapTip.events[evtNameKey][chipNameKey]['newMoveObj'] = JSON.parse(event2.innerText);
                                });
                            }
                        });

                        tmpIndex++;
                    });

                    delete currentMapTip.events[evtNameKey]['chip_0']; //最初のやつは削除

                } else {
                    //新規でオブジェクトイベントの時

                    //チップnでループする必要あり

                    currentMapTip.object.events[evtNameKey] = new Object(); 
        
                    //ムーブスピード
                    var moveSpeed = document.getElementsByClassName("moveSpeed");
                    Array.from(moveSpeed).forEach(function(event) {
                        if (event.checked) currentMapTip.object.events[evtNameKey].drawSpeed =　event.value;
                    });

                    //ここからチップごと
                    var tmpIndex = 0;
                    var targetMoveChipContainer = document.getElementsByClassName("targetMoveChipContainer");
                    Array.from(targetMoveChipContainer).forEach(function(event) {

                        var chipNameKey = "chip_" + tmpIndex;
                        currentMapTip.object.events[evtNameKey][chipNameKey] = new Object(); 

                        //fromX,fromY（toはいらない）
                        var fromX = event.getElementsByClassName("fromX");
                        Array.from(fromX).forEach(function(event1) {
                            currentMapTip.object.events[evtNameKey][chipNameKey]['fromX'] =　event1.innerText;
                        });
                        var fromY = event.getElementsByClassName("fromY");
                        Array.from(fromY).forEach(function(event1) {
                            currentMapTip.object.events[evtNameKey][chipNameKey]['fromY'] =　event1.innerText;
                        });

                        //orders
                        var orders = event.getElementsByClassName("orders");
                        Array.from(orders).forEach(function(event1) {
                            currentMapTip.object.events[evtNameKey][chipNameKey]['orders'] =　event1.innerText;
                        });

                        //finishDelFlg
                        var finishDelFlg = event.getElementsByClassName("finishDelFlg");
                        Array.from(finishDelFlg).forEach(function(event1) {
                            if (event1.checked) currentMapTip.object.events[evtNameKey][chipNameKey]['finishDelFlg'] =　event1.value;
                        });

                        //slideFlg
                        var slideFlg = event.getElementsByClassName("slideFlg");
                        Array.from(slideFlg).forEach(function(event1) {
                            if (event1.checked) currentMapTip.object.events[evtNameKey][chipNameKey]['slideFlg'] =　event1.value;
                        });

                        //fixDir
                        var fixDir = event.getElementsByClassName("fixDir");
                        Array.from(fixDir).forEach(function(event1) {
                            currentMapTip.object.events[evtNameKey][chipNameKey]['fixDir'] =　event1.innerText;
                        });

                        //追加オブジェクト
                        var newMoveObjInfo = event.getElementsByClassName("newMoveObjInfo");
                        Array.from(newMoveObjInfo).forEach(function(event1) {
                            if (event1.innerHTML != "") {
                                var objTxt = event1.getElementsByClassName("objTxt");
                                Array.from(objTxt).forEach(function(event2) {
                                    currentMapTip.object.events[evtNameKey][chipNameKey]['newMoveObj'] = JSON.parse(event2.innerText);
                                });
                            }
                        });

                        tmpIndex++;
                    });

                    delete currentMapTip.object.events[evtNameKey]['chip_0']; //最初のやつは削除
                }

            } else {
            // 既存の場合
                if (objFlg == false) {
                    //マップイベントの場合
                    //チップnでループする必要あり

                    currentMapTip.events[currentRegisteredEvent] = new Object(); //既存の場合も初期化の意味で同じ処理にしておく
        
                    //ムーブスピード
                    var moveSpeed = document.getElementsByClassName("moveSpeed");
                    Array.from(moveSpeed).forEach(function(event) {
                        if (event.checked) currentMapTip.events[currentRegisteredEvent].drawSpeed =　event.value;
                    });

                    //ここからチップごと

                    var tmpIndex = 0;
                    var targetMoveChipContainer = document.getElementsByClassName("targetMoveChipContainer");
                    Array.from(targetMoveChipContainer).forEach(function(event) {

                        var chipNameKey = "chip_" + tmpIndex;
                        currentMapTip.events[currentRegisteredEvent][chipNameKey] = new Object(); 

                        //fromX,fromY（toはいらない）
                        var fromX = event.getElementsByClassName("fromX");
                        Array.from(fromX).forEach(function(event1) {
                            currentMapTip.events[currentRegisteredEvent][chipNameKey]['fromX'] =　event1.innerText;
                        });
                        var fromY = event.getElementsByClassName("fromY");
                        Array.from(fromY).forEach(function(event1) {
                            currentMapTip.events[currentRegisteredEvent][chipNameKey]['fromY'] =　event1.innerText;
                        });

                        //orders
                        var orders = event.getElementsByClassName("orders");
                        Array.from(orders).forEach(function(event1) {
                            currentMapTip.events[currentRegisteredEvent][chipNameKey]['orders'] =　event1.innerText;
                        });

                        //finishDelFlg
                        var finishDelFlg = event.getElementsByClassName("finishDelFlg");
                        Array.from(finishDelFlg).forEach(function(event1) {
                            if (event1.checked) currentMapTip.events[currentRegisteredEvent][chipNameKey]['finishDelFlg'] =　event1.value;
                        });

                        //slideFlg
                        var slideFlg = event.getElementsByClassName("slideFlg");
                        Array.from(slideFlg).forEach(function(event1) {
                            if (event1.checked) currentMapTip.events[currentRegisteredEvent][chipNameKey]['slideFlg'] =　event1.value;
                        });

                        //fixDir
                        var fixDir = event.getElementsByClassName("fixDir");
                        Array.from(fixDir).forEach(function(event1) {
                            currentMapTip.events[currentRegisteredEvent][chipNameKey]['fixDir'] =　event1.innerText;
                        });

                        //追加オブジェクト
                        var newMoveObjInfo = event.getElementsByClassName("newMoveObjInfo");
                        Array.from(newMoveObjInfo).forEach(function(event1) {
                            if (event1.innerHTML != "") {
                                var objTxt = event1.getElementsByClassName("objTxt");
                                Array.from(objTxt).forEach(function(event2) {
                                    currentMapTip.events[currentRegisteredEvent][chipNameKey]['newMoveObj'] = JSON.parse(event2.innerText);
                                });
                            }
                        });

                        tmpIndex++;
                    });

                    delete currentMapTip.events[currentRegisteredEvent]['chip_0']; //最初のやつは削除
                } else {
                    //既存でオブジェクトイベントの時

                    //チップnでループする必要あり

                    currentMapTip.object.events[currentRegisteredEvent] = new Object(); //既存の場合も初期化の意味で同じ処理にしておく
        
                    //ムーブスピード
                    var moveSpeed = document.getElementsByClassName("moveSpeed");
                    Array.from(moveSpeed).forEach(function(event) {
                        if (event.checked) currentMapTip.object.events[currentRegisteredEvent].drawSpeed =　event.value;
                    });

                    //ここからチップごと
                    var tmpIndex = 0;
                    var targetMoveChipContainer = document.getElementsByClassName("targetMoveChipContainer");
                    Array.from(targetMoveChipContainer).forEach(function(event) {

                        var chipNameKey = "chip_" + tmpIndex;
                        currentMapTip.object.events[currentRegisteredEvent][chipNameKey] = new Object(); 

                        //fromX,fromY（toはいらない）
                        var fromX = event.getElementsByClassName("fromX");
                        Array.from(fromX).forEach(function(event1) {
                            currentMapTip.object.events[currentRegisteredEvent][chipNameKey]['fromX'] =　event1.innerText;
                        });
                        var fromY = event.getElementsByClassName("fromY");
                        Array.from(fromY).forEach(function(event1) {
                            currentMapTip.object.events[currentRegisteredEvent][chipNameKey]['fromY'] =　event1.innerText;
                        });

                        //orders
                        var orders = event.getElementsByClassName("orders");
                        Array.from(orders).forEach(function(event1) {
                            currentMapTip.object.events[currentRegisteredEvent][chipNameKey]['orders'] =　event1.innerText;
                        });

                        //finishDelFlg
                        var finishDelFlg = event.getElementsByClassName("finishDelFlg");
                        Array.from(finishDelFlg).forEach(function(event1) {
                            if (event1.checked) currentMapTip.object.events[currentRegisteredEvent][chipNameKey]['finishDelFlg'] =　event1.value;
                        });

                        //slideFlg
                        var slideFlg = event.getElementsByClassName("slideFlg");
                        Array.from(slideFlg).forEach(function(event1) {
                            if (event1.checked) currentMapTip.object.events[currentRegisteredEvent][chipNameKey]['slideFlg'] =　event1.value;
                        });

                        //fixDir
                        var fixDir = event.getElementsByClassName("fixDir");
                        Array.from(fixDir).forEach(function(event1) {
                            currentMapTip.object.events[currentRegisteredEvent][chipNameKey]['fixDir'] =　event1.innerText;
                        });

                        //追加オブジェクト
                        var newMoveObjInfo = event.getElementsByClassName("newMoveObjInfo");
                        Array.from(newMoveObjInfo).forEach(function(event1) {
                            if (event1.innerHTML != "") {
                                var objTxt = event1.getElementsByClassName("objTxt");
                                Array.from(objTxt).forEach(function(event2) {
                                    currentMapTip.object.events[currentRegisteredEvent][chipNameKey]['newMoveObj'] = JSON.parse(event2.innerText);
                                });
                            }
                        });

                        tmpIndex++;
                    });

                    delete currentMapTip.object.events[currentRegisteredEvent]['chip_0']; //最初のやつは削除
                }
            }

            //戻すよ
            currentMoveChip = undefined;

            setTargetMoveChipFlg = false;
            var mapDataContainer = document.getElementById("mapDataContainer");
            mapDataContainer.style.pointerEvents = '';
            mapDataContainer.style.backgroundColor = '';
            editEvent.innerHTML = '';

        break;
        case 'scene':
            if (currentRegisteredEvent == '') {
            // 新規の場合
                if (objFlg == false) {
                    //マップイベントの場合
                    //保存イメージ
                    //イベントキー
                    //　シーンイベントn（シーンイベント分）
                    //　　　wipeSrc(※getProjectDataの場合何もしないのに注意！)
                    //     talkContent
                    //     shakeType
                    //　　　sound
                    //　カットシーン

                    //シーンイベントnでループする必要あり

                    currentMapTip.events[evtNameKey] = new Object(); 
        
                    //カットシーン
                    var fullSrc = decodeURI(document.getElementById("selectedCutScene").src);
                    var imgName = fullSrc.split("/").reverse()[0];
                    currentMapTip.events[evtNameKey]['cutSceneSrc'] = imgName;

                    //ここからシーンイベントごと
                    var tmpIndex = 0;
                    var targetSceneEventContainer = document.getElementsByClassName("targetSceneEventContainer");
                    Array.from(targetSceneEventContainer).forEach(function(event) {

                        var sceneEvtKey = "sceneEvt_" + tmpIndex;
                        currentMapTip.events[evtNameKey][sceneEvtKey] = new Object(); 

                        //wipeSrc(※getProjectDataの場合何もしないのに注意！)
                        var selectedWipeImage = event.getElementsByClassName("selectedWipeImage");
                        Array.from(selectedWipeImage).forEach(function(event1) {
                            var fullSrc = decodeURI(event1.src);
                            var imgName = fullSrc.split("/").reverse()[0];
                            if (imgName != 'getProjectData') currentMapTip.events[evtNameKey][sceneEvtKey]['wipeSrc'] = imgName;
                        });

                        //talkContent
                        var talkContent = event.getElementsByClassName("talkContent");
                        Array.from(talkContent).forEach(function(event1) {
                            currentMapTip.events[evtNameKey][sceneEvtKey]['talkContent'] =　event1.value;
                        });

                        //shakeType
                        var selectedShakeType = event.getElementsByClassName("selectedShakeType");
                        Array.from(selectedShakeType).forEach(function(event1) {
                            if (event1.innerText != '') currentMapTip.events[evtNameKey][sceneEvtKey]['shakeType'] =　event1.innerText;
                        });

                        //sound
                        var selectedSound = event.getElementsByClassName("selectedSound");
                        Array.from(selectedSound).forEach(function(event1) {
                            if (event1.innerText != '') currentMapTip.events[evtNameKey][sceneEvtKey]['sound'] =　event1.innerText;
                        });

                        tmpIndex++;
                    });

                    delete currentMapTip.events[evtNameKey]['sceneEvt_0']; //最初のやつは削除

                } else {
                    //新規でオブジェクトイベントの時

                    //シーンイベントnでループする必要あり

                    currentMapTip.object.events[evtNameKey] = new Object(); 
        
                    //カットシーン
                    var fullSrc = decodeURI(document.getElementById("selectedCutScene").src);
                    var imgName = fullSrc.split("/").reverse()[0];
                    currentMapTip.object.events[evtNameKey]['cutSceneSrc'] = imgName;

                    //ここからシーンイベントごと
                    var tmpIndex = 0;
                    var targetSceneEventContainer = document.getElementsByClassName("targetSceneEventContainer");
                    Array.from(targetSceneEventContainer).forEach(function(event) {

                        var sceneEvtKey = "sceneEvt_" + tmpIndex;
                        currentMapTip.object.events[evtNameKey][sceneEvtKey] = new Object(); 

                        //wipeSrc(※getProjectDataの場合何もしないのに注意！)
                        var selectedWipeImage = event.getElementsByClassName("selectedWipeImage");
                        Array.from(selectedWipeImage).forEach(function(event1) {
                            var fullSrc = decodeURI(event1.src);
                            var imgName = fullSrc.split("/").reverse()[0]
                            if (imgName != 'getProjectData') currentMapTip.object.events[evtNameKey][sceneEvtKey]['wipeSrc'] =　imgName;
                        });

                        //talkContent
                        var talkContent = event.getElementsByClassName("talkContent");
                        Array.from(talkContent).forEach(function(event1) {
                            currentMapTip.object.events[evtNameKey][sceneEvtKey]['talkContent'] =　event1.value;
                        });

                        //shakeType
                        var selectedShakeType = event.getElementsByClassName("selectedShakeType");
                        Array.from(selectedShakeType).forEach(function(event1) {
                            if (event1.innerText != '') currentMapTip.object.events[evtNameKey][sceneEvtKey]['shakeType'] =　event1.innerText;
                        });

                        //sound
                        var selectedSound = event.getElementsByClassName("selectedSound");
                        Array.from(selectedSound).forEach(function(event1) {
                            if (event1.innerText != '') currentMapTip.object.events[evtNameKey][sceneEvtKey]['sound'] =　event1.innerText;
                        });

                        tmpIndex++;
                    });

                    delete currentMapTip.object.events[evtNameKey]['sceneEvt_0']; //最初のやつは削除

                }

            } else {
            // 既存の場合
                if (objFlg == false) {
                    //マップイベントの場合
                    //保存イメージ
                    //イベントキー
                    //　シーンイベントn（シーンイベント分）
                    //　　　wipeSrc(※getProjectDataの場合何もしないのに注意！)
                    //     talkContent
                    //     shakeType
                    //　　　sound
                    //　カットシーン

                    //シーンイベントnでループする必要あり

                    currentMapTip.events[currentRegisteredEvent] = new Object(); 
        
                    //カットシーン
                    var fullSrc = decodeURI(document.getElementById("selectedCutScene").src);
                    var imgName = fullSrc.split("/").reverse()[0];
                    currentMapTip.events[currentRegisteredEvent]['cutSceneSrc'] = imgName;

                    //ここからシーンイベントごと
                    var tmpIndex = 0;
                    var targetSceneEventContainer = document.getElementsByClassName("targetSceneEventContainer");
                    Array.from(targetSceneEventContainer).forEach(function(event) {

                        var sceneEvtKey = "sceneEvt_" + tmpIndex;
                        currentMapTip.events[currentRegisteredEvent][sceneEvtKey] = new Object(); 

                        //wipeSrc(※getProjectDataの場合何もしないのに注意！)
                        var selectedWipeImage = event.getElementsByClassName("selectedWipeImage");
                        Array.from(selectedWipeImage).forEach(function(event1) {
                            var fullSrc = decodeURI(event1.src);
                            var imgName = fullSrc.split("/").reverse()[0]
                            if (imgName != 'getProjectData') currentMapTip.events[currentRegisteredEvent][sceneEvtKey]['wipeSrc'] =　imgName;
                        });

                        //talkContent
                        var talkContent = event.getElementsByClassName("talkContent");
                        Array.from(talkContent).forEach(function(event1) {
                            currentMapTip.events[currentRegisteredEvent][sceneEvtKey]['talkContent'] =　event1.value;
                        });

                        //shakeType
                        var selectedShakeType = event.getElementsByClassName("selectedShakeType");
                        Array.from(selectedShakeType).forEach(function(event1) {
                            if (event1.innerText != '') currentMapTip.events[currentRegisteredEvent][sceneEvtKey]['shakeType'] =　event1.innerText;
                        });

                        //sound
                        var selectedSound = event.getElementsByClassName("selectedSound");
                        Array.from(selectedSound).forEach(function(event1) {
                            if (event1.innerText != '') currentMapTip.events[currentRegisteredEvent][sceneEvtKey]['sound'] =　event1.innerText;
                        });

                        tmpIndex++;
                    });

                    delete currentMapTip.events[currentRegisteredEvent]['sceneEvt_0']; //最初のやつは削除

                } else {
                    //新規でオブジェクトイベントの時

                    //シーンイベントnでループする必要あり

                    currentMapTip.object.events[currentRegisteredEvent] = new Object(); 
        
                    //カットシーン
                    var fullSrc = decodeURI(document.getElementById("selectedCutScene").src);
                    var imgName = fullSrc.split("/").reverse()[0];
                    currentMapTip.object.events[currentRegisteredEvent]['cutSceneSrc'] = imgName;

                    //ここからシーンイベントごと
                    var tmpIndex = 0;
                    var targetSceneEventContainer = document.getElementsByClassName("targetSceneEventContainer");
                    Array.from(targetSceneEventContainer).forEach(function(event) {

                        var sceneEvtKey = "sceneEvt_" + tmpIndex;
                        currentMapTip.object.events[currentRegisteredEvent][sceneEvtKey] = new Object(); 

                        //wipeSrc(※getProjectDataの場合何もしないのに注意！)
                        var selectedWipeImage = event.getElementsByClassName("selectedWipeImage");
                        Array.from(selectedWipeImage).forEach(function(event1) {
                            var fullSrc = decodeURI(event1.src);
                            var imgName = fullSrc.split("/").reverse()[0]
                            if (imgName != 'getProjectData') currentMapTip.object.events[currentRegisteredEvent][sceneEvtKey]['wipeSrc'] =　imgName;
                        });

                        //talkContent
                        var talkContent = event.getElementsByClassName("talkContent");
                        Array.from(talkContent).forEach(function(event1) {
                            currentMapTip.object.events[currentRegisteredEvent][sceneEvtKey]['talkContent'] =　event1.value;
                        });

                        //shakeType
                        var selectedShakeType = event.getElementsByClassName("selectedShakeType");
                        Array.from(selectedShakeType).forEach(function(event1) {
                            if (event1.innerText != '') currentMapTip.object.events[currentRegisteredEvent][sceneEvtKey]['shakeType'] =　event1.innerText;
                        });

                        //sound
                        var selectedSound = event.getElementsByClassName("selectedSound");
                        Array.from(selectedSound).forEach(function(event1) {
                            if (event1.innerText != '') currentMapTip.object.events[currentRegisteredEvent][sceneEvtKey]['sound'] =　event1.innerText;
                        });

                        tmpIndex++;
                    });

                    delete currentMapTip.object.events[currentRegisteredEvent]['sceneEvt_0']; //最初のやつは削除

                }
            }
        break;
        case 'changeMainChara':
            //nameを登録する
            if (currentRegisteredEvent == '') {
            // 新規の場合
                if (objFlg == false) {
                    currentMapTip.events[evtNameKey] = new Object(); 
                    //マップイベントの場合
                    currentMapTip.events[evtNameKey]['name'] = document.getElementById('newMainChara').alt;
                } else {
                    currentMapTip.object.events[evtNameKey] = new Object(); 
                    //オブジェクトイベントの場合
                    currentMapTip.object.events[evtNameKey]['name'] = document.getElementById('newMainChara').alt;
                }
            } else {
            // 既存の場合
                if (objFlg == false) {
                    //マップイベントの場合
                    currentMapTip.events[currentRegisteredEvent]['name'] = document.getElementById('newMainChara').alt;
                } else {
                    //オブジェクトイベントの場合
                    currentMapTip.object.events[currentRegisteredEvent]['name'] = document.getElementById('newMainChara').alt;
                }
            }

        break;        
        case '拾いイベント（固定）':

        break;
    }
    //マップオブジェクトに現在マップオブジェクトの変更を反映
    currrentMapObj[rowNum][colNum] = currentMapTip;
    //新規イベント登録後はイベント編集divを閉じる（選択していないのにdivが開いているのが気持ち悪いため）。
    //→やっぱりどんな時も登録後はイベント編集divを閉じる（保存されたか直感的に分かんないから）
    //if (currentRegisteredEvent == '') editEvent.style.display = 'none';
    editEvent.style.display = 'none';

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

    function getEventKey(evtName){
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

var isNormal = true; //ノートPC
function switchCanvasSize() {
    if (isNormal) {
        document.getElementById('currentMapContainer').style.width = 2000 + 'px';
        document.getElementById('currentMapContainer').style.height = 1300 + 'px';
        isNormal = false;
    } else {
        document.getElementById('currentMapContainer').style.width = 736 + 'px';
        document.getElementById('currentMapContainer').style.height = 480 + 'px';
        isNormal = true;
    }
}
