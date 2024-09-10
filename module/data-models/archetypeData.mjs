const { SchemaField, NumberField, StringField, ArrayField, BooleanField } =
  foundry.data.fields;

export class ArchetypeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      name: new StringField(),

      complexity: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0,
      }),

      abilities: new ArrayField(
        new SchemaField({
          title: new StringField(),
          description: new StringField(),
          heroType: new StringField(),
        })
      ),

      archetypeSlug: new StringField({
        required: true,
        initial: "unique_name_for_styles",
      }),
    };
  }

  //   static migrateData(source) {
  //     Object.keys(source.tokens).forEach((key) => {
  //       if (!Number.isInteger(source.tokens[key])) {
  //         source.tokens[key] = 0;
  //       }
  //     });

  //     if (!Number.isInteger(source.attributes.level)) {
  //       source.attributes.level = 1;
  //     }

  //     return super.migrateData(source);
  //   }

  //   get isMaxHealth() {
  //     return this.health.value >= this.health.max;
  //   }

  //   get isDead() {
  //     return this.health.value <= 0;
  //   }
}
