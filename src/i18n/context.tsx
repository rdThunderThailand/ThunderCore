'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Locale, translations } from './translations';

interface I18nContextType {
    locale: Locale;
    t: (key: string) => string;
    setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
    locale: 'en',
    t: (key: string) => key,
    setLocale: () => { },
});

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');

    // Sync with localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('thunder-lang') as Locale | null;
        if (saved && translations[saved]) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocaleState(saved);
        }
    }, []);

    // Listen for language-changed events from LanguageSelector
    useEffect(() => {
        const handler = (e: Event) => {
            const lang = (e as CustomEvent).detail as string;
            if (lang === 'en' || lang === 'th') {
                setLocaleState(lang);
            }
        };
        window.addEventListener('language-changed', handler);
        return () => window.removeEventListener('language-changed', handler);
    }, []);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('thunder-lang', newLocale);
        window.dispatchEvent(new CustomEvent('language-changed', { detail: newLocale }));
    }, []);

    const t = useCallback((key: string): string => {
        return translations[locale]?.[key] || translations['en']?.[key] || key;
    }, [locale]);

    return (
        <I18nContext.Provider value={{ locale, t, setLocale }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    return useContext(I18nContext);
}

export { type Locale };
