@extends('layouts.rpg-editor-parent')


@component('components.rpg-editor-header')

@endcomponent


<form action="/rpg-editor/public/getProjectData" method="POST">
{{ csrf_field() }}
    <input type="hidden" name="oldProjectName" id="" value="{{$project}}">
    <input type="submit" value="プロジェクト編集画面へ戻る">
</form>


@section('select-project')

    <!-- 新規キャラクタ -->
    <div>
        <div id="newCharacter">
        <form action="saveNewCharacter" method="POST">
        {{ csrf_field() }}
            <input type="submit" value="新規登録">
            <div><span>キャラ名</span><input type="text" name="name" id="" cols="30"></div>
            <div><span>ＨＰ　　</span><input type="text" name="hp" id=""></div>
            <div><span>こうげき</span><input type="text" name="op" id=""></div>
            <div><span>ぼうぎょ</span><input type="text" name="dp" id=""></div>
            <div><span>すばやさ</span><input type="text" name="ap" id=""></div>
            <div><span>スキルＰ</span><input type="text" name="sp" id=""></div>
            <!-- 技 -->
            <div><span>技１　　</span><select id="" name="skill1">
            @foreach($skills as $skill)
                <option value="{{$skill->id}}">{{$skill->skillName}}</option>
            @endforeach
            </select></div>
            <div><span>技２　　</span><select id="" name="skill2">
            @foreach($skills as $skill)
                <option value="{{$skill->id}}">{{$skill->skillName}}</option>
            @endforeach
            </select></div>
            <div><span>技３　　</span><select id="" name="skill3">
            @foreach($skills as $skill)
                <option value="{{$skill->id}}">{{$skill->skillName}}</option>
            @endforeach
            </select></div>
            <div><span>技４　　</span><select id="" name="skill4">
            @foreach($skills as $skill)
                <option value="{{$skill->id}}">{{$skill->skillName}}</option>
            @endforeach
            </select></div>
            <div><span>大技１　</span><select id="" name="specialSkill1">
            @foreach($specialSkills as $specialSkill)
                <option value="{{$specialSkill->id}}">{{$specialSkill->skillName}}</option>
            @endforeach
            </select></div>
            <div><span>大技２　</span><select id="" name="specialSkill2">
            @foreach($specialSkills as $specialSkill)
                <option value="{{$specialSkill->id}}">{{$specialSkill->skillName}}</option>
            @endforeach
            </select></div>
            <input type="hidden" name="project" id="" value="{{$project}}">
            <p>画像を選択してください</p>
            @foreach($pngFiles as $pngFile)
                <div class="eachCharacterContainer">
                    <input type="radio" name="characters" class="characters" value="{{$pngFile['path']}}">{{$pngFile['baseName']}}
                    <img src="{{$pngFile['path']}}" class='maps' width="" height="" alt="{{$pngFile['baseName']}}">
                </div>
            @endforeach
        </form>
        </div>
    </div>


    <p>既存キャラクタ↓========================================================================================================</p>

    <!-- 既存キャラクタ -->
    @foreach($charas as $chara)
    <div class="registeredCharacterContainer">
        <form action="updateCharacter" method="POST">
        {{ csrf_field() }}
            <img src="{{$chara->characterImagePath}}" class='registeredChracters' width="" height="" alt="{{$chara->characterImagePath}}">
            <div><span>キャラ名</span><input type="text" name="name" class="" value="{{$chara->characterName}}"></div>
            <div><span>ＨＰ　　</span><input type="text" name="hp" id="" value="{{$chara->HP}}"></div>
            <div><span>こうげき</span><input type="text" name="op" id="" value="{{$chara->OP}}"></div>
            <div><span>ぼうぎょ</span><input type="text" name="dp" id="" value="{{$chara->DP}}"></div>
            <div><span>すばやさ</span><input type="text" name="ap" id="" value="{{$chara->AP}}"></div>
            <div><span>スキルＰ</span><input type="text" name="sp" id="" value="{{$chara->SP}}"></div>
            <div><span>技１　　</span><select id="" name="skill1">
            @foreach($skills as $skill)
                @if ($skill->id == $chara->skill1) 
                    <option value="{{$skill->id}}" selected>{{$skill->skillName}}</option>
                @else
                    <option value="{{$skill->id}}">{{$skill->skillName}}</option>
                @endif
            @endforeach
            </select></div>
            <div><span>技２　　</span><select id="" name="skill2">
            @foreach($skills as $skill)
                @if ($skill->id == $chara->skill2) 
                    <option value="{{$skill->id}}" selected>{{$skill->skillName}}</option>
                @else
                    <option value="{{$skill->id}}">{{$skill->skillName}}</option>
                @endif
            @endforeach
            </select></div>
            <div><span>技３　　</span><select id="" name="skill3">
            @foreach($skills as $skill)
                @if ($skill->id == $chara->skill3) 
                    <option value="{{$skill->id}}" selected>{{$skill->skillName}}</option>
                @else
                    <option value="{{$skill->id}}">{{$skill->skillName}}</option>
                @endif
            @endforeach
            </select></div>
            <div><span>技４　　</span><select id="" name="skill4">
            @foreach($skills as $skill)
                @if ($skill->id == $chara->skill4) 
                    <option value="{{$skill->id}}" selected>{{$skill->skillName}}</option>
                @else
                    <option value="{{$skill->id}}">{{$skill->skillName}}</option>
                @endif
            @endforeach
            </select></div>
            <div><span>大技１　　</span><select id="" name="specialSkill1">
            @foreach($specialSkills as $specialSkill)
                @if ($specialSkill->id == $chara->specialSkill1) 
                    <option value="{{$specialSkill->id}}" selected>{{$specialSkill->skillName}}</option>
                @else
                    <option value="{{$specialSkill->id}}">{{$specialSkill->skillName}}</option>
                @endif
            @endforeach
            </select></div>
            <div><span>大技２　　</span><select id="" name="specialSkill2">
            @foreach($specialSkills as $specialSkill)
                @if ($specialSkill->id == $chara->specialSkill2) 
                    <option value="{{$specialSkill->id}}" selected>{{$specialSkill->skillName}}</option>
                @else
                    <option value="{{$specialSkill->id}}">{{$specialSkill->skillName}}</option>
                @endif
            @endforeach
            </select></div>
            <input type="hidden" name="project" id="" value="{{$project}}">
            <input type="hidden" name="id" value="{{$chara->id}}">
            <input type="submit" onclick="return confirm('更新OK?')" value="更新">
        </form>
        <form action="deleteCharacter" method="POST">
        {{ csrf_field() }}
            <input type="hidden" name="project" id="" value="{{$project}}">
            <input type="hidden" name="id" value="{{$chara->id}}">
            <input type="submit" onclick="return confirm('削除OK?')" value="削除">
        </form>
    </div>
    @endforeach
@endsection