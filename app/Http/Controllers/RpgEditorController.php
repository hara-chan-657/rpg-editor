<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
//use App\Http\Controllers\CharacterController; //やむなくキャラクターコントローラをuse、、良いのかな

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
        
        //キャラ取得
        $charaCtlr = new CharacterController();
        $characters = $charaCtlr->getCharacters($request->oldProjectName);

        //スキル取得
        $skillCtlr = new SkillController();
        $skills = $skillCtlr->getSkills($request->oldProjectName);
        $specialSkills = $skillCtlr->getSpecialSkills($request->oldProjectName);

        //ツール取得
        $toolCtlr = new ToolController();
        $tools = $toolCtlr->getTools($request->oldProjectName);

        //オブジェクト取得
        $excludes = array(
            '.',
            '..',
            '.DS_Store'
        );
        $i = 0; //マップ画像インデックス
        $objects = array();
        //var_dump(scandir('../../rpg-player/public/projects'));
        foreach(scandir('../../rpg-player/public/projects') AS $prjDir){
            if (in_array($prjDir, $excludes)) continue;
            if($prjDir == $request->oldProjectName) {
                foreach(scandir('../../rpg-player/public/projects/' . $prjDir) AS $imageTypeDir){
                    if (in_array($imageTypeDir, $excludes)) continue;
                    if ($imageTypeDir == 'objects') {
                        foreach(scandir('../../rpg-player/public/projects/' . $prjDir . '/objects') AS $objTypeDir){ //キャラクターとツール
                            if (in_array($objTypeDir, $excludes)) continue;
                            if ($objTypeDir == 'characters') {
                                //キャラオブジェクトは、１キャラに対して複数毎の画像がある
                                foreach(scandir('../../rpg-player/public/projects/' . $prjDir . '/objects/characters') AS $charaObjDir){
                                    if (in_array($charaObjDir, $excludes)) continue;
                                    foreach(scandir('../../rpg-player/public/projects/' . $prjDir . '/objects/characters/' . $charaObjDir) AS $charaPng){
                                        if (in_array($charaPng, $excludes)) continue;
                                        $objects[$prjDir]['objects']['characters'][$charaObjDir][] = $charaPng;
                                        break; //1キャラに対して何枚も取得してもしょうがないので、一枚とって終わり
                                    }
                                }
                            } else if ($objTypeDir == 'tools') {
                                //toolの場合それ単体
                                foreach(scandir('../../rpg-player/public/projects/' . $prjDir . '/objects/tools') AS $toolPng){
                                    if (in_array($toolPng, $excludes)) continue;
                                    $objects[$prjDir]['objects']['tools'][] = $toolPng;
                                }
                            }
                        }
                    }
                }
            } else if ($prjDir == 'common') {
                foreach(scandir('../../rpg-player/public/projects/common') AS $imageTypeDir){
                    if (in_array($imageTypeDir, $excludes)) continue;
                    if ($imageTypeDir == 'objects') {
                        foreach(scandir('../../rpg-player/public/projects/common/objects') AS $objTypeDir){ //キャラクターとツール
                            if (in_array($objTypeDir, $excludes)) continue;
                            if ($objTypeDir == 'characters') {
                                //キャラオブジェクトは、１キャラに対して複数毎の画像がある
                                foreach(scandir('../../rpg-player/public/projects/common/objects/characters') AS $charaObjDir){
                                    if (in_array($charaObjDir, $excludes)) continue;
                                    foreach(scandir('../../rpg-player/public/projects/common/objects/characters/' . $charaObjDir) AS $charaPng){
                                        if (in_array($charaPng, $excludes)) continue;
                                        $objects[$prjDir]['objects']['characters'][$charaObjDir][] = $charaPng;
                                        break; //1キャラに対して何枚も取得してもしょうがないので、一枚とって終わり
                                    }
                                }
                            } else if ($objTypeDir == 'tools') {
                                //toolの場合それ単体
                                foreach(scandir('../../rpg-player/public/projects/common/objects/tools') AS $toolPng){
                                    if (in_array($toolPng, $excludes)) continue;
                                    $objects['common']['objects']['tools'][] = $toolPng;
                                }
                            }
                        }
                    }
                }
            } else {
                foreach(scandir('../../rpg-player/public/projects/' . $prjDir) AS $imageTypeDir){
                    if (in_array($imageTypeDir, $excludes)) continue;
                    if ($imageTypeDir == 'objects') {
                        foreach(scandir('../../rpg-player/public/projects/' . $prjDir . '/objects') AS $objTypeDir){ //キャラクターとツール
                            if (in_array($objTypeDir, $excludes)) continue;
                            if ($objTypeDir == 'characters') {
                                //キャラオブジェクトは、１キャラに対して複数毎の画像がある
                                foreach(scandir('../../rpg-player/public/projects/' . $prjDir . '/objects/characters') AS $charaObjDir){
                                    if (in_array($charaObjDir, $excludes)) continue;
                                    foreach(scandir('../../rpg-player/public/projects/' . $prjDir . '/objects/characters/' . $charaObjDir) AS $charaPng){
                                        if (in_array($charaPng, $excludes)) continue;
                                        $objects[$prjDir]['objects']['characters'][$charaObjDir][] = $charaPng;
                                        break; //1キャラに対して何枚も取得してもしょうがないので、一枚とって終わり
                                    }
                                }
                            } else if ($objTypeDir == 'tools') {
                                //toolの場合それ単体
                                foreach(scandir('../../rpg-player/public/projects/' . $prjDir . '/objects/tools') AS $toolPng){
                                    if (in_array($toolPng, $excludes)) continue;
                                    $objects[$prjDir]['objects']['tools'][] = $toolPng;
                                }
                            }
                        }
                    }
                }
            }
        }

        //ワイプ取得取得
        //$i = 0; //マップ画像インデックス
        $wipes = array();
        //var_dump(scandir('../../rpg-player/public/projects'));
        foreach(scandir('../../rpg-player/public/projects') AS $prjDir){
            if (in_array($prjDir, $excludes)) continue;
            if($prjDir == $request->oldProjectName) {
                foreach(scandir('../../rpg-player/public/projects/' . $prjDir) AS $imageTypeDir){
                    if (in_array($imageTypeDir, $excludes)) continue;
                    if ($imageTypeDir == 'characters') {
                        foreach(scandir('../../rpg-player/public/projects/' . $prjDir . '/characters') AS $charaTypeDir){ //キャラクターとツール
                            if (in_array($charaTypeDir, $excludes)) continue;
                            if ($charaTypeDir == 'wipe') {
                                //キャラオブジェクトは、１キャラに対して複数毎の画像がある
                                foreach(scandir('../../rpg-player/public/projects/' . $prjDir . '/characters/wipe') AS $charaWipeDir){
                                    if (in_array($charaWipeDir, $excludes)) continue;
                                    foreach(scandir('../../rpg-player/public/projects/' . $prjDir . '/characters/wipe/' . $charaWipeDir) AS $charaPng){
                                        if (in_array($charaPng, $excludes)) continue;
                                        $wipes[$prjDir]['characters']['wipe'][$charaWipeDir][] = $charaPng;
                                        //break; //1キャラに対して何枚も取得してもしょうがないので、一枚とって終わり
                                    }
                                }
                            }
                        }
                    }
                }
            } else if ($prjDir == 'common') {
                foreach(scandir('../../rpg-player/public/projects/common') AS $imageTypeDir){
                    if (in_array($imageTypeDir, $excludes)) continue;
                    if ($imageTypeDir == 'characters') {
                        foreach(scandir('../../rpg-player/public/projects/common/characters') AS $charaTypeDir){ //キャラクターとツール
                            if (in_array($charaTypeDir, $excludes)) continue;
                            if ($charaTypeDir == 'wipe') {
                                //キャラオブジェクトは、１キャラに対して複数毎の画像がある
                                foreach(scandir('../../rpg-player/public/projects/common/characters/wipe') AS $charaWipeDir){
                                    if (in_array($charaWipeDir, $excludes)) continue;
                                    foreach(scandir('../../rpg-player/public/projects/common/characters/wipe/' . $charaWipeDir) AS $charaPng){
                                        if (in_array($charaPng, $excludes)) continue;
                                        $wipes[$prjDir]['characters']['wipe'][$charaWipeDir][] = $charaPng;
                                        //break; //1キャラに対して何枚も取得してもしょうがないので、一枚とって終わり
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                foreach(scandir('../../rpg-player/public/projects/' . $prjDir) AS $imageTypeDir){
                    if (in_array($imageTypeDir, $excludes)) continue;
                    if ($imageTypeDir == 'characters') {
                        foreach(scandir('../../rpg-player/public/projects/' . $prjDir . '/characters') AS $charaTypeDir){ //キャラクターとツール
                            if (in_array($charaTypeDir, $excludes)) continue;
                            if ($charaTypeDir == 'wipe') {
                                //キャラオブジェクトは、１キャラに対して複数毎の画像がある
                                foreach(scandir('../../rpg-player/public/projects/' . $prjDir . '/characters/wipe') AS $charaWipeDir){
                                    if (in_array($charaWipeDir, $excludes)) continue;
                                    foreach(scandir('../../rpg-player/public/projects/' . $prjDir . '/characters/wipe/' . $charaWipeDir) AS $charaPng){
                                        if (in_array($charaPng, $excludes)) continue;
                                        $wipes[$prjDir]['characters']['wipe'][$charaWipeDir][] = $charaPng;
                                        //break; //1キャラに対して何枚も取得してもしょうがないので、一枚とって終わり
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        //ターンチップ取得
        //$i = 0; //チップ画像インデックス
        $turnChips = array();
        $turnPassChips = array();
        //var_dump(scandir('../../rpg-player/public/projects'));
        foreach(scandir('../../map-editor/image/map-editor/map-chip') AS $prjDir){
            if (in_array($prjDir, $excludes)) continue;
            foreach(scandir('../../map-editor/image/map-editor/map-chip/' . $prjDir . '/mapTurn') AS $chipDir){
                if (in_array($chipDir, $excludes)) continue;
                foreach(scandir('../../map-editor/image/map-editor/map-chip/' . $prjDir . '/mapTurn/' . $chipDir) AS $chipPng){
                    if (in_array($chipPng, $excludes)) continue;
                    $turnChips[$prjDir][$chipDir][] = $chipPng;
                    //break; //全部とる
                }
            }
            foreach(scandir('../../map-editor/image/map-editor/map-chip/' . $prjDir . '/mapTurnPass') AS $chipDir){
                if (in_array($chipDir, $excludes)) continue;
                foreach(scandir('../../map-editor/image/map-editor/map-chip/' . $prjDir . '/mapTurnPass/' . $chipDir) AS $chipPng){
                    if (in_array($chipPng, $excludes)) continue;
                    $turnPassChips[$prjDir][$chipDir][] = $chipPng;
                    //break; //全部とる
                }
            }
        }
        //サウンド取得
        //$i = 0; //インデックス
        $sounds = array();
        //var_dump(scandir('../../rpg-player/public/projects'));
        foreach(scandir('../../rpg-player/public/sounds') AS $soundTypeDir){
            if (in_array($soundTypeDir, $excludes)) continue;
            foreach(scandir('../../rpg-player/public/sounds/' . $soundTypeDir) AS $soundTypeSubDir){
                if (in_array($soundTypeSubDir, $excludes)) continue;
                foreach(scandir('../../rpg-player/public/sounds/' . $soundTypeDir . '/'. $soundTypeSubDir) AS $soundFile){
                    if (in_array($soundFile, $excludes)) continue;
                    $sounds[$soundTypeDir][$soundTypeSubDir][] = $soundFile;
                }
            }
        }
        //var_dump($objects);       
        return view('rpg-editor.rpg-editor',
                    [
                        'pngFiles'=>$pngFiles,
                        'project'=>$request->oldProjectName,
                        'characters'=>$characters,
                        'skills'=>$skills,
                        'specialSkills'=>$specialSkills,
                        'objects'=>$objects,
                        'wipes'=>$wipes,
                        'tools'=>$tools,
                        'turnChips'=>$turnChips,
                        'turnPassChips'=>$turnPassChips,
                        'sounds'=>$sounds
                    ]
                );
    }

    //編集されたマップ情報をサーバに保存＆rpg-playerに同期しにいく
    public function saveEditedMap(Request $request) {
        //マップのオブジェクトデータを上書きしにいく
        $mapJsonObj = $request->map_obj_data;
        $savePath = './projects/' . $request->project_name . '/' . $request->map_save_name .'.json';
        //マップオブジェクトデータを保存
        $fp = fopen($savePath, "w");
        fwrite($fp, $mapJsonObj);
        fclose($fp);

        //プロジェクトデータのオブジェクトデータを上書きしにいく
        $prjJsonObj = $request->project_data;
        $savePath = './projects/' . $request->project_name . '/projectData.json';
        //マップオブジェクトデータを保存
        $fp = fopen($savePath, "w");
        fwrite($fp, $prjJsonObj);
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
