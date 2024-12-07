#!/bin/bash

# Entrar a la carpeta db
cd db

# Levantar el contenedor de la base de datos
docker compose up -d

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
