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
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('time_slot')->nullable()->after('schedule_id');
            $table->text('diagnosis')->nullable()->after('status');
            $table->text('prescriptions')->nullable()->after('diagnosis');
            $table->text('notes')->nullable()->after('prescriptions');
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->integer('slot_duration')->default(30)->after('number_of_patients');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['time_slot', 'diagnosis', 'prescriptions', 'notes']);
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn('slot_duration');
        });
    }
};
