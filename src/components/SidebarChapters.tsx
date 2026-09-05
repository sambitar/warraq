import React, { useState } from 'react';
import type { 
  Manuscript, 
  Chapter, 
  BookMetadata, 
  BookSettings 
} from '../types/book';
import { 
  X, 
  Plus, 
  Book, 
  Trash2, 
  Info, 
  BarChart3, 
  Clock 
} from 'lucide-react';
import { countArabicWords, countArabicChars, formatNumber } from '../utils/arabicTypography';
import { TRIM_SIZES } from '../constants/trimSizes';

interface SidebarChaptersProps {
  isOpen: boolean;
  onClose: () => void;
  manuscript: Manuscript;
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onAddChapter: (title?: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  onUpdateChapter: (chapterId: string, fields: Partial<Chapter>) => void;
  onUpdateMetadata: (fields: Partial<BookMetadata>) => void;
  settings: BookSettings;
}

export const SidebarChapters: React.FC<SidebarChaptersProps> = ({
  isOpen,
  onClose,
  manuscript,
  activePageId,
  onSelectPage,
  onAddChapter,
  onDeleteChapter,
  onUpdateChapter,
  onUpdateMetadata,
  settings,
}) => {
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'toc' | 'meta' | 'stats'>('toc');

  if (!isOpen) return null;

  // Compute manuscript totals
  const totalPages = Object.keys(manuscript.pages).length;
  let totalWords = 0;
  let totalChars = 0;
  let totalFootnotes = 0;

  Object.values(manuscript.pages).forEach((page) => {
    totalWords += countArabicWords(page.htmlContent);
    totalChars += countArabicChars(page.htmlContent);
    totalFootnotes += page.footnotes?.length || 0;
  });

  const estimatedReadingTimeMinutes = Math.max(1, Math.round(totalWords / 160));
  const currentTrim = TRIM_SIZES[settings.trimSizeId];

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;
    onAddChapter(newChapterTitle.trim());
    setNewChapterTitle('');
  };

