import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';

export default function FlashCard({ flashcard }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="perspective-1000 w-full h-[400px]">
      <motion.div
        className="relative w-full h-full cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front (Question) */}
        <div
          className="absolute w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <div className="text-center text-white">
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6 inline-block border border-white/30">
              <p className="text-sm font-bold">QUESTION</p>
            </div>
            
            <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-8">
              {flashcard.question}
            </p>
            
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <RotateCw size={16} />
              <span>Click to reveal answer</span>
            </div>
          </div>
        </div>

        {/* Back (Answer) */}
        <div
          className="absolute w-full h-full bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="text-center text-white">
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6 inline-block border border-white/30">
              <p className="text-sm font-bold">ANSWER</p>
            </div>
            
            <p className="text-xl md:text-2xl font-bold leading-relaxed mb-8">
              {flashcard.answer}
            </p>
            
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <RotateCw size={16} />
              <span>How well did you know this?</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CSS for perspective */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}