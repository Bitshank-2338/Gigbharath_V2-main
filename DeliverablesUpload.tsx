
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Gig } from '../types';
import { 
  UploadCloud, Image, Video, X, CheckCircle, ArrowLeft, 
  Cpu, Sparkles, ShieldCheck, FileText, Loader, Zap, Send
} from 'lucide-react';

const DeliverablesUpload: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gig, setGig] = useState<Gig | undefined>(undefined);
  const [files, setFiles] = useState<{ id: string; file: File; type: 'image' | 'video'; preview: string }[]>([]);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionPhase, setTransmissionPhase] = useState<'idle' | 'encrypting' | 'syncing' | 'done'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [submissionSummary, setSubmissionSummary] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [result, setResult] = useState<{ verdict: 'approved' | 'changes-requested'; summary: string; strengths: string[]; missingItems: string[]; } | null>(null);

  useEffect(() => {
    document.title = "Review Submission | GigBharat";
    if (id) {
      const found = api.gigs.getById(id);
      setGig(found);
    }
  }, [id]);

  // Fix: Explicitly type 'f' as 'File' to avoid 'unknown' type errors for property access and URL.createObjectURL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        type: f.type.startsWith('video/') ? 'video' as const : 'image' as const,
        preview: URL.createObjectURL(f)
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => {
        const target = prev.find(f => f.id === fileId);
        if (target) URL.revokeObjectURL(target.preview);
        return prev.filter(f => f.id !== fileId);
    });
  };

  const handleSubmit = () => {
    if (files.length === 0 || !submissionSummary.trim()) return;
    
    setIsTransmitting(true);
    setTransmissionPhase('encrypting');
    setLogs(['Initializing Secure P2P Tunnel...', 'Applying AES-256 Payload Encryption...']);

    setTimeout(() => {
        setLogs(prev => [...prev, '✓ Encryption Layer Active', 'Syncing with GigBharat Escrow Node #4...']);
        setTransmissionPhase('syncing');
    }, 1500);

    setTimeout(() => {
        setLogs(prev => [...prev, '✓ Proof-of-Work verified by AI Node', 'Transmitting deliverables to Employer...']);
    }, 3000);

    setTimeout(() => {
        setTransmissionPhase('done');
      const response = api.gigs.submitMilestoneDeliverables(gig.id, {
        summary: submissionSummary,
        links: referenceLinks.split('\n').map(link => link.trim()).filter(Boolean),
        attachments: files.map(file => ({ name: file.file.name, type: file.type }))
      });

      setResult({
        verdict: response.aiReview.verdict,
        summary: response.aiReview.summary,
        strengths: response.aiReview.strengths,
        missingItems: response.aiReview.missingItems
      });

      setLogs(prev => [...prev, response.aiReview.verdict === 'approved' ? 'AI_REVIEW: Deliverables validated. Routed to employer review queue.' : 'AI_REVIEW: Submission needs revision before employer review.']);

      setTimeout(() => {
        if (response.aiReview.verdict === 'approved') {
          window.close();
        }
      }, 3500);
    }, 5000);
  };

  if (!gig) return <div className="p-8 text-center font-mono">LOADING_PROJECT_DATA...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-300 font-mono flex flex-col p-4 md:p-8">
      {/* Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-500">
             <Cpu size={24} className="animate-pulse" />
           </div>
           <div>
             <h1 className="text-xl font-bold text-white uppercase tracking-widest">Deliverable Uplink</h1>
             <p className="text-[10px] text-gray-500 font-bold uppercase">MISSION: {gig.title} • ID: {gig.id}</p>
           </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Escrow Link Established</span>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* Left: Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 border-2 border-dashed border-gray-800 rounded-3xl p-12 text-center relative group hover:border-blue-500/50 transition-all">
            <input 
              type="file" 
              multiple 
              accept="image/*,video/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:scale-110 group-hover:text-blue-400 transition-all shadow-xl">
                <UploadCloud size={40} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Deploy Artifacts</h3>
                <p className="text-xs text-gray-500 mt-1">Drag & drop high-res project media (JPG, PNG, MP4)</p>
              </div>
            </div>
          </div>

          {/* Preview Grid */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
              {files.map((f) => (
                <div key={f.id} className="group relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-lg">
                  {f.type === 'video' ? (
                    <video src={f.preview} className="w-full h-full object-cover" />
                  ) : (
                    <img src={f.preview} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => removeFile(f.id)} className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur rounded text-[8px] font-bold text-white uppercase tracking-widest flex items-center gap-1">
                    {f.type === 'video' ? <Video size={8}/> : <Image size={8}/>} {f.file.name.split('.').pop()}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Completion Summary</label>
              <textarea
                rows={5}
                value={submissionSummary}
                onChange={(e) => setSubmissionSummary(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 resize-none"
                placeholder="Explain what was completed in Phase 1, what employer requirements were addressed, and what proof is attached."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Reference Links</label>
              <textarea
                rows={3}
                value={referenceLinks}
                onChange={(e) => setReferenceLinks(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 resize-none"
                placeholder="Add demo URL, repo URL, drive link, staging link. One per line."
              />
            </div>
          </div>
        </div>

        {/* Right: Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400" /> Compliance Check
            </h3>
            
            <div className="space-y-4 mb-8">
               <div className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Artifacts Ready</span>
                  <span className={`text-xs font-bold ${files.length > 0 ? 'text-green-500' : 'text-gray-600'}`}>{files.length} ITEMS</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Security Audit</span>
                  <span className="text-xs font-bold text-blue-500">ENCRYPTED</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Timestamp</span>
                  <span className="text-xs font-bold text-gray-500 font-mono">{new Date().toLocaleTimeString()}</span>
               </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={files.length === 0 || !submissionSummary.trim() || isTransmitting}
              className={`w-full py-4 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                files.length > 0 && submissionSummary.trim() && !isTransmitting ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              {isTransmitting ? <Loader className="animate-spin" size={18} /> : <Zap size={18} />}
              {isTransmitting ? 'Transmitting...' : 'Initiate Handover'}
            </button>
            <p className="text-[9px] text-gray-600 text-center mt-4 uppercase font-bold">Files will be visible to employer immediately upon release.</p>
          </div>

          {isTransmitting && (
            <div className="bg-black border border-blue-500/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(59,130,246,0.1)] animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                   <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Network Log</span>
              </div>
              <div className="space-y-2 h-40 overflow-y-auto custom-scrollbar font-mono text-[9px]">
                {logs.map((log, i) => (
                  <div key={i} className="text-blue-400/80 leading-relaxed">[{i.toString().padStart(2, '0')}] {log}</div>
                ))}
                {transmissionPhase !== 'done' && <div className="text-white animate-pulse">_</div>}
              </div>
              {transmissionPhase === 'done' && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 flex items-center gap-2 animate-bounce">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">System Synchronized</span>
                </div>
              )}
            </div>
          )}

          {result && (
            <div className={`border rounded-3xl p-6 animate-fade-in ${result.verdict === 'approved' ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.verdict === 'approved' ? 'bg-green-500/15 text-green-400' : 'bg-orange-500/15 text-orange-400'}`}>
                  {result.verdict === 'approved' ? <CheckCircle size={20} /> : <Cpu size={20} />}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white">AI Review Result</p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${result.verdict === 'approved' ? 'text-green-400' : 'text-orange-400'}`}>
                    {result.verdict === 'approved' ? 'Ready for employer review' : 'Needs revision'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{result.summary}</p>
              {result.strengths.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Strengths</p>
                  <ul className="space-y-1 text-xs text-green-300">
                    {result.strengths.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              )}
              {result.missingItems.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Missing Or Weak Areas</p>
                  <ul className="space-y-1 text-xs text-orange-300">
                    {result.missingItems.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default DeliverablesUpload;
