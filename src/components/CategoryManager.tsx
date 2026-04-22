import React from 'react';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { Category, TransactionType } from '../types';
import { cn } from '../lib/utils';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
}

export default function CategoryManager({ categories, onAddCategory }: CategoryManagerProps) {
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<TransactionType>('expense');
  const [color, setColor] = React.useState('#1A1A1A');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddCategory({ name, type, color });
    setName('');
  };

  const COLORS = [
    '#1A1A1A', '#ef4444', '#f59e0b', '#10b981', 
    '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1',
    '#F27D26', '#5A5A40'
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="border-b border-black pb-4">
        <h2 className="text-xl caps mb-2">Category Taxonomy</h2>
        <p className="text-sm text-editorial-muted italic font-serif">Defining custom labels for granular disbursement and deposit tracking.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12">
          <form onSubmit={handleSubmit} className="bg-editorial-zebra border-fine border-dashed p-8 space-y-8">
            <h3 className="text-xl italic font-serif">Add New Label</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="caps block">Label Name</label>
                <input 
                  type="text" 
                  className="w-full bg-white border-fine p-3 text-sm focus:outline-none focus:border-editorial-ink"
                  placeholder="e.g. Photography"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="caps block">Classification</label>
                <div className="flex bg-white border-fine p-1 h-12">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={cn(
                      "flex-1 caps text-[9px] transition-all",
                      type === 'expense' ? "bg-editorial-ink text-white" : "hover:bg-editorial-bg"
                    )}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={cn(
                      "flex-1 caps text-[9px] transition-all",
                      type === 'income' ? "bg-editorial-ink text-white" : "hover:bg-editorial-bg"
                    )}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="caps block">Color Visual</label>
                <div className="flex flex-wrap gap-2 h-12 items-center">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-6 h-6 rounded-full border transition-all",
                        color === c ? "border-editorial-ink scale-110 shadow-sm" : "border-transparent opacity-60"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-editorial-primary w-full !py-4"
            >
              Register New Classification
            </button>
          </form>
        </div>

        <div className="lg:col-span-12 space-y-6">
          <h3 className="text-xl caps border-b border-editorial-border pb-2">Checkbook Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map(cat => (
              <div key={cat.id} className="card-editorial flex flex-col items-center justify-center gap-3 py-8 group hover:border-editorial-ink transition-colors">
                <div className="w-8 h-8 rounded-full border shadow-inner" style={{ backgroundColor: cat.color }} />
                <div className="text-center">
                  <p className="text-sm font-medium">{cat.name}</p>
                  <p className="text-[9px] caps opacity-50">{cat.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

