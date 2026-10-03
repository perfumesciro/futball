/*
====================================================
MERCADO SCOUT
DATOS OBSERVADOS / VERIFICADOS
====================================================

IMPORTANTE:

"price"       = precio observado
"sales"       = ventas visibles
"rating"      = valoración visible

Estos datos NO son inventados dentro del programa.

"factoryPrice" NO se usa para fingir un margen real
si todavía no tenemos una cotización concreta del
proveedor para exactamente el mismo producto.

====================================================
*/


const products = [

  {
    id: 1,

    name:
      "Bolsa para lavar zapatillas en lavarropas",

    price: 9125,

    sales: 5000,

    rating: 4.7,

    opinions: null,

    category: "lavanderia",

    icon: "👟",

    verified:
      "Mercado Libre: +5.000 vendidos",

    source:
      "https://listado.mercadolibre.com.ar/hogar-muebles-jardin/cuidado-hogar-lavanderia/accesorios-lavanderia/bolsas-lavar-ropa/"
  },


  {
    id: 2,

    name:
      "Bolsa para lavar zapatillas reutilizable",

    price: 7998,

    sales: 1000,

    rating: 4.8,

    opinions: null,

    category: "lavanderia",

    icon: "🧺",

    verified:
      "Mercado Libre: +1.000 vendidos",

    source:
      "https://listado.mercadolibre.com.ar/hogar-muebles-jardin/cuidado-hogar-lavanderia/accesorios-lavanderia/bolsas-lavar-ropa/"
  },


  {
    id: 3,

    name:
      "Bolsa protectora para lavar zapatillas",

    price: 10430,

    sales: 10000,

    rating: null,

    opinions: null,

    category: "lavanderia",

    icon: "👟",

    verified:
      "Mercado Libre: +10.000 vendidos",

    source:
      "https://listado.mercadolibre.com.ar/hogar-muebles-jardin/cuidado-hogar-lavanderia/accesorios-lavanderia/bolsas-lavar-ropa/"
  },


  {
    id: 4,

    name:
      "Organizador de asiento trasero para auto",

    price: 12738,

    sales: 500,

    rating: 4.4,

    opinions: 184,

    category: "auto",

    icon: "🚗",

    verified:
      "Mercado Libre: +500 vendidos / 184 opiniones",

    source:
      "https://articulo.mercadolibre.com.ar/MLA-1128931168-organizador-asiento-trasero-auto-multiuso-_JM"
  },


  {
    id: 5,

    name:
      "Organizador multifunción para asiento de auto",

    price: 14061,

    sales: 100,

    rating: null,

    opinions: null,

    category: "auto",

    icon: "🚙",

    verified:
      "Mercado Libre: +100 vendidos",

    source:
      "https://www.mercadolibre.com.ar/organizador-auto-asiento-porta-tablet-multifuncion-nacional/p/MLA73661196"
  },


  {
    id: 6,

    name:
      "Set x2 bolsas de vacío para ropa",

    price: 7152,

    sales: 1000,

    rating: 4.5,

    opinions: 114,

    category: "hogar",

    icon: "🧳",

    verified:
      "Mercado Libre: +1.000 vendidos / 114 opiniones",

    source:
      "https://www.mercadolibre.com.ar/set-x-2-bolsas-de-vacio-manual-para-ropa-80x100-cm-vonne/p/MLA32095796"
  },


  {
    id: 7,

    name:
      "Bolsa para lavar ropa / zapatillas",

    price: 19999,

    sales: 1000,

    rating: null,

    opinions: null,

    category: "lavanderia",

    icon: "🫧",

    verified:
      "Mercado Libre: +1.000 ventas",

    source:
      "https://www.mercadolibre.com.ar/bolsa-para-lavar-zapatillas--ropa-30-x-18-cm/up/MLAU3733827701"
  },


  {
    id: 8,

    name:
      "Organizador de asiento para auto",

    price: 7800,

    sales: null,

    rating: null,

    opinions: null,

    category: "auto",

    icon: "🚘",

    verified:
      "Precio observado en comercio",

    source:
      "#"
  },


  {
    id: 9,

    name:
      "Organizador de ducha",

    price: 29997,

    sales: null,

    rating: null,

    opinions: null,

    category: "baño",

    icon: "🚿",

    verified:
      "Precio observado",

    source:
      "#"
  },


  {
    id: 10,

    name:
      "Alfombra de baño",

    price: 10990,

    sales: null,

    rating: null,

    opinions: null,

    category: "baño",

    icon: "🛁",

    verified:
      "Precio observado",

    source:
      "#"
  }

];


