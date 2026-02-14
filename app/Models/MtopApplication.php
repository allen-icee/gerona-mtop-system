<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MtopApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'last_name',
        'first_name',
        'middle_name',
        'address',
        'suffix',
        'contact_number',
        'mt_number',
        'transaction_date',
        'valid_until',
        'body_number',
        'plate_no',
        'make_type',
        'engine_motor_no',
        'chassis_no',
        'cedula_number',
        'cedula_date',
        'or_number',
        'or_date',
        'punong_bayan',
        'authorized_official',
        'status'
    ];

    // Helper: Get Full Name automatically
    // Usage: $application->full_name
    public function getFullNameAttribute()
    {
        return "{$this->last_name}, {$this->first_name} " . ($this->middle_name ? $this->middle_name[0] . '.' : '');
    }
}
