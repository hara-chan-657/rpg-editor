<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/* resoureces/viewsにあるbladeを探しにいくよ！！！ */


class RpgEditorController extends Controller
{
    public function index(Request $request) {
        return view('rpg-editor.rpg-editor', $request);
    }

    public function selectProject(Request $request) {
        //selectProjectMiddlewara.phpからデータ取得
        return view('rpg-editor.select-project', ['data'=>$request->data]);
    }

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

    public function getJson(Request $request) {

    }
}
