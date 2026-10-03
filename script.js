/* =====================================================
   CHINAMARKET SCOUT
===================================================== */


/* =====================================================
   PRODUCTOS
===================================================== */

const products = [

    {
        id:1,
        name:"Bolsa para lavar zapatillas",
        category:"Lavandería",
        icon:"👟",
        mlPrice:19999,
        factory:1.00,
        moq:20,
        demand:82,
        competition:55,
        reason:"Es pequeña, fácil de almacenar y resuelve un problema concreto.",
        risk:"Hay bastante competencia, por lo que la publicación debe diferenciarse."
    },

    {
        id:2,
        name:"Organizador de asiento para auto",
        category:"Auto",
        icon:"🚗",
        mlPrice:14890,
        factory:1.30,
        moq:4,
        demand:86,
        competition:67,
        reason:"Producto práctico para mantener objetos organizados dentro del vehículo.",
        risk:"Existen muchos modelos similares."
    },

    {
        id:3,
        name:"Organizador plegable de cajones",
        category:"Hogar",
        icon:"🗄️",
        mlPrice:12990,
        factory:.85,
        moq:50,
        demand:76,
        competition:58,
        reason:"Permite ordenar ropa y objetos pequeños y se puede demostrar fácilmente con fotos.",
        risk:"La diferenciación visual es importante."
    },

    {
        id:4,
        name:"Bolsas de almacenamiento al vacío",
        category:"Hogar",
        icon:"🧳",
        mlPrice:13990,
        factory:.30,
        moq:10,
        demand:73,
        competition:51,
        reason:"Producto compacto y útil para ahorrar espacio.",
        risk:"Hay que controlar la calidad y el tamaño."
    },

    {
        id:5,
        name:"Kit de bandas elásticas",
        category:"Fitness",
        icon:"🏋️",
        mlPrice:19990,
        factory:1.75,
        moq:50,
        demand:84,
        competition:79,
        reason:"Producto versátil y fácil de mostrar en contenido.",
        risk:"Competencia elevada."
    },

    {
        id:6,
        name:"Rascador compacto para gatos",
        category:"Mascotas",
        icon:"🐱",
        mlPrice:15990,
        factory:2.60,
        moq:2,
        demand:69,
        competition:54,
        reason:"Resuelve una necesidad clara de los dueños de gatos.",
        risk:"El tamaño puede aumentar los costos logísticos."
    },

    {
        id:7,
        name:"Organizador de ducha",
        category:"Hogar",
        icon:"🚿",
        mlPrice:20699,
        factory:2.00,
        moq:50,
        demand:71,
        competition:62,
        reason:"Permite aprovechar mejor el espacio del baño.",
        risk:"Existen numerosos modelos."
    },

    {
        id:8,
        name:"Alfombra de baño antideslizante",
        category:"Hogar",
        icon:"🛁",
        mlPrice:10990,
        factory:1.97,
        moq:50,
        demand:68,
        competition:63,
        reason:"Producto cotidiano con utilidad inmediata.",
        risk:"Puede ocupar bastante volumen."
    },

    {
        id:9,
        name:"Organizador de baúl plegable",
        category:"Auto",
        icon:"🚙",
        mlPrice:16468,
        factory:2.50,
        moq:10,
        demand:79,
        competition:65,
        reason:"Permite ordenar el baúl y se puede plegar cuando no se utiliza.",
        risk:"Verificar dimensiones y resistencia."
    },

    {
        id:10,
        name:"Bolsa organizadora para zapatos de viaje",
        category:"Hogar",
        icon:"👞",
        mlPrice:21011,
        factory:.90,
        moq:25,
        demand:63,
        competition:48,
        reason:"Liviana y sencilla de almacenar.",
        risk:"Puede tener una demanda más estacional."
    },

    {
        id:11,
        name:"Cesto organizador pequeño",
        category:"Hogar",
        icon:"🧺",
        mlPrice:6800,
        factory:.70,
        moq:50,
        demand:64,
        competition:70,
        reason:"Producto económico y fácil de utilizar.",
        risk:"El precio de venta bajo deja menos margen para gastos."
    },

    {
        id:12,
        name:"Alfombra rascadora para gatos",
        category:"Mascotas",
        icon:"🐈",
        mlPrice:13500,
        factory:1.80,
        moq:20,
        demand:66,
        competition:57,
        reason:"Producto destinado al entretenimiento y cuidado de mascotas.",
        risk:"Comprobar calidad del material."
    },

    {
        id:13,
        name:"Organizador de escritorio",
        category:"Oficina",
        icon:"🖥️",
        mlPrice:12990,
        factory:1.20,
        moq:50,
        demand:67,
        competition:64,
        reason:"Producto sencillo para organizar escritorios.",
        risk:"Existe bastante variedad de diseños."
    },

    {
        id:14,
        name:"Pack de bolsas para zapatos",
        category:"Hogar",
        icon:"👟",
        mlPrice:21011,
        factory:.85,
        moq:25,
        demand:61,
        competition:49,
        reason:"El formato pack aumenta el valor percibido.",
        risk:"Comparar calidad y tamaños."
    },

    {
        id:15,
        name:"Bolsa de lavado para ropa delicada",
        category:"Lavandería",
        icon:"🧼",
        mlPrice:5200,
        factory:.35,
        moq:50,
        demand:70,
        competition:61,
        reason:"Pequeña y fácil de almacenar.",
        risk:"El precio bajo hace que las comisiones pesen más."
    }

];


