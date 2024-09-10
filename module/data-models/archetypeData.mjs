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
      ),

      archetypeSlug: new StringField({
        required: true,
        initial: "unique_name_for_styles",
      }),
    };
  }
}
