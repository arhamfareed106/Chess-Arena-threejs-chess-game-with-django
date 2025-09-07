# TI Chess: A Full-Stack Strategic 3D Board Game

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)](https://github.com/your-username/your-repo-name)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue?logo=react&style=for-the-badge)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-5.0-darkgreen?logo=django&style=for-the-badge)](https://www.djangoproject.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker&style=for-the-badge)](https://www.docker.com/)

**TI Chess** is a production-ready, full-stack web application that implements a strategic, chess-like game modeling technology market evolution. It features real-time multiplayer, a 3D interface, and a robust, scalable backend architecture.

---

### 🔗 **Live Demo & Screenshots**

**Play the game live:** **[your-live-demo-url.com](https://your-live-demo-url.com)**

*(Include a high-quality GIF or screenshot of your application here. A GIF of gameplay is highly recommended.)*

![Gameplay GIF](https://raw.githubusercontent.com/your-username/your-repo-name/main/docs/gameplay.gif)

---

## 🚀 Key Features

- **Real-Time Multiplayer:** Challenge opponents and play in real-time using a **Django Channels** (WebSocket) backend.
- **Immersive 3D Board:** A beautifully rendered 3D board and pieces built with **React Three Fiber**.
- **Unique Game Logic:** Implements the full "Technology Investment" chess rule set, including a 4-level piece evolution system (Talent → Leader → Strategist → Investor).
- **Server-Authoritative Architecture:** All game logic and move validation are handled on the server to prevent cheating and ensure state consistency.
- **Modern Frontend:** A fluid and intuitive UI built with **React**, **TypeScript**, and **Material-UI (MUI)**.
- **Full DevOps Lifecycle:** Containerized with **Docker**, with a full CI/CD pipeline via **GitHub Actions** for automated testing and deployment.
- **RESTful API:** A comprehensive API built with **Django REST Framework** for managing games, players, and game state.

---

## 🏛️ Technical Architecture

This project utilizes a robust, decoupled architecture with a Django backend serving a RESTful API and managing real-time WebSocket connections, and a separate React single-page application for the user interface.

```
  +------------------+      +------------------+
  |   Client (Browser) |      |   Client (Browser) |
  |------------------|      |------------------|
  |      React       |      |      React       |
  |    Three.js      |      |    Three.js      |
  |   Material-UI    |      |   Material-UI    |
  +------------------+      +------------------+
          |                        |
          +-------(WebSocket)------+
                        |
          +--------------------------+
          |      Backend Server      |
          |--------------------------|
          |        Node.js           |
          |        Express           |
          |        Socket.IO         |
          |        Chess.js          |
          +--------------------------+
```

### Tech Stack

| Category      | Technology                                                              |
|---------------|-------------------------------------------------------------------------|
| **Frontend**  | **React**, **Three.js** (with `@react-three/fiber`), **Material-UI (MUI)** |
| **Backend**   | **Node.js**, **Express.js**, **Socket.IO**                              |
| **Game Logic**| **chess.js** (for move validation and state management)                 |
| **DevOps**    | **Vite** (build tool), **Docker** (containerization)                    |

---

## 🧠 Challenges & Solutions

This section highlights key technical challenges encountered during development and the strategies used to overcome them.

### 1. Synchronizing 3D Interaction with Game Logic

*   **The Challenge:** Translating a user's click on the 3D canvas into a valid chess move. This required mapping a 2D screen coordinate to a 3D object (a board square) and then correlating that to the abstract game state managed by `chess.js`.

*   **The Solution:**
    1.  **Raycasting:** I used Three.js's `Raycaster` to project a ray from the camera through the mouse's 2D coordinates into the 3D scene.
    2.  **Object Identification:** Each square on the board was a distinct mesh object with a unique name (e.g., "e4", "h8"). The raycaster would return a list of intersected objects.
    3.  **State Reconciliation:** The name of the intersected square was then used to update the React component's state (e.g., `fromSquare`, `toSquare`). This state change would then trigger a call to the `chess.js` instance to validate and attempt the move. This decoupled the rendering logic from the game rules, creating a clean separation of concerns.

### 2. Ensuring Real-Time Game State Consistency

*   **The Challenge:** In a multiplayer game, ensuring that both players' boards are perfectly synchronized and that moves are processed in the correct order without race conditions.

*   **The Solution:**
    1.  **Authoritative Server:** The backend server acts as the single source of truth for the game state. The `chess.js` instance lives on the server, and clients only send *move intents* (e.g., "move from e2 to e4").
    2.  **Event-Based Communication:** Socket.IO was used to manage game rooms. When a player makes a move:
        *   The client emits a `move` event to the server.
        *   The server validates the move with `chess.js`.
        *   If valid, the server updates its internal game state and then **broadcasts** an `updateState` event to *all clients* in that game room with the new board position (in FEN format) and game status.
    3.  **State Hydration:** Client-side, the React application listens for the `updateState` event and uses the received FEN string to re-render the board. This ensures that clients are always displaying the state as dictated by the server, preventing desynchronization.

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Install frontend dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start the backend server:**
    ```bash
    # From the /backend directory
    npm start
    ```
    The server will be running on `http://localhost:8080`.

2.  **Start the frontend development server:**
    ```bash
    # From the /frontend directory
    npm run dev
    ```
    The application will be available at `http://localhost:5173`. Open two browser tabs to this address to simulate a two-player game.

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## 📧 Contact

Your Name – your.email@example.com

Project Link: https://github.com/your-username/your-repo-name