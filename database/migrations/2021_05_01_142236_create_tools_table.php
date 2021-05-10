<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateToolsTable extends Migration
{

    //作ったコマンド
    //php artisan make:migration create_tools_table
    //この後、phpコンテナにログイン docker container exec -it docker_dev_php_1 /bin/bash 
    //laravelの階層でマイグレーション php artisan migrate

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tools', function (Blueprint $table) {
            $table->bigIncrements('id');
            //ここから追加
            $table->string('project');
            $table->string('toolName'); //道具名
            $table->string('description'); //説明
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
        Schema::dropIfExists('tools');
    }
}
