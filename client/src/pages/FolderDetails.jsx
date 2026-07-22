import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiTrash2, FiFile, FiImage, FiVideo, FiFileText, FiArrowLeft, FiDownload } from 'react-icons/fi';

const FolderDetails = () => {
  const { id } = useParams();
  const [folder, setFolder] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [uploadStep, setUploadStep] = useState(1);

  useEffect(() => {
    fetchFolderContents();
  }, [id]);

  const fetchFolderContents = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/folders/${id}`, config);
      setFolder(data.folder);
      setDocuments(data.documents);
    } catch (error) {
      console.error('Error fetching folder contents', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`http://localhost:5000/api/documents/${docId}`, config);
      setDocuments(documents.filter(d => d._id !== docId));
    } catch (error) {
      console.error('Error deleting document', error);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file to upload');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name.split('.')[0]);
    formData.append('category', category);
    formData.append('folder', id);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { 
        headers: { 
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };
      
      const { data } = await axios.post('http://localhost:5000/api/documents', formData, config);
      setDocuments([data, ...documents]);
      setShowModal(false);
      setFile(null);
      setTitle('');
      setUploadStep(1);
      setCategory('');
    } catch (error) {
      console.error('Error uploading document', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setUploadStep(2);
  };

  const getDocIcon = (mimetype) => {
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

  if (loading) return <div className="p-8">Loading folder...</div>;
  if (!folder) return <div className="p-8 text-destructive">Folder not found.</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <Link to="/dashboard/folders" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <FiArrowLeft className="mr-1" /> Back to Folders
      </Link>

      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{folder.name}</h2>
            <p className="text-muted-foreground mt-2">{folder.description || 'No description provided.'}</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setUploadStep(1); setCategory(''); }}
            className="flex-shrink-0 flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            <FiUploadCloud className="mr-2" /> Upload Item
          </button>
        </div>
      </div>

      <h3 className="text-xl font-semibold mt-8 mb-4 border-b border-border pb-2">Folder Contents</h3>

      {documents.length === 0 ? (
        <div className="bg-card p-12 text-center rounded-xl border border-border shadow-sm flex flex-col items-center">
          <FiFile className="text-6xl text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">This folder is empty</h3>
          <p className="text-muted-foreground mb-6">Upload documents, images, or videos to this folder.</p>
          <button
            onClick={() => { setShowModal(true); setUploadStep(1); setCategory(''); }}
            className="flex items-center px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            <FiUploadCloud className="mr-2" /> Upload Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {documents.map((doc) => (
            <div key={doc._id} className="bg-card rounded-xl border border-border shadow-sm flex flex-col hover:border-primary/50 transition-colors overflow-hidden group">
              {doc.mimetype.startsWith('image/') ? (
                <div className="aspect-square bg-black relative">
                  <img src={`http://localhost:5000/${doc.path}`} alt={doc.title} className="w-full h-full object-cover" />
                </div>
              ) : doc.mimetype.startsWith('video/') ? (
                <div className="aspect-square bg-black flex items-center justify-center">
                   <FiVideo className="text-5xl text-white/50" />
                </div>
              ) : (
                <div className="aspect-square bg-secondary/30 flex items-center justify-center">
                  <div className="text-5xl bg-background p-4 rounded-full shadow-sm">{getDocIcon(doc.mimetype)}</div>
                </div>
              )}
              
              <div className="p-3 flex-1 flex flex-col justify-between border-t border-border bg-card">
                <div>
                  <h4 className="font-semibold text-sm truncate" title={doc.title}>{doc.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatSize(doc.size)}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <a 
                    href={`http://localhost:5000/${doc.path}`}
                    className="text-primary text-xs hover:underline flex items-center"
                  >
                    <FiDownload className="mr-1" /> View
                  </a>
                  <button 
                    onClick={() => handleDelete(doc._id)}
                    className="text-destructive text-xs hover:bg-destructive/10 p-1 rounded transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-md p-6 rounded-xl border border-border shadow-xl transition-all">
            
            {uploadStep === 1 && (
              <div>
                <h3 className="text-xl font-bold mb-2">What are you uploading?</h3>
                <p className="text-muted-foreground text-sm mb-6">Select the type of file to organize it properly.</p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {['Document', 'Image', 'Video', 'Resume', 'Certificate'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className="flex flex-col items-center justify-center p-4 bg-secondary/50 hover:bg-primary hover:text-primary-foreground rounded-xl border border-border transition-all"
                    >
                      <div className="text-3xl mb-2">
                        {cat === 'Document' && <FiFileText />}
                        {cat === 'Image' && <FiImage />}
                        {cat === 'Video' && <FiVideo />}
                        {cat === 'Resume' && <FiFile />}
                        {cat === 'Certificate' && <FiFileText />}
                      </div>
                      <span className="font-medium text-sm">{cat}</span>
                    </button>
                  ))}
                </div>
                
                <div className="flex justify-end">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 hover:bg-secondary rounded-md">Cancel</button>
                </div>
              </div>
            )}

            {uploadStep === 2 && (
              <div>
                <div className="flex items-center mb-6">
                  <button onClick={() => setUploadStep(1)} className="mr-3 p-2 hover:bg-secondary rounded-full">
                    <FiArrowLeft />
                  </button>
                  <h3 className="text-xl font-bold">Upload {category}</h3>
                </div>
                
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select File</label>
                    <div className="mt-1 flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-input hover:bg-secondary transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FiUploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground text-center">
                            {file ? <span className="font-semibold text-foreground px-2">{file.name}</span> : <span>Click to upload file</span>}
                          </p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => setFile(e.target.files[0])} 
                          accept={
                            category === 'Image' ? 'image/*' :
                            category === 'Video' ? 'video/*' :
                            category === 'Resume' || category === 'Certificate' || category === 'Document' ? '.pdf,.doc,.docx,.txt' : '*'
                          }
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Leave blank to use filename"
                      className="w-full mt-1 px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={() => { setShowModal(false); setFile(null); setUploadStep(1); }} className="px-4 py-2 hover:bg-secondary rounded-md" disabled={uploading}>Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50" disabled={uploading || !file}>
                      {uploading ? 'Uploading...' : 'Upload Now'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FolderDetails;
