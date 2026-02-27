<?php
//app/Http/Requests/MtopApplicationRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\MtopApplication;

class MtopApplicationRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
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
            'plate_no' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    if (strtoupper($value) !== 'FOR REGISTRATION' && strlen($value) > 8) {
                        $fail('The Plate Number must not exceed 8 characters unless it is "FOR REGISTRATION".');
                    }
                }
            ],
            'make_type' => 'required|string|max:30',
            'engine_motor_no' => 'required|string|max:30',
            'chassis_no' => 'required|string|max:30',
            'cedula_number' => 'required|string|max:20',
            'cedula_date' => 'required|date',
            'or_number' => 'required_unless:is_free,true|nullable|string|max:50',
            'or_date' => 'required_unless:is_free,true|nullable|date',
            'punong_bayan' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'authorized_official' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'show_paid_by' => 'boolean',
            'paid_by_last_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'paid_by_first_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'paid_by_middle_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'paid_by_suffix' => ['nullable', 'string', 'max:10', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'is_free' => 'boolean',
            'event_id' => 'nullable|exists:events,id',
        ];

        if ($this->route('id')) {
            $rules['mt_number'] = ['required', 'string', 'max:20', Rule::unique('mtop_franchises', 'mt_number')->ignore($franchiseId)];
            $rules['body_number'] = ['nullable', 'regex:/^[0-9]+$/', Rule::unique('mtop_franchises', 'body_number')->ignore($franchiseId)];
        } else {
            $rules['mt_number'] = ['required', 'string', 'max:20'];
            $rules['body_number'] = ['nullable', 'regex:/^[0-9]+$/', 'unique:mtop_franchises,body_number'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'body_number.unique' => 'This Body Number is already assigned to another operator!'
        ];
    }
}
