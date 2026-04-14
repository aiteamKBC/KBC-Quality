import { useState } from 'react';

interface TimelineEvent {
  id: string;
  date: string;
  type: 'Review' | 'Note' | 'Email' | 'Upload' | 'Action' | 'Start' | 'Alert';
  title: string;
  text: string;
  by: string;
  editable?: boolean;
}

interface Props {
  learnerName: string;
  coachName: string;
}

const typeConfig: Record<string, { icon: string; bg: string; text: string; label: string }> = {
  Review:   { icon: 'ri-clipboard-line',       bg: 'bg-brand-100',  text: 'text-brand-600',   label: 'Progress Review' },
  Note:     { icon: 'ri-sticky-note-line',     bg: 'bg-slate-100',  text: 'text-slate-500',   label: 'Coaching Note' },
  Email:    { icon: 'ri-mail-line',            bg: 'bg-amber-100',  text: 'text-amber-600',   label: 'Email' },
  Upload:   { icon: 'ri-upload-cloud-2-line',  bg: 'bg-emerald-100',text: 'text-emerald-600', label: 'Evidence Uploaded' },
  Action:   { icon: 'ri-task-line',            bg: 'bg-red-100',    text: 'text-red-500',     label: 'Action Created' },
  Start:    { icon: 'ri-flag-line',            bg: 'bg-emerald-100',text: 'text-emerald-600', label: 'Programme Start' },
  Alert:    { icon: 'ri-alarm-warning-line',   bg: 'bg-red-100',    text: 'text-red-500',     label: 'Alert Raised' },
};

const filterTypes = ['All', 'Review', 'Note', 'Email', 'Upload', 'Action', 'Alert'];

export default function LearnerTimeline({ learnerName, coachName }: Props) {
  const [events, setEvents] = useState<TimelineEvent[]>([
    { id: 'ev1', date: '2024-12-01', type: 'Alert',  title: 'Attendance alert raised', text: 'Automated alert: attendance dropped below 80% threshold. Intervention required.', by: 'System' },
    { id: 'ev2', date: '2024-11-28', type: 'Review', title: 'Q4 Progress Review', text: 'Progress review completed. OTJH catch-up plan agreed with learner and employer. Overall progress tracking to target.', by: coachName },
    { id: 'ev3', date: '2024-11-10', type: 'Note',   title: 'Coaching session notes', text: 'Session covered EPA preparation and portfolio building. Learner engaged and confident. Identified 2 additional OTJH opportunities with employer.', by: coachName, editable: true },
    { id: 'ev4', date: '2024-10-30', type: 'Upload', title: 'Evidence uploaded', text: 'Progress review documentation and signed tripartite agreement uploaded to vault.', by: coachName },
    { id: 'ev5', date: '2024-10-15', type: 'Review', title: 'Q3 Progress Review', text: 'Quarterly review completed. RAG updated to Amber due to OTJH shortfall. Action plan agreed.', by: coachName },
    { id: 'ev6', date: '2024-09-18', type: 'Email',  title: 'Email to employer', text: 'Email sent to employer confirming OTJH logging expectations and monthly reporting requirements.', by: 'Nina Patel' },
    { id: 'ev7', date: '2024-09-04', type: 'Start',  title: 'Programme commenced', text: `${learnerName} started the programme. Induction completed, learning plan agreed and initial targets set.`, by: 'Tom Beaumont' },
  ]);

  const [filter, setFilter] = useState('All');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const filtered = filter === 'All' ? events : events.filter((e) => e.type === filter);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const newEvent: TimelineEvent = {
      id: `ev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'Note',
      title: 'Coaching note added',
      text: newNote.trim(),
      by: coachName,
      editable: true,
    };
    setEvents([newEvent, ...events]);
    setNewNote('');
    setShowAddNote(false);
  };

  const handleSaveEdit = (id: string) => {
    setEvents(events.map((e) => e.id === id ? { ...e, text: editText } : e));
    setEditingId(null);
    setEditText('');
  };

  const handleDeleteNote = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto">
          {filterTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${filter === t ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddNote(!showAddNote)}
          className="btn-primary text-xs flex items-center gap-1.5 flex-shrink-0 ml-3"
        >
          <i className="ri-add-line"></i> Add Note
        </button>
      </div>

      {/* Add Note Box */}
      {showAddNote && (
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <i className="ri-sticky-note-2-line text-brand-500"></i>
            <span className="text-sm font-semibold text-brand-800">New Coaching Note</span>
          </div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value.slice(0, 500))}
            placeholder="Enter your coaching note here..."
            rows={4}
            className="w-full px-3 py-2 text-sm border border-brand-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">{newNote.length}/500 characters</span>
            <div className="flex gap-2">
              <button onClick={() => { setShowAddNote(false); setNewNote(''); }} className="btn-ghost text-xs">Cancel</button>
              <button onClick={handleAddNote} disabled={!newNote.trim()} className="btn-primary text-xs disabled:opacity-50">
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200 z-0"></div>

        <div className="space-y-1">
          {filtered.map((ev, idx) => {
            const cfg = typeConfig[ev.type] || typeConfig.Note;
            const isEditing = editingId === ev.id;
            const isFirst = idx === 0;

            return (
              <div key={ev.id} className={`relative flex gap-4 ${isFirst ? '' : 'pt-1'}`}>
                {/* Icon dot */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${cfg.bg}`}>
                  <i className={`${cfg.icon} ${cfg.text} text-sm`}></i>
                </div>

                {/* Card */}
                <div className={`flex-1 mb-4 rounded-xl border transition-all ${isEditing ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <div className="px-4 py-3">
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`badge text-xs font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                        <span className="text-sm font-semibold text-slate-800">{ev.title}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-slate-400">{ev.date}</span>
                        {ev.editable && !isEditing && (
                          <>
                            <button
                              onClick={() => { setEditingId(ev.id); setEditText(ev.text); }}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer ml-1"
                            >
                              <i className="ri-edit-line text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteNote(ev.id)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                              <i className="ri-delete-bin-line text-xs"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value.slice(0, 500))}
                          rows={3}
                          className="w-full px-3 py-2 text-xs border border-brand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">{editText.length}/500</span>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingId(null)} className="btn-ghost text-xs py-1">Cancel</button>
                            <button onClick={() => handleSaveEdit(ev.id)} className="btn-primary text-xs py-1">Save</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{ev.text}</p>
                    )}

                    {/* Footer */}
                    {!isEditing && (
                      <p className="text-xs text-slate-400 mt-2">
                        <i className="ri-user-line mr-1"></i>{ev.by}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm ml-10">
              No {filter.toLowerCase()} events recorded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
