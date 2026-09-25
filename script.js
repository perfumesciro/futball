
/* ==========================================
   NOVA STUDIO
   Editor de fotos, videos y diseños
========================================== */

const $ = id => document.getElementById(id);

const lienzo = $("lienzo");
const video = $("videoPreview");

let modo = "foto";
let elementos = [];
let seleccionado = null;
let siguienteId = 1;

let historial = [];
let futuros = [];

let zoom = 1;

let videoURL = null;
let inicioRecorte = 0;
let finRecorte = 0;
let grabando = false;

/* ==========================================
   NAVEGACIÓN
========================================== */

function estado(mensaje) {
  $("estado").textContent = mensaje;
}

function irInicio() {
  $("inicio").classList.remove("hidden");
  $("editor").classList.add("hidden");
}

function abrirEditor(tipo) {
  modo = tipo;

  $("inicio").classList.add("hidden");
  $("editor").classList.remove("hidden");

  $("timeline").classList.toggle(
    "hidden",
    tipo !== "video" || !videoURL
  );

  const nombres = {
    foto: "Editor de fotos",
    video: "Editor de videos",
    diseno: "Editor de diseños"
  };

  $("nombreProyecto").textContent = nombres[tipo];

  if (tipo === "diseno" && elementos.length === 0) {
    $("mensajeVacio").classList.add("hidden");
    lienzo.style.background = "#ffffff";
  }

  mostrarPanel(tipo === "video" ? "video" : "archivos");

  renderizar();
}

function mostrarPanel(nombre) {
  document.querySelectorAll(".panel").forEach(panel => {
    panel.classList.add("hidden");
  });

  $("panel-" + nombre).classList.remove("hidden");

  const titulos = {
    archivos: "Mis archivos",
    ajustes: "Ajustes de imagen",
    texto: "Herramientas de texto",
    formas: "Elementos",
    capas: "Capas",
    video: "Editor de video"
  };

  $("panelTitulo").textContent = titulos[nombre];

  if (nombre === "capas") {
    actualizarCapas();
  }
}

/* ==========================================
   HISTORIAL
========================================== */

function guardarHistorial() {
  historial.push(JSON.stringify(elementos));

  if (historial.length > 40) {
    historial.shift();
  }

  futuros = [];
}

function deshacer() {
  if (!historial.length) return;

  futuros.push(JSON.stringify(elementos));

  elementos = JSON.parse(historial.pop());

  seleccionado = null;

  renderizar();
  estado("Cambio deshecho");
}

function rehacer() {
  if (!futuros.length) return;

  historial.push(JSON.stringify(elementos));

  elementos = JSON.parse(futuros.pop());

  seleccionado = null;

  renderizar();
  estado("Cambio restaurado");
}

/* ==========================================
   CREACIÓN DE ELEMENTOS
========================================== */

function crearElemento(datos) {
  guardarHistorial();

  const elemento = {
    id: siguienteId++,
    x: 100,
    y: 100,
    w: 250,
    h: 150,
    rotacion: 0,
    ...datos
  };

  elementos.push(elemento);

  seleccionado = elemento.id;

  $("mensajeVacio").classList.add("hidden");

  renderizar();

  return elemento;
}

/* ==========================================
   IMPORTAR IMÁGENES
========================================== */

function cargarImagen(evento) {
  const archivo = evento.target.files[0];

  if (!archivo) return;

  if (!archivo.type.startsWith("image/")) {
    alert("Seleccioná una imagen válida.");
    return;
  }

  const lector = new FileReader();

  lector.onload = () => {
    const imagen = new Image();

    imagen.onload = () => {
      const escala = Math.min(
        700 / imagen.width,
        400 / imagen.height,
        1
      );

      const ancho = imagen.width * escala;
      const alto = imagen.height * escala;

      crearElemento({
        tipo: "imagen",
        nombre: archivo.name,
        src: lector.result,

        x: (800 - ancho) / 2,
        y: (450 - alto) / 2,

        w: ancho,
        h: alto,

        brillo: 100,
        contraste: 100,
        saturacion: 100,
        blur: 0,
        extra: ""
      });

      estado("Imagen agregada correctamente");
    };

    imagen.onerror = () => {
      alert("No se pudo abrir la imagen.");
    };

    imagen.src = lector.result;
  };

  lector.readAsDataURL(archivo);

  evento.target.value = "";
}

