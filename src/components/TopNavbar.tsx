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
  Sparkles,
  Sun,
  Moon
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
  const isLightChrome = settings.chromeTheme === 'light';

  const toggleTheme = () => {
    onUpdateSettings({ chromeTheme: isLightChrome ? 'dark' : 'light' });
  };

  return (
    <header
      className="no-print h-14 border-b px-4 flex items-center justify-between select-none z-40 sticky top-0 font-ui transition-colors duration-150"
      style={{
        backgroundColor: 'var(--chrome-bg)',
        borderColor: 'var(--chrome-border)',
        color: 'var(--chrome-text)',
      }}
    >
      {/* Right Side: Brand & Table of Contents Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          title="فهرس الكتاب والخيارات (☰)"
          className="p-2 rounded-lg border transition-colors"
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
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span 
            className="text-xl font-bold font-book tracking-wide"
            style={{ color: 'var(--chrome-text-heading)' }}
          >
            وَرّاق
          </span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-md font-medium border"
            style={{
              backgroundColor: 'var(--chrome-bg-subtle)',
              borderColor: 'var(--chrome-border)',
              color: 'var(--chrome-text-muted)',
            }}
          >
            محرر الكتب
          </span>
        </div>

        <div 
          className="h-4 w-px mx-1 hidden sm:block" 
          style={{ backgroundColor: 'var(--chrome-border)' }}
        />

        {/* Book Title Header */}
        <div className="hidden md:flex flex-col text-right">
          <span 
            className="text-xs font-semibold truncate max-w-[200px]"
            style={{ color: 'var(--chrome-text-heading)' }}
          >
            {metadata.title || 'كتاب بدون عنوان'}
          </span>
          <span 
            className="text-[11px] truncate max-w-[200px]"
            style={{ color: 'var(--chrome-text-muted)' }}
          >
            {metadata.author || 'المؤلف'}
          </span>
        </div>
      </div>

      {/* Center: Trim Size & Paper Theme & View Controls */}
      <div className="flex items-center gap-2">
        {/* Trim Size Picker */}
        <div 
          className="flex items-center gap-1.5 border rounded-lg px-2 py-1"
          style={{
            backgroundColor: 'var(--chrome-bg-subtle)',
            borderColor: 'var(--chrome-border)',
          }}
        >
          <BookOpen className="w-4 h-4 shrink-0" style={{ color: 'var(--chrome-text-muted)' }} />
          <select
            value={settings.trimSizeId}
            onChange={(e) => onUpdateSettings({ trimSizeId: e.target.value as TrimSizeId })}
            className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
            style={{ color: 'var(--chrome-text)' }}
            title={currentTrim.description}
          >
            {Object.values(TRIM_SIZES).map((trim) => (
              <option 
                key={trim.id} 
                value={trim.id} 
                style={{ backgroundColor: 'var(--chrome-bg)', color: 'var(--chrome-text)' }}
              >
                {trim.nameArabic}
              </option>
            ))}
          </select>
        </div>

        {/* Paper Theme Picker */}
        <div 
          className="hidden lg:flex items-center gap-1.5 border rounded-lg px-2 py-1"
          style={{
            backgroundColor: 'var(--chrome-bg-subtle)',
            borderColor: 'var(--chrome-border)',
          }}
        >
          <select
            value={settings.paperThemeId}
            onChange={(e) => onUpdateSettings({ paperThemeId: e.target.value as PaperThemeId })}
            className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
            style={{ color: 'var(--chrome-text)' }}
          >
            {Object.values(PAPER_THEMES).map((theme) => (
              <option 
                key={theme.id} 
                value={theme.id} 
                style={{ backgroundColor: 'var(--chrome-bg)', color: 'var(--chrome-text)' }}
              >
                {theme.nameArabic}
              </option>
            ))}
          </select>
        </div>

        {/* Spread vs Single View Toggle */}
        <div 
          className="flex items-center border rounded-lg p-0.5"
          style={{
            backgroundColor: 'var(--chrome-bg-subtle)',
            borderColor: 'var(--chrome-border)',
          }}
        >
          <button
            type="button"
            onClick={() => onUpdateSettings({ viewMode: 'spread' })}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition-all"
            style={
              settings.viewMode === 'spread'
                ? {
                    backgroundColor: 'var(--chrome-active-bg)',
                    color: 'var(--chrome-active-text)',
                    border: '1px solid var(--chrome-active-border)',
                  }
                : {
                    color: 'var(--chrome-text)',
                    border: '1px solid transparent',
                  }
            }
            title="عرض مفردتين متقابلتين كالكتاب المفتوح"
          >
            مفردتين
          </button>
          <button
            type="button"
            onClick={() => onUpdateSettings({ viewMode: 'single' })}
            className="px-2.5 py-1 text-xs rounded-md font-medium transition-all"
            style={
              settings.viewMode === 'single'
                ? {
                    backgroundColor: 'var(--chrome-active-bg)',
                    color: 'var(--chrome-active-text)',
                    border: '1px solid var(--chrome-active-border)',
                  }
                : {
                    color: 'var(--chrome-text)',
                    border: '1px solid transparent',
                  }
            }
            title="عرض صفحة واحدة مركزة"
          >
            صفحة واحدة
          </button>
        </div>

        {/* Zoom Controls */}
        <div 
          className="hidden sm:flex items-center border rounded-lg px-1 py-0.5"
          style={{
            backgroundColor: 'var(--chrome-bg-subtle)',
            borderColor: 'var(--chrome-border)',
          }}
        >
          <button
            type="button"
            onClick={() => onUpdateSettings({ zoomLevel: Math.max(0.6, settings.zoomLevel - 0.1) })}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--chrome-text)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--chrome-text-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--chrome-text)'; }}
            title="تصغير"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span 
            className="text-[11px] font-mono px-1.5 font-medium"
            style={{ color: 'var(--chrome-text-heading)' }}
          >
            {Math.round(settings.zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => onUpdateSettings({ zoomLevel: Math.min(1.8, settings.zoomLevel + 0.1) })}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--chrome-text)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--chrome-text-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--chrome-text)'; }}
            title="تكبير"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onUpdateSettings({ zoomLevel: 1.0 })}
            className="p-1 rounded transition-colors ml-0.5 border-r pr-1 text-[10px]"
            style={{ 
              borderColor: 'var(--chrome-border)',
              color: 'var(--chrome-text-muted)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--chrome-text-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--chrome-text-muted)'; }}
            title="إعادة ضبط المقاس 100%"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Left Side: Theme Toggle / Print / Export / Sample */}
      <div className="flex items-center gap-2">
        {/* Chrome Light/Dark Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border transition-colors flex items-center justify-center"
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
          title={isLightChrome ? 'التبديل إلى المظهر الداكن للقوائم' : 'التبديل إلى المظهر الفاتح للقوائم'}
        >
          {isLightChrome ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={onResetSample}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors"
          style={{
            backgroundColor: 'var(--chrome-bg-subtle)',
            borderColor: 'var(--chrome-border)',
            color: 'var(--chrome-text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
            e.currentTarget.style.color = 'var(--chrome-text-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--chrome-bg-subtle)';
            e.currentTarget.style.color = 'var(--chrome-text-muted)';
          }}
          title="استعادة نموذج كتاب تجريبي"
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--chrome-active-border)' }} />
          <span>نموذج تجريبي</span>
        </button>

        <button
          type="button"
          onClick={onExportJson}
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
          title="حفظ نسخة احتياطية من المخطوطة (JSON)"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onImportJson}
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
          title="استيراد مخطوطة سابقة (JSON)"
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* Print / Export to PDF - State / Function button with calm active accent */}
        <button
          type="button"
          onClick={onPrintPdf}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-97 border"
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
          title="طباعة أو تصدير كتابك إلى ملف PDF بقياس الطباعة الفعلي"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">تصدير PDF</span>
        </button>
      </div>
    </header>
  );
};
