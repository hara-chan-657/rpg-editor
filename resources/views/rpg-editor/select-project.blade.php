//プロジェクト選択用view!

@extends('layouts.rpg-editor-parent')


@component('components.rpg-editor-header')

@endcomponent


@section('select-project')
    <form action="/getProjectData" method="POST">
    {{ csrf_field() }}
    <p>プロジェクトを選択してください</p>
    <p>{!! $data['projects'] !!}</P>
    <input type="submit">
</form>
@endsection