let favorites =
  JSON.parse(localStorage.getItem("favorites")) || [];

let selection =
  JSON.parse(localStorage.getItem("selection")) || [];


let currentFilter = "todos";


/*
====================================================
FORMATEAR PESOS
====================================================
*/

function money(value) {

  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }
  ).format(value);

}


/*
====================================================
FORMATEAR VENTAS
====================================================
*/

function salesText(sales) {

  if (!sales) {

    return "No disponible";

  }

  if (sales >= 10000) {

    return "+10.000 vendidos";

  }

  if (sales >= 5000) {

    return "+5.000 vendidos";

  }

  if (sales >= 1000) {

    return "+1.000 vendidos";

  }

  if (sales >= 500) {

    return "+500 vendidos";

  }

  if (sales >= 100) {

    return "+100 vendidos";

  }

  return sales + " vendidos";

}


/*
====================================================
DEMANDA BASADA EN DATOS OBSERVADOS
====================================================

NO inventamos un número 82/100.

Simplemente clasificamos:

+5000 = muy alta
+1000 = alta
+500 = media
+100 = baja/media
sin dato = desconocida

====================================================
*/

function demandLabel(sales) {

  if (!sales) {

    return "Sin dato";

  }

  if (sales >= 5000) {

    return "Muy alta";

  }

  if (sales >= 1000) {

    return "Alta";

  }

  if (sales >= 500) {

    return "Media";

  }

  return "Baja/media";

}


/*
====================================================
IMAGEN
====================================================

Como no tenemos una URL directa y verificable
para todas las fotos de las publicaciones,
NO inventamos una URL CDN.

Mostramos una tarjeta visual hasta que se agregue
la URL directa de la imagen original.

====================================================
*/

function imageHTML(product) {

  return `

    <div class="image-placeholder">

      <strong>
        ${product.icon}
      </strong>

      <span>
        Producto real
      </span>

    </div>

  `;

}


/*
====================================================
RENDER
====================================================
*/

