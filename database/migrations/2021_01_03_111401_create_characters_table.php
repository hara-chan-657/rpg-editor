<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCharactersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('characters', function (Blueprint $table) {
            $table->bigIncrements('id');
            //ここから追加
            $table->string('project');
            $table->string('characterName'); //キャラクター名
            $table->string('characterImagePath'); //キャラクター画像パス
            $table->integer('HP'); //HP
            $table->integer('OP'); //攻撃
            $table->integer('DP'); //防御
            $table->integer('AP'); //素早さ
            $table->integer('SP'); //スキル力
            $table->integer('skill1'); //スキル1
            $table->integer('skill2'); //スキル2
            $table->integer('skill3'); //スキル3
            $table->integer('skill4'); //スキル4
            $table->integer('specialSkill1'); //大技1
            $table->integer('specialSkill2'); //大技2
            //ここまで追加
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('_characters');
    }
}
