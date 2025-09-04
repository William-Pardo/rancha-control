# 🧠 Rancha Control

Una aplicación web moderna y responsiva para gestionar el inventario de alimentos del hogar y el seguimiento de gastos compartidos. Incluye un asistente de IA (Google Gemini) que proporciona análisis inteligentes para optimizar las compras y mejorar los hábitos alimenticios.

---

## ✨ Características Principales

- **Gestión de Inventario:** Añade y consume artículos de tu despensa. Clasifica los productos por categorías (Lácteos, Frutas, Proteínas, etc.).
- **Seguimiento de Gastos:** Registra los aportes monetarios de cada miembro del hogar y visualiza un resumen de los gastos.
- **Asistente con IA:** Obtén análisis sobre patrones de consumo, balance nutricional y sugerencias de compra personalizadas gracias a la integración con Google Gemini.
- **Gestión Segura de API Key:** Configura tu clave de API directamente en la interfaz. Se almacena de forma segura en tu navegador.
- **Dashboard Intuitivo:** Visualiza de un vistazo el estado de tu inventario, los últimos aportes y resúmenes por categoría.
- **Modo Oscuro/Claro:** Interfaz adaptable a las preferencias del usuario para una mayor comodidad visual.
- **Interfaz Responsiva:** Experiencia de usuario fluida en dispositivos de escritorio y móviles.
- **Sistema de Usuarios:** Simulación de un entorno multiusuario donde cada persona puede registrar sus aportes.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 19, TypeScript
- **Estilos:** Tailwind CSS (vía CDN) con un sistema de diseño personalizado.
- **IA Generativa:** Google Gemini API (`@google/genai`).
- **Dependencias:** Servidas en tiempo de ejecución a través de `esm.sh`.

---

## 🚀 Ejecutar Localmente

**Requisitos:**
- Un navegador web moderno.
- Una extensión de servidor web para tu editor de código (ej. [Live Server para VS Code](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)).
- Clave de API de [Google Gemini](https://makersuite.google.com/app/apikey).

**Pasos:**

1.  **Clona o descarga los archivos del proyecto.**

2.  **Inicia un servidor local:**
    - Usando la extensión `Live Server` en VS Code, haz clic derecho en el archivo `index.html` y selecciona "Open with Live Server".
    - Esto es necesario para que el navegador pueda cargar los módulos de ES6 (`.tsx`) correctamente debido a las políticas de seguridad (CORS).

3.  **Configura la clave de API en la aplicación:**
    - La primera vez que intentes "Generar Análisis" en el Dashboard, la aplicación te pedirá que introduzcas tu clave de API de Google Gemini.
    - Pega tu clave en el campo y guárdala. La clave se almacenará de forma segura en el almacenamiento local de tu navegador para futuras sesiones.
    - También puedes gestionar tu clave en cualquier momento haciendo clic en el icono de la llave en la cabecera.

4.  **Abre la aplicación en tu navegador:**
    Live Server abrirá automáticamente la aplicación en una nueva pestaña. ¡Ya puedes empezar a usar Rancha Control!