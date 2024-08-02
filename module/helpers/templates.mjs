/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    "systems/panic-system/templates/actor/parts/actor-features.hbs",
    "systems/panic-system/templates/actor/parts/actor-items.hbs",
    // 'systems/panic-system/templates/actor/parts/actor-spells.hbs',
    "systems/panic-system/templates/actor/parts/actor-effects.hbs",
    // Item partials
    "systems/panic-system/templates/item/parts/item-effects.hbs",
    "systems/panic-system/templates/actor/parts/actor-stances.hbs",
  ]);
};
