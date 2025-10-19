import React from 'react';
import { Voice } from '../types';

interface ManageVoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  customVoices: Voice[];
  onDelete: (voiceId: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ImportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const ManageVoicesModal: React.FC<ManageVoicesModalProps> = ({ isOpen, onClose, customVoices, onDelete, onExport, onImport }) => {
  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        onImport(e.target.files[0]);
    }
    e.target.value = ''; // Reset input to allow re-importing the same file
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg space-y-4 border border-gray-700 shadow-xl">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Manage Custom Voices</h2>
            <button onClick={onClose} className="text-gray-400 text-2xl hover:text-white">&times;</button>
        </div>
        
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {customVoices.length > 0 ? (
            customVoices.map(voice => (
              <div key={voice.id} className="bg-gray-900/70 p-3 rounded-md flex justify-between items-center animate-fade-in">
                <div>
                    <p className="font-semibold text-white">{voice.name} <span className="text-xs text-cyan-400">(Base: {voice.baseVoiceId})</span></p>
                    {voice.createdAt && <p className="text-xs text-gray-500">Created: {new Date(voice.createdAt).toLocaleDateString()}</p>}
                </div>
                <button 
                  onClick={() => onDelete(voice.id)} 
                  className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/20 transition-colors"
                  aria-label={`Delete voice ${voice.name}`}
                >
                    <TrashIcon />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">You have not saved any custom voices yet.</p>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-700">
            <div className="flex space-x-2">
                <button
                    onClick={onExport}
                    disabled={customVoices.length === 0}
                    className="flex items-center justify-center px-4 py-2 text-sm rounded-md bg-green-700 hover:bg-green-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed transition font-semibold"
                >
                    <ExportIcon /> Export All
                </button>
                <label
                    htmlFor="import-voices"
                    className="flex items-center justify-center cursor-pointer px-4 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition font-semibold"
                >
                    <ImportIcon /> Import Voices
                    <input
                        id="import-voices"
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>
            </div>
            <button onClick={onClose} className="px-6 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition font-semibold">Done</button>
        </div>
      </div>
    </div>
  );
};