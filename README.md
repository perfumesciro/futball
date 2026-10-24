
# 🏝️ Isla Perdida

Un juego de supervivencia 3D creado con HTML, CSS y JavaScript.

## 🎮 Características

- Mundo 3D con una isla, árboles, rocas y mar.
- Movimiento del jugador y cámara en tercera persona.
- Sistema de supervivencia: vida, hambre, sed y energía.
- Recolección de recursos.
- Inventario y fabricación de objetos.
- Ciclo de día y noche.
- Guardado de partida en el navegador.

## 🕹️ Controles

| Tecla | Acción |
|---|---|
| W | Avanzar |
| A | Moverse a la izquierda |
| S | Retroceder |
| D | Moverse a la derecha |
| Shift | Correr |
| Espacio | Saltar |
| E | Recolectar recursos |

Los controles pueden variar según las funciones conectadas en `game.js`.

## 📁 Archivos del proyecto

- `index.html`: estructura y pantalla del juego.
- `style.css`: estilos e interfaz.
- `game.js`: mundo 3D, jugador, cámara y controles.
- `systems.js`: supervivencia, inventario, fabricación y guardado.
- `README.md`: documentación del proyecto.

## 🚀 Cómo ejecutar el juego

1. Descargá todos los archivos.
2. Colocalos dentro de una misma carpeta.
3. Abrí el proyecto mediante un servidor web local para que funcionen los módulos JavaScript.
4. Necesitás conexión a Internet para cargar Three.js desde su CDN.

## 🌐 Publicar en GitHub Pages

1. Creá un repositorio en GitHub.
2. Subí los archivos a la raíz del repositorio.
3. Entrá en **Settings → Pages**.
4. En **Build and deployment**, seleccioná **Deploy from a branch**.
5. Elegí la rama `main` y la carpeta `/ (root)`.
6. Guardá los cambios y esperá a que termine la publicación.

La dirección tendrá este formato:

`https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`

## 💾 Guardado

La partida se guarda en el almacenamiento local del navegador. Si borrás los datos del sitio o cambiás de navegador o dispositivo, podrías perder el progreso.

## 🛠️ Tecnologías

- HTML5
- CSS3
- JavaScript ES Modules
- Three.js

## 📌 Estado del proyecto

En desarrollo. Algunas funciones requieren conectar `game.js`, `systems.js` y la interfaz para funcionar dentro del juego.
