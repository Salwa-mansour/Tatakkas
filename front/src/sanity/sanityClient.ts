import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url' // Use named import

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-08-01',
})

// Initialize builder using createImageUrlBuilder
const builder = createImageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}