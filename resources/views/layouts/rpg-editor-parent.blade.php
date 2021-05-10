<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>rpg-editor</title>
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('/css/rpg-editor.css') }}">
    <script src="{{ asset('js/rpg-editor.js') }}"></script>
</head>
<body>
    <div>
        @yield('select-project')
    </div>
</body>
</html>