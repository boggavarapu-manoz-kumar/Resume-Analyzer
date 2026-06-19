import React, { useState } from 'react';
import api from '../../services/api';
import { Heart, CheckCircle, AlertCircle, Zap } from 'lucide-react';

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
          color: '#60A5FA',
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
    <div
      className="flex-col gap-lg animate-fade-up"
      style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem 1rem 4rem' }}
    >
      {/* Header */}
      <div className="text-center" style={{ marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div
            className="bento-icon-wrapper"
            style={{ margin: 0, color: '#ef4444', width: '72px', height: '72px', background: 'rgba(239,68,68,0.12)' }}
          >
            <Heart size={34} fill="#ef4444" />
          </div>
        </div>
        <h1 className="hero-title" style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }}>
          Support ResumeAI
        </h1>
        <p className="hero-subtitle" style={{ fontSize: '1.05rem', margin: 0 }}>
          100% free forever · Your support keeps it that way
        </p>
      </div>

      {/* Success banner */}
      {success && (
        <div
          className="animate-fade-up"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem',
          }}
        >
          <CheckCircle size={20} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ margin: 0, color: '#22c55e', fontWeight: 600 }}>{success}</p>
            {paidId && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Payment ID: <code style={{ userSelect: 'all' }}>{paidId}</code>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 'var(--radius-md)', padding: '0.9rem 1.25rem',
          }}
        >
          <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
          <p style={{ margin: 0, color: '#ef4444', fontSize: '0.9rem' }}>{error}</p>
        </div>
      )}

      {/* Card */}
      <div className="bento-card" style={{ padding: '2.5rem' }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
          ResumeAI is completely free — no paywalls, no ads. If it helped you land a job or ace an
          interview, consider buying us a coffee ☕ — any amount is hugely appreciated!
        </p>

        {/* Quick-select amounts */}
        <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
          Quick pick
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              onClick={() => { setAmount(q); setError(''); setSuccess(''); }}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${amount === q ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: amount === q ? 'rgba(96,165,250,0.12)' : 'transparent',
                color: amount === q ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.95rem',
              }}
            >
              ₹{q}
            </button>
          ))}
        </div>

        {/* Custom amount input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
            Or enter a custom amount
          </label>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-secondary)', fontSize: '1.1rem', fontWeight: 600,
              }}
            >
              ₹
            </span>
            <input
              type="number"
              value={amount}
              min="1"
              onChange={(e) => { setAmount(Number(e.target.value)); setError(''); setSuccess(''); }}
              placeholder="Enter amount"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1rem 0.9rem 2.5rem',
                color: 'var(--color-text-primary)', outline: 'none',
                fontSize: '1.1rem', fontWeight: 600, boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
            />
          </div>
        </div>

        {/* Pay button */}
        <button
          className="btn btn-primary"
          onClick={handlePayment}
          disabled={loading || !amount || amount < 1}
          style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          {loading ? (
            <>
              <span
                style={{
                  width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white', borderRadius: '50%',
                  display: 'inline-block', animation: 'spin 0.8s linear infinite',
                }}
              />
              Processing…
            </>
          ) : (
            <>
              <Zap size={18} />
              Pay ₹{amount || 0} with Razorpay
            </>
          )}
        </button>

        {/* Secure note */}
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '1rem', marginBottom: 0 }}>
          🔒 Secured by Razorpay · SSL encrypted · No card data stored
        </p>
      </div>

      {/* Test credentials hint */}
      <div
        style={{
          background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)',
          borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-accent)', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
          🧪 Test Mode Active
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Use card <code>4111 1111 1111 1111</code>, CVV <code>123</code>, Expiry <code>12/26</code><br />
          Or UPI ID: <code>success@razorpay</code> · No real money charged.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
