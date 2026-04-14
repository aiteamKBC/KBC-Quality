import { useState, useRef, useCallback } from 'react';
import { evidenceCategories, inspectionThemes } from '@/mocks/evidence';
import CustomSelect from '@/components/base/CustomSelect';

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
  progress: number;
  status: 'queued' | 'uploading' | 'done' | 'error';
  category: string;
  theme: string;
}

interface BulkUploadModalProps {
  onClose: () => void;
}

const categoryOptions = evidenceCategories.map((c) => ({ value: c, label: c }));

const themeOptions = inspectionThemes.map((t) => ({
  value: t,
  label: t,
  dot:
    t === 'Quality of Education' ? 'bg-brand-500' :
    t === 'Behaviours & Attitudes' ? 'bg-violet-500' :
    t === 'Personal Development' ? 'bg-emerald-500' :
    t === 'Leadership & Management' ? 'bg-slate-500' :
    t === 'Safeguarding' ? 'bg-red-500' :
    'bg-amber-500',
}));

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name: string): { icon: string; color: string } {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return { icon: 'ri-file-pdf-line', color: 'text-red-500' };
  if (ext === 'docx' || ext === 'doc') return { icon: 'ri-file-word-line', color: 'text-brand-500' };
  if (ext === 'xlsx' || ext === 'xls') return { icon: 'ri-file-excel-line', color: 'text-emerald-600' };
  if (ext === 'mp4' || ext === 'mov') return { icon: 'ri-video-line', color: 'text-violet-500' };
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') return { icon: 'ri-image-line', color: 'text-amber-500' };
  return { icon: 'ri-file-3-line', color: 'text-slate-400' };
}

export default function BulkUploadModal({ onClose }: BulkUploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: File[]) => {
    const newEntries: UploadFile[] = incoming.map((f) => ({
      id: `uf-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      name: f.name,
      size: formatBytes(f.size),
      type: f.name.split('.').pop()?.toUpperCase() || 'FILE',
      progress: 0,
      status: 'queued',
      category: evidenceCategories[0],
      theme: inspectionThemes[0],
    }));
    setFiles((prev) => [...prev, ...newEntries]);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFile = (id: string, patch: Partial<UploadFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    setUploading(true);

    files.forEach((uf, idx) => {
      updateFile(uf.id, { status: 'uploading' });
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 18 + 8;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          updateFile(uf.id, { progress: 100, status: 'done' });
          if (idx === files.length - 1) {
            setTimeout(() => setAllDone(true), 400);
          }
        } else {
          updateFile(uf.id, { progress: Math.round(progress) });
        }
      }, 200 + idx * 120);
    });
  };

  const doneCount = files.filter((f) => f.status === 'done').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Bulk Upload Evidence</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload multiple files and tag them at once</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Drop zone */}
          {!uploading && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragOver
                  ? 'border-brand-400 bg-brand-50'
                  : 'border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.xlsx,.xls,.mp4,.mov,.png,.jpg,.jpeg,.zip"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 rounded-full bg-brand-50">
                <i className="ri-upload-cloud-2-line text-2xl text-brand-500"></i>
              </div>
              <p className="text-sm font-medium text-slate-700">
                Drop files here or <span className="text-brand-600">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX, MP4, PNG &middot; Max 50MB per file</p>
            </div>
          )}

          {/* File queue */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  {files.length} file{files.length !== 1 ? 's' : ''} queued
                </h3>
                {allDone && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <i className="ri-check-double-line"></i> All uploaded successfully
                  </span>
                )}
                {uploading && !allDone && (
                  <span className="text-xs text-slate-500">{doneCount} / {files.length} complete</span>
                )}
              </div>

              <div className="space-y-2">
                {files.map((uf) => {
                  const { icon, color } = fileIcon(uf.name);
                  return (
                    <div key={uf.id} className="bg-slate-50 rounded-lg border border-slate-100 p-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-md bg-white border border-slate-200 ${color}`}>
                          <i className={`${icon} text-base`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-slate-800 truncate">{uf.name}</p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-slate-400">{uf.size}</span>
                              {uf.status === 'done' && (
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                  <i className="ri-check-line text-xs"></i>
                                </div>
                              )}
                              {uf.status === 'error' && (
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100 text-red-500">
                                  <i className="ri-close-line text-xs"></i>
                                </div>
                              )}
                              {!uploading && (
                                <button onClick={() => removeFile(uf.id)} className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-500 cursor-pointer">
                                  <i className="ri-delete-bin-line text-xs"></i>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Progress bar */}
                          {(uf.status === 'uploading' || uf.status === 'done') && (
                            <div className="mt-1.5">
                              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${uf.status === 'done' ? 'bg-emerald-500' : 'bg-brand-500'}`}
                                  style={{ width: `${uf.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Metadata fields */}
                          {!uploading && (
                            <div className="flex gap-2 mt-2">
                              <CustomSelect
                                value={uf.category}
                                onChange={(v) => updateFile(uf.id, { category: v })}
                                options={categoryOptions}
                                className="flex-1"
                                size="sm"
                              />
                              <CustomSelect
                                value={uf.theme}
                                onChange={(v) => updateFile(uf.id, { theme: v })}
                                options={themeOptions}
                                className="flex-1"
                                size="sm"
                              />
                            </div>
                          )}
                          {uploading && uf.status === 'queued' && (
                            <p className="text-xs text-slate-400 mt-1">Waiting...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            {files.length === 0
              ? 'No files selected'
              : `${files.length} file${files.length !== 1 ? 's' : ''} ready to upload`}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer whitespace-nowrap">
              {allDone ? 'Close' : 'Cancel'}
            </button>
            {!allDone && (
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                className="px-4 py-2 text-sm bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <i className="ri-upload-cloud-2-line text-sm"></i>
                {uploading ? `Uploading… ${doneCount}/${files.length}` : `Upload ${files.length > 0 ? files.length : ''} File${files.length !== 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
