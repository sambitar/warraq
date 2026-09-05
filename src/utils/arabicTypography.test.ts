import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatFootnoteMarker,
  formatCitationSuperscript,
  stripTashkeel,
  countArabicWords,
  countArabicChars,
  replaceArabicMacros,
  ARABIC_HONORIFICS,
  ARABIC_CITATION_TERMS,
} from './arabicTypography';

describe('Arabic Typography & Numerals Utility', () => {
  it('converts numbers to Eastern Arabic numerals properly', () => {
    expect(formatNumber(1, 'eastern')).toBe('١');
    expect(formatNumber(14, 'eastern')).toBe('١٤');
    expect(formatNumber(2026, 'eastern')).toBe('٢٠٢٦');
    expect(formatNumber('45', 'eastern')).toBe('٤٥');
  });

  it('preserves Western Arabic numerals when western system is chosen', () => {
    expect(formatNumber(14, 'western')).toBe('14');
    expect(formatNumber(2026, 'western')).toBe('2026');
  });

  it('formats footnote and citation markers correctly', () => {
    expect(formatFootnoteMarker(3, 'eastern')).toBe('(٣)');
    expect(formatFootnoteMarker(3, 'western')).toBe('(3)');
    expect(formatCitationSuperscript(7, 'eastern')).toBe('[٧]');
    expect(formatCitationSuperscript(7, 'western')).toBe('[7]');
  });

  it('strips Arabic Tashkeel (harakat) and tatweel cleanly', () => {
    const vocalized = 'مُحَمَّدٌ رَسُولُ اللَّـهِ';
    const plain = stripTashkeel(vocalized);
    expect(plain).toBe('محمد رسول الله');
  });

  it('counts words accurately without being skewed by Tashkeel or HTML tags', () => {
    const htmlText = '<p>إنَّ التَّارِيخَ <strong>فِي ظَاهِرِهِ</strong> لَا يَزِيدُ عَلَى أَخْبَارٍ</p>';
    const words = countArabicWords(htmlText);
    expect(words).toBe(8);
  });

  it('counts characters with and without diacritics', () => {
    const vocalized = 'كِتَابٌ';
    expect(countArabicChars(vocalized, true)).toBe(7); // kaf + kasra + ta + fatha + alef + ba + tanween damma
    expect(countArabicChars(vocalized, false)).toBe(4); // kaf + ta + alef + ba
  });

  it('replaces typing macros with honorific ligatures', () => {
    expect(replaceArabicMacros('قال النبي (ص)')).toBe('قال النبي ﷺ');
    expect(replaceArabicMacros('عن علي (رض)')).toBe('عن علي رضي الله عنه');
    expect(replaceArabicMacros('عيسى (ع)')).toBe('عيسى عليه السلام');
    expect(replaceArabicMacros('الله (ج)')).toBe('الله جل جلاله');
  });

  it('has comprehensive scholarly honorifics and citation terms', () => {
    expect(ARABIC_HONORIFICS.length).toBeGreaterThanOrEqual(6);
    expect(ARABIC_CITATION_TERMS.length).toBeGreaterThanOrEqual(6);
    expect(ARABIC_CITATION_TERMS.some((t) => t.label.includes('مرجع سابق'))).toBe(true);
  });
});