/* =====================================================
   CONFIGURACIÓN
===================================================== */

let config = {

    usd:1540,

    shipping:2,

    importTax:20,

    commission:15

};


/* =====================================================
   ESTADO
===================================================== */

let state = {

    search:"",

    category:"Todos",

    status:"all",

    sort:"margin",

    minMargin:0,

    minDemand:0,

    onlyOpportunities:false

};


let favorites =
    JSON.parse(
        localStorage.getItem("cm_favorites") || "[]"
    );


let cart =
    JSON.parse(
        localStorage.getItem("cm_cart") || "[]"
    );


/* =====================================================
   UTILIDADES
===================================================== */

function money(value){

    return new Intl.NumberFormat(
        "es-AR",
        {
            style:"currency",
            currency:"ARS",
            maximumFractionDigits:0
        }
    ).format(value);

}


function calculate(product){

    const productCost =
        product.factory * config.usd;

    const shipping =
        config.shipping * config.usd;

    const importTax =
        (productCost + shipping) *
        config.importTax / 100;

    const totalCost =
        productCost +
        shipping +
        importTax;

    const commission =
        product.mlPrice *
        config.commission / 100;

    const profit =
        product.mlPrice -
        totalCost -
        commission;

    const margin =
        profit /
        product.mlPrice *
        100;

    return {

        productCost,

        shipping,

        importTax,

        totalCost,

        commission,

        profit,

        margin

    };

}


function getStatus(margin){

    if(margin >= 30)
        return "green";

    if(margin >= 20)
        return "yellow";

    if(margin >= 10)
        return "orange";

    return "red";

}


function getStatusText(status){

    const texts = {

        green:"🟢 BUENA OPORTUNIDAD",

        yellow:"🟡 PARA ANALIZAR",

        orange:"🟠 PRECAUCIÓN",

        red:"🔴 DESCARTAR"

    };

    return texts[status];

}


/* =====================================================
   IMAGEN SVG
===================================================== */

function createSVG(product){

    return `

    <svg
        viewBox="0 0 600 380"
        xmlns="http://www.w3.org/2000/svg">

        <defs>

            <linearGradient
                id="gradient${product.id}"
                x1="0"
                y1="0"
                x2="1"
                y2="1">

                <stop
                    offset="0%"
                    stop-color="#ffffff"/>

                <stop
                    offset="100%"
                    stop-color="#eeeeee"/>

            </linearGradient>

        </defs>


        <rect
            width="600"
            height="380"
            fill="url(#gradient${product.id})"/>


        <circle
            cx="490"
            cy="70"
            r="110"
            fill="#3483fa"
            opacity=".05"/>


        <circle
            cx="80"
            cy="330"
            r="130"
            fill="#ffe600"
            opacity=".08"/>


        <rect
            x="160"
            y="50"
            width="280"
            height="230"
            rx="25"
            fill="white"
            stroke="#ddd"
            stroke-width="2"/>


        <text
            x="300"
            y="205"
            text-anchor="middle"
            font-size="105">

            ${product.icon}

        </text>


        <text
            x="300"
            y="325"
            text-anchor="middle"
            font-size="18"
            font-family="Arial"
            fill="#444"
            font-weight="bold">

            ${product.name.substring(0,35)}

        </text>

    </svg>

    `;

}


/* =====================================================
   FILTRADO
===================================================== */

