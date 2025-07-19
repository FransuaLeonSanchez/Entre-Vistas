#!/usr/bin/env python3
"""
Script de inicio para el Entrevistador IA
Verifica la configuración y ejecuta la aplicación FastAPI
"""

import os
import sys

def check_requirements():
    """Verifica que todos los requisitos estén instalados"""
    required_packages = [
        'fastapi', 'uvicorn', 'openai', 'python-dotenv', 'pydantic'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Faltan los siguientes paquetes:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n💡 Ejecuta: pip install -r requirements.txt")
        return False
    
    print("✅ Todos los paquetes están instalados")
    return True

def check_openai_key():
    """Verifica que la clave de OpenAI esté configurada"""
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "tu_clave_de_openai_aqui":
        print("❌ La clave de OpenAI no está configurada correctamente")
        print("\n💡 Configura tu clave de OpenAI:")
        print("   Windows: set OPENAI_API_KEY=tu_clave_real")
        print("   Linux/Mac: export OPENAI_API_KEY=tu_clave_real")
        print("   O crea un archivo .env con: OPENAI_API_KEY=tu_clave_real")
        return False
    
    print("✅ Clave de OpenAI configurada")
    return True

def main():
    """Función principal"""
    print("🤖 Iniciando Entrevistador IA...\n")
    
    # Verificar requisitos
    if not check_requirements():
        sys.exit(1)
    
    # Verificar clave de OpenAI
    if not check_openai_key():
        print("\n⚠️  La aplicación iniciará pero no funcionará sin la clave de OpenAI")
        input("Presiona Enter para continuar de todos modos...")
    
    print("\n🚀 Iniciando servidor...")
    print("📖 Documentación: http://localhost:8000/docs")
    print("🌐 API: http://localhost:8000")
    print("⏹️  Para detener: Ctrl+C\n")
    
    # Importar y ejecutar la aplicación
    try:
        from main import app
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    except KeyboardInterrupt:
        print("\n👋 ¡Hasta luego!")
    except Exception as e:
        print(f"\n❌ Error al iniciar: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 