/* ==========================================
   AGREGAR TEXTOS
========================================== */

function agregarTexto() {
  const contenido = $("nuevoTexto").value.trim();

  if (!contenido) {
    alert("Primero escribí un texto.");
    return;
  }

  const tamano = Number($("tamanoTexto").value);

  crearElemento({
    tipo: "texto",
    nombre: "Texto",
    contenido: contenido,

    color: $("colorTexto").value,
    tamano: tamano,

    x: 180,
    y: 160,

    w: 420,
    h: Math.max(80, tamano * 2)
  });

  estado("Texto agregado");
}

/* ==========================================
   AGREGAR FORMAS
========================================== */

function agregarForma(tipo) {
  crearElemento({
    tipo: tipo,

    nombre:
      tipo === "circle"
        ? "Círculo"
        : "Rectángulo",

    color: $("colorForma").value,

    x: 300,
    y: 150,

    w: 180,
    h: 150
  });

  estado("Forma agregada");
}

/* ==========================================
   SELECCIÓN
========================================== */

function obtenerSeleccion() {
  return elementos.find(
    elemento => elemento.id === seleccionado
  );
}

function seleccionar(id) {
  seleccionado = id;

  const elemento = obtenerSeleccion();

  if (elemento && elemento.tipo === "imagen") {
    ["brillo", "contraste", "saturacion", "blur"]
      .forEach(propiedad => {
        $(propiedad).value = elemento[propiedad];
      });

    actualizarEtiquetas();
  }

  renderizar();
}

/* ==========================================
   RENDERIZAR ELEMENTOS
========================================== */

function renderizar() {
  lienzo.querySelectorAll(".elemento").forEach(nodo => {
    nodo.remove();
  });

  elementos.forEach(elemento => {
    const div = document.createElement("div");

    div.className = "elemento";
    div.dataset.id = elemento.id;

    div.style.left = elemento.x + "px";
    div.style.top = elemento.y + "px";

    div.style.width = elemento.w + "px";
    div.style.height = elemento.h + "px";

    div.style.transform =
      `rotate(${elemento.rotacion}deg)`;

    if (elemento.id === seleccionado) {
      div.classList.add("seleccionado");
    }

    // IMAGEN

    if (elemento.tipo === "imagen") {
      const imagen = document.createElement("img");

      imagen.src = elemento.src;

      imagen.style.filter = `
        brightness(${elemento.brillo}%)
        contrast(${elemento.contraste}%)
        saturate(${elemento.saturacion}%)
        blur(${elemento.blur}px)
        ${elemento.extra || ""}
      `;

      div.appendChild(imagen);
    }

    // TEXTO

    if (elemento.tipo === "texto") {
      div.classList.add("texto");

      div.textContent = elemento.contenido;

      div.style.color = elemento.color;
      div.style.fontSize = elemento.tamano + "px";
    }

    // FORMAS

    if (
      elemento.tipo === "rect" ||
      elemento.tipo === "circle"
    ) {
      div.style.background = elemento.color;

      if (elemento.tipo === "circle") {
        div.classList.add("circulo");
      }
    }

    // MOVIMIENTO

    div.addEventListener("pointerdown", evento => {
      if (
        evento.target.classList.contains("resize-handle")
      ) {
        return;
      }

      iniciarMovimiento(evento, elemento.id);
    });

    // EDITAR TEXTO CON DOBLE CLIC

    div.addEventListener("dblclick", () => {
      if (elemento.tipo !== "texto") return;

      const nuevo = prompt(
        "Editar texto:",
        elemento.contenido
      );

      if (nuevo === null) return;

      guardarHistorial();

      elemento.contenido = nuevo;

      renderizar();
    });

    // REDIMENSIONAR

    if (elemento.id === seleccionado) {
      const handle = document.createElement("div");

      handle.className = "resize-handle";

      handle.addEventListener("pointerdown", evento => {
        iniciarRedimension(evento, elemento.id);
      });

      div.appendChild(handle);
    }

    lienzo.appendChild(div);
  });

  actualizarCapas();
}

