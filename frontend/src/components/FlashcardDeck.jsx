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
          <Brain className="text-purple-600" size={64} />
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
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-white" size={64} />
          </div>
        </motion.div>

        <h2 className="text-4xl font-black text-gray-800">
          Great Job! 🎉
        </h2>
        <p className="text-gray-600 text-lg">
          You've reviewed all due flashcards for today
        </p>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 max-w-md mx-auto">
          <p className="text-purple-800 font-semibold mb-2">
            ✨ Come back tomorrow for more reviews
          </p>
          <p className="text-sm text-purple-600">
            Spaced repetition works best with consistent daily practice
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadDueFlashcards}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Check Again
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateFlashcards}
            disabled={generating}
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
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
          <Brain className="mx-auto text-purple-600" size={96} />
        </motion.div>
        
        <h2 className="text-3xl font-black text-gray-800">
          No flashcards due right now! 🎉
        </h2>
        <p className="text-gray-600 text-lg">
          Generate flashcards from your study materials to start learning
        </p>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 max-w-lg mx-auto">
          <h4 className="font-bold text-blue-900 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="text-blue-600" size={20} />
            How AI Flashcards Work
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 text-left list-disc list-inside">
            <li>AI reads your uploaded documents</li>
            <li>Generates smart question-answer pairs</li>
            <li>Uses SM-2 algorithm for optimal review timing</li>
            <li>Adapts to your performance (Easy/Good/Hard)</li>
            <li>Maximizes retention with spaced repetition</li>
          </ul>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateFlashcards}
          disabled={generating}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={24} />
              </motion.div>
              Generating flashcards...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Plus size={24} />
              Generate Flashcards
            </span>
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
          <h3 className="text-2xl font-bold text-gray-800">
            Card {currentIndex + 1} of {flashcards.length}
          </h3>
          <span className="text-purple-600 font-bold">
            {Math.round(progress)}% Complete
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleReview(1)}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex flex-col items-center gap-2">
            <XCircle size={28} />
            <span>Again</span>
            <span className="text-xs opacity-80">&lt; 1 day</span>
          </div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleReview(3)}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex flex-col items-center gap-2">
            <AlertCircle size={28} />
            <span>Hard</span>
            <span className="text-xs opacity-80">~3 days</span>
          </div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleReview(5)}
          className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex flex-col items-center gap-2">
            <CheckCircle size={28} />
            <span>Easy</span>
            <span className="text-xs opacity-80">~7+ days</span>
          </div>
        </motion.button>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4"
      >
        <p className="text-sm text-purple-800 text-center">
          💡 <strong>Tip:</strong> Be honest with your ratings! The SM-2 algorithm adapts to your performance for optimal learning.
        </p>
      </motion.div>
    </div>
  );
}