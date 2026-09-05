import type { NumeralSystem } from '../types/book';

const EASTERN_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function formatNumber(n: number | string, system: NumeralSystem): string {
  const str = String(n);
  if (system === 'western') return str;
  return str.replace(/[0-9]/g, (digit) => EASTERN_DIGITS[parseInt(digit, 10)] ?? digit);
}

export function formatFootnoteMarker(n: number, system: NumeralSystem): string {
  const num = formatNumber(n, system);
  return `(${num})`;
}

export function formatCitationSuperscript(n: number, system: NumeralSystem): string {
  const num = formatNumber(n, system);
  return `[${num}]`;
}

// Arabic Tashkeel, diacritics, tatweel and Quranic marks Unicode range
export const TASHKEEL_REGEX = /[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g;

export function stripTashkeel(text: string): string {
  return text.replace(TASHKEEL_REGEX, '');
}

export function countArabicWords(text: string): number {
  if (!text) return 0;
  // Strip HTML tags first
  const clean = text.replace(/<[^>]*>/g, ' ');
  const words = clean
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0 && !/^[\d\p{P}]+$/u.test(w));
  return words.length;
}

export function countArabicChars(text: string, includeDiacritics: boolean = false): number {
  if (!text) return 0;
  const clean = text.replace(/<[^>]*>/g, '');
  const target = includeDiacritics ? clean : stripTashkeel(clean);
  return target.replace(/\s+/g, '').length;
}

// Common Arabic academic abbreviations and honorifics
export interface HonorificShortcut {
  key: string;
  label: string;
  replacement: string;
  description: string;
}

export const ARABIC_HONORIFICS: HonorificShortcut[] = [
  { key: 'pbuh', label: 'ﷺ', replacement: 'ﷺ', description: 'صلى الله عليه وسلم' },
  { key: 'as', label: 'عليه السلام', replacement: 'عليه السلام', description: 'عليه السلام للأنبياء والملائكة' },
  { key: 'ra', label: 'رضي الله عنه', replacement: 'رضي الله عنه', description: 'للصحابة الكرام' },
  { key: 'rah', label: 'رحمه الله', replacement: 'رحمه الله', description: 'للعلماء والمفكرين' },
  { key: 'jj', label: 'جل جلاله', replacement: 'جل جلاله', description: 'لفظ الجلالة' },
  { key: 'ta', label: 'تعالى', replacement: 'تعالى', description: 'سبحانه وتعالى' },
];

export const ARABIC_CITATION_TERMS: { label: string; text: string }[] = [
  { label: 'انظر:', text: 'انظر: ' },
  { label: 'مرجع سابق', text: 'مرجع سابق، ' },
  { label: 'المصدر نفسه', text: 'المصدر نفسه، ' },
  { label: 'ج / ص', text: 'ج ، ص .' },
  { label: 'تحقيق:', text: 'تحقيق: ' },
  { label: 'طبعة:', text: 'ط١، ' },
  { label: 'د.ت (بدون تاريخ)', text: '(د.ت)' },
  { label: 'د.ن (بدون ناشر)', text: '(د.ن)' },
];

export function replaceArabicMacros(input: string): string {
  let result = input;
  // Replace honorific shortcuts in parentheses
  result = result.replace(/\(ص\)/g, 'ﷺ');
  result = result.replace(/\(رض\)/g, 'رضي الله عنه');
  result = result.replace(/\(ع\)/g, 'عليه السلام');
  result = result.replace(/\(رح\)/g, 'رحمه الله');
  result = result.replace(/\(ج\)/g, 'جل جلاله');
  return result;
}
