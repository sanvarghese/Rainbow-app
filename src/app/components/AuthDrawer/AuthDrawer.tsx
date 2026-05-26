'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

type DrawerAction = 'addToCart' | 'buyNow' | null;

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pendingAction: DrawerAction;
  onAuthSuccess: () => void;
}

const AuthDrawer: React.FC<AuthDrawerProps> = ({
  isOpen,
  onClose,
  pendingAction,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setMode('login');
      setError('');
      setLoginData({ email: '', password: '' });
      setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const actionLabel = pendingAction === 'buyNow' ? 'Buy Now' : 'Add to Cart';
  const actionIcon = pendingAction === 'buyNow' ? '⚡' : '🛒';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: loginData.email,
        password: loginData.password,
      });
      if (result?.error) throw new Error('Invalid email or password');
      onAuthSuccess(); // triggers the pending action in ProductSingle
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      // Auto login after signup
      const result = await signIn('credentials', {
        redirect: false,
        email: signupData.email,
        password: signupData.password,
      });
      if (result?.error) throw new Error('Auto-login after signup failed');
      onAuthSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 999,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: '360px',
          maxWidth: '100vw',
          background: 'white',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          animation: 'slideIn 0.25s ease',
        }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
            Sign in to continue
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid #e5e7eb', background: 'transparent',
              cursor: 'pointer', fontSize: 18, lineHeight: 1, color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>

        {/* Intent banner */}
        <div style={{
          margin: '14px 20px 0',
          padding: '10px 14px',
          background: '#fefce8',
          border: '1px solid #fde047',
          borderRadius: 8,
          fontSize: 13,
          color: '#854d0e',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>{actionIcon}</span>
          <span>{actionLabel} after login</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', margin: '14px 20px 0', borderBottom: '1px solid #e5e7eb' }}>
          {(['login', 'signup'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setMode(tab); setError(''); }}
              style={{
                flex: 1, padding: '8px 0', background: 'transparent',
                border: 'none', borderBottom: mode === tab ? '2px solid #16a34a' : '2px solid transparent',
                color: mode === tab ? '#16a34a' : '#6b7280',
                fontWeight: mode === tab ? 600 : 400,
                fontSize: 14, cursor: 'pointer', textTransform: 'capitalize',
              }}
            >
              {tab === 'login' ? 'Login' : 'Sign up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          {error && (
            <div style={{
              padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: 8, color: '#991b1b', fontSize: 13, marginBottom: 12,
            }}>
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Email">
                <input
                  type="email" required placeholder="you@example.com"
                  value={loginData.email}
                  onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                />
              </Field>
              <Field label="Password">
                <input
                  type="password" required placeholder="••••••••"
                  value={loginData.password}
                  onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                />
              </Field>
              <a href="/auth/forgot-password" style={{ fontSize: 12, color: '#16a34a', textAlign: 'right' }}>
                Forgot password?
              </a>
              <SubmitBtn loading={loading} label={`Login & ${actionLabel}`} />
              <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                Don't have an account?{' '}
                <span onClick={() => setMode('signup')} style={{ color: '#16a34a', cursor: 'pointer', fontWeight: 600 }}>
                  Sign up
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Full Name">
                <input
                  type="text" required placeholder="John Doe"
                  value={signupData.name}
                  onChange={e => setSignupData(p => ({ ...p, name: e.target.value }))}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email" required placeholder="you@example.com"
                  value={signupData.email}
                  onChange={e => setSignupData(p => ({ ...p, email: e.target.value }))}
                />
              </Field>
              <Field label="Password">
                <input
                  type="password" required placeholder="Min 6 characters"
                  value={signupData.password}
                  onChange={e => setSignupData(p => ({ ...p, password: e.target.value }))}
                />
              </Field>
              <Field label="Confirm Password">
                <input
                  type="password" required placeholder="••••••••"
                  value={signupData.confirmPassword}
                  onChange={e => setSignupData(p => ({ ...p, confirmPassword: e.target.value }))}
                />
              </Field>
              <SubmitBtn loading={loading} label={`Sign up & ${actionLabel}`} />
              <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                Already have an account?{' '}
                <span onClick={() => setMode('login')} style={{ color: '#16a34a', cursor: 'pointer', fontWeight: 600 }}>
                  Login
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

// Small helper components
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
      {label}
    </label>
    <div style={{ width: '100%' }}>
      {React.isValidElement(children) ? (
        React.cloneElement(children as React.ReactElement<any>, {
          style: {
            width: '100%',
            height: 38,
            border: '1px solid #d1d5db',
            borderRadius: 8,
            padding: '0 10px',
            fontSize: 14,
            outline: 'none',
            boxSizing: 'border-box' as const,
          },
        })
      ) : (
        children
      )}
    </div>
  </div>
);


const SubmitBtn = ({ loading, label }: { loading: boolean; label: string }) => (
  <button
    type="submit"
    disabled={loading}
    style={{
      width: '100%', height: 40, background: loading ? '#86efac' : '#16a34a',
      color: 'white', border: 'none', borderRadius: 8,
      fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}
  >
    {loading && (
      <span style={{
        width: 14, height: 14, border: '2px solid white',
        borderTopColor: 'transparent', borderRadius: '50%',
        display: 'inline-block', animation: 'spin 0.8s linear infinite',
      }} />
    )}
    {loading ? 'Please wait...' : label}
  </button>
);

export default AuthDrawer;