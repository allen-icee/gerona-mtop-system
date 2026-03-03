<?php
//GeronaMTOP\app\Models\MtopApplication.php
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
        'status',
        'driver_name',
        'driver_photo_path',
        'franchise_id',
        'transaction_type',
        'processed_by',
        'show_paid_by',
        'paid_by_last_name',
        'paid_by_first_name',
        'paid_by_middle_name',
        'paid_by_suffix',
        'event_id',
        'is_free',
        'show_auth_official',
        'show_cedula',
        'show_or',
    ];

    public function getFullNameAttribute()
    {
        return "{$this->last_name}, {$this->first_name} " . ($this->middle_name ? $this->middle_name[0] . '.' : '');
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($q, $search) {
            $q->where(function ($q) use ($search) {
                $q->where('last_name', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('body_number', 'like', "%{$search}%")
                    ->orWhere('mt_number', 'like', "%{$search}%")
                    ->orWhere('plate_no', 'like', "%{$search}%");
            });
        })
            ->when($filters['month'] ?? null, fn($q, $month) => $q->whereMonth('transaction_date', $month))
            ->when($filters['year'] ?? null, fn($q, $year) => $q->whereYear('transaction_date', $year))
            ->when($filters['barangay'] ?? null, fn($q, $barangay) => $q->where('address', 'like', "%{$barangay}%"))
            ->when($filters['renewal'] ?? null, function ($q, $renewal) {
                if ($renewal === 'upcoming') {
                    $q->where('status', 'active')->whereBetween('valid_until', [now(), now()->addDays(60)]);
                } elseif ($renewal === 'expired') {
                    $q->where(function ($sub) {
                        $sub->where('status', 'expired')
                            ->orWhere(function ($subQ) {
                                $subQ->where('status', 'active')->whereDate('valid_until', '<', now());
                            });
                    });
                } elseif ($renewal === 'active') {
                    $q->where('status', 'active')->whereDate('valid_until', '>=', now());
                } elseif ($renewal === 'archived') {
                    $q->where('status', 'archived');
                }
            });
    }
    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }
}