function renderProducts() {

  const container =
    document.getElementById("products");

  const maxPrice =
    Number(
      document.getElementById("priceFilter").value
    );

  const minSales =
    Number(
      document.getElementById("salesFilter").value
    );

  const sort =
    document.getElementById("sortFilter").value;


  let filtered =
    products.filter(product => {

      if (product.price > maxPrice) {

        return false;

      }

      if (
        minSales > 0 &&
        (!product.sales ||
        product.sales < minSales)
      ) {

        return false;

      }

      if (currentFilter === "alto") {

        if (!product.sales ||
            product.sales < 1000) {

          return false;

        }

      }

      if (currentFilter === "medio") {

        if (
          !product.sales ||
          product.sales < 100 ||
          product.sales >= 1000
        ) {

          return false;

        }

      }

      if (currentFilter === "importar") {

        if (
          product.category !== "lavanderia" &&
          product.category !== "auto" &&
          product.category !== "hogar"
        ) {

          return false;

        }

      }

      return true;

    });


  /*
  ORDENAMIENTO
  */

  if (sort === "sales") {

    filtered.sort(
      (a,b) =>
        (b.sales || 0) -
        (a.sales || 0)
    );

  }

  if (sort === "priceLow") {

    filtered.sort(
      (a,b) =>
        a.price -
        b.price
    );

  }

  if (sort === "priceHigh") {

    filtered.sort(
      (a,b) =>
        b.price -
        a.price
    );

  }

  if (sort === "rating") {

    filtered.sort(
      (a,b) =>
        (b.rating || 0) -
        (a.rating || 0)
    );

  }


  document.getElementById("results")
    .textContent =
    filtered.length +
    " productos";


  container.innerHTML = "";


  if (!filtered.length) {

    container.innerHTML = `

      <div style="
        grid-column:1/-1;
        background:white;
        padding:40px;
        text-align:center;
        border-radius:10px;
      ">

        <h3>
          No encontramos productos
        </h3>

        <p>
          Probá cambiando los filtros.
        </p>

      </div>

    `;

    return;

  }


  filtered.forEach(product => {

    const isFavorite =
      favorites.includes(product.id);

    const isSelected =
      selection.includes(product.id);


    container.innerHTML += `

      <article class="card">

        <div class="card-image">

          ${imageHTML(product)}

        </div>


        <div class="card-body">

          <h3>
            ${product.name}
          </h3>


          <div class="price">
            ${money(product.price)}
          </div>


          <div class="sold">

            ${
              product.sales
                ? salesText(product.sales)
                : "Ventas no disponibles"
            }

          </div>


          ${
            product.rating
              ? `
                <div class="rating">

                  ★ ${product.rating}

                  ${
                    product.opinions
                      ? `(${product.opinions} opiniones)`
                      : ""
                  }

                </div>
              `
              : `
                <div class="rating">
                  Valoración no disponible
                </div>
              `
          }


          <div class="stats">

            <div class="stat">

              Demanda observada

              <strong>
                ${demandLabel(product.sales)}
              </strong>

            </div>


            <div class="stat">

              Precio observado

              <strong>
                ${money(product.price)}
              </strong>

            </div>

          </div>


          <div class="data-label">

            ✓ DATO REAL OBSERVADO

          </div>


          <div class="card-buttons">

            <button
              class="details"
              onclick="verProducto(${product.id})"
            >

              Ver estadísticas

            </button>


            <button
              class="favorite ${
                isFavorite ? "active" : ""
              }"
              onclick="toggleFavorite(${product.id})"
            >

              ${
                isFavorite
                  ? "★"
                  : "☆"
              }

            </button>

          </div>

        </div>

      </article>

    `;

  });

}


/*
====================================================
DETALLE
====================================================
*/

function verProducto(id) {

  const product =
    products.find(p => p.id === id);

  if (!product) return;


  const modal =
    document.getElementById("modal");

  const content =
    document.getElementById("modalContent");


  content.innerHTML = `

    <h2>
      ${product.name}
    </h2>


    <div class="modal-grid">

      <div class="modal-stat">

        <span>
          Precio observado
        </span>

        <strong>
          ${money(product.price)}
        </strong>

      </div>


      <div class="modal-stat">

        <span>
          Ventas visibles
        </span>

        <strong>

          ${
            product.sales
              ? salesText(product.sales)
              : "Sin dato"
          }

        </strong>

      </div>


      <div class="modal-stat">

        <span>
          Valoración
        </span>

        <strong>

          ${
            product.rating
              ? "★ " + product.rating
              : "Sin dato"
          }

        </strong>

      </div>


      <div class="modal-stat">

        <span>
          Demanda observada
        </span>

        <strong>
          ${demandLabel(product.sales)}
        </strong>

      </div>

    </div>


    <div class="source">

      <strong>
        Fuente del dato
      </strong>

      <br><br>

      ${product.verified}


      ${
        product.source !== "#"
          ? `
            <br><br>

            <a
              href="${product.source}"
              target="_blank"
            >
              Abrir publicación / fuente →
            </a>
          `
          : ""
      }

    </div>


    <br>


    <p style="
      color:#666;
      line-height:1.6;
    ">

      <strong>Importante:</strong>

      El precio y las ventas son datos observados
      en la fuente indicada. No significa que esas
      ventas correspondan a todo el mercado argentino.

      Tampoco se muestra un margen de ganancia ficticio:
      para calcularlo correctamente necesitamos el costo
      real del proveedor, envío internacional, impuestos,
      comisiones y otros gastos de la operación.

    </p>

  `;


  modal.classList.remove("hidden");

}


