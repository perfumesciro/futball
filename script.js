
/* ============================================
   NOVA STUDIO — SCRIPT PRINCIPAL
   Editor de fotos, videos y diseños
============================================ */

"use strict";

const $ = id => document.getElementById(id);

const lienzo = $("lienzo");
const video = $("videoPreview");

const ANCHO = 800;
const ALTO = 450;

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
let exportando = false;
let ajusteEnCurso = false;

/* ============================================
   NAVEGACIÓN
============================================ */

function estado(mensaje) {
  $("estado").textContent = mensaje;
}

function irInicio() {
  video.pause();

  $("inicio").classList.remove("hidden");
  $("editor").classList.add("hidden");
}

function abrirEditor(tipo) {
  modo = tipo;

  $("inicio").classList.add("hidden");
  $("editor").classList.remove("hidden");

  const nombres = {
    foto: "Editor de fotos",
    video: "Editor de videos",
    diseno: "Editor de diseños"
  };

  $("nombreProyecto").textContent = nombres[tipo];

  $("timeline").classList.toggle(
    "hidden",
    tipo !== "video" || !videoURL
  );

  lienzo.style.background =
    tipo === "diseno" ? "#ffffff" : "#252b36";

  if (tipo === "diseno" && elementos.length === 0) {
    $("mensajeVacio").classList.add("hidden");
  }

  mostrarPanel(tipo === "video" ? "video" : "archivos");

  renderizar();
  estado(nombres[tipo] + " listo");
}

function mostrarPanel(nombre) {
  document.querySelectorAll(".panel").forEach(panel => {
    panel.classList.add("hidden");
  });

  const panel = $("panel-" + nombre);

  if (!panel) return;

  panel.classList.remove("hidden");

  const titulos = {
    archivos: "Mis archivos",
    ajustes: "Ajustes de imagen",
    texto: "Herramientas de texto",
    formas: "Elementos",
    capas: "Capas",
    video: "Editor de video"
  };

  $("panelTitulo").textContent = titulos[nombre];

  document.querySelectorAll(".sidebar button")
    .forEach(boton => {
      boton.classList.remove("active");

      if (
        boton.getAttribute("onclick")
          ?.includes("'" + nombre + "'")
      ) {
        boton.classList.add("active");
      }
    });

  if (nombre === "capas") actualizarCapas();
}

/* ============================================
   HISTORIAL
============================================ */

function guardarHistorial() {
  historial.push(JSON.stringify(elementos));

  if (historial.length > 40) historial.shift();

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

/* ============================================
   ELEMENTOS
============================================ */

function crearElemento(datos) {
  guardarHistorial();

  const elemento = {
    id: siguienteId++,
    tipo: "rect",
    nombre: "Elemento",
    x: 100,
    y: 100,
    w: 200,
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

function obtenerSeleccion() {
  return elementos.find(e => e.id === seleccionado);
}

function seleccionar(id) {
  seleccionado = id;

  const e = obtenerSeleccion();

  if (e?.tipo === "imagen") {
    ["brillo", "contraste", "saturacion", "blur"]
      .forEach(k => {
        $(k).value = e[k];
      });

    actualizarEtiquetas();
  }

  renderizar();
}

/* ============================================
   IMPORTAR IMÁGENES
============================================ */

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

      const w = imagen.width * escala;
      const h = imagen.height * escala;

      crearElemento({
        tipo: "imagen",
        nombre: archivo.name,
        src: lector.result,
        x: (ANCHO - w) / 2,
        y: (ALTO - h) / 2,
        w,
        h,
        brillo: 100,
        contraste: 100,
        saturacion: 100,
        blur: 0,
        extra: ""
      });

      estado("Imagen importada: " + archivo.name);
    };

    imagen.onerror = () => {
      alert("No se pudo abrir la imagen.");
    };

    imagen.src = lector.result;
  };

  lector.readAsDataURL(archivo);
  evento.target.value = "";
}

