import React, { useState, useEffect, useRef } from 'react';
import { decodeBase64, decodePcmAudioData } from '../utils/audioUtils';
import { OutputAudio } from '../types';

interface AudioOutputProps {
  outputAudio: OutputAudio | null;
  inputAudioUrl: string | null;
  isLoading: boolean;
  error: string | null;
  status: string | null;
  onSaveClonedVoice: () => void;
  isLivePreviewing?: boolean;
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm3 0a1 1 0 00-1 1v6a1 1 0 102 0V5a1 1 0 00-1-1z" />
    </svg>
);

export const AudioOutput: React.FC<AudioOutputProps> = ({ outputAudio, inputAudioUrl, isLoading, error, status, onSaveClonedVoice, isLivePreviewing }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="animate-pulse font-medium">{status || 'Processing...'}</div>
          <p className="text-sm mt-2">This may take a few moments.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-400 p-4 text-center">
          <p className="font-semibold">Generation Failed</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      );
    }

    if (outputAudio) {
      if (outputAudio.isRecreationResult && inputAudioUrl) {
        return (
          <div className="w-full flex flex-col items-center space-y-6 text-center animate-fade-in">
            <p className="font-semibold text-green-400">Voice Style Recreation Complete!</p>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-300">Your Original Recording</h3>
                    <audio controls src={inputAudioUrl} className="w-full"></audio>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold text-cyan-300">AI-Powered Recreation</h3>
                    <audio controls src={outputAudio.url} className="w-full" autoPlay={false}></audio>
                </div>
            </div>
            <p className="text-sm text-gray-400">You can save this configuration as a custom voice preset for use in the 'From Text' and 'Dialogue' modes.</p>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
               <button onClick={onSaveClonedVoice} className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    <SaveIcon /> Save as Custom Voice
               </button>
               <a href={outputAudio.url} download="voice_recreation.wav" className="w-full flex items-center justify-center bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    <DownloadIcon /> Download Recreation
               </a>
            </div>
          </div>
        );
      }
      
      return (
        <div className="w-full flex flex-col items-center space-y-4 animate-fade-in">
           <div className="w-full">
            <div className="bg-gray-700 p-4 rounded-lg flex items-center justify-center">
                <audio controls src={outputAudio.url} className="w-full" autoPlay={false}>
                Your browser does not support the audio element.
                </audio>
            </div>
           </div>
           <a
             href={outputAudio.url}
             download={'generated_speech.wav'}
             className="w-full flex items-center justify-center bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
           >
            <DownloadIcon /> Download Audio
           </a>
        </div>
      );
    }

    if (isLivePreviewing) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-green-400">
          <p className="font-medium">Live Preview Active</p>
          <p className="text-sm mt-1 text-gray-400 text-center">Audio will play automatically as you type.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Your generated audio will appear here.</p>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700 min-h-[200px] flex items-center justify-center">
      {renderContent()}
    </div>
  );
};