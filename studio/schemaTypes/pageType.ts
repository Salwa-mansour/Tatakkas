import { defineType, defineField } from 'sanity';

export const pageType = defineType({
  name: 'page',
  title: 'Pages',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Page description',
      type: 'string',
     
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
     // Embed the SEO object here for post-specific overrides
    defineField({
      name: 'seo',
      title: 'Post SEO & Metadata',
      type: 'seo',
    })
    ,
    {
      name: 'headerImage',
      title: 'Header Image',
      type: 'imageWithAttribution',
      options: { 
        hotspot: true // Enables image cropping and focal point selection in Sanity Studio
      },
      description: 'Optional banner image displayed at the top of the page.',
    },
    {
      name: 'content',
      title: 'Page Content',
      type: 'array',
      of: [
        { type: 'block' }, // Standard rich text blocks
        { 
          type: 'image',
          options: { hotspot: true } // Allows adding images inside the page content if needed
        }
      ],
    },
  ],
});