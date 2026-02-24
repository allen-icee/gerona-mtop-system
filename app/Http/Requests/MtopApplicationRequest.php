<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\MtopApplication;

class MtopApplicationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // We return true assuming your auth middleware already protects the routes
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $franchiseId = null;

        // If we are updating or renewing, we need to grab the current application
        // to ignore its current franchise_id for the body_number unique rule.
        if ($this->route('id')) {
            $application = MtopApplication::find($this->route('id'));
            $franchiseId = $application ? $application->franchise_id : null;
        }

        return [
            'last_name' => ['required', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'first_name' => ['required', 'string', 'max:50', 'regex:/^[a-zA-ZñÑ\s\.\,\-]+$/'],
            'middle_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'suffix' => ['nullable', 'string', 'max:10', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'address' => 'required|string|max:100',
            'contact_number' => ['nullable', 'regex:/^(09|\+639)\d{9}$/'],
            'transaction_date' => 'required|date',
            'mt_number' => [
                'required',
                'string',
                'max:20',
                // This rule checks if the number exists in the mtop_franchises table
                $this->route('id')
                    ? \Illuminate\Validation\Rule::unique('mtop_franchises', 'mt_number')->ignore($franchiseId)
                    : 'unique:mtop_franchises,mt_number'
            ],
            'body_number' => [
                'nullable',
                'regex:/^[0-9]+$/',
                $franchiseId
                    ? Rule::unique('mtop_franchises', 'body_number')->ignore($franchiseId)
                    : 'unique:mtop_franchises,body_number'
            ],
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
            'or_number' => 'required|string|max:20',
            'or_date' => 'required|date',
            'punong_bayan' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'authorized_official' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'body_number.unique' => 'This Body Number is already assigned to another operator!'
        ];
    }
}
