
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Gig } from '../types';
import { Clock, MapPin, IndianRupee, ShieldCheck, Users, Briefcase, ChevronLeft, CheckCircle, AlertTriangle, X, Upload, FileText, Loader } from 'lucide-react';

const GigDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gig, setGig] = useState<Gig | undefined>(undefined);
  
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [days, setDays] = useState<number>(7);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dispute State
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
        const foundGig = api.gigs.getById(id);
        setGig(foundGig);
        if(foundGig) setBidAmount(foundGig.budget);
    }
  }, [id]);

  const handleSubmit = () => {
    if (!gig) return;
    setIsSubmitting(true);
    
    // Simulate network delay for better UX
    setTimeout(() => {
        try {
            api.bids.create({
                gigId: gig.id,
                amount: bidAmount,
                days: days,
                proposal: coverLetter
                // Resume would be handled here in a real app
            });
            setSubmitted(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (e) {
            alert("Error submitting bid");
        } finally {
            setIsSubmitting(false);
        }
    }, 1500);
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gig) return;
    try {
      api.disputes.create({
        gigId: gig.id,
        gigTitle: gig.title,
        reason: disputeReason
      });
      setDisputeSubmitted(true);
      setTimeout(() => {
        setIsDisputeModalOpen(false);
        setDisputeSubmitted(false);
        setDisputeReason('');
      }, 2000);
    } catch (err) {
      alert('Failed to raise dispute');
    }
  };

  if (!gig) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-6">
           <Link to="/find-work" className="inline-flex items-center text-gray-500 hover:text-gray-900">
              <ChevronLeft size={16} className="mr-1" /> Back to Jobs
           </Link>
           <button 
             onClick={() => setIsDisputeModalOpen(true)}
             className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
           >
             <AlertTriangle size={14} /> Report / Dispute
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{gig.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                   <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                      <Briefcase size={14} /> {gig.type}
                   </div>
                   <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                      <Clock size={14} /> Posted {new Date(gig.createdAt).toLocaleDateString()}
                   </div>
                </div>

                <div className="prose prose-blue max-w-none text-gray-600">
                   <h3 className="text-gray-900 font-semibold text-lg mb-2">Description</h3>
                   <p>{gig.description}</p>
                   
                   <h3 className="text-gray-900 font-semibold text-lg mt-6 mb-2">Requirements</h3>
                   <ul className="list-disc pl-5 space-y-1">
                      <li>Min TQ Score of {gig.minTQ}.</li>
                   </ul>
                </div>
             </div>

             {/* Bidding Section */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                {submitted ? (
                    <div className="text-center py-8">
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900">Proposal Sent!</h2>
                        <p className="text-gray-500">Employer has been notified. Redirecting to dashboard...</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Submit a Proposal</h2>
                        <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bid Amount (₹)</label>
                            <input 
                                type="number" 
                                className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none" 
                                value={bidAmount}
                                onChange={(e) => setBidAmount(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Days to Complete</label>
                            <input 
                                type="number" 
                                className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none" 
                                value={days}
                                onChange={(e) => setDays(Number(e.target.value))}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                            <textarea 
                                rows={4} 
                                className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-primary-500 outline-none" 
                                placeholder="Why are you the best fit?"
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF)</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors relative">
                                <div className="space-y-1 text-center">
                                    <FileText className="mx-auto h-8 w-8 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="resume-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                                            <span>Upload your resume</span>
                                            <input id="resume-upload" name="resume-upload" type="file" className="sr-only" accept=".pdf" onChange={(e) => setResumeFile(e.target.files ? e.target.files[0] : null)} />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                                </div>
                                {resumeFile && (
                                    <div className="absolute inset-0 bg-green-50 flex items-center justify-center rounded-lg border-2 border-green-200">
                                        <div className="text-green-700 font-medium flex items-center gap-2">
                                            <CheckCircle size={16}/> <span>{resumeFile.name}</span>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setResumeFile(null); }} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button 
                            type="button" 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                          className="bg-sky-600 text-white border border-sky-700 px-6 py-2 rounded-lg font-bold hover:bg-sky-700 transition-colors w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader className="animate-spin" size={18} /> Sending Request...
                                </>
                            ) : (
                                'Submit Proposal'
                            )}
                        </button>
                        </form>
                    </>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Raise a Dispute
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Please describe the issue with this gig. An admin will review your case and contact you.
                      </p>
                      {disputeSubmitted ? (
                         <div className="flex items-center text-green-600 gap-2 mb-4 bg-green-50 p-2 rounded">
                            <CheckCircle size={16} /> Dispute reported successfully.
                         </div>
                      ) : (
                        <textarea
                          className="w-full border border-gray-300 rounded-md p-2 h-32 focus:ring-red-500 focus:border-red-500 focus:ring-2 outline-none transition-all"
                          placeholder="Describe the issue..."
                          value={disputeReason}
                          onChange={(e) => setDisputeReason(e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {!disputeSubmitted && (
                  <button
                    type="button"
                    onClick={handleDisputeSubmit}
                    disabled={!disputeReason.trim()}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    Submit Dispute
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GigDetails;
