import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from '../sanity/sanityClient'

const builder = createImageUrlBuilder(client)

// Export a reusable function
export function urlFor(source: any) {
  return builder.image(source)
}