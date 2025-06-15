@echo off
chcp 65001 >nul
echo ========================================
echo  INSTALANDO TALENTCHAIN BOLIVIA
echo  Universidad UNIFRANZ - Proyecto Integrador
echo ========================================

echo.
echo ✅ Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js no está instalado
    echo Descargar desde: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo.

echo 📦 Instalando dependencias del frontend...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se pudieron instalar las dependencias del frontend
    pause
    exit /b 1
)
echo ✅ Frontend listo

echo.
echo 📦 Instalando dependencias del backend...
cd ..\backend
npm install
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se pudieron instalar las dependencias del backend
    pause
    exit /b 1
)
echo ✅ Backend listo

echo.
echo 🔧 Verificando archivo .env...
if not exist .env (
    echo 📝 Creando archivo .env...
    echo PUERTO=3000 > .env
    echo URL_FRONTEND=http://localhost:5173 >> .env
    echo JWT_SECRETO=talentchain_bolivia_clave_super_secreta_2025 >> .env
    echo JWT_EXPIRA_EN=7d >> .env
    echo MODO_ENTORNO=desarrollo >> .env
    echo ✅ Archivo .env creado
) else (
    echo ✅ Archivo .env ya existe
)

echo.
echo ========================================
echo  🎉 INSTALACIÓN COMPLETADA EXITOSAMENTE
echo ========================================
echo.
echo 🚀 Para iniciar el proyecto:
echo.
echo 1️⃣  Backend (Terminal 1):
echo    cd backend
echo    npm run dev
echo.
echo 2️⃣  Frontend (Terminal 2):
echo    cd frontend  
echo    npm run dev
echo.
echo 3️⃣  Abrir navegador en: http://localhost:5173
echo.
echo 📊 URLs importantes:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3000
echo    APIs:     http://localhost:3000/auth
echo.
pause