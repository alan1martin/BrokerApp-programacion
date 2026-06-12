# 📈 BrokerApp - Broker de Inversiones 2026

![Status](https://img.shields.io/badge/status-en_desarrollo-blue)
![Python](https://img.shields.io/badge/python-3.12+-blue)
![React](https://img.shields.io/badge/react-19-61DAFB)

Aplicación web integral diseñada para la gestión de portfolios financieros y la simulación de trading en tiempo real. Este proyecto permite a los usuarios gestionar su capital, realizar operaciones de compra/venta y visualizar la composición de sus activos.

## 🚀 Características Principales
* **Gestión de Portafolio:** Seguimiento de saldo en tiempo real y cálculo automático de valor total.
* **Simulación de Trading:** Ejecución de órdenes de compra y venta con validación de fondos.
* **Cotizaciones en Tiempo Real:** Integración con `yfinance` para datos actualizados del mercado.
* **Visualización de Datos:** Gráficos interactivos para el análisis de la composición de activos y evolución.
* **Noticias Financieras:** Feed de noticias actualizado por activo.

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Framework:** React 19 (Vite)
- **UI:** Material UI (MUI)
- **Gestión de Estado:** React Query & Zustand
- **Gráficos:** Nivo / ApexCharts

### Backend
- **Framework:** Django Rest Framework (DRF)
- **Base de Datos:** SQLite (Desarrollo) / PostgreSQL (Producción)
- **Servicios:** API de Yahoo Finance (via `yfinance`)

---

## ⚙️ Setup & Instalación

### Requisitos previos
- Node.js (v18+)
- Python (v3.12+)

### 1. Clonar el repositorio
```bash
git clone [https://github.com/alan1martin/BrokerApp-programacion.git](https://github.com/alan1martin/BrokerApp-programacion.git)
cd BrokerApp-programacion

---


2. Backend (Django)
cd backend
python -m venv venv
# Activar entorno: source venv/bin/activate (Mac/Linux) o venv\Scripts\activate (Windows)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


3. Frontend (React)
cd ../frontend
npm install
npm run dev


👥 Desarrolladores
Martín Alloatti

Alan Benelli

Este proyecto es parte de la materia de Programación 2026.
