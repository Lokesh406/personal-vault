import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const SecretCode = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/verify-code', { code });
      if (data.success) {
        localStorage.setItem('secretCodeVerified', 'true');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Secret Code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl border border-border shadow-2xl"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Welcome</h2>
          <p className="mt-2 text-muted-foreground">Enter your secret code to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border"
              placeholder="Secret Code"
              required
            />
          </div>
          
          {error && <p className="text-destructive text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default SecretCode;
