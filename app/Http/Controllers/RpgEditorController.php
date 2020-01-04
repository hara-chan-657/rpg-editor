<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/* resoureces/viewsにあるbladeを探しにいくよ！！！ */


class RpgEditorController extends Controller
{
    //プロジェクト選択画面へ
    public function selectProject(Request $request) {
        //selectProjectMiddlewara.phpからデータ取得
        return view('rpg-editor.select-project', ['data'=>$request->data]);
    }

    //プロジェクトデータを取得しにいく
    public function getProjectData(Request $request) {
        //引数のプロジェクト名を元に、プロジェクトのマップと、マップデータを探しにいく
        //ディレクトリの中のマップ画像パスを取得する
        $i = 0; //マップ画像インデックス
        foreach(glob('./projects/' . $request->oldProjectName . '/*.png') AS $pngFile){
            if(is_file($pngFile)){
                $pngFiles[$i]['path'] = $pngFile;
                $pngFiles[$i]['baseName'] = basename($pngFile, '.png');
                $i++;
            }
        }
        foreach(glob('./projects/' . $request->oldProjectName . '/*.json') AS $jsonFile){
            if(is_file($jsonFile)){
                $jsonFiles[] = basename($jsonFile);
            }
        }
        return view('rpg-editor.rpg-editor', ['pngFiles'=>$pngFiles, 'jsonFiles'=>$jsonFiles, 'project'=>$request->oldProjectName]);
    }

    //編集されたマップ情報をサーバに保存＆rpg-playerに同期しにいく
    public function saveEditedMap(Request $request) {
        $mapJsonObj = $request->map_obj_data;
        $savePath = './projects/' . $request->project_name . '/' . $request->map_save_name .'.json';
        //マップオブジェクトデータを保存
        $fp = fopen($savePath, "w");
        fwrite($fp, $mapJsonObj);
        fclose($fp);

        //プロジェクトディレクトリをrpg-playerに同期
        $fromDir = './projects/' . $request->project_name;
        $toDir = '../../rpg-player/public/projects/' . $request->project_name;
        //初回保存時のみ、プロジェクトディレクトリを作成
        if (!file_exists($toDir)) {
            mkdir($toDir, 0755);
        }
        //保存するマップ以外のマップのファイルも含めて同期(新たに追加したマップの処遇がめんどくさいので)
        foreach(glob($fromDir . '/*') AS $file){
            if(is_file($file)){
                copy($file, $toDir.'/'.basename($file));
            }
        }
        return redirect('/');
    }
}