  return (
    <aside className="no-print fixed inset-y-0 right-0 w-80 bg-stone-900 border-l border-stone-800 text-stone-200 z-50 flex flex-col shadow-2xl transition-all">
      {/* Sidebar Header */}
      <div className="h-14 border-b border-stone-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-stone-100 font-arabic">لوحة المخطوطة</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-800 bg-stone-950/60 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('toc')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
            activeTab === 'toc'
              ? 'bg-amber-900/50 text-amber-200 border border-amber-800/60 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          الفهرس والفصول
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('meta')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
            activeTab === 'meta'
              ? 'bg-amber-900/50 text-amber-200 border border-amber-800/60 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          بيانات الكتاب
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
            activeTab === 'stats'
              ? 'bg-amber-900/50 text-amber-200 border border-amber-800/60 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          إحصاءات
        </button>
      </div>

      {/* Tab 1: Table of Contents & Chapters */}
      {activeTab === 'toc' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add chapter form */}
          <form onSubmit={handleCreateChapter} className="flex gap-1.5">
            <input
              type="text"
              placeholder="عنوان الفصل الجديد..."
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              className="flex-1 bg-stone-800 border border-stone-700 rounded-md px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-amber-800 hover:bg-amber-700 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة</span>
            </button>
          </form>

          {/* Chapters List */}
          <div className="space-y-3">
            {manuscript.chapters.map((chap, idx) => (
              <div
                key={chap.id}
                className="bg-stone-850 border border-stone-800 rounded-lg p-2.5 hover:border-stone-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-amber-400/80">
                    الفصل {formatNumber(idx + 1, settings.numeralSystem)}
                  </span>
                  {manuscript.chapters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف ${chap.title}؟`)) {
                          onDeleteChapter(chap.id);
                        }
                      }}
                      className="p-0.5 text-stone-500 hover:text-red-400 rounded transition-colors"
                      title="حذف الفصل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={chap.title}
                  onChange={(e) => onUpdateChapter(chap.id, { title: e.target.value })}
                  className="w-full bg-transparent font-medium text-xs text-stone-200 border-b border-transparent hover:border-stone-700 focus:border-amber-600 focus:outline-none py-0.5"
                />

                {/* Pages in this chapter */}
                <div className="mt-2 grid grid-cols-4 gap-1.5 pt-1.5 border-t border-stone-800/60">
                  {chap.pageIds.map((pId) => {
                    const page = manuscript.pages[pId];
                    if (!page) return null;
                    const isSelected = pId === activePageId;
                    return (
                      <button
                        key={pId}
                        type="button"
                        onClick={() => onSelectPage(pId)}
                        className={`py-1 text-center text-xs rounded border transition-all ${
                          isSelected
                            ? 'bg-amber-900/60 border-amber-600 text-amber-200 font-bold'
                            : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:bg-stone-750'
                        }`}
                        title={`الانتقال إلى صفحة ${page.pageNumber}`}
                      >
                        ص {formatNumber(page.pageNumber, settings.numeralSystem)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Book Metadata Editor */}
      {activeTab === 'meta' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div>
            <label className="block text-stone-400 mb-1 font-medium">عنوان الكتاب الرئيسي</label>
            <input
              type="text"
              value={manuscript.metadata.title}
              onChange={(e) => onUpdateMetadata({ title: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 text-stone-100 focus:outline-none focus:border-amber-600 font-arabic text-sm"
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1 font-medium">العنوان الفرعي</label>
            <input
              type="text"
              value={manuscript.metadata.subtitle}
              onChange={(e) => onUpdateMetadata({ subtitle: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 text-stone-100 focus:outline-none focus:border-amber-600 font-arabic"
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1 font-medium">اسم المؤلف / الباحث</label>
            <input
              type="text"
              value={manuscript.metadata.author}
              onChange={(e) => onUpdateMetadata({ author: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 text-stone-100 focus:outline-none focus:border-amber-600 font-arabic"
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1 font-medium">دار النشر أو جهة الإصدار</label>
            <input
              type="text"
              value={manuscript.metadata.publisher || ''}
              onChange={(e) => onUpdateMetadata({ publisher: e.target.value })}
              placeholder="مثال: دار الفكر المعاصر"
              className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 text-stone-100 focus:outline-none focus:border-amber-600 font-arabic"
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1 font-medium">سنة الطبع والتاريخ</label>
            <input
              type="text"
              value={manuscript.metadata.editionYear || ''}
              onChange={(e) => onUpdateMetadata({ editionYear: e.target.value })}
              placeholder="مثال: ١٤٤٨هـ / ٢٠٢٦م"
              className="w-full bg-stone-800 border border-stone-700 rounded-md p-2 text-stone-100 focus:outline-none focus:border-amber-600 font-arabic"
            />
          </div>

          <div className="pt-2 border-t border-stone-800 text-stone-400 text-[11px] leading-relaxed">
            تظهر هذه البيانات تلقائياً في ترويسة الصفحات المتقابلة وعلى غلاف المخطوطة عند التصدير والطباعة.
          </div>
        </div>
      )}

      {/* Tab 3: Stats & Physical Geometry */}
      {activeTab === 'stats' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div className="bg-stone-800/80 border border-stone-700/80 rounded-lg p-3 space-y-2.5">
            <h3 className="font-bold text-amber-300 flex items-center gap-1.5 pb-1 border-b border-stone-700">
              <BarChart3 className="w-4 h-4" />
              <span>إحصاءات المخطوطة الحالية</span>
            </h3>

            <div className="flex justify-between">
              <span className="text-stone-400">إجمالي الصفحات:</span>
              <strong className="text-stone-100 font-mono">
                {formatNumber(totalPages, settings.numeralSystem)} صفحة
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400">عدد الكلمات:</span>
              <strong className="text-stone-100 font-mono">
                {formatNumber(totalWords, settings.numeralSystem)} كلمة
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400">عدد الحروف:</span>
              <strong className="text-stone-100 font-mono">
                {formatNumber(totalChars, settings.numeralSystem)} حرف
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400">عدد الهوامش والإحالات:</span>
              <strong className="text-amber-400 font-mono">
                {formatNumber(totalFootnotes, settings.numeralSystem)} هامش
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-400">زمن القراءة المتوقع:</span>
              <span className="text-stone-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {formatNumber(estimatedReadingTimeMinutes, settings.numeralSystem)} دقيقة تقريباً
              </span>
            </div>
          </div>

          {/* Physical Geometry Info */}
          <div className="bg-stone-800/80 border border-stone-700/80 rounded-lg p-3 space-y-2">
            <h3 className="font-bold text-amber-300 flex items-center gap-1.5 pb-1 border-b border-stone-700">
              <Info className="w-4 h-4" />
              <span>المقاس المطبعي المعتمد</span>
            </h3>

            <div className="text-stone-200 font-bold">{currentTrim.nameArabic}</div>
            <div className="text-stone-400 text-[11px] leading-relaxed">
              {currentTrim.description}
            </div>

            <div className="pt-2 text-[11px] space-y-1 text-stone-300">
              <div>الأبعاد: {currentTrim.widthMm} مم × {currentTrim.heightMm} مم</div>
              <div>هامش الكعب الداخلي: {currentTrim.marginInnerMm} مم</div>
              <div>هامش الحاشية الخارجي: {currentTrim.marginOuterMm} مم</div>
              <div>الهامش العلوي والسفلي: {currentTrim.marginTopMm} مم / {currentTrim.marginBottomMm} مم</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-stone-800 bg-stone-950/40 text-[11px] text-stone-400 text-center">
        وراق v1.0 — صُمم خصيصاً لمؤلفي الكتب العربية
      </div>
    </aside>
  );
};
