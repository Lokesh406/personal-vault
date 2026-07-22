import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FiLock, FiMail, FiShield, FiUser } from 'react-icons/fi';

const Login = () => {
  const [step, setStep] = useState(1);
  const [isLogin, setIsLogin] = useState(true);
  const [secretCode, setSecretCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSecretCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/verify-code', { code: secretCode });
      if (data.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Secret Code');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/setup';
      const payload = isLogin 
        ? { email, password } 
        : { name, email, password, code: secretCode };
        
      const { data } = await axios.post(`http://localhost:5000${endpoint}`, payload);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || `Invalid ${isLogin ? 'credentials' : 'data'}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 sm:p-10 bg-card/80 backdrop-blur-xl rounded-2xl border border-border shadow-2xl z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <FiShield className="text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Personal Vault</h2>
          <p className="mt-2 text-muted-foreground">
            {step === 1 ? 'Enter your secret vault code to continue' : 'Sign in to access your vault'}
          </p>
        </div>
        
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSecretCodeSubmit} 
              className="space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-muted-foreground" />
                </div>
                <input
                  type="password"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-input text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary border border-border transition-all"
                  placeholder="Secret Code"
                  required
                />
              </div>
              
              {error && <p className="text-destructive text-sm text-center bg-destructive/10 py-2 rounded-lg">{error}</p>}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 hover:-translate-y-1 transition-all shadow-lg shadow-primary/25"
              >
                Unlock Vault
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleAuthSubmit} 
              className="space-y-6"
            >
              {!isLogin && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-input text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary border border-border transition-all"
                    placeholder="Full Name"
                    required={!isLogin}
                  />
                </div>
              )}
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-muted-foreground" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-input text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary border border-border transition-all"
                  placeholder="Email Address"
                  required
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-muted-foreground" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-input text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary border border-border transition-all"
                  placeholder="Password"
                  required
                />
              </div>
              
              {error && <p className="text-destructive text-sm text-center bg-destructive/10 py-2 rounded-lg">{error}</p>}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 hover:-translate-y-1 transition-all shadow-lg shadow-primary/25"
              >
                {isLogin ? 'Login to Vault' : 'Create Account'}
              </button>
              
              <div className="flex flex-col items-center space-y-3">
                <button 
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="text-sm font-medium text-primary hover:underline transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                </button>

                <button 
                  type="button" 
                  onClick={() => { setStep(1); setError(''); setPassword(''); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Secret Code
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;

