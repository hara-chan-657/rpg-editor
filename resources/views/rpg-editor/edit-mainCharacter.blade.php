@extends('layouts.rpg-editor-parent')


@component('components.rpg-editor-header')

@endcomponent


<form action="/rpg-editor/public/getProjectData" method="POST">
{{ csrf_field() }}
    <input type="hidden" name="oldProjectName" id="" value="{{$project}}">
    <input type="submit" value="プロジェクト編集画面へ戻る">
</form>


@section('select-project')
    <form action="saveMainCharacter" method="POST">
    {{ csrf_field() }}
        <!-- 主人公設定 -->
        {!! $charaFiles !!}
        <input type="submit">
    </form>

@endsection