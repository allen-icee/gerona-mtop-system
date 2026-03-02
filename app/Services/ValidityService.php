<?php

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

        // STEP 1: Determine the Effective Start Date
        if ($event && $wantsFullValidity && $event->fixed_expiry_date) {
            // PAID during a Promo: The 3-year timer starts the DAY AFTER the promo ends
            $effectiveStart = Carbon::parse($event->fixed_expiry_date)->startOfDay()->addDay();
        } else {
            // Normal / Free: Starts on the transaction date
            $effectiveStart = $transactionDate->copy()->startOfDay();
        }

        // Anchor Start Date Gatekeeper (Must land on a valid working day)
        $effectiveStart = $this->moveToNextWorkingDay($effectiveStart, $holidays);

        // STEP 2: Determine Base Expiration
        if ($event && !$wantsFullValidity && $event->fixed_expiry_date) {
            // FREE Pass: Expiry is exactly the promo end date
            $expiry = Carbon::parse($event->fixed_expiry_date)->startOfDay();
        } else {
            // PAID: Add 3 years to the effective start date
            $expiry = $effectiveStart->copy()->addYearsNoOverflow(3);

            // STEP 3: Apply Plate Number Month Adjustment (Only for Paid)
            if (!empty($plateNo) && $plateNo !== 'FOR REGISTRATION') {
                if (preg_match('/(\d)[^\d]*$/', $plateNo, $matches)) {
                    $digit = (int) $matches[1];
                    $targetMonth = $digit === 0 ? 10 : $digit; // 0 = October
                    $year = $expiry->year;

                    $originalDay = $effectiveStart->day;
                    $daysInMonth = Carbon::createFromDate($year, $targetMonth, 1)->daysInMonth;
                    $finalDay = min($originalDay, $daysInMonth);

                    $expiry = Carbon::createFromDate($year, $targetMonth, $finalDay)->startOfDay();
                }
            }
        }

        // STEP 4: FINAL GATEKEEPER
        // Ensure the absolute final expiration date lands on a valid working day
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
                return $date; // Found a valid working day!
            }

            $date->addDay(); // Shift forward 1 day and loop again
        }
    }
}
