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
//(ミドルウェア(アクションの前かあとで実行する処理）でプロジェクトのセレクトボックス取得してるけど、ビューコンポーザにすべきかも？)
Route::get('/', 'RpgEditorController@selectProject')
    ->middleware('selectProject');

//プロジェクトの情報を取得しにいく
//Route::post('/getProjectData', 'RpgEditorController@getProjectData');
Route::post('getProjectData', 'RpgEditorController@getProjectData');

//マップ保存のアクションへ
Route::post('/rpg-editor/saveEditedMap', 'RpgEditorController@saveEditedMap');


//主人公設定画面へ
Route::post('/character/editMainCharacter', 'CharacterController@editMainCharacter');

//主人公保存
Route::post('/character/saveMainCharacter', 'CharacterController@saveMainCharacter');


//キャラクター編集画面へ
Route::post('/character/editCharacter', 'CharacterController@editCharacter');

//キャラクター保存
Route::post('character/saveNewCharacter', 'CharacterController@saveNewCharacter');

//キャラクター更新
Route::post('character/updateCharacter', 'CharacterController@updateCharacter');

//キャラクター削除
Route::post('character/deleteCharacter', 'CharacterController@deleteCharacter');



//技編集画面へ
Route::post('/skill/editSkill', 'SkillController@editSkill');

//新規技保存
Route::post('/skill/saveNewSkill', 'SkillController@saveNewSkill');

//技更新
Route::post('/skill/updateSkill', 'SkillController@updateSkill');

//技削除
Route::post('/skill/deleteSkill', 'SkillController@deleteSkill');



//道具編集画面へ
Route::post('/tool/editTool', 'ToolController@editTool');

//新規道具保存
Route::post('/tool/saveNewTool', 'ToolController@saveNewTool');

//道具更新
Route::post('/tool/updateTool', 'ToolController@updateTool');

//道具削除
Route::post('/tool/deleteTool', 'ToolController@deleteTool');