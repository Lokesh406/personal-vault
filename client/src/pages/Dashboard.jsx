import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiAward, 
  FiFolder, 
  FiFileText, 
  FiImage, 
  FiUploadCloud,
  FiEdit3
} from 'react-icons/fi';
import axios from 'axios';
import { API_URL } from '../config';

const StatCard = ({ title, value, icon, delay, link }) => (
  <Link to={link}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full flex flex-col justify-center"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">{value}</h3>
        </div>
        <div className="p-3 bg-secondary rounded-lg text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {icon}
        </div>
      </div>
    </motion.div>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    documents: 0,
    images: 0,
    videos: 0,
    notes: 0,
  });
  const [quickNote, setQuickNote] = useState({ title: '', content: '' });
  const [noteStatus, setNoteStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return;
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const [projRes, docRes, noteRes] = await Promise.all([
        axios.get(`${API_URL}/api/projects`, config),
        axios.get(`${API_URL}/api/documents`, config),
        axios.get(`${API_URL}/api/notes`, config)
      ]);
      
      const docs = docRes.data;
      setStats({
        projects: projRes.data.length,
        documents: docs.filter(d => !d.mimetype.startsWith('image/') && !d.mimetype.startsWith('video/')).length,
        images: docs.filter(d => d.mimetype.startsWith('image/')).length,
        videos: docs.filter(d => d.mimetype.startsWith('video/')).length,
        notes: noteRes.data.length,
      });
    } catch (error) {
      console.error('Error fetching stats', error);
    }
  };

  const handleQuickNoteSubmit = async (e) => {
    e.preventDefault();
    if (!quickNote.title || !quickNote.content) return;
    try {
      setNoteStatus('Saving...');
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      await axios.post(`${API_URL}/api/notes`, { ...quickNote, category: 'General' }, config);
      setQuickNote({ title: '', content: '' });
      setNoteStatus('Saved successfully!');
      fetchStats();
      setTimeout(() => setNoteStatus(''), 3000);
    } catch (error) {
      console.error('Error saving note', error);
      setNoteStatus('Error saving note.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleQuickUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleQuickUpload(e.target.files[0]);
    }
  };

  const handleQuickUpload = async (file) => {
    setUploadStatus('Uploading...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.split('.')[0]);
    
    if (file.type.startsWith('image/')) formData.append('category', 'Image');
    else if (file.type.startsWith('video/')) formData.append('category', 'Video');
    else formData.append('category', 'Document');

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { 
        headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'multipart/form-data' } 
      };
      await axios.post(`${API_URL}/api/documents`, formData, config);
      setUploadStatus('Uploaded successfully!');
      fetchStats();
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Error uploading file', error);
      setUploadStatus('Upload failed.');
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
        <p className="text-muted-foreground mt-2">Welcome back! Here is a summary of your vault.</p>
      </div>

      {/* Quick Upload Actions */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="p-2 bg-primary/20 text-primary rounded-lg hidden sm:block">
            <FiUploadCloud className="text-xl" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Ready to upload files?</h4>
            <p className="text-sm text-muted-foreground">Navigate to the sections below or drag a file directly here.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <Link to="/dashboard/folders" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity whitespace-nowrap">Create Folder</Link>
          <Link to="/dashboard/documents" className="px-4 py-2 bg-secondary text-foreground text-sm font-medium rounded-md hover:bg-secondary/80 transition-colors whitespace-nowrap">Upload</Link>
        </div>
      </div>

      {/* Persistent Drag & Drop Zone */}
      <div className="mt-2">
        <label 
          className={`flex flex-col items-center justify-center w-full h-24 border-2 rounded-xl cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10 border-solid' : 'border-border border-dashed bg-card hover:bg-secondary'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <FiUploadCloud className={`w-6 h-6 mb-2 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-sm font-medium">
              {uploadStatus || (isDragging ? <span className="text-primary">Drop file here</span> : <span className="text-muted-foreground">Drag and drop any file here for a quick upload</span>)}
            </p>
          </div>
          <input type="file" className="hidden" onChange={handleFileSelect} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Projects" value={stats.projects} icon={<FiFolder className="text-xl" />} delay={0.1} link="/dashboard/projects" />
        <StatCard title="Documents & PDFs" value={stats.documents} icon={<FiFileText className="text-xl" />} delay={0.2} link="/dashboard/documents" />
        <StatCard title="Images" value={stats.images} icon={<FiImage className="text-xl" />} delay={0.3} link="/dashboard/images" />
        <StatCard title="Videos" value={stats.videos} icon={<FiAward className="text-xl" />} delay={0.4} link="/dashboard/videos" />
        <StatCard title="Notes" value={stats.notes} icon={<FiEdit3 className="text-xl" />} delay={0.5} link="/dashboard/notes" />
      </div>

      {/* Quick Note Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
        <div className="flex items-center space-x-2 mb-4">
          <FiEdit3 className="text-primary text-xl" />
          <h3 className="text-xl font-semibold">Quick Note</h3>
        </div>
        <form onSubmit={handleQuickNoteSubmit} className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Note Title" 
              value={quickNote.title}
              onChange={(e) => setQuickNote({...quickNote, title: e.target.value})}
              className="w-full px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>
          <div>
            <textarea 
              placeholder="Jot down something quickly..." 
              value={quickNote.content}
              onChange={(e) => setQuickNote({...quickNote, content: e.target.value})}
              className="w-full px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none min-h-[100px] resize-none"
              required
            ></textarea>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-500">{noteStatus}</span>
            <button 
              type="submit" 
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
