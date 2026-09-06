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
    <div 
      className="no-print border-b px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 select-none relative z-30 font-ui transition-colors duration-150"
      style={{
        backgroundColor: 'var(--chrome-bg)',
        borderColor: 'var(--chrome-border)',
        color: 'var(--chrome-text)',
      }}
    >
      {/* Right side: Fonts & Sizes */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Font Family */}
        <div 
          className="flex items-center gap-1.5 border rounded-md px-2 py-1"
          style={{
            backgroundColor: 'var(--chrome-bg-subtle)',
            borderColor: 'var(--chrome-border)',
          }}
        >
          <Type className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--chrome-text-muted)' }} />
          <select
            value={settings.fontFamily}
            onChange={(e) => onUpdateSettings({ fontFamily: e.target.value as ArabicFontFamily })}
            className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
            style={{ color: 'var(--chrome-text)' }}
          >
            <option value="Amiri" style={{ backgroundColor: 'var(--chrome-bg)', color: 'var(--chrome-text)' }}>
              خط أميري (مطبعة بولاق)
            </option>
            <option value="Scheherazade New" style={{ backgroundColor: 'var(--chrome-bg)', color: 'var(--chrome-text)' }}>
              خط شهرزاد الجديد
            </option>
            <option value="Traditional Arabic" style={{ backgroundColor: 'var(--chrome-bg)', color: 'var(--chrome-text)' }}>
              الخط العربي التقليدي
            </option>
          </select>
        </div>

        {/* Font Size */}
        <div 
          className="flex items-center gap-1 border rounded-md px-2 py-1"
          style={{
            backgroundColor: 'var(--chrome-bg-subtle)',
            borderColor: 'var(--chrome-border)',
          }}
        >
          <span className="text-[11px]" style={{ color: 'var(--chrome-text-muted)' }}>الحجم:</span>
          <select
            value={settings.fontSizePt}
            onChange={(e) => onUpdateSettings({ fontSizePt: Number(e.target.value) })}
            className="bg-transparent text-xs font-mono focus:outline-none cursor-pointer"
            style={{ color: 'var(--chrome-text)' }}
          >
            <option value="11" style={{ backgroundColor: 'var(--chrome-bg)' }}>11 pt</option>
            <option value="12" style={{ backgroundColor: 'var(--chrome-bg)' }}>12 pt</option>
            <option value="13" style={{ backgroundColor: 'var(--chrome-bg)' }}>13 pt (متوسط)</option>
            <option value="14" style={{ backgroundColor: 'var(--chrome-bg)' }}>14 pt (معياري)</option>
            <option value="15" style={{ backgroundColor: 'var(--chrome-bg)' }}>15 pt</option>
            <option value="16" style={{ backgroundColor: 'var(--chrome-bg)' }}>16 pt (كبير)</option>
            <option value="17" style={{ backgroundColor: 'var(--chrome-bg)' }}>17 pt</option>
          </select>
        </div>

        {/* Line Height */}
        <div 
          className="hidden md:flex items-center gap-1 border rounded-md px-2 py-1"
          style={{
            backgroundColor: 'var(--chrome-bg-subtle)',
            borderColor: 'var(--chrome-border)',
          }}
        >
          <span className="text-[11px]" style={{ color: 'var(--chrome-text-muted)' }}>التباعد:</span>
          <select
            value={settings.lineHeight}
            onChange={(e) => onUpdateSettings({ lineHeight: Number(e.target.value) })}
            className="bg-transparent text-xs font-mono focus:outline-none cursor-pointer"
            style={{ color: 'var(--chrome-text)' }}
          >
            <option value="1.6" style={{ backgroundColor: 'var(--chrome-bg)' }}>1.6 (متقارب)</option>
            <option value="1.7" style={{ backgroundColor: 'var(--chrome-bg)' }}>1.7</option>
            <option value="1.78" style={{ backgroundColor: 'var(--chrome-bg)' }}>1.78 (مريح)</option>
            <option value="1.9" style={{ backgroundColor: 'var(--chrome-bg)' }}>1.9 (متسع)</option>
            <option value="2.0" style={{ backgroundColor: 'var(--chrome-bg)' }}>2.0</option>
          </select>
        </div>

        <div 
          className="h-4 w-px mx-1" 
          style={{ backgroundColor: 'var(--chrome-border)' }}
        />

        {/* Basic Styles */}
        <div 
          className="flex items-center border rounded-md p-0.5"
          style={{
            backgroundColor: 'var(--chrome-bg-subtle)',
            borderColor: 'var(--chrome-border)',
          }}
        >
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--chrome-text)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
              e.currentTarget.style.color = 'var(--chrome-text-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--chrome-text)';
            }}
            title="عريض (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--chrome-text)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
              e.currentTarget.style.color = 'var(--chrome-text-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--chrome-text)';
            }}
            title="مائل (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleHeadingClick}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--chrome-text)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
              e.currentTarget.style.color = 'var(--chrome-text-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--chrome-text)';
            }}
            title="عنوان فصل / مبحث"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alignment */}
        <div 
          className="hidden sm:flex items-center border rounded-md p-0.5"
          style={{
            backgroundColor: 'var(--chrome-bg-subtle)',
            borderColor: 'var(--chrome-border)',
          }}
        >
          <button
            type="button"
            onClick={() => executeCommand('justifyFull')}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--chrome-text)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
              e.currentTarget.style.color = 'var(--chrome-text-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--chrome-text)';
            }}
            title="ضبط النص 양طرفين (Justify)"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyRight')}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--chrome-text)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
              e.currentTarget.style.color = 'var(--chrome-text-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--chrome-text)';
            }}
            title="محاذاة لليمين"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyCenter')}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--chrome-text)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
              e.currentTarget.style.color = 'var(--chrome-text-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--chrome-text)';
            }}
            title="توسيط"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center & Left: Scholarly Arabic Macro Tools */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Footnote Citation Insertion (State/Action Tool) */}
        <button
          type="button"
          onClick={onInsertFootnote}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all active:scale-97"
          style={{
            backgroundColor: 'var(--chrome-active-bg)',
            borderColor: 'var(--chrome-active-border)',
            color: 'var(--chrome-active-text)',
          }}
          title="إدراج رقم إحالة هامش في المتن وفي حاشية الصفحة (Alt+F)"
        >
          <BookMarked className="w-3.5 h-3.5" />
          <span>إدراج هامش</span>
        </button>

        {/* Quranic Verse Insertion */}
        <button
          type="button"
          onClick={onInsertQuranVerse}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors"
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
          title="إحاطة النص بأقواس الآيات ﴿ ﴾"
        >
          <span className="font-bold">﴿ ﴾</span>
          <span>آية</span>
        </button>

        {/* Arabic Quotation Insertion */}
        <button
          type="button"
          onClick={onInsertArabicQuote}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors"
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
          title="إحاطة النص بعلامتي التنصيص العربية « »"
        >
          <Quote className="w-3.5 h-3.5" />
          <span>اقتباس « »</span>
        </button>

        {/* Arabic Honorifics Dropdown */}
        <div className={`relative ${showHonorifics ? 'z-50' : 'z-auto'}`}>
          <button
            type="button"
            onClick={() => {
              setShowHonorifics(!showHonorifics);
              setShowCitationTerms(false);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors"
            style={{
              backgroundColor: showHonorifics ? 'var(--chrome-hover)' : 'var(--chrome-bg-subtle)',
              borderColor: showHonorifics ? 'var(--chrome-active-border)' : 'var(--chrome-border)',
              color: 'var(--chrome-text)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
              e.currentTarget.style.color = 'var(--chrome-text-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = showHonorifics ? 'var(--chrome-hover)' : 'var(--chrome-bg-subtle)';
              e.currentTarget.style.color = 'var(--chrome-text)';
            }}
            title="إدراج رموز التبجيل والتصلية والترضي"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--chrome-text-muted)' }} />
            <span>الرموز والصلوات</span>
            <ChevronDown className="w-3 h-3" style={{ color: 'var(--chrome-text-muted)' }} />
          </button>

          {showHonorifics && (
            <>
              {/* Invisible Backdrop overlay to close when clicking outside */}
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => setShowHonorifics(false)}
              />
              <div 
                className="absolute left-0 top-full mt-1.5 w-52 border rounded-xl shadow-2xl p-1.5 z-50 text-right max-h-80 overflow-y-auto"
                style={{
                  backgroundColor: 'var(--chrome-card-bg)',
                  borderColor: 'var(--chrome-border)',
                  boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                }}
              >
                {ARABIC_HONORIFICS.map((h) => (
                  <button
                    key={h.key}
                    type="button"
                    onClick={() => {
                      onInsertHonorific(h.replacement);
                      setShowHonorifics(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                    style={{ color: 'var(--chrome-text)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
                      e.currentTarget.style.color = 'var(--chrome-text-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--chrome-text)';
                    }}
                  >
                    <span className="font-bold font-book text-sm" style={{ color: 'var(--chrome-text-heading)' }}>
                      {h.label}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--chrome-text-muted)' }}>
                      {h.description}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Citation Terms Dropdown */}
        <div className={`relative ${showCitationTerms ? 'z-50' : 'z-auto'}`}>
          <button
            type="button"
            onClick={() => {
              setShowCitationTerms(!showCitationTerms);
              setShowHonorifics(false);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors"
            style={{
              backgroundColor: showCitationTerms ? 'var(--chrome-hover)' : 'var(--chrome-bg-subtle)',
              borderColor: showCitationTerms ? 'var(--chrome-active-border)' : 'var(--chrome-border)',
              color: 'var(--chrome-text)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
              e.currentTarget.style.color = 'var(--chrome-text-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = showCitationTerms ? 'var(--chrome-hover)' : 'var(--chrome-bg-subtle)';
              e.currentTarget.style.color = 'var(--chrome-text)';
            }}
            title="مصطلحات التوثيق والهوامش السريعة"
          >
            <span>مصطلحات التوثيق</span>
            <ChevronDown className="w-3 h-3" style={{ color: 'var(--chrome-text-muted)' }} />
          </button>

          {showCitationTerms && (
            <>
              {/* Invisible Backdrop overlay to close when clicking outside */}
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => setShowCitationTerms(false)}
              />
              <div 
                className="absolute left-0 top-full mt-1.5 w-48 border rounded-xl shadow-2xl p-1.5 z-50 text-right max-h-80 overflow-y-auto"
                style={{
                  backgroundColor: 'var(--chrome-card-bg)',
                  borderColor: 'var(--chrome-border)',
                  boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                }}
              >
                {ARABIC_CITATION_TERMS.map((term, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onInsertCitationTerm(term.text);
                      setShowCitationTerms(false);
                    }}
                    className="w-full text-right px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                    style={{ color: 'var(--chrome-text)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--chrome-hover)';
                      e.currentTarget.style.color = 'var(--chrome-text-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--chrome-text)';
                    }}
                  >
                    {term.label}
                  </button>
                ))}
              </div>
            </>
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
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors"
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
          title="التبديل بين الأرقام المشرقية (١، ٢، ٣) والمغربية (1، 2، 3)"
        >
          <Hash className="w-3 h-3" style={{ color: 'var(--chrome-text-muted)' }} />
          <span>{settings.numeralSystem === 'eastern' ? '١٢٣' : '123'}</span>
        </button>
      </div>
    </div>
  );
};