/* ==========================================
   MOVER ELEMENTOS
========================================== */

function iniciarMovimiento(evento, id) {
  evento.preventDefault();

  if (seleccionado !== id) {
    seleccionar(id);
  }

  const elemento = obtenerSeleccion();

  if (!elemento) return;

  guardarHistorial();

  const inicialX = evento.clientX;
  const inicialY = evento.clientY;

  const originalX = elemento.x;
  const originalY = elemento.y;

  const nodo = lienzo.querySelector(
    `[data-id="${id}"]`
  );

  nodo.setPointerCapture(evento.pointerId);

  function mover(ev) {
    elemento.x =
      originalX + (ev.clientX - inicialX) / zoom;

    elemento.y =
      originalY + (ev.clientY - inicialY) / zoom;

    nodo.style.left = elemento.x + "px";
    nodo.style.top = elemento.y + "px";
  }

  function terminar() {
    nodo.removeEventListener("pointermove", mover);
    nodo.removeEventListener("pointerup", terminar);
    nodo.removeEventListener("pointercancel", terminar);
  }

  nodo.addEventListener("pointermove", mover);
  nodo.addEventListener("pointerup", terminar);
  nodo.addEventListener("pointercancel", terminar);
}

/* ==========================================
   CAMBIAR TAMAÑO
========================================== */

function iniciarRedimension(evento, id) {
  evento.preventDefault();
  evento.stopPropagation();

  const elemento = elementos.find(e => e.id === id);

  if (!elemento) return;

  guardarHistorial();

  const inicialX = evento.clientX;
  const inicialY = evento.clientY;

  const anchoOriginal = elemento.w;
  const altoOriginal = elemento.h;

  const handle = evento.currentTarget;

  handle.setPointerCapture(evento.pointerId);

  function mover(ev) {
    elemento.w = Math.max(
      30,
      anchoOriginal + (ev.clientX - inicialX) / zoom
    );

    elemento.h = Math.max(
      30,
      altoOriginal + (ev.clientY - inicialY) / zoom
    );

    const nodo = handle.parentElement;

    nodo.style.width = elemento.w + "px";
    nodo.style.height = elemento.h + "px";
  }

  function terminar() {
    handle.removeEventListener("pointermove", mover);
    handle.removeEventListener("pointerup", terminar);
    handle.removeEventListener("pointercancel", terminar);

    renderizar();
  }

  handle.addEventListener("pointermove", mover);
  handle.addEventListener("pointerup", terminar);
  handle.addEventListener("pointercancel", terminar);
}

/* ==========================================
   AJUSTES Y FILTROS
========================================== */

function actualizarEtiquetas() {
  $("vBrillo").textContent =
    $("brillo").value + "%";

  $("vContraste").textContent =
    $("contraste").value + "%";

  $("vSaturacion").textContent =
    $("saturacion").value + "%";

  $("vBlur").textContent =
    $("blur").value + "px";
}

let ajusteEnCurso = false;

function actualizarFiltros() {
  actualizarEtiquetas();

  const elemento = obtenerSeleccion();

  if (!elemento || elemento.tipo !== "imagen") {
    return;
  }

  if (!ajusteEnCurso) {
    guardarHistorial();
    ajusteEnCurso = true;
  }

  ["brillo", "contraste", "saturacion", "blur"]
    .forEach(propiedad => {
      elemento[propiedad] = Number($(propiedad).value);
    });

  renderizar();
}

["brillo", "contraste", "saturacion", "blur"]
  .forEach(propiedad => {
    $(propiedad).addEventListener("change", () => {
      ajusteEnCurso = false;
    });
  });

