# 📊 Panel de Análisis de Casos

Este es un proyecto web interactivo construido con **Astro** y **Tailwind CSS** que permite a los usuarios subir un archivo CSV con datos de casos, procesarlos y visualizar análisis de rendimiento detallados. La aplicación es completamente interactiva, cuenta con modo oscuro y permite descargar los datos filtrados para su uso en otras herramientas como Google Sheets.

![Captura de Pantalla de la Aplicación](/public/screenshot_light.png) 
![Captura de Pantalla de la Aplicación modo oscuro](/public/screenshot_dark.png) 

---

## ✨ Características Principales

-   **Carga y Procesamiento de CSV**: Sube archivos CSV directamente desde el navegador usando la librería PapaParse.
-   **Filtrado Dinámico**: Selecciona un mes y año específicos para analizar un período concreto.
-   **Análisis Completo**:
    -   **Resumen General**: KPIs de casos totales y cerrados.
    -   **Tiempos de Resolución**: Porcentaje de casos cerrados en <24hs, 24-48hs, 48-72hs y +72hs.
    -   **Actividad por Agente**: Total de casos creados y cerrados por cada agente.
    -   **Rendimiento Detallado por Agente**: Análisis de los tiempos de cierre de cada agente, tanto en general como desglosado por cada **Razón** de caso.
-   **Modo Oscuro 🌙**: Un toggle interactivo para cambiar entre el tema claro y oscuro. La preferencia se guarda en el navegador.
-   **Exportación a CSV**: Descarga los datos ya procesados y filtrados en un archivo `.csv`, listo para importar en Google Sheets o Excel.
-   **Diseño Moderno y Responsivo**: Interfaz limpia y adaptable a cualquier dispositivo gracias a Tailwind CSS.

---

## 🛠️ Tecnologías Utilizadas

-   **Framework**: [Astro](https://astro.build/)
-   **Estilos CSS**: [Tailwind CSS](https://tailwindcss.com/)
-   **Parseo de CSV**: [PapaParse](https://www.papaparse.com/)
-   **Despliegue**: Compatible con Vercel, Netlify, o cualquier host estático.

---

## 🚀 Cómo Empezar

Sigue estos pasos para levantar el proyecto en tu máquina local.

### Prerrequisitos

-   Tener instalado [Node.js](https://nodejs.org/) (versión 18.0 o superior).
-   Un editor de código como [Visual Studio Code](https://code.visualstudio.com/).
-   Tener `git` instalado (opcional, si clonas el repositorio).

### Instalación

1.  **Clona el repositorio** (o crea tu proyecto de Astro e integra los componentes):
    ```bash
    git clone [https://github.com/tu-usuario/tu-repositorio.git](https://github.com/tu-usuario/tu-repositorio.git)
    cd tu-repositorio
    ```

2.  **Instala las dependencias** del proyecto. Esto instalará Astro, Tailwind CSS y PapaParse.
    ```bash
    npm install
    ```

3.  **Configura Tailwind CSS para el Modo Oscuro**:
    Asegúrate de que tu archivo `tailwind.config.mjs` tenga la siguiente configuración para habilitar el modo oscuro basado en clases:
    ```javascript
    // tailwind.config.mjs
    /** @type {import('tailwindcss').Config} */
    export default {
      darkMode: 'class', // Habilita el modo oscuro
      content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
      theme: {
        extend: {},
      },
      plugins: [],
    }
    ```

4.  **Inicia el servidor de desarrollo**:
    ```bash
    npm run dev
    ```

5.  **¡Abre tu navegador!**
    Visita `http://localhost:4321` para ver la aplicación funcionando en tiempo real.

---

## 📁 Estructura del Proyecto

El proyecto sigue la estructura estándar de Astro. Los archivos más importantes son:

-   `src/layouts/Layout.astro`: Es la plantilla principal de la página. Aquí se configuran los estilos globales y el modo oscuro en la etiqueta `<body>`.
-   `src/components/AnalizadorCasos.astro`: **El corazón de la aplicación**. Este componente contiene toda la lógica de la interfaz, el procesamiento de datos y la generación de los análisis.
-   `src/pages/index.astro`: La página de inicio que importa y renderiza el componente `AnalizadorCasos.astro`.
-   `tailwind.config.mjs`: Archivo de configuración para Tailwind CSS.
-   `package.json`: Define las dependencias y los scripts del proyecto.

---

## Cómo Usar la Aplicación

1.  **Sube un archivo**: Haz clic en el botón "Seleccionar archivo" y elige el archivo CSV que contiene los datos de los casos.
2.  **Elige el Período**: Selecciona el mes y el año que deseas analizar usando los menús desplegables. Por defecto, se mostrará el mes y año actual.
3.  **Procesa los Datos**: Haz clic en el botón "Analizar Período". La aplicación procesará los datos y mostrará los resultados en pantalla.
4.  **Explora los Resultados**: Navega a través del resumen general, la actividad de los agentes y el rendimiento detallado por agente y razón.
5.  **Cambia el Tema**: Usa el botón del sol/luna en la esquina superior derecha para cambiar entre el modo claro y oscuro.
6.  **Descarga el CSV**: Si se encontraron datos, aparecerá un botón "Descargar CSV Procesado" para que puedas guardar los datos filtrados.