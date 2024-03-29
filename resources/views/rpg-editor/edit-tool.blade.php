@extends('layouts.rpg-editor-parent')


@component('components.rpg-editor-header')

@endcomponent


<form action="/rpg-editor/public/getProjectData" method="POST">
{{ csrf_field() }}
    <input type="hidden" name="oldProjectName" id="" value="{{$project}}">
    <input type="submit" value="プロジェクト編集画面へ戻る">
</form>


@section('select-project')

    <!-- 新規道具 -->
    <div>
        <div id="newTool">
        <form action="saveNewTool" method="POST">
        {{ csrf_field() }}
            <input type="hidden" name="project" id="" value="{{$project}}">
            <input type="submit" value="新規登録">
            <div><span>道具名</span><input type="text" name="toolName" id="" cols="30"></div>
            <div><span>説明</span><textarea name="description" id=""></textarea></div>
            <div><span>↓くらいの長さが最高<br></span><textarea name="dummy" id="">うまいんだよなああああ。たまに食べたくなるんだよなあ。ああああああああああああああああああああああああ。</textarea></div>
        </form>
        </div>
    </div>

    <span>既存道具↓========================================================================================================</span>


    <!-- 既存道具 -->
    <div id="oldTools">
    @foreach($tools as $tool)
        <div class="registeredToolContainer">
        <form action="updateTool" method="POST">
        {{ csrf_field() }}
            <div><span>道具名</span><input type="text" name="toolName" id="" cols="30" value="{{$tool->toolName}}"></div>
            <div><span>説明</span><textarea name="description" id="" value="{{$tool->description}}">{{$tool->description}}</textarea></div>
            <input type="hidden" name="project" id="" value="{{$project}}">
            <input type="hidden" name="id" value="{{$tool->id}}">
            <input type="submit" value="更新">
        </form>
        <form action="deleteTool" method="POST">
            {{ csrf_field() }}
            <input type="hidden" name="project" id="" value="{{$project}}">
            <input type="hidden" name="id" value="{{$tool->id}}">
            <input type="submit" onclick="return confirm('削除OK?')" value="削除">
        </form>
        </div>
    @endforeach
    </div>
@endsection