/* ============================================
   TEXTO Y FORMAS
============================================ */

function agregarTexto() {
  const contenido = $("nuevoTexto").value.trim();

  if (!contenido) {
    alert("Escribí un texto primero.");
    return;
  }

  const tamano = Number($("tamanoTexto").value);

  crearElemento({
    tipo: "texto",
    nombre: contenido.slice(0, 25),
    contenido,
    color: $("colorTexto").value,
    tamano,
    x: 170,
    y: 160,
    w: 420,
    h: Math.max(80, tamano * 2)
  });

  estado("Texto agregado");
}

function agregarForma(tipo) {
  crearElemento({
    tipo,
    nombre: tipo === "circle" ? "Círculo" : "Rectángulo",
    color: $("colorForma").value,
    x: 300,
    y: 150,
    w: 180,
    h: 150
  });

  estado("Forma agregada");
}

/* ============================================
   DIBUJAR ELEMENTOS EN EL EDITOR
============================================ */

function renderizar() {
  lienzo.querySelectorAll(".elemento")
    .forEach(nodo => nodo.remove());

  elementos.forEach(e => {
    const div = document.createElement("div");

    div.className = "elemento";
    div.dataset.id = e.id;

    div.style.left = e.x + "px";
    div.style.top = e.y + "px";
    div.style.width = e.w + "px";
    div.style.height = e.h + "px";
    div.style.transform = `rotate(${e.rotacion}deg)`;

    if (e.id === seleccionado) {
      div.classList.add("seleccionado");
    }

    if (e.tipo === "imagen") {
      const img = document.createElement("img");

      img.src = e.src;
      img.draggable = false;

      img.style.filter = `
        brightness(${e.brillo}%)
        contrast(${e.contraste}%)
        saturate(${e.saturacion}%)
        blur(${e.blur}px)
        ${e.extra || ""}
      `;

      div.appendChild(img);
    }

    if (e.tipo === "texto") {
      div.classList.add("texto");
      div.textContent = e.contenido;
      div.style.color = e.color;
      div.style.fontSize = e.tamano + "px";
    }

    if (e.tipo === "rect" || e.tipo === "circle") {
      div.style.background = e.color;

      if (e.tipo === "circle") {
        div.classList.add("circulo");
      }
    }

    div.addEventListener("pointerdown", evento => {
      if (
        evento.target.classList.contains("resize-handle")
      ) return;

      iniciarMovimiento(evento, e.id);
    });

    div.addEventListener("dblclick", () => {
      if (e.tipo !== "texto") return;

      const nuevo = prompt("Editar texto:", e.contenido);

      if (nuevo === null) return;

      guardarHistorial();

      e.contenido = nuevo;
      e.nombre = nuevo.slice(0, 25);

      renderizar();
    });

    if (e.id === seleccionado) {
      const handle = document.createElement("div");

      handle.className = "resize-handle";

      handle.addEventListener("pointerdown", evento => {
        iniciarRedimension(evento, e.id);
      });

      div.appendChild(handle);
    }

    lienzo.appendChild(div);
  });

  actualizarCapas();
}

/* ============================================
   MOVER ELEMENTOS
============================================ */

