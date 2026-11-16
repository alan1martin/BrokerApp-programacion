# 📈 Peak Investments (BrokerApp) - Plataforma de Inversiones 2026

![Status](https://img.shields.io/badge/status-en_desarrollo-blue)
![Python](https://img.shields.io/badge/python-3.12+-blue)
![Django](https://img.shields.io/badge/django-REST_Framework-green)
![React](https://img.shields.io/badge/react-19-61DAFB)
![MUI](https://img.shields.io/badge/MUI-v6-007FFF)

Aplicación web integral de simulador de inversiones y gestión de portafolios financieros en tiempo real. La plataforma permite a los usuarios operar activos en el mercado, automatizar órdenes, evaluar rendimiento patrimonial y explorar datos técnicos avanzados con interfaz profesional multi-usuario.

---

## 🚀 Características y Módulos Desarrollados

### 💼 Portafolio & Multi-Usuario
- **Cuentas Comitentes Secuenciales:** Generación automática y persistente de número comitente (`CC N° 00001`, `CC N° 00002`, etc.) por cada usuario registrado.
- **Estado de Cuenta & Ticker Bar:** Visualización en tiempo real del Patrimonio Total, Efectivo y Total Invertido con una barra deslizante (Marquee/Ticker) de activos principales en la parte superior del Dashboard.
- **Evolución Patrimonial:** Gráficos dinámicos para el seguimiento del saldo disponible y composición del portafolio.

### 📊 Trading Avanzado & Análisis Técnico
- **Operar Activos con TradingView:** Integración del widget oficial interactivo de TradingView en formato lineal (Line Chart) con tema oscuro (`theme: "dark"`).
- **Análisis Técnico:** Sección dedicada con gráficos de velas japonesas para análisis de tendencias.
- **Cauciones & Tasa Fija:** Módulo de simulación para colocación y toma de cauciones bursátiles con cálculo de rendimientos.
- **Stop-Loss & Alertas Programadas:** Configuración de órdenes condicionales automáticas y alertas por nivel de precio de activos.

### 🎨 UI/UX & Resiliencia del Sistema
- **Branding & Pestañas:** Personalización completa del broker bajo la identidad visual de **Peak Investments** (favicon, title y logotipos).
- **Consistencia Visual:** Estandarización de encabezados, recuadros e iconos grey/neutral en todas las secciones (Perfil, Seguridad, Ayuda, Favoritos).
- **Resistencia al Cierre de Mercado:** Persistencia del último precio conocido (*last price*) sin interrumpir la experiencia de usuario cuando las APIs o el mercado tradicional están fuera de horario.
- **Soporte Dark/Light Mode:** Paleta cromática optimizada (`#0b0e11` y `#15181e`) con contraste garantizado en ambos temas.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Framework:** React 19 (Vite)
- **UI & Layout:** Material UI (MUI v6)
- **Gráficos:** TradingView Widgets / Nivo Charts
- **Navegación:** React Router v6

### Backend & Arquitectura
- **Framework:** Django REST Framework (DRF)
- **Base de Datos:** SQLite (Entorno local / Docker)
- **Contenedores & Web Server:** Docker, Docker Compose & Nginx
- **Mercado:** APIs de cotización integradas con fallback de contingencia local

---

## ⚙️ Setup & Instalación

### Requisitos Previos
- Node.js (v18+)
- Python (v3.12+)
- Docker & Docker Compose (opcional para despliegue containerizado)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/alan1martin/BrokerApp-programacion.git
cd BrokerApp-programacion
```

### 2. Backend (Django)
```bash
cd backend
python -m venv venv

# Activar entorno:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend (React)
```bash
cd ../frontend
npm install
npm run dev
```

---

## 👥 Desarrolladores
- Martín Alloatti
- Alan Benelli

Este proyecto es parte de la materia de Programación 2026.