import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RatingInput } from './RatingComponent';

const RatingModal = ({ request, onClose, onSubmit }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    await onSubmit(data);
    setSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }} 
          className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden p-8"
        >
          <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Rate Donor: {request.donor.name}</h3>
          <p className="text-gray-400 font-bold mb-6">Your feedback helps maintain a trustworthy community.</p>
          <RatingInput onRate={handleSubmit} submitting={submitting} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RatingModal;