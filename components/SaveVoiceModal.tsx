import React, { useState } from 'react';

interface SaveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export const SaveVoiceModal: React.FC<SaveVoiceModalProps> = ({ isOpen, onClose, onSave }) => {
  const [voiceName, setVoiceName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (voiceName.trim()) {
      onSave(voiceName.trim());
      setVoiceName('');
    }
  };
  
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4 border border-gray-700 shadow-xl">
        <h2 className="text-xl font-bold text-white">Save Custom Voice</h2>
        <p className="text-sm text-gray-400">Give your new custom voice a name. It will appear in the 'AI Voice Model' list in the 'From Text' tab.</p>
        <div>
          <label htmlFor="voice-name" className="block text-sm font-medium text-gray-300 mb-2">Voice Name</label>
          <input
            id="voice-name"
            type="text"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full bg-gray-900/70 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500"
            placeholder="e.g., My Studio Voice"
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition">Cancel</button>
          <button onClick={handleSave} disabled={!voiceName.trim()} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white disabled:bg-gray-600 transition font-semibold">Save Voice</button>
        </div>
      </div>
    </div>
  );
};