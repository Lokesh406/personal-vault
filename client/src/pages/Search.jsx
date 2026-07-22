import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiSearch, FiFileText, FiLink, FiFolder, FiImage, FiVideo, FiFile } from 'react-icons/fi';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState({ notes: [], projects: [], documents: [], links: [], total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setResults({ notes: [], projects: [], documents: [], links: [], total: 0 });
    }
  }, [query]);

  const performSearch = async (q) => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(q)}`, config);
      setResults(data);
    } catch (error) {
      console.error('Error searching', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return <FiImage className="text-blue-500" />;
    if (mimetype.startsWith('video/')) return <FiVideo className="text-purple-500" />;
    if (mimetype.includes('pdf')) return <FiFileText className="text-red-500" />;
    return <FiFile className="text-gray-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Search Results</h2>
        <p className="text-muted-foreground mt-2">
          {query ? `Found ${results.total} results for "${query}"` : 'Enter a search term above.'}
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground">Searching...</div>
      ) : (
        <div className="space-y-8">
          {/* Notes */}
          {results.notes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b border-border pb-2 flex items-center">
                <FiFileText className="mr-2" /> Notes ({results.notes.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.notes.map(note => (
                  <div key={note._id} className="bg-card p-4 rounded-xl border border-border shadow-sm">
                    <h4 className="font-medium truncate">{note.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{note.content}</p>
                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full mt-3 inline-block">Note</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {results.projects.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b border-border pb-2 flex items-center">
                <FiFolder className="mr-2" /> Projects ({results.projects.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.projects.map(project => (
                  <div key={project._id} className="bg-card p-4 rounded-xl border border-border shadow-sm">
                    <h4 className="font-medium truncate">{project.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full mt-3 inline-block">Project</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {results.documents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b border-border pb-2 flex items-center">
                <FiFile className="mr-2" /> Files & Documents ({results.documents.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.documents.map(doc => (
                  <a key={doc._id} href={`http://localhost:5000/${doc.path}`} className="bg-card p-4 rounded-xl border border-border shadow-sm hover:border-primary transition-colors flex items-center space-x-3">
                    <div className="text-2xl">{getDocIcon(doc.mimetype)}</div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm truncate">{doc.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.category}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {results.links.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b border-border pb-2 flex items-center">
                <FiLink className="mr-2" /> Links ({results.links.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.links.map(link => (
                  <a key={link._id} href={link.url} className="bg-card p-4 rounded-xl border border-border shadow-sm hover:border-primary transition-colors flex items-center justify-between">
                    <div className="min-w-0 pr-4">
                      <h4 className="font-medium text-sm truncate">{link.title}</h4>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{link.url}</p>
                    </div>
                    <FiLink className="text-muted-foreground flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {query && results.total === 0 && (
            <div className="p-12 text-center bg-card rounded-xl border border-border">
              <FiSearch className="text-4xl text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No results found</h3>
              <p className="text-muted-foreground mt-1">We couldn't find anything matching "{query}".</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Search;
