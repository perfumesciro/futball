
/* =========================================
   ISLA PERDIDA — SISTEMAS DEL JUEGO
   Inventario, supervivencia, fabricación,
   recolección y guardado de partida.
========================================= */

export class SurvivalSystem {
  constructor() {
    this.health = 100;
    this.hunger = 100;
    this.thirst = 100;
    this.stamina = 100;
    this.isDead = false;

    this.inventory = {
      madera: 0,
      piedra: 0,
      fibra: 0,
      bayas: 0,
      agua: 0
    };

    this.recipes = {
      hacha: {
        materials: { madera: 3, piedra: 2, fibra: 1 },
        description: "Una herramienta para conseguir madera."
      },
      fogata: {
        materials: { madera: 5, piedra: 3 },
        description: "Una fogata para iluminar la noche."
      },
      refugio: {
        materials: { madera: 12, fibra: 6 },
        description: "Un refugio básico para protegerte."
      },
      lanza: {
        materials: { madera: 3, piedra: 2, fibra: 2 },
        description: "Una herramienta para defenderte."
      }
    };

    this.craftedItems = {};
    this.elapsedTime = 0;
    this.message = "¡Sobreviví como puedas en la isla!";
  }

  // Actualiza las necesidades del jugador.
  update(deltaSeconds, isRunning = false) {
    if (this.isDead || deltaSeconds <= 0) return;

    this.elapsedTime += deltaSeconds;

    this.hunger = Math.max(
      0,
      this.hunger - deltaSeconds * 0.18
    );

    this.thirst = Math.max(
      0,
      this.thirst - deltaSeconds * 0.30
    );

    if (isRunning) {
      this.stamina = Math.max(
        0,
        this.stamina - deltaSeconds * 12
      );
    } else {
      this.stamina = Math.min(
        100,
        this.stamina + deltaSeconds * 8
      );
    }

    // El hambre y la sed bajas perjudican la salud.
    if (this.hunger <= 0 || this.thirst <= 0) {
      this.health = Math.max(
        0,
        this.health - deltaSeconds * 2
      );
    }

    if (this.health <= 0) {
      this.isDead = true;
      this.message = "Te quedaste sin fuerzas.";
    }
  }

  // Agrega recursos al inventario.
  collect(resource, amount = 1) {
    if (this.isDead) return false;
    if (!Object.hasOwn(this.inventory, resource)) return false;
    if (!Number.isFinite(amount) || amount <= 0) return false;

    amount = Math.floor(amount);
    this.inventory[resource] += amount;

    this.message = `Conseguiste ${amount} de ${resource}.`;
    return true;
  }

  // Comprueba si tenés los materiales necesarios.
  hasMaterials(materials) {
    return Object.entries(materials).every(
      ([resource, amount]) =>
        (this.inventory[resource] ?? 0) >= amount
    );
  }

  // Fabrica un objeto y consume sus materiales.
  craft(itemName) {
    if (this.isDead) {
      this.message = "No podés fabricar mientras estás fuera de combate.";
      return false;
    }

    const recipe = this.recipes[itemName];

    if (!recipe) {
      this.message = "Esa receta no existe.";
      return false;
    }

    if (!this.hasMaterials(recipe.materials)) {
      this.message = "No tenés suficientes materiales.";
      return false;
    }

    for (const [resource, amount] of Object.entries(recipe.materials)) {
      this.inventory[resource] -= amount;
    }

    this.craftedItems[itemName] =
      (this.craftedItems[itemName] || 0) + 1;

    this.message = `¡Fabricaste ${itemName}!`;
    return true;
  }

  // Recupera hambre consumiendo bayas.
  eatBerries() {
    if (this.isDead || this.inventory.bayas < 1) {
      this.message = "No tenés bayas para comer.";
      return false;
    }

    this.inventory.bayas--;
    this.hunger = Math.min(100, this.hunger + 25);
    this.message = "Comiste bayas y recuperaste hambre.";
    return true;
  }

  // Recupera sed consumiendo agua.
  drinkWater() {
    if (this.isDead || this.inventory.agua < 1) {
      this.message = "No tenés agua para beber.";
      return false;
    }

    this.inventory.agua--;
    this.thirst = Math.min(100, this.thirst + 35);
    this.message = "Bebiste agua y recuperaste sed.";
    return true;
  }

  // Recupera salud.
  heal(amount = 20) {
    if (this.isDead || !Number.isFinite(amount) || amount <= 0) {
      return false;
    }

    this.health = Math.min(100, this.health + amount);
    this.message = "Recuperaste salud.";
    return true;
  }

  // Guarda la partida en el navegador.
  save() {
    const data = {
      version: 1,
      health: this.health,
      hunger: this.hunger,
      thirst: this.thirst,
      stamina: this.stamina,
      inventory: this.inventory,
      craftedItems: this.craftedItems,
      elapsedTime: this.elapsedTime
    };

    try {
      localStorage.setItem(
        "islaPerdidaSave",
        JSON.stringify(data)
      );

      this.message = "Partida guardada.";
      return true;
    } catch (error) {
      this.message = "No se pudo guardar la partida.";
      return false;
    }
  }

  // Carga una partida guardada.
  load() {
    try {
      const saved = localStorage.getItem("islaPerdidaSave");

      if (!saved) {
        this.message = "Todavía no hay una partida guardada.";
        return false;
      }

      const data = JSON.parse(saved);

      if (!data || data.version !== 1) {
        this.message = "El archivo de guardado no es válido.";
        return false;
      }

      const validStat = (value) =>
        Number.isFinite(value) && value >= 0 && value <= 100;

      if (
        !validStat(data.health) ||
        !validStat(data.hunger) ||
        !validStat(data.thirst) ||
        !validStat(data.stamina) ||
        !data.inventory ||
        typeof data.inventory !== "object"
      ) {
        this.message = "Los datos guardados están dañados.";
        return false;
      }

      for (const resource of Object.keys(this.inventory)) {
        const amount = data.inventory[resource];

        if (!Number.isSafeInteger(amount) || amount < 0) {
          this.message = "El inventario guardado no es válido.";
          return false;
        }
      }

      this.health = data.health;
      this.hunger = data.hunger;
      this.thirst = data.thirst;
      this.stamina = data.stamina;
      this.inventory = { ...data.inventory };
      this.craftedItems = data.craftedItems || {};
      this.elapsedTime = Math.max(0, data.elapsedTime || 0);
      this.isDead = this.health <= 0;

      this.message = "Partida cargada.";
      return true;
    } catch (error) {
      this.message = "No se pudo cargar la partida.";
      return false;
    }
  }

  // Devuelve una copia de los datos para mostrarlos en pantalla.
  getStatus() {
    return {
      health: this.health,
      hunger: this.hunger,
      thirst: this.thirst,
      stamina: this.stamina,
      inventory: { ...this.inventory },
      craftedItems: { ...this.craftedItems },
      isDead: this.isDead,
      message: this.message
    };
  }
}

// Crea el sistema para usarlo desde game.js.
export const survival = new SurvivalSystem();
