# TI Chess - Technology Investment Chess Game

A sophisticated 3D chess-like strategy game that models technology market evolution, built with Django REST Framework backend and React Three.js frontend.

## 🎮 Game Features

- **3D Interactive Chess Board**: Immersive Three.js-powered 3D game environment
- **Real-time Multiplayer**: WebSocket-based real-time gameplay
- **Strategic Gameplay**: Unique pieces representing technology investments
- **Game Replay System**: Review and analyze completed games
- **Responsive Design**: Modern Material-UI interface that works on all devices
- **Spectator Mode**: Watch ongoing games as a spectator

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **Git** (for version control)

### Development Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd chess-game
```

2. **Run setup script:**

**Windows:**
```bash
setup-dev.bat
```

**Linux/macOS:**
```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

3. **Start the application:**

**Backend (Terminal 1):**
```bash
cd backend
python manage.py runserver
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin (admin/admin123)

## 🏗️ Architecture

### Backend (Django + DRF)
- **Django 5.0.4** - Web framework
- **Django REST Framework** - API framework
- **Django Channels** - WebSocket support
- **SQLite/PostgreSQL** - Database
- **drf-spectacular** - API documentation

### Frontend (React + Three.js)
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics
- **Material-UI v5** - UI components
- **Vite** - Build tool
- **Socket.IO** - Real-time communication

## 📁 Project Structure

```
chess-game/
├── backend/                 # Django backend
│   ├── game/               # Game logic and models
│   ├── ti_chess/           # Project settings
│   ├── requirements.txt    # Python dependencies
│   └── manage.py          # Django CLI
├── frontend/               # React frontend
│   ├── src/               # Source code
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── services/      # API and WebSocket services
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Node dependencies
└── docs/                  # Documentation
```

## 🎯 Game Rules

### Pieces and Movement
- **Startup (Pawn)**: Basic technology unit, can advance and transform
- **Scale-up (Rook)**: Horizontal and vertical scaling capabilities
- **Pivot (Bishop)**: Diagonal strategic movements
- **Unicorn (Knight)**: Unique L-shaped disruption patterns
- **Investor (Queen)**: Most powerful piece with transformation abilities
- **CEO (King)**: Must be protected, limited movement

### Victory Conditions
- **Checkmate**: Capture the opponent's CEO
- **Technology Domination**: Control key market positions
- **Innovation Victory**: Successfully execute strategic transformations

## 🔧 Development

### Backend Development

**Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**Run migrations:**
```bash
python manage.py migrate
```

**Create superuser:**
```bash
python manage.py createsuperuser
```

**Run tests:**
```bash
python manage.py test
```

### Frontend Development

**Install dependencies:**
```bash
cd frontend
npm install
```

**Start development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Run tests:**
```bash
npm run test
```

## 🚀 Deployment

### Production Build

1. **Backend:**
```bash
cd backend
pip install -r requirements.txt
python manage.py collectstatic
python manage.py migrate
gunicorn ti_chess.wsgi:application
```

2. **Frontend:**
```bash
cd frontend
npm install
npm run build
# Serve the dist/ folder with nginx or similar
```

### Environment Variables

Create `.env` files in both backend and frontend directories:

**Backend (.env):**
```env
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_WS_BASE_URL=wss://your-backend-domain.com
```

## 📚 API Documentation

When running the backend, visit:
- **Swagger UI**: http://localhost:8000/api/schema/swagger-ui/
- **ReDoc**: http://localhost:8000/api/schema/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎮 Game Screenshots

![Lobby](docs/screenshots/lobby.png)
*Game lobby with active games list*

![3D Board](docs/screenshots/3d-board.png)
*Interactive 3D chess board*

![Game Play](docs/screenshots/gameplay.png)
*Real-time multiplayer gameplay*

## 🆘 Troubleshooting

### Common Issues

**Backend not starting:**
- Ensure Python 3.11+ is installed
- Check virtual environment is activated
- Verify all dependencies are installed: `pip install -r requirements.txt`

**Frontend build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Clear npm cache: `npm cache clean --force`

**WebSocket connection issues:**
- Check CORS settings in Django settings
- Verify WebSocket URL in frontend environment variables
- Ensure Django Channels is properly configured

**Database migration errors:**
- Delete db.sqlite3 and run migrations again
- Check for conflicting migrations
- Reset migrations if necessary

### Getting Help

- Check the [Issues](link-to-issues) page for known problems
- Create a new issue with detailed error information
- Include environment details (OS, Python/Node versions)

## 🙏 Acknowledgments

- Django REST Framework team for the excellent API framework
- Three.js community for 3D graphics capabilities
- Material-UI team for beautiful React components
- React community for the fantastic frontend ecosystem

---

**Made with ❤️ by the TI Chess Team**# Chess-Arena-threejs-chess-game-with-django
