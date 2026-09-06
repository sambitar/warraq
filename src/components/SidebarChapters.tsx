import React, { useState } from 'react';
import type { 
  Manuscript, 
  Chapter, 
  BookMetadata, 
  BookSettings,
  ArabicFontFamily
} from '../types/book';
import { 
  X, 
  Plus, 
  Book, 
  Trash2, 
  Info, 
  BarChart3, 
  Clock,
  SlidersHorizontal,
  BookOpen,
  Layers,
  Printer,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Hash,
  Type,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { countArabicWords, countArabicChars, formatNumber } from '../utils/arabicTypography';
import { TRIM_SIZES } from '../constants/trimSizes';
import { PAPER_THEMES } from '../constants/paperThemes';

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
  onUpdateSettings: (updates: Partial<BookSettings>) => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onPrintPdf: () => void;
  onResetSample: () => void;
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
  onUpdateSettings,
  onExportJson,
  onImportJson,
  onPrintPdf,
  onResetSample,
  settings,
}) => {
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'toc' | 'settings' | 'meta' | 'stats'>('toc');

  if (!isOpen) return null;

  const isLightChrome = settings.chromeTheme === 'light';

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
    <>
      {/* Soft dimmed backdrop to close sidebar when clicking outside */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 transition-opacity"
        aria-hidden="true"
      />

      {/* Main Sidebar Drawer */}
      <aside 
        className="no-print fixed inset-y-0 right-0 w-[90vw] max-w-[420px] border-l z-50 flex flex-col shadow-xl transition-all font-ui"
        style={{
          backgroundColor: 'var(--chrome-sidebar-bg)',
          borderColor: 'var(--chrome-border)',
          color: 'var(--chrome-text)',
        }}
      >
        {/* Sidebar Header */}
        <div 
          className="h-14 border-b px-4 flex items-center justify-between"
          style={{
            backgroundColor: 'var(--chrome-bg)',
            borderColor: 'var(--chrome-border)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div 
              className="p-1.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--chrome-active-bg)',
                borderColor: 'var(--chrome-active-border)',
                color: 'var(--chrome-active-text)',
              }}
            >
              <Book className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--chrome-text-heading)' }}>
                قائمة وخيارات الكتاب
              </h2>
              <p className="text-[11px] truncate max-w-[220px]" style={{ color: 'var(--chrome-text-muted)' }}>
                {manuscript.metadata.title || 'كتاب بدون عنوان'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border transition-colors"
            style={{
              backgroundColor: 'var(--chrome-bg-subtle)',
              borderColor: 'var(--chrome-border)',
              color: 'var(--chrome-text)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
              e.currentTarget.style.color = 'var(--chrome-text-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--chrome-bg-subtle)';
              e.currentTarget.style.color = 'var(--chrome-text)';
            }}
            title="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div 
          className="flex border-b p-1.5 gap-1"
          style={{
            backgroundColor: 'var(--chrome-bg-subtle)',
            borderColor: 'var(--chrome-border)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('toc')}
            className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 border"
            style={
              activeTab === 'toc'
                ? {
                    backgroundColor: 'var(--chrome-active-bg)',
                    borderColor: 'var(--chrome-active-border)',
                    color: 'var(--chrome-active-text)',
                  }
                : {
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    color: 'var(--chrome-text)',
                  }
            }
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>الفصول</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 border"
            style={
              activeTab === 'settings'
                ? {
                    backgroundColor: 'var(--chrome-active-bg)',
                    borderColor: 'var(--chrome-active-border)',
                    color: 'var(--chrome-active-text)',
                  }
                : {
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    color: 'var(--chrome-text)',
                  }
            }
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>الخيارات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('meta')}
            className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 border"
            style={
              activeTab === 'meta'
                ? {
                    backgroundColor: 'var(--chrome-active-bg)',
                    borderColor: 'var(--chrome-active-border)',
                    color: 'var(--chrome-active-text)',
                  }
                : {
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    color: 'var(--chrome-text)',
                  }
            }
          >
            <Info className="w-3.5 h-3.5" />
            <span>البيانات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 border"
            style={
              activeTab === 'stats'
                ? {
                    backgroundColor: 'var(--chrome-active-bg)',
                    borderColor: 'var(--chrome-active-border)',
                    color: 'var(--chrome-active-text)',
                  }
                : {
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    color: 'var(--chrome-text)',
                  }
            }
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>الإحصاء</span>
          </button>
        </div>

        {/* Tab 1: Table of Contents & Chapters */}
        {activeTab === 'toc' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Add chapter form */}
            <form onSubmit={handleCreateChapter} className="flex gap-2">
              <input
                type="text"
                placeholder="عنوان فصل جديد..."
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--chrome-bg-subtle)',
                  borderColor: 'var(--chrome-border)',
                  color: 'var(--chrome-text-heading)',
                }}
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border"
                style={{
                  backgroundColor: 'var(--chrome-active-bg)',
                  borderColor: 'var(--chrome-active-border)',
                  color: 'var(--chrome-active-text)',
                }}
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </form>

            {/* Chapters List */}
            <div className="space-y-3">
              {manuscript.chapters.map((chap, idx) => (
                <div
                  key={chap.id}
                  className="border rounded-xl p-3 transition-colors"
                  style={{
                    backgroundColor: 'var(--chrome-card-bg)',
                    borderColor: 'var(--chrome-card-border)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="text-xs font-bold"
                      style={{ color: 'var(--chrome-active-text)' }}
                    >
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
                        className="p-1 rounded-md transition-colors"
                        style={{ color: 'var(--chrome-text-muted)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#E05252'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--chrome-text-muted)'; }}
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
                    className="w-full bg-transparent font-medium text-xs border-b border-transparent focus:outline-none py-1 transition-colors"
                    style={{ color: 'var(--chrome-text-heading)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--chrome-active-border)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
                  />

                  {/* Pages in this chapter */}
                  <div 
                    className="mt-2.5 grid grid-cols-4 gap-1.5 pt-2 border-t"
                    style={{ borderColor: 'var(--chrome-border)' }}
                  >
                    {chap.pageIds.map((pId) => {
                      const page = manuscript.pages[pId];
                      if (!page) return null;
                      const isSelected = pId === activePageId;
                      return (
                        <button
                          key={pId}
                          type="button"
                          onClick={() => {
                            onSelectPage(pId);
                            onClose();
                          }}
                          className="py-1.5 text-center text-xs rounded-lg border transition-all"
                          style={
                            isSelected
                              ? {
                                  backgroundColor: 'var(--chrome-active-bg)',
                                  borderColor: 'var(--chrome-active-border)',
                                  color: 'var(--chrome-active-text)',
                                  fontWeight: 700,
                                }
                              : {
                                  backgroundColor: 'var(--chrome-bg-subtle)',
                                  borderColor: 'var(--chrome-border)',
                                  color: 'var(--chrome-text)',
                                }
                          }
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

        {/* Tab 2: Full Book Settings & Options */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Chrome Theme Mode (Light / Dark) */}
            <div>
              <label className="block font-bold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--chrome-text-heading)' }}>
                {isLightChrome ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-400" />}
                <span>مظهر واجهة القوائم (Chrome Theme):</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ chromeTheme: 'light' })}
                  className="p-2.5 rounded-lg border text-center font-bold transition-all flex items-center justify-center gap-2"
                  style={
                    isLightChrome
                      ? {
                          backgroundColor: 'var(--chrome-active-bg)',
                          borderColor: 'var(--chrome-active-border)',
                          color: 'var(--chrome-active-text)',
                        }
                      : {
                          backgroundColor: 'var(--chrome-card-bg)',
                          borderColor: 'var(--chrome-card-border)',
                          color: 'var(--chrome-text)',
                        }
                  }
                >
                  <Sun className="w-4 h-4" />
                  <span>مظهر فاتح ناعم</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ chromeTheme: 'dark' })}
                  className="p-2.5 rounded-lg border text-center font-bold transition-all flex items-center justify-center gap-2"
                  style={
                    !isLightChrome
                      ? {
                          backgroundColor: 'var(--chrome-active-bg)',
                          borderColor: 'var(--chrome-active-border)',
                          color: 'var(--chrome-active-text)',
                        }
                      : {
                          backgroundColor: 'var(--chrome-card-bg)',
                          borderColor: 'var(--chrome-card-border)',
                          color: 'var(--chrome-text)',
                        }
                  }
                >
                  <Moon className="w-4 h-4" />
                  <span>مظهر داكن هادئ</span>
                </button>
              </div>
            </div>

            {/* Trim Size Selection */}
            <div>
              <label className="block font-bold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--chrome-text-heading)' }}>
                <BookOpen className="w-4 h-4" style={{ color: 'var(--chrome-text-muted)' }} />
                <span>مقاس قطع الكتاب المطبوع:</span>
              </label>
              <div className="space-y-1.5">
                {Object.values(TRIM_SIZES).map((trim) => {
                  const isSelected = trim.id === settings.trimSizeId;
                  return (
                    <button
                      key={trim.id}
                      type="button"
                      onClick={() => onUpdateSettings({ trimSizeId: trim.id })}
                      className="w-full text-right p-2.5 rounded-lg border transition-all flex items-center justify-between"
                      style={
                        isSelected
                          ? {
                              backgroundColor: 'var(--chrome-active-bg)',
                              borderColor: 'var(--chrome-active-border)',
                              color: 'var(--chrome-active-text)',
                            }
                          : {
                              backgroundColor: 'var(--chrome-card-bg)',
                              borderColor: 'var(--chrome-card-border)',
                              color: 'var(--chrome-text)',
                            }
                      }
                    >
                      <div>
                        <div className="font-bold text-xs" style={{ color: isSelected ? 'var(--chrome-active-text)' : 'var(--chrome-text-heading)' }}>
                          {trim.nameArabic}
                        </div>
                        <div className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'var(--chrome-text-muted)' }}>
                          {trim.description}
                        </div>
                      </div>
                      <span className="font-mono text-[11px] mr-2 shrink-0" style={{ color: 'var(--chrome-text-muted)' }}>
                        {trim.widthMm}×{trim.heightMm} مم
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paper Theme Selection */}
            <div>
              <label className="block font-bold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--chrome-text-heading)' }}>
                <Layers className="w-4 h-4" style={{ color: 'var(--chrome-text-muted)' }} />
                <span>نوع ولون ورق الكتاب:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(PAPER_THEMES).map((theme) => {
                  const isSelected = theme.id === settings.paperThemeId;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onUpdateSettings({ paperThemeId: theme.id })}
                      className="p-2.5 rounded-lg border text-right transition-all flex items-center gap-2"
                      style={
                        isSelected
                          ? {
                              backgroundColor: 'var(--chrome-active-bg)',
                              borderColor: 'var(--chrome-active-border)',
                              color: 'var(--chrome-active-text)',
                            }
                          : {
                              backgroundColor: 'var(--chrome-card-bg)',
                              borderColor: 'var(--chrome-card-border)',
                              color: 'var(--chrome-text)',
                            }
                      }
                    >
                      <span
                        className="w-4 h-4 rounded-full border shrink-0"
                        style={{ 
                          backgroundColor: theme.backgroundColor,
                          borderColor: 'var(--chrome-border)',
                        }}
                      />
                      <span className="font-bold text-xs">{theme.nameArabic}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* View Mode: Spread vs Single */}
            <div>
              <label className="block font-bold mb-1.5" style={{ color: 'var(--chrome-text-heading)' }}>
                نمط عرض الصفحات:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ viewMode: 'spread' })}
                  className="p-2 rounded-lg border text-center font-bold transition-all"
                  style={
                    settings.viewMode === 'spread'
                      ? {
                          backgroundColor: 'var(--chrome-active-bg)',
                          borderColor: 'var(--chrome-active-border)',
                          color: 'var(--chrome-active-text)',
                        }
                      : {
                          backgroundColor: 'var(--chrome-card-bg)',
                          borderColor: 'var(--chrome-card-border)',
                          color: 'var(--chrome-text)',
                        }
                  }
                >
                  مفردتين (كتاب مفتوح)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ viewMode: 'single' })}
                  className="p-2 rounded-lg border text-center font-bold transition-all"
                  style={
                    settings.viewMode === 'single'
                      ? {
                          backgroundColor: 'var(--chrome-active-bg)',
                          borderColor: 'var(--chrome-active-border)',
                          color: 'var(--chrome-active-text)',
                        }
                      : {
                          backgroundColor: 'var(--chrome-card-bg)',
                          borderColor: 'var(--chrome-card-border)',
                          color: 'var(--chrome-text)',
                        }
                  }
                >
                  صفحة واحدة مركزة
                </button>
              </div>
            </div>

            {/* Typography & Spacing */}
            <div 
              className="border rounded-xl p-3 space-y-3"
              style={{
                backgroundColor: 'var(--chrome-card-bg)',
                borderColor: 'var(--chrome-card-border)',
              }}
            >
              <div 
                className="font-bold flex items-center gap-1.5 border-b pb-1.5"
                style={{ 
                  color: 'var(--chrome-text-heading)',
                  borderColor: 'var(--chrome-border)',
                }}
              >
                <Type className="w-4 h-4" style={{ color: 'var(--chrome-text-muted)' }} />
                <span>إعدادات الخط والطباعة</span>
              </div>

              {/* Font Family */}
              <div>
                <label className="block mb-1" style={{ color: 'var(--chrome-text-muted)' }}>
                  خط متن الكتاب:
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => onUpdateSettings({ fontFamily: e.target.value as ArabicFontFamily })}
                  className="w-full border rounded-lg p-2 focus:outline-none cursor-pointer"
                  style={{
                    backgroundColor: 'var(--chrome-bg-subtle)',
                    borderColor: 'var(--chrome-border)',
                    color: 'var(--chrome-text)',
                  }}
                >
                  <option value="Amiri" style={{ backgroundColor: 'var(--chrome-bg)', color: 'var(--chrome-text)' }}>
                    خط أميري الكلاسيكي (مطبعة بولاق)
                  </option>
                  <option value="Scheherazade New" style={{ backgroundColor: 'var(--chrome-bg)', color: 'var(--chrome-text)' }}>
                    خط شهرزاد الجديد (محقق)
                  </option>
                  <option value="Traditional Arabic" style={{ backgroundColor: 'var(--chrome-bg)', color: 'var(--chrome-text)' }}>
                    الخط العربي التقليدي
                  </option>
                </select>
              </div>

              {/* Font Size & Line Spacing */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1" style={{ color: 'var(--chrome-text-muted)' }}>
                    حجم الخط:
                  </label>
                  <select
                    value={settings.fontSizePt}
                    onChange={(e) => onUpdateSettings({ fontSizePt: Number(e.target.value) })}
                    className="w-full border rounded-lg p-2 font-mono focus:outline-none"
                    style={{
                      backgroundColor: 'var(--chrome-bg-subtle)',
                      borderColor: 'var(--chrome-border)',
                      color: 'var(--chrome-text)',
                    }}
                  >
                    <option value="11" style={{ backgroundColor: 'var(--chrome-bg)' }}>11 pt</option>
                    <option value="12" style={{ backgroundColor: 'var(--chrome-bg)' }}>12 pt</option>
                    <option value="13" style={{ backgroundColor: 'var(--chrome-bg)' }}>13 pt (متوسط)</option>
                    <option value="14" style={{ backgroundColor: 'var(--chrome-bg)' }}>14 pt (معياري)</option>
                    <option value="15" style={{ backgroundColor: 'var(--chrome-bg)' }}>15 pt</option>
                    <option value="16" style={{ backgroundColor: 'var(--chrome-bg)' }}>16 pt (كبير)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1" style={{ color: 'var(--chrome-text-muted)' }}>
                    تباعد الأسطر:
                  </label>
                  <select
                    value={settings.lineHeight}
                    onChange={(e) => onUpdateSettings({ lineHeight: Number(e.target.value) })}
                    className="w-full border rounded-lg p-2 font-mono focus:outline-none"
                    style={{
                      backgroundColor: 'var(--chrome-bg-subtle)',
                      borderColor: 'var(--chrome-border)',
                      color: 'var(--chrome-text)',
                    }}
                  >
                    <option value="1.6" style={{ backgroundColor: 'var(--chrome-bg)' }}>1.6 (متقارب)</option>
                    <option value="1.7" style={{ backgroundColor: 'var(--chrome-bg)' }}>1.7</option>
                    <option value="1.78" style={{ backgroundColor: 'var(--chrome-bg)' }}>1.78 (مريح)</option>
                    <option value="1.9" style={{ backgroundColor: 'var(--chrome-bg)' }}>1.9 (متسع)</option>
                    <option value="2.0" style={{ backgroundColor: 'var(--chrome-bg)' }}>2.0</option>
                  </select>
                </div>
              </div>

              {/* Numeral System */}
              <div>
                <label className="block mb-1 flex items-center gap-1" style={{ color: 'var(--chrome-text-muted)' }}>
                  <Hash className="w-3.5 h-3.5" style={{ color: 'var(--chrome-text-muted)' }} />
                  <span>نظام أرقام الصفحات والهوامش:</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ numeralSystem: 'eastern' })}
                    className="p-2 rounded-lg border text-center font-bold transition-all"
                    style={
                      settings.numeralSystem === 'eastern'
                        ? {
                            backgroundColor: 'var(--chrome-active-bg)',
                            borderColor: 'var(--chrome-active-border)',
                            color: 'var(--chrome-active-text)',
                          }
                        : {
                            backgroundColor: 'var(--chrome-bg-subtle)',
                            borderColor: 'var(--chrome-border)',
                            color: 'var(--chrome-text)',
                          }
                    }
                  >
                    مشرقية: ١، ٢، ٣
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ numeralSystem: 'western' })}
                    className="p-2 rounded-lg border text-center font-bold transition-all"
                    style={
                      settings.numeralSystem === 'western'
                        ? {
                            backgroundColor: 'var(--chrome-active-bg)',
                            borderColor: 'var(--chrome-active-border)',
                            color: 'var(--chrome-active-text)',
                          }
                        : {
                            backgroundColor: 'var(--chrome-bg-subtle)',
                            borderColor: 'var(--chrome-border)',
                            color: 'var(--chrome-text)',
                          }
                    }
                  >
                    مغربية: 1, 2, 3
                  </button>
                </div>
              </div>

              {/* Zoom Controls */}
              <div>
                <label className="block mb-1" style={{ color: 'var(--chrome-text-muted)' }}>
                  نسبة تكبير شاشة العرض:
                </label>
                <div 
                  className="flex items-center justify-between border rounded-lg p-1.5"
                  style={{
                    backgroundColor: 'var(--chrome-bg-subtle)',
                    borderColor: 'var(--chrome-border)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ zoomLevel: Math.max(0.6, settings.zoomLevel - 0.1) })}
                    className="p-1.5 rounded-md transition-colors"
                    style={{ color: 'var(--chrome-text)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--chrome-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    title="تصغير"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold text-sm" style={{ color: 'var(--chrome-text-heading)' }}>
                    {Math.round(settings.zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ zoomLevel: Math.min(1.8, settings.zoomLevel + 0.1) })}
                    className="p-1.5 rounded-md transition-colors"
                    style={{ color: 'var(--chrome-text)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--chrome-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    title="تكبير"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ zoomLevel: 1.0 })}
                    className="text-[11px] px-2 py-1 rounded transition-colors"
                    style={{
                      backgroundColor: 'var(--chrome-hover)',
                      color: 'var(--chrome-text)',
                    }}
                  >
                    100%
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions (Print, Export, Import, Reset) */}
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--chrome-border)' }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPrintPdf();
                }}
                className="w-full py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 border transition-all active:scale-98 shadow-xs"
                style={{
                  backgroundColor: 'var(--chrome-active-bg)',
                  borderColor: 'var(--chrome-active-border)',
                  color: 'var(--chrome-active-text)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--chrome-active-border)';
                  e.currentTarget.style.color = isLightChrome ? '#FFFFFF' : '#1E1E1E';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--chrome-active-bg)';
                  e.currentTarget.style.color = 'var(--chrome-active-text)';
                }}
              >
                <Printer className="w-4 h-4" />
                <span>تصدير الكتاب للطباعة (PDF)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onExportJson}
                  className="py-2 px-2.5 border rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--chrome-bg-subtle)',
                    borderColor: 'var(--chrome-border)',
                    color: 'var(--chrome-text)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--chrome-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--chrome-bg-subtle)'; }}
                >
                  <Download className="w-3.5 h-3.5" style={{ color: 'var(--chrome-text-muted)' }} />
                  <span>حفظ JSON</span>
                </button>
                <button
                  type="button"
                  onClick={onImportJson}
                  className="py-2 px-2.5 border rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--chrome-bg-subtle)',
                    borderColor: 'var(--chrome-border)',
                    color: 'var(--chrome-text)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--chrome-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--chrome-bg-subtle)'; }}
                >
                  <Upload className="w-3.5 h-3.5" style={{ color: 'var(--chrome-text-muted)' }} />
                  <span>استيراد</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onResetSample}
                className="w-full py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors text-[11px]"
                style={{ color: 'var(--chrome-text-muted)' }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
                  e.currentTarget.style.color = 'var(--chrome-text-hover)';
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--chrome-text-muted)';
                }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--chrome-active-border)' }} />
                <span>استعادة نموذج الكتاب التوضيحي</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Book Metadata Editor */}
        {activeTab === 'meta' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            <div>
              <label className="block mb-1.5 font-bold" style={{ color: 'var(--chrome-text-heading)' }}>
                عنوان الكتاب الرئيسي
              </label>
              <input
                type="text"
                value={manuscript.metadata.title}
                onChange={(e) => onUpdateMetadata({ title: e.target.value })}
                className="w-full border rounded-lg p-2.5 focus:outline-none font-bold text-sm"
                style={{
                  backgroundColor: 'var(--chrome-card-bg)',
                  borderColor: 'var(--chrome-border)',
                  color: 'var(--chrome-text-heading)',
                }}
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold" style={{ color: 'var(--chrome-text-heading)' }}>
                العنوان الفرعي
              </label>
              <input
                type="text"
                value={manuscript.metadata.subtitle}
                onChange={(e) => onUpdateMetadata({ subtitle: e.target.value })}
                className="w-full border rounded-lg p-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--chrome-card-bg)',
                  borderColor: 'var(--chrome-border)',
                  color: 'var(--chrome-text)',
                }}
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold" style={{ color: 'var(--chrome-text-heading)' }}>
                اسم المؤلف / الباحث
              </label>
              <input
                type="text"
                value={manuscript.metadata.author}
                onChange={(e) => onUpdateMetadata({ author: e.target.value })}
                className="w-full border rounded-lg p-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--chrome-card-bg)',
                  borderColor: 'var(--chrome-border)',
                  color: 'var(--chrome-text)',
                }}
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold" style={{ color: 'var(--chrome-text-heading)' }}>
                دار النشر أو جهة الإصدار
              </label>
              <input
                type="text"
                value={manuscript.metadata.publisher || ''}
                onChange={(e) => onUpdateMetadata({ publisher: e.target.value })}
                placeholder="مثال: دار الفكر المعاصر"
                className="w-full border rounded-lg p-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--chrome-card-bg)',
                  borderColor: 'var(--chrome-border)',
                  color: 'var(--chrome-text)',
                }}
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold" style={{ color: 'var(--chrome-text-heading)' }}>
                سنة الطبع والتاريخ
              </label>
              <input
                type="text"
                value={manuscript.metadata.editionYear || ''}
                onChange={(e) => onUpdateMetadata({ editionYear: e.target.value })}
                placeholder="مثال: ١٤٤٨هـ / ٢٠٢٦م"
                className="w-full border rounded-lg p-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--chrome-card-bg)',
                  borderColor: 'var(--chrome-border)',
                  color: 'var(--chrome-text)',
                }}
              />
            </div>

            <div 
              className="pt-2 border-t text-[11px] leading-relaxed"
              style={{
                borderColor: 'var(--chrome-border)',
                color: 'var(--chrome-text-muted)',
              }}
            >
              تظهر هذه البيانات تلقائياً في ترويسة الصفحات المتقابلة وعلى غلاف المخطوطة عند التصدير والطباعة.
            </div>
          </div>
        )}

        {/* Tab 4: Stats & Physical Geometry */}
        {activeTab === 'stats' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            <div 
              className="border rounded-xl p-3.5 space-y-2.5"
              style={{
                backgroundColor: 'var(--chrome-card-bg)',
                borderColor: 'var(--chrome-card-border)',
              }}
            >
              <h3 
                className="font-bold flex items-center gap-1.5 pb-2 border-b"
                style={{
                  color: 'var(--chrome-text-heading)',
                  borderColor: 'var(--chrome-border)',
                }}
              >
                <BarChart3 className="w-4 h-4" style={{ color: 'var(--chrome-active-border)' }} />
                <span>إحصاءات المخطوطة الحالية</span>
              </h3>

              <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--chrome-border)' }}>
                <span style={{ color: 'var(--chrome-text-muted)' }}>إجمالي الصفحات:</span>
                <strong className="font-mono" style={{ color: 'var(--chrome-text-heading)' }}>
                  {formatNumber(totalPages, settings.numeralSystem)} صفحة
                </strong>
              </div>

              <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--chrome-border)' }}>
                <span style={{ color: 'var(--chrome-text-muted)' }}>عدد الكلمات:</span>
                <strong className="font-mono" style={{ color: 'var(--chrome-text-heading)' }}>
                  {formatNumber(totalWords, settings.numeralSystem)} كلمة
                </strong>
              </div>

              <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--chrome-border)' }}>
                <span style={{ color: 'var(--chrome-text-muted)' }}>عدد الحروف:</span>
                <strong className="font-mono" style={{ color: 'var(--chrome-text-heading)' }}>
                  {formatNumber(totalChars, settings.numeralSystem)} حرف
                </strong>
              </div>

              <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--chrome-border)' }}>
                <span style={{ color: 'var(--chrome-text-muted)' }}>عدد الهوامش والإحالات:</span>
                <strong className="font-mono" style={{ color: 'var(--chrome-active-text)' }}>
                  {formatNumber(totalFootnotes, settings.numeralSystem)} هامش
                </strong>
              </div>

              <div className="flex justify-between py-1">
                <span style={{ color: 'var(--chrome-text-muted)' }}>زمن القراءة المتوقع:</span>
                <span className="flex items-center gap-1" style={{ color: 'var(--chrome-text)' }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: 'var(--chrome-text-muted)' }} />
                  {formatNumber(estimatedReadingTimeMinutes, settings.numeralSystem)} دقيقة تقريباً
                </span>
              </div>
            </div>

            {/* Physical Geometry Info */}
            <div 
              className="border rounded-xl p-3.5 space-y-2"
              style={{
                backgroundColor: 'var(--chrome-card-bg)',
                borderColor: 'var(--chrome-card-border)',
              }}
            >
              <h3 
                className="font-bold flex items-center gap-1.5 pb-1.5 border-b"
                style={{
                  color: 'var(--chrome-text-heading)',
                  borderColor: 'var(--chrome-border)',
                }}
              >
                <Info className="w-4 h-4" style={{ color: 'var(--chrome-active-border)' }} />
                <span>المقاس المطبعي المعتمد</span>
              </h3>

              <div className="font-bold text-sm" style={{ color: 'var(--chrome-text-heading)' }}>
                {currentTrim.nameArabic}
              </div>
              <div className="text-[11px] leading-relaxed" style={{ color: 'var(--chrome-text-muted)' }}>
                {currentTrim.description}
              </div>

              <div 
                className="pt-2 text-[11px] space-y-1.5 p-2.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--chrome-bg-subtle)',
                  borderColor: 'var(--chrome-border)',
                  color: 'var(--chrome-text)',
                }}
              >
                <div className="flex justify-between">
                  <span style={{ color: 'var(--chrome-text-muted)' }}>الأبعاد الفعلية:</span>
                  <span className="font-mono">{currentTrim.widthMm} مم × {currentTrim.heightMm} مم</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--chrome-text-muted)' }}>هامش الكعب (Gutter):</span>
                  <span className="font-mono">{currentTrim.marginInnerMm} مم</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--chrome-text-muted)' }}>هامش الإبهام الخارجي:</span>
                  <span className="font-mono">{currentTrim.marginOuterMm} مم</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--chrome-text-muted)' }}>الهامش العلوي والسفلي:</span>
                  <span className="font-mono">{currentTrim.marginTopMm} مم / {currentTrim.marginBottomMm} مم</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div 
          className="p-3 border-t text-[11px] text-center"
          style={{
            backgroundColor: 'var(--chrome-bg)',
            borderColor: 'var(--chrome-border)',
            color: 'var(--chrome-text-muted)',
          }}
        >
          وراق v1.0 — صُمم خصيصاً لمؤلفي الكتب العربية
        </div>
      </aside>
    </>
  );
};
