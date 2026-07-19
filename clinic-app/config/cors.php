<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Settings for cross-origin requests. Defaults to restricting origins
    | to the application's own URL. Adjust for API consumers or SPAs.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],

    'allowed_origins' => [env('APP_URL', 'http://localhost')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'X-Requested-With', 'X-XSRF-TOKEN', 'Accept'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
