import React, { useEffect, useState } from 'react';
import { SUBSCRIPTION_PLANS } from '../services/mockData';
import { Check, Clock, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface PricingProps {
  role: UserRole;
}

const Pricing: React.FC<PricingProps> = ({ role }) => {
    const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(api.auth.getCurrentUser());

  useEffect(() => {
    setCurrentUser(api.auth.getCurrentUser());
  }, []);

  // Security check: Admins don't buy plans
  if (role === UserRole.ADMIN) {
    return <Navigate to="/admin" />;
  }

  // Filter plans based on role
  const filteredPlans = SUBSCRIPTION_PLANS.filter(p => p.target === (role === UserRole.FREELANCER ? 'Freelancer' : 'Employer'));

    const handleChoosePlan = (planId: string) => {
        navigate(`/pricing/checkout/${planId}`);
  };

  // Render Verification In Progress State
  if (currentUser?.subscriptionStatus === 'Pending') {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-yellow-100">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Clock size={40} className="text-yellow-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification in Progress</h1>
                  <p className="text-gray-600 mb-6">
                      Your upgrade request is being verified by our admin team. Access to premium features will be granted within <span className="font-semibold">2-4 hours</span>.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg text-left text-sm text-gray-500 mb-6">
                      <p><strong>Note:</strong> You will receive a notification once the status changes. You can continue using your current plan features in the meantime.</p>
                  </div>
                  <button onClick={() => window.location.reload()} className="text-primary-600 font-semibold hover:underline">
                      Refresh Status
                  </button>
              </div>
          </div>
      );
  }

  return (
        <div className="min-h-screen py-12 relative animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
                    <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">
                        Subscription Plans
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Upgrade Your {role === UserRole.FREELANCER ? 'Freelance' : 'Hiring'} Power
          </p>
          <p className="mt-4 max-w-2xl text-lg text-gray-500 mx-auto">
                         Choose the plan that fits your career stage. Click any paid plan to continue to secure checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredPlans.map((plan) => {
            const isCurrentPlan = currentUser?.subscriptionTier === plan.tier;
            const isFree = plan.amount === 0;

            return (
                                <div
                                    key={plan.id}
                                    className={`card-premium flex flex-col overflow-hidden transition-all ${plan.isPopular ? 'border-primary-500 ring-4 ring-primary-500/10 scale-[1.02] z-10' : 'border-gray-200'} ${!isCurrentPlan && !isFree ? 'cursor-pointer' : ''}`}
                                    onClick={() => !isCurrentPlan && !isFree && handleChoosePlan(plan.id)}
                                    onKeyDown={(event) => {
                                        if ((event.key === 'Enter' || event.key === ' ') && !isCurrentPlan && !isFree) {
                                            event.preventDefault();
                                            handleChoosePlan(plan.id);
                                        }
                                    }}
                                    role={!isCurrentPlan && !isFree ? 'button' : undefined}
                                    tabIndex={!isCurrentPlan && !isFree ? 0 : -1}
                                >
                
                {plan.isPopular && (
                    <div className="bg-primary-600 text-white text-center text-xs font-bold uppercase tracking-widest py-1.5">
                        Most Popular
                    </div>
                )}

                <div className="p-8 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-6">
                        <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                        <span className="text-gray-500 ml-1">{plan.period}</span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-6 text-center">
                        <span className="text-sm font-semibold text-gray-700">Commission: </span>
                        <span className={`text-lg font-bold ${plan.tier === 'Elite' ? 'text-green-600' : 'text-gray-900'}`}>{plan.commission}</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                            <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
                        </div>
                        <p className="ml-3 text-sm text-gray-700">{feature}</p>
                        </li>
                    ))}
                    </ul>
                </div>
                
                <div className="p-8 bg-slate-50/80 border-t border-gray-100">
                    <button 
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    !isCurrentPlan && !isFree && handleChoosePlan(plan.id);
                                                }}
                        disabled={isCurrentPlan || isFree}
                        className={`w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-center font-bold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                            ${isCurrentPlan 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                : isFree 
                                    ? 'bg-white text-gray-500 border border-gray-300 cursor-default'
                                    : plan.isPopular 
                                        ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500' 
                                        : 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 focus:ring-primary-500'
                            }`}
                    >
                        {isCurrentPlan ? 'Current Plan' : isFree ? 'Default Plan' : 'Continue to Checkout'}
                        {!isCurrentPlan && !isFree && <ArrowRight size={16} />}
                    </button>
                </div>
                </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Pricing;