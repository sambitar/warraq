import React, { useRef, useEffect } from 'react';
import type { BookPage, Chapter, TrimSize, PaperTheme, BookSettings } from '../types/book';
import { formatNumber, formatFootnoteMarker } from '../utils/arabicTypography';
import { Plus, Trash2 } from 'lucide-react';

interface PageLeafProps {
  page: BookPage;
  chapter?: Chapter;
  bookTitle: string;
  isRecto: boolean; // True = Right page (Odd), False = Left page (Even)
  isActive: boolean;
  trimSize: TrimSize;
  paperTheme: PaperTheme;
  settings: BookSettings;
  onContentChange: (pageId: string, html: string) => void;
  onAddFootnote: (pageId: string) => void;
  onUpdateFootnote: (pageId: string, footnoteId: string, text: string) => void;
  onDeleteFootnote: (pageId: string, footnoteId: string) => void;
  onSelectPage: (pageId: string) => void;
  viewMode: 'spread' | 'single';
}

export const PageLeaf: React.FC<PageLeafProps> = ({
  page,
  chapter,
  bookTitle,
  isRecto,
  isActive,
  trimSize,
  paperTheme,
  settings,
  onContentChange,
  onAddFootnote,
  onUpdateFootnote,
  onDeleteFootnote,
  onSelectPage,
  viewMode,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChangeRef = useRef(false);

  // Sync content from state to contenteditable when page changes or initial load
  useEffect(() => {
    if (editorRef.current && !isInternalChangeRef.current) {
      if (editorRef.current.innerHTML !== page.htmlContent) {
        editorRef.current.innerHTML = page.htmlContent;
      }
    }
    isInternalChangeRef.current = false;
  }, [page.htmlContent, page.id]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChangeRef.current = true;
      onContentChange(page.id, editorRef.current.innerHTML);
    }
  };

  // Keyboard enhancements: auto-replace honorifics, citations, brackets
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Alt + F shortcut to insert footnote on active page
    if (e.altKey && (e.key === 'f' || e.key === 'F' || e.key === 'ب' || e.key === 'هـ')) {
      e.preventDefault();
      onAddFootnote(page.id);
      return;
    }
  };

  // Physical margins based on Recto vs Verso
  // Recto (Right page): Outer margin is on RIGHT, Inner gutter is on LEFT
  // Verso (Left page): Inner gutter is on RIGHT, Outer margin is on LEFT
  const paddingRightMm = isRecto ? trimSize.marginOuterMm : trimSize.marginInnerMm;
  const paddingLeftMm = isRecto ? trimSize.marginInnerMm : trimSize.marginOuterMm;

  // Header Title
  const headerText = isRecto 
    ? (chapter?.title || bookTitle) 
    : bookTitle;

  const formattedPageNum = formatNumber(page.pageNumber, settings.numeralSystem);

  const shadowClass = viewMode === 'single'
    ? 'page-stack-single'
    : isRecto
      ? 'page-stack-recto'
      : 'page-stack-verso';

  return (
    <div
      onClick={() => onSelectPage(page.id)}
      className={`book-page-wrapper relative transition-all duration-200 select-text ${shadowClass} ${
        isActive ? 'ring-2 ring-amber-700/40' : ''
      }`}
      style={{
        width: `${trimSize.widthMm}mm`,
        minHeight: `${trimSize.heightMm}mm`,
        height: `${trimSize.heightMm}mm`,
        backgroundColor: paperTheme.backgroundColor,
        color: paperTheme.textColor,
        border: `1px solid ${paperTheme.pageBorderColor}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* 3D Spine Crease Gradient in Two-Page Spread */}
      {viewMode === 'spread' && (
        <div
          className={`book-spine-crease ${isRecto ? 'right-page' : 'left-page'}`}
          style={{
            background: isRecto
              ? paperTheme.spineShadow
              : paperTheme.spineShadow.replace('to right', 'to left'),
          }}
        />
      )}

      {/* Running Header (ترويسة الصفحة) */}
      <header
        className="running-header flex items-center justify-between border-b pb-1 select-none"
        style={{
          paddingTop: `${trimSize.marginTopMm * 0.4}mm`,
          paddingRight: `${paddingRightMm}mm`,
          paddingLeft: `${paddingLeftMm}mm`,
          borderColor: paperTheme.separatorColor,
          fontSize: '9.5pt',
          color: paperTheme.secondaryTextColor,
          minHeight: '10mm',
        }}
      >
        {isRecto ? (
          // Right page (Recto): Outer is right (page number on right), Title on left/center
          <>
            <span className="font-bold text-amber-900 tracking-wider">
              {formattedPageNum}
            </span>
            <span className="truncate max-w-[70%] font-medium text-center">
              {headerText}
            </span>
            <span className="w-4" />
          </>
        ) : (
          // Left page (Verso): Book Title on right/center, Page number on outer left
          <>
            <span className="w-4" />
            <span className="truncate max-w-[70%] font-medium text-center">
              {headerText}
            </span>
            <span className="font-bold text-amber-900 tracking-wider">
              {formattedPageNum}
            </span>
          </>
        )}
      </header>

      {/* Body Area (متن الصفحة) */}
      <main
        className="flex-1 flex flex-col justify-between overflow-hidden"
        style={{
          paddingTop: `${trimSize.marginTopMm * 0.5}mm`,
          paddingBottom: `${trimSize.marginBottomMm * 0.4}mm`,
          paddingRight: `${paddingRightMm}mm`,
          paddingLeft: `${paddingLeftMm}mm`,
        }}
      >
        {/* Editable Main Text */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="book-content-body flex-1 overflow-y-auto focus:outline-none"
          style={{
            fontFamily: settings.fontFamily,
            fontSize: `${settings.fontSizePt}pt`,
            lineHeight: settings.lineHeight,
          }}
        />

        {/* Footnotes Area (حاشية الهوامش أسفل الصفحة) */}
        {(page.footnotes && page.footnotes.length > 0) && (
          <footer className="page-footnotes-container pt-2 select-text">
            {/* Traditional Arabic Footnote Divider Rule */}
            <div
              className="footnotes-divider"
              style={{ backgroundColor: paperTheme.separatorColor }}
            />
            
            <div className="space-y-1.5 max-h-[48mm] overflow-y-auto">
              {page.footnotes.map((fn) => (
                <div key={fn.id} className="footnote-item-row group">
                  <span className="footnote-badge">
                    {formatFootnoteMarker(fn.index, settings.numeralSystem)}
                  </span>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateFootnote(page.id, fn.id, e.currentTarget.innerText)}
                    className="flex-1 focus:outline-none focus:bg-amber-100/30 rounded px-1"
                    style={{
                      fontFamily: settings.fontFamily,
                    }}
                  >
                    {fn.text}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteFootnote(page.id, fn.id)}
                    title="حذف الهامش"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-stone-400 hover:text-red-700 no-print"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </footer>
        )}
      </main>

      {/* Quick Footnote Adder at bottom edge on hover (for seamless authoring) */}
      <div className="absolute bottom-1 left-2 no-print opacity-0 hover:opacity-100 transition-opacity flex items-center gap-1 z-30 font-ui">
        <button
          type="button"
          onClick={() => onAddFootnote(page.id)}
          className="flex items-center gap-1 px-2 py-0.5 text-xs rounded border transition-colors shadow-xs"
          style={{
            backgroundColor: 'var(--chrome-active-bg)',
            borderColor: 'var(--chrome-active-border)',
            color: 'var(--chrome-active-text)',
          }}
          title="إضافة هامش توثيق في أسفل هذه الصفحة (Alt+F)"
        >
          <Plus className="w-3 h-3" />
          <span>إضافة هامش</span>
        </button>
      </div>
    </div>
  );
};
