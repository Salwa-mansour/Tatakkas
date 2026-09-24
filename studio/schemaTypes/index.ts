import {postType}  from './postType'
import {homeType} from './homeType'
import { pageType } from './pageType'
import { siteSettingsType } from './siteSettingsType'
import { tagType } from './tagType'
import { imageWithAttribution } from './imageWithAttribution' 
import { seoType } from './seoType'

export const schemaTypes = [
    postType,
    tagType,
    homeType,
    pageType,
    siteSettingsType,
    imageWithAttribution,
    seoType
]