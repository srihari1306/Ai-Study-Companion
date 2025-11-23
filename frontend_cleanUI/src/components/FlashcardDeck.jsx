import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, XCircle, AlertCircle, Sparkles, Plus, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import FlashCard from './FlashCard';

export default function FlashcardDeck({ workspaceId }) {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reviewComplete, setReviewComplete] = useState(false);

  useEffect(() => {
    loadDueFlashcards();
  }, [workspaceId]);

  const loadDueFlashcards = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/workspaces/${workspaceId}/flashcards/due`);
      setFlashcards(response.data);
      setCurrentIndex(0);
      setReviewComplete(false);
    } catch (error) {
      console.error('Failed to load flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFlashcards = async () => {
    setGenerating(true);
    try {
      const response = await api.post(`/workspaces/${workspaceId}/flashcards/generate`, {
        count: 10
      });
      toast.success(`Generated ${response.data.count} flashcards! 🎉`);
      await loadDueFlashcards();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to generate flashcards';
      toast.error(errorMsg);
      console.error('Failed to generate flashcards:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleReview = async (quality) => {
    const currentCard = flashcards[currentIndex];
    
    try {
      await api.post(`/flashcards/${currentCard.id}/review`, { quality });
      
      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setReviewComplete(true);
        toast.success('Review session complete! 🎉');
      }
    } catch (error) {
      toast.error('Failed to review flashcard');
      console.error('Failed to review flashcard:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="text-indigo-600" size={64} />
        </motion.div>
      </div>
    );
  }

  // Review Complete Screen
  if (reviewComplete) {
    return (
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-white" size={64} />
          </div>
        </motion.div>

        <h2 className="text-4xl font-bold text-slate-800">
          Great Job! 🎉
        </h2>
        <p className="text-slate-600 text-lg">
          You've reviewed all due flashcards for today
        </p>

        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200 max-w-md mx-auto">
          <p className="text-indigo-800 font-semibold mb-2">
            ✨ Come back tomorrow for more reviews
          </p>
          <p className="text-sm text-indigo-600">
            Spaced repetition works best with consistent daily practice
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadDueFlashcards}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Check Again
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateFlashcards}
            disabled={generating}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={20} />
            Generate More
          </motion.button>
        </div>
      </div>
    );
  }

  // No Flashcards Screen
  if (flashcards.length === 0) {
    return (
      <div className="text-center space-y-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Brain className="mx-auto text-indigo-600" size={96} />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-slate-800">
          No flashcards due right now! 🎉
        </h2>
        <p className="text-slate-600">
          Generate flashcards from your study materials to start learning
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-lg mx-auto">
          <div className="flex items-start gap-3">
            <Sparkles className="text-blue-600 flex-shrink-0" size={20} />
            <div className="text-left">
              <h4 className="font-semibold text-blue-900 mb-1 text-sm">How AI Flashcards Work</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• AI reads your uploaded documents</li>
                <li>• Generates smart question-answer pairs</li>
                <li>• Uses SM-2 algorithm for optimal review timing</li>
                <li>• Adapts to your performance (Easy/Good/Hard)</li>
                <li>• Maximizes retention with spaced repetition</li>
              </ul>
            </div>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateFlashcards}
          disabled={generating}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {generating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={24} />
              </motion.div>
              Generating flashcards...
            </>
          ) : (
            <>
              <Plus size={24} />
              Generate Flashcards
            </>
          )}
        </motion.button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">
            Card {currentIndex + 1} of {flashcards.length}
          </h3>
          <span className="text-indigo-600 font-bold text-sm">
            {Math.round(progress)}% Complete
          </span>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
        >
          <FlashCard flashcard={currentCard} />
        </motion.div>
      </AnimatePresence>

      {/* Review Buttons */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleReview(1)}
          className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
        >
          <div className="flex flex-col items-center gap-2">
            <XCircle size={24} />
            <span>Again</span>
            <span className="text-xs opacity-90">&lt; 1 day</span>
          </div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleReview(3)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
        >
          <div className="flex flex-col items-center gap-2">
            <AlertCircle size={24} />
            <span>Hard</span>
            <span className="text-xs opacity-90">~3 days</span>
          </div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleReview(5)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
        >
          <div className="flex flex-col items-center gap-2">
            <CheckCircle size={24} />
            <span>Easy</span>
            <span className="text-xs opacity-90">~7+ days</span>
          </div>
        </motion.button>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-indigo-50 border border-indigo-200 rounded-xl p-4"
      >
        <p className="text-sm text-indigo-800 text-center">
          💡 <strong>Tip:</strong> Be honest with your ratings! The SM-2 algorithm adapts to your performance for optimal learning.
        </p>
      </motion.div>
    </div>
  );
}