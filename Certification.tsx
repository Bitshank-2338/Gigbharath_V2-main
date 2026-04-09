import React from 'react';
import { CERTIFICATION_TRACKS } from '../services/mockData';
import { ShieldCheck, CheckCircle, Clock, ArrowRight, Award, Lock } from 'lucide-react';

const Certification: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            GigBharat <span className="text-primary-600">Verified</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Boost your Talent Quotient (TQ) by up to 25 points. Stand out to top employers with official skill verification.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verified Badge</h3>
              <p className="text-gray-500 text-sm">Get the prestigious checkmark on your profile that builds instant trust.</p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Award size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">TQ Score Boost</h3>
              <p className="text-gray-500 text-sm">Directly increase your algorithm ranking by completing tracks.</p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Lock size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Access Premium Gigs</h3>
              <p className="text-gray-500 text-sm">Unlock high-budget projects reserved only for Verified talent.</p>
           </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Certification Tracks</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {CERTIFICATION_TRACKS.map((track) => (
             <div key={track.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                <div className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{track.name}</h3>
                      {track.status === 'Certified' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           <CheckCircle size={14} className="mr-1" /> Certified
                        </span>
                      ) : track.status === 'In Progress' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                           <Clock size={14} className="mr-1" /> In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                           Not Started
                        </span>
                      )}
                   </div>
                   
                   <p className="text-gray-600 mb-6">{track.description}</p>
                   
                   <div className="mb-6">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Requirements</h4>
                      <ul className="space-y-2">
                         {track.requirements.map((req, i) => (
                           <li key={i} className="flex items-center text-sm text-gray-600">
                              <div className={`w-1.5 h-1.5 rounded-full mr-2 ${track.status === 'Certified' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              {req}
                           </li>
                         ))}
                      </ul>
                   </div>

                   <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div className="text-sm font-medium text-purple-600">
                         +{track.tqBoost} TQ Points
                      </div>
                      <button 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          track.status === 'Certified' 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                        disabled={track.status === 'Certified'}
                      >
                         {track.status === 'Certified' ? 'Completed' : track.status === 'In Progress' ? 'Continue' : 'Start Certification'}
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Certification;