function filtroRapido(tipo) {
  const elemento = obtenerSeleccion();

  if (!elemento || elemento.tipo !== "imagen") {
    alert("Primero seleccioná una imagen.");
    return;
  }

  guardarHistorial();

  const filtros = {
    normal: "",
    gris: "grayscale(1)",
    vintage: "sepia(.7)",
    vivo: "saturate(1.6)"
  };

  elemento.extra = filtros[tipo] || "";

  renderizar();

  estado("Filtro aplicado");
}

/* ==========================================
   TRANSFORMACIONES
========================================== */

function rotarSeleccion() {
  const elemento = obtenerSeleccion();

  if (!elemento) return;

  guardarHistorial();

  elemento.rotacion =
    (elemento.rotacion + 90) % 360;

  renderizar();
}

function eliminarSeleccion() {
  if (seleccionado === null) return;

  guardarHistorial();

  elementos = elementos.filter(
    elemento => elemento.id !== seleccionado
  );

  seleccionado = null;

  renderizar();

  estado("Elemento eliminado");
}

function duplicarSeleccion() {
  const elemento = obtenerSeleccion();

  if (!elemento) return;

  const copia = JSON.parse(
    JSON.stringify(elemento)
  );

  delete copia.id;

  copia.x += 25;
  copia.y += 25;

  copia.nombre += " copia";

  crearElemento(copia);
}

function adelantar() {
  const indice = elementos.findIndex(
    elemento => elemento.id === seleccionado
  );

  if (
    indice < 0 ||
    indice === elementos.length - 1
  ) {
    return;
  }

  guardarHistorial();

  [
    elementos[indice],
    elementos[indice + 1]
  ] = [
    elementos[indice + 1],
    elementos[indice]
  ];

  renderizar();
}

function atrasar() {
  const indice = elementos.findIndex(
    elemento => elemento.id === seleccionado
  );

  if (indice <= 0) return;

  guardarHistorial();

  [
    elementos[indice],
    elementos[indice - 1]
  ] = [
    elementos[indice - 1],
    elementos[indice]
  ];

  renderizar();
}

/* ==========================================
   CAPAS
========================================== */

function actualizarCapas() {
  const lista = $("listaCapas");

  lista.innerHTML = "";

  [...elementos].reverse().forEach(elemento => {
    const boton = document.createElement("button");

    boton.className = "capa";

    if (elemento.id === seleccionado) {
      boton.classList.add("activa");
    }

    boton.textContent = "▤ " + elemento.nombre;

    boton.onclick = () => {
      seleccionar(elemento.id);
    };

    lista.appendChild(boton);
  });
}

/* ==========================================
   ZOOM
========================================== */

function cambiarZoom(cantidad) {
  zoom = Math.max(
    0.3,
    Math.min(2, zoom + cantidad)
  );

  lienzo.style.transform = `scale(${zoom})`;

  $("zoomLabel").textContent =
    Math.round(zoom * 100) + "%";
}

/* ==========================================
   PROYECTO VACÍO
========================================== */

function limpiarLienzo() {
  if (!confirm("¿Querés crear un proyecto vacío?")) {
    return;
  }

  guardarHistorial();

  elementos = [];
  seleccionado = null;

  if (videoURL) {
    URL.revokeObjectURL(videoURL);
  }

  videoURL = null;

  video.pause();
  video.removeAttribute("src");
  video.load();

  video.classList.add("hidden");

  $("timeline").classList.add("hidden");

  $("mensajeVacio").classList.toggle(
    "hidden",
    modo === "diseno"
  );

  lienzo.style.background =
    modo === "diseno" ? "#ffffff" : "#252b36";

  renderizar();

  estado("Proyecto vacío");
}

/* ==========================================
   EDITOR DE VIDEO
========================================== */

