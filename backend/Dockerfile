# 1. Usamos una imagen oficial de Python liviana
FROM python:3.11-slim

# 2. Evita que Python escriba archivos .pyc y fuerza a que los logs salgan directo a la consola
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# 4. Instala las dependencias del sistema necesarias (incluye cabeceras para PostgreSQL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. Copia el archivo de requisitos e instala las dependencias de Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# 6. Copia el resto del código del backend
COPY . /app/

# 7. Expone el puerto 8000 que usa Django
EXPOSE 8000

# 8. Comando de producción: ejecuta migraciones y levanta con Gunicorn usando la carpeta config
# Migra, crea superusuario automáticamente si no existe y levanta Gunicorn
CMD ["sh", "-c", "python manage.py migrate --noinput && DJANGO_SUPERUSER_PASSWORD=admin1234 python manage.py createsuperuser --noinput --username admin --email admin@academia.ar || true && gunicorn config.wsgi:application --bind 0.0.0.0:8000"]
