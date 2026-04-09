import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Landmark, Loader2, Lock, QrCode, ShieldCheck, Smartphone } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../services/mockData';
import { api } from '../services/api';
import { UserRole } from '../types';

type PaymentMethod = 'upi' | 'card' | 'netbanking';

interface PlanCheckoutProps {
  role: UserRole;
}

const PlanCheckout: React.FC<PlanCheckoutProps> = ({ role }) => {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [transactionRef, setTransactionRef] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentUser = api.auth.getCurrentUser();
  const target = role === UserRole.FREELANCER ? 'Freelancer' : 'Employer';
  const plan = useMemo(
    () => SUBSCRIPTION_PLANS.find((item) => item.id === planId && item.target === target),
    [planId, target]
  );

  if (role === UserRole.ADMIN) {
    return <Navigate to="/admin" replace />;
  }

  if (!plan || plan.amount === 0) {
    return <Navigate to="/pricing" replace />;
  }

  if (currentUser?.subscriptionStatus === 'Pending') {
    return <Navigate to="/pricing" replace />;
  }

  const convenienceFee = Math.round(plan.amount * 0.02);
  const taxAmount = Math.round(plan.amount * 0.18);
  const totalAmount = plan.amount + convenienceFee + taxAmount;

  const createTransactionRef = () => `GB${Date.now().toString().slice(-8)}`;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (paymentMethod === 'upi' && !transactionRef.trim()) {
      setError('Enter the UPI transaction reference after completing payment.');
      return;
    }

    if (paymentMethod === 'card' && (!cardName.trim() || cardNumber.replace(/\s/g, '').length < 16 || !expiry.trim() || cvv.trim().length < 3)) {
      setError('Enter complete card details to continue.');
      return;
    }

    if (paymentMethod === 'netbanking' && !bankName.trim()) {
      setError('Select a bank to continue.');
      return;
    }

    setIsSubmitting(true);

    window.setTimeout(() => {
      try {
        api.subscriptions.createRequest({
          planSelected: plan.tier,
          amount: totalAmount,
          utrNumber: paymentMethod === 'upi' ? transactionRef.trim() : createTransactionRef(),
          proofImageUrl: paymentMethod,
          status: 'Reviewing'
        });

        api.notifications.create({
          userId: currentUser?.id,
          type: 'PAYMENT',
          title: 'Payment submitted successfully',
          message: `Your ${plan.name} plan payment is under verification.`,
          link: '/pricing'
        });

        navigate('/pricing', { replace: true });
      } catch {
        setError('Payment could not be processed. Please try again.');
        setIsSubmitting(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <section className="card-premium p-8 lg:p-10">
          <button
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} /> Back to plans
          </button>

          <div className="mt-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">Secure Checkout</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">Activate {plan.name}</h1>
              <p className="mt-3 text-slate-500 max-w-xl">
                Complete payment to unlock premium access for your {target.toLowerCase()} account. Your plan is activated after verification.
              </p>
            </div>

            <div className="premium-surface rounded-2xl px-5 py-4 min-w-[180px]">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">Plan Total</p>
              <p className="mt-1 text-3xl font-bold text-slate-950">Rs. {totalAmount}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`rounded-2xl border px-4 py-4 text-left transition-all ${paymentMethod === 'upi' ? 'border-primary-500 bg-primary-50 premium-ring' : 'border-slate-200 bg-white hover:border-primary-200'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center"><Smartphone size={18} /></div>
                <div>
                  <p className="font-semibold text-slate-900">UPI</p>
                  <p className="text-xs text-slate-500">PhonePe, GPay, Paytm</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`rounded-2xl border px-4 py-4 text-left transition-all ${paymentMethod === 'card' ? 'border-primary-500 bg-primary-50 premium-ring' : 'border-slate-200 bg-white hover:border-primary-200'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><CreditCard size={18} /></div>
                <div>
                  <p className="font-semibold text-slate-900">Card</p>
                  <p className="text-xs text-slate-500">Credit or debit card</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('netbanking')}
              className={`rounded-2xl border px-4 py-4 text-left transition-all ${paymentMethod === 'netbanking' ? 'border-primary-500 bg-primary-50 premium-ring' : 'border-slate-200 bg-white hover:border-primary-200'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Landmark size={18} /></div>
                <div>
                  <p className="font-semibold text-slate-900">Net Banking</p>
                  <p className="text-xs text-slate-500">Major Indian banks</p>
                </div>
              </div>
            </button>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {paymentMethod === 'upi' && (
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5 items-start">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col items-center">
                  <div className="w-40 h-40 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=gigsbharat@upi&pn=GigBharat&am=${totalAmount}&cu=INR`}
                      alt="GigBharat UPI QR"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                    <QrCode size={15} /> Scan & pay
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4">
                    <p className="text-sm font-semibold text-sky-900">UPI ID</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">gigsbharat@upi</p>
                    <p className="mt-2 text-sm text-sky-800">Pay Rs. {totalAmount} and paste the transaction reference below.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">UPI Transaction Reference</label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(event) => setTransactionRef(event.target.value)}
                      placeholder="Enter UTR / transaction ID"
                      className="input-premium !pl-4"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(event) => setCardName(event.target.value)}
                    placeholder="Name on card"
                    className="input-premium !pl-4"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="input-premium !pl-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Expiry</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(event) => setExpiry(event.target.value)}
                    placeholder="MM/YY"
                    className="input-premium !pl-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">CVV</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(event) => setCvv(event.target.value)}
                    placeholder="123"
                    className="input-premium !pl-4"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Bank</label>
                <select
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  className="input-premium !pl-4"
                >
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>State Bank of India</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[220px]">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Lock size={16} />}
                {isSubmitting ? 'Processing payment...' : `Pay Rs. ${totalAmount}`}
              </button>
              <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                <ShieldCheck size={16} className="text-emerald-600" /> Secure encrypted checkout
              </div>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="card-premium p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Order Summary</p>
            <div className="mt-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">{plan.name}</h2>
                  <p className="text-sm text-slate-500">{target} membership</p>
                </div>
                <span className="rounded-full bg-primary-50 text-primary-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
                  {plan.tier}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600"><span>Plan amount</span><span>Rs. {plan.amount}</span></div>
                <div className="flex justify-between text-slate-600"><span>Convenience fee</span><span>Rs. {convenienceFee}</span></div>
                <div className="flex justify-between text-slate-600"><span>Taxes</span><span>Rs. {taxAmount}</span></div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between text-base font-bold text-slate-950"><span>Total payable</span><span>Rs. {totalAmount}</span></div>
              </div>
            </div>
          </div>

          <div className="card-premium p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Included in this plan</p>
            <ul className="mt-5 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-premium p-7">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Verification after payment</p>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  The app marks your payment as submitted immediately and moves the plan into review so the admin can approve activation.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PlanCheckout;