import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, Loader, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function DocumentUpload({ workspaceId, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (fileList) => {
    const selectedFiles = Array.from(fileList);
    const validFiles = selectedFiles.filter(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      return ['pdf', 'docx', 'doc'].includes(extension);
    });

    if (validFiles.length !== selectedFiles.length) {
      toast.error('Some files were skipped. Only PDF and DOCX files are supported.');
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }
    
    setUploading(true);
    const uploaded = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await api.post(
          `/workspaces/${workspaceId}/upload`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );
        
        uploaded.push({
          name: file.name,
          chunks: response.data.chunks,
          status: 'success'
        });
        
        toast.success(`${file.name} processed successfully!`);
      } catch (error) {
        uploaded.push({
          name: file.name,
          status: 'error',
          error: error.response?.data?.error || 'Upload failed'
        });
        
        toast.error(`Failed to process ${file.name}`);
      }
    }

    setUploadedDocs(prev => [...prev, ...uploaded]);
    setFiles([]);
    setUploading(false);
    
    if (onUploadComplete) onUploadComplete();
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <motion.div
          whileHover={{ scale: 1.005 }}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
            dragActive 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50'
          }`}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.doc"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Upload className="mx-auto mb-4 text-slate-400" size={48} />
            </motion.div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Drop files here
            </h3>
            <p className="text-slate-600 mb-2">
              or click to browse
            </p>
            <p className="text-sm text-slate-500">
              Supports PDF, DOCX files
            </p>
          </label>
        </motion.div>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-slate-200"
        >
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
            <FileText className="text-indigo-600" size={20} />
            Selected Files ({files.length})
          </h4>
          <div className="space-y-2 mb-4">
            <AnimatePresence>
              {files.map((file, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="text-indigo-500 flex-shrink-0" size={20} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate text-sm">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    disabled={uploading}
                    className="text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-50 flex-shrink-0 ml-2"
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Processing documents...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload & Process {files.length} {files.length === 1 ? 'File' : 'Files'}
              </>
            )}
          </motion.button>
          
          {uploading && (
            <p className="text-sm text-slate-500 text-center mt-3">
              ⏳ Extracting text, chunking content, and generating embeddings...
            </p>
          )}
        </motion.div>
      )}

      {/* Uploaded Documents History */}
      {uploadedDocs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-emerald-200"
        >
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
            <CheckCircle className="text-emerald-500" size={20} />
            Processing Results
          </h4>
          <div className="space-y-3">
            <AnimatePresence>
              {uploadedDocs.map((doc, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-3 p-4 rounded-lg ${
                    doc.status === 'success' 
                      ? 'bg-emerald-50 border border-emerald-200' 
                      : 'bg-rose-50 border border-rose-200'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {doc.status === 'success' ? (
                      <CheckCircle className="text-emerald-500" size={20} />
                    ) : (
                      <AlertCircle className="text-rose-500" size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm">{doc.name}</p>
                    {doc.status === 'success' ? (
                      <p className="text-xs text-emerald-700 mt-1">
                        ✅ Successfully processed: {doc.chunks} chunks embedded & ready
                      </p>
                    ) : (
                      <p className="text-xs text-rose-700 mt-1">
                        ❌ {doc.error}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Info Box */}
      {files.length === 0 && uploadedDocs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1 text-sm">How it works</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Upload your study materials (PDFs, Word docs)</li>
                <li>• AI extracts text and creates smart chunks</li>
                <li>• Each chunk gets embedded for semantic search</li>
                <li>• Ask questions in Chat and get answers from your docs!</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}