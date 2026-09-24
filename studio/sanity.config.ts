import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'
import { visionTool } from '@sanity/vision'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import { arabicLocaleBundle } from './locales/arabicLocale'

export default defineConfig({
  name: 'default',
  // 1. Change the Studio title directly to Arabic
  title: 'لوحة التحكم', 

  projectId: 'ikhpv9gn',
  dataset: 'production',

  i18n: {
    locales: [
      { 
        id: 'en', 
        title: 'English',
        weekInfo: { firstDay: 1, minimalDays: 4, weekend: [6, 7] } 
      },
      { 
        id: 'ar', 
        title: 'العربية',
        // 2. Setting dir to 'rtl' forces right-to-left layout for Arabic
        dir: 'rtl', 
        weekInfo: { firstDay: 6, minimalDays: 1, weekend: [5, 6] } 
      }
    ],
    bundles: [arabicLocaleBundle],
    unstable_defaultLocale: 'ar',
  },

  plugins: [
    structureTool(),
    visionTool(),
    unsplashImageAsset(),
  ],

  schema: {
    types: schemaTypes,
  },
})