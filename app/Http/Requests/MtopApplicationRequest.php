<?php
//GeronaMTOP\app\Http\Requests\MtopApplicationRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\MtopApplication;
use Illuminate\Http\Request;

class MtopApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(Request $request): array
    {
        $franchiseId = null;

        if ($this->route('id')) {
            $application = MtopApplication::find($this->route('id'));
            $franchiseId = $application ? $application->franchise_id : null;
        }

        $rules = [
            'last_name' => ['required', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'first_name' => ['required', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'middle_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'suffix' => ['nullable', 'string', 'max:10', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'address' => 'required|string|max:100',
            'contact_number' => ['nullable', 'regex:/^(09|\+639)\d{9}$/'],
            'transaction_date' => 'required|date',
            'make_type' => 'required|string|max:30',
            'engine_motor_no' => 'required|string|max:30',
            'chassis_no' => 'required|string|max:30',

            'cedula_number' => 'nullable|string|max:20',
            'cedula_date' => 'nullable|date',
            'or_number' => 'nullable|string|max:50',
            'or_date' => 'nullable|date',

            'punong_bayan' => ['required', 'string', 'max:100', 'regex:/^[a-zA-ZñÑ\s\.\,\-\|]+$/'],
            'authorized_official' => ['nullable', 'string', 'max:100', 'regex:/^[a-zA-ZñÑ\s\.\,\-\|]+$/'],
            'driver_name' => ['nullable', 'string', 'max:100', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],

            'has_driver' => 'boolean',
            'driver_last_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'driver_first_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'driver_middle_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'driver_suffix' => ['nullable', 'string', 'max:10', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],

            'show_paid_by' => 'boolean',
            'paid_by_last_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'paid_by_first_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'paid_by_middle_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'paid_by_suffix' => ['nullable', 'string', 'max:10', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'is_free' => 'boolean',
            'event_id' => 'nullable|exists:events,id',
            'show_auth_official' => 'boolean',
            'show_cedula' => 'boolean',
            'show_or' => 'boolean',
            'force_reassign' => 'boolean',

            'plate_no' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    if (strtoupper($value) !== 'FOR REGISTRATION' && strlen($value) > 8) {
                        $fail('The Plate Number must not exceed 8 characters unless it is "FOR REGISTRATION".');
                    }
                }
            ],

            'is_manual_validity' => 'boolean',
            'valid_until' => 'nullable|date',
        ];

        if ($this->route('id')) {
            $rules['mt_number'] = ['required', 'string', 'max:20', Rule::unique('mtop_franchises', 'mt_number')->ignore($franchiseId)];
        } else {
            $rules['mt_number'] = ['required', 'string', 'max:20'];
        }

        $rules['body_number'] = ['nullable', 'regex:/^[0-9]+$/'];

        if (strtoupper($request->input('plate_no')) !== 'FOR REGISTRATION') {
            $plateRule = Rule::unique('mtop_franchises', 'plate_no')->where(function ($query) {
                return $query->where('status', 'active');
            });

            if ($franchiseId) {
                $plateRule->ignore($franchiseId);
            }

            $rules['plate_no'][] = $plateRule;
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'plate_no.unique' => 'This Plate Number is already registered to an active franchise.'
        ];
    }
}