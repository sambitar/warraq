import React from 'react';
import type { 
  BookPage, 
  Chapter, 
  TrimSize, 
  PaperTheme, 
  BookSettings 
} from '../types/book';
import { PageLeaf } from './PageLeaf';
import { ChevronRight, ChevronLeft, Plus } from 'lucide-react';
import { formatNumber } from '../utils/arabicTypography';

interface BookSpreadProps {
  pages: Record<string, BookPage>;
  chapters: Chapter[];
  bookTitle: string;
  activePageId: string;
  trimSize: TrimSize;
  paperTheme: PaperTheme;
  settings: BookSettings;
  onContentChange: (pageId: string, html: string) => void;
  onAddFootnote: (pageId: string) => void;
  onUpdateFootnote: (pageId: string, footnoteId: string, text: string) => void;
  onDeleteFootnote: (pageId: string, footnoteId: string) => void;
  onSelectPage: (pageId: string) => void;
  onAddNewPage: (afterPageId?: string) => void;
  onPageOverflow?: (pageId: string, overflowHtml: string) => void;
  onNavigatePrevPage?: (pageId: string) => void;
  onNavigateNextPage?: (pageId: string) => void;
}

export const BookSpread: React.FC<BookSpreadProps> = ({
  pages,
  chapters,
  bookTitle,
  activePageId,
  trimSize,
  paperTheme,
  settings,
  onContentChange,
  onAddFootnote,
  onUpdateFootnote,
  onDeleteFootnote,
  onSelectPage,
  onAddNewPage,
  onPageOverflow,
  onNavigatePrevPage,
  onNavigateNextPage,
}) => {
  // Sort all pages by pageNumber
  const allPagesList = Object.values(pages).sort((a, b) => a.pageNumber - b.pageNumber);
  
  // Find active page index
  const activeIndex = allPagesList.findIndex((p) => p.id === activePageId);
  const activePage = allPagesList[activeIndex >= 0 ? activeIndex : 0];

  if (!activePage) {
    return <div className="text-stone-400 p-8">لا توجد صفحات في هذا الكتاب.</div>;
  }

  // Determine which pages to show in spread mode
  // In Arabic books, Page 1 is on the right (Recto).
  // If active page is odd (Recto), the spread is [activePage, activePage + 1]
  // If active page is even (Verso), the spread is [activePage - 1, activePage]
  const isSingleMode = settings.viewMode === 'single';

  let rectoPage: BookPage | undefined;
  let versoPage: BookPage | undefined;

  if (isSingleMode) {
    rectoPage = activePage;
  } else {
    if (activePage.pageNumber % 2 !== 0) {
      // Odd page is Recto (Right page)
      rectoPage = activePage;
      versoPage = allPagesList.find((p) => p.pageNumber === activePage.pageNumber + 1);
    } else {
      // Even page is Verso (Left page)
      versoPage = activePage;
      rectoPage = allPagesList.find((p) => p.pageNumber === activePage.pageNumber - 1);
    }
  }

  const findChapterForPage = (page?: BookPage) => {
    if (!page) return undefined;
    return chapters.find((c) => c.id === page.chapterId);
  };

  // Spread Navigation
  const canGoPrev = (rectoPage?.pageNumber ?? 1) > 1;
  const canGoNext = (versoPage?.pageNumber ?? rectoPage?.pageNumber ?? 1) < allPagesList.length;

  const handlePrevSpread = () => {
    if (!canGoPrev) return;
    const currentNum = rectoPage?.pageNumber || 1;
    const targetNum = Math.max(1, currentNum - 2);
    const targetPage = allPagesList.find((p) => p.pageNumber === targetNum);
    if (targetPage) onSelectPage(targetPage.id);
  };

  const handleNextSpread = () => {
    if (!canGoNext) return;
    const currentNum = (versoPage?.pageNumber ?? rectoPage?.pageNumber ?? 1);
    const targetNum = currentNum + 1;
    const targetPage = allPagesList.find((p) => p.pageNumber === targetNum);
    if (targetPage) onSelectPage(targetPage.id);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-8 px-4 select-none">
      {/* Zoom and Scale Wrapper */}
      <div
        className="transition-transform duration-200 origin-top flex items-center justify-center"
        style={{
          transform: `scale(${settings.zoomLevel})`,
        }}
      >
        <div className="relative flex items-center justify-center">
          {/* Previous Page Arrow (in RTL, previous goes to the right) */}
          <button
            type="button"
            onClick={handlePrevSpread}
            disabled={!canGoPrev}
            title="الصفحات السابقة"
            className={`no-print absolute -right-16 z-30 p-3 rounded-full border shadow-lg transition-all ${
              !canGoPrev ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'
            }`}
            style={{
              backgroundColor: 'var(--chrome-bg)',
              borderColor: 'var(--chrome-border)',
              color: 'var(--chrome-text)',
            }}
            onMouseEnter={(e) => {
              if (canGoPrev) {
                e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
                e.currentTarget.style.color = 'var(--chrome-text-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--chrome-bg)';
              e.currentTarget.style.color = 'var(--chrome-text)';
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Book Canvas Spread Container */}
          <div
            className={`book-spread-container relative flex items-stretch rounded-sm ${
              isSingleMode ? 'justify-center' : 'justify-center'
            }`}
            style={{
              backgroundColor: '#1E1B18', // Underneath binding spine
            }}
          >
            {/* Recto Page (Right page / الصفحة اليمنى) */}
            {rectoPage && (
              <PageLeaf
                page={rectoPage}
                chapter={findChapterForPage(rectoPage)}
                bookTitle={bookTitle}
                isRecto={true}
                isActive={rectoPage.id === activePageId}
                trimSize={trimSize}
                paperTheme={paperTheme}
                settings={settings}
                onContentChange={onContentChange}
                onAddFootnote={onAddFootnote}
                onUpdateFootnote={onUpdateFootnote}
                onDeleteFootnote={onDeleteFootnote}
                onSelectPage={onSelectPage}
                onPageOverflow={onPageOverflow}
                onNavigatePrevPage={onNavigatePrevPage}
                onNavigateNextPage={onNavigateNextPage}
                viewMode={settings.viewMode}
              />
            )}

            {/* Central Book Spine Groove (in 2-Page Spread) */}
            {!isSingleMode && (
              <div
                className="w-[6px] shrink-0 relative z-30 shadow-inner"
                style={{
                  background: 'linear-gradient(to right, #171513 0%, #2A241F 50%, #171513 100%)',
                  boxShadow: 'inset 0 0 4px rgba(0,0,0,0.8)',
                }}
              />
            )}

            {/* Verso Page (Left page / الصفحة اليسرى) */}
            {!isSingleMode && (
              versoPage ? (
                <PageLeaf
                  page={versoPage}
                  chapter={findChapterForPage(versoPage)}
                  bookTitle={bookTitle}
                  isRecto={false}
                  isActive={versoPage.id === activePageId}
                  trimSize={trimSize}
                  paperTheme={paperTheme}
                  settings={settings}
                  onContentChange={onContentChange}
                  onAddFootnote={onAddFootnote}
                  onUpdateFootnote={onUpdateFootnote}
                  onDeleteFootnote={onDeleteFootnote}
                  onSelectPage={onSelectPage}
                  onPageOverflow={onPageOverflow}
                  onNavigatePrevPage={onNavigatePrevPage}
                  onNavigateNextPage={onNavigateNextPage}
                  viewMode={settings.viewMode}
                />
              ) : (
                /* Blank / Add Page placeholder for odd final page */
                <div
                  className="book-page-wrapper page-stack-verso flex flex-col items-center justify-center border border-dashed select-none"
                  style={{
                    width: `${trimSize.widthMm}mm`,
                    height: `${trimSize.heightMm}mm`,
                    backgroundColor: paperTheme.backgroundColor,
                    borderColor: 'var(--chrome-border)',
                  }}
                >
                  <p className="font-book text-lg mb-3" style={{ color: 'var(--chrome-text-muted)' }}>
                    الصفحة المقابلة فارغة
                  </p>
                  <button
                    type="button"
                    onClick={() => onAddNewPage(rectoPage?.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all"
                    style={{
                      backgroundColor: 'var(--chrome-active-bg)',
                      borderColor: 'var(--chrome-active-border)',
                      color: 'var(--chrome-active-text)',
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة صفحة مقابلة</span>
                  </button>
                </div>
              )
            )}
          </div>

          {/* Next Page Arrow (in RTL, next goes to the left) */}
          <button
            type="button"
            onClick={handleNextSpread}
            disabled={!canGoNext}
            title="الصفحات التالية"
            className={`no-print absolute -left-16 z-30 p-3 rounded-full border shadow-lg transition-all ${
              !canGoNext ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'
            }`}
            style={{
              backgroundColor: 'var(--chrome-bg)',
              borderColor: 'var(--chrome-border)',
              color: 'var(--chrome-text)',
            }}
            onMouseEnter={(e) => {
              if (canGoNext) {
                e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
                e.currentTarget.style.color = 'var(--chrome-text-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--chrome-bg)';
              e.currentTarget.style.color = 'var(--chrome-text)';
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Quick Bottom Spread Bar */}
      <div 
        className="no-print mt-6 flex items-center gap-4 border px-4 py-2 rounded-full text-xs shadow-md font-ui transition-colors duration-150"
        style={{
          backgroundColor: 'var(--chrome-bg)',
          borderColor: 'var(--chrome-border)',
          color: 'var(--chrome-text)',
        }}
      >
        <span>
          صفحة{' '}
          <strong style={{ color: 'var(--chrome-active-text)' }}>
            {formatNumber(rectoPage?.pageNumber ?? 1, settings.numeralSystem)}
            {!isSingleMode && versoPage && ` - ${formatNumber(versoPage.pageNumber, settings.numeralSystem)}`}
          </strong>{' '}
          من {formatNumber(allPagesList.length, settings.numeralSystem)}
        </span>
        <div className="h-3 w-px" style={{ backgroundColor: 'var(--chrome-border)' }} />
        <button
          type="button"
          onClick={() => onAddNewPage(versoPage?.id || rectoPage?.id)}
          className="flex items-center gap-1.5 font-medium transition-colors"
          style={{ color: 'var(--chrome-text)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--chrome-active-text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--chrome-text)'; }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إدراج صفحة جديدة</span>
        </button>
      </div>
    </div>
  );
};
