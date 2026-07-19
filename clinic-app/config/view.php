<?php

return [

    /*
    |--------------------------------------------------------------------------
    | View Paths
    |--------------------------------------------------------------------------
    |
    | Here you may specify the locations that should be checked when your
    | application renders a view. Typically, this will be the resources
    | path, but you are free to add additional paths if needed.
    |
    */

    'paths' => [
        resource_path('views'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Compiled Views Path
    |--------------------------------------------------------------------------
    |
    | This option determines where all the compiled Blade templates will be
    | stored for your application. Keep this inside storage so the server
    | can write cached templates without touching source files.
    |
    */

    'compiled' => env(
        'VIEW_COMPILED_PATH',
        storage_path('framework/views')
    ),

];
