import { defineType, defineField } from 'sanity';
import { LocationSelector } from '../components/LocationSelector'


export const postType = defineType({
  name: 'post',
  title: 'Travel Post',
  type: 'document',
  // 1. Define your collapsible fieldsets here
  fieldsets: [
    {
      name: 'seasonalSection',
      title: 'Seasonal Advice & Affiliates',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'hotelSection',
      title: 'Hotel Affiliate (Global Fallback)',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'flightSection',
      title: 'Flight Affiliate (Global Fallback)',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Post Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
   
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
     defineField({
     name: 'mainImage',
    title: 'Main Image',
    type: 'imageWithAttribution', // Use your custom schema type here
    }),
    
   defineField({
      name: 'locationDetails',
      title: 'Destination Location',
      description: 'Select country and city to automatically save coordinates.',
      type: 'object',
      validation: (Rule) => Rule.required(),
      components: {
        input: LocationSelector, // Registers your custom React dropdown component
      },
      fields: [
        { name: 'countryName', type: 'string' },
        { name: 'countryCode', type: 'string' },
        { name: 'cityName', type: 'string' },
        { name: 'lat', type: 'number' },
        { name: 'lng', type: 'number' },
      ],
    }),
    defineField({
      name: 'excerpt',
      title: 'Post excerpt -- overview summary',
      type: 'string',
  
    }),
    // ----------------------------------------------------
    // NEW: Seasonal Advice & Affiliate Blocks Array
    // ----------------------------------------------------
   defineField({
      name: 'seasonalAffiliates',
      title: 'Season Blocks',
      type: 'array',
      fieldset: 'seasonalSection',
      of: [
        defineField({
          name: 'seasonBlock',
          title: 'Season Block',
          type: 'object',
          fields: [
            defineField({
              name: 'seasonName',
              title: 'Season / Time of Year',
              type: 'string',
              options: {
                list: [
                  { title: 'Winter', value: 'winter' },
                  { title: 'Spring', value: 'spring' },
                  { title: 'Summer', value: 'summer' },
                  { title: 'Autumn / Fall', value: 'autumn' },
                  { title: 'Rain', value: 'rain' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'advice',
              title: 'Seasonal Advice',
              type: 'text',
              description: 'e.g., Great weather for walking, but pack an umbrella for sudden afternoon showers.',
            }),
            defineField({
              name: 'affiliateText',
              title: 'Button/Callout Text',
              type: 'string',
              description: 'e.g., Find cozy indoor hotels & deals',
            }),
            defineField({
              name: 'affiliateLink',
              title: 'Affiliate URL',
              type: 'url',
            }),
          ],
        }),
      ],
    }),

    // 3. Hotel Fields flattened into the hotel fieldset
    defineField({
      name: 'hotelAffiliateLink',
      title: 'Affiliate URL',
      type: 'url',
      fieldset: 'hotelSection',
    }),
    defineField({
      name: 'hotelAffiliateText',
      title: 'Button/Callout Text',
      type: 'string',
      fieldset: 'hotelSection',
      description: 'e.g., Find best hotels for these dates',
    }),
    defineField({
      name: 'hotelDescription',
      title: 'Helper Description / Advice',
      type: 'text',
      fieldset: 'hotelSection',
      description: 'e.g., Book your stay in advance to secure the best rates.',
    }),

    // 4. Flight Fields flattened into the flight fieldset
    defineField({
      name: 'flightAffiliateLink',
      title: 'Affiliate URL',
      type: 'url',
      fieldset: 'flightSection',
    }),
    defineField({
      name: 'flightAffiliateText',
      title: 'Button/Callout Text',
      type: 'string',
      fieldset: 'flightSection',
      description: 'e.g., Search available flights',
    }),
    defineField({
      name: 'flightDescription',
      title: 'Helper Description / Advice',
      type: 'text',
      fieldset: 'flightSection',
      description: 'e.g., Compare airline ticket prices for your travel window.',
    }),
    defineField({
      name: 'tags',
      title: 'Post Tags',
      description: 'Select relevant tags for this travel destination.',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'tag' }],
        },
      ],
    }),
   defineField({
      name: 'body',
      title: 'Body Content',
      type: 'array',
      of: [
        { type: 'block' },
        {
          name: 'image', // Keep name as 'image' so Portable Text recognizes it as an image block
          title: 'Image',
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'imageAttribution',
              title: 'Image Attribution (HTML / Text)',
              type: 'text',
              rows: 2,
              description: 'Paste the full Unsplash attribution text or HTML here.',
              options: {
                isHighlighted: true, // Shows up directly when you click edit on the image in the editor
              },
            },
          ],
        },
      ],
    }),
    // Embed the SEO object here for post-specific overrides
    defineField({
      name: 'seo',
      title: 'Post SEO & Metadata',
      type: 'seo',
    }),
  ],
});