# 📈 Broker de Inversiones - Proyecto Programación 2026

## 📌 Descripción
Aplicación web tipo broker para la gestión de portfolios, seguimiento de activos financieros en tiempo real y simulación de inversiones con saldo virtual.

## 🛠️ Tecnologías
* **Frontend:** React (Vite / JavaScript) + Material UI (MUI)
* **Backend:** Django Rest Framework (DRF) + Python (`yfinance` para cotizaciones)
* **Base de Datos:** PostgreSQL (Producción) / Soporte para SQLite (Desarrollo)

---

## ⚙️ Setup & Instalación

### 1. Clonar el repositorio
```bash
git clone [https://github.com/alan1martin/proyecto-programacion.git](https://github.com/alan1martin/proyecto-programacion.git)
cd proyecto-programacion
2. Backend (Django)
Asegurate de tener Python instalado. Se recomienda usar un entorno virtual.

Bash
cd backend
python -m venv venv
# En Windows: venv\Scripts\activate | En Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
3. Frontend (React)
Requiere Node.js instalado.

Bash
cd ../frontend
npm install
npm run dev

👥 Integrantes
Martín Alloatti

Alan Benelli