import { Voice, Emotion, Language, AudioQuality } from './types';

export const INITIAL_VOICES: Voice[] = [
  { id: 'Kore', name: 'Kore', description: 'A clear, standard female voice.', category: 'Standard Voices' },
  { id: 'Puck', name: 'Puck', description: 'A deep, resonant male voice.', category: 'Standard Voices' },
  { id: 'Charon', name: 'Charon', description: 'A mature, authoritative male voice.', category: 'Standard Voices' },
  { id: 'Fenrir', name: 'Fenrir', description: 'A strong, assertive female voice.', category: 'Standard Voices' },
  { id: 'Zephyr', name: 'Zephyr', description: 'A gentle, soothing female voice.', category: 'Standard Voices' },
  { id: 'br_clara', name: 'Clara', description: 'Voz feminina clara e expressiva para Português.', baseVoiceId: 'Kore', category: 'Vozes Brasileiras (PT-BR)' },
  { id: 'br_sofia', name: 'Sofia', description: 'Voz feminina forte e assertiva para Português.', baseVoiceId: 'Fenrir', category: 'Vozes Brasileiras (PT-BR)' },
  { id: 'br_laura', name: 'Laura', description: 'Voz feminina suave e calmante para Português.', baseVoiceId: 'Zephyr', category: 'Vozes Brasileiras (PT-BR)' },
  { id: 'br_mateus', name: 'Mateus', description: 'Voz masculina grave e ressonante para Português.', baseVoiceId: 'Puck', category: 'Vozes Brasileiras (PT-BR)' },
  { id: 'br_heitor', name: 'Heitor', description: 'Voz masculina madura e confiante para Português.', baseVoiceId: 'Charon', category: 'Vozes Brasileiras (PT-BR)' },
];

export const EMOTIONS: Emotion[] = [
  { name: 'Neutral', value: 'neutrally' },
  { name: 'Happy', value: 'happily' },
  { name: 'Excited', value: 'excitedly' },
  { name: 'Cheerful', value: 'cheerfully' },
  { name: 'Sad', value: 'sadly' },
  { name: 'Angry', value: 'angrily' },
  { name: 'Whispering', value: 'in a whisper' },
  { name: 'Shouting', value: 'loudly' },
  { name: 'Formal', value: 'formally' },
  { name: 'Friendly', value: 'in a friendly tone' },
  { name: 'Custom', value: 'custom' },
];

export const CUSTOM_EMOTION = EMOTIONS[EMOTIONS.length - 1];

export const AUDIO_QUALITIES: AudioQuality[] = [
  { id: 'standard', name: 'Standard', description: 'Good quality, fast generation.' },
  { id: 'high', name: 'High', description: 'Excellent quality, balanced generation time.' },
  { id: 'studio', name: 'Studio', description: 'Best possible quality, may take longer.' },
];