function cargarVideo(evento) {
  const archivo = evento.target.files[0];

  if (!archivo) return;

  if (!archivo.type.startsWith("video/")) {
    alert("Seleccioná un video válido.");
    return;
  }

  video.pause();

  if (videoURL) {
    URL.revokeObjectURL(videoURL);
  }

  videoURL = URL.createObjectURL(archivo);

  video.src = videoURL;
  video.classList.remove("hidden");

  video.controls = false;

  $("mensajeVacio").classList.add("hidden");
  $("timeline").classList.remove("hidden");

  modo = "video";

  mostrarPanel("video");

  video.onloadedmetadata = () => {
    inicioRecorte = 0;
    finRecorte = video.duration;

    $("inicioVideo").value = 0;
    $("finVideo").value = video.duration.toFixed(1);

    $("barraVideo").value = 0;

    actualizarTiempo();
  };

  estado("Video cargado: " + archivo.name);

  evento.target.value = "";
}

function formatoTiempo(segundos) {
  if (!Number.isFinite(segundos)) {
    return "00:00";
  }

  const minutos = Math.floor(segundos / 60);
  const resto = Math.floor(segundos % 60);

  return (
    String(minutos).padStart(2, "0") +
    ":" +
    String(resto).padStart(2, "0")
  );
}

function actualizarTiempo() {
  $("tiempoActual").textContent =
    formatoTiempo(video.currentTime) +
    " / " +
    formatoTiempo(video.duration);
}

function reproducirVideo() {
  if (!videoURL) {
    alert("Primero importá un video.");
    return;
  }

  if (video.paused) {
    if (video.currentTime >= finRecorte) {
      video.currentTime = inicioRecorte;
    }

    video.play().catch(() => {
      estado("No se pudo reproducir el video");
    });
  } else {
    video.pause();
  }
}

function moverVideo(valor) {
  if (!videoURL || !video.duration) return;

  video.currentTime =
    video.duration * Number(valor) / 100;
}

video.addEventListener("timeupdate", () => {
  actualizarTiempo();

  if (!grabando && video.duration) {
    $("barraVideo").value =
      video.currentTime / video.duration * 100;

    if (
      video.currentTime >= finRecorte &&
      !video.paused
    ) {
      video.pause();
    }
  }
});

function aplicarRecorte() {
  if (!videoURL) {
    alert("Primero importá un video.");
    return;
  }

  const inicio = Number($("inicioVideo").value);
  const fin = Number($("finVideo").value);

  if (
    inicio < 0 ||
    fin > video.duration ||
    inicio >= fin
  ) {
    alert("Revisá los tiempos del recorte.");
    return;
  }

  inicioRecorte = inicio;
  finRecorte = fin;

  video.currentTime = inicio;

  estado("Recorte aplicado");
}

function cambiarVelocidad() {
  video.playbackRate =
    Number($("velocidad").value);

  estado("Velocidad modificada");
}

/* ==========================================
   EXPORTACIÓN DE IMÁGENES
========================================== */

function esperarImagen(src) {
  return new Promise((resolve, reject) => {
    const imagen = new Image();

    imagen.onload = () => resolve(imagen);
    imagen.onerror = reject;

    imagen.src = src;
  });
}

