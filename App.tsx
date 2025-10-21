import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ControlsPanel } from './components/ControlsPanel';
import { Header } from './components/Header';
import { AudioOutput } from './components/AudioOutput';
import { generateSpeech, transcribeAndAnalyzeAudio } from './services/geminiService';
import { Voice, Emotion, AudioQuality, HistoryItem, DialogueSpeaker, OutputAudio } from './types';
import { INITIAL_VOICES, EMOTIONS, AUDIO_QUALITIES, CUSTOM_EMOTION } from './constants';
import { Disclaimer } from './components/Disclaimer';
import { blobToBase64, createWavBlob, decodeBase64, decodePcmAudioData, concatenateAudioBuffers, createSilentAudioBuffer, audioBufferToPcm } from './utils/audioUtils';
import { SaveVoiceModal } from './components/SaveVoiceModal';
import { ManageVoicesModal } from './components/ManageVoicesModal';
import { HistoryPanel } from './components/HistoryPanel';

const CUSTOM_VOICES_KEY = 'voice-genesis-custom-voices';
const AUDIO_QUALITY_KEY = 'voice-genesis-audio-quality';
const HISTORY_KEY = 'voice-genesis-history';

export default function App(): React.ReactElement {
  const [text, setText] = useState<string>('Olá, bem-vindo ao Voice Genesis. Aqui você pode dar vida ao seu texto com uma variedade de vozes e emoções.');
  
  const [voices, setVoices] = useState<Voice[]>(() => {
    try {
      const savedVoices = localStorage.getItem(CUSTOM_VOICES_KEY);
      return savedVoices ? [...INITIAL_VOICES, ...JSON.parse(savedVoices)] : INITIAL_VOICES;
    } catch (e) {
      console.error("Failed to parse custom voices from localStorage", e);
      return INITIAL_VOICES;
    }
  });
  
  const [selectedVoice, setSelectedVoice] = useState<Voice>(voices[0]);
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion>(EMOTIONS[3]);
  const [customStyle, setCustomStyle] = useState<string>('');
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<AudioQuality>(() => {
    try {
      const savedQualityId = localStorage.getItem(AUDIO_QUALITY_KEY);
      const savedQuality = AUDIO_QUALITIES.find(q => q.id === savedQualityId);
      return savedQuality || AUDIO_QUALITIES[0];
    } catch (e) {
      console.error("Failed to parse audio quality from localStorage", e);
      return AUDIO_QUALITIES[0];
    }
  });

  const [outputAudio, setOutputAudio] = useState<OutputAudio | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'voice' | 'dialogue' | 'live'>('text');
  
  const [audioData, setAudioData] = useState<{ blob: Blob; mimeType: string; } | null>(null);
  const [inputAudioUrl, setInputAudioUrl] = useState<string | null>(null);
  const [isRecreationFlow, setIsRecreationFlow] = useState<boolean>(false);

  const [dialogueSpeakers, setDialogueSpeakers] = useState<DialogueSpeaker[]>([]);
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [isLivePreviewing, setIsLivePreviewing] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      return [];
    }
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const processedTextLength = useRef(0);
  const debounceTimer = useRef<number | null>(null);
  const nextAudioStartTime = useRef(0);
  const selectedVoiceRef = useRef(selectedVoice);
  const selectedEmotionRef = useRef(selectedEmotion);
  const customStyleRef = useRef(customStyle);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  useEffect(() => { selectedVoiceRef.current = selectedVoice; }, [selectedVoice]);
  useEffect(() => { selectedEmotionRef.current = selectedEmotion; }, [selectedEmotion]);
  useEffect(() => { customStyleRef.current = customStyle; }, [customStyle]);

  useEffect(() => {
    const customVoices = voices.filter(v => v.isCustom);
    localStorage.setItem(CUSTOM_VOICES_KEY, JSON.stringify(customVoices));
  }, [voices]);
  
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(AUDIO_QUALITY_KEY, selectedQuality.id);
  }, [selectedQuality]);

  useEffect(() => {
    if (inputMode !== 'dialogue') return;
    
    const lines = text.split('\n');
    const speakerNames = new Set<string>();
    lines.forEach(line => {
      const match = line.match(/^([^:]+):/);
      if (match && match[1].trim()) {
        speakerNames.add(match[1].trim());
      }
    });

    setDialogueSpeakers(prevSpeakers => {
      const newSpeakers: DialogueSpeaker[] = [];
      const existingSpeakerMap = new Map(prevSpeakers.map(s => [s.name, s.voiceId]));
      
      speakerNames.forEach(name => {
        newSpeakers.push({
          name: name,
          voiceId: existingSpeakerMap.get(name) || voices[0].id
        });
      });
      return newSpeakers;
    });

  }, [text, inputMode, voices]);

  useEffect(() => {
    if (audioData) {
      const url = URL.createObjectURL(audioData.blob);
      setInputAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setInputAudioUrl(null);
    }
  }, [audioData]);

  const processAndPlayChunk = useCallback(async (chunk: string, voice: Voice, emotion: Emotion, customStyle: string) => {
    if (!chunk.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
        setStatus(`Generating: "${chunk.slice(0, 20)}..."`);
        const styleToUse = emotion.value !== 'custom' ? emotion.value : customStyle || 'neutrally';
        const voiceToUse = voice.baseVoiceId || voice.id;
        
        const audioBase64 = await generateSpeech(chunk, voiceToUse, styleToUse);
        const decodedData = decodeBase64(audioBase64);
        
        const audioCtx = getAudioContext();
        const audioBuffer = await decodePcmAudioData(decodedData, audioCtx);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        
        const currentTime = audioCtx.currentTime;
        const startTime = Math.max(currentTime, nextAudioStartTime.current);
        
        source.start(startTime);
        nextAudioStartTime.current = startTime + audioBuffer.duration;

    } catch (err) {
        console.error('Error during live generation:', err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Live generation failed. ${message}`);
        setIsLivePreviewing(false);
    } finally {
        setIsLoading(false);
        setStatus(null);
    }
  }, []);

  useEffect(() => {
    if (!isLivePreviewing || inputMode !== 'live') {
      return;
    }

    if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = window.setTimeout(() => {
        const unprocessedText = text.substring(processedTextLength.current);
        if (unprocessedText.trim().length > 0) {
            processAndPlayChunk(unprocessedText, selectedVoiceRef.current, selectedEmotionRef.current, customStyleRef.current);
            processedTextLength.current = text.length;
        }
    }, 800);

  }, [text, isLivePreviewing, inputMode, processAndPlayChunk]);

  useEffect(() => {
    if (inputMode !== 'live' && isLivePreviewing) {
      setIsLivePreviewing(false);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    }
  }, [inputMode, isLivePreviewing]);

  const handleLivePreviewToggle = () => {
    setIsLivePreviewing(prev => {
        const isStarting = !prev;
        if (isStarting) {
            setError(null);
            setOutputAudio(null);
            processedTextLength.current = 0;
            const audioCtx = getAudioContext();
            nextAudioStartTime.current = audioCtx.currentTime;
            
            if (text.trim().length > 0) {
                processAndPlayChunk(text.trim(), selectedVoice, selectedEmotion, customStyle);
                processedTextLength.current = text.length;
            }
        } else {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        }
        return isStarting;
    });
  };
  
  const handleSaveLiveDraft = () => {
    if (!text.trim()) {
      setError("Cannot save an empty draft.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    const newHistoryItem: HistoryItem = {
      id: `hist_${Date.now()}`,
      timestamp: new Date().toISOString(),
      mode: 'live',
      text: text,
      voiceId: selectedVoice.id,
      emotionValue: selectedEmotion.value,
      customStyle: customStyle,
      dialogueSpeakers: [],
      isAdvanced: false,
    };
    setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
    setStatus("Draft saved to history!");
    setTimeout(() => setStatus(null), 3000);
  };

  const handleFinalizeLivePreview = () => {
    if (isLivePreviewing) {
      setIsLivePreviewing(false);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    }
    setInputMode('text');
    setTimeout(() => {
      handleGenerate();
    }, 100);
  };

  const addCustomVoice = (name: string) => {
    const newVoice: Voice = {
      id: `custom_${Date.now()}`,
      name: `${name}`,
      description: `Custom voice based on ${selectedVoice.name}.`,
      isCustom: true,
      baseVoiceId: selectedVoice.baseVoiceId || selectedVoice.id,
      createdAt: new Date().toISOString(),
    };
    setVoices(prev => [...prev, newVoice]);
    setShowSaveModal(false);
    setOutputAudio(null);
  };
  
  const deleteCustomVoice = (voiceId: string) => {
    setVoices(prev => {
        const newVoices = prev.filter(v => v.id !== voiceId);
        if (selectedVoice.id === voiceId) {
            setSelectedVoice(newVoices[0] || INITIAL_VOICES[0]);
        }
        return newVoices;
    });
  };

  const handleExportVoices = useCallback(() => {
    const customVoices = voices.filter(v => v.isCustom);
    if (customVoices.length === 0) {
        alert("No custom voices to export.");
        return;
    }
    const dataStr = JSON.stringify(customVoices, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `voice-genesis-backup-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [voices]);

  const handleImportVoices = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const text = event.target?.result;
            if (typeof text !== 'string') {
                throw new Error("Failed to read file content.");
            }
            const imported = JSON.parse(text);

            if (!Array.isArray(imported) || (imported.length > 0 && typeof imported[0].id !== 'string')) {
                throw new Error("Invalid file format. Expected an array of voice objects.");
            }
            
            const validImportedVoices: Voice[] = imported.filter(v =>
                v.id && v.name && v.isCustom
            );
            
            const currentCustomVoiceIds = new Set(voices.filter(v => v.isCustom).map(v => v.id));
            const newVoicesToAdd = validImportedVoices.filter(v => !currentCustomVoiceIds.has(v.id));

            if (newVoicesToAdd.length === 0) {
                alert("No new voices to import. All voices in the file already exist or the file is empty.");
                return;
            }

            setVoices(prev => [...prev, ...newVoicesToAdd]);
            alert(`Successfully imported ${newVoicesToAdd.length} new voice(s).`);
            setShowManageModal(false);

        } catch (e) {
            console.error("Error importing voices:", e);
            const message = e instanceof Error ? e.message : "An unknown error occurred.";
            alert(`Import failed: ${message}`);
        }
    };
    reader.onerror = () => {
         alert("Failed to read the import file.");
    };
    reader.readAsText(file);
  }, [voices]);

  const handleAnalyze = useCallback(async () => {
    if (isLoading || !audioData) return;
    
    setIsLoading(true);
    setError(null);
    setOutputAudio(null);
    setStatus('Transcribing & analyzing voice...');

    try {
        const audioBase64 = await blobToBase64(audioData.blob);
        const { transcription, vocalStyle } = await transcribeAndAnalyzeAudio(audioBase64, audioData.mimeType);
        setText(transcription);
        setSelectedEmotion(CUSTOM_EMOTION);
        setCustomStyle(vocalStyle);
        setInputMode('text');
        setIsRecreationFlow(true);
        setStatus("Analysis complete. Edit script or style, then click 'Generate Speech'.");
    } catch (err) {
        console.error('Error during analysis:', err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to analyze audio. ${message}`);
        setStatus(null);
    } finally {
        setIsLoading(false);
    }
  }, [isLoading, audioData]);
  
  const addToHistory = (output: OutputAudio) => {
    const newHistoryItem: HistoryItem = {
        id: `hist_${Date.now()}`,
        timestamp: new Date().toISOString(),
        mode: inputMode,
        text: text,
        voiceId: selectedVoice.id,
        emotionValue: selectedEmotion.value,
        customStyle: customStyle,
        dialogueSpeakers: dialogueSpeakers,
        outputAudio: output,
        isAdvanced: isAdvancedMode,
    };
    setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
  };

  const handleGenerate = useCallback(async () => {
    if (isLoading || !text.trim()) return;

    setIsLoading(true);
    setError(null);
    setOutputAudio(null);
    
    try {
        let finalAudioBuffer: AudioBuffer;
        const audioCtx = getAudioContext();

        if (inputMode === 'dialogue') {
            const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
            const speakerMap = new Map(dialogueSpeakers.map(s => [s.name, s.voiceId]));
            const generationTasks = lines.map((line, index) => async () => {
                setStatus(`Generating line ${index + 1} of ${lines.length}...`);
                const match = line.match(/^([^:]+):\s*(.*)$/);
                if (!match) return null;
                const [, speakerName, lineText] = match;
                const voiceId = speakerMap.get(speakerName);
                if (!voiceId || !lineText) return null;
                const base64 = await generateSpeech(lineText, voiceId, 'neutrally');
                const pcm = decodeBase64(base64);
                return decodePcmAudioData(pcm, audioCtx);
            });
            const buffers = (await Promise.all(generationTasks.map(t => t()))).filter((b): b is AudioBuffer => b !== null);
            if (buffers.length === 0) throw new Error("No valid dialogue lines found to generate.");
            finalAudioBuffer = concatenateAudioBuffers(buffers, audioCtx);

        } else if (inputMode === 'text' && isAdvancedMode) {
            setStatus('Parsing advanced script...');
            const segments = text.split(/(<emphasis>.*?<\/emphasis>|<rate speed="(?:fast|slow)">.*?<\/rate>|<break time="\d*\.?\d+s" \/>)/g).filter(Boolean);
            const audioSegments: AudioBuffer[] = [];

            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                setStatus(`Generating segment ${i + 1} of ${segments.length}...`);
                
                let match;
                if ((match = segment.match(/<break time="(\d*\.?\d+)s" \/>/))) {
                    const duration = parseFloat(match[1]);
                    audioSegments.push(createSilentAudioBuffer(audioCtx, duration));
                } else {
                    let segmentText = segment;
                    let style = selectedEmotion.value !== 'custom' ? selectedEmotion.value : customStyle || 'neutrally';
                    
                    if ((match = segment.match(/<emphasis>(.*?)<\/emphasis>/))) {
                        segmentText = match[1];
                        style = `with emphasis, ${style}`;
                    } else if ((match = segment.match(/<rate speed="(fast|slow)">(.*?)<\/rate>/))) {
                        segmentText = match[2];
                        style = `speaking ${match[1]}, ${style}`;
                    }
                    
                    if (segmentText.trim()) {
                        const voiceToUse = selectedVoice.baseVoiceId || selectedVoice.id;
                        const base64 = await generateSpeech(segmentText, voiceToUse, style);
                        const pcm = decodeBase64(base64);
                        audioSegments.push(await decodePcmAudioData(pcm, audioCtx));
                    }
                }
            }
            if(audioSegments.length === 0) throw new Error("Script is empty or contains only whitespace.");
            finalAudioBuffer = concatenateAudioBuffers(audioSegments, audioCtx);
        } else { // Standard text mode
            setStatus(isRecreationFlow ? 'Generating recreated voice...' : 'Generating speech...');
            let styleToUse = selectedEmotion.value !== 'custom' ? selectedEmotion.value : customStyle || 'neutrally';
            const voiceToUse = selectedVoice.baseVoiceId || selectedVoice.id;
            const audioBase64 = await generateSpeech(text, voiceToUse, styleToUse);
            const decodedData = decodeBase64(audioBase64);
            finalAudioBuffer = await decodePcmAudioData(decodedData, audioCtx);
        }

        setStatus('Finalizing audio...');
        const finalPcm = audioBufferToPcm(finalAudioBuffer);
        const blob = createWavBlob(finalPcm);
        const url = URL.createObjectURL(blob);
        const base64 = await blobToBase64(blob);

        const newOutputAudio = { base64, url, isRecreationResult: isRecreationFlow };
        setOutputAudio(newOutputAudio);
        addToHistory(newOutputAudio);
        setIsRecreationFlow(false);

    } catch (err) {
        console.error('Error during generation:', err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to generate speech. ${message}`);
    } finally {
        setIsLoading(false);
        setStatus(null);
    }
  }, [isLoading, inputMode, isAdvancedMode, text, selectedVoice, selectedEmotion, customStyle, dialogueSpeakers, isRecreationFlow]);
  
  const handleReuseHistory = useCallback((item: HistoryItem) => {
    setText(item.text);
    const voice = voices.find(v => v.id === item.voiceId) || voices[0];
    setSelectedVoice(voice);
    const emotion = EMOTIONS.find(e => e.value === item.emotionValue) || EMOTIONS[0];
    setSelectedEmotion(emotion);
    setCustomStyle(item.customStyle);
    setDialogueSpeakers(item.dialogueSpeakers || []);
    setInputMode(item.mode);
    setIsAdvancedMode(item.isAdvanced);
    setOutputAudio(item.outputAudio || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [voices]);

  useEffect(() => {
    return () => {
        if(outputAudio) URL.revokeObjectURL(outputAudio.url);
        history.forEach(h => {
          if (h.outputAudio) URL.revokeObjectURL(h.outputAudio.url)
        });
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const customVoices = voices.filter(v => v.isCustom);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ControlsPanel
            text={text}
            setText={setText}
            voices={voices}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            selectedEmotion={selectedEmotion}
            setSelectedEmotion={setSelectedEmotion}
            customStyle={customStyle}
            setCustomStyle={setCustomStyle}
            selectedQuality={selectedQuality}
            setSelectedQuality={setSelectedQuality}
            isLoading={isLoading}
            onGenerate={handleGenerate}
            onAnalyze={handleAnalyze}
            inputMode={inputMode}
            setInputMode={setInputMode}
            audioData={audioData}
            setAudioData={setAudioData}
            onManageVoices={() => setShowManageModal(true)}
            dialogueSpeakers={dialogueSpeakers}
            setDialogueSpeakers={setDialogueSpeakers}
            isAdvancedMode={isAdvancedMode}
            setIsAdvancedMode={setIsAdvancedMode}
            isLivePreviewing={isLivePreviewing}
            onLivePreviewToggle={handleLivePreviewToggle}
            onSaveLiveDraft={handleSaveLiveDraft}
            onFinalizeLivePreview={handleFinalizeLivePreview}
          />
          <div className="flex flex-col space-y-8">
            <AudioOutput
              outputAudio={outputAudio}
              inputAudioUrl={inputAudioUrl}
              isLoading={isLoading}
              error={error}
              status={status}
              onSaveClonedVoice={() => setShowSaveModal(true)}
              isLivePreviewing={isLivePreviewing}
            />
             <HistoryPanel 
                history={history} 
                onReuse={handleReuseHistory} 
                onClear={() => setHistory([])} 
             />
            <Disclaimer />
          </div>
        </main>
        <SaveVoiceModal 
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={addCustomVoice}
        />
        <ManageVoicesModal
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
          customVoices={customVoices}
          onDelete={deleteCustomVoice}
          onExport={handleExportVoices}
          onImport={handleImportVoices}
        />
      </div>
    </div>
  );
}