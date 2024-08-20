const { SchemaField, NumberField, StringField, ArrayField, BooleanField } =
  foundry.data.fields;

export class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      attributes: new SchemaField({
        level: new NumberField({
          required: true,
          integer: true,
          min: 1,
          initial: 1,
        }),
      }),
      currentStance: new SchemaField({
        index: new NumberField({ required: true, default: 0 }),
        actionDice: new ArrayField(new StringField()),
        rolledDice: new ArrayField(
          new SchemaField({
            used: new BooleanField({ required: true, default: false }),
            face: new NumberField({ required: true, default: -1 }),
            result: new NumberField({ required: true, default: -1 }),
          })
        ),
        selectedDice: new NumberField({ integer: true, initial: -1 }),
      }),
      tokens: new SchemaField({
        speed: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0,
        }),
        iron: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0,
        }),
        power: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0,
        }),
        weakness: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0,
        }),
        burning: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0,
        }),
      }),
      actionDicePool: new ArrayField(new StringField()),
      health: new SchemaField({
        value: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 10,
        }),
        max: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 10,
        }),
      }),
    };
  }

  static migrateData(source) {
    Object.keys(source.tokens).forEach((key) => {
      if (!Number.isInteger(source.tokens[key])) {
        source.tokens[key] = 0;
      }
    });

    if (!Number.isInteger(source.attributes.level)) {
      source.attributes.level = 1;
    }

    return super.migrateData(source);
  }

  get isMaxHealth() {
    return this.health.value >= this.health.max;
  }

  get isDead() {
    return this.health.value <= 0;
  }
}
