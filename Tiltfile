# Entre-Vistas Tiltfile
# FastAPI Backend + Next.js Frontend

print("""
🚀 Entre-Vistas Development Environment Starting...
📊 Backend API: http://localhost:8000
🌐 Frontend: http://localhost:3000  
📖 API Docs: http://localhost:8000/docs
""")

# Backend FastAPI (mata procesos del puerto 8000 antes de iniciar)
local_resource(
    'backend',
    serve_cmd='lsof -ti:8000 | xargs -r kill -9 || true && cd backend && . .venv/bin/activate && python3 main.py',
    deps=['backend/main.py', 'backend/config.py', 'backend/requirements.txt'],
    labels=['api']
)

# Frontend Next.js (mata procesos del puerto 3000 antes de iniciar)
local_resource(
    'frontend',
    serve_cmd='lsof -ti:3000 | xargs -r kill -9 || true && cd Frontend && npm run dev',
    deps=['Frontend/app', 'Frontend/components', 'Frontend/lib', 'Frontend/package.json'],
    labels=['ui']
) 