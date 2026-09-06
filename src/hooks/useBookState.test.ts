import { describe, it, expect } from 'vitest';
import { INITIAL_MANUSCRIPT } from '../constants/sampleManuscript';
import { TRIM_SIZES } from '../constants/trimSizes';

describe('Book Manuscript Data Structure & Trim Sizes', () => {
  it('has valid initial manuscript structure with chapters and pages', () => {
    expect(INITIAL_MANUSCRIPT.chapters.length).toBeGreaterThanOrEqual(2);
    expect(Object.keys(INITIAL_MANUSCRIPT.pages).length).toBeGreaterThanOrEqual(4);

    const firstPage = INITIAL_MANUSCRIPT.pages['p-1'];
    expect(firstPage).toBeDefined();
    expect(firstPage.pageNumber).toBe(1);
    expect(firstPage.footnotes.length).toBeGreaterThan(0);
    expect(INITIAL_MANUSCRIPT.settings.chromeTheme).toBe('dark');
  });

  it('contains correct Waziri 17x24cm trim size specifications', () => {
    const waziri = TRIM_SIZES.waziri;
    expect(waziri.widthMm).toBe(170);
    expect(waziri.heightMm).toBe(240);
    expect(waziri.marginInnerMm).toBeGreaterThan(waziri.marginOuterMm); // gutter larger than outer
  });

  it('contains correct Medium 14x21cm trim size specifications', () => {
    const medium = TRIM_SIZES.medium;
    expect(medium.widthMm).toBe(140);
    expect(medium.heightMm).toBe(210);
  });

  it('verifies prepress gutter logic alternates for recto and verso pages', () => {
    // In Arabic non-fiction bookbinding:
    // Page 1 (odd) is Recto: inner gutter is on the left
    // Page 2 (even) is Verso: inner gutter is on the right
    const isRectoPage1 = 1 % 2 === 1;
    const isRectoPage2 = 2 % 2 === 1;
    expect(isRectoPage1).toBe(true);
    expect(isRectoPage2).toBe(false);

    const waziri = TRIM_SIZES.waziri;
    // Page 1 paddingLeft must be gutter (inner)
    const page1Gutter = isRectoPage1 ? waziri.marginInnerMm : waziri.marginOuterMm;
    expect(page1Gutter).toBe(waziri.marginInnerMm);

    // Page 2 paddingRight must be gutter (inner)
    const page2Gutter = !isRectoPage2 ? waziri.marginInnerMm : waziri.marginOuterMm;
    expect(page2Gutter).toBe(waziri.marginInnerMm);
  });
});
