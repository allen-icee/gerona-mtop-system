<?php
//GeronaMTOP\app\Models\Holiday.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = ['name', 'month', 'day', 'is_active'];
}
