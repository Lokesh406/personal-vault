import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiTrash2, FiUploadCloud, FiVideo } from 'react-icons/fi';
import { API_URL } from '../config';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${API_URL}/api/documents`, config);
      setVideos(data.filter(d => d.category === 'Video' || d.mimetype.startsWith('video/')));
    } catch (error) {
      console.error('Error fetching videos', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${API_URL}/api/documents/${id}`, config);
      setVideos(videos.filter(vid => vid._id !== id));
    } catch (error) {
      console.error(`Error deleting video', error);
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

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        if (!title) setTitle(droppedFile.name.split('.')[0]);
      } else {
        alert('Please drop a video file');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a video to upload');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name.split('.')[0]);
    formData.append('category', 'Video');

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { 
        headers: { 
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };
      
      const { data } = await axios.post(`${API_URL}/api/documents`, formData, config);
      setVideos([...videos, data]);
      setShowModal(false);
      setFile(null);
      setTitle('');
    } catch (error) {
      console.error('Error uploading video', error);
      alert('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Video Library</h2>
          <p className="text-muted-foreground mt-2">Your private video collection.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          <FiUploadCloud className="mr-2" /> Upload Video
        </button>
      </div>

      {/* Persistent Drag & Drop Zone */}
      <div className="mt-4 mb-2">
        <label 
          className={`flex flex-col items-center justify-center w-full h-24 border-2 rounded-xl cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10 border-solid' : 'border-border border-dashed bg-card hover:bg-secondary'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
             handleDrop(e);
             setShowModal(true);
          }}
        >
          <div className="flex flex-col items-center justify-center">
            <FiUploadCloud className={`w-6 h-6 mb-2 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-sm font-medium">
              {isDragging ? <span className="text-primary">Drop video here</span> : <span className="text-muted-foreground">Drag and drop a video here to upload</span>}
            </p>
          </div>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => { 
            if (e.target.files[0]) {
              setFile(e.target.files[0]);
              if (!title) setTitle(e.target.files[0].name.split('.')[0]);
            }
            setShowModal(true); 
          }} />
        </label>
      </div>

      {videos.length === 0 ? (
        <div className="bg-card p-12 text-center rounded-xl border border-border shadow-sm flex flex-col items-center">
          <FiVideo className="text-6xl text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No videos found</h3>
          <p className="text-muted-foreground">Upload your first video.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div key={vid._id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col group">
              <div className="aspect-video bg-black relative">
                <video 
                  src={`${vid.path.startsWith('http') ? vid.path : `${API_URL}/${vid.path}`}`} 
                  controls 
                  className="w-full h-full"
                  preload="metadata"
                ></video>
              </div>
              <div className="p-4 flex justify-between items-center">
                <h4 className="font-medium truncate mr-2" title={vid.title}>{vid.title}</h4>
                <button 
                  onClick={() => handleDelete(vid._id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  title="Delete Video"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-md p-6 rounded-xl border border-border shadow-xl">
            <h3 className="text-xl font-bold mb-6">Upload Video</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Video</label>
                <div className="mt-1 flex items-center justify-center w-full">
                  <label 
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 rounded-lg cursor-pointer transition-colors ${isDragging ? `border-primary bg-primary/10 border-solid' : 'border-border border-dashed bg-input hover:bg-secondary'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiVideo className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground text-center px-4">
                        {file ? <span className="font-semibold text-foreground truncate max-w-full block">{file.name}</span> : <span>Click to upload or drag and drop video</span>}
                      </p>
                    </div>
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => {
                      if (e.target.files[0]) {
                        setFile(e.target.files[0]);
                        if (!title) setTitle(e.target.files[0].name.split('.')[0]);
                      }
                    }} />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setFile(null); }} className="px-4 py-2 hover:bg-secondary rounded-md" disabled={uploading}>Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50" disabled={uploading || !file}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Videos;
