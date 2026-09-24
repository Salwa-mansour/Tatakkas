import { defineType, defineField } from 'sanity';

export const homeType = defineType({
  name: 'home',
  title: 'Home Page',
  type: 'document',
  fields: [
    // --- 1. HERO SECTION ---
    {
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
    },
    {
      name: 'heroText',
      title: 'Hero Paragraph',
      type: 'text',
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'imageWithAttribution',
      options: { hotspot: true },
    },
    {
      name: 'heroCtaText',
      title: 'Hero CTA Button Text',
      type: 'string',
    },
    {
      name: 'heroCtaLink',
      title: 'Hero CTA Link URL',
      type: 'string',
    },

    // --- 2. FEATURES SECTION ---
    {
      name: 'featuresHeading',
      title: 'Features Section Heading',
      type: 'string',
    },
    {
      name: 'featuresSubheading',
      title: 'Features Section Subheading',
      type: 'string',
    },
    {
      name: 'featuresList',
      title: 'Features List',
      type: 'array',
      // Enforces a maximum of 5 features
      validation: (Rule) => Rule.max(5),
      of: [
        {
          type: 'object',
          name: 'featureItem',
          title: 'Feature Item',
          fields: [
            {
              name: 'image',
              title: 'Feature Image',
              type: 'image',
              options: { hotspot: true },
            },
            {
              name: 'heading',
              title: 'Feature Heading',
              type: 'string',
            },
            {
              name: 'text',
              title: 'Feature Text',
              type: 'text',
            },
            {
              name: 'linkedPost',
              title: 'Link to Post (Optional)',
              type: 'reference',
              description: 'Select a post if you want this feature to link to a specific blog post.',
              to: [{ type: 'post' }], // Assumes your blog posts schema type is named 'post'
            },
          ],
        },
      ],
    },
    {
      name: 'featuresCtaText',
      title: 'Features CTA Button Text',
      type: 'string',
    },
    {
      name: 'featuresCtaLink',
      title: 'Features CTA Link URL',
      type: 'string',
    },
  ],
});