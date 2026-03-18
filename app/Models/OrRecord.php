<?php
//GeronaMTOP\app\Models\OrRecord.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrRecord extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'fee_breakdown' => 'array',
        'transaction_date' => 'date:Y-m-d'
    ];
}