function getFilteredProducts(){

    let result =
        products.filter(product => {

            const calc =
                calculate(product);

            const status =
                getStatus(calc.margin);


            const searchMatch =
                product.name
                    .toLowerCase()
                    .includes(
                        state.search.toLowerCase()
                    );


            const categoryMatch =
                state.category === "Todos" ||
                product.category === state.category;


            const statusMatch =
                state.status === "all" ||
                state.status === status;


            const marginMatch =
                calc.margin >= state.minMargin;


            const demandMatch =
                product.demand >= state.minDemand;


            const opportunityMatch =
                !state.onlyOpportunities ||
                status === "green";


            return (
                searchMatch &&
                categoryMatch &&
                statusMatch &&
                marginMatch &&
                demandMatch &&
                opportunityMatch
            );

        });


    result.sort((a,b)=>{

        const ca = calculate(a);
        const cb = calculate(b);


        switch(state.sort){

            case "margin":
                return cb.margin - ca.margin;

            case "demand":
                return b.demand - a.demand;

            case "priceLow":
                return a.mlPrice - b.mlPrice;

            case "priceHigh":
                return b.mlPrice - a.mlPrice;

            case "competition":
                return a.competition - b.competition;

        }

    });


    return result;

}


/* =====================================================
   RENDER PRODUCTOS
===================================================== */

function renderProducts(){

    const grid =
        document.getElementById("productsGrid");

    const empty =
        document.getElementById("emptyState");

    const result =
        getFilteredProducts();


    grid.innerHTML = "";


    document.getElementById("resultsText")
        .textContent =
        `${result.length} productos`;


    if(result.length === 0){

        empty.classList.remove("hidden");

        return;

    }


    empty.classList.add("hidden");


    result.forEach(product => {

        const calc =
            calculate(product);

        const status =
            getStatus(calc.margin);


        const isFavorite =
            favorites.includes(product.id);


        const isSelected =
            cart.includes(product.id);


        const card =
            document.createElement("article");


        card.className =
            "product-card";


        let marginClass =
            calc.margin >= 30
                ? "margin-good"
                : calc.margin >= 20
                ? "margin-warning"
                : "margin-bad";


        card.innerHTML = `

        <div class="product-image">

            <span class="
                status-badge
                status-${status}
            ">

                ${getStatusText(status)}

            </span>


            <button
                class="
                    favorite
                    ${isFavorite ? "active" : ""}
                "
                onclick="toggleFavorite(${product.id})">

                ${isFavorite ? "♥" : "♡"}

            </button>


            ${createSVG(product)}

        </div>


        <div class="product-body">

            <div class="product-category">

                ${product.category}

            </div>


            <h3 class="product-title">

                ${product.name}

            </h3>


            <div class="product-price">

                ${money(product.mlPrice)}

            </div>


            <div class="installments">

                Envío y costos calculados
                automáticamente

            </div>


            <div class="product-divider"></div>


            <div class="product-data">

                <div class="data">

                    <span>
                        MARGEN ESTIMADO
                    </span>

                    <strong class="${marginClass}">
                        ${calc.margin.toFixed(1)}%
                    </strong>

                </div>


                <div class="data">

                    <span>
                        FÁBRICA 🇨🇳
                    </span>

                    <strong>
                        US$ ${product.factory.toFixed(2)}
                    </strong>

                </div>


                <div class="data">

                    <span>
                        DEMANDA
                    </span>

                    <strong>
                        ${product.demand}/100
                    </strong>

                </div>


                <div class="data">

                    <span>
                        COMPETENCIA
                    </span>

                    <strong>
                        ${product.competition}/100
                    </strong>

                </div>

            </div>


            <div class="product-reason">

                <strong>
                    ¿Por qué?
                </strong>

                ${product.reason}

            </div>


            <div class="product-actions">

                <button
                    class="details-button"
                    onclick="openProduct(${product.id})">

                    Ver estadísticas

                </button>


                <button
                    class="
                        select-button
                        ${isSelected ? "selected" : ""}
                    "
                    onclick="toggleCart(${product.id})">

                    ${isSelected
                        ? "✓ Seleccionado"
                        : "+ Seleccionar"}

                </button>

            </div>

        </div>

        `;


        grid.appendChild(card);

    });


    updateCounters();

}


/* =====================================================
   FAVORITOS
===================================================== */

function toggleFavorite(id){

    if(favorites.includes(id)){

        favorites =
            favorites.filter(
                item => item !== id
            );

    }else{

        favorites.push(id);

    }


    localStorage.setItem(
        "cm_favorites",
        JSON.stringify(favorites)
    );


    renderProducts();

    updateCounters();

}


