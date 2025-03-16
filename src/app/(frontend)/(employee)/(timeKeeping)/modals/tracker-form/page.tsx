import React from "react";

interface TrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  refresh: () => void;
  setMessage: string;
}

const TrackerModal: React.FC<TrackerModalProps> = ({ isOpen, onClose,setMessage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold">Attention!</h2>
        <p className="mt-2">{setMessage}</p>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackerModal;
