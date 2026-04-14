import { useState } from 'react';
import { actionCategories, actionOwners } from '@/mocks/actions';
import { mockLearners } from '@/mocks/learners';
import CustomSelect from '@/components/base/CustomSelect';

interface NewActionModalProps {
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
}

const categoryOptions = actionCategories
  .filter((c) => c !== 'All')
  .map((c) => ({
    value: c,
    label: c,
    icon:
      c === 'Learner Progress' ? 'ri-user-line' :
      c === 'Compliance' ? 'ri-shield-check-line' :
      c === 'Quality' ? 'ri-award-line' :
      c === 'Safeguarding' ? 'ri-user-heart-line' :
      c === 'Evidence' ? 'ri-folder-2-line' :
      'ri-government-line',
  }));

const ownerOptions = actionOwners
  .filter((o) => o !== 'All')
  .map((o) => ({ value: o, label: o, icon: 'ri-user-line' }));

const learnerOptions = [
  { value: '', label: 'No learner linked', icon: 'ri-close-circle-line' },
  ...mockLearners.map((l) => ({
    value: l.full_name,
    label: l.full_name,
    meta: l.programme,
    icon: 'ri-user-line',
  })),
];

export default function NewActionModal({ onClose, onSubmit }: NewActionModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    owner: ownerOptions[0].value,
    priority: 'Medium',
    category: categoryOptions[0].value,
    due_date: '',
    linked_learner: '',
    rag_status: 'Amber',
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.due_date) return;
    setSubmitted(true);
    setTimeout(() => {
      onSubmit(form);
      onClose();
    }, 1000);
  };

  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5';
  const inputCls = 'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all';

  const priorityConfig: Record<string, string> = {
    Critical: 'border-red-300 bg-red-50 text-red-700',
    High: 'border-amber-300 bg-amber-50 text-amber-700',
    Medium: 'border-slate-300 bg-slate-50 text-slate-600',
    Low: 'border-slate-200 bg-white text-slate-400',
  };
  const priorityDots: Record<string, string> = {
    Critical: 'bg-red-500',
    High: 'bg-amber-400',
    Medium: 'bg-slate-400',
    Low: 'bg-slate-300',
  };
  const ragConfig: Record<string, string> = {
    Red: 'bg-red-500',
    Amber: 'bg-amber-400',
    Green: 'bg-emerald-500',
  };
  const ragBorder: Record<string, string> = {
    Red: 'border-red-300 bg-red-50 text-red-700',
    Amber: 'border-amber-300 bg-amber-50 text-amber-700',
    Green: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Create New Action</h2>
            <p className="text-xs text-slate-500 mt-0.5">Assign and track an improvement or intervention action</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className={labelCls}>Action Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Complete overdue OTJH review for..."
              className={inputCls}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value.slice(0, 500))}
              placeholder="What needs to happen and why?"
              rows={3}
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{form.description.length}/500</p>
          </div>

          {/* Owner + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Owner <span className="text-red-500">*</span></label>
              <CustomSelect
                value={form.owner}
                onChange={(v) => set('owner', v)}
                options={ownerOptions}
                className="w-full"
              />
            </div>
            <div>
              <label className={labelCls}>Due Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => set('due_date', e.target.value)}
                className={inputCls}
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className={labelCls}>Priority</label>
            <div className="flex gap-2">
              {(['Critical', 'High', 'Medium', 'Low'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('priority', p)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border font-medium cursor-pointer transition-all whitespace-nowrap ${
                    form.priority === p
                      ? `${priorityConfig[p]} ring-2 ring-offset-1 ring-current`
                      : 'border-slate-200 text-slate-400 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${form.priority === p ? priorityDots[p] : 'bg-slate-300'}`}></span>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* RAG Status */}
          <div>
            <label className={labelCls}>RAG Status</label>
            <div className="flex gap-2">
              {(['Red', 'Amber', 'Green'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set('rag_status', r)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg border font-medium cursor-pointer transition-all whitespace-nowrap ${
                    form.rag_status === r
                      ? `${ragBorder[r]} ring-2 ring-offset-1 ring-current`
                      : 'border-slate-200 text-slate-400 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${ragConfig[r]}`}></span> {r}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Category</label>
            <CustomSelect
              value={form.category}
              onChange={(v) => set('category', v)}
              options={categoryOptions}
              className="w-full"
            />
          </div>

          {/* Linked Learner */}
          <div>
            <label className={labelCls}>Link to Learner <span className="text-slate-400 font-normal">(optional)</span></label>
            <CustomSelect
              value={form.linked_learner}
              onChange={(v) => set('linked_learner', v)}
              options={learnerOptions}
              placeholder="No learner linked"
              className="w-full"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim() || !form.due_date || submitted}
            className="px-5 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center gap-1.5 transition-colors"
          >
            {submitted ? (
              <><i className="ri-check-line"></i> Created!</>
            ) : (
              <><i className="ri-add-line"></i> Create Action</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
