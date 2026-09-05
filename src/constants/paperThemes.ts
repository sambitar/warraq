import type { PaperTheme, PaperThemeId } from '../types/book';

export const PAPER_THEMES: Record<PaperThemeId, PaperTheme> = {
  chamois: {
    id: 'chamois',
    nameArabic: 'ورق شمواه (Munken Cream)',
    backgroundColor: '#F8F5EC', // Authentic Munken Cream book paper
    pageBorderColor: '#E2DAC8',
    textColor: '#1F1A16',
    secondaryTextColor: '#665C52',
    separatorColor: '#C4B9A5',
    deskBackground: '#1C1917', // Dark wood / slate desk
    spineShadow: 'linear-gradient(to right, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.06) 45%, rgba(0,0,0,0) 100%)',
  },
  ivory: {
    id: 'ivory',
    nameArabic: 'ورق عاجي ناعم',
    backgroundColor: '#FAF8F3',
    pageBorderColor: '#E5E0D5',
    textColor: '#21201D',
    secondaryTextColor: '#6B6861',
    separatorColor: '#CFCAC0',
    deskBackground: '#1E2124',
    spineShadow: 'linear-gradient(to right, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0) 100%)',
  },
  white: {
    id: 'white',
    nameArabic: 'ورق أبيض مطبعي',
    backgroundColor: '#FFFFFF',
    pageBorderColor: '#E2E2E6',
    textColor: '#111827',
    secondaryTextColor: '#4B5563',
    separatorColor: '#D1D5DB',
    deskBackground: '#181A20',
    spineShadow: 'linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.04) 45%, rgba(0,0,0,0) 100%)',
  },
  sepia: {
    id: 'sepia',
    nameArabic: 'ورق تراثي دافئ',
    backgroundColor: '#F2E8D5',
    pageBorderColor: '#D8C7AA',
    textColor: '#2A1F17',
    secondaryTextColor: '#705844',
    separatorColor: '#BCA88C',
    deskBackground: '#15120F',
    spineShadow: 'linear-gradient(to right, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0) 100%)',
  },
};
