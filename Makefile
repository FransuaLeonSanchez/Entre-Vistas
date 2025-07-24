# Entre-Vistas Makefile
# Solo comando fix para aplicar linters con corrección automática

.PHONY: fix

fix:
	@echo "🔧 Aplicando correcciones automáticas..."
	@echo "📍 Python Backend (ruff)..."
	@cd backend && . .venv/bin/activate && ruff check . --fix --quiet || true
	@echo "✅ Python corregido"
	@echo "📍 Next.js Frontend (ESLint)..."
	@cd Frontend && npx eslint . --fix --ext .js,.jsx,.ts,.tsx || true
	@echo "✅ Frontend corregido"
	@echo "🎉 ¡Correcciones aplicadas!" 