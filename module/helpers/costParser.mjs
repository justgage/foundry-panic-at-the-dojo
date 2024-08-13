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
        /(\d+)\s*(speed|iron|power|weakness|burning|hp|basic|other) tokens/i
      );
      if (multiWordMatch) {
        const amount = parseInt(multiWordMatch[1], 10);
        const resource = multiWordMatch[2].toLowerCase();
        costs.push({ resource, amount });
        continue;
      }

      // Handling specific tokens (e.g., '-1 Burn', '-2 HP')
      const tokenMatch = section.match(
        /(-\d+)\s*(speed|iron|power|weakness|burning|hp|basic|other)/i
      );
      if (tokenMatch) {
        const amount = parseInt(tokenMatch[1], 10);
        const resource = tokenMatch[2].toLowerCase();
        costs.push({ resource, amount });
        continue;
      }

      // Handling dice (e.g., 'd6', '4', '5')
      const diceMatch = section.match(
        /(\d+|d\d+)\s*(speed|iron|power|weakness|burning|hp|basic|other)?/i
      );
      if (diceMatch) {
        const amount = diceMatch[1];
        const resource = diceMatch[2] ? diceMatch[2].toLowerCase() : null;
        costs.push({ resource, amount });
        continue;
      }

      // Handling phrases like 'Destroy 1 Copy' or 'Gain 1 Burning Token'
      const actionMatch = section.match(
        /(destroy|gain)\s+(\d+)\s*(copy|burning token)/i
      );
      if (actionMatch) {
        const amount = parseInt(actionMatch[2], 10);
        const resource = actionMatch[3] ? actionMatch[3].toLowerCase() : null;
        costs.push({ resource, amount });
        continue;
      }

      // Handle any other unexpected format
      console.warn(`Unrecognized cost format: "${section}"`);
    } catch (error) {
      console.error(`Error parsing section "${section}":`, error);
    }
  }

  console.log("COSTs", costs, costString);

  return costs;
}

export async function spendCost(actor, cost, choice = null) {
  const updates = {};
  let success = true;

  for (let c of cost) {
    let resource = c.resource;
    let amount = c.amount;

    if (resource === "or") {
      if (choice) {
        resource = choice;
      } else {
        console.error("A choice must be provided for 'or' costs.");
        return false;
      }
    }

    if (resource === "actionDice") {
      const actionDice = actor.system.currentStance.rolledDice;
      const diceIndex = actionDice.findIndex(
        (die) => !die.used && die.result >= amount
      );

      if (diceIndex >= 0) {
        updates[`system.currentStance.rolledDice.${diceIndex}.used`] = true;
      } else {
        success = false;
        break;
      }
    } else if (resource === "HP") {
      if (actor.system.attributes.hp.value >= amount) {
        updates["system.attributes.hp.value"] =
          actor.system.attributes.hp.value - amount;
      } else {
        success = false;
        break;
      }
    } else {
      if (actor.system.tokens[resource].value >= amount) {
        updates[`system.tokens.${resource}.value`] =
          actor.system.tokens[resource].value - amount;
      } else {
        success = false;
        break;
      }
    }
  }

  if (success) {
    await actor.update(updates);
  }

  return success;
}
