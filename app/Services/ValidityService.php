<?php
//GeronaMTOP\app\Services\ValidityService.php
namespace App\Services;

use Carbon\Carbon;
use App\Models\Event;
use App\Models\Holiday;

class ValidityService
{
    public function computeExpiry(
        Carbon $transactionDate,
        ?string $plateNo,
        bool $wantsFullValidity,
        ?Event $event = null
    ): array {
        $holidays = Holiday::where('is_active', true)->get();

        if ($event && $wantsFullValidity && $event->fixed_expiry_date) {

            $effectiveStart = Carbon::parse($event->fixed_expiry_date)->startOfDay()->addDay();
        } else {

            $effectiveStart = $transactionDate->copy()->startOfDay();
        }

        $effectiveStart = $this->moveToNextWorkingDay($effectiveStart, $holidays);

        if ($event && !$wantsFullValidity && $event->fixed_expiry_date) {

            $expiry = Carbon::parse($event->fixed_expiry_date)->startOfDay();
        } else {

            $expiry = $effectiveStart->copy()->addYearsNoOverflow(3);

            if (!empty($plateNo) && $plateNo !== 'FOR REGISTRATION') {
                if (preg_match('/(\d)[^\d]*$/', $plateNo, $matches)) {
                    $digit = (int) $matches[1];
                    $targetMonth = $digit === 0 ? 10 : $digit;
                    $year = $expiry->year;

                    $originalDay = $effectiveStart->day;
                    $daysInMonth = Carbon::createFromDate($year, $targetMonth, 1)->daysInMonth;
                    $finalDay = min($originalDay, $daysInMonth);

                    $expiry = Carbon::createFromDate($year, $targetMonth, $finalDay)->startOfDay();
                }
            }
        }

        $expiry = $this->moveToNextWorkingDay($expiry, $holidays);

        return [
            'effective_start' => $effectiveStart,
            'expiry_date'     => $expiry,
        ];
    }

    private function moveToNextWorkingDay(Carbon $date, $holidays): Carbon
    {
        while (true) {
            $isWeekend = $date->isWeekend();

            $isHoliday = $holidays->contains(function ($holiday) use ($date) {
                return $holiday->month == $date->month && $holiday->day == $date->day;
            });

            if (!$isWeekend && !$isHoliday) {
                return $date;
            }

            $date->addDay();
        }
    }
}
