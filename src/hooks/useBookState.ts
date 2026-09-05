import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  Manuscript, 
  Chapter, 
  BookPage, 
  FootnoteItem 
} from '../types/book';
import { INITIAL_MANUSCRIPT } from '../constants/sampleManuscript';
import { TRIM_SIZES } from '../constants/trimSizes';

const STORAGE_KEY = 'warraq_arabic_manuscript_v1';

export function useBookState() {
  const [manuscript, setManuscript] = useState<Manuscript>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.version && parsed?.pages && parsed?.chapters) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load manuscript from localStorage:', e);
    }
    return INITIAL_MANUSCRIPT;
  });

  const [activePageId, setActivePageId] = useState<string>(manuscript.activePageId || 'p-1');
  const [activeFootnoteId, setActiveFootnoteId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  // Auto-save debounced to localStorage
  useEffect(() => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(manuscript));
      } catch (e) {
        console.error('Failed to save manuscript:', e);
      }
    }, 600);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [manuscript]);

  // Recalculate book-wide page numbers across all chapters in order
  const recomputePageNumbers = useCallback((chapters: Chapter[], pages: Record<string, BookPage>): Record<string, BookPage> => {
    const updatedPages = { ...pages };
    let currentNumber = 1;
    for (const chap of chapters) {
      for (const pId of chap.pageIds) {
        if (updatedPages[pId]) {
          updatedPages[pId] = {
            ...updatedPages[pId],
            pageNumber: currentNumber++,
          };
        }
      }
    }
    return updatedPages;
  }, []);

  // Update page content
  const updatePageContent = useCallback((pageId: string, htmlContent: string) => {
    setManuscript((prev) => {
      const page = prev.pages[pageId];
      if (!page) return prev;
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [pageId]: {
            ...page,
            htmlContent,
          },
        },
      };
    });
  }, []);

  // Add a new physical page after currentPageId or at the end of the chapter
  const addNewPage = useCallback((afterPageId?: string) => {
    setManuscript((prev) => {
      const targetPageId = afterPageId || activePageId;
      const targetPage = prev.pages[targetPageId];
      const targetChapterId = targetPage ? targetPage.chapterId : prev.activeChapterId;
      
      const newPageId = `p-${Date.now()}`;
      const newPage: BookPage = {
        id: newPageId,
        pageNumber: 0, // will be recomputed
        chapterId: targetChapterId,
        htmlContent: '<p>اكتب نص الصفحة هنا...</p>',
        footnotes: [],
      };

      const updatedChapters = prev.chapters.map((chap) => {
        if (chap.id !== targetChapterId) return chap;
        const pageIndex = chap.pageIds.indexOf(targetPageId);
        const newPageIds = [...chap.pageIds];
        if (pageIndex >= 0) {
          newPageIds.splice(pageIndex + 1, 0, newPageId);
        } else {
          newPageIds.push(newPageId);
        }
        return {
          ...chap,
          pageIds: newPageIds,
        };
      });

      const updatedPages = recomputePageNumbers(
        updatedChapters, 
        { ...prev.pages, [newPageId]: newPage }
      );

      return {
        ...prev,
        chapters: updatedChapters,
        pages: updatedPages,
        activePageId: newPageId,
      };
    });
    // Set active page to newly created page
    setTimeout(() => {
      setActivePageId((prev) => prev);
    }, 50);
  }, [activePageId, recomputePageNumbers]);

  // Delete page
  const deletePage = useCallback((pageId: string) => {
    setManuscript((prev) => {
      const pageToDelete = prev.pages[pageId];
      if (!pageToDelete) return prev;

      // Don't delete if it's the last page in the manuscript
      const totalPages = Object.keys(prev.pages).length;
      if (totalPages <= 1) return prev;

      const targetChapterId = pageToDelete.chapterId;
      const updatedChapters = prev.chapters.map((chap) => {
        if (chap.id !== targetChapterId) return chap;
        return {
          ...chap,
          pageIds: chap.pageIds.filter((id) => id !== pageId),
        };
      });

      const { [pageId]: _, ...remainingPages } = prev.pages;
      const renumberedPages = recomputePageNumbers(updatedChapters, remainingPages);

      // Determine next active page
      const allRemainingIds = updatedChapters.flatMap((c) => c.pageIds);
      const nextActiveId = allRemainingIds[0] || '';

      return {
        ...prev,
        chapters: updatedChapters,
        pages: renumberedPages,
        activePageId: nextActiveId,
      };
    });
  }, [recomputePageNumbers]);

  // Footnote operations
  const addFootnote = useCallback((pageId: string, initialText: string = 'المرجع أو التوثيق هنا.') => {
    const fnId = `fn-${Date.now()}`;
    setManuscript((prev) => {
      const page = prev.pages[pageId];
      if (!page) return prev;

      const nextIndex = (page.footnotes?.length || 0) + 1;
      const newFootnote: FootnoteItem = {
        id: fnId,
        index: nextIndex,
        text: initialText,
      };

      return {
        ...prev,
        pages: {
          ...prev.pages,
          [pageId]: {
            ...page,
            footnotes: [...(page.footnotes || []), newFootnote],
          },
        },
      };
    });
    setActiveFootnoteId(fnId);
    return fnId;
  }, []);

  const updateFootnoteText = useCallback((pageId: string, footnoteId: string, newText: string) => {
    setManuscript((prev) => {
      const page = prev.pages[pageId];
      if (!page) return prev;

      const updatedFootnotes = (page.footnotes || []).map((fn) => {
        if (fn.id === footnoteId) {
          return { ...fn, text: newText };
        }
        return fn;
      });

      return {
        ...prev,
        pages: {
          ...prev.pages,
          [pageId]: {
            ...page,
            footnotes: updatedFootnotes,
          },
        },
      };
    });
  }, []);

  const deleteFootnote = useCallback((pageId: string, footnoteId: string) => {
    setManuscript((prev) => {
      const page = prev.pages[pageId];
      if (!page) return prev;

      const filtered = (page.footnotes || []).filter((fn) => fn.id !== footnoteId);
      // Re-index remaining footnotes on this page sequentially
      const reindexed = filtered.map((fn, idx) => ({ ...fn, index: idx + 1 }));

      return {
        ...prev,
        pages: {
          ...prev.pages,
          [pageId]: {
            ...page,
            footnotes: reindexed,
          },
        },
      };
    });
  }, []);

  // Chapter management
  const addChapter = useCallback((title: string = 'فصل جديد') => {
    setManuscript((prev) => {
      const newChapId = `chap-${Date.now()}`;
      const newPageId = `p-${Date.now()}`;
      
      const newPage: BookPage = {
        id: newPageId,
        pageNumber: 0,
        chapterId: newChapId,
        htmlContent: `<h2 class="book-chapter-title">${title}</h2><p>بداية نص الفصل الجديد...</p>`,
        footnotes: [],
      };

      const newChapter: Chapter = {
        id: newChapId,
        title,
        pageIds: [newPageId],
      };

      const updatedChapters = [...prev.chapters, newChapter];
      const updatedPages = recomputePageNumbers(
        updatedChapters, 
        { ...prev.pages, [newPageId]: newPage }
      );

      return {
        ...prev,
        chapters: updatedChapters,
        pages: updatedPages,
        activeChapterId: newChapId,
        activePageId: newPageId,
      };
    });
  }, [recomputePageNumbers]);

  const updateChapterDetails = useCallback((chapterId: string, fields: Partial<Chapter>) => {
    setManuscript((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chap) => {
        if (chap.id === chapterId) {
          return { ...chap, ...fields };
        }
        return chap;
      }),
    }));
  }, []);

  // Settings
  const updateSettings = useCallback((updates: Partial<Manuscript['settings']>) => {
    setManuscript((prev) => {
      const nextSettings = { ...prev.settings, ...updates };
      // If trim size changed, adjust default font size if not customized
      if (updates.trimSizeId && updates.trimSizeId !== prev.settings.trimSizeId) {
        const trimDef = TRIM_SIZES[updates.trimSizeId];
        if (trimDef) {
          nextSettings.fontSizePt = trimDef.defaultFontSizePt;
          nextSettings.lineHeight = trimDef.defaultLineHeight;
        }
      }
      return {
        ...prev,
        settings: nextSettings,
      };
    });
  }, []);

  const updateMetadata = useCallback((updates: Partial<Manuscript['metadata']>) => {
    setManuscript((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, ...updates },
    }));
  }, []);

  // Reset to initial sample
  const resetToSample = useCallback(() => {
    if (window.confirm('هل تريد استعادة نموذج الكتاب التوضيحي الافتراضي؟ سيتم الكتابة فوق التعديلات غير المحفوظة.')) {
      setManuscript(INITIAL_MANUSCRIPT);
      setActivePageId('p-1');
    }
  }, []);

  // Export JSON
  const exportManuscriptJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manuscript, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const safeTitle = manuscript.metadata.title.replace(/\s+/g, '_') || 'manuscript';
    downloadAnchor.setAttribute('download', `${safeTitle}_وراق.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [manuscript]);

  // Import JSON
  const importManuscriptJson = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.chapters && parsed.pages) {
        setManuscript(parsed);
        const firstPageId = parsed.chapters[0]?.pageIds[0] || Object.keys(parsed.pages)[0] || 'p-1';
        setActivePageId(firstPageId);
        return true;
      }
    } catch (e) {
      console.error('Invalid manuscript JSON:', e);
    }
    return false;
  }, []);

  return {
    manuscript,
    activePageId,
    setActivePageId,
    activeFootnoteId,
    setActiveFootnoteId,
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
  };
}
