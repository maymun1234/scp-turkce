// constants/i18n.ts
import { CONFIG } from './config';
import { en, tr } from './lan';

// Config'den uygulama adına bakıp dili seçiyoruz
const currentLanguage = CONFIG.APP_NAME === 'SCP Türkçe' ? tr : en;

// Dil kodunu da dışarı aktaralım (API istekleri için lazım oluyor 'tr'/'en' gibi)
export const langCode = CONFIG.APP_NAME === 'SCP Türkçe' ? 'tr' : 'en';

/**
 * Bu fonksiyon anahtar kelimeyi alır ve o anki dildeki karşılığını verir.
 * Örnek Kullanım: t('comments_title') -> "YORUMLAR"
 */
export function t(key: keyof typeof tr) {
  return currentLanguage[key];
}