/*
====================================================
FAVORITOS
====================================================
*/

function toggleFavorite(id) {

  if (favorites.includes(id)) {

    favorites =
      favorites.filter(
        item => item !== id
      );

  } else {

    favorites.push(id);

  }


  localStorage.setItem(
    "favorites",
    JSON.stringify(favorites)
  );


  renderProducts();

}


/*
====================================================
SELECCIÓN
====================================================
*/

function mostrarSeleccion() {

  const selected =
    products.filter(
      p => selection.includes(p.id)
    );


  document.getElementById("modalContent")
    .innerHTML = `

      <h2>
        ⭐ Mi selección
      </h2>

      ${
        selected.length === 0
          ? `
            <p>
              Todavía no agregaste productos.
            </p>
          `
          :
          selected.map(product => `

            <div style="
              padding:15px;
              border-bottom:1px solid #eee;
            ">

              <strong>
                ${product.name}
              </strong>

              <br>

              ${money(product.price)}

            </div>

          `).join("")
      }

    `;


  document.getElementById("modal")
    .classList.remove("hidden");

}


/*
====================================================
CERRAR MODAL
====================================================
*/

function cerrarModal() {

  document
    .getElementById("modal")
    .classList.add("hidden");

}


/*
====================================================
INFO
====================================================
*/

function mostrarInfo() {

  document.getElementById("modalContent")
    .innerHTML = `

      <h2>
        Sobre los datos
      </h2>

      <p style="
        line-height:1.7;
        color:#555;
      ">

        Esta herramienta separa tres cosas:

        <br><br>

        <strong>1. Datos observados</strong><br>
        Precio, ventas y valoraciones que aparecen
        públicamente en la fuente.

        <br><br>

        <strong>2. Cálculos</strong><br>
        Estadísticas que se obtienen matemáticamente
        a partir de esos datos.

        <br><br>

        <strong>3. Datos que requieren cotización</strong><br>
        Precio de fábrica, transporte internacional,
        impuestos, despacho, almacenamiento y otros
        costos de importación.

        <br><br>

        Por eso no mostramos un margen falso como si
        fuera una ganancia garantizada.

      </p>

    `;


  document
    .getElementById("modal")
    .classList.remove("hidden");

}


/*
====================================================
BUSCAR
====================================================
*/

function buscar() {

  const query =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase()
      .trim();


  const cards =
    document.querySelectorAll(".card");


  cards.forEach(card => {

    const text =
      card.innerText.toLowerCase();

    card.style.display =
      text.includes(query)
        ? ""
        : "none";

  });

}


/*
====================================================
FILTROS
====================================================
*/

function filtrar(tipo) {

  currentFilter = tipo;

  renderProducts();

}


function actualizarPrecio() {

  const value =
    Number(
      document.getElementById("priceFilter").value
    );


  document.getElementById("priceValue")
    .textContent =
    value.toLocaleString("es-AR");


  renderProducts();

}


function limpiarFiltros() {

  document.getElementById("priceFilter")
    .value = 50000;

  document.getElementById("salesFilter")
    .value = 0;

  document.getElementById("sortFilter")
    .value = "sales";

  currentFilter = "todos";

  document.getElementById("priceValue")
    .textContent = "50.000";

  document.getElementById("searchInput")
    .value = "";

  renderProducts();

}


/*
====================================================
INICIALIZAR
====================================================
*/

document.getElementById("totalProducts")
  .textContent = products.length;


document.getElementById("selectionCount")
  .textContent = selection.length;


renderProducts();
