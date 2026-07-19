# JanjiCare Installation Guide

Welcome to the detailed installation guide for the JanjiCare Clinic Web Appointment System. This document will walk you through setting up the project for both **local development** and **production deployment**.

---

## Prerequisites

Before you begin, ensure your system meets the following requirements:

### Backend
- **PHP**: `^8.3`
- **Composer**: `v2.x`
- **Database**: PostgreSQL (recommended) or MySQL
- **Redis**: Recommended for production (required if scaling WebSockets), but completely **optional** for local development.

### Frontend
- **Node.js**: `v18.x` or higher (v20+ recommended)
- **NPM**: `v9.x` or higher

### Infrastructure & Telehealth
- **Docker & Docker Compose**: Required for running the LiveKit Server locally.

---

## Local Development Setup

Follow these steps to get a full development environment running on your local machine.

### 1. Clone the Repository
Clone the project and navigate into the application directory:
```bash
git clone https://github.com/zis3c/Clinic-Web-Appointment-System.git
cd "Clinic Web Appointment System/clinic-app"
```

### 2. Install Dependencies
Install the required PHP and Node.js packages:
```bash
# Backend dependencies
composer install

# Frontend dependencies
npm install
```

### 3. Environment Configuration
Create your environment file by copying the example:
```bash
cp .env.example .env
```
Generate your application encryption key:
```bash
php artisan key:generate
```

Open `.env` and configure your database and Redis connections:
```ini
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=janjicare
DB_USERNAME=your_username
DB_PASSWORD=your_password

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 4. Database Setup & Seeding
Run the database migrations to build the schema, and run the seeders to populate the database with default roles, an admin account, and dummy clinic data (Doctors, Patients, Appointments).
```bash
php artisan migrate --seed
```
*Note: The seeders automatically create dummy accounts using `@janjicare.com` emails with the default password `p@5wo0rd`.*

### 5. Running the Application
To run JanjiCare locally, you need to start multiple services. Open separate terminal windows/tabs for the following commands:

**Terminal 1: Laravel Backend**
```bash
php artisan serve
```

**Terminal 2: Frontend Asset Bundler**
```bash
npm run dev
```

**Terminal 3: WebSockets (Laravel Reverb)**
Required for real-time patient queue updates and chat.
```bash
php artisan reverb:start
```

### 6. Setting up Telehealth (LiveKit)
JanjiCare uses LiveKit for WebRTC virtual consultations. A docker-compose file is provided in the project root to spin up a local instance.

Open a new terminal and navigate to the root of the project (outside `clinic-app/`):
```bash
cd ..
docker-compose -f livekit-docker-compose.yml up -d
```
Ensure your `.env` inside `clinic-app` contains the correct LiveKit keys:
```ini
LIVEKIT_URL=http://localhost:7880
LIVEKIT_API_KEY=lk_clinic_live_key
LIVEKIT_API_SECRET=lk_clinic_live_secret_73f2a1b9c8d5e4f
```

You can now access the application at `http://localhost:8000`.

---

## Production Deployment

Deploying JanjiCare to a production Virtual Private Server (VPS) is streamlined via Docker and our automated deployment scripts.

### Server Requirements
Your VPS (e.g., Ubuntu 22.04/24.04) must have the following installed:
- Docker Engine
- Docker Compose v2
- OpenSSH Server

### Automated Deployment (Windows Host)
If you are deploying from a Windows machine, you can use the provided PowerShell deployment script.

1. Configure your `.env.vps` file in the project root with your production credentials.
2. Ensure you have an SSH key pair set up and authorized on your VPS.
3. Edit the `deploy.ps1` script to point to your VPS IP address and user.
4. Run the script:
   ```powershell
   .\deploy.ps1
   ```

**What `deploy.ps1` does:**
1. Packages the `clinic-app/` source code locally (ignoring large folders like `vendor` and `node_modules`).
2. Uploads the zipped package to your VPS securely via `scp`.
3. SSHs into your VPS, unzips the payload, and executes a Docker build step.
4. Restarts the Docker containers (`janjicare_app`, `postgres`, `redis`, `reverb`, `livekit`) safely without downtime.

### SSL / HTTPS
For WebRTC (LiveKit) and Secure WebSockets (Reverb) to work in modern browsers, **HTTPS is strictly required**. 
It is highly recommended to place your VPS behind a reverse proxy like **Nginx**, **Caddy**, or **Cloudflare** to terminate SSL certificates automatically.

---

## Troubleshooting

- **WebSockets not connecting?** Ensure `REVERB_HOST` matches your domain/IP and the port is open in your firewall.
- **Camera/Microphone access denied?** Browsers require HTTPS or `localhost` to access media devices. If you are accessing the app over a local network IP (e.g. `192.168.x.x`), you must use HTTPS.
- **CSS not updating?** If you are running locally without `npm run dev`, ensure you build the assets using `npm run build`.

For more information or help, please refer to the main repository issues or submit a pull request!
