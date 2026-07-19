<?php

return [
    'staff_two_factor_enabled' => env('ENABLE_2FA', true),
    'staff_two_factor_max_attempts' => env('ENABLE_2FA_MAX_ATTEMPTS', 5),
    'show_verification_codes_in_ui' => env('SHOW_VERIFICATION_CODES_IN_UI', false),
];
