import React from 'react';
import type { Manuscript, PrepressOptions } from '../types/book';
import { TRIM_SIZES } from '../constants/trimSizes';
import { formatNumber, formatFootnoteMarker } from '../utils/arabicTypography';

interface PrintBookDocumentProps {
  manuscript: Manuscript;
  options: PrepressOptions;
}

export const PrintBookDocument: React.FC<PrintBookDocumentProps> = ({
  manuscript,
  options,
}) => {
  const { settings, metadata, chapters } = manuscript;
  const currentTrim = TRIM_SIZES[settings.trimSizeId];

  // Extract all pages sorted sequentially (1, 2, 3...)
  const rawPages = Object.values(manuscript.pages).sort(
    (a, b) => a.pageNumber - b.pageNumber
  );

  // Signatures padding calculation (multiples of 4 pages)
  let pagesToPrint = [...rawPages];
  if (options.padSignatures) {
    const remainder = pagesToPrint.length % 4;
    const paddingNeeded = remainder === 0 ? 0 : 4 - remainder;
    for (let i = 0; i < paddingNeeded; i++) {
      const padNum = pagesToPrint.length + 1;
      pagesToPrint.push({
        id: `pad-${padNum}`,
        pageNumber: padNum,
        chapterId: '',
        htmlContent: '<div class="h-full flex items-center justify-center text-stone-300 text-xs"></div>',
        footnotes: [],
      });
    }
  }

  const findChapterForPage = (pageNumber: number) => {
    const page = rawPages.find((p) => p.pageNumber === pageNumber);
    if (!page) return undefined;
    return chapters.find((c) => c.id === page.chapterId);
  };

  const isWithCrops = options.exportMode === 'offset_bleed_crops';
  const slugMarginMm = isWithCrops ? 10 : 0; // 10mm slug margin for crop marks and registration
  const sheetWidthMm = currentTrim.widthMm + slugMarginMm * 2;
  const sheetHeightMm = currentTrim.heightMm + slugMarginMm * 2;

  const paperBgColor = options.paperBackground === 'white' ? '#FFFFFF' : '#FAF7F0';
  const textColor = options.inkMode === 'pure_black' ? '#000000' : '#222222';
  const secondaryTextColor = options.inkMode === 'pure_black' ? '#333333' : '#555555';
  const ruleColor = options.inkMode === 'pure_black' ? '#000000' : '#888888';

  return (
    <div 
      id="press-ready-master-document" 
      className="print-book-engine"
      dir="rtl"
    >
      {pagesToPrint.map((page) => {
        // In Arabic bookbinding:
        // Page 1 is Recto (Right page / مفردة يمنى)
        // Page 2 is Verso (Left page / مفردة يسرى)
        const isRecto = page.pageNumber % 2 === 1;

        // Alternating Gutters:
        // Recto: Spine is on the LEFT -> paddingLeft = gutter (inner), paddingRight = outer
        // Verso: Spine is on the RIGHT -> paddingRight = gutter (inner), paddingLeft = outer
        const paddingRightMm = isRecto ? currentTrim.marginOuterMm : currentTrim.marginInnerMm;
        const paddingLeftMm = isRecto ? currentTrim.marginInnerMm : currentTrim.marginOuterMm;

        const chapter = findChapterForPage(page.pageNumber);
        const isChapterTitlePage = page.htmlContent.includes('book-chapter-title') || page.pageNumber === 1;

        const headerTitle = isRecto 
          ? (chapter?.title || metadata.title)
          : metadata.title;

        const formattedPageNum = formatNumber(page.pageNumber, settings.numeralSystem);

        return (
          <div
            key={page.id}
            className="press-page-sheet"
            style={{
              width: `${sheetWidthMm}mm`,
              height: `${sheetHeightMm}mm`,
              backgroundColor: '#FFFFFF',
              position: 'relative',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pageBreakAfter: 'always',
              breakAfter: 'page',
              overflow: 'hidden',
            }}
          >
            {/* If Bleed & Crop Marks are enabled: render corner crop marks & prepress slug */}
            {isWithCrops && (
              <div 
                className="absolute inset-0 pointer-events-none select-none font-mono text-[7pt] text-stone-700"
                style={{ direction: 'ltr' }}
              >
                {/* Top Slug info */}
                <div 
                  className="absolute top-1 left-3 right-3 flex justify-between items-center text-[7pt] text-stone-600"
                >
                  <span>WARRAQ PREPRESS — {metadata.title || 'Untitled'} — P.{page.pageNumber}</span>
                  <span>TRIM: {currentTrim.widthMm}x{currentTrim.heightMm}mm | BLEED: 3mm | {options.inkMode === 'pure_black' ? 'K:100% BLACK' : 'CMYK'}</span>
                </div>

                {/* Top-Left Crop Marks */}
                <div 
                  className="absolute"
                  style={{ 
                    top: `${slugMarginMm - 5}mm`, 
                    left: `${slugMarginMm - 5}mm`,
                    width: '5mm', 
                    height: '5mm', 
                    borderRight: '0.25pt solid #000000', 
                    borderBottom: '0.25pt solid #000000' 
                  }} 
                />

                {/* Top-Right Crop Marks */}
                <div 
                  className="absolute"
                  style={{ 
                    top: `${slugMarginMm - 5}mm`, 
                    right: `${slugMarginMm - 5}mm`,
                    width: '5mm', 
                    height: '5mm', 
                    borderLeft: '0.25pt solid #000000', 
                    borderBottom: '0.25pt solid #000000' 
                  }} 
                />

                {/* Bottom-Left Crop Marks */}
                <div 
                  className="absolute"
                  style={{ 
                    bottom: `${slugMarginMm - 5}mm`, 
                    left: `${slugMarginMm - 5}mm`,
                    width: '5mm', 
                    height: '5mm', 
                    borderRight: '0.25pt solid #000000', 
                    borderTop: '0.25pt solid #000000' 
                  }} 
                />

                {/* Bottom-Right Crop Marks */}
                <div 
                  className="absolute"
                  style={{ 
                    bottom: `${slugMarginMm - 5}mm`, 
                    right: `${slugMarginMm - 5}mm`,
                    width: '5mm', 
                    height: '5mm', 
                    borderLeft: '0.25pt solid #000000', 
                    borderTop: '0.25pt solid #000000' 
                  }} 
                />

                {/* Registration Crosshair Marks (Center Left & Right) */}
                <div 
                  className="absolute"
                  style={{ 
                    top: '50%', 
                    left: '2mm', 
                    width: '4mm', 
                    height: '0.25pt', 
                    backgroundColor: '#000000' 
                  }} 
                />
                <div 
                  className="absolute"
                  style={{ 
                    top: '50%', 
                    right: '2mm', 
                    width: '4mm', 
                    height: '0.25pt', 
                    backgroundColor: '#000000' 
                  }} 
                />
              </div>
            )}

            {/* The Actual Trim Book Page Leaf (القطع الصافي) */}
            <div
              className="press-page-leaf flex flex-col justify-between"
              style={{
                width: `${currentTrim.widthMm}mm`,
                height: `${currentTrim.heightMm}mm`,
                backgroundColor: paperBgColor,
                color: textColor,
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Running Header (ترويسة الصفحة المتناوبة) */}
              {!isChapterTitlePage ? (
                <header
                  className="flex items-center justify-between select-none"
                  style={{
                    paddingTop: `${currentTrim.marginTopMm * 0.45}mm`,
                    paddingRight: `${paddingRightMm}mm`,
                    paddingLeft: `${paddingLeftMm}mm`,
                    borderBottom: `0.5pt solid ${ruleColor}`,
                    fontSize: '9.5pt',
                    color: secondaryTextColor,
                    minHeight: '8mm',
                    fontFamily: 'var(--font-book)',
                  }}
                >
                  {isRecto ? (
                    // Recto (Right): Page number outer right, title center
                    <>
                      <span className="font-bold tracking-wider">{formattedPageNum}</span>
                      <span className="truncate max-w-[70%] font-medium text-center">{headerTitle}</span>
                      <span className="w-4" />
                    </>
                  ) : (
                    // Verso (Left): Title center, page number outer left
                    <>
                      <span className="w-4" />
                      <span className="truncate max-w-[70%] font-medium text-center">{headerTitle}</span>
                      <span className="font-bold tracking-wider">{formattedPageNum}</span>
                    </>
                  )}
                </header>
              ) : (
                // Suppressed header on Chapter Title pages
                <header 
                  style={{ 
                    height: `${currentTrim.marginTopMm * 0.45}mm`,
                    minHeight: '8mm' 
                  }} 
                />
              )}

              {/* Main Body Text (متن الصفحة) */}
              <main
                className="flex-1 flex flex-col justify-between min-w-0 w-full overflow-hidden"
                style={{
                  paddingTop: `${currentTrim.marginTopMm * 0.55}mm`,
                  paddingBottom: `${currentTrim.marginBottomMm * 0.4}mm`,
                  paddingRight: `${paddingRightMm}mm`,
                  paddingLeft: `${paddingLeftMm}mm`,
                  boxSizing: 'border-box',
                  maxWidth: '100%',
                }}
              >
                <div
                  className="book-content-body flex-1 text-justify font-book leading-relaxed min-w-0 w-full"
                  style={{
                    fontFamily: settings.fontFamily,
                    fontSize: `${settings.fontSizePt}pt`,
                    lineHeight: settings.lineHeight,
                    color: textColor,
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word',
                  }}
                  dangerouslySetInnerHTML={{ __html: page.htmlContent }}
                />

                {/* Footnotes Area (حواشي التوثيق أسفل الصفحة) */}
                {page.footnotes && page.footnotes.length > 0 && (
                  <footer 
                    className="pt-2 select-text"
                    style={{
                      borderTop: `0.5pt solid ${ruleColor}`,
                      marginTop: '4mm',
                    }}
                  >
                    <div className="space-y-1">
                      {page.footnotes.map((fn) => (
                        <div 
                          key={fn.id} 
                          className="flex items-baseline gap-1.5 text-justify"
                          style={{
                            fontSize: '9.5pt',
                            lineHeight: 1.5,
                            color: secondaryTextColor,
                            fontFamily: settings.fontFamily,
                          }}
                        >
                          <span 
                            className="font-bold shrink-0"
                            style={{ color: textColor }}
                          >
                            {formatFootnoteMarker(fn.index, settings.numeralSystem)}
                          </span>
                          <span className="flex-1">{fn.text}</span>
                        </div>
                      ))}
                    </div>
                  </footer>
                )}
              </main>

              {/* In Chapter Title pages, print page number at bottom center if header was suppressed */}
              {isChapterTitlePage && (
                <footer 
                  className="text-center pb-2 text-[9pt] font-book"
                  style={{ color: secondaryTextColor }}
                >
                  {formattedPageNum}
                </footer>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
