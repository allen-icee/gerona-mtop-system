# Gerona MTOP System

The Gerona MTOP (Motorized Tricycle Operator's Permit) System is a comprehensive local government application designed to streamline the processing, management, and issuance of tricycle franchises. Built specifically for the Municipality of Gerona, it provides a unified platform for staff to handle applicant records, permits, receipts, and ID generation. The system solves the problem of manual, paper-based franchise management by digitizing records, enabling local cloud sync, and providing an accessible desktop interface.

---

## ✨ Features

- **Permit & Franchise Management**: End-to-end processing of Motorized Tricycle Operator's Permits including new applications, renewals, and transfers.
- **Record Digitization**: Maintain digital records of operators, drivers, tricycles, and official receipts.
- **Automated Document Generation**: Generate and print standardized forms, permits, operator IDs, and cedulas directly from the system.
- **Desktop Application Experience**: Packaged as a standalone Windows desktop client via Electron for reliable and fast local access by LGU staff.
- **Cloud Synchronization & Backup**: Automated syncing with LGU cloud infrastructure and local Google Drive backup integrations.

---

<h3>Languages & Tools (⌐■_■)</h3>

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg" width="35" title="Laravel"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" width="35" title="React"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/electron/electron-original.svg" width="35" title="Electron"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg" width="35" title="PHP"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" width="35" title="TypeScript"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" width="35" title="JavaScript"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" width="35" title="Tailwind CSS"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg" width="35" title="SQLite"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg" width="35" title="Vite"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/npm/npm-original-wordmark.svg" width="35" title="NPM"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/composer/composer-original.svg" width="35" title="Composer"/>
</p>

---

## 🚀 Getting Started

### Prerequisites

- [PHP 8.2+](https://www.php.net/)
- [Node.js](https://nodejs.org/) & NPM
- [Composer](https://getcomposer.org/)

### Installation

1. Clone the repository
2. Install PHP dependencies: `composer install`
3. Install NPM dependencies: `npm install`
4. Copy the environment file: `cp .env.example .env`
5. Generate the application key: `php artisan key:generate`
6. Run database migrations: `php artisan migrate`

### Environment Variables

```env
APP_NAME=
APP_KEY=
APP_URL=
DB_CONNECTION=sqlite
CLOUD_SYNC_ENDPOINT=
CLOUD_SYNC_TOKEN=
BACKUP_DRIVE_PATH=
```

### Run

To run the application locally in development mode:

```bash
npm run dev
```

To build and run the packaged Electron desktop client:

```bash
npm run build
npm start
```

---

## 📄 License

Copyright (c) 2026 Municipality of Gerona

This project is shared for portfolio, educational, and learning purposes.

You are welcome to study the codebase and use it as inspiration for your own projects.

Copying substantial portions of this project, redistributing it, submitting it as your own work, or creating direct clones is not permitted without explicit permission.

If this project inspires your work, please build your own implementation rather than copying the source code.

All rights reserved.
