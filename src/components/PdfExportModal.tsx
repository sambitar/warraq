import React, { useState } from 'react';
import type { Manuscript } from '../types/book';
import { X, Printer, CheckCircle, FileCheck } from 'lucide-react';
import { TRIM_SIZES } from '../constants/trimSizes';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscript: Manuscript;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  manuscript,
}) => {
  const [paperBackground, setPaperBackground] = useState<'cream' | 'white'>('white');
  const currentTrim = TRIM_SIZES[manuscript.settings.trimSizeId];
  const isLight = manuscript.settings.chromeTheme === 'light';

  if (!isOpen) return null;

  const handlePrint = () => {
    // Inject dynamic @page style for this exact trim size
    const existingStyle = document.getElementById('dynamic-print-page-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleEl = document.createElement('style');
    styleEl.id = 'dynamic-print-page-style';
    styleEl.innerHTML = `
      @page {
        size: ${currentTrim.widthMm}mm ${currentTrim.heightMm}mm;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background: ${paperBackground === 'white' ? '#FFFFFF' : '#F8F5EC'} !important;
        }
        .book-page-wrapper {
          background-color: ${paperBackground === 'white' ? '#FFFFFF' : '#F8F5EC'} !important;
          width: ${currentTrim.widthMm}mm !important;
          height: ${currentTrim.heightMm}mm !important;
          box-shadow: none !important;
          border: none !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    // Close modal first so it doesn't show in print
    onClose();

    // Trigger browser print dialog after render
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none font-ui">
      <div 
        className="border rounded-xl shadow-2xl max-w-md w-full overflow-hidden transition-all"
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
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5" style={{ color: 'var(--chrome-active-border)' }} />
            <h3 className="font-bold text-base" style={{ color: 'var(--chrome-text-heading)' }}>
              تصدير المخطوطة للطباعة (PDF)
            </h3>
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
        <div className="p-5 space-y-4 text-xs">
          <div 
            className="border rounded-lg p-3 flex items-start gap-2.5"
            style={{
              backgroundColor: 'var(--chrome-active-bg)',
              borderColor: 'var(--chrome-active-border)',
              color: 'var(--chrome-active-text)',
            }}
          >
            <FileCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              سيتم تصدير الكتاب بقياس <strong>{currentTrim.nameArabic}</strong> ({currentTrim.widthMm} × {currentTrim.heightMm} مم) مباشرة بدون هوامش متصفح إضافية، جاهزاً للطباعة الورقية أو النشر الرقمي.
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2" style={{ color: 'var(--chrome-text-heading)' }}>
              لون خلفية الورق للطباعة:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaperBackground('white')}
                className="p-2.5 rounded-lg border text-right transition-all flex items-center justify-between"
                style={
                  paperBackground === 'white'
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
                  <div className="font-bold">أبيض نقي (للمطابع)</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--chrome-text-muted)' }}>يُطبع على ورق المطبعة الخاص</div>
                </div>
                {paperBackground === 'white' && (
                  <CheckCircle className="w-4 h-4" style={{ color: 'var(--chrome-active-border)' }} />
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaperBackground('cream')}
                className="p-2.5 rounded-lg border text-right transition-all flex items-center justify-between"
                style={
                  paperBackground === 'cream'
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
                  <div className="font-bold">ورق شمواه كريمي</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--chrome-text-muted)' }}>مناسب للقراءة الإلكترونية</div>
                </div>
                {paperBackground === 'cream' && (
                  <CheckCircle className="w-4 h-4" style={{ color: 'var(--chrome-active-border)' }} />
                )}
              </button>
            </div>
          </div>

          <div 
            className="pt-2 border-t text-[11px] space-y-1"
            style={{
              borderColor: 'var(--chrome-border)',
              color: 'var(--chrome-text-muted)',
            }}
          >
            <p>💡 <strong>نصيحة قبل الحفظ:</strong></p>
            <p>في نافذة الطباعة الخاصة بالمتصفح، اختر «حفظ بتنسيق PDF» أو «Save as PDF»، وتأكد من تعطيل خيار «الرؤوس والتذييلات» للحصول على كتاب نظيف تماماً.</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div 
          className="p-4 border-t flex items-center justify-end gap-2"
          style={{
            backgroundColor: 'var(--chrome-bg)',
            borderColor: 'var(--chrome-border)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={{ color: 'var(--chrome-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--chrome-text-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--chrome-text-muted)'; }}
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all border"
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
            <span>بدء الطباعة / تصدير PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
