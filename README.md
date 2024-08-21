# Panic At The Dojo System

![Foundry v11](https://img.shields.io/badge/foundry-v11-green)

This is a custom System using Foundry VTT. This is very much an Alpha-level might eat your cat (I mean game, game) at any moment. I wouldn't rely on this module but I'm putting it up so others can at least TRY it.

## To-Do

- [ ] Allow to reorder styles/forms
- [ ] Provide empty states telling you what to do
- [ ] Create type checking for items
- [ ] Auto-create compendium of Styles/Forms
- [ ] Each stance in it's own tab
- [ ] Cleanup messy style code
- [ ] Implement Archetypes
- [ ] Make NPCs
- [ ] Make global object to handle stuff like, Cinematic Weight, etc.
- [ ] Chat message that allows you to apply damage to tokens selected

## How to Dev on this, or at least how I do.

This is going to most likely require some CSS/SCSS, JS, and Handlebars knowledge.
I try to keep it very simple outside of that though.

Place this Repo is your Foundry Directory

- Eg on Mac: `/Users/<YOUR USER>/Library/Application Support/FoundryVTT/Data/systems/panic-system`
- Link that folder to an easer location: `ln -s /Users/<YOUR USER>/Library/Application\ Support/FoundryVTT/ code/foundry`

```
npm install
npm run watch # watches the CSS files
```

- Install the Wonderful Dev Mode Module: `https://github.com/League-of-Foundry-Developers/foundryvtt-devMode/releases/latest/download/module.json`

  - Configure it to open up your actor/items (grab their id from their title bar) in Settings > Developer Mode > Debug Flags > Auto Open Documents > Add actors/items with their ids

- Refresh the page whenever you make code changes!

## Project structure

If you want to modify the character sheet these are the following spots to check:

- `module/documents/actor.mjs` - Main abstract actor, currently not used much
- `module/sheets/actor-sheet.mjs` - Most of the UI logic... which is pretty much all the logic. This passes and prepares information down to the handlebars view.
- `module/data-models/characterData.mjs` - Defines schema for Characters
- `templates/actor/actor-character-sheet.hbs` - HTML of the character sheet
  - `templates/actor/parts/actor-stances.hbs` - HTML for stances (they're complex!)
- CSS: `src/scss/components/_character-sheet.scss` - The CSS for character sheets

Items (forms/styles) are pretty much the same

---

## PREVIOUS EXTRA INF0

### Getting Help

Check out the [Official Foundry VTT Discord](https://discord.gg/foundryvtt)! The #system-development channel has helpful pins and is a good place to ask questions about any part of the foundry application.

For more static references, the [Knowledge Base](https://foundryvtt.com/kb/) and [API Documentation](https://foundryvtt.com/api/) provide different levels of detail. For the most detail, you can find the client side code in your foundry installation location. Classes are documented in individual files under `resources/app/client` and `resources/app/common`, and the code is collated into a single file at `resources/app/public/scripts/foundry.js`.

#### Tutorial

For much more information on how to use this system as a starting point for making your own, see the [full tutorial on the Foundry Wiki](https://foundryvtt.wiki/en/development/guides/SD-tutorial)!

Note: Tutorial may be out of date, so look out for the Foundry compatibility badge at the top of each page.

![image](http://mattsmith.in/images/panic-system.png)
