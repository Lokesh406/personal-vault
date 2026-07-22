import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import { API_URL } from '../config';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General'
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${API_URL}/api/notes`, config);
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${API_URL}/api/notes/${id}`, config);
      setNotes(notes.filter(n => n._id !== id));
      if (activeNote && activeNote._id === id) {
        setActiveNote(null);
      }
    } catch (error) {
      console.error(`Error deleting note', error);
    }
  };

  const handleEdit = (note) => {
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
    });
    setActiveNote(note);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setFormData({ title: '', content: '', category: 'General' });
    setActiveNote(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      if (activeNote) {
        // Update
        const { data } = await axios.put(`${API_URL}/api/notes/${activeNote._id}`, formData, config);
        setNotes(notes.map(n => n._id === data._id ? data : n));
      } else {
        // Create
        const { data } = await axios.post(`${API_URL}/api/notes`, formData, config);
        setNotes([...notes, data]);
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving note', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notes</h2>
          <p className="text-muted-foreground mt-2">Write and manage your rich text notes.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <FiPlus className="mr-2" /> New Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Notes List */}
        <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/50">
            <h3 className="font-semibold">All Notes</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">No notes found.</p>
            ) : (
              notes.map(note => (
                <div 
                  key={note._id}
                  onClick={() => setActiveNote(note)}
                  className={`p-4 rounded-lg cursor-pointer border transition-colors ${activeNote?._id === note._id ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-secondary'}`}
                >
                  <h4 className="font-medium truncate">{note.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {note.content?.substring(0, 50) || 'Empty note'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Note Preview */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
          {activeNote ? (
            <>
              <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/50">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-lg">{activeNote.title}</h3>
                  <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                    {activeNote.category}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(activeNote)} className="p-2 hover:bg-secondary rounded-md" title="Edit">
                    <FiEdit2 className="text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(activeNote._id)} className="p-2 hover:bg-destructive/10 rounded-md" title="Delete">
                    <FiTrash2 className="text-destructive" />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto prose dark:prose-invert max-w-none whitespace-pre-wrap">
                {activeNote.content || <span className="text-muted-foreground italic">No content</span>}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col">
              <FiEdit2 className="text-4xl mb-4 opacity-20" />
              <p>Select a note to read or create a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl border border-border shadow-xl overflow-hidden"
          >
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-bold">{activeNote ? 'Edit Note' : 'Create Note'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-secondary rounded-full">
                <FiX className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden p-6 space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
                    required
                  />
                </div>
                <div className="w-1/3">
                  <label className="text-sm font-medium">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-medium mb-1">Content (Markdown supported)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="flex-1 w-full p-4 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none font-mono text-sm resize-none"
                  placeholder="# Heading 1&#10;Write your markdown here..."
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 mr-3 hover:bg-secondary rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium"
                >
                  {activeNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Notes;
