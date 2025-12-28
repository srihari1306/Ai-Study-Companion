import { useState, useEffect } from 'react'
import { flashcardAPI } from '../../api/client'
import { Plus, CreditCard, RefreshCw, Check, X } from 'lucide-react'

export default function FlashcardDeck({ workspaceId }) {
  const [flashcards, setFlashcards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadFlashcards()
  }, [workspaceId])

  const loadFlashcards = async () => {
    try {
      const response = await flashcardAPI.getAll(workspaceId)
      setFlashcards(response.data.flashcards)
      setCurrentIndex(0)
      setFlipped(false)
    } catch (error) {
      console.error('Failed to load flashcards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await flashcardAPI.generate(workspaceId, 10)
      await loadFlashcards()
    } catch (error) {
      alert('Failed to generate flashcards. Make sure you have documents uploaded.')
    } finally {
      setGenerating(false)
    }
  }

  const handleReview = async (quality) => {
    const card = flashcards[currentIndex]
    try {
      await flashcardAPI.review(card.id, quality)
      
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setFlipped(false)
      } else {
        await loadFlashcards()
      }
    } catch (error) {
      console.error('Failed to review flashcard:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Flashcards</h2>
          <p className="text-gray-600">Study with spaced repetition</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary flex items-center gap-2"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Generate Cards
            </>
          )}
        </button>
      </div>

      {flashcards.length === 0 ? (
        <div className="card text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No flashcards yet</p>
          <button onClick={handleGenerate} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate Flashcards
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-center text-gray-600">
            Card {currentIndex + 1} of {flashcards.length}
          </div>

          <div
            onClick={() => setFlipped(!flipped)}
            className="card min-h-[400px] flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow animate-fade-in"
          >
            <div className="text-center p-8">
              {!flipped ? (
                <>
                  <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">Question</p>
                  <p className="text-2xl text-gray-900 font-medium">{currentCard.question}</p>
                  <p className="text-sm text-gray-500 mt-8">Click to reveal answer</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">Answer</p>
                  <p className="text-xl text-gray-900">{currentCard.answer}</p>
                </>
              )}
            </div>
          </div>

          {flipped && (
            <div className="mt-6 flex justify-center gap-4 animate-fade-in">
              <button
                onClick={() => handleReview(1)}
                className="btn-danger flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Hard
              </button>
              <button
                onClick={() => handleReview(3)}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Good
              </button>
              <button
                onClick={() => handleReview(5)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Easy
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}