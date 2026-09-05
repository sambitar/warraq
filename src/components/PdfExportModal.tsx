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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="bg-stone-900 border border-stone-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-stone-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-stone-100 font-arabic">
              تصدير المخطوطة للطباعة (PDF)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg p-3 text-amber-200 flex items-start gap-2.5">
            <FileCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              سيتم تصدير الكتاب بقياس <strong>{currentTrim.nameArabic}</strong> ({currentTrim.widthMm} × {currentTrim.heightMm} مم) مباشرة بدون هوامش متصفح إضافية، جاهزاً للطباعة الورقية أو النشر الرقمي.
            </div>
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-2">
              لون خلفية الورق للطباعة:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaperBackground('white')}
                className={`p-2.5 rounded-lg border text-right transition-all flex items-center justify-between ${
                  paperBackground === 'white'
                    ? 'border-amber-500 bg-stone-800 text-stone-100'
                    : 'border-stone-700 bg-stone-850 text-stone-400 hover:bg-stone-800'
                }`}
              >
                <div>
                  <div className="font-bold">أبيض نقي (للمطابع)</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">يُطبع على ورق المطبعة الخاص</div>
                </div>
                {paperBackground === 'white' && <CheckCircle className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => setPaperBackground('cream')}
                className={`p-2.5 rounded-lg border text-right transition-all flex items-center justify-between ${
                  paperBackground === 'cream'
                    ? 'border-amber-500 bg-stone-800 text-stone-100'
                    : 'border-stone-700 bg-stone-850 text-stone-400 hover:bg-stone-800'
                }`}
              >
                <div>
                  <div className="font-bold">ورق شمواه كريمي</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">مناسب للقراءة الإلكترونية</div>
                </div>
                {paperBackground === 'cream' && <CheckCircle className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-800 text-stone-400 text-[11px] space-y-1">
            <p>💡 <strong>نصيحة قبل الحفظ:</strong></p>
            <p>في نافذة الطباعة الخاصة بالمتصفح، اختر «حفظ بتنسيق PDF» أو «Save as PDF»، وتأكد من تعطيل خيار «الرؤوس والتذييلات» (Headers and Footers) للحصول على كتاب نظيف تماماً.</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-stone-400 hover:text-stone-200 text-xs font-medium"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>بدء الطباعة / تصدير PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
