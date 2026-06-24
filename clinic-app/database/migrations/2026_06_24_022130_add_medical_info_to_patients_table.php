<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('gender')->nullable()->after('tel');
            $table->string('blood_group', 5)->nullable()->after('gender');
            $table->text('allergies')->nullable()->after('blood_group');
            $table->text('medical_conditions')->nullable()->after('allergies');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['gender', 'blood_group', 'allergies', 'medical_conditions']);
        });
    }
};
