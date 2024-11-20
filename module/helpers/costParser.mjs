export /**
 * Parses the action cost string into a structured format.
 * @param {string} costString - The action cost string to parse.
 * @returns {Object[]} An array of cost objects with 'resource' and 'amount'.
 */
function parseActionCost(costString) {
  const costs = [];
  const cleanedInput = costString.replace(/\s+/g, " ").trim().toLowerCase();

  if (!cleanedInput) return costs; // Return an empty array for empty or invalid input

  // Split by commas or 'or'
  const sections = cleanedInput.split(/,\s*|\s+or\s+/);

  for (const section of sections) {
    try {
      // Handling 'Free' cost
      if (section === "free") {
        costs.push({ resource: "free", amount: null });
        continue;
      }

      // Handling multi-word tokens (e.g., '3 Speed Tokens')
      const multiWordMatch = section.match(
        /(\d\d*).*(speed|iron|power|weakness|burning|hp|basic|other) tokens/i,
      );
      if (multiWordMatch) {
        const amount = parseInt(multiWordMatch[1], 10);
        const resource = multiWordMatch[2].toLowerCase();
        costs.push({ resource, amount });
        continue;
      }

      // Handling specific tokens (e.g., '-1 Burn', '-2 HP')
      const tokenMatch = section.match(
        /(\d\d*).*(speed|iron|power|weakness|burning|hp|basic|other)/i,
      );
      if (tokenMatch) {
        const amount = parseInt(tokenMatch[1], 10);
        const resource = tokenMatch[2].toLowerCase();
        costs.push({ resource, amount });
        continue;
      }

      // Handling phrases like 'Destroy 1 Copy' or 'Gain 1 Burning Token'
      const actionMatch = section.match(/(destroy|gain)\s*(\d\d*)\s*(copy|burning token)/i);
      if (actionMatch) {
        const amount = parseInt(actionMatch[2], 10);
        const resource = actionMatch[3] ? actionMatch[3].toLowerCase() : null;
        costs.push({ resource, amount });
        continue;
      }

      // Handling dice (e.g., 'd6', '4', '5')
      const diceMatch = section.match(/(\d\d*)+/i);
      if (diceMatch) {
        const amount = diceMatch[1];
        costs.push({ resource: "dice", amount });
        continue;
      }

      if (section.match(/X/i)) {
        costs.push({
          resource: "dice",
          amount: "X",
        });
        continue;
      }

      // Handle any other unexpected format
      console.warn(`Unrecognized cost format: "${section}"`);
    } catch (error) {
      console.error(`Error parsing section "${section}":`, error);
    }
  }

  // console.log("PARSE", costString, "->", costs);

  return costs;
}

export function canAfford(actor, cost) {
  let parsedCost = cost;
  if (typeof cost == "string") {
    parsedCost = parseActionCost(cost);
  }

  return spendCost(actor, parsedCost, true).success;
}

/**
 * Tries to spend the cost.
 * @param {*} actor
 * @param {*} cost
 * @param {*} choice which
 * @param {boolean} dry_run will not actually mutate the actor if true
 * @returns
 */
export function spendCost(actor, cost, dry_run = false) {
  const updates = {};
  let success = true;

  // for (let c of cost) {
  const c = cost;
  let resource = c.resource;
  let amount = new Number(c.amount);

  if (resource === "dice") {
    const actionDice = actor.system.currentStance.rolledDice;
    let diceIndex = actor.system.currentStance.selectedDice;

    if (diceIndex == -1) {
      diceIndex = actionDice.findIndex((die) => !die.used && die.result >= amount);
    }

    const maybeDice = actionDice[diceIndex];

    if (maybeDice && !maybeDice.used && (maybeDice.result >= amount || c.amount == "X")) {
      const newRolledDice = foundry.utils
        .deepClone(actor.system.currentStance.rolledDice)
        .map((dice, index) => (index == diceIndex ? { ...dice, used: true } : dice));

      updates[`system.currentStance.rolledDice`] = newRolledDice;
    } else {
      success = false;
      // break;
    }
  } else if (resource === "hp") {
    if (actor.system.health.value >= amount) {
      updates["system.health.value"] = actor.system.health.value - amount;
    } else {
      success = false;
      // break;
    }
  } else if (resource == "clone") {
    // TODO: we aren't sure which token they want to spend!
    success = true;
  } else if (resource == "basic") {
    // TODO: we aren't sure which token they want to spend!
    success = true;
  } else if (Number.isInteger(actor.system.tokens[resource])) {
    // The "Bad" tokens will be added to you instead
    // of taken away.
    if (resource == "burning" || resource == "weakness") {
      updates[`system.tokens.${resource}`] = actor.system.tokens[resource] + amount;
    } else if (actor.system.tokens[resource] >= amount) {
      updates[`system.tokens.${resource}`] = actor.system.tokens[resource] - amount;
    } else {
      success = false;
      // break;
    }
  } else {
    console.warn(`Spending ${resource} not implemented`);
    success = false;
  }
  // }

  let promise = null;
  if (success && !dry_run) {
    promise = actor.update(updates);
  }

  return { success, updates, promise };
}
