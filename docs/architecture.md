# TI Chess Architecture Documentation

## System Overview

TI Chess is a full-stack web application implementing a strategic chess-like game that models technology market evolution. The system consists of a Django backend, React frontend, and real-time communication layer.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React +      │◄──►│   (Django +     │◄──►│  (PostgreSQL)   │
│   Three.js)     │    │   Channels)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │              ┌─────────────────┐
         │                       │              │     Redis       │
         │                       └─────────────►│  (Channel Layer)│
         │                                      └─────────────────┘
         │
    ┌─────────────────┐
    │      Users      │
    │  (Web Browsers) │
    └─────────────────┘
```

## Technology Stack

### Backend
- **Framework**: Django 4.2+ with Django REST Framework
- **Real-time**: Django Channels with WebSocket support
- **Database**: PostgreSQL (primary), Redis (caching/channels)
- **API Documentation**: drf-spectacular (OpenAPI/Swagger)
- **Authentication**: Session-based with player tokens
- **Deployment**: Docker containers

### Frontend
- **Framework**: React 18 with TypeScript
- **3D Rendering**: Three.js with React Three Fiber
- **UI Components**: Material-UI (MUI)
- **State Management**: Zustand + React hooks
- **Real-time**: WebSocket client with reconnection logic
- **Build Tool**: Vite
- **Deployment**: Static hosting (Vercel/Netlify)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (error tracking)
- **Hosting**: 
  - Backend: Render/Railway/Heroku
  - Frontend: Vercel/Netlify
  - Database: Managed PostgreSQL

## Core Components

### Backend Architecture

#### Models Layer
```python
User (Extended Django User)
├── Game (Game instances)
│   ├── Player (Game participants)
│   │   └── Piece (Game pieces on board)
│   ├── Move (Move history)
│   ├── GameEvent (Game events log)
│   └── GameSnapshot (Board state snapshots)
```

#### Game Engine
- **Pure Functions**: Stateless game logic
- **Move Validation**: Server-authoritative validation
- **Rule Enforcement**: Exact rule implementation
- **State Management**: Immutable board states

#### API Layer
- **REST API**: CRUD operations, game management
- **WebSocket**: Real-time gameplay
- **Serializers**: Data validation and transformation
- **Permissions**: Player-based access control

#### Real-time Layer
- **Django Channels**: WebSocket handling
- **Redis**: Channel layer backend
- **Consumer**: Game-specific message routing
- **Broadcasting**: Multi-client synchronization

### Frontend Architecture

#### Component Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Route-based page components
├── three/              # Three.js 3D components
├── services/           # API and WebSocket services
├── store/              # State management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

#### 3D Rendering System
- **Scene Management**: Three.js scene setup
- **Piece Rendering**: Dynamic 3D models
- **Animation System**: Smooth move transitions
- **Camera Controls**: Multiple viewing angles
- **Interaction**: Mouse/touch piece selection

#### State Management
- **Game State**: Current board and player state
- **UI State**: Selection, camera, settings
- **Connection State**: WebSocket status
- **Local Storage**: Player credentials, preferences

## Data Flow

### Game Creation Flow
```
1. User creates game via REST API
2. Backend creates Game and host Player
3. Frontend navigates to game page
4. WebSocket connection established
5. Game state synchronized
```

### Move Execution Flow
```
1. Player selects piece (Frontend)
2. Valid moves calculated (Frontend preview)
3. Player clicks destination (Frontend)
4. Move sent via WebSocket (Frontend → Backend)
5. Move validated by Game Engine (Backend)
6. Board state updated (Backend)
7. Move broadcast to all players (Backend → All Frontends)
8. 3D animations triggered (All Frontends)
```

### Real-time Synchronization
```
WebSocket Event Flow:
Client A → Server → [Validation] → Server → All Clients
```

## Security Architecture

### Authentication & Authorization
- **Player Tokens**: UUID-based session tokens
- **Game Access**: Token-based game participation
- **Move Validation**: Server-side authority
- **Rate Limiting**: Move frequency limits

### Input Validation
- **Move Validation**: Game engine verification
- **Data Sanitization**: DRF serializer validation
- **SQL Injection**: Django ORM protection
- **XSS Protection**: React built-in escaping

### Network Security
- **CORS**: Configured allowed origins
- **CSP**: Content Security Policy headers
- **HTTPS**: TLS encryption in production
- **WebSocket Security**: Origin validation

## Performance Optimizations

### Backend Optimizations
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient DB connections
- **Caching**: Redis for frequently accessed data
- **Query Optimization**: Select/prefetch related

### Frontend Optimizations
- **Code Splitting**: Lazy-loaded routes
- **Three.js Optimization**: Efficient 3D rendering
- **Asset Optimization**: Compressed models/textures
- **Bundle Optimization**: Vite build optimization

### Real-time Optimizations
- **Message Batching**: Efficient WebSocket usage
- **State Reconciliation**: Optimistic UI updates
- **Connection Management**: Automatic reconnection
- **Memory Management**: Proper cleanup

## Scalability Considerations

### Horizontal Scaling
- **Stateless Backend**: Session data in Redis
- **Load Balancing**: Multiple backend instances
- **Database Scaling**: Read replicas
- **CDN**: Static asset distribution

### Vertical Scaling
- **Resource Optimization**: Efficient algorithms
- **Memory Usage**: Optimized data structures
- **CPU Usage**: Efficient game calculations
- **Database Performance**: Query optimization

## Deployment Architecture

### Development Environment
```yaml
docker-compose.yml:
  - web (Django + Daphne)
  - db (PostgreSQL)
  - redis (Redis)
  - frontend (Vite dev server)
```

### Production Environment
```
Frontend (Vercel/Netlify)
    ↓ HTTPS/API calls
Backend (Render/Railway)
    ↓ Database connections
PostgreSQL (Managed service)
    ↓ Cache layer
Redis (Managed service)
```

## Monitoring & Observability

### Logging
- **Application Logs**: Structured logging
- **Access Logs**: Request/response tracking
- **Error Logs**: Exception tracking
- **Game Logs**: Move and event history

### Metrics
- **Response Times**: API performance
- **WebSocket Latency**: Real-time performance
- **User Engagement**: Game statistics
- **System Resources**: CPU/Memory usage

### Error Tracking
- **Sentry Integration**: Real-time error monitoring
- **User Context**: Error reproduction data
- **Performance Monitoring**: Slow query detection
- **Alert Configuration**: Critical error notifications

## Future Architecture Considerations

### Potential Enhancements
- **Microservices**: Service decomposition
- **Event Sourcing**: Complete game replay
- **CQRS**: Read/write model separation
- **GraphQL**: Flexible API queries
- **AI Integration**: Computer opponents
- **Mobile Apps**: Native mobile clients

### Scaling Strategies
- **Database Sharding**: Multi-tenant scaling
- **Event-Driven Architecture**: Loose coupling
- **Kubernetes**: Container orchestration
- **Service Mesh**: Inter-service communication