export const LANGUAGES: Language[] = [
    { 
        code: 'en', 
        name: 'English', 
        flag: '🇺🇸',
        script: "To create a faithful digital copy of my voice, I am reading this script with care. My tone will shift from questioning to declarative, and my pace will vary to capture a full range of expression. I understand that clear pronunciation is key, so I will enunciate each word distinctly. The quick brown fox jumps over the lazy dog, a classic sentence that tests every letter. This process fascinates me; the idea that artificial intelligence can analyze these sound waves to perfectly replicate my unique vocal signature is truly a marvel of modern technology. I hope this recording provides all the necessary data for a successful and impressive result."
    },
    { 
        code: 'pt', 
        name: 'Portuguese', 
        flag: '🇧🇷',
        script: "Para criar uma cópia digital fiel da minha voz, estou lendo este roteiro com atenção. Meu tom mudará de interrogativo para declarativo, e meu ritmo irá variar para capturar uma gama completa de expressões. Entendo que a pronúncia clara é fundamental, por isso enunciarei cada palavra distintamente. A rápida raposa marrom salta sobre o cão preguiçoso, uma frase clássica que testa cada letra. Este processo me fascina; a ideia de que a inteligência artificial pode analisar estas ondas sonoras para replicar perfeitamente minha assinatura vocal única é verdadeiramente uma maravilha da tecnologia moderna. Espero que esta gravação forneça todos os dados necessários para um resultado bem-sucedido e impressionante."
    },
    { 
        code: 'es', 
        name: 'Spanish', 
        flag: '🇪🇸',
        script: "Para crear una copia digital fiel de mi voz, estoy leyendo este guion con atención. Mi tono cambiará de interrogativo a declarativo, y mi ritmo variará para capturar una gama completa de expresiones. Entiendo que una pronunciación clara es clave, por lo que articularé cada palabra de forma distintiva. El rápido zorro marrón salta sobre el perro perezoso, una frase clásica que pone a prueba cada letra. Este proceso me fascina; la idea de que la inteligencia artificial pueda analizar estas ondas sonoras para replicar perfectamente mi firma vocal única es verdaderamente una maravilla de la tecnología moderna. Espero que esta grabación proporcione todos los datos necesarios para un resultado exitoso e impresionante."
    },
    { 
        code: 'fr', 
        name: 'French', 
        flag: '🇫🇷',
        script: "Pour créer une copie numérique fidèle de ma voix, je lis ce script avec soin. Mon ton passera de l'interrogatif au déclaratif, et mon rythme variera pour capturar une gamme complète d'expressions. Je comprends qu'une prononciation claire est essentielle, donc j'articulerai chaque mot distinctement. Le vif renard brun saute par-dessus le chien paresseux, une phrase classique qui teste chaque lettre. Ce processus me fascine ; l'idée que l'intelligence artificielle puisse analyser ces ondes sonores pour reproduire perfectly ma signature vocale unique est une véritable merveille de la technologie moderne. J'espère que cet enregistrement fournira toutes les données nécessaires pour un résultat réussi et impressionnant."
    },
    { 
        code: 'de', 
        name: 'German', 
        flag: '🇩🇪',
        script: "Um eine originalgetreue digitale Kopie meiner Stimme zu erstellen, lese ich dieses Skript sorgfältig vor. Mein Ton wird von fragend zu deklarativ wechseln und mein Tempo wird variieren, um eine ganze Bandbreite an Ausdrucksmöglichkeiten zu erfassen. Ich versteche, dass eine klare Aussprache entscheidend ist, daher werde ich jedes Wort deutlich artikulieren. Der schnelle braune Fuchs springt über den faulen Hund, ein klassischer Satz, der jeden Buchstaben testet. Dieser Prozess fasziniert mich; die Vorstellung, dass künstliche Intelligenz diese Schallwellen analysieren kann, um meine einzigartige stimmliche Signatur perfekt zu replizieren, ist wahrlich ein Wunder der modernen Technologie. Ich hoffe, diese Aufnahme liefert alle notwendigen Daten für ein erfolgreiches und beeindruckendes Ergebnis."
    },
    { 
        code: 'jp', 
        name: 'Japanese', 
        flag: '🇯🇵',
        script: "私の声を忠実にデジタルコピーするため、このスクリプトを注意深く読んでいます。私のトーンは疑問形から断定形に変わり、表現の幅を広げるためにペースも変化させます。明確な発音が鍵であることを理解しているので、各単語をはっきりと発音します。素早い茶色のキツネは怠惰な犬を飛び越える、これはすべての文字を試す古典的な文章です。このプロセスは私を魅了します。人工知能がこれらの音波を分析して私のユニークな声紋を完璧に再現できるという考えは、まさに現代技術の驚異です。この録音が、成功した素晴らしい結果を得るために必要なすべてのデータを提供することを願っています。"
    },
];

export const MIN_REQUIRED_DURATION_S = 10;
export const RECOMMENDED_DURATION_S = 30;
