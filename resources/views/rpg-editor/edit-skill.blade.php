@extends('layouts.rpg-editor-parent')


@component('components.rpg-editor-header')

@endcomponent


<form action="/rpg-editor/public/getProjectData" method="POST">
{{ csrf_field() }}
    <input type="hidden" name="oldProjectName" id="" value="{{$project}}">
    <input type="submit" value="プロジェクト編集画面へ戻る">
</form>


@section('select-project')

    <!-- 新規スキル -->
    <div>
        <div id="newSkill">
        <form action="saveNewSkill" method="POST">
        {{ csrf_field() }}
            <input type="hidden" name="project" id="" value="{{$project}}">
            <input type="submit" value="新規登録">
            <div><span>技名</span><input type="text" name="skillName" id="" cols="30"></div>
            <div><span>威力</span><input type="text" name="skillPower" id="" style="pointer-events: none;" value="1"></div>
            <div>
            <span>技分類</span>
            <select id="" name="skillType">
            @for($i=1; $i < 3; $i++)
                <option value="{{$i}}">{{$i}}</option>
            @endfor
            </select>
            </div>
            <p>画像を選択してください</p>
            <div class="eachSkillContainer"><input type="radio" name="skillImagePath" id="" value="dummy" checked="true">dummy(通常スキル)</div>
            @foreach($pngFiles as $charaName)
                @foreach($charaName as $pngFile)
                    <div class="eachSkillContainer">
                        <input type="radio" name="skillImagePath" class="" value="{{$pngFile['baseName']}}">{{$pngFile['baseName']}}
                        <img src="{{$pngFile['path']}}" class='skillImage' width="" height="" alt="{{$pngFile['baseName']}}">
                    </div>
                @endforeach
            @endforeach
        </form>
        </div>
    </div>

    <p>既存スキル↓========================================================================================================</p>

    <!-- 既存スキル -->
    <div id="oldSkills">
    @foreach($skills as $skill)
        <div class="registeredSkillContainer">
        <form action="updateSkill" method="POST">
        {{ csrf_field() }}
            <div><span>技名</span><input type="text" name="skillName" class="" value="{{$skill->skillName}}"></div>
            <div><span>威力</span><input type="text" name="skillPower" id="" value="{{$skill->skillPower}}"></div>
            <div><span>技分類</span><input type="text" name="skillType" id="" value="{{$skill->skillType}}"></div>
            <div><span>大技画像</span><input type="text" name="skillImagePath" id="" value="{{$skill->skillImagePath}}"></div>
            <input type="hidden" name="project" id="" value="{{$project}}">
            <input type="hidden" name="id" value="{{$skill->id}}">
            <input type="submit" value="更新">
        </form>
        <form action="deleteSkill" method="POST">
            {{ csrf_field() }}
            <input type="hidden" name="project" id="" value="{{$project}}">
            <input type="hidden" name="id" value="{{$skill->id}}">
            <input type="submit" onclick="return confirm('削除OK?')" value="削除"><span>※未実装</span>
        </form>
        </div>
    @endforeach
    </div>

    <div>
    @foreach($specialSkills as $specialSkill)
        <div class="registeredSpecialSkillContainer">
        <form action="updateSkill" method="POST">
        {{ csrf_field() }}
            <div><span>技名</span><input type="text" name="skillName" class="" value="{{$specialSkill->skillName}}"></div>
            <div><span>威力</span><input type="text" name="skillPower" id="" value="{{$specialSkill->skillPower}}"></div>
            <div><span>技分類</span><input type="text" name="skillType" id="" value="{{$specialSkill->skillType}}"></div>
            <div><span>大技画像</span><input type="text" name="skillImagePath" id="" value="{{$specialSkill->skillImagePath}}"></div>
            <div><span style="color: red; font-size: 11px;">※大技画像は名前をコピペしてください</span></div>
            <input type="hidden" name="project" id="" value="{{$project}}">
            <input type="hidden" name="id" value="{{$specialSkill->id}}">
            <input type="submit" value="更新">
        </form>
        <form action="deleteSkill" method="POST">
            {{ csrf_field() }}
            <input type="hidden" name="project" id="" value="{{$project}}">
            <input type="hidden" name="id" value="{{$specialSkill->id}}">
            <input type="submit" onclick="return confirm('削除OK?')" value="削除"><span>※未実装</span>
        </form>
        </div>
    @endforeach
    </div>
@endsection