import React from 'react';
import { Voice, Emotion, AudioQuality } from '../types';
import { EMOTIONS, AUDIO_QUALITIES } from '../constants';
import { VoiceInput } from './VoiceInput';
import { DialogueSpeaker } from '../types';

interface ControlsPanelProps {
  text: string;
  setText: (text: string) => void;
  voices: Voice[];
  selectedVoice: Voice;
  setSelectedVoice: (voice: Voice) => void;
  selectedEmotion: Emotion;
  setSelectedEmotion: (emotion: Emotion) => void;
  customStyle: string;
  setCustomStyle: (style: string) => void;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (isAdvanced: boolean) => void;
  selectedQuality: AudioQuality;
  setSelectedQuality: (quality: AudioQuality) => void;
  isLoading: boolean;
  onGenerate: () => void;
  onAnalyze: () => void;
  inputMode: 'text' | 'voice' | 'dialogue';
  setInputMode: (mode: 'text' | 'voice' | 'dialogue') => void;
  audioData: { blob: Blob; mimeType: string } | null;
  setAudioData: (data: { blob: Blob; mimeType: string } | null) => void;
  onManageVoices: () => void;
  dialogueSpeakers: DialogueSpeaker[];
  setDialogueSpeakers: (speakers: DialogueSpeaker[]) => void;
}

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const renderVoiceOptions = (voices: Voice[], customVoices: Voice[], groupedStandardVoices: Record<string, Voice[]>) => (
    <>
      {Object.keys(groupedStandardVoices).map((category) => (
        <optgroup key={category} label={category}>
          {groupedStandardVoices[category].map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </optgroup>
      ))}
      {customVoices.length > 0 && (
        <optgroup label="⭐ Custom Voices">
          {customVoices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </optgroup>
      )}
    </>
);

const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) => (
  <button
    type="button"
    className={`${
      checked ? 'bg-cyan-600' : 'bg-gray-600'
    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
  >
    <span
      aria-hidden="true"
      className={`${
        checked ? 'translate-x-5' : 'translate-x-0'
      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);


export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  text,
  setText,
  voices,
  selectedVoice,
  setSelectedVoice,
  selectedEmotion,
  setSelectedEmotion,
  customStyle,
  setCustomStyle,
  isAdvancedMode,
  setIsAdvancedMode,
  selectedQuality,
  setSelectedQuality,
  isLoading,
  onGenerate,
  onAnalyze,
  inputMode,
  setInputMode,
  audioData,
  setAudioData,
  onManageVoices,
  dialogueSpeakers,
  setDialogueSpeakers,
}) => {

  const isGenerateDisabled = isLoading || (inputMode !== 'voice' && !text.trim());
  const isAnalyzeDisabled = isLoading || !audioData;
    
  const customVoices = voices.filter(v => v.isCustom);

  const groupedStandardVoices = voices
    .filter(v => !v.isCustom)
    .reduce((acc: Record<string, Voice[]>, voice) => {
      const category = voice.category || 'Standard Voices';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(voice);
      return acc;
    }, {} as Record<string, Voice[]>);

  const renderCurrentMode = () => {
    switch (inputMode) {
      case 'voice':
        return (
          <div className="space-y-4">
            <VoiceInput setAudioData={setAudioData} disabled={isLoading} />
             <div>
                <label htmlFor="voice-clone" className="block text-sm font-medium text-gray-300 mb-2">
                  Target AI Voice
                </label>
                <select
                  id="voice-clone"
                  className="w-full bg-gray-900/70 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 appearance-none"
                  value={selectedVoice.id}
                  onChange={(e) => {
                    const voice = voices.find(v => v.id === e.target.value);
                    if (voice) setSelectedVoice(voice);
                  }}
                >
                  {renderVoiceOptions(voices, customVoices, groupedStandardVoices)}
                </select>
            </div>
          </div>
        );
      case 'dialogue':
        const handleSpeakerVoiceChange = (speakerName: string, newVoiceId: string) => {
           setDialogueSpeakers(dialogueSpeakers.map(s => s.name === speakerName ? {...s, voiceId: newVoiceId} : s));
        };
        return (
           <div className="space-y-4">
            <div>
              <label htmlFor="script-dialogue" className="block text-sm font-medium text-gray-300 mb-2">
                Dialogue Script
              </label>
              <textarea
                id="script-dialogue"
                rows={8}
                className="w-full bg-gray-900/70 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={"e.g.,\nMateus: Olá, como vai?\nClara: Estou bem, e você?"}
              />
               <p className="text-xs text-gray-500 mt-2">Format: `Speaker: Text`. One line per speaker turn.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Assign Voices to Speakers</h3>
               {dialogueSpeakers.length === 0 && text.trim().length > 0 && (
                 <p className="text-xs text-gray-400">No speakers detected. Make sure to use the `Speaker: Text` format.</p>
               )}
              {dialogueSpeakers.map(speaker => (
                  <div key={speaker.name} className="grid grid-cols-3 gap-3 items-center">
                      <label htmlFor={`speaker-${speaker.name}`} className="text-sm text-gray-300 truncate col-span-1">{speaker.name}:</label>
                      <select
                        id={`speaker-${speaker.name}`}
                        className="w-full bg-gray-900/70 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 appearance-none col-span-2"
                        value={speaker.voiceId}
                        onChange={(e) => handleSpeakerVoiceChange(speaker.name, e.target.value)}
                      >
                         {renderVoiceOptions(voices, customVoices, groupedStandardVoices)}
                      </select>
                  </div>
              ))}
            </div>
          </div>
        );
      case 'text':
      default:
        return (
          <>
            <div>
              <label htmlFor="script" className="block text-sm font-medium text-gray-300 mb-2">
                Your Script
              </label>
              <textarea
                id="script"
                rows={isAdvancedMode ? 6 : 8}
                className="w-full bg-gray-900/70 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to synthesize..."
              />
              <p className="text-xs text-gray-500 mt-2 text-right">{text.length} characters</p>
            </div>
            <div className="md:col-span-2 space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded-md">
                    <label htmlFor="advanced-mode-toggle" className="text-sm font-medium text-gray-300">
                        Advanced Scripting Mode
                    </label>
                    <ToggleSwitch checked={isAdvancedMode} onChange={setIsAdvancedMode} />
                </div>
                {isAdvancedMode && (
                <div className="p-3 bg-gray-900/70 rounded-md text-xs text-gray-400 border border-gray-700">
                    <p>Use tags for advanced control:</p>
                    <ul className="list-disc list-inside ml-2 mt-1 space-y-1 font-mono">
                    <li><code className="bg-gray-800 p-1 rounded">&lt;emphasis&gt;word&lt;/emphasis&gt;</code></li>
                    <li><code className="bg-gray-800 p-1 rounded">&lt;rate speed="fast"&gt;text&lt;/rate&gt;</code> (slow/fast)</li>
                    <li><code className="bg-gray-800 p-1 rounded">&lt;break time="1.5s" /&gt;</code> (e.g., 0.5s, 2s)</li>
                    </ul>
                </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="voice" className="block text-sm font-medium text-gray-300">
                    AI Voice Model
                  </label>
                  <button onClick={onManageVoices} className="text-xs text-cyan-400 hover:underline">
                    Manage Voices
                  </button>
                </div>
                <select
                  id="voice"
                  className="w-full bg-gray-900/70 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 appearance-none"
                  value={selectedVoice.id}
                  onChange={(e) => {
                    const voice = voices.find(v => v.id === e.target.value);
                    if (voice) setSelectedVoice(voice);
                  }}
                >
                  {renderVoiceOptions(voices, customVoices, groupedStandardVoices)}
                </select>
              </div>
              <div>
                <label htmlFor="emotion" className="block text-sm font-medium text-gray-300 mb-2">
                  Vocal Style
                </label>
                <select
                  id="emotion"
                  className="w-full bg-gray-900/70 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 appearance-none"
                  value={selectedEmotion.value}
                  onChange={(e) => {
                    const emotion = EMOTIONS.find(em => em.value === e.target.value);
                    if (emotion) setSelectedEmotion(emotion);
                  }}
                  disabled={isAdvancedMode}
                >
                  {EMOTIONS.map((emotion) => (
                    <option key={emotion.value} value={emotion.value}>
                      {emotion.name}
                    </option>
                  ))}
                </select>
              </div>
               <div>
                <label htmlFor="quality" className="block text-sm font-medium text-gray-300 mb-2">
                  Audio Quality
                </label>
                <select
                  id="quality"
                  className="w-full bg-gray-900/70 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 appearance-none"
                  value={selectedQuality.id}
                  onChange={(e) => {
                    const quality = AUDIO_QUALITIES.find(q => q.id === e.target.value);
                    if (quality) setSelectedQuality(quality);
                  }}
                >
                  {AUDIO_QUALITIES.map((quality) => (
                    <option key={quality.id} value={quality.id}>
                      {quality.name}
                    </option>
                  ))}
                </select>
              </div>
               {selectedEmotion.value === 'custom' && !isAdvancedMode && (
                 <div className="md:col-span-2">
                    <label htmlFor="custom-style" className="block text-sm font-medium text-gray-300 mb-2">
                      Custom Style Prompt
                    </label>
                    <textarea
                        id="custom-style"
                        rows={2}
                        className="w-full bg-gray-900/70 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                        value={customStyle}
                        onChange={(e) => setCustomStyle(e.target.value)}
                        placeholder="e.g., a calm, measured tone with a medium pitch"
                    />
                 </div>
               )}
            </div>
          </>
        )
    }
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 space-y-6 shadow-lg border border-gray-700">
      
      <div className="flex border-b border-gray-700">
        <button 
          onClick={() => setInputMode('text')}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${inputMode === 'text' ? 'border-b-2 border-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
          aria-pressed={inputMode === 'text'}
        >
          From Text
        </button>
         <button 
          onClick={() => setInputMode('dialogue')}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${inputMode === 'dialogue' ? 'border-b-2 border-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
          aria-pressed={inputMode === 'dialogue'}
        >
          Dialogue
        </button>
        <button 
          onClick={() => setInputMode('voice')}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${inputMode === 'voice' ? 'border-b-2 border-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
          aria-pressed={inputMode === 'voice'}
        >
          From Voice (Style)
        </button>
      </div>
      
      <div className="animate-fade-in">
        {renderCurrentMode()}
      </div>
      
      {inputMode === 'voice' ? (
         <button
            onClick={onAnalyze}
            disabled={isAnalyzeDisabled}
            className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          >
            {isLoading ? <LoadingSpinner /> : 'Analyze Voice Style'}
          </button>
      ) : (
          <button
            onClick={onGenerate}
            disabled={isGenerateDisabled}
            className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          >
            {isLoading ? <LoadingSpinner /> : 'Generate Speech'}
          </button>
      )}
    </div>
  );
};
