<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
//DBクラスを扱うための記述。DB::table()メソッドは、Illuminate\Database\Query名前空間のBuilserクラスのインスタンスを返す。
//Illuminate\Database\Query名前空間のBuilserクラスのインスタンスは、DB操作のためのメソッド（クエリビルダ）が備わっている。
use Illuminate\Support\Facades\DB;
//eloquentモデルクラスを扱うための記述。Illuminate\Database\Eloquent名前空間のCollectionクラスのインスタンスを返す。
use App\Character;  //モデルクラスを使用するために追記

class CharacterController extends Controller
{
    //キャラクター編集画面を表示する
    public function editCharacter(Request $request) {
        $pngFiles = $this->getPngFiles($request->project);
        $charas = $this->getCharacters($request->project);
        $skills = $this->getSkills($request->project);
        $specialSkills = $this->getSpecialSkills($request->project);

        return view('rpg-editor.edit-character', ['pngFiles'=>$pngFiles, 'project'=>$request->project, 'charas'=>$charas, 'skills'=>$skills, 'specialSkills'=>$specialSkills]);
    }

    //キャラクターをデータベースに登録しにいく
    public function saveNewCharacter(Request $request) {
        $character = new Character();
        $character->project = $request->project;
        $character->characterName = $request->name;
        $character->characterImagePath = (string)$request->characters; //パスはplayerのパスで登録（キャラ編集画面ではなく、マップ編集画面で表示するため）
        $character->HP = $request->hp;
        $character->OP = $request->op;
        $character->DP = $request->dp;
        $character->AP = $request->ap;
        $character->SP = $request->sp;
        $character->skill1 = $request->skill1;
        $character->skill2 = $request->skill2;
        $character->skill3 = $request->skill3;
        $character->skill4 = $request->skill4;
        $character->specialSkill1 = $request->specialSkill1;
        $character->specialSkill2 = $request->specialSkill2;
        unset($character['_token']);
        //$character->fill($character)->save();
        $character->save();

        $pngFiles = $this->getPngFiles($request->project);
        $charas = $this->getCharacters($request->project);
        $skills = $this->getSkills($request->project);
        $specialSkills = $this->getSpecialSkills($request->project);

        $this->updateProjectData($request->project, $charas);

        return view('rpg-editor.edit-character', ['pngFiles'=>$pngFiles, 'project'=>$request->project, 'charas'=>$charas, 'skills'=>$skills, 'specialSkills'=>$specialSkills]);
    }

    //キャラクターをデータベースに登録しにいく
    public function updateCharacter(Request $request) {
        $param = [
            'characterName' => $request->name,
            'HP' => $request->hp,
            'OP' => $request->op,
            'DP' => $request->dp,
            'AP' => $request->ap,
            'SP' => $request->sp,
            'skill1' => $request->skill1,
            'skill2' => $request->skill2,
            'skill3' => $request->skill3,
            'skill4' => $request->skill4,
            'specialSkill1' => $request->specialSkill1,
            'specialSkill2' => $request->specialSkill2,
        ];
        DB::table('characters')->where('id', $request->id)->update($param); //とりあえずApp\Characterのモデルは使わず、、練習として

        $pngFiles = $this->getPngFiles($request->project);
        $charas = $this->getCharacters($request->project);
        $skills = $this->getSkills($request->project);
        $specialSkills = $this->getSpecialSkills($request->project);

        $this->updateProjectData($request->project, $charas);

        return view('rpg-editor.edit-character', ['pngFiles'=>$pngFiles, 'project'=>$request->project, 'charas'=>$charas, 'skills'=>$skills, 'specialSkills'=>$specialSkills]);

    }

    public function deleteCharacter(Request $request) {
        echo 'ここにきたよ';
    }

    //projectData.jsonを更新する 
    public function updateProjectData($project, $charas) {
        // コントローラディレクトリなのに、パブリックディレクトリから検索スタートになってる！！！なぜ！！
        $pattern = "./projects/" . $project . "/projectData.json";
        $rets = glob($pattern);
        $json = file_get_contents($rets[0]);
        $json = mb_convert_encoding($json, 'UTF8', 'ASCII,JIS,UTF-8,EUC-JP,SJIS-WIN');
        // 連想配列へのアクセス方法
        $arr = json_decode($json,true);
        //更新用データの作成
        $jsnChara = array();
        foreach($charas as $chara) {
            $jsnChara[$chara->id]["chrName"] = $chara->characterName;
            $jsnChara[$chara->id]["chrImgName"] = basename($chara->characterImagePath); //これだけパスの都合上いじってあるから注意
            $jsnChara[$chara->id]["HP"] = $chara->HP;
            $jsnChara[$chara->id]["OP"] = $chara->OP;
            $jsnChara[$chara->id]["DP"] = $chara->DP;
            $jsnChara[$chara->id]["AP"] = $chara->AP;
            $jsnChara[$chara->id]["SP"] = $chara->SP;
            $jsnChara[$chara->id]["skill1"] = $chara->skill1;
            $jsnChara[$chara->id]["skill2"] = $chara->skill2;
            $jsnChara[$chara->id]["skill3"] = $chara->skill3;
            $jsnChara[$chara->id]["skill4"] = $chara->skill4;
            $jsnChara[$chara->id]["spSkill1"] = $chara->specialSkill1;
            $jsnChara[$chara->id]["spSkill2"] = $chara->specialSkill2;
        }
        $arr["characters"] = $jsnChara;
        //スキルを全部更新して保存（encode）
        $json = json_encode($arr, JSON_UNESCAPED_UNICODE); //idでソートしないとダメかと思ったけど、綺麗に並んだ
        echo $json;
        file_put_contents($rets[0], $json);
        file_put_contents("../../rpg-player/public/projects/" . $project . "/projectData.json", $json);
    }


    //rpg-Playerに登録してある画像ファイル情報を取得する（まだキャラクターとしてDBに保存しているとは限らない）
    public function getPngFiles($project) {
        $pngFiles = array();
        $i = 0; //画像インデックス
        foreach(glob('../../rpg-player/public/projects/' . $project . '/characters/battle/*.png') as $pngFile){
            if(is_file($pngFile)){
                $pngFiles[$i]['path'] = '../' . $pngFile; //../../../rpg-player/public/projects/testproject3/characters/battle/*.png"
                $pngFiles[$i]['baseName'] = basename($pngFile, '.png');
                $i++;
            }
        }
        return $pngFiles;
    }

    // DBに登録済みのキャラクター情報を取得する（where=プロジェクトネーム)
    public function getCharacters($project) {
        //get()メソッドは、SELECTメソッドに相当するもの。get(['id', 'name])と言う風に、フィールドを絞ることもできる。
        $charas = DB::table('characters')->where('project', $project)->get();
        return $charas;
    }

    // DBに登録済みのキャラクター情報を取得する（where=プロジェクトネーム)
    public function getSkills($project) {
        //get()メソッドは、SELECTメソッドに相当するもの。get(['id', 'name])と言う風に、フィールドを絞ることもできる。
        $skills = DB::table('skills')->where('project', $project)->where('skillType', '1')->get();
        return $skills;
    }

    // DBに登録済みのキャラクター情報を取得する（where=プロジェクトネーム)
    public function getSpecialSkills($project) {
        //get()メソッドは、SELECTメソッドに相当するもの。get(['id', 'name])と言う風に、フィールドを絞ることもできる。
        $specialSkills = DB::table('skills')->where('project', $project)->where('skillType', '2')->get();
        return $specialSkills;
    }

}
