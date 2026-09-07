Bar Pola y Punto - Sistema de Gestión
Sistema web full-stack desarrollado para la administración de sedes, roles, usuarios y control de accesos con autenticación JWT.

Stack Tecnológico y Endpoints

Backend: FastAPI (Python), SQLAlchemy, PyJWT, MySQL. Ruta de verificación y estado: [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

Frontend: React, Vite, TypeScript, Axios, React Router.

Guía Paso a Paso para la Ejecución de la Aplicación

Para poner en marcha todo el sistema de forma local, sigue estos pasos secuenciales:

Configuración y Ejecución del Backend:

Abre una terminal y dirígete a la carpeta del backend:

PowerShell
cd 2BackEnd
Activa el entorno virtual de Python con el siguiente comando:

PowerShell
.\venv\Scripts\Activate.ps1
Inicia el servidor de desarrollo mediante Uvicorn:

PowerShell
uvicorn main:app --reload
Una vez encendido, puedes verificar que se encuentra operando exitosamente ingresando a tu navegador en la ruta [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

Configuración y Ejecución del Frontend:

Abre una nueva ventana o pestaña en tu terminal y desplázate al directorio del frontend:

PowerShell
cd 1FrontEnd
Instala las dependencias necesarias del proyecto:

PowerShell
npm install
Pon en marcha el servidor de interfaz con Vite:

PowerShell
npm run dev
Credenciales de Acceso Administrador

Correo electrónico: admin@barpolaypunto.com

Contraseña: admin123