function iniciarMovimiento(evento, id) {
  evento.preventDefault();

  if (seleccionado !== id) seleccionar(id);

  const e = obtenerSeleccion();

  if (!e) return;

  guardarHistorial();

  const nodo = lienzo.querySelector(
    `[data-id="${id}"]`
  );

  const inicioX = evento.clientX;
  const inicioY = evento.clientY;

  const originalX = e.x;
  const originalY = e.y;

  nodo.setPointerCapture(evento.pointerId);

  function mover(ev) {
    e.x = originalX + (ev.clientX - inicioX) / zoom;
    e.y = originalY + (ev.clientY - inicioY) / zoom;

    nodo.style.left = e.x + "px";
    nodo.style.top = e.y + "px";
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

/* ============================================
   REDIMENSIONAR
============================================ */

function iniciarRedimension(evento, id) {
  evento.preventDefault();
  evento.stopPropagation();

  const e = elementos.find(item => item.id === id);

  if (!e) return;

  guardarHistorial();

  const handle = evento.currentTarget;

  const inicioX = evento.clientX;
  const inicioY = evento.clientY;

  const originalW = e.w;
  const originalH = e.h;

  handle.setPointerCapture(evento.pointerId);

  function mover(ev) {
    e.w = Math.max(
      30,
      originalW + (ev.clientX - inicioX) / zoom
    );

    e.h = Math.max(
      30,
      originalH + (ev.clientY - inicioY) / zoom
    );

    const nodo = handle.parentElement;

    nodo.style.width = e.w + "px";
    nodo.style.height = e.h + "px";
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

/* ============================================
   FILTROS Y AJUSTES
============================================ */

function actualizarEtiquetas() {
  $("vBrillo").textContent = $("brillo").value + "%";
  $("vContraste").textContent = $("contraste").value + "%";
  $("vSaturacion").textContent = $("saturacion").value + "%";
  $("vBlur").textContent = $("blur").value + "px";
}

function actualizarFiltros() {
  actualizarEtiquetas();

  const e = obtenerSeleccion();

  if (!e || e.tipo !== "imagen") return;

  if (!ajusteEnCurso) {
    guardarHistorial();
    ajusteEnCurso = true;
  }

  ["brillo", "contraste", "saturacion", "blur"]
    .forEach(k => {
      e[k] = Number($(k).value);
    });

  renderizar();
}

["brillo", "contraste", "saturacion", "blur"]
  .forEach(k => {
    $(k).addEventListener("change", () => {
      ajusteEnCurso = false;
    });
  });

function filtroRapido(tipo) {
  const e = obtenerSeleccion();

  if (!e || e.tipo !== "imagen") {
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

  e.extra = filtros[tipo] || "";

  renderizar();
  estado("Filtro aplicado");
}

/* ============================================
   CAPAS Y TRANSFORMACIONES
============================================ */

function rotarSeleccion() {
  const e = obtenerSeleccion();

  if (!e) return;

  guardarHistorial();

  e.rotacion = (e.rotacion + 90) % 360;

  renderizar();
}

function eliminarSeleccion() {
  if (seleccionado === null) return;

  guardarHistorial();

  elementos = elementos.filter(
    e => e.id !== seleccionado
  );

  seleccionado = null;

  renderizar();
  estado("Elemento eliminado");
}

function duplicarSeleccion() {
  const e = obtenerSeleccion();

  if (!e) return;

  const copia = structuredClone(e);

  delete copia.id;

  copia.x += 25;
  copia.y += 25;
  copia.nombre += " copia";

  crearElemento(copia);
}

function adelantar() {
  const i = elementos.findIndex(
    e => e.id === seleccionado
  );

  if (i < 0 || i >= elementos.length - 1) return;

  guardarHistorial();

  [elementos[i], elementos[i + 1]] =
    [elementos[i + 1], elementos[i]];

  renderizar();
}

function atrasar() {
  const i = elementos.findIndex(
    e => e.id === seleccionado
  );

  if (i <= 0) return;

  guardarHistorial();

  [elementos[i], elementos[i - 1]] =
    [elementos[i - 1], elementos[i]];

  renderizar();
}

function actualizarCapas() {
  const lista = $("listaCapas");

  lista.innerHTML = "";

  [...elementos].reverse().forEach(e => {
    const boton = document.createElement("button");

    boton.className = "capa";

    if (e.id === seleccionado) {
      boton.classList.add("activa");
    }

    boton.textContent = "▤ " + e.nombre;

    boton.onclick = () => seleccionar(e.id);

    lista.appendChild(boton);
  });
}

/* ============================================
   ZOOM
============================================ */

function cambiarZoom(cantidad) {
  zoom = Math.max(
    0.3,
    Math.min(2, Math.round((zoom + cantidad) * 10) / 10)
  );

  lienzo.style.transform = `scale(${zoom})`;

  $("zoomLabel").textContent =
    Math.round(zoom * 100) + "%";
}

/* ============================================
   LIMPIAR PROYECTO
============================================ */

function limpiarLienzo() {
  if (!confirm("¿Querés crear un proyecto vacío?")) {
    return;
  }

  guardarHistorial();

  elementos = [];
  seleccionado = null;

  video.pause();

  if (videoURL) URL.revokeObjectURL(videoURL);

  videoURL = null;

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

/* ============================================
   EDITOR DE VIDEO
============================================ */

function cargarVideo(evento) {
  const archivo = evento.target.files[0];

  if (!archivo) return;

  if (!archivo.type.startsWith("video/")) {
    alert("Seleccioná un video válido.");
    return;
  }

  video.pause();

  if (videoURL) URL.revokeObjectURL(videoURL);

  videoURL = URL.createObjectURL(archivo);

  video.src = videoURL;
  video.classList.remove("hidden");

  $("mensajeVacio").classList.add("hidden");
  $("timeline").classList.remove("hidden");

  modo = "video";

  $("nombreProyecto").textContent =
    "Editor de videos";

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
  if (!Number.isFinite(segundos)) return "00:00";

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

  if (!exportando && video.duration) {
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
    !Number.isFinite(inicio) ||
    !Number.isFinite(fin) ||
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

/* ============================================
   DIBUJAR PROYECTO PARA EXPORTAR
============================================ */

function esperarImagen(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = reject;

    img.src = src;
  });
}

function dibujarElemento(ctx, e, imagen = null) {
  ctx.save();

  ctx.translate(
    e.x + e.w / 2,
    e.y + e.h / 2
  );

  ctx.rotate(e.rotacion * Math.PI / 180);

  ctx.translate(-e.w / 2, -e.h / 2);

  if (e.tipo === "imagen" && imagen) {
    ctx.filter = `
      brightness(${e.brillo}%)
      contrast(${e.contraste}%)
      saturate(${e.saturacion}%)
      blur(${e.blur}px)
      ${e.extra || ""}
    `;

    ctx.drawImage(imagen, 0, 0, e.w, e.h);
    ctx.filter = "none";
  }

  if (e.tipo === "rect") {
    ctx.fillStyle = e.color;
    ctx.fillRect(0, 0, e.w, e.h);
  }

  if (e.tipo === "circle") {
    ctx.fillStyle = e.color;
    ctx.beginPath();

    ctx.ellipse(
      e.w / 2,
      e.h / 2,
      e.w / 2,
      e.h / 2,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  if (e.tipo === "texto") {
    ctx.fillStyle = e.color;
    ctx.font = `bold ${e.tamano}px Arial`;
    ctx.textBaseline = "top";

    e.contenido.split("\n").forEach((linea, i) => {
      ctx.fillText(
        linea,
        0,
        i * e.tamano * 1.2,
        e.w
      );
    });
  }

  ctx.restore();
}

async function dibujarProyecto(ctx) {
  ctx.clearRect(0, 0, ANCHO, ALTO);

  ctx.fillStyle =
    modo === "diseno" ? "#ffffff" : "#252b36";

  ctx.fillRect(0, 0, ANCHO, ALTO);

  for (const e of elementos) {
    const imagen =
      e.tipo === "imagen"
        ? await esperarImagen(e.src)
        : null;

    dibujarElemento(ctx, e, imagen);
  }
}

/* ============================================
   DESCARGAR ARCHIVOS
============================================ */

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

  canvas.width = ANCHO;
  canvas.height = ALTO;

  const ctx = canvas.getContext("2d");

  await dibujarProyecto(ctx);

  const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, "image/png");
  });

  if (!blob) {
    throw new Error("No se pudo generar el PNG");
  }

  descargarBlob(blob, "nova-studio.png");

  estado("Imagen exportada correctamente");
}

/* ============================================
   EXPORTACIÓN EXPERIMENTAL DE VIDEO
============================================ */

async function exportarVideo() {
  if (!videoURL || exportando) return;

  if (
    !window.MediaRecorder ||
    !HTMLCanvasElement.prototype.captureStream
  ) {
    alert("Tu navegador no admite esta exportación.");
    return;
  }

  const tipo = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm"
  ].find(t => MediaRecorder.isTypeSupported(t));

  if (!tipo) {
    alert("Este navegador no admite exportar WebM.");
    return;
  }

  exportando = true;
  video.pause();

  const canvas = document.createElement("canvas");

  canvas.width = ANCHO;
  canvas.height = ALTO;

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
    stream.getTracks().forEach(track => track.stop());

    if (partes.length > 0) {
      descargarBlob(
        new Blob(partes, { type: tipo }),
        "nova-video.webm"
      );

      estado("Video exportado");
    }

    exportando = false;
  };

  try {
    estado("Preparando exportación...");

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
      ctx.fillRect(0, 0, ANCHO, ALTO);

      if (video.readyState >= 2) {
        ctx.drawImage(
          video,
          0,
          0,
          ANCHO,
          ALTO
        );
      }

      elementos.forEach(e => {
        dibujarElemento(ctx, e, mapa.get(e.id));
      });
    }

    video.currentTime = inicioRecorte;

    await new Promise(resolve => {
      if (
        Math.abs(video.currentTime - inicioRecorte) < 0.05
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

    if (recorder.state === "recording") {
      recorder.stop();
    }

  } catch (error) {
    console.error(error);

    video.pause();

    if (recorder.state === "recording") {
      recorder.stop();
    } else {
      stream.getTracks().forEach(track => track.stop());
      exportando = false;
    }

    estado("Error al exportar");
    alert("No se pudo exportar este video.");
  }
}

/* ============================================
   EXPORTACIÓN GENERAL
============================================ */

function descargar() {
  if ($("editor").classList.contains("hidden")) {
    alert("Primero abrí un editor.");
    return;
  }

  if (modo === "video" && videoURL) {
    exportarVideo();
  } else {
    descargarImagen().catch(error => {
      console.error(error);
      alert("No se pudo exportar la imagen.");
    });
  }
}

/* ============================================
   GUARDAR PROYECTOS
============================================ */

function guardarProyecto() {
  const proyecto = {
    version: 2,
    nombre: $("nombreProyecto").textContent,
    modo,
    ancho: ANCHO,
    alto: ALTO,
    elementos
  };

  const blob = new Blob(
    [JSON.stringify(proyecto, null, 2)],
    { type: "application/json" }
  );

  descargarBlob(blob, "nova-proyecto.json");

  if (videoURL) {
    alert(
      "Se guardaron las capas. Conservá el video " +
      "original por separado."
    );
  }

  estado("Proyecto guardado");
}

/* ============================================
   ATAJOS
============================================ */

document.addEventListener("keydown", evento => {
  const etiqueta = document.activeElement.tagName;

  if (
    ["INPUT", "TEXTAREA", "SELECT"].includes(etiqueta)
  ) return;

  if (
    evento.key === "Delete" ||
    evento.key === "Backspace"
  ) {
    eliminarSeleccion();
  }

  if (
    (evento.ctrlKey || evento.metaKey) &&
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
    (evento.ctrlKey || evento.metaKey) &&
    evento.key.toLowerCase() === "y"
  ) {
    evento.preventDefault();
    rehacer();
  }
});

/* ============================================
   INICIALIZACIÓN
============================================ */

actualizarEtiquetas();
estado("NOVA STUDIO está listo");
