# 🎯 Entre Vistas - Sistema Inteligente de Entrevistas

Una plataforma web moderna y animada construida con Next.js para gestionar entrevistas laborales con IA. El proyecto cuenta con 4 pantallas principales inspiradas en interfaces modernas y profesionales.

## ✨ Características

- **Next.js 14** con App Router para una navegación moderna
- **TailwindCSS** para estilos elegantes y responsivos
- **Framer Motion** para animaciones suaves y atractivas
- **Lucide React** para iconos modernos y consistentes
- **TypeScript** para desarrollo con tipado estático
- **Diseño responsivo** que funciona en desktop, tablet y móvil

## 📱 Pantallas Implementadas

### 1. 🎨 Generar (`/generar`)
- Pantalla principal con formulario de configuración
- Selección de páginas, idioma y fuente de imágenes
- Herramientas adicionales: Deep Research, búsqueda de reclutadores, análisis de posiciones similares
- Animaciones de entrada y efectos hover

### 2. 📹 Reunión Virtual (`/reunion`)
- Interfaz tipo Google Meet con avatar animado
- Controles de micrófono y cámara con estados visuales
- Panel de preguntas interactivas con checkboxes
- Área de carga de archivos con drag & drop

### 3. 👥 Catálogo de Agentes (`/catalogo`)
- Grid de tarjetas de agentes tipo Domestika
- Filtros por especialidad y ordenamiento
- Información detallada de cada agente con ratings y precios
- Animaciones al aparecer y efectos hover

### 4. 📊 Dashboard Empresas (`/dashboard`)
- Métricas de rendimiento tipo micro1
- Gráficos animados de progreso semanal
- Tarjetas de estadísticas con iconos
- Resúmenes semanales detallados

## 🚀 Instalación

1. **Clona el repositorio:**
```bash
git clone <repo-url>
cd entre-vistas
```

2. **Instala las dependencias:**
```bash
npm install
```

3. **Ejecuta el servidor de desarrollo:**
```bash
npm run dev
```

4. **Abre tu navegador en:**
```
http://localhost:3000
```

## 🛠️ Tecnologías Utilizadas

- **Framework:** Next.js 14
- **Estilos:** TailwindCSS
- **Animaciones:** Framer Motion
- **Iconos:** Lucide React
- **Lenguaje:** TypeScript
- **Tipografías:** Inter & Poppins

## 🎨 Diseño y UX

### Paleta de Colores
- **Primarios:** Azules (#3b82f6, #2563eb, #1d4ed8)
- **Secundarios:** Morados (#8b5cf6, #7c3aed, #6d28d9)
- **Neutros:** Escalas de grises con fondo #f9fafb

### Tipografías
- **Principal:** Inter (legibilidad optimizada)
- **Display:** Poppins (títulos y elementos destacados)

### Animaciones
- Entrada suave con `fadeInUp`
- Animaciones escalonadas con `staggerContainer`
- Efectos hover y tap con Framer Motion
- Transiciones de estado fluidas

## 📂 Estructura del Proyecto

```
entre-vistas/
├── app/
│   ├── generar/
│   │   └── page.tsx
│   ├── reunion/
│   │   └── page.tsx
│   ├── catalogo/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Sidebar.tsx
├── lib/
│   └── utils.ts
├── package.json
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

## 🚪 Navegación

La aplicación cuenta con una **barra lateral fija** que permite navegar entre las 4 pantallas principales:

- **Generar** - Crear presentaciones y configuraciones
- **Reunión Virtual** - Simular entrevistas en línea
- **Catálogo de Agentes** - Explorar profesionales disponibles  
- **Dashboard Empresas** - Analizar métricas y rendimiento

## 📱 Responsive Design

- **Desktop:** Experiencia completa con barra lateral fija
- **Tablet:** Adaptación responsive manteniendo funcionalidad
- **Móvil:** Barra lateral colapsible con navegación optimizada

## 🔧 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter ESLint
```

## 🌟 Características Destacadas

- ⚡ **Performance:** Optimización con Next.js 14
- 🎭 **Animaciones:** Micro-interacciones fluidas
- 📱 **Responsivo:** Funciona en todos los dispositivos
- 🎨 **UI Moderna:** Diseño limpio y profesional
- 🔄 **Estado:** Gestión local con React hooks
- 🚀 **Deploy:** Listo para producción

## 📸 Preview

El proyecto incluye animaciones y efectos visuales inspirados en:
- **Gamma** para la interfaz de generación
- **Domestika** para el catálogo de agentes
- **Google Meet** para la reunión virtual
- **Micro1** para el dashboard empresarial

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**¡Desarrollado con ❤️ y mucha creatividad!** 