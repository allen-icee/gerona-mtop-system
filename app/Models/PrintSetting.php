<?php
//GeronaMTOP\app\Models\PrintSetting.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrintSetting extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'header_path',
        'footer_path',
        'id_background_path',
        'show_header',
        'show_footer',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'show_header' => 'boolean',
        'show_footer' => 'boolean',
    ];
}
