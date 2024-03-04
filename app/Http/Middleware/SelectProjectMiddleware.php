<?php

namespace App\Http\Middleware;

use Closure;

class SelectProjectMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $dirs = scandir('./projects');
        //表示させないディレクトリ配列
        $excludes = array(
            '.',
            '..',
            '.DS_Store'
        );
        $projects = '<select id="oldProjectName" name="oldProjectName">';
        foreach ($dirs AS $dir) {
            //特定のディレクトリの場合は表示させない
            if (in_array($dir, $excludes)) {
                continue;
            }
            //最初の要素を選択状態に
            if ($dir === reset($dirs)) {
                $projects .= '<option value="' . $dir . '" selected>' . $dir . '</option>';
            }
            $projects .= '<option value="' . $dir . '">' . $dir . '</option>';
        }
        $projects .= '</select>';

        $data = [
            'projects'=>$projects,
        ];
        $request->merge(['data'=>$data]);
        return $next($request);
    }
}
