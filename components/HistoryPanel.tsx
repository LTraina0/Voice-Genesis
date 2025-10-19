import React from 'react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onReuse: (item: HistoryItem) => void;
  onClear: () => void;
}

const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const ReuseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm10 8a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 111.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 010-2z" clipRule="evenodd" /></svg>;

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onReuse, onClear }) => {

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-white">Generation History</h3>
        {history.length > 0 && (
          <button onClick={onClear} className="text-xs text-red-400 hover:underline">
            Clear History
          </button>
        )}
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {history.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Your recent generations will appear here.
          </p>
        ) : (
          history.map((item) => (
            <div key={item.id} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 animate-fade-in">
                <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-300 break-all line-clamp-2">
                        <span className="font-semibold text-cyan-400 capitalize">{item.mode}: </span>
                        {item.text}
                    </p>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-4">{formatTimestamp(item.timestamp)}</span>
                </div>
              <div className="mt-3 flex items-center justify-between">
                <audio src={item.outputAudio.url} controls className="w-1/2 h-8" />
                <div className="flex items-center space-x-2">
                   <button
                        onClick={() => onReuse(item)}
                        className="p-2 rounded-full bg-blue-600/50 hover:bg-blue-500 text-white transition-colors"
                        title="Reuse Settings"
                    >
                        <ReuseIcon />
                    </button>
                   <a
                        href={item.outputAudio.url}
                        download={`voice-genesis-${item.id}.wav`}
                        className="p-2 block rounded-full bg-green-600/50 hover:bg-green-500 text-white transition-colors"
                        title="Download Audio"
                    >
                        <DownloadIcon />
                    </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
