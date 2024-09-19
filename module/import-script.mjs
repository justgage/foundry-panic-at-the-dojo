// Import data from itemSheet.js (ensure this file is loaded into Foundry first)
import { archetypes, forms, styles } from "./text-content.mjs";

// Full script to transform and create Foundry items and place them in folders

export async function createCompendiums() {
  const archetypeCompendiumName = "Panic - Archetypes & Styles";
  const formCompendiumName = "Panic - Forms";

  // Step 1: Create or find the compendiums for archetypes and forms
  let archetypePack = game.packs.find((p) => p.metadata.label === archetypeCompendiumName);
  let formPack = game.packs.find((p) => p.metadata.label === formCompendiumName);

  if (archetypePack && formPack) {
    console.log("Panic compendiums already exist, not re-creating them!");
    return;
  }

  // Useful when you're developing them, but not normally
  // if (archetypePack) {
  //   ui.notifications.info(`${archetypeCompendiumName} exists, recreating it`);
  //   await archetypePack.deleteCompendium();
  // }

  // if (formPack) {
  //   ui.notifications.info(`${formCompendiumName} exists, recreating it`);
  //   await formPack.deleteCompendium();
  // }

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
    await archetypePack.importFolder(new Folder({ name: archetype.name, type: "Item" }));
    const archetypeFolder = archetypePack.tree.children
      .map((f) => f.folder)
      .find((f) => f.name == archetype.name);

    const styleName = `Styles for ${archetype.name}`;

    // Create Styles subfolder for each archetype
    await archetypePack.importFolder(new Folder({ name: styleName, type: "Item" }));

    const stylesSubfolder = archetypePack.tree.children
      .map((f) => f.folder)
      .find((f) => f.name == styleName);

    stylesSubfolder.update({ folder: archetypeFolder._id });

    archetypeFolders[archetype.name] = archetypeFolder._id;
    archetypeStyleSubfolders[archetype.name] = stylesSubfolder._id;
  }

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

        if (level.otherCost) {
          costString += level.otherCost.join(", ");
        }
        return costString;
      });

      return {
        title: action.name,
        cost: costs.join(", "),
        description: action.levels
          .map((level) => {
            let costString = "";

            if (level.diceCost) {
              costString += level.diceCost.map((c) => `${c}+`).join(" or ");
            }

            if (level.tokenCost) {
              costString += level.tokenCost
                .map((token) => `${token.number} ${token.tokenType}`)
                .join(", ");
            }

            if (level.otherCost) {
              costString += level.otherCost.join("");
            }
            return `<p><strong>${costString}</strong> ${level.description}</p>`;
          })
          .join(""),
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
        description: style.ability.description,
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

  // process:
  // 1. create compendium, store reference
  // 2. import a folder, store a reference
  // 3. import a document, then add to that folder using .update()
  // 4. repeat for each archetype

  // Step 4: Push transformed items into the respective compendiums
  for (const archetype of archetypes) {
    const archetypeItem = createArchetypeItem(archetype);
    const folderId = archetype.folder;
    const item = await Item.create(archetypeItem, { pack: archetypePack._id });
    const newItem = await archetypePack.importDocument(item);
    newItem.update({ folder: folderId });
  }

  for (const style of styles) {
    const styleItem = createStyleItem(style);
    const folderId = styleItem.folder;
    const item = await Item.create(styleItem, { temporary: true });
    const newStyle = await archetypePack.importDocument(item);
    newStyle.update({ folder: folderId });
  }

  for (const form of forms) {
    const formItem = createFormItem(form);
    const item = await Item.create(formItem, { temporary: true });
    await formPack.importDocument(item);
  }

  ui.notifications.info(
    `PANIC at the Dojo: Successfully imported ${
      archetypes.length + styles.length + forms.length
    } items into the compendiums! Please check those out for styles/forms`,
  );
}
