<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>rpgEditor</title>
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

    <div id="mapContainer">
        <button onclick="switchCanvasSize()">キャンバス大きさ変更</button>
        <button onclick="setTurnChipMode()" id="setTurnChipMode">マップ交互編集モード</button>
        <button onclick="editBgm()" id="editBGM">BGM編集</button>
        <p>BGM：<span id="mapBGM"></span></p>
        <div id="setStartProjectContainer">
        </div>
        <div id="editStartPositionContainer" style="display:none">
            <p>スタートポジションを設定してください。</p>
            <p>スタートポジション：<span id="startPos"></span></p>
            <P id="saveStartPos">保存</p>
            <p id="stopEditStartPos">やめる</p>
        </div>
        <div id='currentMapContainer'>
            <div id='currentMap'>
                <canvas id="currentMapCanvas"></canvas>
                <img src="" id="currentMapImage" style="display:none">
            </div>
        </div>
        <div id="mapEventEditConntainer">
            <div id="mapDataContainer">
                <p id="mapTypeName"></p>
                <p id="mapPassProperty"></p>
                <div id="eventTrigger"></div>
                <div id="mapEvent"></div>
                <div id="editEventContainer">
                    <div id="eventLists"></div>
                </div>
                <div id="mapObject"></div>
                <div id="editObjectContainer">
                    <div id="objLists"></div>
                    <div id="objEventLists"></div>
                </div>
            </div>
            <div id="editEvent">
            </div>
            <div id="editEvent2">
            </div>
            <div id="editBGMContainer">
            </div>
        </div>
        <div id="turnChipEditContainer" style="display:none;">
            <div id="currentMapChipContainer">
                <button onclick="setTurnChipPutMode('put')" id="setTurnChipPutModePut" style="background-color: red;">put</button>
                <button onclick="setTurnChipPutMode('del')" id="setTurnChipPutModeDel">del</button>
                <p class="mapCategory">現在選択中のチップ</p>
                <div id="currentMapChipBG" style="background-color: white;">
                    <p>タイプ：<span id="currentMapChipType"></span></p>
                    <p>チップ名：<span id="currentMapChipName"></span></p>
                    <p>チップ画像：<img src="" id="currentMapChip"></p>
                </div>
            </div>
            <!-- マップ交互設定用の画像コンテナ -->
            <div id="turnChips" style="display:;">
                <div id="turnChipContainer">
                    <span style="background-color: yellow;">↓★★★★マップ交互★★★★</span>
                    @foreach($turnChips as $key1 => $prjDir)
                        <div id="turnChip_{{$key1}}_containter">
                            <p id>■■■{{$key1}}</p> 
                            @foreach($prjDir as $key2 => $turnChipDir)
                                <p id="{{$key2}}">{{$key2}}</p>
                                @foreach($turnChipDir as $chipPng)
                                    <img class="" onclick="setCurrentMapChip('turnChip', '{{$key2}}', event)" src="../../map-editor/image/map-editor/map-chip/{{$key1}}/mapTurn/{{$key2}}/{{$chipPng}}" id="{{$chipPng}}">
                                @endforeach
                            @endforeach
                        </div>
                    @endforeach
                    <span style="background-color: yellow;">↓★★★★マップパス交互★★★★</span>
                    @foreach($turnPassChips as $key1 => $prjDir)
                        <div id="turnChipPass_{{$key1}}_containter">
                        <p>■■■{{$key1}}</p> 
                        @foreach($prjDir as $key2 => $turnPassChipDir)
                            <p id="{{$key2}}">>{{$key2}}</p>
                            @foreach($turnPassChipDir as $chipPng)
                                <img class="" onclick="setCurrentMapChip('turnChipPass', '{{$key2}}', event)" src="../../map-editor/image/map-editor/map-chip/{{$key1}}/mapTurnPass/{{$key2}}/{{$chipPng}}" id="{{$chipPng}}" alt="turnChipPass">
                            @endforeach
                        @endforeach
                        </div>
                    @endforeach        
                </div>
            </div>
        </div>
    </div>    
    <div id="saveProjectContainer">
        <button id="saveMap">編集中マップをプロジェクトに保存</button>
    </div>

    <div id="projectsContainer">
        <p id="projectName">{{$project}}</p>
        @foreach($pngFiles as $pngFile)
            <div class="eachMapContainer">
                <p class="mapNames" id="{{$pngFile['baseName']}}">{{$pngFile['baseName']}}</p>
                <img src="{{$pngFile['path']}}" class='maps' width="200" height="150" alt="{{$pngFile['baseName']}}">
            </div>
        @endforeach
    </div>

    <!-- 主人公設定画面へ -->
    <div id="editMainCharaContainer">
        <form name="edit_mainChara" action="character/editMainCharacter" method="post">
        {{ csrf_field() }}
            <input type="hidden" name="project" value="{{$project}}">
            <input type="submit" value="主人公編集">
        </form>
    </div>

    <!-- 技編集画面へ -->
    <div id="editSkillContainer">
        <form name="edit_skill" action="skill/editSkill" method="post">
        {{ csrf_field() }}
            <input type="hidden" name="project" value="{{$project}}">
            <input type="submit" value="技編集">
        </form>
    </div>

    <!-- キャラクター編集画面へ -->
    <div id="editCharacterContainer">
        <form name="edit_character" action="character/editCharacter" method="post">
        {{ csrf_field() }}
            <input type="hidden" name="project" value="{{$project}}">
            <input type="submit" value="キャラクター編集">
        </form>
    </div>

    <!-- 道具編集画面へ -->
    <div id="editToolContainer">
        <form name="edit_tool" action="tool/editTool" method="post">
        {{ csrf_field() }}
            <input type="hidden" name="project" value="{{$project}}">
            <input type="submit" value="道具編集">
        </form>
    </div>

    <form name="map_data" action="rpg-editor/saveEditedMap" method="post">
        {{ csrf_field() }}
        <input type="hidden" name="map_obj_data" value="" />
        <input type="hidden" name="map_save_name" value="" />
        <input type="hidden" name="project_name" value="" />
        <input type="hidden" name="project_data" value="" />
    </form>

    <!-- バトルイベント使用のキャラクターたち（hidden） -->
    <div id="characters" style="display:;">
        <span>↓バトルイベントキャラ===</span>
        @foreach($characters as $character)
            <div class="eachCharaContainer">
                <img src="{{$character->characterImagePath}}" alt="{{$character->characterName}}" onclick="setBattleCharacter(this)" id="{{$character->id}}">
                <div><span>キャラ名</span><input type="text" name="name" class="" value="{{$character->characterName}}"></div>
                <div><span>ＨＰ　　</span><input type="text" name="hp" id="" value="{{$character->HP}}"></div>
                <div><span>こうげき</span><input type="text" name="op" id="" value="{{$character->OP}}"></div>
                <div><span>ぼうぎょ</span><input type="text" name="dp" id="" value="{{$character->DP}}"></div>
                <div><span>すばやさ</span><input type="text" name="ap" id="" value="{{$character->AP}}"></div>
                <div><span>スキルＰ</span><input type="text" name="sp" id="" value="{{$character->SP}}"></div>
                <div><span>技１　　</span><select id="" name="skill1">
                @foreach($skills as $skill)
                    @if ($skill->id == $character->skill1) 
                        <option value="{{$skill->id}}" selected>{{$skill->skillName}}</option>
                    @else
                        <option value="{{$skill->id}}">{{$skill->skillName}}</option>
                    @endif
                @endforeach
                </select></div>
                <div><span>技２　　</span><select id="" name="skill2">
                @foreach($skills as $skill)
                    @if ($skill->id == $character->skill2) 
                        <option value="{{$skill->id}}" selected>{{$skill->skillName}}</option>
                    @else
                        <option value="{{$skill->id}}">{{$skill->skillName}}</option>
                    @endif
                @endforeach
                </select></div>
                <div><span>技３　　</span><select id="" name="skill3">
                @foreach($skills as $skill)
                    @if ($skill->id == $character->skill3) 
                        <option value="{{$skill->id}}" selected>{{$skill->skillName}}</option>
                    @else
                        <option value="{{$skill->id}}">{{$skill->skillName}}</option>
                    @endif
                @endforeach
                </select></div>
                <div><span>技４　　</span><select id="" name="skill4">
                @foreach($skills as $skill)
                    @if ($skill->id == $character->skill4) 
                        <option value="{{$skill->id}}" selected>{{$skill->skillName}}</option>
                    @else
                        <option value="{{$skill->id}}">{{$skill->skillName}}</option>
                    @endif
                @endforeach
                </select></div>
                <div><span>大技１　　</span><select id="" name="specialSkill1">
                @foreach($specialSkills as $specialSkill)
                    @if ($specialSkill->id == $character->specialSkill1) 
                        <option value="{{$specialSkill->id}}" selected>{{$specialSkill->skillName}}</option>
                    @else
                        <option value="{{$specialSkill->id}}">{{$specialSkill->skillName}}</option>
                    @endif
                @endforeach
                </select></div>
                <div><span>大技２　　</span><select id="" name="specialSkill2">
                @foreach($specialSkills as $specialSkill)
                    @if ($specialSkill->id == $character->specialSkill2) 
                        <option value="{{$specialSkill->id}}" selected>{{$specialSkill->skillName}}</option>
                    @else
                        <option value="{{$specialSkill->id}}">{{$specialSkill->skillName}}</option>
                    @endif
                @endforeach
                </select></div>
            </div>
        @endforeach
    </div>

    <!-- オブジェクト設定用の画像コンテナ -->
    <div id="objects" style="display:;">
        <span>↓キャラ=====================================================================</span>
        <div id="charaObjContainer">
        @foreach($objects as $key1 => $prjDir)
                @if ($key1 == $project) 
                    <div id="obj_{{$key1}}">
                    <p>■■■{{$key1}}</p>
                    @foreach($prjDir['objects'] as $key2 => $objType)
                        @if ($key2 == 'characters') 
                            @foreach($objType as $key3 => $charaDir)
                                @foreach($charaDir as $charaPng)
                                    <img class="obj_charas" onclick="selectObjectImage(event)" src="../../rpg-player/public/projects/{{$key1}}/objects/{{$key2}}/{{$key3}}/{{$charaPng}}" id="{{$charaPng}}" alt="{{$key3}}">
                                @endforeach
                            @endforeach
                        @else

                        @endif
                    @endforeach
                    </div>
                @elseif ($key1 == 'common')
                    <div id="obj_common">
                    <p>■■■common</p>
                    @foreach($prjDir['objects'] as $key2 => $objType)
                        @if ($key2 == 'characters') 
                            @foreach($objType as $key3 => $charaDir)
                                @foreach($charaDir as $charaPng)
                                    <img class="obj_charas" onclick="selectObjectImage(event)" src="../../rpg-player/public/projects/{{$key1}}/objects/{{$key2}}/{{$key3}}/{{$charaPng}}" id="{{$charaPng}}" alt="{{$key3}}">
                                @endforeach
                            @endforeach
                        @else

                        @endif
                    @endforeach
                    </div>
                @else
                    <div class="obj_other">
                    <p>■■■other（{{$key1}}）</p>
                    @foreach($prjDir['objects'] as $key2 => $objType)
                        @if ($key2 == 'characters') 
                            @foreach($objType as $key3 => $charaDir)
                                @foreach($charaDir as $charaPng)
                                    <img class="obj_charas" onclick="selectObjectImage(event)" src="../../rpg-player/public/projects/{{$key1}}/objects/{{$key2}}/{{$key3}}/{{$charaPng}}" id="{{$charaPng}}" alt="{{$key3}}">
                                @endforeach
                            @endforeach
                        @else

                        @endif
                    @endforeach
                    </div>
                @endif
        @endforeach
        </div>

        <span>↓ツール=====================================================================</span>
        <div id="toolObjContainer">
        @foreach($objects as $key1 => $prjDir)
                @if ($key1 == $project) 
                    <div id="obj_{{$key1}}">
                    <p>■■■{{$key1}}</p>
                    @foreach($prjDir['objects'] as $key2 => $objType)
                        @if ($key2 == 'characters') 

                        @else
                            @foreach($objType as $toolPng)
                                <img class="obj_tools" onclick="selectObjectImage(event)" src="../../rpg-player/public/projects/{{$key1}}/objects/{{$key2}}/{{$toolPng}}" id="{{$toolPng}}">
                            @endforeach
                        @endif
                    @endforeach
                    </div>
                @elseif ($key1 == 'common')
                    <div id="obj_common">
                    <p>■■■common</p>
                    @foreach($prjDir['objects'] as $key2 => $objType)
                        @if ($key2 == 'characters') 

                        @else
                            @foreach($objType as $toolPng)
                                <img class="obj_tools" onclick="selectObjectImage(event)" src="../../rpg-player/public/projects/{{$key1}}/objects/{{$key2}}/{{$toolPng}}" id="{{$toolPng}}">
                            @endforeach
                        @endif
                    @endforeach
                    </div>
                @else
                    <div class="obj_other">
                    <p>■■■other（{{$key1}}）</p>
                    @foreach($prjDir['objects'] as $key2 => $objType)
                        @if ($key2 == 'characters') 

                        @else
                            @foreach($objType as $toolPng)
                                <img class="obj_tools" onclick="selectObjectImage(event)" src="../../rpg-player/public/projects/{{$key1}}/objects/{{$key2}}/{{$toolPng}}" id="{{$toolPng}}">
                            @endforeach
                        @endif
                    @endforeach
                    </div>
                @endif
        @endforeach
        </div>
    </div>

    <span>↓ワイプ=====================================================================</span>

    <!-- ワイプ設定用の画像コンテナ -->
    <div id="wipes" style="display:;">
        <div id="wipeContainer">
        @foreach($wipes as $key1 => $prjDir)
                @if ($key1 == $project) 
                    <div id="wipe_{{$key1}}">
                    <p>■■■{{$key1}}</p>
                    @foreach($prjDir['characters']['wipe'] as $key2 => $wipeCharaDir)
                        <p>{{$key2}}</p>
                        @foreach($wipeCharaDir as $charaPng)
                            <img class="wipes" onclick="selectWipeImage(event)" src="../../rpg-player/public/projects/{{$key1}}/characters/wipe/{{$key2}}/{{$charaPng}}" id="{{$charaPng}}">
                        @endforeach
                    @endforeach
                    </div>
                @elseif ($key1 == 'common')
                    <div id="wipe_common">
                    <p>■■■common</p>
                    @foreach($prjDir['characters']['wipe'] as $key2 => $wipeCharaDir)
                        <p>{{$key2}}</p>
                        @foreach($wipeCharaDir as $charaPng)
                            <img class="wipes" onclick="selectWipeImage(event)" src="../../rpg-player/public/projects/common/characters/wipe/{{$key2}}/{{$charaPng}}" id="{{$charaPng}}">
                        @endforeach
                    @endforeach
                    </div>
                @else
                    <div class="wipe_other">
                    <p>■■■other（{{$key1}}）</p>
                    @foreach($prjDir['characters']['wipe'] as $key2 => $wipeCharaDir)
                        <p>{{$key2}}</p>
                        @foreach($wipeCharaDir as $charaPng)
                            <img class="wipes" onclick="selectWipeImage(event)" src="../../rpg-player/public/projects/{{$key1}}/characters/wipe/{{$key2}}/{{$charaPng}}" id="{{$charaPng}}">
                        @endforeach
                    @endforeach
                    </div>
                @endif
        @endforeach
        </div>
    </div>

    <!-- マップ交互は、マップエディタコンテナに直接表示した。多分忘れた頃にここを見にくるので、メモ -->
    <!-- <span>↓マップ交互=====================================================================</span> -->

    <!-- マップ交互設定用の画像コンテナ -->