async function dibujarProyecto(ctx) {
  ctx.clearRect(0, 0, 800, 450);

  ctx.fillStyle =
    modo === "diseno" ? "#ffffff" : "#252b36";

  ctx.fillRect(0, 0, 800, 450);

  for (const elemento of elementos) {
    ctx.save();

    ctx.translate(
      elemento.x + elemento.w / 2,
      elemento.y + elemento.h / 2
    );

    ctx.rotate(
      elemento.rotacion * Math.PI / 180
    );

    ctx.translate(
      -elemento.w / 2,
      -elemento.h / 2
    );

    if (elemento.tipo === "imagen") {
      const imagen = await esperarImagen(
        elemento.src
      );

      ctx.filter = `
        brightness(${elemento.brillo}%)
        contrast(${elemento.contraste}%)
        saturate(${elemento.saturacion}%)
        blur(${elemento.blur}px)
        ${elemento.extra || ""}
      `;

      ctx.drawImage(
        imagen,
        0,
        0,
        elemento.w,
        elemento.h
      );

      ctx.filter = "none";
    }

    if (elemento.tipo === "rect") {
      ctx.fillStyle = elemento.color;

      ctx.fillRect(
        0,
        0,
        elemento.w,
        elemento.h
      );
    }

    if (elemento.tipo === "circle") {
      ctx.fillStyle = elemento.color;

      ctx.beginPath();

      ctx.ellipse(
        elemento.w / 2,
        elemento.h / 2,
        elemento.w / 2,
        elemento.h / 2,
        0,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    if (elemento.tipo === "texto") {
      ctx.fillStyle = elemento.color;

      ctx.font =
        `bold ${elemento.tamano}px Arial`;

      ctx.textBaseline = "top";

      elemento.contenido
        .split("\n")
        .forEach((linea, indice) => {
          ctx.fillText(
            linea,
            0,
            indice * elemento.tamano * 1.2,
            elemento.w
          );
        });
    }

    ctx.restore();
  }
}

function descargarBlob(blob, nombre) {
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = nombre;

  document.body.appendChild(enlace);

  enlace.click();
  enlace.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10000);
}

async function descargarImagen() {
  const canvas = document.createElement("canvas");

  canvas.width = 800;
  canvas.height = 450;

  const ctx = canvas.getContext("2d");

  await dibujarProyecto(ctx);

  canvas.toBlob(blob => {
    if (blob) {
      descargarBlob(
        blob,
        "nova-studio.png"
      );

      estado("Imagen exportada");
    }
  }, "image/png");
}

/* ==========================================
   EXPORTACIÓN EXPERIMENTAL DE VIDEO
========================================== */

async function exportarVideo() {
  if (!videoURL || grabando) return;

  if (
    !window.MediaRecorder ||
    !HTMLCanvasElement.prototype.captureStream
  ) {
    alert(
      "Tu navegador no admite esta exportación."
    );
    return;
  }

  const tipo = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm"
  ].find(formato =>
    MediaRecorder.isTypeSupported(formato)
  );

  if (!tipo) {
    alert("Tu navegador no admite exportar WebM.");
    return;
  }

  video.pause();
  grabando = true;

  estado("Preparando exportación...");

  const canvas = document.createElement("canvas");

  canvas.width = 800;
  canvas.height = 450;

  const ctx = canvas.getContext("2d");

  const stream = canvas.captureStream(30);
  const partes = [];

  const recorder = new MediaRecorder(stream, {
    mimeType: tipo,
    videoBitsPerSecond: 5000000
  });

  recorder.ondataavailable = evento => {
    if (evento.data.size > 0) {
      partes.push(evento.data);
    }
  };

  recorder.onstop = () => {
    if (partes.length) {
      const blob = new Blob(
        partes,
        { type: tipo }
      );

      descargarBlob(
        blob,
        "nova-video.webm"
      );

      estado("Video exportado");
    }

    stream.getTracks().forEach(track => {
      track.stop();
    });

    grabando = false;
  };

  try {
    video.currentTime = inicioRecorte;

    await new Promise(resolve => {
      if (
        Math.abs(
          video.currentTime - inicioRecorte
        ) < 0.05
      ) {
        resolve();
      } else {
        video.addEventListener(
          "seeked",
          resolve,
          { once: true }
        );
      }
    });

    const imagenes = await Promise.all(
      elementos
        .filter(e => e.tipo === "imagen")
        .map(async e => [
          e.id,
          await esperarImagen(e.src)
        ])
    );

    const mapa = new Map(imagenes);

    function dibujarFrame() {
      ctx.fillStyle = "#000000";

      ctx.fillRect(0, 0, 800, 450);

      if (video.readyState >= 2) {
        ctx.drawImage(
          video,
          0,
          0,
          800,
          450
        );
      }

      for (const elemento of elementos) {
        ctx.save();

        ctx.translate(
          elemento.x + elemento.w / 2,
          elemento.y + elemento.h / 2
        );

        ctx.rotate(
          elemento.rotacion * Math.PI / 180
        );

        ctx.translate(
          -elemento.w / 2,
          -elemento.h / 2
        );

        if (elemento.tipo === "imagen") {
          ctx.filter = `
            brightness(${elemento.brillo}%)
            contrast(${elemento.contraste}%)
            saturate(${elemento.saturacion}%)
            blur(${elemento.blur}px)
            ${elemento.extra || ""}
          `;

          ctx.drawImage(
            mapa.get(elemento.id),
            0,
            0,
            elemento.w,
            elemento.h
          );

          ctx.filter = "none";
        }

        if (elemento.tipo === "texto") {
          ctx.fillStyle = elemento.color;

          ctx.font =
            `bold ${elemento.tamano}px Arial`;

          ctx.textBaseline = "top";

          elemento.contenido
            .split("\n")
            .forEach((linea, indice) => {
              ctx.fillText(
                linea,
                0,
                indice * elemento.tamano * 1.2,
                elemento.w
              );
            });
        }

        if (elemento.tipo === "rect") {
          ctx.fillStyle = elemento.color;

          ctx.fillRect(
            0,
            0,
            elemento.w,
            elemento.h
          );
        }

        if (elemento.tipo === "circle") {
          ctx.fillStyle = elemento.color;

          ctx.beginPath();

          ctx.ellipse(
            elemento.w / 2,
            elemento.h / 2,
            elemento.w / 2,
            elemento.h / 2,
            0,
            0,
            Math.PI * 2
          );

          ctx.fill();
        }

        ctx.restore();
      }
    }

    dibujarFrame();

    recorder.start();

    await video.play();

    estado("Exportando video...");

    await new Promise(resolve => {
      function frame() {
        dibujarFrame();

        if (
          video.currentTime >= finRecorte ||
          video.ended
        ) {
          video.pause();
          resolve();
          return;
        }

        requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    });

    recorder.stop();

  } catch (error) {
    console.error(error);

    video.pause();

    if (recorder.state !== "inactive") {
      recorder.stop();
    }

    estado("Error al exportar video");

    alert(
      "No se pudo exportar este video."
    );
  }
}

/* ==========================================
   BOTÓN EXPORTAR
========================================== */

function descargar() {
  if (modo === "video" && videoURL) {
    exportarVideo();
  } else {
    descargarImagen().catch(error => {
      console.error(error);

      alert(
        "No se pudo exportar la imagen."
      );
    });
  }
}

/* ==========================================
   GUARDAR PROYECTOS
========================================== */

function guardarProyecto() {
  const proyecto = {
    version: 1,
    modo: modo,
    elementos: elementos,
    ancho: 800,
    alto: 450
  };

  const blob = new Blob(
    [
      JSON.stringify(
        proyecto,
        null,
        2
      )
    ],
    {
      type: "application/json"
    }
  );

  descargarBlob(
    blob,
    "nova-proyecto.json"
  );

  if (videoURL) {
    alert(
      "Se guardaron las capas del proyecto. " +
      "Conservá el video original por separado."
    );
  }

  estado("Proyecto guardado");
}

/* ==========================================
   ATAJOS DE TECLADO
========================================== */

document.addEventListener("keydown", evento => {
  const escribiendo = [
    "INPUT",
    "TEXTAREA",
    "SELECT"
  ].includes(
    document.activeElement.tagName
  );

  if (escribiendo) return;

  if (
    evento.key === "Delete" ||
    evento.key === "Backspace"
  ) {
    eliminarSeleccion();
  }

  if (
    evento.ctrlKey &&
    evento.key.toLowerCase() === "z"
  ) {
    evento.preventDefault();

    if (evento.shiftKey) {
      rehacer();
    } else {
      deshacer();
    }
  }

  if (
    evento.ctrlKey &&
    evento.key.toLowerCase() === "y"
  ) {
    evento.preventDefault();

    rehacer();
  }
});

/* ==========================================
   INICIALIZACIÓN
========================================== */

actualizarEtiquetas();

estado("NOVA STUDIO está listo");
