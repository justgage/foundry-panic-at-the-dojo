import { parseActionCost } from "./helpers/costParser.mjs";

export function RegisterHandlebarHelpers() {
  Handlebars.registerHelper("toLowerCase", function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper({
    eq: (v1, v2) => v1 === v2,
    eqstr: (v1, v2) => `${v1}` === `${v2}`,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
      return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
      return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    },
    default(item, defaultOption) {
      return item || defaultOption;
    },
    concat: function () {
      return Array.prototype.slice.call(arguments, 0, -1).join("");
    },
    split: function (items, splitOn) {
      return items.split(splitOn);
    },

    parseActionCost: parseActionCost,

    capitalize: function (text) {
      if (typeof text !== "string") return text;
      return text.charAt(0).toUpperCase() + text.slice(1);
    },

    setCheckedStr: function (value, currentValue) {
      if (`${value}` == `${currentValue}`) {
        return "checked";
      } else {
        return "";
      }
    },

    setChecked: function (value, currentValue) {
      if (value == currentValue) {
        return "checked";
      } else {
        return "";
      }
    },
  });
}
