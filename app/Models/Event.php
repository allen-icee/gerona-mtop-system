<?php
//GeronaMTOP\app\Models\Event.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $guarded = [];

    public function applications()
    {
        return $this->hasMany(MtopApplication::class);
    }
}