<!--     <div id="turnChips" style="display:;">
        <div id="turnChipContainer">
        <span style="background-color: yellow;">↓★★★★マップ交互★★★★</span>
        @foreach($turnChips as $key1 => $prjDir)
            <div id="turnChip_{{$key1}}">
            <p>■■■{{$key1}}</p> 
            @foreach($prjDir as $key2 => $turnChipDir)
                <p>{{$key2}}</p>
                @foreach($turnChipDir as $chipPng)
                    <img class="turnChips" onclick="selectTurnChipImage(event)" src="../../map-editor/image/map-editor/map-chip/{{$key1}}/mapTurn/{{$key2}}/{{$chipPng}}" id="{{$chipPng}}">
                @endforeach
            @endforeach
            </div>
        @endforeach
        <span style="background-color: yellow;">↓★★★★マップパス交互★★★★</span>
        @foreach($turnPassChips as $key1 => $prjDir)
            <div id="turnChip_{{$key1}}">
            <p>■■■{{$key1}}</p> 
            @foreach($prjDir as $key2 => $turnPassChipDir)
                <p>{{$key2}}</p>
                @foreach($turnPassChipDir as $chipPng)
                    <img class="turnChips" onclick="selectTurnPassChipImage(event)" src="../../map-editor/image/map-editor/map-chip/{{$key1}}/mapTurnPass/{{$key2}}/{{$chipPng}}" id="{{$chipPng}}">
                @endforeach
            @endforeach
            </div>
        @endforeach        
        </div>
    </div> -->

    <!-- カットシーン設定用の画像コンテナ -->
    <div id="cutScenes" style="display:;">
        <span>↓スペシャルスキル=====================================================================</span>
        <div id="specialSkillContainer">
        @foreach($cutScenes as $key1 => $prjDir)
                @if ($key1 == $project) 
                    <div id="cutScene_{{$key1}}">
                    <p>■■■{{$key1}}</p>
                    @foreach($prjDir['cutScenes'] as $key2 => $cutSceneType)
                        @if ($key2 == 'specialSkill') 
                            @foreach($cutSceneType as $key3 => $charaDir)
                                <p>{{$key3}}</p>
                                @foreach($charaDir as $skillPng)
                                    <img class="cutScene_specialSkill" onclick="selectCutSceneImage(event)" src="../../rpg-player/public/projects/{{$key1}}/cutScenes/{{$key2}}/{{$key3}}/{{$skillPng}}" id="{{$skillPng}}" alt="{{$key3}}">
                                @endforeach
                            @endforeach
                        @else

                        @endif
                    @endforeach
                    </div>
                @elseif ($key1 == 'common')
                    <div id="cutScene_common">
                    <p>■■■common</p>
                    @foreach($prjDir['cutScenes'] as $key2 => $cutSceneType)
                        @if ($key2 == 'specialSkill') 
                            @foreach($cutSceneType as $key3 => $charaDir)
                                <p>{{$key3}}</p>
                                @foreach($charaDir as $skillPng)
                                    <img class="cutScene_specialSkill" onclick="selectCutSceneImage(event)" src="../../rpg-player/public/projects/{{$key1}}/cutScenes/{{$key2}}/{{$key3}}/{{$skillPng}}" id="{{$skillPng}}" alt="{{$key3}}">
                                @endforeach
                            @endforeach
                        @else

                        @endif
                    @endforeach
                    </div>
                @else
                    <div class="cutScene_other">
                    <p>■■■other（{{$key1}}）</p>
                    @foreach($prjDir['cutScenes'] as $key2 => $cutSceneType)
                        @if ($key2 == 'specialSkill') 
                            @foreach($cutSceneType as $key3 => $charaDir)
                                <p>{{$key3}}</p>
                                @foreach($charaDir as $skillPng)
                                    <img class="cutScene_specialSkill" onclick="selectCutSceneImage(event)" src="../../rpg-player/public/projects/{{$key1}}/cutScenes/{{$key2}}/{{$key3}}/{{$skillPng}}" id="{{$skillPng}}" alt="{{$key3}}">
                                @endforeach
                            @endforeach
                        @else

                        @endif
                    @endforeach
                    </div>
                @endif
        @endforeach
        </div>

        <span>↓シーン=====================================================================</span>
        <div id="sceneContainer">
        @foreach($cutScenes as $key1 => $prjDir)
                @if ($key1 == $project) 
                    <div id="cutScene_{{$key1}}">
                    <p>■■■{{$key1}}</p>
                    @foreach($prjDir['cutScenes'] as $key2 => $cutSceneType)
                        @if ($key2 == 'specialSkill') 

                        @else
                            @foreach($cutSceneType as $scenePng)
                                <img class="cutScene_scene" onclick="selectCutSceneImage(event)" src="../../rpg-player/public/projects/{{$key1}}/cutScenes/{{$key2}}/{{$scenePng}}" id="{{$scenePng}}">
                            @endforeach
                        @endif
                    @endforeach
                    </div>
                @elseif ($key1 == 'common')
                    <div id="cutScene_common">
                    <p>■■■common</p>
                    @foreach($prjDir['cutScenes'] as $key2 => $cutSceneType)
                        @if ($key2 == 'specialSkill') 

                        @else
                            @foreach($cutSceneType as $scenePng)
                                <img class="cutScene_scene" onclick="selectCutSceneImage(event)" src="../../rpg-player/public/projects/{{$key1}}/cutScenes/{{$key2}}/{{$scenePng}}" id="{{$scenePng}}">
                            @endforeach
                        @endif
                    @endforeach
                    </div>
                @else
                    <div class="cutScene_other">
                    <p>■■■other（{{$key1}}）</p>
                    @foreach($prjDir['cutScenes'] as $key2 => $cutSceneType)
                        @if ($key2 == 'specialSkill') 

                        @else
                            @foreach($cutSceneType as $scenePng)
                                <img class="cutScene_scene" onclick="selectCutSceneImage(event)" src="../../rpg-player/public/projects/{{$key1}}/cutScenes/{{$key2}}/{{$scenePng}}" id="{{$scenePng}}">
                            @endforeach
                        @endif
                    @endforeach
                    </div>
                @endif
        @endforeach
        </div>
    </div>


    <span>↓ツール=====================================================================</span>

    <!-- ツール設定用のコンテナ -->
    <div id="tools" style="display:;">
        <div id="toolContainer">
            <table border="1">
                <tr style="background: skyblue">
                    <th>選択</th>
                    <th>ID</th>
                    <th>ツール名</th>
                    <th>説明</th>
                </tr>                
                @foreach($tools as $tool)
                    <tr>
                        <th><button type="button" onclick="setToolInfo(event, {{$tool->id}})" class="tools" value="{{$tool->id}}"></button></th>
                        <th>{{$tool->id}}</th>
                        <th>{{$tool->toolName}}</th>
                        <th>{{$tool->description}}</th>
                    </tr>
                @endforeach
            </table>
        </div>
    </div>

    <span>↓サウンド=====================================================================</span>

    <!-- サウンド設定用のコンテナ -->
    <div id="sounds" style="display:;">
        <div id="soundContainer">
            @foreach($sounds as $key => $soundType)
            <p style="background-color: red">{{$key}}</p>
                @foreach($soundType as $key2 => $soundTypeSub)
                <p style="background-color: orange">{{$key2}}</p>
                    @foreach($soundTypeSub as $soundFile)
                        <p>
                            <button onclick="setSoundInfo(event, '{{$key}}','{{$key2}}','{{$soundFile}}')">選択</button>
                            <button onclick="sound('{{$soundFile}}')">再生</button>{{$soundFile}}
                        </p>
                        <audio id="{{$soundFile}}" preload="auto">
                            <source src="../../rpg-player/public/sounds/{{$key}}/{{$key2}}/{{$soundFile}}" type="audio/mp3">
                            <p>※お使いのブラウザはHTML5のaudio要素をサポートしていないので音は鳴りません。</p>
                        </audio>
                    @endforeach                  
                @endforeach  
            @endforeach
        </div>
    </div>

<script src="{{ asset('/js/rpg-editor.js') }}"></script>
</body>

