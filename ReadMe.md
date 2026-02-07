game-mvp/
├─ backend/
│  ├─ src/
│  │  ├─ index.ts          # server entry
│  │  ├─ socket.ts         # socket events
│  │  ├─ rooms.ts          # in-memory game state
│  │  ├─ ai.ts             # AI calls (questions + judging)
│  │  └─ types.ts
│  ├─ .env
│  └─ package.json
│
├─ frontend/
│  ├─ src/
│  │  ├─ main.tsx
│  │  ├─ App.tsx
│  │  ├─ socket.ts
│  │  ├─ pages/
│  │  │  ├─ Home.tsx
│  │  │  ├─ Room.tsx
│  │  │  └─ Game.tsx
│  │  └─ components/
│  └─ package.json
