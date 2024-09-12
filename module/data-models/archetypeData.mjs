const { SchemaField, NumberField, StringField, ArrayField, BooleanField } = foundry.data.fields;

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
        }),
        {
          initial: () => [
            {
              title: "",
              description: "",
              heroType: "Focused",
            },
            {
              title: "",
              description: "",
              heroType: "Fused",
            },
            {
              title: "",
              description: "",
              heroType: "Frantic",
            },
          ],
        },
      ),

      archetypeSlug: new StringField({
        required: true,
      }),
    };
  }

  static migrateData(source) {
    if (!source.abilities || source.abilities.length == 0) {
      source.abilities = [
        {
          title: "Focused ...",
          description: "Focused description",
          heroType: "Focused",
        },
        {
          title: "Fused ...",
          description: "Fused ...",
          heroType: "Fused",
        },
        {
          title: "Frantic ...",
          description: "Frantic ...",
          heroType: "Frantic",
        },
      ];
    }

    return super.migrateData(source);
  }
}
