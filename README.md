# 🚌 CampusMove — Real-Time Campus Transport Tracking System (MERN)

A full-stack **MERN (MongoDB, Express.js, React, Node.js)** campus transportation tracking and fleet management platform designed for university shuttle systems. Features live GPS simulation, interactive Leaflet campus mapping, real-time WebSocket telemetry, bus stops and route scheduling, and passenger arrival countdown boards.

---

## 🌟 Key Features

### 1. 🗺️ Interactive Live Campus Map
- **Real-Time GPS Tracking**: Shuttles move along campus roadways in real-time with smooth bearing/heading rotation, route-colored badges, and radar pulse animations.
- **Color-Coded Route Polylines**: Visualizes university lines (e.g., *Blue Line - Academic Core*, *Emerald Line - West Campus & Medical*, *Crimson Line - Athletics & East Village*).
- **Interactive Bus HUD**: Click any shuttle to view real-time speed (km/h), driver name & direct contact, seating capacity gauge, and live ETA to the next stop.
- **Interactive Stop Markers**: Weather shelter indicators, landmarks, and live arrival boards for approaching shuttles.
- **Route Filtering**: Filter view to isolate specific lines or recenter to central campus.

### 2. 👥 Student & Commuter Portal ("Student View")
- **Campus Route Finder**: Pick any origin stop and destination stop to find matching direct loop shuttles.
- **Station Live Countdown Board**: Select any campus stop to view an arrival countdown board with real-time ETA in minutes, crowd density rating (*Light*, *Moderate*, *Crowded*), and passenger seat counts.
- **Timetable & Operating Schedules**: Frequency and operating hours per line.

### 3. 🚍 Bus Fleet Management
- **Full Fleet CRUD**: Register new buses, edit specifications, update driver phone/name, and delete vehicles.
- **Dynamic Capacity Tracking**: Live passenger load bar with percentage calculation.
- **Status Control**: Toggle shuttle operational status between `IN_TRANSIT`, `STOPPED`, `MAINTENANCE`, and `IDLE`.
- **Route Re-assignment**: Reassign shuttles to different loops on the fly.

### 4. 🔀 Route & Stop Configuration
- **Route Sequencer**: Define ordered lists of campus bus stops with interactive step-by-step sequencing (Stop 1 ➔ Stop 2 ➔ Stop 3...).
- **Color & Frequency Customization**: Set hex color themes, start/end hours, and headway frequencies.
- **Stop Directory**: Manage campus stops with exact GPS latitude/longitude coordinates, weather shelters, and landmarks.

### 5. 📡 Real-Time GPS Simulator & Telemetry Engine
- **Autonomous Road Simulation**: Built-in physics engine advances buses along route coordinates every 2 seconds.
- **Stop Dwell & Passenger Exchange**: Shuttles automatically slow down and dwell at stops to simulate passenger boarding and alighting.
- **Simulation Control Toolbar**: Play, pause, adjust speed multipliers (1x, 2x, 5x, 10x), and reset fleet positions to start terminals.

### 6. 📢 Campus Advisory & Alert Dispatcher
- Broadcast real-time announcements to students and drivers for maintenance, weather delays, career fair shuttle boosts, and campus emergencies.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Leaflet, Lucide Icons, Socket.io-client |
| **Backend** | Node.js, Express.js, Socket.io (WebSocket), CORS, dotenv |
| **Database** | MongoDB / Mongoose (with automated fast In-Memory failover mode for zero-setup local execution) |
| **Real-Time** | WebSocket bi-directional state synchronization |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (Optional: the backend automatically connects to a local or Atlas MongoDB if available, and gracefully falls back to an in-memory database store if MongoDB service is not started locally).

### 1. Clone or Open Project
```bash
cd C:\Users\bathi\.gemini\antigravity\scratch\campus-transport-tracker
```

### 2. Configure Environment (`server/.env`)
```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/campus_transport
NODE_ENV=development
```
*(To use MongoDB Atlas, replace `MONGODB_URI` with your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/campus_transport`)*

### 3. Start the Server
```bash
cd server
npm start
```
> The server automatically builds and seeds initial university campus stops, loop routes, and shuttles.

### 4. Open Application in Browser
- **Unified Full-Stack App**: Open `http://localhost:5000`
- **Vite React Dev Server (with HMR)**: Open `http://localhost:3000`

---

## 📡 REST API Documentation

### **Buses (`/api/buses`)**
- `GET /api/buses` — Retrieve all buses with populated route and next stop.
- `GET /api/buses/:id` — Get bus by ID.
- `POST /api/buses` — Register a new bus.
- `PUT /api/buses/:id` — Update bus specifications.
- `PATCH /api/buses/:id/route` — Reassign bus to another route.
- `PATCH /api/buses/:id/status` — Update bus status (`ACTIVE`, `IN_TRANSIT`, `STOPPED`, `MAINTENANCE`, `IDLE`).
- `DELETE /api/buses/:id` — Delete a bus.

### **Routes (`/api/routes`)**
- `GET /api/routes` — Retrieve all routes with ordered stops and path coordinates.
- `GET /api/routes/:id` — Get route by ID.
- `POST /api/routes` — Create a new transit route.
- `PUT /api/routes/:id` — Update route details.
- `DELETE /api/routes/:id` — Delete a route.

### **Stops (`/api/stops`)**
- `GET /api/stops` — Retrieve all campus bus stops.
- `GET /api/stops/:id` — Get stop by ID.
- `POST /api/stops` — Create a new bus stop with coordinates and facilities.
- `PUT /api/stops/:id` — Update bus stop.
- `DELETE /api/stops/:id` — Delete bus stop.

### **Simulation Controls (`/api/simulation`)**
- `GET /api/simulation/status` — Get simulator state and speed multiplier.
- `POST /api/simulation/start` — Start/resume real-time GPS simulation.
- `POST /api/simulation/pause` — Pause simulation.
- `POST /api/simulation/speed` — Set simulation speed multiplier (`{ "multiplier": 5 }`).
- `POST /api/simulation/reset` — Reset buses to initial terminal positions.

### **Analytics & Advisories**
- `GET /api/stats` — Fleet passenger load, active buses, total routes, and database status.
- `GET /api/alerts` — Active campus transit alerts.
- `POST /api/alerts` — Broadcast a new advisory.
- `DELETE /api/alerts/:id` — Dismiss advisory.

---

## 🔌 Real-Time WebSocket Events (`Socket.IO`)

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `initial_state` | Server ➔ Client | `{ buses, routes, stops, alerts, simulation }` | Full system snapshot on client connection |
| `buses_updated` | Server ➔ Client | `[ Bus, ... ]` | High-frequency GPS coordinates & heading broadcast (every 2s) |
| `bus_created` / `bus_updated` / `bus_deleted` | Server ➔ Client | `Bus` | Real-time CRUD notifications |
| `route_created` / `route_updated` / `route_deleted`| Server ➔ Client | `Route` | Route modification broadcasts |
| `alert_created` / `alert_deleted` | Server ➔ Client | `Alert` | Immediate dispatch announcements |
| `simulation_status` | Server ➔ Client | `{ isRunning, speedMultiplier }` | Simulation play/pause updates |
