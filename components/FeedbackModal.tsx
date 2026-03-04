import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface FeedbackModalProps {
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // In a real app, this would send data to a backend
    console.log("Feedback Submitted:", { rating, comment });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold text-tnsu-green-800 flex items-center">
            <span className="material-icons mr-2 text-tnsu-green-600">rate_review</span>
            {t('feedback')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-icons">close</span>
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <span className="material-icons text-6xl text-green-500 mb-4 animate-bounce">check_circle</span>
            <h3 className="text-2xl font-bold text-gray-800">{t('thankYouFeedback')}</h3>
            <p className="text-gray-500 mt-2">{t('feedbackSuccessDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('rating')}</label>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('comment')}</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500"
                placeholder={t('feedbackPlaceholder')}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleSubmit}
                disabled={rating === 0}
                className={`px-6 py-2 bg-tnsu-green-600 text-white rounded-lg text-sm font-medium shadow-sm transition-all
                  ${rating === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-tnsu-green-700 hover:shadow-md'}
                `}
              >
                {t('submitFeedback')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
