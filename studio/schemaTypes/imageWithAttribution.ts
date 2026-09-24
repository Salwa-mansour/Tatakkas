// schemaTypes/imageWithAttribution.ts
import { defineType, defineField } from 'sanity'

export const imageWithAttribution = defineType({
  name: 'imageWithAttribution',
  title: 'Image with Attribution',
  type: 'image',
  options: {
    hotspot: true,
  },
  fields: [
    defineField({
      name: 'imageAttribution',
      title: 'Image Attribution (HTML / Text)',
      type: 'text',
      rows: 2,
      description: 'Paste the full  attribution text or HTML here.',
    })
  ],
})