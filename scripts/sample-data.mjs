// Fictional catalog for the trial store. Each product exists to prove one
// behaviour of the Product guide section, so the store doubles as a test matrix.
const richText = (...paragraphs) =>
  JSON.stringify({
    type: 'root',
    children: paragraphs.map((value) => ({
      type: 'paragraph',
      children: [{ type: 'text', value }],
    })),
  });

export const ingredients = [
  { handle: 'spirulina', name: 'Spirulina', amount: '1.5 g', summary: 'A blue-green algae with a mild, savory taste.', image: 'ingredient-spirulina' },
  { handle: 'wheatgrass', name: 'Wheatgrass', amount: '1 g', summary: 'Young wheat shoots, dried at a low temperature.', image: 'ingredient-wheatgrass' },
  { handle: 'matcha', name: 'Matcha', amount: '500 mg', summary: 'Stone-ground green tea with a smooth, grassy note.', image: 'ingredient-matcha' },
  { handle: 'ginger-root', name: 'Ginger root', amount: '250 mg', summary: 'Adds a gentle warmth to the finish.', image: 'ingredient-ginger-root' },
  { handle: 'marine-collagen', name: 'Marine collagen', amount: '10 g', summary: 'Hydrolyzed fish collagen that dissolves in hot or cold drinks.', image: 'ingredient-marine-collagen' },
  { handle: 'vitamin-c', name: 'Vitamin C', amount: '80 mg', summary: 'Ascorbic acid, added for a light citrus edge.', image: 'ingredient-vitamin-c' },
  // Saved as a draft on purpose: a product can reference it, but it must never
  // reach the storefront.
  { handle: 'draft-only-ingredient', name: 'Unpublished ingredient', amount: '1 g', summary: 'Should never appear on the storefront.', image: 'ingredient-vitamin-c', status: 'DRAFT' },
];

export const faqs = [
  { handle: 'best-time', question: 'When is the best time to take it?', answer: richText('Any time that fits your routine. Most people find breakfast the easiest moment to remember.') },
  { handle: 'taste', question: 'What does it taste like?', answer: richText('Earthy and fresh, with a little ginger at the end. It softens if you blend it with fruit.') },
  { handle: 'how-long', question: 'How long does one pack last?', answer: richText('One pack holds 30 servings, so it lasts a month at one serving a day.') },
  { handle: 'vegan', question: 'Is it vegan?', answer: richText('Yes. There are no animal-derived ingredients in this sample product.') },
  { handle: 'storage', question: 'How should I store it?', answer: richText('Keep it closed, in a cool and dry place, away from direct sunlight.') },
  { handle: 'extra-question', question: 'Is there a sixth question?', answer: richText('This one sits past the block limit of five, so it should not appear.') },
  { handle: 'capsule-count', question: 'How many capsules are in a bottle?', answer: richText('Each bottle holds 60 capsules, which is a 30-day supply at two capsules a day.') },
  { handle: 'with-food', question: 'Should I take it with food?', answer: richText('You can take it with or without food. Choose whichever suits you.') },
  // Valid data that renders nothing: an answer with one empty paragraph.
  { handle: 'empty-answer', question: 'This question has an empty answer', answer: richText('') },
];

// Demo content, labeled as sample reviews on the page.
export const testimonials = [
  { handle: 'greens-maya', quote: 'It takes less time than my coffee, so I actually keep doing it.', name: 'Maya R.', detail: 'Sample review' },
  { handle: 'greens-tom', quote: "I don't like green drinks, and this one tastes fine in a smoothie.", name: 'Tom L.', detail: 'Sample review' },
  { handle: 'greens-ana', quote: 'The sticks live in my bag. That was the part that made it stick.', name: 'Ana P.', detail: 'Sample review' },
  { handle: 'magnesium-joe', quote: 'Two capsules and I am done. Nothing to mix, nothing to measure.', name: 'Joe K.', detail: 'Sample review' },
  { handle: 'magnesium-lena', quote: 'It fits next to my toothbrush, which is why I remember it.', name: 'Lena S.', detail: 'Sample review' },
  { handle: 'collagen-priya', quote: 'It disappears in my coffee. I forget it is there.', name: 'Priya D.', detail: 'Sample review' },
];

const steps = {
  greens: [
    'Add one level scoop to 250 ml of cold water or a smoothie.',
    'Stir or shake for 20 seconds until fully mixed.',
    'Drink once a day, ideally with breakfast.',
  ],
  magnesium: [
    'Take two capsules with a glass of water.',
    'Have them about an hour before bed.',
  ],
  collagen: [
    'Add one scoop to coffee, tea or a smoothie.',
    'Stir until dissolved.',
    'Use once a day.',
    'Keep the lid closed between uses.',
  ],
};

const list = (key, type, values) => ({ namespace: 'custom', key, type, value: JSON.stringify(values) });
const howTo = (values) => list('how_to_use', 'list.single_line_text_field', values);
const ingredientRefs = (handles) => ({ key: 'key_ingredients', handles, kind: 'ingredient' });
const faqRefs = (handles) => ({ key: 'faqs', handles, kind: 'faq_item' });
const testimonialRefs = (handles) => ({ key: 'testimonials', handles, kind: 'testimonial' });
const text = (key, value) => ({ namespace: 'custom', key, type: 'single_line_text_field', value });
const body = (key, value) => ({ namespace: 'custom', key, type: 'multi_line_text_field', value });
const color = (value) => ({ namespace: 'custom', key: 'accent_color', type: 'color', value });
const benefits = (values) => list('benefits', 'list.single_line_text_field', values);
const badge = (value) => ({ namespace: 'custom', key: 'badge', type: 'single_line_text_field', value });

