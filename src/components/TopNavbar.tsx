import React from 'react';
import type { 
  TrimSizeId, 
  PaperThemeId, 
  BookSettings, 
  BookMetadata 
} from '../types/book';
import { TRIM_SIZES } from '../constants/trimSizes';
import { PAPER_THEMES } from '../constants/paperThemes';
import { 
  BookOpen, 
  Printer, 
  Download, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Menu,
  Sparkles
} from 'lucide-react';

interface TopNavbarProps {
  metadata: BookMetadata;
  settings: BookSettings;
  onUpdateSettings: (updates: Partial<BookSettings>) => void;
  onToggleSidebar: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onPrintPdf: () => void;
  onResetSample: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  metadata,
  settings,
  onUpdateSettings,
  onToggleSidebar,
  onExportJson,
  onImportJson,
  onPrintPdf,
  onResetSample,
}) => {
  const currentTrim = TRIM_SIZES[settings.trimSizeId];

  return (
    <header className="no-print h-14 bg-stone-900 border-b border-stone-800 text-stone-200 px-4 flex items-center justify-between select-none z-40 sticky top-0">
      {/* Right Side: Brand & Table of Contents Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          title="فهرس الكتاب والفصول"
          className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-200 border border-stone-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl font-bold font-arabic text-amber-400 tracking-wide">
            وَرّاق
          </span>
          <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded-full font-medium">
            محرر الكتب
          </span>
        </div>

        <div className="h-5 w-px bg-stone-800 mx-1 hidden sm:block" />

        {/* Book Title Header */}
        <div className="hidden md:flex flex-col text-right">
          <span className="text-sm font-semibold text-stone-100 truncate max-w-[220px]">
            {metadata.title || 'كتاب بدون عنوان'}
          </span>
          <span className="text-[11px] text-stone-400 truncate max-w-[220px]">
            {metadata.author || 'المؤلف'}
          </span>
        </div>
      </div>

      {/* Center: Trim Size & Paper Theme & View Controls */}
      <div className="flex items-center gap-2">
        {/* Trim Size Picker */}
        <div className="flex items-center gap-1.5 bg-stone-800/90 border border-stone-700 rounded-lg px-2 py-1">
          <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
          <select
            value={settings.trimSizeId}
            onChange={(e) => onUpdateSettings({ trimSizeId: e.target.value as TrimSizeId })}
            className="bg-transparent text-xs text-stone-200 font-medium focus:outline-none cursor-pointer"
            title={currentTrim.description}
          >
            {Object.values(TRIM_SIZES).map((trim) => (
              <option key={trim.id} value={trim.id} className="bg-stone-900 text-stone-200">
                {trim.nameArabic}
              </option>
            ))}
          </select>
        </div>

        {/* Paper Theme Picker */}
        <div className="hidden lg:flex items-center gap-1.5 bg-stone-800/90 border border-stone-700 rounded-lg px-2 py-1">
          <select
            value={settings.paperThemeId}
            onChange={(e) => onUpdateSettings({ paperThemeId: e.target.value as PaperThemeId })}
            className="bg-transparent text-xs text-stone-200 font-medium focus:outline-none cursor-pointer"
          >
            {Object.values(PAPER_THEMES).map((theme) => (
              <option key={theme.id} value={theme.id} className="bg-stone-900 text-stone-200">
                {theme.nameArabic}
              </option>
            ))}
          </select>
        </div>

        {/* Spread vs Single View Toggle */}
        <div className="flex items-center bg-stone-800/90 border border-stone-700 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => onUpdateSettings({ viewMode: 'spread' })}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
              settings.viewMode === 'spread'
                ? 'bg-amber-900/60 text-amber-200 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="عرض مفردتين متقابلتين كالكتاب المفتوح"
          >
            مفردتين
          </button>
          <button
            type="button"
            onClick={() => onUpdateSettings({ viewMode: 'single' })}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
              settings.viewMode === 'single'
                ? 'bg-amber-900/60 text-amber-200 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="عرض صفحة واحدة مركزة"
          >
            صفحة واحدة
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center bg-stone-800/90 border border-stone-700 rounded-lg px-1 py-0.5">
          <button
            type="button"
            onClick={() => onUpdateSettings({ zoomLevel: Math.max(0.6, settings.zoomLevel - 0.1) })}
            className="p-1 hover:text-amber-300 text-stone-400 transition-colors"
            title="تصغير"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1.5 text-amber-200">
            {Math.round(settings.zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => onUpdateSettings({ zoomLevel: Math.min(1.8, settings.zoomLevel + 0.1) })}
            className="p-1 hover:text-amber-300 text-stone-400 transition-colors"
            title="تكبير"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onUpdateSettings({ zoomLevel: 1.0 })}
            className="p-1 hover:text-amber-300 text-stone-400 transition-colors ml-0.5 border-r border-stone-700 pr-1"
            title="إعادة ضبط المقاس الفعلي 100%"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Left Side: Print / Export / Sample */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onResetSample}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs text-stone-400 hover:text-amber-300 bg-stone-800/50 hover:bg-stone-800 rounded-lg border border-stone-700/60 transition-colors"
          title="استعادة نموذج كتاب تجريبي"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>نموذج توضيحي</span>
        </button>

        <button
          type="button"
          onClick={onExportJson}
          className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
          title="حفظ نسخة احتياطية من المخطوطة (JSON)"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onImportJson}
          className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
          title="استيراد مخطوطة سابقة (JSON)"
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* Print / Export to PDF */}
        <button
          type="button"
          onClick={onPrintPdf}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95"
          title="طباعة أو تصدير كتابك إلى ملف PDF بقياس الطباعة الفعلي"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">تصدير PDF / طباعة</span>
        </button>
      </div>
    </header>
  );
};
