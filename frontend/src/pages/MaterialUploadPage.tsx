import React, { useState } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import { uploadDocument } from '../services/api';

export const MaterialUploadPage: React.FC = () => {
  const [docResult, setDocResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    try {
      const res = await uploadDocument(e.target.files[0]);
      setDocResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Upload Educational Material</h1>
        <p className="text-slate-400 text-sm">Index PDF, DOCX, PPTX, or TXT documents into the local RAG vector store.</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-6">
        <div className="border-2 border-dashed border-indigo-500/30 rounded-2xl p-10 hover:border-indigo-500 transition-all bg-slate-950/50">
          <Upload className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">Drag and drop file here, or click to select</p>
          <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, PPTX, TXT</p>
          <input
            type="file"
            onChange={handleUpload}
            className="hidden"
            id="material-file"
          />
          <label
            htmlFor="material-file"
            className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer shadow-lg"
          >
            {loading ? "Parsing & Indexing Vectors..." : "Select File"}
          </label>
        </div>

        {docResult && (
          <div className="bg-slate-950 p-6 rounded-2xl border border-emerald-500/40 text-left space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Document Successfully Parsed & Indexed!</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Filename</span>
                <span className="font-mono truncate font-bold text-white">{docResult.filename}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Total Pages</span>
                <span className="font-mono font-bold text-white">{docResult.total_pages}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Vector Chunks</span>
                <span className="font-mono font-bold text-white">{docResult.chunks_indexed}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
