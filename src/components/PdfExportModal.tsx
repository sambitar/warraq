import React from 'react';
import type { Manuscript, PrepressOptions } from '../types/book';
import { 
  X, 
  Printer, 
  CheckCircle, 
  Layers, 
  Crop, 
  Check, 
  Info,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { TRIM_SIZES } from '../constants/trimSizes';
import { formatNumber } from '../utils/arabicTypography';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscript: Manuscript;
  options: PrepressOptions;
  onChangeOptions: (updates: Partial<PrepressOptions>) => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  manuscript,
  options,
  onChangeOptions,
}) => {
  const currentTrim = TRIM_SIZES[manuscript.settings.trimSizeId];
  const isLight = manuscript.settings.chromeTheme === 'light';

  if (!isOpen) return null;

  const totalPages = Object.keys(manuscript.pages).length;
  const remainder = totalPages % 4;
  const isMultipleOfFour = remainder === 0;
  const pagesNeededForSignature = isMultipleOfFour ? 0 : 4 - remainder;
  const finalPageCount = options.padSignatures ? totalPages + pagesNeededForSignature : totalPages;

  const handlePrint = () => {
    // Determine sheet size based on export mode
    const isWithCrops = options.exportMode === 'offset_bleed_crops';
    const slugMarginMm = isWithCrops ? 10 : 0;
    const sheetWidthMm = currentTrim.widthMm + slugMarginMm * 2;
    const sheetHeightMm = currentTrim.heightMm + slugMarginMm * 2;

    const existingStyle = document.getElementById('dynamic-print-page-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleEl = document.createElement('style');
    styleEl.id = 'dynamic-print-page-style';
    styleEl.innerHTML = `
      @page {
        size: ${sheetWidthMm}mm ${sheetHeightMm}mm;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background: #FFFFFF !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    // Close modal first so it doesn't appear in the print dialog
    onClose();

    // Trigger browser print dialog after styles settle
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 select-none font-ui overflow-y-auto">
      <div 
        className="border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transition-all my-8"
        style={{
          backgroundColor: 'var(--chrome-card-bg)',
          borderColor: 'var(--chrome-border)',
          color: 'var(--chrome-text)',
        }}
      >
        {/* Modal Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
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
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--chrome-text-heading)' }}>
                تجهيز وإخراج ملف المطبعة المعتمد (Prepress PDF)
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--chrome-text-muted)' }}>
                مطابق للمواصفات القياسية للمطابع التجارية ودور النشر ومنصات الطباعة
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
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Prepress Requirements Banner */}
          <div 
            className="border rounded-xl p-3 flex items-start gap-2.5"
            style={{
              backgroundColor: 'var(--chrome-active-bg)',
              borderColor: 'var(--chrome-active-border)',
              color: 'var(--chrome-active-text)',
            }}
          >
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block text-[12px] mb-0.5 font-bold">معايير ملفات المطابع المعتمدة:</strong>
              سيتم تصدير الكتاب كصفحات فردية متتابعة (1، 2، 3...) بالقطع الصافي <strong>{currentTrim.nameArabic} ({currentTrim.widthMm} × {currentTrim.heightMm} مم)</strong> بنصوص فيكتور غير منقطة مع هوامش الكعب المتناوبة لحماية النص عند التجليد.
            </div>
          </div>

          {/* Option 1: Export Mode (Trim Size vs Offset Prepress with Crop Marks) */}
          <div>
            <label className="block font-bold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--chrome-text-heading)' }}>
              <Crop className="w-4 h-4" style={{ color: 'var(--chrome-active-border)' }} />
              <span>صيغة الإخراج للمطبعة:</span>
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onChangeOptions({ exportMode: 'trim_only' })}
                className="w-full text-right p-3 rounded-xl border transition-all flex items-start justify-between gap-3"
                style={
                  options.exportMode === 'trim_only'
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
                <div className="flex-1">
                  <div className="font-bold text-xs" style={{ color: options.exportMode === 'trim_only' ? 'var(--chrome-active-text)' : 'var(--chrome-text-heading)' }}>
                    القطع الصافي للكتاب (Trim Size Only — 0mm Bleed)
                  </div>
                  <div className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--chrome-text-muted)' }}>
                    المقاس المباشر الصافي للكتاب ({currentTrim.widthMm} × {currentTrim.heightMm} مم). الخيار الأكثر طلباً لمطابع الديجيتال، ومنصات النشر الذاتي (KDP، IngramSpark)، والمطابع التي لا تطلب زوائد إن لم تكن هناك صور تلامس الحافة.
                  </div>
                </div>
                {options.exportMode === 'trim_only' && (
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--chrome-active-border)' }} />
                )}
              </button>

              <button
                type="button"
                onClick={() => onChangeOptions({ exportMode: 'offset_bleed_crops' })}
                className="w-full text-right p-3 rounded-xl border transition-all flex items-start justify-between gap-3"
                style={
                  options.exportMode === 'offset_bleed_crops'
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
                <div className="flex-1">
                  <div className="font-bold text-xs" style={{ color: options.exportMode === 'offset_bleed_crops' ? 'var(--chrome-active-text)' : 'var(--chrome-text-heading)' }}>
                    مطابع الأوفست التجارية مع علامات القص وزوائد 3 مم (Bleed & Crop Marks)
                  </div>
                  <div className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--chrome-text-muted)' }}>
                    يضيف زوائد أمان 3 مم مع علامات القص (Crop Marks) وصلبان المطابقة وشريط تعريف المخطوطة للمطبعة. الخيار المفضل لمطابع الأوفست التقليدية والتجليد الفاخر.
                  </div>
                </div>
                {options.exportMode === 'offset_bleed_crops' && (
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--chrome-active-border)' }} />
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Ink Mode (Pure Black K100 vs Screen Warm) */}
          <div>
            <label className="block font-bold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--chrome-text-heading)' }}>
              <Layers className="w-4 h-4" style={{ color: 'var(--chrome-active-border)' }} />
              <span>لون الحبر ومتن الكتاب:</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeOptions({ inkMode: 'pure_black' })}
                className="p-2.5 rounded-xl border text-right transition-all flex items-center justify-between"
                style={
                  options.inkMode === 'pure_black'
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
                <div>
                  <div className="font-bold">أسود طباعي صافٍ 100% K</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--chrome-text-muted)' }}>
                    إلزامي لمطابع الأوفست (يمنع التغبيش)
                  </div>
                </div>
                {options.inkMode === 'pure_black' && <Check className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => onChangeOptions({ inkMode: 'screen_warm' })}
                className="p-2.5 rounded-xl border text-right transition-all flex items-center justify-between"
                style={
                  options.inkMode === 'screen_warm'
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
                <div>
                  <div className="font-bold">فحمي هادئ (للقراءة الرقمية)</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--chrome-text-muted)' }}>
                    مريح للعين على شاشات التابلت
                  </div>
                </div>
                {options.inkMode === 'screen_warm' && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Option 3: Bookbinding Signatures (الملازم الطباعية ومضاعفات 4) */}
          <div 
            className="border rounded-xl p-3 space-y-2"
            style={{
              backgroundColor: 'var(--chrome-card-bg)',
              borderColor: 'var(--chrome-card-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--chrome-text-heading)' }}>
                <BookOpen className="w-4 h-4" style={{ color: 'var(--chrome-active-border)' }} />
                <span>تكميل الملازم الورقية (Signatures):</span>
              </div>
              <span 
                className="text-[11px] px-2 py-0.5 rounded-md font-mono font-bold"
                style={{
                  backgroundColor: isMultipleOfFour ? 'rgba(74, 123, 166, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                  color: isMultipleOfFour ? 'var(--chrome-active-text)' : '#D97706',
                }}
              >
                {formatNumber(totalPages, manuscript.settings.numeralSystem)} صفحة {isMultipleOfFour ? '(ملزمة متكاملة)' : `(تحتاج ${formatNumber(pagesNeededForSignature, manuscript.settings.numeralSystem)} صفحات)`}
              </span>
            </div>

            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--chrome-text-muted)' }}>
              تُطبع الكتب وتُخاط في المطابع على هيئة «ملازم» من مضاعفات 4 أو 8 أو 16 صفحة. إن كان عدد صفحات كتابك لا يقبل القسمة على 4، يمكنك تفعيل هذا الخيار لإضافة صفحات بيضاء تلقائياً في نهاية المخطوطة.
            </p>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={options.padSignatures}
                onChange={(e) => onChangeOptions({ padSignatures: e.target.checked })}
                className="rounded accent-blue-600 w-4 h-4 cursor-pointer"
              />
              <span className="font-medium text-xs" style={{ color: 'var(--chrome-text-heading)' }}>
                إضافة صفحات بيضاء ختامية لإكمال الملزمة (إجمالي الصفحات المطبوعة: {formatNumber(finalPageCount, manuscript.settings.numeralSystem)} صفحة)
              </span>
            </label>
          </div>

          {/* Preflight Verification Checklist */}
          <div 
            className="p-3 rounded-xl border text-[11px] space-y-1.5"
            style={{
              backgroundColor: 'var(--chrome-bg-subtle)',
              borderColor: 'var(--chrome-border)',
              color: 'var(--chrome-text)',
            }}
          >
            <div className="font-bold flex items-center gap-1" style={{ color: 'var(--chrome-text-heading)' }}>
              <Info className="w-3.5 h-3.5" style={{ color: 'var(--chrome-active-border)' }} />
              <span>فحص ما قبل الإرسال للمطبعة (Preflight Checklist):</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pr-1" style={{ color: 'var(--chrome-text-muted)' }}>
              <li><strong>الترتيب الطباعي:</strong> صفحات فردية متتابعة (1، 2، 3...) وليست صفحات متقابلة.</li>
              <li><strong>هامش الكعب:</strong> {currentTrim.marginInnerMm} مم متناوب بين الصفحات اليمنى واليسرى لحماية النصوص من غراء التجليد.</li>
              <li><strong>الخطوط:</strong> نصوص فيكتور مدمجة 100% بدقة 2400 DPI لزنكات الأوفست (CTP).</li>
              <li><strong>تنبيه المتصفح:</strong> في نافذة الطباعة تأكد من <strong>إلغاء تفعيل خيار «الرؤوس والتذييلات» (Headers and Footers)</strong>.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div 
          className="p-4 border-t flex items-center justify-between gap-3"
          style={{
            backgroundColor: 'var(--chrome-bg)',
            borderColor: 'var(--chrome-border)',
          }}
        >
          <div className="text-[11px]" style={{ color: 'var(--chrome-text-muted)' }}>
            القياس: <strong className="font-mono" style={{ color: 'var(--chrome-text-heading)' }}>{currentTrim.widthMm}×{currentTrim.heightMm} مم</strong> ({currentTrim.nameArabic})
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium rounded-lg transition-colors border"
              style={{
                backgroundColor: 'var(--chrome-bg-subtle)',
                borderColor: 'var(--chrome-border)',
                color: 'var(--chrome-text)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--chrome-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--chrome-bg-subtle)'; }}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all border active:scale-98"
              style={{
                backgroundColor: 'var(--chrome-active-bg)',
                borderColor: 'var(--chrome-active-border)',
                color: 'var(--chrome-active-text)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--chrome-active-border)';
                e.currentTarget.style.color = isLight ? '#FFFFFF' : '#1E1E1E';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--chrome-active-bg)';
                e.currentTarget.style.color = 'var(--chrome-active-text)';
              }}
            >
              <Printer className="w-4 h-4" />
              <span>تصدير ملف المطبعة (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
