# 📌 CARACTERÍSTICAS TÉCNICAS Y ESPECIFICACIONES DEL PROYECTO (AURAMOTORS)

## 1. Características Principales de la Plataforma Web
- **Diseño Luxury Glassmorphism**: Interfaz oscura profunda (`#0b0f19`) con tarjetas translúcidas, efectos de desenfoque de fondo (`backdrop-filter: blur(16px)`), bordes sutiles y acentos cromáticos en gradiente neón cyan (`#00f2fe` a `#4facfe`).
- **Catálogo Unificado Multi-Microservicio**: Consumo asíncrono y paralelo desde dos microservicios REST alojados en instancias independientes de AWS EC2 (puertos `5000` y `8000`).
- **Persistencia Relacional Centralizada**: Base de datos gestionada en AWS RDS (MySQL 8.0, puerto `3306`) consumida por ambos microservicios para mantener la integridad relacional de los datos.
- **Sistema de Filtros y Búsqueda en Tiempo Real**:
  * Filtrado por categoría (*Todos*, *Automóviles*, *Motocicletas*).
  * Buscador por coincidencia directa de texto (marca, modelo, descripción).
  * Ordenamiento dinámico por precio (menor a mayor / mayor a menor) y año de fabricación.
- **Simulador Financiero Integrado**: Calculadora de crédito integrada en la ficha técnica modal que proyecta automáticamente enganches del 20% y mensualidades a 48 meses.
- **Comparador Multivehículo Flotante**: Módulo interactivo que permite seleccionar hasta 3 vehículos simultáneamente para contrastar sus especificaciones técnicas y precios lado a lado.
- **Arquitectura Reverse Proxy (Vercel Rewrites)**: Enrutamiento seguro desde `/api/automoviles` y `/api/motocicletas` hacia las IP públicas de AWS EC2, eliminando bloqueos de CORS y ocultando directivas de puerto.
- **Estructura Modular Clean Code**: Organización bajo el estándar de carpeta `assets/` (`assets/css/`, `assets/js/`, `assets/img/`), lista para entornos de producción.

---

## 2. Arquitectura de Red y Cloud (AWS)

El proyecto implementa un modelo desacoplado y multicapa que garantiza alta disponibilidad, seguridad y bajo acoplamiento entre servicios:

```text
                        ┌─────────────────────────────────────────┐
                        │      Cliente Web (Vercel Frontend)      │
                        │      Estética Luxury Glassmorphism      │
                        └────────────────────┬────────────────────┘
                                             │
                                     (Vercel Reverse Proxy)
                                             │
                     ┌───────────────────────┴───────────────────────┐
                     │                                               │
             GET /api/automoviles                           GET /api/motocicletas
                     │                                               │
                     ▼                                               ▼
     ┌───────────────────────────────┐               ┌───────────────────────────────┐
     │   AWS EC2 (Instancia 1)       │               │   AWS EC2 (Instancia 2)       │
     │   Microservicio Automóviles   │               │   Microservicio Motocicletas  │
     │   Puerto 5000 (Node.js/REST)  │               │   Puerto 8000 (Node.js/REST)  │
     └───────────────┬───────────────┘               └───────────────┬───────────────┘
                     │                                               │
                     └───────────────────────┬───────────────────────┘
                                             │ (Puerto 3306)
                                             ▼
                             ┌───────────────────────────────┐
                             │  AWS RDS (Relational DB)      │
                             │  Engine: MySQL 8.0            │
                             │  Base de Datos Centralizada   │
                             └───────────────────────────────┘
---

## 3.Estructura de Archivos del Proyecto

frontend-concesionaria/
├── index.html              # Estructura principal y maquetación semántica SPA
├── vercel.json             # Configuración de Reverse Proxy y reescritura de rutas
├── README.md               # Documentación técnica del repositorio
└── assets/
    ├── css/
    │   └── styles.css      # Variables CSS, efectos Glassmorphism y animaciones
    ├── js/
    │   └── main.js         # Lógica de consumo de APIs, renderizado, filtros y comparador
    └── img/
        └── favicon.png     # Isotipo en formato PNG de alta resolución
