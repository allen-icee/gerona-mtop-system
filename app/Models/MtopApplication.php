<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MtopApplication extends Model
{
    use HasFactory;

    // 🔓 UNLOCK ALL FIELDS
    // This tells Laravel: "It is safe to save data to any column,
    // because I already validated the input in the Controller."
    protected $guarded = [];
}
