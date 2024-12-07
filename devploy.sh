#!/bin/bash

# Entrar a la carpeta db
cd db

# Mostrar el directorio actual para verificación
echo "Directorio actual: $(pwd)"

# Verificar si docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: No se encuentra docker-compose.yml en $(pwd)"
    exit 1
fi

# Detener y eliminar contenedores existentes si los hay
echo "Deteniendo contenedores existentes..."
docker compose down

# Levantar el contenedor de la base de datos con logs
echo "Levantando contenedores..."
docker compose up -d

# Verificar el estado de los contenedores
echo "Estado de los contenedores:"
docker compose ps

# Mostrar logs si hay algún error
echo "Logs de los contenedores:"
docker compose logs

# Esperar a que el contenedor esté listo
sleep 10

# Volver a la carpeta raíz
cd ..

# Entrar a la carpeta api
cd api

# Copiar el archivo .env.example a .env
cp .env.example .env

# Instalar dependencias con bun
bun install

# Volver a la carpeta raíz
cd ..

# Entrar a la carpeta client
cd client

# Copiar el archivo .env.example a .env
cp .env.example .env

# Instalar dependencias con npm
npm install

echo "¡Instalación completada con éxito!"
