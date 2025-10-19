import React, { useState, useRef, useCallback, useEffect } from 'react';
import { LANGUAGES, MIN_REQUIRED_DURATION_S, RECOMMENDED_DURATION_S } from '../constants';
import { getAudioBlobDuration } from '../utils/audioUtils';

interface VoiceInputProps {
  setAudioData: (data: { blob: Blob; mimeType: string } | null) => void;
  disabled: boolean;
}

const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 9.414V13H5.5z" /><path d="M9 13h2v5a1 1 0 11-2 0v-5z" /></svg>;

const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.852-1.21 3.488 0l6.363 12.176A2 2 0 0116.363 18H3.637a2 2 0 01-1.744-2.725L8.257 3.099zM10 12a1 1 0 110-2 1 1 0 010 2zm-1-3a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const VoiceInput: React.FC<VoiceInputProps> = ({ setAudioData, disabled }) => {
  const [inputType, setInputType] = useState<'record' | 'upload'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  const cleanup = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioData(null);
    setError(null);
    setWarning(null);
    setAudioDuration(null);
  };

  const validateAndSetAudio = async (blob: Blob, mimeType: string) => {
    setError(null);
    setWarning(null);
    try {
        const duration = await getAudioBlobDuration(blob);
        
        if (duration < MIN_REQUIRED_DURATION_S) {
            setError(`Audio is too short. A minimum of ${MIN_REQUIRED_DURATION_S} seconds is required. Your audio was ${Math.floor(duration)}s.`);
            setAudioData(null);
            setAudioUrl(null);
            setAudioDuration(null);
            return;
        }

        if (duration < RECOMMENDED_DURATION_S) {
            setWarning(`For best results, we recommend at least ${RECOMMENDED_DURATION_S} seconds of audio. Shorter clips (${Math.floor(duration)}s) may result in lower quality cloning.`);
        }
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioData({ blob, mimeType });
        setAudioDuration(duration);

    } catch(err) {
        console.error("Error validating audio:", err);
        const message = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to process audio. ${message} Please try a different file.`);
        setAudioData(null);
        setAudioUrl(null);
        setAudioDuration(null);
    }
  };

  const handleStartRecording = async () => {
    cleanup();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorderRef.current.onstop = () => {
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          validateAndSetAudio(audioBlob, mimeType);
          stream.getTracks().forEach(track => track.stop()); // Release microphone
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingTime(0);
        timerIntervalRef.current = window.setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);

      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Microphone access denied. Please allow microphone permissions in your browser settings.");
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    cleanup();
    const file = event.target.files?.[0];
    if (file) {
      if (!['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/x-m4a'].includes(file.type)) {
        setError("Unsupported format. Please upload .wav, .mp3, .m4a, or .webm files.");
        return;
      }
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        setError("File is too large. Please upload a file smaller than 20MB.");
        return;
      }
      validateAndSetAudio(file, file.type);
    }
  };
  
  const RecordingControls = () => (
     <div className="flex flex-col items-center space-y-3">
         {isRecording && (
            <div className="flex items-center space-x-2 text-lg font-mono text-cyan-300">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span>{formatTime(recordingTime)}</span>
            </div>
         )}
         {isRecording ? (
            <button onClick={handleStopRecording} className="w-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
            Stop Recording
            </button>
        ) : (
            <button onClick={handleStartRecording} disabled={disabled} className="w-full flex items-center justify-center bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
            Start Recording
            </button>
        )}
     </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex bg-gray-900/70 rounded-lg p-1">
        <button onClick={() => setInputType('record')} className={`w-1/2 py-2 text-sm font-medium rounded-md transition-colors ${inputType === 'record' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
          Record Audio
        </button>
        <button onClick={() => setInputType('upload')} className={`w-1/2 py-2 text-sm font-medium rounded-md transition-colors ${inputType === 'upload' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
          Upload Audio
        </button>
      </div>

      <div className="space-y-3">
        <label htmlFor="language-select" className="block text-sm font-medium text-gray-300">
            Select Language & Read Script Aloud:
        </label>
        <select 
            id="language-select"
            className="w-full bg-gray-900/70 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 appearance-none"
            value={selectedLanguage.code}
            onChange={(e) => {
                const lang = LANGUAGES.find(l => l.code === e.target.value);
                if (lang) setSelectedLanguage(lang);
            }}
        >
            {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                </option>
            ))}
        </select>
        <p className="bg-gray-900/70 border border-gray-600 rounded-md p-3 text-sm text-cyan-200/80 leading-relaxed">
            "{selectedLanguage.script}"
        </p>
      </div>

      {inputType === 'record' ? (
        <RecordingControls />
      ) : (
         <div className="space-y-3 text-center">
            <label htmlFor="audio-upload" className={`w-full flex items-center justify-center cursor-pointer ${disabled ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-500'} text-white font-bold py-2 px-4 rounded-lg transition duration-300`}>
                <UploadIcon />
                Choose File (.mp3, .wav, .m4a)
            </label>
            <input id="audio-upload" type="file" accept="audio/wav,audio/mpeg,audio/mp4,audio/x-m4a" className="hidden" onChange={handleFileUpload} disabled={disabled} />
        </div>
      )}

      {error && <p role="alert" className="text-sm text-red-400 text-center py-2">{error}</p>}
      
      {warning && !error && (
        <div role="alert" className="bg-yellow-900/30 border border-yellow-800/50 rounded-lg p-3 flex items-start space-x-3 text-sm my-2">
          <WarningIcon />
          <p className="text-yellow-300/90">{warning}</p>
        </div>
      )}

      {audioUrl && !error && (
        <div className="space-y-2 pt-2">
            <p className="text-sm font-medium text-gray-300">Input Preview (Duration: {formatTime(audioDuration || 0)}):</p>
            <audio controls src={audioUrl} className="w-full"></audio>
        </div>
      )}
    </div>
  );
};