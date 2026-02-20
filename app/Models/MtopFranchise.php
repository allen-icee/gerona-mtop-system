<?php
//GeronaMTOP\app\Models\MtopFranchise.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MtopFranchise extends Model
{
    protected $guarded = [];

    public function applications()
    {
        return $this->hasMany(MtopApplication::class, 'franchise_id');
    }

    public function activeApplication()
    {
        return $this->hasOne(MtopApplication::class, 'franchise_id')->where('status', 'active');
    }
}
