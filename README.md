<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:2890df,100:1e6fb3&height=180&width=auto&section=header&text=UPay&fontSize=48&fontColor=ffffff&animation=fadeIn&fontAlignY=30"/>
</p>

<p align="center">
  <a href="https://upay-secure.vercel.app/">
    <img src="https://raw.githubusercontent.com/KumarShrey05/upi_fraud_detector/main/public/half-logo.png" width="110" />
  </a>
</p>

<h2 align="center">Secure UPI Fraud Detection System</h2>

<p align="center">
  <a href="https://upay-secure.vercel.app/">Explore UPay</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0-blue">
  <img src="https://img.shields.io/badge/status-active-success">
  <img src="https://img.shields.io/badge/license-MIT-2890df">
  <img src="https://img.shields.io/badge/node-%3E%3D18-green">
</p>

---

<p align="center">
  <img src="https://raw.githubusercontent.com/KumarShrey05/upi_fraud_detector/main/public/banner.png" />
</p>

---

## Overview

UPay is a production-style UPI transaction simulation platform built with an integrated fraud detection system.
It applies a hybrid approach combining rule-based validation and machine learning inference to detect suspicious behavior in real time.

The system is designed to reflect how modern digital payment infrastructures enforce security while maintaining performance and usability.

---

## Key Capabilities

* Hybrid fraud detection (rule-based + ML)
* Real-time transaction monitoring
* Conditional OTP verification
* QR-based payment flow
* WebSocket-driven live updates
* Mobile install support
* Distributed cloud database integration

---

## System Architecture

```id="archflow"
User Interface (Next.js)
          ↓
Backend API (Node.js + Express)
          ↓
Fraud Detection Engine
   ├── Rule-Based Logic
   └── Machine Learning API (Flask)
          ↓
Database (TiDB Cloud)
          ↓
Real-Time Layer (Socket.IO)
```

---

## Transaction Flow

1. User authentication
2. Transaction initiation
3. Fraud evaluation:

   * Rule-based analysis
   * ML prediction
4. Risk threshold check
5. OTP verification (if required)
6. Transaction completion and storage

---

## Technology Stack

| Layer      | Technology            |
| ---------- | --------------------- |
| Frontend   | Next.js, Tailwind CSS |
| Backend    | Node.js, Express      |
| Database   | TiDB Cloud            |
| ML Service | Flask                 |
| Auth       | Clerk                 |
| Real-time  | Socket.IO             |


---

## Local Setup

```bash id="setupcode"
git clone
npm install
npm run dev
```

---

## Mobile Installation

1. Open the application
2. Tap browser menu (⋮)
3. Select “Add to Home Screen”
4. Confirm installation

---

## Project Details

**Project Title:**
UPI Fraud Detection System

**Application Name:**
UPay-Secure

**Developed By:**
Kumar Shrey

---

## Deployment

Frontend:
https://upay-secure.vercel.app/

Backend & ML Services:
Render

---

## Security Model

* Real-time anomaly detection
* Risk scoring system
* OTP-based verification
* Machine learning-assisted prediction

---

## License

MIT License

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:2890df,100:1e6fb3&height=120&section=footer"/>
</p>
