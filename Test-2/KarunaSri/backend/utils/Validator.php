<?php

class Validator {
    public static function validate($data, $rules) {
        $errors = [];
        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            $ruleArray = explode('|', $fieldRules);

            foreach ($ruleArray as $rule) {
                if ($rule === 'required' && (is_null($value) || $value === '')) {
                    $errors[] = "$field is required";
                } elseif ($rule === 'email' && $value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors[] = "$field must be a valid email address";
                } elseif (strpos($rule, 'min:') === 0) {
                    $min = (int)substr($rule, 4);
                    if ($value && strlen($value) < $min) {
                        $errors[] = "$field must be at least $min characters";
                    }
                } elseif ($rule === 'numeric' && $value && !is_numeric($value)) {
                    $errors[] = "$field must be numeric";
                }
            }
        }

        if (!empty($errors)) {
            ResponseHelper::error(implode(', ', $errors), 422);
        }
    }
}
