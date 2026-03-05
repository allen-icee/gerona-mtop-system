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
            'middle_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'suffix' => ['nullable', 'string', 'max:10', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
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

            'punong_bayan' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],

            'authorized_official' => ['nullable', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],

            'show_paid_by' => 'boolean',
            'paid_by_last_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'paid_by_first_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'paid_by_middle_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'paid_by_suffix' => ['nullable', 'string', 'max:10', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'is_free' => 'boolean',
            'event_id' => 'nullable|exists:events,id',
            'show_auth_official' => 'boolean',
            'show_cedula' => 'boolean',
            'show_or' => 'boolean',

            'plate_no' => [
                'required',
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

        $bodyNumberRule = Rule::unique('mtop_franchises', 'body_number')->where(function ($query) {
            return $query->where('status', 'active');
        });

        if ($franchiseId) {
            $bodyNumberRule->ignore($franchiseId);
        }

        $rules['body_number'] = ['nullable', 'regex:/^[0-9]+$/', $bodyNumberRule];

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
            'body_number.unique' => 'This Body Number is currently active and assigned to another operator.',
            'plate_no.unique' => 'This Plate Number is already registered to an active franchise.'
        ];
    }
}
