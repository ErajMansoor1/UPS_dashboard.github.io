import React from 'react';
import { X } from 'lucide-react';

interface ReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  reason: string;
}

export const ReasonModal: React.FC<ReasonModalProps> = ({ isOpen, onClose, title, reason }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="popup-3d w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors transform hover:scale-110"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
        <div className="overflow-y-auto p-8">
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{reason}</p>
        </div>
        <div className="p-6 flex justify-end items-center border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