function openFavorites(){

    const modal =
        document.getElementById(
            "favoritesModal"
        );

    const content =
        document.getElementById(
            "favoritesContent"
        );


    const favoriteProducts =
        products.filter(
            p => favorites.includes(p.id)
        );


    if(favoriteProducts.length === 0){

        content.innerHTML = `

            <div class="empty-list">

                ♡

                <br><br>

                Todavía no agregaste favoritos.

            </div>

        `;

    }else{

        content.innerHTML =
            favoriteProducts.map(product => `

            <div class="list-item">

                <div class="list-item-image">

                    ${createSVG(product)}

                </div>

                <div class="list-item-info">

                    <strong>
                        ${product.name}
                    </strong>

                    <span>
                        ${money(product.mlPrice)}
                    </span>

                </div>

                <button
                    class="remove-button"
                    onclick="toggleFavorite(${product.id});openFavorites()">

                    Eliminar

                </button>

            </div>

        `).join("");

    }


    openModal("favoritesModal");

}


/* =====================================================
   SELECCIÓN / CARRITO
===================================================== */

function toggleCart(id){

    if(cart.includes(id)){

        cart =
            cart.filter(
                item => item !== id
            );

    }else{

        cart.push(id);

    }


    localStorage.setItem(
        "cm_cart",
        JSON.stringify(cart)
    );


    renderProducts();

    updateCounters();

}


function openCart(){

    const content =
        document.getElementById(
            "cartContent"
        );


    const selected =
        products.filter(
            p => cart.includes(p.id)
        );


    if(selected.length === 0){

        content.innerHTML = `

            <div class="empty-list">

                🛒

                <br><br>

                No seleccionaste productos todavía.

            </div>

        `;

    }else{

        content.innerHTML =
            selected.map(product => {

                const calc =
                    calculate(product);

                return `

                <div class="list-item">

                    <div class="list-item-image">

                        ${createSVG(product)}

                    </div>

                    <div class="list-item-info">

                        <strong>
                            ${product.name}
                        </strong>

                        <span>
                            Margen:
                            ${calc.margin.toFixed(1)}%
                        </span>

                    </div>

                    <button
                        class="remove-button"
                        onclick="toggleCart(${product.id});openCart()">

                        Quitar

                    </button>

                </div>

                `;

            }).join("");

    }


    openModal("cartModal");

}


/* =====================================================
   MODAL PRODUCTO
===================================================== */

function openProduct(id){

    const product =
        products.find(
            p => p.id === id
        );


    const calc =
        calculate(product);


    const status =
        getStatus(calc.margin);


    const content =
        document.getElementById(
            "modalProductContent"
        );


    content.innerHTML = `

        <div class="modal-product">

            <div class="modal-product-image">

                ${createSVG(product)}

            </div>


            <div class="modal-info">

                <small>
                    ${product.category}
                </small>

                <h2>
                    ${product.name}
                </h2>

                <div class="
                    status-badge
                    status-${status}
                "
                style="display:inline-block">

                    ${getStatusText(status)}

                </div>


                <div class="modal-price">

                    ${money(product.mlPrice)}

                </div>


                <div class="modal-green">

                    Ganancia estimada:
                    ${money(calc.profit)}

                </div>


                <div class="stats-list">

                    <div class="stat-item">

                        <span>
                            MARGEN
                        </span>

                        <strong>
                            ${calc.margin.toFixed(1)}%
                        </strong>

                    </div>


                    <div class="stat-item">

                        <span>
                            PRECIO FÁBRICA
                        </span>

                        <strong>
                            US$ ${product.factory.toFixed(2)}
                        </strong>

                    </div>


                    <div class="stat-item">

                        <span>
                            COSTO PRODUCTO
                        </span>

                        <strong>
                            ${money(calc.productCost)}
                        </strong>

                    </div>


                    <div class="stat-item">

                        <span>
                            ENVÍO
                        </span>

                        <strong>
                            ${money(calc.shipping)}
                        </strong>

                    </div>


                    <div class="stat-item">

                        <span>
                            IMPORTACIÓN
                        </span>

                        <strong>
                            ${money(calc.importTax)}
                        </strong>

                    </div>


                    <div class="stat-item">

                        <span>
                            COMISIÓN ML
                        </span>

                        <strong>
                            ${money(calc.commission)}
                        </strong>

                    </div>


                    <div class="stat-item">

                        <span>
                            DEMANDA
                        </span>

                        <strong>
                            ${product.demand}/100
                        </strong>

                    </div>


                    <div class="stat-item">

                        <span>
                            COMPETENCIA
                        </span>

                        <strong>
                            ${product.competition}/100
                        </strong>

                    </div>


                    <div class="stat-item">

                        <span>
                            MOQ
                        </span>

                        <strong>
                            ${product.moq} unidades
                        </strong>

                    </div>


                    <div class="stat-item">

                        <span>
                            INVERSIÓN MOQ
                        </span>

                        <strong>
                            ${money(
                                calc.productCost *
                                product.moq
                            )}
                        </strong>

                    </div>

                </div>

            </div>

        </div>


        <div class="explanation-box">

            <strong>
                💡 ¿Por qué podría funcionar?
            </strong>

            <br>

            ${product.reason}

            <br><br>

            <strong>
                ⚠️ Riesgo
            </strong>

            <br>

            ${product.risk}

            <br><br>

            <strong>
                📊 ¿Por qué tiene este color?
            </strong>

            <br>

            ${getStatusExplanation(calc.margin)}

        </div>

    `;


    openModal("productModal");

}


