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
- `module/sheets/actor-sheet.mjs` - Most of the UI logic... which is pretty much all the logic
- `module/data-models/characterData.mjs` - Defines schema for Characters
- `templates/actor/actor-character-sheet.hbs` - HTML of the character sheet
  - `templates/actor/parts/actor-stances.hbs` - HTML for stances (they're complex!)
- CSS: `src/scss/components/_character-sheet.scss` - The CSS for character sheets

Items (forms/styles) are pretty much the same.

---

## PREVIOUS EXTRA INF0

> **Data Models**
>
> If you would like to use DataModel classes instead of the older template.json configuration, you'll need to use the `npm run generate` command described below and choose to enable them when asked. DataModels are currently an optional feature, and are only available in the generator CLI due to that.

### Generator

This system includes a generator CLI in `package.json`. To use it, you must have [node.js](https://nodejs.org) installed, and it's recommended that you install node 20 or later.

Once you have npm installed, you can run the following in your terminal or command prompt:

```bash
npm install
npm run generate
```

Your terminal should prompt you to name your system. Read the instructions carefully, the letter case and special characters in each question matter for correct system generation.

Once the generator completes, it will output your system to `build/<your-system-name>`, where `<your-system-name>` is the package name you supplied during the prompt.

Copy this directory over to your Foundry systems directory and start coding!

### Manual Replacement

Before installing this system, you should rename any files that have `panic-system` in their filename to use whatever machine-safe name your system needs, such as `adnd2e` if you were building a system for 2nd edition Advanced Dungeons & Dragons. In addition, you should search through the files for `panic-system` and `Panic` and do the same for those, replacing them with appropriate names for your system.

The `name` property in your `system.json` file is your system's package name. This need to be formatted `alphanumeric-lowercase`, and it must also match the foldername you use for your system.

### Vue 3 Panic

**NOTE: The Vue 3 version is currently outdated and considered an advanced usage of Foundry due to it being a custom renderer. Only try it out if you _really_ like Vue and are feeling dangerous!**

Alternatively, there's another build of this system that supports using Vue 3 components (ES module build target) for character sheet templates.

Head over to the [Vue3Panic System](https://gitlab.com/asacolips-projects/foundry-mods/vue3panic-system) repo if you're interested in using Vue!

### Getting Help

Check out the [Official Foundry VTT Discord](https://discord.gg/foundryvtt)! The #system-development channel has helpful pins and is a good place to ask questions about any part of the foundry application.

For more static references, the [Knowledge Base](https://foundryvtt.com/kb/) and [API Documentation](https://foundryvtt.com/api/) provide different levels of detail. For the most detail, you can find the client side code in your foundry installation location. Classes are documented in individual files under `resources/app/client` and `resources/app/common`, and the code is collated into a single file at `resources/app/public/scripts/foundry.js`.

#### Tutorial

For much more information on how to use this system as a starting point for making your own, see the [full tutorial on the Foundry Wiki](https://foundryvtt.wiki/en/development/guides/SD-tutorial)!

Note: Tutorial may be out of date, so look out for the Foundry compatibility badge at the top of each page.

## Sheet Layout

This system includes a handful of helper CSS classes to help you lay out your sheets if you're not comfortable diving into CSS fully. Those are:

- `flexcol`: Included by Foundry itself, this lays out the child elements of whatever element you place this on vertically.
- `flexrow`: Included by Foundry itself, this lays out the child elements of whatever element you place this on horizontally.
- `flex-center`: When used on something that's using flexrow or flexcol, this will center the items and text.
- `flex-between`: When used on something that's using flexrow or flexcol, this will attempt to place space between the items. Similar to "justify" in word processors.
- `flex-group-center`: Add a border, padding, and center all items.
- `flex-group-left`: Add a border, padding, and left align all items.
- `flex-group-right`: Add a border, padding, and right align all items.
- `grid`: When combined with the `grid-Ncol` classes, this will lay out child elements in a grid.
- `grid-Ncol`: Replace `N` with any number from 1-12, such as `grid-3col`. When combined with `grid`, this will layout child elements in a grid with a number of columns equal to the number specified.

## Compiling the CSS

This repo includes both CSS for the theme and SCSS source files. If you're new to CSS, it's probably easier to just work in those files directly and delete the SCSS directory. If you're interested in using a CSS preprocessor to add support for nesting, variables, and more, you can run `npm install` in this directory to install the dependencies for the scss compiler. After that, just run `npm run build` to compile the SCSS and start a process that watches for new changes.

![image](http://mattsmith.in/images/panic-system.png)
