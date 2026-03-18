import React, { useState } from 'react';
import { BookOpen, Layers, UploadCloud, CheckCircle, Mail, Phone, ExternalLink, ShieldCheck, User } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker using CDN for stability
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs`;

interface AnalysisResult {
  emails: string[];
  phones: string[];
}

const Dscource: React.FC = () => {
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const extractInformation = (text: string): AnalysisResult => {
    // Basic regex for Email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = Array.from(new Set(text.match(emailRegex) || []));

    // Basic regex for Phone Numbers (international and domestic variants)
    // Matches patterns like +1 234 567 8900, (123) 456-7890, 123-456-7890, etc.
    const phoneRegex = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
    const rawPhones = text.match(phoneRegex) || [];
    
    // Clean up and deduplicate phones
    const phones = Array.from(new Set(rawPhones.map(p => p.trim()).filter(p => p.length >= 10)));

    return { emails, phones };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      let extractedText = '';

      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          // Join with newline to preserve line breaks instead of spaces
          const pageText = textContent.items.map((item: any) => item.str).join('\n');
          extractedText += pageText + '\n';
        }
      } else if (file.type === 'text/plain') {
        extractedText = await file.text();
      } else {
        throw new Error("Unsupported file format. Please upload PDF or TXT.");
      }

      if (!extractedText.trim()) {
        throw new Error("Could not extract any meaningful text from this document.");
      }

      // Perform fast regex extraction
      const result = extractInformation(extractedText);
      
      // Simulate slight processing delay for better UX
      setTimeout(() => {
        setAnalysis(result);
        setLoading(false);
      }, 500);

    } catch (err: any) {
      console.error("File processing error:", err);
      setError("Could not parse file. It might be an image-based PDF or corrupted. " + (err.message || ''));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              Dscource
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text text-sm font-bold uppercase tracking-wider ml-2 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                Alpha
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Your personalized learning and resource center.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col items-center justify-center space-y-4">
            <h2 className="text-xl font-bold w-full text-left mb-2">Upload Resume</h2>
            
            <div className="w-full border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-slate-800/50">
              <input 
                type="file" 
                accept=".pdf,.txt" 
                onChange={handleFileUpload} 
                className="hidden" 
                id="resume-upload" 
              />
              <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="w-12 h-12 text-gray-400 dark:text-slate-500 mb-3 hover:scale-105 transition-transform" />
                <p className="text-gray-700 dark:text-slate-300 font-medium text-lg">
                  {fileName || "Click to upload PDF or Text file"}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 font-medium">
                  Supported formats: PDF, TXT
                </p>
              </label>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-blue-500 animate-pulse text-sm mt-3 w-full justify-center bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                Processing Analysis...
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm mt-3 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg w-full">
                {error}
              </p>
            )}

            {analysis && !loading && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mt-3 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-lg w-full border border-green-200 dark:border-green-800/50">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span className="font-medium">Analysis completed successfully!</span>
              </div>
            )}
          </div>

          {/* Analysis Output Display */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col h-[500px]">
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
               <ShieldCheck className="w-6 h-6 text-indigo-500" />
               Contact Information Analysis
             </h3>
             
             {analysis ? (
               <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-4">
                 
                 {/* Email Section */}
                 <div className="bg-gray-50 dark:bg-black/30 rounded-xl p-5 border border-gray-100 dark:border-white/5">
                   <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400 font-semibold">
                     <Mail className="w-5 h-5" />
                     <h4>Detected Emails</h4>
                     <span className="ml-auto bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 py-0.5 px-2.5 rounded-full text-xs">
                       {analysis.emails.length} found
                     </span>
                   </div>
                   {analysis.emails.length > 0 ? (
                     <ul className="space-y-4">
                       {analysis.emails.map((email, i) => (
                         <li key={i} className="flex flex-col gap-2 bg-white dark:bg-black/40 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                           <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                             <span className="text-gray-900 dark:text-gray-100 font-medium text-sm">
                               {email}
                             </span>
                           </div>
                           <a 
                             href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent("Invitation for Interview")}&body=${encodeURIComponent("Dear Candidate,\n\nYou have been invited to participate in an interview through our AI-powered interview platform. This platform is designed to evaluate candidates through a structured and intelligent interview process based on the job role and required skills.\n\nAs part of the process, you will be asked a few questions related to the position you applied for. Some questions may also be generated based on your resume and previous experience. Please answer the questions clearly and professionally.\n\nkindly provide a brief introduction about yourself, including your educational background, key skills, projects or experience relevant to the role.\n\nWe wish you the best for your interview.\n\nBest Regards,\nInterview Team")}`} 
                             target="_blank"
                             rel="noopener noreferrer"
                             className="inline-flex items-center justify-center gap-2 px-4 py-2 mt-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-all shadow-sm shadow-red-500/20 hover:shadow-md hover:shadow-red-500/30 w-fit"
                           >
                             <Mail className="w-3.5 h-3.5" />
                             Send Email
                           </a>
                         </li>
                       ))}
                     </ul>
                   ) : (
                     <p className="text-sm text-gray-500 dark:text-gray-400 italic">No emails detected in the uploaded document.</p>
                   )}
                 </div>

                 {/* Phone Section */}
                 <div className="bg-gray-50 dark:bg-black/30 rounded-xl p-5 border border-gray-100 dark:border-white/5">
                   <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                     <Phone className="w-5 h-5" />
                     <h4>Detected Phone Numbers</h4>
                     <span className="ml-auto bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 py-0.5 px-2.5 rounded-full text-xs">
                       {analysis.phones.length} found
                     </span>
                   </div>
                   {analysis.phones.length > 0 ? (
                     <ul className="space-y-3">
                       {analysis.phones.map((phone, i) => (
                         <li key={i} className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                           <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 text-sm font-medium">
                             {phone}
                             <ExternalLink className="w-3 h-3 opacity-50" />
                           </a>
                         </li>
                       ))}
                     </ul>
                   ) : (
                     <p className="text-sm text-gray-500 dark:text-gray-400 italic">No phone numbers detected in the uploaded document.</p>
                   )}
                 </div>
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 opacity-60 bg-gray-50 dark:bg-black/20 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
                 <Layers className="w-16 h-16 mb-4 text-gray-300 dark:text-slate-700" />
                 <p className="font-medium text-center px-4">Upload a resume to automatically extract contact information.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dscource;
