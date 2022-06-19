<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Skill; //Skillテーブルを扱うSkillモデルをuseする
use Illuminate\Support\Facades\DB;

class SkillController extends Controller
{

    //スキル編集画面を表示する
    public function editSkill(Request $request) {
        $skills = $this->getSkills($request->project);
        $specialSkills = $this->getSpecialSkills($request->project);
        $pngFiles = $this->getPngFiles($request->project);

        return view('rpg-editor.edit-skill', ['project'=>$request->project,'skills'=>$skills, 'specialSkills'=>$specialSkills, 'pngFiles'=>$pngFiles]);
    }

    // DBに登録済みのスキル情報を取得する（where=プロジェクトネーム)
    public function getSkills($project) {
        //get()メソッドは、SELECTメソッドに相当するもの。get(['id', 'name])と言う風に、フィールドを絞ることもできる。
        $skills = DB::table('skills')->where('project', $project)->where('skillType', '1')->get();
        return $skills;
    }

    // DBに登録済みのスキル情報を取得する（where=プロジェクトネーム)
    public function getSpecialSkills($project) {
        //get()メソッドは、SELECTメソッドに相当するもの。get(['id', 'name])と言う風に、フィールドを絞ることもできる。
        $specialSkills = DB::table('skills')->where('project', $project)->where('skillType', '2')->get();
        return $specialSkills;
    }

    //技をデータベースに登録しにいく
    public function saveNewSkill(Request $request) {
        //まずはDBに登録
        $skill = new Skill();
        $skill->project = $request->project;
        $skill->skillName = $request->skillName;
        $skill->skillPower = $request->skillPower;
        $skill->skillType = $request->skillType;
        $skill->skillImagePath = $request->skillImagePath;
        //$character->characterImagePath = (string)$request->characters; //パスはplayerのパスで登録（キャラ編集画面ではなく、マップ編集画面で表示するため）
        unset($skill['_token']);
        //$character->fill($character)->save();
        $skill->save();

        //次にプロジェクトデータ.jsonを更新
        $skills = $this->getSkills($request->project);
        $specialSkills = $this->getSpecialSkills($request->project);

        $updateData = array();
        $updateData[] = $skills;
        $updateData[] = $specialSkills;
        $this->updateProjectData($request->project, $updateData);

        //画像の一覧を取得
        $pngFiles = $this->getPngFiles($request->project);

        return view('rpg-editor.edit-skill', ['project'=>$request->project,'skills'=>$skills, 'specialSkills'=>$specialSkills, 'pngFiles'=>$pngFiles]);
    }

    //キャラクターをデータベースに登録しにいく
    public function updateSkill(Request $request) {
        //まずはDBを更新
        $param = [
            'skillName' => $request->skillName,
            'skillPower' => $request->skillPower,
            'skillType' => $request->skillType,
            'skillImagePath' => $request->skillImagePath,
        ];
        DB::table('skills')->where('id', $request->id)->update($param); //とりあえずApp\Skillのモデルは使わず、、練習として

        //次にプロジェクトデータ.jsonを更新
        $skills = $this->getSkills($request->project);
        $specialSkills = $this->getSpecialSkills($request->project);

        $updateData = array();
        $updateData[] = $skills;
        $updateData[] = $specialSkills;
        $this->updateProjectData($request->project, $updateData);

        //画像の一覧を取得
        $pngFiles = $this->getPngFiles($request->project);

        return view('rpg-editor.edit-skill', ['project'=>$request->project,'skills'=>$skills, 'specialSkills'=>$specialSkills, 'pngFiles'=>$pngFiles]);
    }


    public function deleteSkill(Request $request) {
        DB::table('skills')->where('id', $request->id)->delete();
        return $this->editSkill($request);
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
        $jsnSkills = array();
        $skills = $updateData[0]; //skills
        foreach($skills as $skill) {
            $jsnSkills[$skill->id]["skillName"] = $skill->skillName;
            $jsnSkills[$skill->id]["skillPower"] = $skill->skillPower;
            $jsnSkills[$skill->id]["skillType"] = $skill->skillType;
            $jsnSkills[$skill->id]["skillImagePath"] = $skill->skillImagePath;
        }
        $specialSkills = $updateData[1]; //skilspecialSkillsls
        foreach($specialSkills as $specialSkill) {
            $jsnSkills[$specialSkill->id]["skillName"] = $specialSkill->skillName;
            $jsnSkills[$specialSkill->id]["skillPower"] = $specialSkill->skillPower;
            $jsnSkills[$specialSkill->id]["skillType"] = $specialSkill->skillType;
            $jsnSkills[$specialSkill->id]["skillImagePath"] = $specialSkill->skillImagePath;
        }
        $arr["skills"] = $jsnSkills;
        //スキルを全部更新して保存（encode）
        $json = json_encode($arr, JSON_UNESCAPED_UNICODE); //idでソートしないとダメかと思ったけど、綺麗に並んだ
        echo $json;
        file_put_contents($rets[0], $json);
        file_put_contents("../../rpg-player/public/projects/" . $project . "/projectData.json", $json);
    }

    //rpg-Playerに登録してある画像ファイル情報を取得する（まだスキルイメージとしてDBに保存しているとは限らない）
    public function getPngFiles($project) {

        $excludes = array(
            '.',
            '..',
            '.DS_Store'
        );

        $pngFiles = array();

        foreach(glob('../../rpg-player/public/projects/' . $project . '/cutScenes/specialSkill/*') as $skillCharaDir){
            if (in_array($skillCharaDir, $excludes)) {
                continue;
            }

            $i = 0; //画像インデックス

            $charaName = basename($skillCharaDir);

            //キャラのファイル毎に、存在方向配列にデータを保存していく
            foreach(glob($skillCharaDir . '/*.png') as $pngFile){
                if(is_file($pngFile)){
                    $pngFiles[$charaName][$i]['path'] = '../' . $pngFile; //../../../rpg-player/public/projects/$project/cutScene/specialSkill/*/*.png"
                    $pngFiles[$charaName][$i]['baseName'] = basename($pngFile, '.png');
                    $i++;
                }
            }
        }

        return $pngFiles;
    }

}
