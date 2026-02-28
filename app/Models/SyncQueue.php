<?php
//GeronaMTOP\app\Models\SyncQueue.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SyncQueue extends Model
{
    protected $table = 'sync_queue';

    protected $fillable = [
        'table_name',
        'payload_json',
        'status',
        'retry_count',
        'error_message'
    ];

    protected $casts = [
        'payload_json' => 'array',
    ];
}
