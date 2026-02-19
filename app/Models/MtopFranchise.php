<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MtopFranchise extends Model
{
    protected $guarded = [];

    // A franchise has many historical transactions/applications
    public function applications()
    {
        return $this->hasMany(MtopApplication::class, 'franchise_id');
    }

    // Helper to get only the currently active transaction
    public function activeApplication()
    {
        return $this->hasOne(MtopApplication::class, 'franchise_id')->where('status', 'active');
    }
}
