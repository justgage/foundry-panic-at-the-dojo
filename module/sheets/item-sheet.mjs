import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from "../helpers/effects.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class PanicItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["panic-system", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "description",
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = "systems/panic-system/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = this.document.toObject(false);

    // Enrich description info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedDescription = await TextEditor.enrichHTML(
      this.item.system.description,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.item.getRollData(),
        // Relative UUID resolution
        relativeTo: this.item,
      }
    );

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Adding a pointer to CONFIG.PANIC
    context.config = CONFIG.PANIC;

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects);

    // FORM ----------------
    if (itemData.type == "form") {
      context.enrichedAbilityDescription = await TextEditor.enrichHTML(
        this.item.system.abilityDescription,
        {
          // Whether to show secret blocks in the finished html
          secrets: this.document.isOwner,
          // Necessary in v11, can be removed in v12
          async: true,
          // Data to fill in for inline rolls
          rollData: this.item.getRollData(),
          // Relative UUID resolution
          relativeTo: this.item,
        }
      );
    }

    // Style ----------------
    if (itemData.type == "style") {
      console.log(
        "itemData.system.uniqueActions->>",
        itemData.system.uniqueActions
      );

      let uniqueActions = itemData.system.uniqueActions;

      if (!Array.isArray(uniqueActions)) {
        uniqueActions = Object.values(uniqueActions);
      }

      context.uniqueActions = await Promise.all(
        uniqueActions.map(async (uniqueAction) => {
          const action = foundry.utils.deepClone(uniqueAction);

          action.editor = await TextEditor.enrichHTML(action, {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Necessary in v11, can be removed in v12
            async: true,
            // Data to fill in for inline rolls
            rollData: this.item.getRollData(),
            // Relative UUID resolution
            relativeTo: this.item,
          });

          return action;
        })
      );
    }

    return context;
  }

  actionDice() {
    let actionDice = foundry.utils.deepClone(this.item.system.actionDice);
    if (!Array.isArray(actionDice)) {
      actionDice = Object.values(actionDice); // Convert object back to array
    }
    return actionDice;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.

    // Active Effect management
    html.on("click", ".effect-control", (ev) =>
      onManageActiveEffect(ev, this.item)
    );

    // FORM -=--=-=-=-=-=--=-=-=-=-=-=-=-=-
    // FORM -=--=-=-=-=-=--=-=-=-=-=-=-=-=-
    // FORM -=--=-=-=-=-=--=-=-=-=-=-=-=-=-

    // Handle change events for action dice selection
    html.find(".dice-select").change((ev) => {
      const select = ev.currentTarget;
      const index = new Number(select.name.split(".").pop());
      const newValue = select.value;

      const actionDice = this.actionDice();

      actionDice[index] = newValue;

      // Update the specific action dice value in the item
      this.item.update({ "system.actionDice": actionDice }).then(() => {
        console.log(
          "this.item.system.actionDice",

          this.item.system.actionDice
        );
      });
    });

    // Add new action dice
    html.find(".add-dice").click((ev) => {
      console.log("ADD");

      ev.preventDefault();

      // Get the current actionDice array
      const actionDice = this.actionDice();

      console.log("add dice -->", actionDice);

      // Add a default value to the array
      actionDice.push("d6"); // Default new dice is d6, you can change it as needed

      // Update the item with the new actionDice array
      this.item.update({ "system.actionDice": actionDice });
    });

    // Delete an action dice
    html.find(".delete-dice").click((ev) => {
      ev.preventDefault();

      const li = $(ev.currentTarget).closest("li");
      const index = li.index();

      // Get the current actionDice array
      const actionDice = this.actionDice();

      // Remove the dice at the selected index
      actionDice.splice(index, 1);

      // Update the item with the new actionDice array
      this.item.update({ "system.actionDice": actionDice });
    });

    // STYLE -=-=-=--=-=-=-=-=-=-=-=-=-

    // Add new action
    html.find(".add-action").click((ev) => {
      console.log("ADD ACTION!");
      ev.preventDefault();

      let uniqueActions = foundry.utils.deepClone(
        this.item.system.uniqueActions
      );
      if (!Array.isArray(uniqueActions)) {
        uniqueActions = [];
      }

      uniqueActions.push({ cost: "", title: "", description: "" });

      this.item.update({ "system.uniqueActions": uniqueActions });
    });

    // Delete an action
    html.find(".delete-action").click((ev) => {
      ev.preventDefault();

      const li = $(ev.currentTarget).closest("li");
      const index = li.index();

      let uniqueActions = foundry.utils.deepClone(
        this.item.system.uniqueActions
      );
      if (!Array.isArray(uniqueActions)) {
        uniqueActions = Object.values(uniqueActions);
      }

      uniqueActions.splice(index, 1);

      this.item.update({ "system.uniqueActions": uniqueActions });
    });
  }
}
