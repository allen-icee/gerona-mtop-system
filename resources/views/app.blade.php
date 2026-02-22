<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'Gerona MTOP') }}</title>

    {{-- Favicon --}}
    <link rel="icon" href="/images/MunicipalityLogo.png" type="image/png">

    {{-- Fonts --}}
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    {{-- Security + Compatibility --}}
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    {{-- Laravel Routes --}}
    @routes

    {{-- REQUIRED FOR REACT FAST REFRESH IN DEV (Safely ignored in Production) --}}
    @viteReactRefresh

    {{-- Vite Assets (PRODUCTION SAFE) --}}
    @vite(['resources/js/app.tsx'])

    {{-- Inertia Head --}}
    @inertiaHead

</head>

<body class="font-sans antialiased">

    @inertia

</body>
</html>
