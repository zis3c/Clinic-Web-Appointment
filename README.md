# Clinic Web Appointment System

![Laravel](https://img.shields.io/badge/Laravel-13.x-F53003?logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.3%2B-777BB4?logo=php&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)
![Inertia](https://img.shields.io/badge/Inertia.js-React-9553E9?logo=inertia&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

A modern clinic booking system for admins, doctors, and patients. Built with Laravel, Inertia, React, and Tailwind CSS, it handles appointments, schedules, patient flow, notifications, and consultation records in one app.

> [!NOTE]
> This project uses role-based dashboards for `admin`, `doctor`, and `patient`.

> [!IMPORTANT]
> Run the backend and frontend together for the full experience. The app uses Laravel for the API and Inertia React for the UI.

## Features

- Role-based dashboards for admin, doctor, and patient
- Patient appointment booking and management
- Doctor schedule creation and consultation workflow
- Admin control for doctors, patients, schedules, and appointments
- In-app notification center with read and read-all actions
- Live waiting room and queue status on dashboards
- Appointment status updates and check-in flow
- Medical notes, diagnosis, and prescription capture during consultation
- Signed prescription view from appointment history
- Month calendar and table schedule views
- Conflict-safe schedule slot validation
- Profile, avatar, and account management

## Tech Stack

- Laravel 13
- PHP 8.3+
- React 18
- Inertia.js
- Tailwind CSS
- Vite
- TypeScript

## Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Clinic-Web-Appointment-System/clinic-app
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

4. **Configure environment**
   ```bash
   copy .env.example .env
   php artisan key:generate
   ```

5. **Set database values**
   Update `.env` with your database connection, then run migrations.
   ```bash
   php artisan migrate
   ```

6. **Run the app**
   ```bash
   php artisan serve
   npm run dev
   ```

   Or run everything in one command:
   ```bash
   composer run dev
   ```

## Default Roles

- `admin` manages users, schedules, appointments, and reports
- `doctor` manages own schedules, patients, and consultations
- `patient` books appointments and tracks visit history

## Project Structure

```text
clinic-app/
|-- app/
|   |-- Http/Controllers/    # Dashboard and booking controllers
|   |-- Models/              # Eloquent models
|   |-- Notifications/       # Database and email notifications
|   `-- Policies/            # Authorization rules
|-- database/
|   |-- migrations/          # Schema migrations
|   `-- seeders/             # Seed data
|-- resources/js/
|   |-- Components/          # Shared UI components
|   |-- Layouts/             # App layouts
|   `-- Pages/               # Inertia pages by role
|-- routes/
|   |-- web.php              # Main application routes
|   `-- auth.php             # Auth routes
`-- tests/                   # Feature tests
```

## Main Pages

| Area | Pages |
|:---|:---|
| Public | Welcome, Login, Register |
| Admin | Dashboard, Doctors, Patients, Schedules, Appointments, Reports |
| Doctor | Dashboard, Patients, Schedules, Appointments |
| Patient | Dashboard, Doctors, Schedules, Appointments |

## Core Flow

1. User signs in and lands on a role-based dashboard.
2. Patient books a schedule slot from doctor availability.
3. Admin can inspect appointments and manage check-ins.
4. Doctor reviews waiting room, completes consultation, and records clinical notes.
5. System stores notifications and appointment updates for later review.

## Useful Commands

```bash
php artisan test
npm run build
php artisan migrate
php artisan db:seed
```

## Contributing

PRs welcome. Keep changes small, focused, and covered by tests when possible.

## License

MIT License.
