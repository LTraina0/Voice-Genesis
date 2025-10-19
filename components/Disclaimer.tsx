import React from 'react';

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const Disclaimer: React.FC = () => {
  return (
    <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 flex items-start space-x-3">
      <InfoIcon />
      <div>
        <h4 className="font-semibold text-blue-300">About Voice Style Transfer</h4>
        <p className="text-sm text-blue-300/80 mt-1">
          The 'From Voice' feature performs voice style transfer. When you provide an audio sample, our AI transcribes the content and analyzes its unique vocal characteristics like tone and pace. It then instructs a professional AI voice model to speak the transcribed text, mimicking the analyzed style. This creates a high-fidelity recreation of your speech's performance in a new voice. You can then edit the style prompt or save the resulting configuration as a 'Custom Voice' preset.
        </p>
      </div>
    </div>
  );
};
