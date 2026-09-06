export type TrimSizeId = 'waziri' | 'medium' | 'a5' | 'quarto' | 'pocket';

export interface TrimSize {
  id: TrimSizeId;
  nameArabic: string;
  nameEnglish: string;
  widthMm: number;
  heightMm: number;
  description: string;
  marginTopMm: number;
  marginBottomMm: number;
  marginInnerMm: number;  // binding gutter
  marginOuterMm: number;  // thumb margin
  defaultFontSizePt: number;
  defaultLineHeight: number;
}

export type PaperThemeId = 'chamois' | 'ivory' | 'white' | 'sepia';

export interface PaperTheme {
  id: PaperThemeId;
  nameArabic: string;
  backgroundColor: string;
  pageBorderColor: string;
  textColor: string;
  secondaryTextColor: string;
  separatorColor: string;
  deskBackground: string;
  spineShadow: string;
}

export type NumeralSystem = 'eastern' | 'western'; // 'eastern' = ١، ٢، ٣ | 'western' = 1, 2, 3

export type ArabicFontFamily = 'Amiri' | 'Scheherazade New' | 'Traditional Arabic' | 'Noto Naskh Arabic';

export interface FootnoteItem {
  id: string;
  index: number; // 1, 2, 3...
  text: string;
}

export interface BookPage {
  id: string;
  pageNumber: number; // 1-based overall book page number
  chapterId: string;
  htmlContent: string;
  footnotes: FootnoteItem[];
}

export interface Chapter {
  id: string;
  title: string;
  subtitle?: string;
  epigraph?: string; // تصدير أو حكمة في أول الفصل
  pageIds: string[];
}

export interface BookMetadata {
  title: string;
  subtitle: string;
  author: string;
  publisher?: string;
  editionYear?: string;
}

export type ChromeTheme = 'dark' | 'light';

export interface BookSettings {
  trimSizeId: TrimSizeId;
  paperThemeId: PaperThemeId;
  chromeTheme: ChromeTheme;
  fontFamily: ArabicFontFamily;
  fontSizePt: number;
  lineHeight: number;
  numeralSystem: NumeralSystem;
  zoomLevel: number; // 0.75, 1, 1.25, etc.
  viewMode: 'spread' | 'single';
  showGrid: boolean;
  autoKashida: boolean;
  paragraphIndent: boolean;
}

export interface Manuscript {
  version: string;
  metadata: BookMetadata;
  settings: BookSettings;
  chapters: Chapter[];
  pages: Record<string, BookPage>;
  activeChapterId: string;
  activePageId: string;
}
