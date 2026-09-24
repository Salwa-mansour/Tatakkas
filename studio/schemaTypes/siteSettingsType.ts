import { defineType, defineField } from 'sanity';

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Global Data',
  type: 'document',
  
  // 1. Define your collapsible fieldsets here
  fieldsets: [
    {
      name: 'hotelSection',
      title: 'Default Hotel Affiliate Settings',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'flightSection',
      title: 'Default Flight Affiliate Settings',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'seasonalSection',
      title: 'Seasonal Advice & Affiliates',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'tagSection',
      title: 'Tag-Based Affiliate Links',
      options: { collapsible: true, collapsed: true },
    },
  ],

  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      initialValue: 'My Travel Weather Blog',
    }),
    // seo elements
    defineField({
      name: 'title',
      title: 'Global Site Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'favicon',
      title: 'Tab Icon (Favicon)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'siteLogo',
      title: 'Site Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'footerParagraph',
      title: 'Footer Paragraph',
      type: 'string',
    }),
    // Embed the SEO object here for global defaults/fallback values
    defineField({
      name: 'seo',
      title: 'Default SEO Settings',
      type: 'seo', 
    }),

    // ----------------------------------------------------
    // Default Global Hotel Affiliate Block (Flattened to Fieldset)
    // ----------------------------------------------------
    defineField({
      name: 'defaultHotelAffiliateLink',
      title: 'Affiliate URL',
      type: 'url',
      fieldset: 'hotelSection',
    }),
    defineField({
      name: 'defaultHotelAffiliateText',
      title: 'Button/Callout Text',
      type: 'string',
      fieldset: 'hotelSection',
      description: 'e.g., Find best hotels for these dates',
    }),
    defineField({
      name: 'defaultHotelDescription',
      title: 'Helper Description / Advice',
      type: 'text',
      fieldset: 'hotelSection',
      description: 'e.g., Book your stay in advance to secure the best rates.',
    }),

    // ----------------------------------------------------
    // Default Global Flight Affiliate Block (Flattened to Fieldset)
    // ----------------------------------------------------
    defineField({
      name: 'defaultFlightAffiliateLink',
      title: 'Affiliate URL',
      type: 'url',
      fieldset: 'flightSection',
    }),
    defineField({
      name: 'defaultFlightAffiliateText',
      title: 'Button/Callout Text',
      type: 'string',
      fieldset: 'flightSection',
      description: 'e.g., Search available flights',
    }),
    defineField({
      name: 'defaultFlightDescription',
      title: 'Helper Description / Advice',
      type: 'text',
      fieldset: 'flightSection',
      description: 'e.g., Compare airline ticket prices for your travel window.',
    }),

    // ----------------------------------------------------
    // Seasonal Advice & Affiliates Array
    // ----------------------------------------------------
    defineField({
      name: 'seasonalAffiliates',
      title: 'Season Blocks',
      type: 'array',
      fieldset: 'seasonalSection',
      description: 'Add tailored advice and affiliate links based on the time of year or season.',
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

    // ----------------------------------------------------
    // Centralized Tag-Based Affiliate Map
    // ----------------------------------------------------
    defineField({
      name: 'tagAffiliates',
      title: 'Tag Mappings',
      type: 'array',
      fieldset: 'tagSection',
      description: 'Map simple text tags to specific affiliate links globally across the site.',
      of: [
        defineField({
          name: 'tagMapping',
          title: 'Tag Mapping',
          type: 'object',
          fields: [
            defineField({
              name: 'tagName',
              title: 'Tag Name',
              type: 'reference',
              to: [{ type: 'tag' }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'affiliateLink',
              title: 'Affiliate URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'affiliateText',
              title: 'Button/Callout Text',
              type: 'string',
              description: 'e.g., Shop top-rated hiking gear',
            }),
            defineField({
              name: 'description',
              title: 'Promo Description / Tip',
              type: 'text',
              description: 'e.g., Make sure you have proper trail footwear before heading out.',
            }),
          ],
        }),
      ],
    }),
  ],
});