/* =====================================================
   EXPLICACIÓN DEL COLOR
===================================================== */

function getStatusExplanation(margin){

    if(margin >= 30){

        return `
        El margen estimado es de ${margin.toFixed(1)}%.
        Supera el 30%, por lo que en esta simulación
        aparece como una oportunidad interesante.
        `;

    }


    if(margin >= 20){

        return `
        El margen estimado es de ${margin.toFixed(1)}%.
        Está entre 20% y 29%, por lo que conviene
        analizar los costos reales antes de comprar.
        `;

    }


    if(margin >= 10){

        return `
        El margen estimado es de ${margin.toFixed(1)}%.
        Está entre 10% y 19%, por lo que cualquier
        gasto adicional puede afectar bastante la ganancia.
        `;

    }


    return `
        El margen estimado es inferior al 10%.
        Con esta configuración sería una opción
        poco atractiva para comenzar.
    `;

}


/* =====================================================
   MODALES
===================================================== */

function openModal(id){

    document
        .getElementById(id)
        .classList.add("show");

}


function closeModal(id){

    document
        .getElementById(id)
        .classList.remove("show");

}


document
    .querySelectorAll("[data-close]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                closeModal(
                    button.dataset.close
                );

            }
        );

    });


document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if(event.target === modal){

                    closeModal(modal.id);

                }

            }
        );

    });


/* =====================================================
   CONFIGURACIÓN
===================================================== */

document
    .getElementById("configButton")
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "usdInput"
            ).value = config.usd;


            document.getElementById(
                "shippingInput"
            ).value = config.shipping;


            document.getElementById(
                "importInput"
            ).value = config.importTax;


            document.getElementById(
                "commissionInput"
            ).value = config.commission;


            openModal("configModal");

        }
    );


document
    .getElementById("saveConfig")
    .addEventListener(
        "click",
        () => {

            config.usd =
                Number(
                    document.getElementById(
                        "usdInput"
                    ).value
                );


            config.shipping =
                Number(
                    document.getElementById(
                        "shippingInput"
                    ).value
                );


            config.importTax =
                Number(
                    document.getElementById(
                        "importInput"
                    ).value
                );


            config.commission =
                Number(
                    document.getElementById(
                        "commissionInput"
                    ).value
                );


            closeModal("configModal");

            renderProducts();

            updateDashboard();

        }
    );


/* =====================================================
   BUSCADOR
===================================================== */

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        event => {

            state.search =
                event.target.value;

            renderProducts();

        }
    );


document
    .getElementById("searchButton")
    .addEventListener(
        "click",
        () => {

            state.search =
                document.getElementById(
                    "searchInput"
                ).value;

            renderProducts();

        }
    );


/* ENTER EN BUSCADOR */

document
    .getElementById("searchInput")
    .addEventListener(
        "keydown",
        event => {

            if(event.key === "Enter"){

                renderProducts();

            }

        }
    );


/* =====================================================
   CATEGORÍAS DEL HEADER
===================================================== */

document
    .querySelectorAll(
        ".nav-content button[data-category]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                state.category =
                    button.dataset.category;


                document
                    .querySelector(
                        `input[name="category"][value="${state.category}"]`
                    )
                    ?.click();


                renderProducts();

            }
        );

    });