export const products = [
  {
    handle: 'daily-greens-powder',
    title: 'Daily Greens Powder',
    image: 'product-daily-greens',
    description: 'Spirulina, wheatgrass, matcha and ginger in one scoop.',
    variants: [
      { name: '30 servings', price: '39.00', servings: 30 },
      { name: '60 servings', price: '69.00', compareAt: '78.00', servings: 60 },
    ],
    metafields: [
      howTo(steps.greens),
      ingredientRefs(['spirulina', 'wheatgrass', 'matcha', 'ginger-root']),
      faqRefs(['best-time', 'taste', 'how-long', 'vegan', 'storage', 'extra-question']),
      color('#27442F'),
      text('tagline', 'A full scoop of greens in 20 seconds.'),
      benefits(['Four whole-food ingredients, nothing to chop', 'Mixes smooth in cold water or a smoothie', 'One scoop a day, no routine to rebuild']),
      text('story_headline', "Most mornings don't leave room for a salad."),
      body('story_body', 'Daily Greens puts spirulina, wheatgrass, matcha and ginger into one scoop. It takes less time than making coffee, so the habit actually lasts.'),
      testimonialRefs(['greens-maya', 'greens-tom', 'greens-ana']),
    ],
  },
  {
    handle: 'daily-greens-travel-sticks',
    title: 'Daily Greens Travel Sticks',
    image: 'product-travel-sticks',
    description: 'The same greens in single-serve sticks for your bag.',
    templateSuffix: 'faq-first',
    variants: [{ name: 'Default Title', price: '24.00', servings: 14 }],
    metafields: [
      howTo(steps.greens),
      ingredientRefs(['spirulina', 'wheatgrass', 'matcha', 'ginger-root']),
      faqRefs(['best-time', 'taste', 'vegan']),
      color('#27442F'),
      text('tagline', 'The same greens, ready for your bag.'),
      benefits(['One stick, one serving', 'No scoop to carry', 'Fourteen sticks in every box']),
      text('story_headline', 'Good routines break the moment you travel.'),
      body('story_body', 'Each stick holds one serving of Daily Greens. Tear it into a bottle of water and your routine comes with you.'),
    ],
  },
  {
    handle: 'magnesium-night-capsules',
    title: 'Magnesium Night Capsules',
    image: 'product-magnesium-night',
    description: 'A simple two-capsule step for the end of the day.',
    variants: [{ name: 'Default Title', price: '28.00', servings: 30 }],
    metafields: [
      howTo(steps.magnesium),
      faqRefs(['capsule-count', 'with-food']),
      color('#2C2A4A'),
      text('tagline', 'A simple step for the end of your day.'),
      benefits(['Two capsules, about an hour before bed', 'No powders and no mixing', 'A 30-day supply in every bottle']),
      text('story_headline', 'An evening routine should be easy to keep.'),
      body('story_body', "Two capsules with a glass of water. That's the whole step, so it still happens on the nights you're tired."),
      testimonialRefs(['magnesium-joe', 'magnesium-lena']),
    ],
  },
  {
    handle: 'marine-collagen-peptides',
    title: 'Marine Collagen Peptides',
    image: 'product-marine-collagen',
    description: 'Unflavored peptides that dissolve in hot or cold drinks.',
    variants: [{ name: 'Default Title', price: '42.00', compareAt: '48.00', servings: 30 }],
    metafields: [
      howTo(steps.collagen),
      ingredientRefs(['marine-collagen', 'vitamin-c']),
      badge('Bestseller'),
      color('#9C4630'),
      text('tagline', 'Stir it into the coffee you already drink.'),
      benefits(['Dissolves in hot or cold drinks', 'No flavor to hide', 'One scoop, once a day']),
      text('story_headline', "The best routine is the one you're already doing."),
      body('story_body', "Marine Collagen dissolves into coffee, tea or a smoothie, so there's nothing new to remember."),
      testimonialRefs(['collagen-priya']),
    ],
  },
  {
    handle: 'vitamin-c-drink-mix',
    title: 'Vitamin C Drink Mix',
    image: 'product-vitamin-c-mix',
    description: 'Every metafield exists and every value renders nothing: an empty list, a draft ingredient and an FAQ with an empty answer. The whole section should disappear.',
    variants: [{ name: 'Default Title', price: '19.00' }],
    metafields: [
      howTo([]),
      ingredientRefs(['draft-only-ingredient']),
      faqRefs(['empty-answer']),
    ],
  },
  {
    handle: 'bamboo-measuring-scoop',
    title: 'Bamboo Measuring Scoop',
    image: 'product-bamboo-scoop',
    description: 'No metafields at all, so the section renders nothing.',
    variants: [{ name: 'Default Title', price: '6.00' }],
    metafields: [badge('New')],
  },
];

export const collections = [
  {
    handle: 'task-1b-cards',
    title: 'Task 1b: fixed card snippet',
    templateSuffix: 'task-1b',
    description: 'Renders the corrected snippet from Task 1b.',
    products: ['daily-greens-powder', 'marine-collagen-peptides', 'magnesium-night-capsules', 'bamboo-measuring-scoop'],
  },
];
