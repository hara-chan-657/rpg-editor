<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSkillsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('skills', function (Blueprint $table) {
            $table->bigIncrements('id');
            //ここから追加
            $table->string('project');
            $table->string('skillName'); //技名
            $table->integer('skillPower'); //技威力
            $table->integer('skillType'); //技分類　1=>通常技　2=>大技
            $table->string('skillImagePath'); //技画像パス
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
        Schema::dropIfExists('_skills');
    }
}
