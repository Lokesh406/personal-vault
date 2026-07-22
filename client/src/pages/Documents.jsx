import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiFile, FiTrash2, FiDownload, FiUploadCloud, FiImage, FiVideo, FiFileText } from 'react-icons/fi';
import { API_URL } from '../config';

const Documents = ({ categoryFilter }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categoryFilter || 'Document');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${API_URL}/api/documents`, config);
      
      if (categoryFilter) {
        setDocuments(data.filter(d => d.category === categoryFilter));
      } else {
        setDocuments(data.filter(d => d.category !== 'Image' && d.category !== 'Video' && !d.mimetype.startsWith('image/') && !d.mimetype.startsWith('video/')));
      }
    } catch (error) {
      console.error('Error fetching documents', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${API_URL}/api/documents/${id}`, config);
      setDocuments(documents.filter(d => d._id !== id));
    } catch (error) {
      console.error('Error deleting document', error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) {
        setTitle(e.target.files[0].name.split('.')[0]); // Default title to filename
      }
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
      setFile(droppedFile);
      if (!title) setTitle(droppedFile.name.split('.')[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file to upload');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('category', category);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { 
        headers: { 
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };
      
      const { data } = await axios.post(`${API_URL}/api/documents`, formData, config);
      setDocuments([...documents, data]);
      setShowModal(false);
      setFile(null);
      setTitle('');
    } catch (error) {
      console.error('Error uploading document', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getIconForMimeType = (mimetype) => {
    if (mimetype.startsWith('image/')) return <FiImage className="text-blue-500" />;
    if (mimetype.startsWith('video/')) return <FiVideo className="text-purple-500" />;
    if (mimetype.includes('pdf')) return <FiFileText className="text-red-500" />;
    return <FiFile className="text-gray-500" />;
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <h2 className="text-3xl font-bold tracking-tight">{categoryFilter ? categoryFilter + 's' : 'Files & Documents'}</h2>
          <p className="text-muted-foreground mt-2">Manage your uploaded files.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          <FiUploadCloud className="mr-2" /> Upload
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
              {isDragging ? <span className="text-primary">Drop file here</span> : <span className="text-muted-foreground">Drag and drop a file here to upload</span>}
            </p>
          </div>
          <input type="file" className="hidden" onChange={(e) => { handleFileChange(e); setShowModal(true); }} />
        </label>
      </div>

      {documents.length === 0 ? (
        <div className="bg-card p-12 text-center rounded-xl border border-border shadow-sm flex flex-col items-center">
          <FiUploadCloud className="text-6xl text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No files found</h3>
          <p className="text-muted-foreground">Upload your first document to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map((doc) => (
            <div key={doc._id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col hover:border-primary/50 transition-colors group">
              <div className="p-6 flex-1 flex flex-col items-center justify-center text-center bg-secondary/30 relative">
                <div className="text-5xl mb-4 p-4 bg-background rounded-full shadow-sm">
                  {getIconForMimeType(doc.mimetype)}
                </div>
                <h4 className="font-semibold text-lg truncate w-full" title={doc.title}>{doc.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{formatSize(doc.size)}</p>
                
                {!categoryFilter && (
                   <span className="mt-3 text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                     {doc.category}
                   </span>
                )}
              </div>
              <div className="flex border-t border-border bg-card">
                <a 
                  href={`${doc.path.startsWith('http') ? doc.path : `${API_URL}/${doc.path}`}`} 
                  className="flex-1 flex justify-center items-center py-3 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                >
                  <FiDownload className="mr-2" /> <span className="text-sm font-medium">View / DL</span>
                </a>
                <div className="w-px bg-border"></div>
                <button 
                  onClick={() => handleDelete(doc._id)}
                  className="flex-1 flex justify-center items-center py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <FiTrash2 className="mr-2" /> <span className="text-sm font-medium">Delete</span>
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
            <h3 className="text-xl font-bold mb-6">Upload File</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select File</label>
                <div className="mt-1 flex items-center justify-center w-full">
                  <label 
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 rounded-lg cursor-pointer transition-colors ${isDragging ? `border-primary bg-primary/10 border-solid' : 'border-border border-dashed bg-input hover:bg-secondary'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiUploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground text-center px-4">
                        {file ? <span className="font-semibold text-foreground truncate max-w-full block">{file.name}</span> : <span>Click to upload or drag and drop</span>}
                      </p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Title / Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              {!categoryFilter && (
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="Resume">Resume</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Document">Document</option>
                    <option value="Image">Image</option>
                    <option value="Video">Video</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFile(null); }}
                  className="px-4 py-2 hover:bg-secondary rounded-md font-medium disabled:opacity-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium disabled:opacity-50 flex items-center"
                  disabled={uploading || !file}
                >
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

export default Documents;
