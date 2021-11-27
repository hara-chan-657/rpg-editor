@extends('layouts.rpg-editor-parent')


@component('components.rpg-editor-header')

@endcomponent


@section('select-project')
    <form action="saveMainCharacter" method="POST">
    {{ csrf_field() }}
        <!-- 主人公設定 -->
        {!! $charaFiles !!}
        <input type="submit">
    </form>

@endsection