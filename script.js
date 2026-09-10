/* ==========================================
   VARIABLES
========================================== */

let expression = "";

let lastResult = 0;

let memory = 0;

let calculationHistory =
    JSON.parse(localStorage.getItem("calcHistory")) || [];


/* ==========================================
   ELEMENTS
========================================== */

const operationDisplay =
    document.getElementById("operation");

const resultDisplay =
    document.getElementById("result");


/* ==========================================
   SIDEBAR
========================================== */

document
    .querySelectorAll(".menu-btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".menu-btn")
                .forEach(btn =>
                    btn.classList.remove("active")
                );


            document
                .querySelectorAll(".section")
                .forEach(section =>
                    section.classList.remove("active")
                );


            button.classList.add("active");


            const section =
                document.getElementById(
                    button.dataset.section
                );


            section.classList.add("active");


            if (
                button.dataset.section === "history"
            ) {
                renderHistory();
            }

        });

    });


/* ==========================================
   MODE
========================================== */

document
    .getElementById("calculatorMode")
    .addEventListener("change", function () {

        const scientific =
            document.getElementById(
                "scientificButtons"
            );


        const title =
            document.getElementById(
                "calculatorModeTitle"
            );


        if (this.value === "standard") {

            scientific.style.display = "none";

            title.textContent = "Estándar";

        } else {

            scientific.style.display = "grid";

            title.textContent = "Científica";

        }

    });


/* ==========================================
   CALCULATOR
========================================== */

function insertValue(value) {

    if (
        expression === "0" &&
        value !== "."
    ) {
        expression = "";
    }


    expression += value;

    updateDisplay();

}


function insertFunction(func) {

    expression += func;

    updateDisplay();

}


function updateDisplay() {

    operationDisplay.textContent =
        formatExpression(expression) || "0";

}


function formatExpression(text) {

    return text
        .replaceAll("*", "×")
        .replaceAll("/", "÷")
        .replaceAll("sqrt", "√");

}


/* ==========================================
   CLEAR
========================================== */

function clearAll() {

    expression = "";

    lastResult = 0;

    operationDisplay.textContent = "0";

    resultDisplay.textContent = "0";

}


function clearEntry() {

    expression = "";

    operationDisplay.textContent = "0";

}


function backspace() {

    expression =
        expression.slice(0, -1);

    updateDisplay();

}


/* ==========================================
   CONVERSION TO JS
========================================== */

