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
          return {
            ...parsed,
            settings: {
              ...INITIAL_MANUSCRIPT.settings,
              ...parsed.settings,
              chromeTheme: parsed.settings?.chromeTheme || 'dark',
            },
          };
        }
      }
    } catch (e) {
      console.error('Failed to load manuscript from localStorage:', e);
    }
    return INITIAL_MANUSCRIPT;
  });

  const activePageId = manuscript.activePageId || 'p-1';
  const [activeFootnoteId, setActiveFootnoteId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  const setActivePageId = useCallback((pageId: string) => {
    setManuscript((prev) => ({
      ...prev,
      activePageId: pageId,
    }));
  }, []);

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
  const addNewPage = useCallback((afterPageId?: string, initialContent?: string) => {
    let createdPageId = '';
    setManuscript((prev) => {
      const targetPageId = afterPageId || activePageId;
      const targetPage = prev.pages[targetPageId];
      const targetChapterId = targetPage ? targetPage.chapterId : prev.activeChapterId;
      
      const newPageId = `p-${Date.now()}`;
      createdPageId = newPageId;
      const newPage: BookPage = {
        id: newPageId,
        pageNumber: 0, // will be recomputed
        chapterId: targetChapterId,
        htmlContent: initialContent !== undefined ? initialContent : '<p><br/></p>',
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

    return createdPageId;
  }, [activePageId, recomputePageNumbers]);

  // Auto-pagination: Split overflow content onto next page or create a new page
  const handlePageOverflow = useCallback((fromPageId: string, overflowHtml: string) => {
    if (!overflowHtml || !overflowHtml.trim()) return;

    setManuscript((prev) => {
      const fromPage = prev.pages[fromPageId];
      if (!fromPage) return prev;

      const chapter = prev.chapters.find((c) => c.id === fromPage.chapterId);
      if (!chapter) return prev;

      const pageIndexInChapter = chapter.pageIds.indexOf(fromPageId);
      const hasNextPageInChapter = pageIndexInChapter >= 0 && pageIndexInChapter < chapter.pageIds.length - 1;

      if (hasNextPageInChapter) {
        // Next page already exists in this chapter! Prepend the overflow content
        const nextPageId = chapter.pageIds[pageIndexInChapter + 1];
        const nextPage = prev.pages[nextPageId];

        // Combine overflow: if next page only has an empty paragraph, replace it
        let combinedHtml = overflowHtml;
        const currentNextText = nextPage.htmlContent?.replace(/<[^>]*>/g, '').trim();
        if (currentNextText && currentNextText.length > 0) {
          combinedHtml = overflowHtml + nextPage.htmlContent;
        }

        return {
          ...prev,
          pages: {
            ...prev.pages,
            [nextPageId]: {
              ...nextPage,
              htmlContent: combinedHtml,
            },
          },
          activePageId: nextPageId,
        };
      } else {
        // Create a new physical page right after this page!
        const newPageId = `p-${Date.now()}`;

        const newPage: BookPage = {
          id: newPageId,
          pageNumber: 0,
          chapterId: chapter.id,
          htmlContent: overflowHtml,
          footnotes: [],
        };

        const updatedChapters = prev.chapters.map((chap) => {
          if (chap.id !== chapter.id) return chap;
          return {
            ...chap,
            pageIds: [...chap.pageIds, newPageId],
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
      }
    });
  }, [recomputePageNumbers]);

  const navigateToPreviousPage = useCallback((currentPageId: string) => {
    setManuscript((prev) => {
      const allPages = Object.values(prev.pages).sort((a, b) => a.pageNumber - b.pageNumber);
      const currentIndex = allPages.findIndex((p) => p.id === currentPageId);
      if (currentIndex > 0) {
        const prevPage = allPages[currentIndex - 1];
        return {
          ...prev,
          activePageId: prevPage.id,
        };
      }
      return prev;
    });
  }, []);

  const navigateToNextPage = useCallback((currentPageId: string) => {
    setManuscript((prev) => {
      const allPages = Object.values(prev.pages).sort((a, b) => a.pageNumber - b.pageNumber);
      const currentIndex = allPages.findIndex((p) => p.id === currentPageId);
      if (currentIndex >= 0 && currentIndex < allPages.length - 1) {
        const nextPage = allPages[currentIndex + 1];
        return {
          ...prev,
          activePageId: nextPage.id,
        };
      }
      return prev;
    });
  }, []);

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
        const firstPageId = parsed.activePageId || parsed.chapters[0]?.pageIds[0] || Object.keys(parsed.pages)[0] || 'p-1';
        setManuscript({ ...parsed, activePageId: firstPageId });
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
    handlePageOverflow,
    navigateToPreviousPage,
    navigateToNextPage,
  };
}
