export interface Voice {
  id: string;
  name: string;
  description: string;
  category?: string;
  isCustom?: boolean;
  baseVoiceId?: string;
  createdAt?: string;
}

export interface Emotion {
  name: string;
  value: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
  script: string;
}

export interface AudioQuality {
  id: string;
  name: string;
  description: string;
}

export interface OutputAudio {
  base64: string;
  url: string;
  isRecreationResult: boolean;
}

export interface DialogueSpeaker {
  name: string;
  voiceId: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  mode: 'text' | 'dialogue' | 'voice';
  text: string;
  voiceId: string;
  emotionValue: string;
  customStyle: string;
  dialogueSpeakers: DialogueSpeaker[];
  outputAudio: OutputAudio;
  isAdvanced: boolean;
}
