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
                                    <img class="obj_charas" onclick="selectObjectImage(event)" src="../../rpg-player/public/projects/{{$key1}}/objects/{{$key2}}/{{$key3}}/{{$charaPng}}" id="{{$charaPng}}">
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
                                    <img class="obj_charas" onclick="selectObjectImage(event)" src="../../rpg-player/public/projects/{{$key1}}/objects/{{$key2}}/{{$key3}}/{{$charaPng}}" id="{{$charaPng}}">
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
                                    <img class="obj_charas" onclick="selectObjectImage(event)" src="../../rpg-player/public/projects/{{$key1}}/objects/{{$key2}}/{{$key3}}/{{$charaPng}}" id="{{$charaPng}}">
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
<script src="{{ asset('/js/rpg-editor.js') }}"></script>
</body>


