import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Gig } from '../types';
import { Search, Filter, MapPin, Clock, IndianRupee, Briefcase, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const FindWork: React.FC = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setGigs(api.gigs.getAll());
  }, []);

  const filteredGigs = gigs.filter(g => 
    g.status === 'Open' && 
    !['g1', 'g2'].includes(g.id) && // Exclude dummy history data from active listings
    (g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
             <div>
                <h1 className="text-3xl font-bold text-gray-900">Find Work</h1>
                <p className="text-gray-500 mt-1">Browse high-quality gigs matched to your TQ Score.</p>
             </div>
             <div className="flex w-full md:w-auto gap-2">
                <div className="relative flex-grow md:w-80">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                   </div>
                   <input 
                     type="text" 
                     className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg sm:text-sm"
                     placeholder="Search..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
             </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
             <div className="flex-grow space-y-4">
                {filteredGigs.length > 0 ? filteredGigs.map((gig) => (
                   <div key={gig.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
                      <div className="flex justify-between items-start">
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <Link to={`/gigs/${gig.id}`} className="text-xl font-bold text-gray-900 hover:text-primary-600 cursor-pointer">{gig.title}</Link>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">Posted by {gig.postedBy}</p>
                         </div>
                         <div className="text-right flex-shrink-0">
                            <div className="flex items-center text-lg font-bold text-gray-900">
                               <IndianRupee size={18} /> {gig.budget.toLocaleString()}
                            </div>
                            <span className="text-xs text-gray-500">{gig.type}</span>
                         </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{gig.description}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                         <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                               <Briefcase size={14} /> Min TQ: <span className="font-semibold text-gray-700">{gig.minTQ}</span>
                            </div>
                         </div>
                         <Link to={`/gigs/${gig.id}`} className="bg-sky-600 text-white border border-sky-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors">
                            Apply
                         </Link>
                      </div>
                   </div>
                )) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No active gigs found</h3>
                        <p className="text-gray-500 mt-1">Check back later for new opportunities.</p>
                    </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

export default FindWork;