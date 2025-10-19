export function decodeBase64(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodePcmAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        // result is a data URL like "data:audio/webm;base64,..."
        // We only need the base64 part after the comma
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error("Failed to read blob as base64."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
};

export const getAudioBlobDuration = (blob: Blob): Promise<number> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  return blob.arrayBuffer()
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => audioBuffer.duration)
    .catch(err => {
      console.error("Audio processing failed in getAudioBlobDuration:", err);
      throw new Error("The file may be corrupt or in a format not supported by your browser.");
    });
};

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function createWavBlob(pcmData: Uint8Array): Blob {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;

  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  view.setUint32(28, byteRate, true);
  const blockAlign = numChannels * (bitsPerSample / 8);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  new Uint8Array(buffer, 44).set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}

export const createSilentAudioBuffer = (ctx: AudioContext, duration: number): AudioBuffer => {
    const sampleRate = 24000;
    const frameCount = Math.max(1, Math.floor(sampleRate * duration));
    return ctx.createBuffer(1, frameCount, sampleRate);
};

export const concatenateAudioBuffers = (buffers: AudioBuffer[], ctx: AudioContext): AudioBuffer => {
    let totalLength = 0;
    for (const buffer of buffers) {
        totalLength += buffer.length;
    }

    const result = ctx.createBuffer(1, totalLength, buffers[0]?.sampleRate || 24000);
    let offset = 0;
    for (const buffer of buffers) {
        result.getChannelData(0).set(buffer.getChannelData(0), offset);
        offset += buffer.length;
    }
    return result;
};

export function audioBufferToPcm(buffer: AudioBuffer): Uint8Array {
    const data = buffer.getChannelData(0);
    const pcm = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
        const s = Math.max(-1, Math.min(1, data[i]));
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return new Uint8Array(pcm.buffer);
}
