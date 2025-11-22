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
          whileHover={{ scale: 1.01 }}
          className={`border-4 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
            dragActive 
              ? 'border-purple-600 bg-purple-100' 
              : 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50'
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
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Upload className="mx-auto mb-4 text-purple-600" size={64} />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Drop your study materials here! 📚
            </h3>
            <p className="text-gray-600 mb-2">
              Support for PDF, DOCX files
            </p>
            <p className="text-sm text-gray-500">
              Click or drag files to upload
            </p>
          </label>
        </motion.div>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200"
        >
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="text-blue-500" size={24} />
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
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="text-blue-500 flex-shrink-0" size={24} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    disabled={uploading}
                    className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <X size={20} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="animate-spin" size={20} />
                Processing documents... (This may take a moment)
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Upload size={20} />
                Upload & Process {files.length} {files.length === 1 ? 'File' : 'Files'}
              </span>
            )}
          </motion.button>
          
          {uploading && (
            <p className="text-sm text-gray-500 text-center mt-2">
              ⏳ Please wait while we extract text, chunk content, and generate embeddings...
            </p>
          )}
        </motion.div>
      )}

      {/* Uploaded Documents History */}
      {uploadedDocs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200"
        >
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={24} />
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
                      ? 'bg-green-50 border-2 border-green-200' 
                      : 'bg-red-50 border-2 border-red-200'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {doc.status === 'success' ? (
                      <CheckCircle className="text-green-500" size={24} />
                    ) : (
                      <AlertCircle className="text-red-500" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{doc.name}</p>
                    {doc.status === 'success' ? (
                      <p className="text-sm text-green-700 mt-1">
                        ✅ Successfully processed: {doc.chunks} chunks embedded & ready for search
                      </p>
                    ) : (
                      <p className="text-sm text-red-700 mt-1">
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
          className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6"
        >
          <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle className="text-blue-600" size={20} />
            How it works
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Upload your study materials (PDFs, Word docs)</li>
            <li>We'll extract the text and break it into smart chunks</li>
            <li>Each chunk gets embedded using AI for semantic search</li>
            <li>Ask questions in the Chat tab and get answers from your documents!</li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}