import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

const PersonalDetails = () => {
  const [details, setDetails] = useState({
    name: '',
    aboutMe: '',
    phone: '',
    email: '',
    address: '',
    college: '',
    degree: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get(`${API_URL}/api/personal-details`, config);
        if (data && data._id) {
          setDetails({
            name: data.name || '',
            aboutMe: data.aboutMe || '',
            phone: data.phone || '',
            email: data.email || '',
            address: data.address || '',
            college: data.college || '',
            degree: data.degree || '',
          });
        }
      } catch (error) {
        console.error('Error fetching details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, []);

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.post(`${API_URL}/api/personal-details`, details, config);
      setMessage('Details saved successfully!');
    } catch (error) {
      setMessage('Error saving details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Personal Details</h2>
        <p className="text-muted-foreground mt-2">Manage your core profile information.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              value={details.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input
              type="email"
              name="email"
              value={details.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={details.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">College / University</label>
            <input
              type="text"
              name="college"
              value={details.college}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Address</label>
            <input
              type="text"
              name="address"
              value={details.address}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">About Me</label>
            <textarea
              name="aboutMe"
              value={details.aboutMe}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none resize-none"
            ></textarea>
          </div>
        </div>

        {message && (
          <p className={`text-sm ${message.includes('Error') ? 'text-destructive' : 'text-green-500'}`}>
            {message}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Details'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default PersonalDetails;
