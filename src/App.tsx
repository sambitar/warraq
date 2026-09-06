import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useBookState } from './hooks/useBookState';
import { TRIM_SIZES } from './constants/trimSizes';
import { PAPER_THEMES } from './constants/paperThemes';
import { TopNavbar } from './components/TopNavbar';
import { ArabicFormattingBar } from './components/ArabicFormattingBar';
import { BookSpread } from './components/BookSpread';
import { SidebarChapters } from './components/SidebarChapters';
import { PdfExportModal } from './components/PdfExportModal';
import { formatCitationSuperscript } from './utils/arabicTypography';

export function App() {
  const {
    manuscript,
    activePageId,
    setActivePageId,
    updatePageContent,
    addNewPage,
    deletePage,
    addFootnote,
    updateFootnoteText,
    deleteFootnote,
    addChapter,
    updateChapterDetails,
    updateSettings,
    updateMetadata,
    resetToSample,
    exportManuscriptJson,
    importManuscriptJson,
  } = useBookState();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTrim = TRIM_SIZES[manuscript.settings.trimSizeId];
  const currentPaperTheme = PAPER_THEMES[manuscript.settings.paperThemeId];

  // Helper to insert HTML at current caret position in the active contenteditable
  const insertHtmlAtCursor = (html: string) => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();

    const el = document.createElement('div');
    el.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node: ChildNode | null = null;
    let lastNode: ChildNode | null = null;
    while ((node = el.firstChild)) {
      lastNode = frag.appendChild(node);
    }
    range.insertNode(frag);
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // Trigger input event to update React state
    const activeEl = document.activeElement;
    if (activeEl && activeEl.getAttribute('contenteditable') === 'true') {
      activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  // Insert footnote citation marker in text and register footnote in page
  const handleInsertFootnote = useCallback(() => {
    const activePage = manuscript.pages[activePageId];
    if (!activePage) return;
    const nextIndex = (activePage.footnotes?.length || 0) + 1;
    const fnId = addFootnote(activePageId);

    const supTag = `<sup class="citation-ref" data-footnote-id="${fnId}">${formatCitationSuperscript(
      nextIndex,
      manuscript.settings.numeralSystem
    )}</sup>&nbsp;`;

    insertHtmlAtCursor(supTag);
  }, [activePageId, addFootnote, manuscript.pages, manuscript.settings.numeralSystem]);

  // Wrap selection in Quranic floral brackets
  const handleInsertQuranVerse = () => {
    const sel = window.getSelection();
    const selectedText = sel?.toString() || 'النص القرآني الكريم';
    insertHtmlAtCursor(`<span class="quran-verse">﴿ ${selectedText.trim()} ﴾</span>&nbsp;`);
  };

  // Wrap selection in Arabic guillemets
  const handleInsertArabicQuote = () => {
    const sel = window.getSelection();
    const selectedText = sel?.toString() || 'النص المقتبس';
    insertHtmlAtCursor(`«${selectedText.trim()}»&nbsp;`);
  };

  // Insert honorific or citation term at cursor
  const handleInsertText = (text: string) => {
    insertHtmlAtCursor(`${text}&nbsp;`);
  };

  // Handle JSON file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importManuscriptJson(content);
        if (success) {
          alert('تم استيراد المخطوطة بنجاح!');
        } else {
          alert('تعذر قراءة ملف المخطوطة. يرجى التأكد من صحة الملف.');
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // Global keyboard shortcuts (Alt+F for footnote, etc.)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        handleInsertFootnote();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleInsertFootnote]);

  return (
    <div
      dir="rtl"
      data-chrome={manuscript.settings.chromeTheme || 'dark'}
      className="min-h-screen flex flex-col desk-surface select-text transition-colors duration-200"
      style={{
        backgroundColor: 'var(--desk-bg)',
      }}
    >
      {/* Hidden file input for importing JSON manuscripts */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Application Navbar */}
      <TopNavbar
        metadata={manuscript.metadata}
        settings={manuscript.settings}
        onUpdateSettings={updateSettings}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onExportJson={exportManuscriptJson}
        onImportJson={() => fileInputRef.current?.click()}
        onPrintPdf={() => setIsPdfModalOpen(true)}
        onResetSample={resetToSample}
      />

      {/* Scholarly Arabic Book Formatting Bar */}
      <ArabicFormattingBar
        settings={manuscript.settings}
        onUpdateSettings={updateSettings}
        onInsertFootnote={handleInsertFootnote}
        onInsertQuranVerse={handleInsertQuranVerse}
        onInsertArabicQuote={handleInsertArabicQuote}
        onInsertHonorific={handleInsertText}
        onInsertCitationTerm={handleInsertText}
      />

      {/* Main Book Desk View */}
      <main className="flex-1 overflow-auto flex items-center justify-center p-4">
        <BookSpread
          pages={manuscript.pages}
          chapters={manuscript.chapters}
          bookTitle={manuscript.metadata.title}
          activePageId={activePageId}
          trimSize={currentTrim}
          paperTheme={currentPaperTheme}
          settings={manuscript.settings}
          onContentChange={updatePageContent}
          onAddFootnote={handleInsertFootnote}
          onUpdateFootnote={updateFootnoteText}
          onDeleteFootnote={deleteFootnote}
          onSelectPage={setActivePageId}
          onAddNewPage={addNewPage}
        />
      </main>

      {/* Table of Contents & Manuscript Sidebar */}
      <SidebarChapters
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        manuscript={manuscript}
        activePageId={activePageId}
        onSelectPage={(pId) => {
          setActivePageId(pId);
          setIsSidebarOpen(false);
        }}
        onAddChapter={addChapter}
        onDeleteChapter={(chapId) => {
          const chap = manuscript.chapters.find((c) => c.id === chapId);
          if (chap) {
            // Delete all its pages
            chap.pageIds.forEach((pId) => deletePage(pId));
            updateChapterDetails(chapId, {}); // Will be cleaned
          }
        }}
        onUpdateChapter={updateChapterDetails}
        onUpdateMetadata={updateMetadata}
        onUpdateSettings={updateSettings}
        onExportJson={exportManuscriptJson}
        onImportJson={() => fileInputRef.current?.click()}
        onPrintPdf={() => setIsPdfModalOpen(true)}
        onResetSample={resetToSample}
        settings={manuscript.settings}
      />

      {/* Direct PDF / Print Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        manuscript={manuscript}
      />
    </div>
  );
}

export default App;
