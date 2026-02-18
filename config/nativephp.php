<?php

return [
    /**
     * The version of your app.
     */
    'version' => env('NATIVEPHP_APP_VERSION', '1.0.0'),

    'url' => 'http://127.0.0.1:5173',

    'window' => [
        'width' => 1200,
        'height' => 800,
        'resizable' => true,
    ],
    /**
     * The ID of your application. This should be a unique identifier
     * usually in the form of a reverse domain name.
     */
    'app_id' => 'com.geronamtop.system', //

    /**
     * If your application allows deep linking, you can specify the scheme
     * to use here.
     */
    'deeplink_scheme' => env('NATIVEPHP_DEEPLINK_SCHEME'),

    /**
     * The author of your application.
     */
    'author' => 'Municipality of Gerona',

    /**
     * The default service provider for your application. This provider
     * takes care of bootstrapping your application.
     */
    'provider' => \App\Providers\NativeAppServiceProvider::class,

    /**
     * A list of environment keys that should be removed from the
     * .env file when the application is bundled for production.
     */
    'cleanup_env_keys' => [
        'AWS_*',
        'GITHUB_*',
        'DO_SPACES_*',
        '*_SECRET',
        'NATIVEPHP_UPDATER_PATH',
        'NATIVEPHP_APPLE_ID',
        'NATIVEPHP_APPLE_ID_PASS',
        'NATIVEPHP_APPLE_TEAM_ID',
    ],

    /**
     * A list of files and folders that should be removed from the
     * final app before it is bundled for production.
     */
    'cleanup_exclude_files' => [
        'content',
        'storage/app/framework/{sessions,testing,cache}',
        'storage/logs/laravel.log',
    ],

    /**
     * The NativePHP updater configuration.
     * Set 'enabled' to false for now to prevent build errors during local development.
     */
    'updater' => [
        'enabled' => false,

        'default' => env('NATIVEPHP_UPDATER_PROVIDER', 'github'),

        'providers' => [
            'github' => [
                'driver' => 'github',
                'repo' => env('GITHUB_REPO'),
                'owner' => env('GITHUB_OWNER'),
                'token' => env('GITHUB_TOKEN'),
                'vPrefixedTagName' => env('GITHUB_V_PREFIXED_TAG_NAME', true),
                'private' => env('GITHUB_PRIVATE', false),
                'channel' => env('GITHUB_CHANNEL', 'latest'),
                'releaseType' => env('GITHUB_RELEASE_TYPE', 'draft'),
            ],
        ],
    ],

];
