# 🏦 Asset Manager & API Gateway

A robust, custom-built **Asset Management Dashboard** and **RESTful API** designed to serve as the backend infrastructure for decentralized applications. This project centralizes asset tracking, metadata management, and secure credential storage.

Currently powering: **[dbank](https://your-dbank-link.com)**

---

## 🏗️ Architecture Overview

Unlike static local JSON files, this system provides a **dynamic management layer**. By decoupling the data from the frontend, you can update asset parameters in real-time without needing to rebuild or redeploy your client applications.



### Key Features
* **Dynamic CRUD:** Full Create, Read, Update, and Delete capabilities for asset profiles.
* **Metadata Engine:** Handles complex JSON objects for decentralized asset properties.
* **Secure Storage:** Server-side handling of passwords and sensitive keys, keeping them out of client-side bundles.
* **Centralized Source of Truth:** One API to serve multiple projects simultaneously.

---

## 🛠️ Tech Stack

* **Frontend & API:** [Next.js 14+](https://nextjs.org/) (App Router)
* **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Hosting:** [Vercel](https://vercel.com/)
* **Styling:** Tailwind CSS

---

## 📡 API Documentation

### 1. Fetch All Assets
Retrieve the full list of assets for your dApp.
`GET /api/assets`

**Example Response:**
```json
[
  {
    "id": "uuid-123",
    "asset_name": "Vault_Alpha",
    "metadata": {
      "network": "Polygon",
      "status": "active",
      "contract_address": "0x..."
    },
    "created_at": "2024-05-20"
  }
]


