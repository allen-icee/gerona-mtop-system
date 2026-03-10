<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrRecord extends Model
{
    use HasFactory;

    // This allows us to save data without mass-assignment errors
    protected $guarded = [];

    // This automatically converts the JSON from the database into a PHP array
    protected $casts = [
        'fee_breakdown' => 'array',
        'transaction_date' => 'date'
    ];
}