function prepareExpression(exp) {

    let prepared = exp;


    prepared =
        prepared.replaceAll("π", "Math.PI");

    prepared =
        prepared.replaceAll(
            /\be\b/g,
            "Math.E"
        );


    prepared =
        prepared.replaceAll(
            /sin\(/g,
            "sinDeg("
        );

    prepared =
        prepared.replaceAll(
            /cos\(/g,
            "cosDeg("
        );

    prepared =
        prepared.replaceAll(
            /tan\(/g,
            "tanDeg("
        );


    prepared =
        prepared.replaceAll(
            /asin\(/g,
            "asinDeg("
        );

    prepared =
        prepared.replaceAll(
            /acos\(/g,
            "acosDeg("
        );

    prepared =
        prepared.replaceAll(
            /atan\(/g,
            "atanDeg("
        );


    prepared =
        prepared.replaceAll(
            /sqrt\(/g,
            "Math.sqrt("
        );


    prepared =
        prepared.replaceAll(
            /log\(/g,
            "Math.log10("
        );


    prepared =
        prepared.replaceAll(
            /ln\(/g,
            "Math.log("
        );


    prepared =
        prepared.replaceAll("^", "**");


    return prepared;

}


/* ==========================================
   TRIGONOMETRY
========================================== */

function sinDeg(value) {

    return Math.sin(
        value * Math.PI / 180
    );

}


function cosDeg(value) {

    return Math.cos(
        value * Math.PI / 180
    );

}


function tanDeg(value) {

    return Math.tan(
        value * Math.PI / 180
    );

}


function asinDeg(value) {

    return Math.asin(value)
        * 180 / Math.PI;

}


function acosDeg(value) {

    return Math.acos(value)
        * 180 / Math.PI;

}


function atanDeg(value) {

    return Math.atan(value)
        * 180 / Math.PI;

}


/* ==========================================
   CALCULATE
========================================== */

function calculate() {

    if (!expression) return;


    try {

        const prepared =
            prepareExpression(expression);


        const result =
            Function(
                `"use strict";
                return (${prepared})`
            )();


        if (
            !Number.isFinite(result)
        ) {

            throw new Error();

        }


        lastResult =
            normalizeNumber(result);


        resultDisplay.textContent =
            lastResult;


        addHistory(
            expression,
            lastResult
        );


    } catch {

        resultDisplay.textContent =
            "Error";

    }

}


/* ==========================================
   NORMALIZE NUMBERS
========================================== */

function normalizeNumber(number) {

    if (
        Math.abs(number) < 1e-12
    ) {
        return 0;
    }


    const rounded =
        Number(number.toPrecision(12));


    return rounded;

}


/* ==========================================
   SQUARE / CUBE
========================================== */

function square() {

    try {

        const value =
            getCurrentValue();

        const result =
            value ** 2;

        expression =
            result.toString();

        resultDisplay.textContent =
            normalizeNumber(result);

        updateDisplay();

    } catch {

        resultDisplay.textContent =
            "Error";

    }

}


function cube() {

    try {

        const value =
            getCurrentValue();

        const result =
            value ** 3;

        expression =
            result.toString();

        resultDisplay.textContent =
            normalizeNumber(result);

        updateDisplay();

    } catch {

        resultDisplay.textContent =
            "Error";

    }

}


/* ==========================================
   INVERSE
========================================== */

function inverse() {

    try {

        const value =
            getCurrentValue();


        if (value === 0) {

            throw new Error();

        }


        const result =
            1 / value;


        expression =
            result.toString();


        resultDisplay.textContent =
            normalizeNumber(result);


        updateDisplay();

    } catch {

        resultDisplay.textContent =
            "Error";

    }

}


/* ==========================================
   SIGN
========================================== */

function changeSign() {

    try {

        let value =
            getCurrentValue();

        value *= -1;


        expression =
            value.toString();


        resultDisplay.textContent =
            value;


        updateDisplay();

    } catch {

    }

}


/* ==========================================
   CURRENT VALUE
========================================== */

function getCurrentValue() {

    if (!expression) {

        return Number(lastResult);

    }


    const prepared =
        prepareExpression(expression);


    return Function(
        `"use strict";
        return (${prepared})`
    )();

}


/* ==========================================
   FACTORIAL
========================================== */

function factorialCurrent() {

    try {

        const value =
            getCurrentValue();


        if (
            value < 0 ||
            !Number.isInteger(value)
        ) {
            throw new Error();
        }


        let result = 1;


        for (
            let i = 2;
            i <= value;
            i++
        ) {

            result *= i;

        }


        expression =
            result.toString();


        resultDisplay.textContent =
            result;


        updateDisplay();

    } catch {

        resultDisplay.textContent =
            "Error";

    }

}


/* ==========================================
   MEMORY
========================================== */

function memoryClear() {

    memory = 0;

}


function memoryRecall() {

    expression +=
        memory.toString();

    updateDisplay();

}


function memoryAdd() {

    try {

        memory +=
            Number(getCurrentValue());

    } catch {

    }

}


function memorySubtract() {

    try {

        memory -=
            Number(getCurrentValue());

    } catch {

    }

}


/* ==========================================
   FRACTIONS
========================================== */

function gcd(a, b) {

    a = Math.abs(a);

    b = Math.abs(b);


    while (b) {

        const temp = b;

        b = a % b;

        a = temp;

    }


    return a;

}


function simplifyFraction(
    numerator,
    denominator
) {

    const divisor =
        gcd(numerator, denominator);


    return [
        numerator / divisor,
        denominator / divisor
    ];

}


function calculateFraction() {

    const n1 =
        Number(
            document.getElementById(
                "num1"
            ).value
        );


    const d1 =
        Number(
            document.getElementById(
                "den1"
            ).value
        );


    const n2 =
        Number(
            document.getElementById(
                "num2"
            ).value
        );


    const d2 =
        Number(
            document.getElementById(
                "den2"
            ).value
        );


    const operation =
        document.getElementById(
            "fractionOperation"
        ).value;


    const output =
        document.getElementById(
            "fractionResult"
        );


    if (
        !d1 ||
        !d2
    ) {

        output.textContent =
            "El denominador no puede ser 0.";

        return;

    }


    let numerator;

    let denominator;


    if (operation === "+") {

        numerator =
            n1 * d2 +
            n2 * d1;

        denominator =
            d1 * d2;

    }


    if (operation === "-") {

        numerator =
            n1 * d2 -
            n2 * d1;

        denominator =
            d1 * d2;

    }


    if (operation === "*") {

        numerator =
            n1 * n2;

        denominator =
            d1 * d2;

    }


    if (operation === "/") {

        numerator =
            n1 * d2;

        denominator =
            d1 * n2;

    }


    if (denominator === 0) {

        output.textContent =
            "No se puede dividir por 0.";

        return;

    }


    const simplified =
        simplifyFraction(
            numerator,
            denominator
        );


    const decimal =
        numerator / denominator;


    output.innerHTML = `
        <strong>
            ${simplified[0]} / ${simplified[1]}
        </strong>
        <br>
        Decimal:
        ${normalizeNumber(decimal)}
    `;

}


/* ==========================================
   PERCENTAGES
========================================== */

function calculatePercentage() {

    const percentage =
        Number(
            document.getElementById(
                "percentageValue"
            ).value
        );


    const number =
        Number(
            document.getElementById(
                "percentageNumber"
            ).value
        );


    const result =
        number * percentage / 100;


    document.getElementById(
        "percentageResult"
    ).textContent =
        `${percentage}% de ${number} = ${result}`;

}


function calculateIncrease() {

    const value =
        Number(
            document.getElementById(
                "increaseValue"
            ).value
        );


    const percentage =
        Number(
            document.getElementById(
                "increasePercent"
            ).value
        );


    const result =
        value +
        value * percentage / 100;


    document.getElementById(
        "increaseResult"
    ).textContent =
        `Resultado: ${result}`;

}


function calculateDiscount() {

    const value =
        Number(
            document.getElementById(
                "discountPrice"
            ).value
        );


    const percentage =
        Number(
            document.getElementById(
                "discountPercent"
            ).value
        );


    const discount =
        value * percentage / 100;


    const result =
        value - discount;


    document.getElementById(
        "discountResult"
    ).innerHTML = `
        Descuento:
        ${discount}
        <br>

        Precio final:
        <strong>
            ${result}
        </strong>
    `;

}


/* ==========================================
   EQUATIONS
========================================== */

function solveEquation() {

    const a =
        Number(
            document.getElementById(
                "equationA"
            ).value
        );


    const b =
        Number(
            document.getElementById(
                "equationB"
            ).value
        );


    const c =
        Number(
            document.getElementById(
                "equationC"
            ).value
        );


    const output =
        document.getElementById(
            "equationResult"
        );


    const steps =
        document.getElementById(
            "equationSteps"
        );


    if (a === 0) {

        output.textContent =
            "No es una ecuación válida.";

        steps.innerHTML = "";

        return;

    }


    const rightSide =
        c - b;


    const x =
        rightSide / a;


    output.textContent =
        `x = ${normalizeNumber(x)}`;


    steps.innerHTML = `

        <strong>Procedimiento</strong>

        <br><br>

        ${a}x + ${b} = ${c}

        <br>

        ${a}x =
        ${c} - ${b}

        <br>

        ${a}x =
        ${rightSide}

        <br>

        x =
        ${rightSide} ÷ ${a}

        <br>

        <strong>
            x =
            ${normalizeNumber(x)}
        </strong>

    `;

}


/* ==========================================
   GEOMETRY
========================================== */

function squareGeometry() {

    const side =
        Number(
            document.getElementById(
                "squareSide"
            ).value
        );


    const area =
        side ** 2;


    const perimeter =
        side * 4;


    document.getElementById(
        "squareResult"
    ).innerHTML = `
        Área: ${area}
        <br>
        Perímetro: ${perimeter}
    `;

}


function rectangleGeometry() {

    const base =
        Number(
            document.getElementById(
                "rectangleBase"
            ).value
        );


    const height =
        Number(
            document.getElementById(
                "rectangleHeight"
            ).value
        );


    document.getElementById(
        "rectangleResult"
    ).innerHTML = `

        Área:
        ${base * height}

        <br>

        Perímetro:
        ${2 * (base + height)}

    `;

}


function triangleGeometry() {

    const base =
        Number(
            document.getElementById(
                "triangleBase"
            ).value
        );


    const height =
        Number(
            document.getElementById(
                "triangleHeight"
            ).value
        );


    const area =
        base * height / 2;


    document.getElementById(
        "triangleResult"
    ).textContent =
        `Área: ${area}`;

}


function circleGeometry() {

    const radius =
        Number(
            document.getElementById(
                "circleRadius"
            ).value
        );


    const area =
        Math.PI * radius ** 2;


    const circumference =
        2 * Math.PI * radius;


    document.getElementById(
        "circleResult"
    ).innerHTML = `

        Área:
        ${normalizeNumber(area)}

        <br>

        Circunferencia:
        ${normalizeNumber(circumference)}

    `;

}


function cubeGeometry() {

    const side =
        Number(
            document.getElementById(
                "cubeSide"
            ).value
        );


    document.getElementById(
        "cubeResult"
    ).textContent =
        `Volumen: ${side ** 3}`;

}


function cylinderGeometry() {

    const radius =
        Number(
            document.getElementById(
                "cylinderRadius"
            ).value
        );


    const height =
        Number(
            document.getElementById(
                "cylinderHeight"
            ).value
        );


    const volume =
        Math.PI *
        radius ** 2 *
        height;


    document.getElementById(
        "cylinderResult"
    ).textContent =
        `Volumen: ${normalizeNumber(volume)}`;

}


/* ==========================================
   CONVERTER
========================================== */

const converterUnits = {

    length: {

        mm: 0.001,
        cm: 0.01,
        m: 1,
        km: 1000

    },


    mass: {

        mg: 0.001,
        g: 1,
        kg: 1000

    }

};


function updateConverterUnits() {

    const type =
        document.getElementById(
            "converterType"
        ).value;


    const from =
        document.getElementById(
            "fromUnit"
        );


    const to =
        document.getElementById(
            "toUnit"
        );


    from.innerHTML = "";

    to.innerHTML = "";


    let units;


    if (
        type === "temperature"
    ) {

        units =
            ["C", "F", "K"];

    } else {

        units =
            Object.keys(
                converterUnits[type]
            );

    }


    units.forEach(unit => {

        const option1 =
            document.createElement(
                "option"
            );


        option1.value = unit;

        option1.textContent = unit;


        const option2 =
            option1.cloneNode(true);


        from.appendChild(option1);

        to.appendChild(option2);

    });

}


function convertUnits() {

    const type =
        document.getElementById(
            "converterType"
        ).value;


    const value =
        Number(
            document.getElementById(
                "converterValue"
            ).value
        );


    const from =
        document.getElementById(
            "fromUnit"
        ).value;


    const to =
        document.getElementById(
            "toUnit"
        ).value;


    let result;


    if (
        type === "temperature"
    ) {

        result =
            convertTemperature(
                value,
                from,
                to
            );

    } else {

        const inBase =
            value *
            converterUnits[type][from];


        result =
            inBase /
            converterUnits[type][to];

    }


    document.getElementById(
        "converterResult"
    ).textContent =
        `${value} ${from} = ${normalizeNumber(result)} ${to}`;

}


function convertTemperature(
    value,
    from,
    to
) {

    if (from === to) {

        return value;

    }


    let celsius;


    if (from === "C") {

        celsius = value;

    }


    if (from === "F") {

        celsius =
            (value - 32) * 5 / 9;

    }


    if (from === "K") {

        celsius =
            value - 273.15;

    }


    if (to === "C") {

        return celsius;

    }


    if (to === "F") {

        return (
            celsius * 9 / 5
        ) + 32;

    }


    if (to === "K") {

        return celsius + 273.15;

    }

}


/* ==========================================
   HISTORY
========================================== */

function addHistory(
    operation,
    result
) {

    calculationHistory.unshift({

        operation:
            formatExpression(operation),

        result: result

    });


    calculationHistory =
        calculationHistory.slice(0, 50);


    localStorage.setItem(
        "calcHistory",
        JSON.stringify(
            calculationHistory
        )
    );

}


function renderHistory() {

    const historyList =
        document.getElementById(
            "historyList"
        );


    if (
        calculationHistory.length === 0
    ) {

        historyList.innerHTML = `

            <div class="empty-history">
                Todavía no hiciste ninguna operación.
            </div>

        `;

        return;

    }


    historyList.innerHTML =
        calculationHistory
            .map((item, index) => `

                <div
                    class="history-item"
                    onclick="useHistory(${index})"
                >

                    <div class="history-operation">
                        ${item.operation}
                    </div>

                    <div class="history-result">
                        = ${item.result}
                    </div>

                </div>

            `)
            .join("");

}


function useHistory(index) {

    const item =
        calculationHistory[index];


    expression =
        item.result.toString();


    resultDisplay.textContent =
        item.result;


    updateDisplay();


    document
        .querySelector(
            '[data-section="calculator"]'
        )
        .click();

}


function clearHistory() {

    calculationHistory = [];


    localStorage.removeItem(
        "calcHistory"
    );


    renderHistory();

}


/* ==========================================
   KEYBOARD SUPPORT
========================================== */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key;


        if (
            /^[0-9]$/.test(key)
        ) {

            insertValue(key);

        }


        if (
            ["+", "-", "*", "/", ".", "(", ")"]
                .includes(key)
        ) {

            insertValue(key);

        }


        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();

        }


        if (
            key === "Backspace"
        ) {

            backspace();

        }


        if (
            key === "Escape"
        ) {

            clearAll();

        }

    }
);


/* ==========================================
   INIT
========================================== */

updateConverterUnits();

updateDisplay();
