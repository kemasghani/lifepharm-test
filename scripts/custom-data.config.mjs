// One definition set, applied the same way to every store. Metaobject types are
// created first because the product metafields point at them.
export const metaobjects = [
  {
    type: 'ingredient',
    name: 'Ingredient',
    displayNameKey: 'name',
    fieldDefinitions: [
      { key: 'name', name: 'Name', type: 'single_line_text_field', required: true },
      { key: 'amount', name: 'Amount per serving', type: 'single_line_text_field' },
      { key: 'summary', name: 'What it does', type: 'multi_line_text_field' },
      {
        key: 'image',
        name: 'Image',
        type: 'file_reference',
        validations: [{ name: 'file_type_options', value: '["Image"]' }],
      },
    ],
  },
  {
    type: 'faq_item',
    name: 'FAQ item',
    displayNameKey: 'question',
    fieldDefinitions: [
      { key: 'question', name: 'Question', type: 'single_line_text_field', required: true },
      { key: 'answer', name: 'Answer', type: 'rich_text_field', required: true },
    ],
  },
];

export const productMetafields = [
  {
    key: 'how_to_use',
    name: 'How to use',
    description: 'One step per entry. Feeds the "How to use" block in the Product guide section.',
    type: 'list.single_line_text_field',
  },
  {
    key: 'key_ingredients',
    name: 'Key ingredients',
    description: 'Feeds the "Key ingredients" block in the Product guide section.',
    type: 'list.metaobject_reference',
    metaobjectType: 'ingredient',
  },
  {
    key: 'faqs',
    name: 'FAQs',
    description: 'Feeds the FAQ block in the Product guide section.',
    type: 'list.metaobject_reference',
    metaobjectType: 'faq_item',
  },
  {
    key: 'badge',
    name: 'Badge',
    description: 'Short label for product cards, for example "New".',
    type: 'single_line_text_field',
  },
];
