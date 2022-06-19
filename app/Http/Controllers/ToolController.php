<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Tool; //Toolテーブルを扱うToolモデルをuseする
use Illuminate\Support\Facades\DB;

class ToolController extends Controller
{
    //スキル編集画面を表示する
    public function editTool(Request $request) {
        $tools = $this->getTools($request->project);

        return view('rpg-editor.edit-tool', ['project'=>$request->project,'tools'=>$tools]);
    }

    // DBに登録済みのスキル情報を取得する（where=プロジェクトネーム)
    public function getTools($project) {
        //get()メソッドは、SELECTメソッドに相当するもの。get(['id', 'name])と言う風に、フィールドを絞ることもできる。
        $tools = DB::table('tools')->where('project', $project)->get();
        return $tools;
    }

    //技をデータベースに登録しにいく
    public function saveNewTool(Request $request) {
        //まずはDBに登録
        $tool = new Tool();
        $tool->project = $request->project;
        $tool->toolName = $request->toolName;
        $tool->description = $request->description;
        unset($tool['_token']);
        //$character->fill($character)->save();
        $tool->save();

        //次にプロジェクトデータ.jsonを更新
        $tools = $this->getTools($request->project);

        $updateData = $tools;
        $this->updateProjectData($request->project, $updateData);

        return view('rpg-editor.edit-tool', ['project'=>$request->project,'tools'=>$tools]);
    }

    //キャラクターをデータベースに登録しにいく
    public function updateTool(Request $request) {
        //まずはDBを更新
        $param = [
            'toolName' => $request->toolName,
            'description' => $request->description,
        ];
        DB::table('tools')->where('id', $request->id)->update($param); //とりあえずApp\Toolのモデルは使わず、、練習として

        //次にプロジェクトデータ.jsonを更新
        $tools = $this->getTools($request->project);

        $updateData = $tools;
        $this->updateProjectData($request->project, $updateData);

        return view('rpg-editor.edit-tool', ['project'=>$request->project,'tools'=>$tools]);
    }


    public function deleteTool(Request $request) {
        DB::table('tools')->where('id', $request->id)->delete();
        return $this->editTool($request);
    }

    //projectData.jsonを更新する 
    public function updateProjectData($project, $updateData) {
        // コントローラディレクトリなのに、パブリックディレクトリから検索スタートになってる！！！なぜ！！
        $pattern = "./projects/" . $project . "/projectData.json";
        $rets = glob($pattern);
        $json = file_get_contents($rets[0]);
        $json = mb_convert_encoding($json, 'UTF8', 'ASCII,JIS,UTF-8,EUC-JP,SJIS-WIN');
        // 連想配列へのアクセス方法
        $arr = json_decode($json,true);
        //更新用データの作成
        $jsnTools = array();
        $tools = $updateData; //tools
        foreach($tools as $tool) {
            $jsnTools[$tool->id]["toolName"] = $tool->toolName;
            $jsnTools[$tool->id]["description"] = $tool->description;
        }
        $arr["tools"] = $jsnTools;
        //スキルを全部更新して保存（encode）
        $json = json_encode($arr, JSON_UNESCAPED_UNICODE); //idでソートしないとダメかと思ったけど、綺麗に並んだ
        echo $json;
        file_put_contents($rets[0], $json);
        file_put_contents("../../rpg-player/public/projects/" . $project . "/projectData.json", $json);
    }
}
