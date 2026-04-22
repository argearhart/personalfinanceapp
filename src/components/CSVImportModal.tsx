import React from 'react';
import Papa from 'papaparse';
import { X, Upload, AlertCircle } from 'lucide-react';
import { Category, NewTransactionInput, TransactionType } from '../types';
import { format } from 'date-fns';

interface CSVImportModalProps {
  categories: Category[];
  onClose: () => void;
  onImport: (transactions: NewTransactionInput[]) => void;
}

type ColumnMapping = {
  date: string;
  payee: string;
  amount: string;
  type: string;
  category: string;
  memo: string;
};

export default function CSVImportModal({ categories, onClose, onImport }: CSVImportModalProps) {
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [data, setData] = React.useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = React.useState<ColumnMapping>({
    date: '',
    payee: '',
    amount: '',
    type: '',
    category: '',
    memo: '',
  });
  const [step, setStep] = React.useState(1);
  const [errors, setErrors] = React.useState<string[]>([]);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  const parseAmount = React.useCallback((value: unknown) => {
    const sanitized = String(value ?? '').replace(/[^\d.-]/g, '');
    const parsed = Number.parseFloat(sanitized);
    if (!Number.isFinite(parsed)) return null;
    return parsed;
  }, []);

  React.useEffect(() => {
    const activeElement = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      activeElement?.focus();
    };
  }, [onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields) {
            setHeaders(results.meta.fields);
            setData(results.data as Record<string, unknown>[]);
            setStep(2);
            setErrors([]);

            // Auto-detect mappings
            const newMapping = { ...mapping };
            results.meta.fields.forEach(header => {
              const lowerHeader = header.toLowerCase();
              if (lowerHeader.includes('date')) newMapping.date = header;
              if (lowerHeader.includes('payee') || lowerHeader.includes('description') || lowerHeader.includes('name')) newMapping.payee = header;
              if (lowerHeader.includes('amount') || lowerHeader.includes('value')) newMapping.amount = header;
              if (lowerHeader.includes('type')) newMapping.type = header;
              if (lowerHeader.includes('category')) newMapping.category = header;
              if (lowerHeader.includes('memo') || lowerHeader.includes('note')) newMapping.memo = header;
            });
            setMapping(newMapping);
          }
        },
      });
    }
  };

  const handleImport = () => {
    const importErrors: string[] = [];
    const processedTransactions = data.map((row, index) => {
      try {
        const rawAmount = row[mapping.amount];
        const rawDate = row[mapping.date];
        
        // Basic validation
        if (!rawAmount || !rawDate) {
          throw new Error(`Row ${index + 1}: Missing required fields (Date/Amount)`);
        }

        const parsedAmount = parseAmount(rawAmount);
        if (parsedAmount === null) {
          throw new Error(`Row ${index + 1}: Invalid amount "${String(rawAmount)}"`);
        }

        const amount = Math.abs(parsedAmount);
        const typeHint = String(row[mapping.type] ?? '').toLowerCase();
        const type: TransactionType =
          typeHint.includes('income') || typeHint.includes('deposit') || parsedAmount > 0 ? 'income' : 'expense';
        
        // Find category
        const rowCategoryName = row[mapping.category];
        const category = categories.find(c => c.name.toLowerCase() === String(rowCategoryName).toLowerCase()) || categories[0];
        const parsedDate = new Date(String(rawDate));
        if (Number.isNaN(parsedDate.getTime())) {
          throw new Error(`Row ${index + 1}: Invalid date "${String(rawDate)}"`);
        }

        return {
          date: format(parsedDate, 'yyyy-MM-dd'),
          payee: String(row[mapping.payee] || 'Unknown Payee'),
          amount,
          type,
          categoryId: category.id,
          memo: String(row[mapping.memo] || ''),
        };
      } catch (err) {
        importErrors.push(err instanceof Error ? err.message : String(err));
        return null;
      }
    }).filter(Boolean);

    if (importErrors.length > 0) {
      setErrors(importErrors);
    } else {
      onImport(processedTransactions as NewTransactionInput[]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-editorial-ink/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="csv-import-title"
        tabIndex={-1}
        className="bg-editorial-bg w-full max-w-2xl overflow-hidden border-fine shadow-2xl animate-in zoom-in-95 duration-300"
      >
        <div className="px-8 py-6 border-b border-editorial-border flex items-center justify-between">
          <h2 id="csv-import-title" className="text-xl italic font-serif">CSV Import Utility</h2>
          <button aria-label="Close CSV import" onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-editorial-muted">
            <X size={18} />
          </button>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="flex flex-col items-center justify-center py-12 border-fine border-dashed bg-editorial-zebra">
              <Upload className="text-editorial-muted mb-4 opacity-40" size={48} />
              <p className="text-sm italic font-serif text-editorial-muted mb-6">Select a CSV file from your local machine to begin</p>
              <label className="btn-editorial-primary cursor-pointer !py-3">
                Select Data Source
                <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="caps text-[9px] border-b border-editorial-border pb-1">Column Mapping</h3>
                  <div className="space-y-4">
                    {(Object.keys(mapping) as Array<keyof ColumnMapping>).map((field) => (
                      <div key={field} className="flex flex-col gap-1">
                        <label className="text-[10px] caps italic opacity-70">{field}</label>
                        <select 
                          className="w-full bg-white border-fine p-2 text-xs focus:outline-none focus:border-editorial-ink appearance-none"
                          value={mapping[field]}
                          onChange={(e) => setMapping(prev => ({ ...prev, [field]: e.target.value }))}
                        >
                          <option value="">Do not map</option>
                          {headers.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="caps text-[10px] border-b border-editorial-border pb-1">Data Preview</h3>
                  <div className="bg-white border-fine h-[350px] overflow-y-auto divide-y divide-editorial-border">
                    {data.slice(0, 10).map((row, i) => (
                      <div key={i} className="p-3 space-y-1">
                        <p className="text-[10px] font-medium truncate">{row[mapping.payee] || 'No Payee Detected'}</p>
                        <div className="flex justify-between items-center italic text-[9px] text-editorial-muted font-serif">
                          <span>{row[mapping.date] || 'No Date'}</span>
                          <span className="font-sans font-bold text-editorial-ink">{row[mapping.amount] || '0.00'}</span>
                        </div>
                      </div>
                    ))}
                    {data.length > 10 && (
                      <div className="p-3 text-center text-[9px] caps opacity-40">Plus {data.length - 10} additional records...</div>
                    )}
                  </div>
                </div>
              </div>

              {errors.length > 0 && (
                <div className="bg-editorial-accent-red/5 border-fine border-editorial-accent-red p-4 space-y-2">
                  <div className="flex items-center gap-2 text-editorial-accent-red caps text-[9px] font-bold">
                    <AlertCircle size={12} />
                    Processing Errors Detected
                  </div>
                  <ul className="text-[9px] italic font-serif text-editorial-accent-red list-disc pl-4 h-24 overflow-y-auto">
                    {errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 btn-editorial !py-3"
                >
                  Return to Origin
                </button>
                <button 
                  onClick={handleImport}
                  className="flex-2 btn-editorial-primary !py-3"
                >
                  Confirm and Batch Entry ({data.length} Records)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
