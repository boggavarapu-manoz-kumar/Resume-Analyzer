import React, { useState } from 'react';
import api from '../../services/api';
import { Heart, CheckCircle, AlertCircle, Zap, ShieldCheck } from 'lucide-react';

// Load Razorpay script only once
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If already loaded, resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const QUICK_AMOUNTS = [49, 99, 199, 499];

const Pricing = () => {
  const [amount, setAmount] = useState(99);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paidId, setPaidId] = useState('');

  const handlePayment = async () => {
    if (!amount || amount < 1) {
      setError('Please enter a valid amount (minimum ₹1).');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError('Razorpay SDK failed to load. Please check your internet connection.');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create order on backend
      const { data } = await api.post('/api/payments/create-order', { amount });
      const { orderId, amount: amountInPaise, currency } = data;

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amountInPaise.toString(),
        currency: currency,
        name: 'ResumeAI',
        description: 'Support ResumeAI — Thank you! ❤️',
        image: '', // Can add logo URL here
        order_id: orderId,

        // Step 3: On payment success → verify signature on backend
        handler: async function (razorpayResponse) {
          try {
            const verifyRes = await api.post('/api/payments/verify-payment', {
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_order_id:   razorpayResponse.razorpay_order_id,
              razorpay_signature:  razorpayResponse.razorpay_signature,
            });

            if (verifyRes.data.status === 'success') {
              setPaidId(razorpayResponse.razorpay_payment_id);
              setSuccess('Payment successful! Thank you for supporting ResumeAI 🎉');
              setAmount(99); // reset to default
            } else {
              setError('Signature verification failed. Please contact support.');
            }
          } catch (verifyErr) {
            const msg = verifyErr.response?.data?.message || verifyErr.message;
            setError('Verification error: ' + msg);
          }
        },

        // Handle modal dismiss (user clicked ✕)
        modal: {
          ondismiss: function () {
            setError('Payment was cancelled. Click the button to try again.');
            setLoading(false);
          },
        },

        prefill: {
          name: '',
          email: '',
          contact: '',
        },

        notes: {
          purpose: 'Support contribution to ResumeAI',
        },

        theme: {
          color: '#ef4444', // Red theme for heart
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment failure inside the modal
      rzp.on('payment.failed', function (resp) {
        setError(`Payment failed: ${resp.error.description} (${resp.error.reason})`);
      });

      rzp.open();
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto pt-12 pb-24 relative z-10 px-4">
      
      {/* Header */}
      <div className="text-center animate-fade-up stagger-1 mb-4">
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse"></div>
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 flex items-center justify-center backdrop-blur-sm">
              <Heart className="w-12 h-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" fill="currentColor" />
            </div>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
          Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">ResumeAI</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto">
          100% free forever · Your support keeps it that way
        </p>
      </div>

      {/* Success banner */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4 animate-fade-up backdrop-blur-md">
          <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-emerald-400 font-bold text-lg mb-1">{success}</p>
            {paidId && (
              <p className="text-emerald-400/70 text-sm">
                Payment ID: <code className="bg-emerald-500/20 px-2 py-1 rounded text-emerald-300 select-all">{paidId}</code>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 animate-fade-up backdrop-blur-md">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl animate-fade-up stagger-2 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <p className="text-slate-300 text-lg leading-relaxed mb-8 text-center relative z-10">
          ResumeAI is completely free — no paywalls, no ads. If it helped you land a job or ace an
          interview, consider buying us a coffee <span className="inline-block animate-bounce">☕</span>
        </p>

        <div className="relative z-10">
          {/* Quick-select amounts */}
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Quick Pick</label>
          <div className="grid grid-cols-4 gap-3 mb-8">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                onClick={() => { setAmount(q); setError(''); setSuccess(''); }}
                className={`py-3 px-2 rounded-xl font-bold transition-all ${
                  amount === q 
                    ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                } border`}
              >
                ₹{q}
              </button>
            ))}
          </div>

          {/* Custom amount input */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Or enter a custom amount</label>
            <div className="relative max-w-xs mx-auto">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={amount}
                min="1"
                onChange={(e) => { setAmount(Number(e.target.value)); setError(''); setSuccess(''); }}
                placeholder="Enter amount"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all placeholder-slate-600"
              />
            </div>
          </div>

          {/* Pay button */}
          <button
            className="group relative w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-lg py-5 rounded-2xl transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] disabled:opacity-70 hover:scale-[1.02]"
            onClick={handlePayment}
            disabled={loading || !amount || amount < 1}
          >
            {loading ? (
              <><Zap className="w-6 h-6 animate-spin" /> Processing...</>
            ) : (
              <><Heart className="w-6 h-6 group-hover:scale-110 transition-transform" /> Support with ₹{amount || 0}</>
            )}
          </button>

          {/* Secure note */}
          <div className="flex items-center justify-center gap-2 mt-6 text-slate-500 text-sm font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
            Secured by Razorpay · SSL encrypted
          </div>
        </div>
      </div>

      {/* Test credentials hint */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-center animate-fade-up stagger-3 backdrop-blur-md">
        <p className="text-blue-400 font-bold mb-2 flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" /> Test Mode Active
        </p>
        <p className="text-slate-400 text-sm leading-relaxed">
          Use card <code className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">4111 1111 1111 1111</code>, CVV <code className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">123</code>, Expiry <code className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">12/26</code><br />
          Or UPI ID: <code className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">success@razorpay</code><br />
          <span className="text-slate-500 mt-2 block">No real money charged.</span>
        </p>
      </div>

    </div>
  );
};

export default Pricing;
