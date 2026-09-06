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
});
