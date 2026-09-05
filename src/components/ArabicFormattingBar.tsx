import React, { useState } from 'react';
import type { ArabicFontFamily, BookSettings } from '../types/book';
import { 
  Bold, 
  Italic, 
  AlignJustify, 
  AlignRight, 
  AlignCenter, 
  BookMarked, 
  Quote, 
  Heading2, 
  Type, 
  Hash,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { ARABIC_HONORIFICS, ARABIC_CITATION_TERMS } from '../utils/arabicTypography';

interface ArabicFormattingBarProps {
  settings: BookSettings;
  onUpdateSettings: (updates: Partial<BookSettings>) => void;
  onInsertFootnote: () => void;
  onInsertQuranVerse: () => void;
  onInsertArabicQuote: () => void;
  onInsertHonorific: (text: string) => void;
  onInsertCitationTerm: (text: string) => void;
}

export const ArabicFormattingBar: React.FC<ArabicFormattingBarProps> = ({
  settings,
  onUpdateSettings,
  onInsertFootnote,
  onInsertQuranVerse,
  onInsertArabicQuote,
  onInsertHonorific,
  onInsertCitationTerm,
}) => {
  const [showHonorifics, setShowHonorifics] = useState(false);
  const [showCitationTerms, setShowCitationTerms] = useState(false);

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
  };

  const handleHeadingClick = () => {
    executeCommand('formatBlock', '<h2>');
  };

  return (
    <div className="no-print bg-stone-900/95 border-b border-stone-800 text-stone-200 px-4 py-1.5 flex items-center justify-between gap-2 overflow-x-auto select-none z-30">
      {/* Right side: Fonts & Sizes */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Font Family */}
        <div className="flex items-center gap-1 bg-stone-800 border border-stone-700 rounded-md px-2 py-1">
          <Type className="w-3.5 h-3.5 text-amber-400" />
          <select
            value={settings.fontFamily}
            onChange={(e) => onUpdateSettings({ fontFamily: e.target.value as ArabicFontFamily })}
            className="bg-transparent text-xs text-stone-200 font-arabic focus:outline-none cursor-pointer"
          >
            <option value="Amiri" className="bg-stone-900">خط أميري (مطبعة بولاق)</option>
            <option value="Scheherazade New" className="bg-stone-900">خط شهرزاد الجديد</option>
            <option value="Traditional Arabic" className="bg-stone-900">الخط العربي التقليدي</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-1 bg-stone-800 border border-stone-700 rounded-md px-2 py-1">
          <span className="text-[11px] text-stone-400">الحجم:</span>
          <select
            value={settings.fontSizePt}
            onChange={(e) => onUpdateSettings({ fontSizePt: Number(e.target.value) })}
            className="bg-transparent text-xs text-stone-200 font-mono focus:outline-none cursor-pointer"
          >
            <option value="11" className="bg-stone-900">11 pt</option>
            <option value="12" className="bg-stone-900">12 pt</option>
            <option value="13" className="bg-stone-900">13 pt (متوسط)</option>
            <option value="14" className="bg-stone-900">14 pt (معياري وزيري)</option>
            <option value="15" className="bg-stone-900">15 pt</option>
            <option value="16" className="bg-stone-900">16 pt (كبير)</option>
            <option value="17" className="bg-stone-900">17 pt</option>
          </select>
        </div>

        {/* Line Height */}
        <div className="hidden md:flex items-center gap-1 bg-stone-800 border border-stone-700 rounded-md px-2 py-1">
          <span className="text-[11px] text-stone-400">التباعد:</span>
          <select
            value={settings.lineHeight}
            onChange={(e) => onUpdateSettings({ lineHeight: Number(e.target.value) })}
            className="bg-transparent text-xs text-stone-200 font-mono focus:outline-none cursor-pointer"
          >
            <option value="1.6" className="bg-stone-900">1.6 (متقارب)</option>
            <option value="1.7" className="bg-stone-900">1.7</option>
            <option value="1.78" className="bg-stone-900">1.78 (قياسي مريح)</option>
            <option value="1.9" className="bg-stone-900">1.9 (متسع للحركات)</option>
            <option value="2.0" className="bg-stone-900">2.0</option>
          </select>
        </div>

        <div className="h-5 w-px bg-stone-800 mx-1" />

        {/* Basic Styles */}
        <div className="flex items-center bg-stone-800 border border-stone-700 rounded-md p-0.5">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1 hover:text-amber-300 text-stone-300 rounded hover:bg-stone-700"
            title="عريض (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1 hover:text-amber-300 text-stone-300 rounded hover:bg-stone-700"
            title="مائل (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleHeadingClick}
            className="p-1 hover:text-amber-300 text-stone-300 rounded hover:bg-stone-700"
            title="عنوان فصل / مبحث"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alignment */}
        <div className="hidden sm:flex items-center bg-stone-800 border border-stone-700 rounded-md p-0.5">
          <button
            type="button"
            onClick={() => executeCommand('justifyFull')}
            className="p-1 hover:text-amber-300 text-stone-300 rounded hover:bg-stone-700"
            title="ضبط النص 양طرفين (Justify)"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyRight')}
            className="p-1 hover:text-amber-300 text-stone-300 rounded hover:bg-stone-700"
            title="محاذاة لليمين"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyCenter')}
            className="p-1 hover:text-amber-300 text-stone-300 rounded hover:bg-stone-700"
            title="توسيط"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center & Left: Scholarly Arabic Macro Tools */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Footnote Citation Insertion */}
        <button
          type="button"
          onClick={onInsertFootnote}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-900/40 hover:bg-amber-900/60 text-amber-200 border border-amber-800/60 rounded-md text-xs font-semibold shadow-sm transition-all active:scale-95"
          title="إدراج رقم إحالة هامش في المتن وفي حاشية الصفحة (Alt+F)"
        >
          <BookMarked className="w-3.5 h-3.5 text-amber-400" />
          <span>إدراج هامش</span>
        </button>

        {/* Quranic Verse Insertion */}
        <button
          type="button"
          onClick={onInsertQuranVerse}
          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-800/60 rounded-md text-xs font-medium transition-all"
          title="إحاطة النص المحدد بأقواس الآيات القرآنية المزهرة ﴿ ﴾"
        >
          <span className="text-emerald-400 font-bold">﴿ ﴾</span>
          <span>آية قرآنية</span>
        </button>

        {/* Arabic Quotation Insertion */}
        <button
          type="button"
          onClick={onInsertArabicQuote}
          className="flex items-center gap-1 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-md text-xs font-medium transition-all"
          title="إحاطة النص المحدد بعلامتي التنصيص العربية « »"
        >
          <Quote className="w-3.5 h-3.5 text-amber-400" />
          <span>اقتباس « »</span>
        </button>

        {/* Arabic Honorifics Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowHonorifics(!showHonorifics);
              setShowCitationTerms(false);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-md text-xs font-medium transition-all"
            title="إدراج رموز التبجيل والتصلية والترضي"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>الرموز والصلوات</span>
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </button>

          {showHonorifics && (
            <div className="absolute left-0 mt-1 w-48 bg-stone-900 border border-stone-700 rounded-lg shadow-2xl p-1 z-50 text-right">
              {ARABIC_HONORIFICS.map((h) => (
                <button
                  key={h.key}
                  type="button"
                  onClick={() => {
                    onInsertHonorific(h.replacement);
                    setShowHonorifics(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-stone-800 rounded text-xs text-stone-200 transition-colors"
                >
                  <span className="font-bold text-amber-300 font-arabic text-sm">{h.label}</span>
                  <span className="text-[10px] text-stone-400">{h.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Citation Terms Dropdown */}
        <div className="relative hidden xl:block">
          <button
            type="button"
            onClick={() => {
              setShowCitationTerms(!showCitationTerms);
              setShowHonorifics(false);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-md text-xs font-medium transition-all"
            title="مصطلحات التوثيق والهوامش السريعة"
          >
            <span>مصطلحات التوثيق</span>
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </button>

          {showCitationTerms && (
            <div className="absolute left-0 mt-1 w-44 bg-stone-900 border border-stone-700 rounded-lg shadow-2xl p-1 z-50 text-right">
              {ARABIC_CITATION_TERMS.map((term, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onInsertCitationTerm(term.text);
                    setShowCitationTerms(false);
                  }}
                  className="w-full text-right px-2.5 py-1.5 hover:bg-stone-800 rounded text-xs text-stone-200 transition-colors"
                >
                  {term.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Numeral System Toggle */}
        <button
          type="button"
          onClick={() =>
            onUpdateSettings({
              numeralSystem: settings.numeralSystem === 'eastern' ? 'western' : 'eastern',
            })
          }
          className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-md text-xs text-amber-300 font-medium transition-colors"
          title="التبديل بين الأرقام المشرقية (١، ٢، ٣) والمغربية (1، 2، 3)"
        >
          <Hash className="w-3 h-3 text-stone-400" />
          <span>{settings.numeralSystem === 'eastern' ? 'أرقام: ١٢٣' : 'أرقام: 123'}</span>
        </button>
      </div>
    </div>
  );
};
