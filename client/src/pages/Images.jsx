import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiTrash2, FiUploadCloud, FiImage, FiDownload } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import { API_URL } from '../config';

const Images = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${API_URL}/api/documents`, config);
      setImages(data.filter(d => d.category === 'Image' || d.mimetype.startsWith('image/')));
    } catch (error) {
      console.error('Error fetching images', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${API_URL}/api/documents/${id}`, config);
      setImages(images.filter(img => img._id !== id));
    } catch (error) {
      console.error(`Error deleting image', error);
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
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        if (!title) setTitle(droppedFile.name.split('.')[0]);
      } else {
        alert('Please drop an image file');
      }
    }
  };

  const handleDownloadJPG = async (img) => {
    try {
      const response = await fetch(`${img.path.startsWith('http') ? img.path : `${API_URL}/${img.path}`}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement(`a');
      link.href = url;
      link.download = `${img.title}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image', error);
      alert('Failed to download image.');
    }
  };

  const handleDownloadPDF = async (img) => {
    try {
      const imgUrl = `${img.path.startsWith('http') ? img.path : `${API_URL}/${img.path}`}`;
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.onload = function() {
        const imgData = reader.result;
        const pdf = new jsPDF();
        pdf.addImage(imgData, `JPEG', 10, 10, 190, 0); 
        pdf.save(`${img.title}.pdf`);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error downloading PDF', error);
      alert('Failed to download PDF.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select an image to upload');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name.split('.')[0]);
    formData.append('category', 'Image');

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { 
        headers: { 
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };
      
      const { data } = await axios.post(`${API_URL}/api/documents`, formData, config);
      setImages([...images, data]);
      setShowModal(false);
      setFile(null);
      setTitle('');
    } catch (error) {
      console.error('Error uploading image', error);
      alert('Failed to upload image');
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
          <h2 className="text-3xl font-bold tracking-tight">Image Gallery</h2>
          <p className="text-muted-foreground mt-2">Your photos and screenshots.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          <FiUploadCloud className="mr-2" /> Upload Photo
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
              {isDragging ? <span className="text-primary">Drop image here</span> : <span className="text-muted-foreground">Drag and drop an image here to upload</span>}
            </p>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { 
            if (e.target.files[0]) {
              setFile(e.target.files[0]);
              if (!title) setTitle(e.target.files[0].name.split('.')[0]);
            }
            setShowModal(true); 
          }} />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="bg-card p-12 text-center rounded-xl border border-border shadow-sm flex flex-col items-center">
          <FiImage className="text-6xl text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No images found</h3>
          <p className="text-muted-foreground">Upload your first image to create your gallery.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img._id} className="relative group overflow-hidden rounded-xl border border-border bg-card shadow-sm aspect-square">
              <img 
                src={`${img.path.startsWith('http') ? img.path : `${API_URL}/${img.path}`}`} 
                alt={img.title} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h4 className="text-white font-medium truncate mb-2">{img.title}</h4>
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => { e.preventDefault(); setSelectedImage(img); }}
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs py-1.5 rounded text-center backdrop-blur-sm transition-colors"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleDelete(img._id)}
                      className="flex-1 bg-destructive/80 hover:bg-destructive text-white text-xs py-1.5 rounded text-center backdrop-blur-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => { e.preventDefault(); handleDownloadJPG(img); }}
                      className="flex-1 flex items-center justify-center bg-primary/80 hover:bg-primary text-white text-xs py-1.5 rounded backdrop-blur-sm transition-colors"
                    >
                      <FiDownload className="mr-1" /> JPG
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); handleDownloadPDF(img); }}
                      className="flex-1 flex items-center justify-center bg-blue-500/80 hover:bg-blue-500 text-white text-xs py-1.5 rounded backdrop-blur-sm transition-colors"
                    >
                      <FiDownload className="mr-1" /> PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal (similar to Documents but restricted to images) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-md p-6 rounded-xl border border-border shadow-xl">
            <h3 className="text-xl font-bold mb-6">Upload Image</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Image</label>
                <div className="mt-1 flex items-center justify-center w-full">
                  <label 
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 rounded-lg cursor-pointer transition-colors ${isDragging ? `border-primary bg-primary/10 border-solid' : 'border-border border-dashed bg-input hover:bg-secondary'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiImage className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground text-center px-4">
                        {file ? <span className="font-semibold text-foreground truncate max-w-full block">{file.name}</span> : <span>Click to upload or drag and drop image</span>}
                      </p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
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

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex justify-end mb-4">
              <button 
                className="text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <img 
              src={`${selectedImage.path.startsWith('http') ? selectedImage.path : `${API_URL}/${selectedImage.path}`}`} 
              alt={selectedImage.title} 
              className="max-w-full max-h-[80vh] object-contain rounded-md shadow-2xl"
            />
            <p className="text-white/80 mt-4 font-medium">{selectedImage.title}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Images;
