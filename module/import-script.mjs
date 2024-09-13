// Import data from itemSheet.js (ensure this file is loaded into Foundry first)
import { archetypes, forms, styles } from "./text-content.mjs";

// Full script to transform and create Foundry items and place them in folders

export async function createCompendiums() {
  const archetypeCompendiumName = "panic-dojo-archetypes";
  const formCompendiumName = "panic-dojo-forms";

  // Step 1: Create or find the compendiums for archetypes and forms
  let archetypePack = game.packs.find((p) => p.metadata.label === archetypeCompendiumName);
  let formPack = game.packs.find((p) => p.metadata.label === formCompendiumName);

  if (!archetypePack) {
    archetypePack = await CompendiumCollection.createCompendium({
      label: archetypeCompendiumName,
      entity: "Item",
      type: "Item",
    });
  }

  if (!formPack) {
    formPack = await CompendiumCollection.createCompendium({
      label: formCompendiumName,
      entity: "Item",
      type: "Item",
    });
  }

  // Step 2: Ensure folder structure for archetypes and styles in the compendium
  const archetypeFolders = {};
  const archetypeStyleSubfolders = {};

  for (const archetype of archetypes) {
    // Create folder for each archetype
    const archetypeFolder = new Folder({ name: archetype.name, type: "Item" });
    await archetypePack.importFolder(archetypeFolder);

    // Create Styles subfolder for each archetype
    const stylesSubfolder = new Folder({
      name: "Styles",
      type: "Item",
      folder: archetypeFolder._id,
      depth: 2
    });

    await archetypePack.importFolder(stylesSubfolder);

    archetypeFolders[archetype.name] = archetypeFolder._id;
    archetypeStyleSubfolders[archetype.name] = stylesSubfolder._id;
  }

  // Step 3: Create Foundry items based on the transformed data
  const foundryItems = [];

  function mapActions(actions) {
    return actions.map((action) => {
      const costs = action.levels.map((level) => {
        let costString = "";
        if (level.diceCost) {
          costString += level.diceCost.map((cost) => `${cost}+`).join(" or ");
        }

        if (level.tokenCost) {
          costString += level.tokenCost
            .map((token) => `${token.number} ${token.tokenType}`)
            .join(", ");
        }
        return costString;
      });

      return {
        title: action.name,
        cost: costs.join(", "),
        description: action.levels.map((level) => `<p>${level.description}</p>`).join(""),
      };
    });
  }

  function createArchetypeItem(archetype) {
    return {
      name: archetype.name,
      type: "archetype",
      system: {
        description: "", // Add description if available
        archetypeSlug: archetype.key,
        abilities: [
          {
            title: "Focused",
            description: archetype.focusedAbility.description,
            heroType: "Focused",
          },
          {
            title: "Fused",
            description: archetype.fusedAbility.description,
            heroType: "Fused",
          },
          {
            title: "Frantic",
            description: archetype.franticAbility.description,
            heroType: "Frantic",
          },
        ],
      },
      folder: archetypeFolders[archetype.name],
    };
  }

  function createStyleItem(style) {
    return {
      name: style.name,
      type: "style",
      system: {
        parentArchetypeName: style.parentArchetypeName,
        range: `${style.minRange}-${style.maxRange}`,
        uniqueActions: mapActions(style.actions),
        abilityDescription: style.ability.description,
      },
      folder: archetypeStyleSubfolders[style.parentArchetypeName],
    };
  }

  function createFormItem(form) {
    return {
      name: form.name,
      type: "form",
      system: {
        actionDice: form.actionDice,
        forbiddenActionDice: form.forbiddenActionDice,
        uniqueActions: mapActions(form.actions),
        abilityDescription: form.ability.description,
      },
      folder: null, // Forms are flat, so no folder
    };
  }

  // Step 4: Push transformed items into the respective compendiums
  for (const archetype of archetypes) {
    const archetypeItem = createArchetypeItem(archetype);
    const item = await Item.create(archetypeItem, { pack: archetypePack._id });
    await archetypePack.importDocument(item);
  }

  for (const style of styles) {
    const styleItem = createStyleItem(style);
    const item = await Item.create(styleItem, {temporary: true });
    await archetypePack.importDocument(item);
  }

  for (const form of forms) {
    const formItem = createFormItem(form);
    const item = await Item.create(formItem, {temporary: true });
    await formPack.importDocument(item);
  }

  ui.notifications.info(
    `${archetypes.length + styles.length + forms.length} items successfully imported into the compendiums!`,
  );
}
