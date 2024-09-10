import { canAfford, parseActionCost, spendCost } from "../helpers/costParser.mjs";
import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PanicActorSheet extends ActorSheet {
  constructor(...args) {
    super(...args);
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["panic-system", "sheet", "actor"],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "features",
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/panic-system/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Adding a pointer to CONFIG.PANIC
    context.config = CONFIG.PANIC;

    // Add the editable state to the context
    context.editable = this.editable;

    // Prepare character data and items.
    if (actorData.type == "character") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == "npc") {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await TextEditor.enrichHTML(this.actor.system.biography, {
      // Whether to show secret blocks in the finished html
      secrets: this.document.isOwner,
      // Necessary in v11, can be removed in v12
      async: true,
      // Data to fill in for inline rolls
      rollData: this.actor.getRollData(),
      // Relative UUID resolution
      relativeTo: this.actor,
    });

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects(),
    );

    return context;
  }

  ensureArray(maybeObject) {
    let arr = maybeObject || [];
    if (!Array.isArray(arr)) {
      arr = Object.values(maybeObject);
    }
    return arr;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    console.log("_prepareCharacterData", context);

    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    console.log("_prepareItems", context);
    // Initialize containers.

    const archetypes = context.items.filter((i) => i.type == "archetype");

    context.archetypes = archetypes;

    // forms + styles
    const { stances, forms, styles } = this.makeStances(context.items);

    // Assign and return
    context.forms = forms;
    context.styles = styles;
    context.stances = stances;
    context.editable = this.editable;
    // context.spells = spells;
  }

  makeStances(items) {
    const forms = [];
    const styles = [];
    const stances = [];

    // Iterate through items, allocating to containers
    for (let i of items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to forms.
      if (i.type === "form") {
        forms.push(i);
      }
      // Append to style.
      else if (i.type === "style") {
        styles.push(i);
      }
    }
    for (let index = 0; index < Math.max(forms.length, styles.length); index++) {
      const form = forms[index];
      const style = styles[index];

      const actions = [
        ...this.ensureArray(style?.system?.uniqueActions),
        ...this.ensureArray(form?.system?.uniqueActions),
      ];

      const name = `${style.name} ${form.name}`;

      stances.push({ name, form, style, actions });
    }

    return { stances, forms, styles };
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".select-action-dice").click(async (ev) => {
      const index = new Number(ev.currentTarget.value);

      this.actor.update({ "system.currentStance.selectedDice": index });
    });

    html.find(".smooth-scroll-to").click((ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const el = $(ev.currentTarget);
      let destination = $(el.attr("href"));
      el.parents(".window-content")
        .first()
        .animate(
          {
            scrollTop: destination.offset().top - 50,
          },
          "slow",
        );
    });

    html.find(".spend-action").click(async (ev) => {
      const { actionIndex, cost } = ev.target.dataset;
      console.log({ cost, actionIndex });
      const costs = parseActionCost(cost);

      const applicableCosts = costs.filter((cost) => canAfford(this.actor, cost));

      console.log({ applicableCosts });

      if (applicableCosts[0]) {
        spendCost(this.actor, applicableCosts[0]);
        // Create a formatted chat message
        const actionHtml = $(ev.target).parents(".action-item")[0].outerHTML;
        let chatContent = `
        <div class="panic-system">
        <div class="flex-row items-center">
        <img class="profile-img" src="${this.actor.img}" data-edit="img" title="${this.actor.name}" height="40" width="40" />
        <h3>${this.actor.name} spends: <b>${applicableCosts[0].amount} ${applicableCosts[0].resource}</b> to preform:</h3>
        </div>
        <section>
        ${actionHtml}
        </section>
        </div>`;

        // Send the message to the chat
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          content: chatContent,
          type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        });
      } else {
        ui.notifications.error(`Sorry, you can't pay the cost of that action. Cost is: ${cost}`);
      }
    });

    html.find(".action-dice-roll").click(async (ev) => {
      // Roll all action dice at once
      const index = ev.currentTarget.dataset.stanceId;

      await this.actor.update({
        "system.currentStance": {
          selectedDice: -1,
          rolledDice: [],
          index: index,
        },
      });

      const diceToRoll = this.ensureArray(this.currentStance(index).form.system.actionDice).join(
        " + ",
      );

      const roll = await new Roll(diceToRoll).roll({ async: true });

      // Check if Dice So Nice is active and trigger the animation
      if (game.dice3d) {
        await game.dice3d.showForRoll(roll, game.user, true);
      }

      // Save the rolled results to the Actor's data
      const rolledResults = roll.dice.map((d) => ({
        face: d.faces,
        result: d.results[0].result,
        used: false,
      }));

      this.actor.update({ "system.currentStance.rolledDice": rolledResults });

      const name = this.currentStance().name;

      // Create a formatted chat message
      let chatContent = `<h2>${this.actor.name} goes into ${name} stance!</h2>
      <div class="dice-rolls">
      Action Dice: 
      `;
      rolledResults.forEach((dice, index) => {
        chatContent += `<span class="dice">
                    ${dice.result}_ON_D${dice.face}
                  </span>`;
      });
      chatContent += `</div>`;

      // Send the message to the chat
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: chatContent,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      });
    });

    // Edit Toggle Button Listener
    html.find(".edit-toggle").click((ev) => {
      ev.preventDefault();

      // Toggle the editable state
      this.editable = !this.editable;

      // Re-render the sheet with the new state
      this.render(false);
    });

    if (!this.isEditable) return;

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on("click", ".item-edit", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    html.on("click", ".addToken", (event) => {
      const input = $(event.currentTarget).siblings(".tokenInput");
      input.val(function (i, current) {
        return Number(current) + 1;
      });
    });

    html.on("click", ".removeToken", (event) => {
      const input = $(event.currentTarget).siblings(".tokenInput");
      input.val(function (i, current) {
        return Number(current) - 1;
      });
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable

    html.on("change", ".stance-select", (e) => {
      const index = e.currentTarget.getAttribute("value");
      this.actor.update({
        "system.currentStance": {
          selectedDice: -1,
          rolledDice: [],
          index: index,
        },
      });
    });

    // Add Inventory Item
    html.on("click", ".item-create", this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on("click", ".item-delete", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on("click", ".effect-control", (ev) => {
      const row = ev.currentTarget.closest("li");
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities.
    html.on("click", ".rollable", this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  currentStance() {
    return this.makeStances(this.actor.items).stances[this.actor.system.currentStance.index];
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == "item") {
        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : "";
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get("core", "rollMode"),
      });
      return roll;
    }
  }
}
