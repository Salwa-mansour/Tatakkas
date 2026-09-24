// src/locales/arabicLocale.ts
import { defineLocaleResourceBundle } from 'sanity'

export const arabicLocaleBundle = defineLocaleResourceBundle({
  locale: 'ar',
  namespace: 'sanity', // Targets the core Studio UI namespace
  resources: {
    // Action buttons
    'action.publish': 'نشر',
    'action.publish.running': 'جاري النشر...',
    'action.save': 'حفظ',
    'action.save-draft': 'حفظ كمسودة',
    'action.discard': 'تجاهل التغييرات',
    'action.delete': 'حذف',
    'action.duplicate': 'تكرار',
    
    // Document status labels
    'document.status.unpublished': 'غير منشور',
    'document.status.published': 'منشور',
    'document.status.changes-edits': 'يوجد تغييرات غير محفوظة',
  },
})