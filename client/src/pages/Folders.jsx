import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFolder, FiFolderPlus, FiTrash2, FiFileText } from 'react-icons/fi';

const Folders = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/folders', config);
      setFolders(data);
    } catch (error) {
      console.error('Error fetching folders', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/folders', { name, description }, config);
      setFolders([data, ...folders]);
      setShowModal(false);
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating folder', error);
      alert('Failed to create folder');
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault(); // Prevent triggering the Link
    if (!window.confirm('Are you sure you want to delete this folder? Documents inside will be detached.')) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`http://localhost:5000/api/folders/${id}`, config);
      setFolders(folders.filter(f => f._id !== id));
    } catch (error) {
      console.error('Error deleting folder', error);
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
          <h2 className="text-3xl font-bold tracking-tight">Folders</h2>
          <p className="text-muted-foreground mt-2">Organize your files into custom folders.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          <FiFolderPlus className="mr-2" /> New Folder
        </button>
      </div>

      {folders.length === 0 ? (
        <div className="bg-card p-12 text-center rounded-xl border border-border shadow-sm flex flex-col items-center">
          <FiFolder className="text-6xl text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No folders found</h3>
          <p className="text-muted-foreground">Create a folder to start organizing your items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map(folder => (
            <Link key={folder._id} to={`/dashboard/folders/${folder._id}`} className="group block">
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-lg">
                    <FiFolder className="text-2xl" />
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, folder._id)}
                    className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <h3 className="text-xl font-bold mb-1 truncate">{folder.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">
                  {folder.description || 'No description provided.'}
                </p>
                <div className="flex items-center text-xs text-muted-foreground font-medium pt-4 border-t border-border">
                  <FiFileText className="mr-1" /> {folder.itemCount || 0} items
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-md p-6 rounded-xl border border-border shadow-xl">
            <h3 className="text-xl font-bold mb-6">Create New Folder</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Folder Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Details / Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
                  placeholder="What is this folder for?"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 hover:bg-secondary rounded-md">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50" disabled={!name.trim()}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Folders;
