// schemaTypes/seoType.ts
import { defineType, defineField } from 'sanity'

export const seoType = defineType({
  name: 'seo',
  title: 'SEO & Metadata',
  type: 'object',
  options: {
    collapsible: true,
    collapsed: true, // Keeps the editor clean by default
  },
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Overrides the main title for search engines (keep under 60 characters).',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 2,
      description: 'Brief summary for search results (keep under 160 characters).',
    }),
    defineField({
      name: 'openGraphImage',
      title: 'Social Share Image (OG Image)',
      type: 'image',
      description: 'Image displayed when sharing on social media (Recommended: 1200x630px).',
      options: { hotspot: true },
    }),
  ],
})