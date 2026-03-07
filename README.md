# 🌿 AgeVital+

**AgeVital+** es una aplicación innovadora diseñada para monitorear y gestionar sensores que controlan parámetros ambientales esenciales, como temperatura, humedad, luz y ruido. Con esta aplicación, puedes acceder fácilmente a información en tiempo real para garantizar el mayor índice de bienestar, especialmente para los adultos mayores.

---

## 🚀 **Introducción**

### **Frontend**
El frontend de la aplicación está implementado en **React.js** y se encuentra en el siguiente repositorio:  
[🔗 1cfer/page](https://github.com/1cfer/page)

### **Backend**
El backend del proyecto utiliza **Python 3** con el framework **Flask** y se encuentra en:  
[🔗 1cfer/Fiware-Project](https://github.com/1cfer/Fiware-Project)

### **Arquitectura**
Este sistema utiliza múltiples servicios gestionados con **Docker** y **Docker Compose**, garantizando una implementación consistente y sencilla.

---

## 🔧 **Configuración y Ejecución**

### **Requisitos Previos**
Asegúrate de tener instalados los siguientes softwares en tu máquina:
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/), versión 16 o superior
- [Python 3.8+](https://www.python.org/downloads/)

---

## 🐳 **Ejecutar con Docker Compose**

El proyecto utiliza `Docker Compose` para gestionar múltiples contenedores, facilitando la configuración y ejecución.

### **Pasos para iniciar el proyecto:**
1. Clona los repositorios del [frontend](https://github.com/1cfer/page) y [backend](https://github.com/1cfer/Fiware-Project).
   ```bash
   git clone https://github.com/1cfer/page.git frontend
   git clone https://github.com/1cfer/Fiware-Project.git backend
   ```
2. Desde la raíz principal del backend, crea un archivo `.env` basado en el archivo `.env.example`.

3. Ejecuta `docker-compose` para iniciar todos los servicios necesarios:
   - En primer plano:
     ```bash
     docker-compose up
     ```
   - En segundo plano (modo **detached**):
     ```bash
     docker-compose up -d
     ```

4. Una vez iniciado, verifica los servicios activos con:
   ```bash
   docker ps
   ```
   Esto mostrará una lista de contenedores activos.

### **Servicios gestionados por Docker:**

| **Nombre del Servicio**   | **Descripción**                                                   | **Puerto** |
|---------------------------|-------------------------------------------------------------------|-----------|
| **orion**                 | Context Broker para gestionar las entidades IoT                 | `1062`    |
| **fiware-keyrock**         | Service de gestión de identidad y autenticación                 | `7000`    |
| **quantumleap**            | Persistencia de datos (FIWARE)                                  | `8668`    |
| **crate-db**               | Base de datos distribuida — almacenamiento de datos no relacionales | `4200`   |
| **mysql-db**               | Base de datos MySQL para persistir la información (opcional)    | `3306`    |
| **mongo-db**               | Base de datos NoSQL utilizada por [Fiware Orion](https://fiware.org/) | `27017` |

---

### **Interacción con Docker Compose**
Para detener los servicios en ejecución:
```bash
docker-compose down
```

Si necesitas reiniciar un servicio específico:
```bash
docker-compose restart <nombre-servicio>
```

---

## 💻 **Frontend**

El frontend de [**1cfer/page**](https://github.com/1cfer/page) está desarrollado con [React.js](https://react.dev/).

### Pasos para iniciar el frontend (en desarrollo):
1. Abre el directorio del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```

El frontend estará disponible en:  
`http://localhost:3000`

### **Build de Producción**
Para preparar el frontend para producción:
```bash
npm run build
```
Puedes servir este build con un servidor como `serve`:
```bash
npm run serve
```

---

## 🛠 **Backend**

El backend de [**1cfer/Fiware-Project**](https://github.com/1cfer/Fiware-Project) está desarrollado con **Python 3** y usa el framework **Flask**.

### Pasos para iniciar el backend:
1. Abre el directorio del backend:
   ```bash
   cd backend
   ```
2. Crea un archivo `.env`:
   - Usa el archivo `.env.example` como base para configurar las variables de entorno.
   - Asegúrate de incluir las credenciales necesarias como tu base de datos y accesos.

3. Ejecuta el backend (dentro de un entorno Docker Compose o de forma local):
   ```bash
   docker-compose up -d
   ```

La API estará disponible en:  
`http://localhost:5000/api/v1/`

---

## 📂 **Estructura del Proyecto**

```
📦 project-root/
├── 📁 backend/               # Backend con Flask
│   ├── 📁 repository/        # Gestión de datos y modelos
│   ├── 📁 migrations/        # Migraciones de la base de datos
│   ├── 📄 requirements.txt   # Dependencias del Backend
│   └── 📄 server.py          # Entry-point del API
├── 📁 frontend/              # Aplicación React
│   ├── 📁 public/            # Recursos estáticos
│   ├── 📁 src/               # Código principal
│   └── 📄 package.json       # Dependencias del frontend
└── 📄 docker-compose.yml     # Configuración de contenedores
```

---

## ✨ **Tecnologías Usadas**

1. **Frontend:**
   - **React.js** — Librería para construir interfaces interactivas.
   - **@mui/material** — Componentes visuales de diseño moderno.
   - **React Query** — Para gestión avanzada de datos y API calls.

2. **Backend:**
   - **Flask** — Framework ligero para construir API en Python.
   - **MSQL/MySQL** — Base de datos relacional.
   - **FIWARE Orion** — Context broker para gestionar datos IoT.

3. **Infraestructura:**
   - **Docker / Docker Compose** — Para la gestión de múltiples servicios en contenedores.
   - **Grafana** — Visualizaciones de métricas y datos IoT.
   - **Traefik** (Opcional) — Proxy inverso para manejar servicios.

---

## 🤝 **Contribuir**

¡Tu ayuda es bienvenida! Sigue estos pasos para contribuir al proyecto:

1. Haz un fork del [frontend](https://github.com/1cfer/page) o el [backend](https://github.com/1cfer/Fiware-Project).
2. Crea una nueva rama para tus cambios:
   ```bash
   git checkout -b feature/nombre-de-tu-cambio
   ```
3. Haz tus modificaciones y realiza un commit:
   ```bash
   git commit -m "Descripción breve de tus cambios"
   ```
4. Envía tus cambios al repositorio remoto:
   ```bash
   git push origin feature/nombre-de-tu-cambio
   ```
5. Abre un **Pull Request** en el repositorio correspondiente.

---

## 📜 **Licencia**

Este proyecto está licenciado bajo la **MIT License**. Consulta el archivo `LICENSE` para más detalles.

---

💻 Construido con dedicación por el equipo de AgeVital+ para mejorar la calidad de vida de las personas mayores. 🌱