import {
    derived,
    get,
    writable,
    type Readable,
    type Writable,
} from 'svelte/store';
import eng from './translations/en';
import spa from './translations/es';
import type LanguageCode from './LanguageCode';
import type Translation from './Translation';
import type { WritingDirection, WritingLayout } from './LanguageCode';
import { getPersistedValue, setPersistedValue } from '@components/app/persist';

/** Global list of preferred languages. */
const LANGUAGES_KEY = 'languages';
export const preferredLanguages: Writable<LanguageCode[]> = writable(
    getPersistedValue<string[]>(LANGUAGES_KEY) ?? ['en']
);

/** Persist preferred languages whenever changed */
preferredLanguages.subscribe((languages) =>
    setPersistedValue(LANGUAGES_KEY, languages)
);

/** A global setting for writing layout */

/** A global setting for writing direction */
export const writingLayout: Writable<WritingLayout> = writable('horizontal-tb');
export const writingDirection: Writable<WritingDirection> = writable('ltr');

/** A list of translations officially supported by Wordplay. */
const SupportedTranslations: Translation[] = [eng, spa];

export type MissingTranslation = LanguageCode;

/**
 * A utility for converting preferred languages and style into a list of translations,
 * for components that require a translation. Defaults to eng#wordplay if nothing else
 * is available.
 */
export const preferredTranslations: Readable<Translation[]> = derived(
    [preferredLanguages],
    () => {
        // Map preferrred languages into translations,
        // filtering out missing translations, and
        // choosing preferred style of translations of the same language.
        const languages = get(preferredLanguages);

        const translations: Translation[] = languages
            .map((lang) => {
                const translationsInLanguage = SupportedTranslations.filter(
                    (translation) => translation.language === lang
                );
                return translationsInLanguage[0] ?? undefined;
            })
            .filter((trans): trans is Translation => trans !== undefined);

        return translations.length === 0 ? [eng] : translations;
    }
);

export const missingTranslations: Readable<LanguageCode[]> = derived(
    [preferredLanguages],
    () => {
        return get(preferredLanguages).filter(
            (lang) =>
                !SupportedTranslations.some((trans) => trans.language === lang)
        );
    }
);

export default SupportedTranslations;
