<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

//一番最初、プロジェクト選択画面
//(ミドルウェアでプロジェクトのセレクトボックス取得してるけど、ビューコンポーザにすべきかも)
Route::get('/', 'RpgEditorController@selectProject')
    ->middleware('selectProject');

//プロジェクトの情報を取得しにいく
//Route::post('/getProjectData', 'RpgEditorController@getProjectData');
Route::post('getProjectData', 'RpgEditorController@getProjectData');

//マップ保存のアクションへ
Route::post('/rpg-editor/saveEditedMap', 'RpgEditorController@saveEditedMap');
