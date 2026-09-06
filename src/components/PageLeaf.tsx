import React, { useRef, useEffect, useCallback } from 'react';
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
  onPageOverflow?: (pageId: string, overflowHtml: string) => void;
  onNavigatePrevPage?: (pageId: string) => void;
  onNavigateNextPage?: (pageId: string) => void;
  viewMode: 'spread' | 'single';
}

function extractOverflowHtml(editor: HTMLDivElement): string | null {
  // Check if content height exceeds the visible physical container (with 4px margin threshold)
  if (editor.scrollHeight <= editor.clientHeight + 4) {
    return null;
  }

  const children = Array.from(editor.children) as HTMLElement[];
  if (children.length === 0) return null;

  const editorRect = editor.getBoundingClientRect();

  // Case 1: Multiple block children (paragraphs, headings)
  if (children.length > 1) {
    const overflowing: HTMLElement[] = [];
    
    // Scan backwards from last child
    for (let i = children.length - 1; i >= 1; i--) {
      const child = children[i];
      const childRect = child.getBoundingClientRect();
      
      if (childRect.bottom > editorRect.bottom + 2 || editor.scrollHeight > editor.clientHeight + 4) {
        overflowing.unshift(child);
        child.remove();
        if (editor.scrollHeight <= editor.clientHeight + 4) {
          break;
        }
      }
    }

    if (overflowing.length > 0) {
      return overflowing.map((c) => c.outerHTML).join('');
    }
  }

  // Case 2: A single paragraph that is longer than the page
  const singleChild = editor.firstElementChild as HTMLElement;
  if (singleChild) {
    const fullText = singleChild.innerText || singleChild.textContent || '';
    const words = fullText.split(/\s+/);
    if (words.length > 2) {
      let low = 1;
      let high = words.length - 1;
      let bestFit = 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        singleChild.innerText = words.slice(0, mid).join(' ');
        if (editor.scrollHeight <= editor.clientHeight + 4) {
          bestFit = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      singleChild.innerText = words.slice(0, bestFit).join(' ');
      const overflowWords = words.slice(bestFit).join(' ');
      return `<p>${overflowWords}</p>`;
    }
  }

  return null;
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
  onPageOverflow,
  onNavigatePrevPage,
  viewMode,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChangeRef = useRef(false);

  // Sync content from state to contenteditable when page changes or initial load
  useEffect(() => {
    if (editorRef.current && !isInternalChangeRef.current) {
      const targetContent = page.htmlContent?.trim() ? page.htmlContent : '<p><br/></p>';
      if (editorRef.current.innerHTML !== targetContent) {
        editorRef.current.innerHTML = targetContent;
      }
    }
    isInternalChangeRef.current = false;
  }, [page.htmlContent, page.id]);

  // Set default paragraph separator to 'p' on focus so Enter creates <p>...</p>
  const handleFocus = () => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch {
      // Ignore if not supported in environment
    }
  };

  // When this page becomes active (e.g. via automatic overflow or selection), focus and set caret to end
  useEffect(() => {
    if (isActive && editorRef.current) {
      if (document.activeElement !== editorRef.current && !editorRef.current.contains(document.activeElement)) {
        editorRef.current.focus();
        const sel = window.getSelection();
        if (sel) {
          const range = document.createRange();
          range.selectNodeContents(editorRef.current);
          range.collapse(false); // Move caret to the very end
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  }, [isActive, page.id]);

  const checkAndHandleOverflow = useCallback(() => {
    if (!editorRef.current || !onPageOverflow) return;
    const overflowHtml = extractOverflowHtml(editorRef.current);
    if (overflowHtml) {
      isInternalChangeRef.current = true;
      const remainingHtml = editorRef.current.innerHTML;
      onContentChange(page.id, remainingHtml);
      onPageOverflow(page.id, overflowHtml);
    }
  }, [onPageOverflow, onContentChange, page.id]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChangeRef.current = true;
      onContentChange(page.id, editorRef.current.innerHTML);
      checkAndHandleOverflow();
    }
  };

  const handlePaste = () => {
    requestAnimationFrame(() => {
      if (editorRef.current) {
        isInternalChangeRef.current = true;
        onContentChange(page.id, editorRef.current.innerHTML);
        checkAndHandleOverflow();
      }
    });
  };

  // Keyboard enhancements: auto-replace honorifics, citations, Enter overflow, Backspace page navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Alt + F shortcut to insert footnote on active page
    if (e.altKey && (e.key === 'f' || e.key === 'F' || e.key === 'ب' || e.key === 'هـ')) {
      e.preventDefault();
      onAddFootnote(page.id);
      return;
    }

    // Backspace at the top of the page -> smoothly navigate to previous page
    if (e.key === 'Backspace') {
      const sel = window.getSelection();
      if (sel && sel.isCollapsed && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const editor = editorRef.current;
        if (editor) {
          const isAtStart = range.startOffset === 0 && 
            (range.startContainer === editor || 
             range.startContainer === editor.firstElementChild || 
             range.startContainer.parentElement === editor.firstElementChild);

          const isEmpty = editor.innerText.trim() === '';

          if ((isAtStart || isEmpty) && onNavigatePrevPage) {
            e.preventDefault();
            onNavigatePrevPage(page.id);
            return;
          }
        }
      }
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
        className="flex-1 flex flex-col justify-between overflow-hidden min-w-0 w-full"
        style={{
          paddingTop: `${trimSize.marginTopMm * 0.5}mm`,
          paddingBottom: `${trimSize.marginBottomMm * 0.4}mm`,
          paddingRight: `${paddingRightMm}mm`,
          paddingLeft: `${paddingLeftMm}mm`,
          boxSizing: 'border-box',
          maxWidth: '100%',
        }}
      >
        {/* Editable Main Text with strict physical height boundary */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={handleFocus}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          className="book-content-body flex-1 overflow-hidden focus:outline-none min-w-0 w-full"
          style={{
            fontFamily: settings.fontFamily,
            fontSize: `${settings.fontSizePt}pt`,
            lineHeight: settings.lineHeight,
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflowWrap: 'break-word',
            wordWrap: 'break-word',
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