/* =====================================================
   CATEGORÍAS SIDEBAR
===================================================== */

document
    .querySelectorAll(
        'input[name="category"]'
    )
    .forEach(input => {

        input.addEventListener(
            "change",
            event => {

                state.category =
                    event.target.value;

                renderProducts();

            }
        );

    });


/* =====================================================
   FILTROS DE COLOR
===================================================== */

document
    .querySelectorAll(
        ".filter"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".filter"
                    )
                    .forEach(
                        b => b.classList.remove("active")
                    );


                button.classList.add("active");


                state.status =
                    button.dataset.status;


                renderProducts();

            }
        );

    });


/* =====================================================
   ORDENAR
===================================================== */

document
    .getElementById("sortSelect")
    .addEventListener(
        "change",
        event => {

            state.sort =
                event.target.value;

            renderProducts();

        }
    );


/* =====================================================
   MARGEN RANGE
===================================================== */

document
    .getElementById("marginRange")
    .addEventListener(
        "input",
        event => {

            state.minMargin =
                Number(event.target.value);


            document
                .getElementById("marginValue")
                .textContent =
                `${state.minMargin}%`;


            renderProducts();

        }
    );


/* =====================================================
   DEMANDA RANGE
===================================================== */

document
    .getElementById("demandRange")
    .addEventListener(
        "input",
        event => {

            state.minDemand =
                Number(event.target.value);


            document
                .getElementById("demandValue")
                .textContent =
                `${state.minDemand}/100`;


            renderProducts();

        }
    );


/* =====================================================
   SOLO OPORTUNIDADES
===================================================== */

document
    .getElementById("onlyOpportunities")
    .addEventListener(
        "change",
        event => {

            state.onlyOpportunities =
                event.target.checked;

            renderProducts();

        }
    );


/* =====================================================
   LIMPIAR FILTROS
===================================================== */

function clearFilters(){

    state.search = "";

    state.category = "Todos";

    state.status = "all";

    state.minMargin = 0;

    state.minDemand = 0;

    state.onlyOpportunities = false;


    document.getElementById(
        "searchInput"
    ).value = "";


    document.querySelector(
        'input[name="category"][value="Todos"]'
    ).checked = true;


    document.getElementById(
        "marginRange"
    ).value = 0;


    document.getElementById(
        "demandRange"
    ).value = 0;


    document.getElementById(
        "marginValue"
    ).textContent = "0%";


    document.getElementById(
        "demandValue"
    ).textContent = "0/100";


    document.getElementById(
        "onlyOpportunities"
    ).checked = false;


    document
        .querySelectorAll(".filter")
        .forEach(
            b => b.classList.remove("active")
        );


    document
        .querySelector(".filter")
        .classList.add("active");


    renderProducts();

}


document
    .getElementById("clearFilters")
    .addEventListener(
        "click",
        clearFilters
    );


document
    .getElementById("emptyClear")
    .addEventListener(
        "click",
        clearFilters
    );


/* =====================================================
   HERO
===================================================== */

document
    .getElementById("heroButton")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("productsGrid")
                .scrollIntoView({
                    behavior:"smooth"
                });

        }
    );


/* =====================================================
   FAVORITOS / CARRITO
===================================================== */

document
    .getElementById("favoritesButton")
    .addEventListener(
        "click",
        openFavorites
    );


document
    .getElementById("cartButton")
    .addEventListener(
        "click",
        openCart
    );


/* =====================================================
   CONTADORES
===================================================== */

function updateCounters(){

    document.getElementById(
        "favoriteCount"
    ).textContent =
        favorites.length;


    document.getElementById(
        "cartCount"
    ).textContent =
        cart.length;

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard(){

    let totalMargin = 0;

    let bestMargin = -Infinity;

    let opportunities = 0;


    products.forEach(product => {

        const calc =
            calculate(product);


        totalMargin += calc.margin;


        if(calc.margin > bestMargin){

            bestMargin =
                calc.margin;

        }


        if(calc.margin >= 30){

            opportunities++;

        }

    });


    const average =
        totalMargin /
        products.length;


    document.getElementById(
        "heroProducts"
    ).textContent =
        products.length;


    document.getElementById(
        "heroMargin"
    ).textContent =
        bestMargin.toFixed(1) + "%";


    document.getElementById(
        "heroOpportunities"
    ).textContent =
        opportunities;

}


/* =====================================================
   INICIALIZAR
===================================================== */

renderProducts();

updateDashboard();

updateCounters();
