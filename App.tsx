import { useState, useRef, useEffect } from "react";

// ─── localStorage helpers ─────────────────────────────────────────────────────
const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

// ─── Constants ───────────────────────────────────────────────────────────────
const LANGUAGES = {
  ja: { name: "日本語", flag: "🇯🇵" },
  en: { name: "English", flag: "🇺🇸" },
  zh: { name: "中文", flag: "🇨🇳" },
  ko: { name: "한국어", flag: "🇰🇷" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
};

const MEDIA_TYPES = {
  ja: ["アニメ","ドラマ","映画","曲","本","ゲーム","その他"],
  en: ["Anime","Drama","Film","Song","Book","Game","Other"],
  zh: ["动漫","剧集","电影","歌曲","书籍","游戏","其他"],
  ko: ["애니","드라마","영화","노래","책","게임","기타"],
  es: ["Anime","Drama","Película","Canción","Libro","Juego","Otro"],
  fr: ["Anime","Série","Film","Chanson","Livre","Jeu","Autre"],
};

const MOOD_TAGS = {
  ja: ["泣いた","笑った","鳥肌","刺さった","励まされた","共感した","切ない","エモい","好きすぎる","忘れられない"],
  en: ["Cried","Laughed","Chills","Hit hard","Inspired","Relatable","Bittersweet","Emotional","Love it","Unforgettable"],
  zh: ["哭了","笑了","起鸡皮疙瘩","触动心弦","受到鼓励","感同身受","惆怅","感动","太喜欢了","难以忘怀"],
  ko: ["울었어","웃었어","소름돋아","가슴에 꽂혔어","힘받았어","공감돼","애틋해","에모해","너무 좋아","잊을 수 없어"],
  es: ["Lloré","Reí","Escalofríos","Me llegó","Inspirado","Me identifiqué","Agridulce","Emotivo","Me encanta","Inolvidable"],
  fr: ["Pleuré","Ri","Chair de poule","M'a touché","Inspiré","Compris","Mélancolique","Émouvant","J'adore","Inoubliable"],
};

const MEDIA_EMOJI = {
  "アニメ":"🎌","Anime":"🎌","动漫":"🎌","애니":"🎌",
  "ドラマ":"📺","Drama":"📺","Série":"📺","剧集":"📺","드라마":"📺",
  "映画":"🎬","Film":"🎬","Película":"🎬","电影":"🎬","영화":"🎬",
  "曲":"🎵","Song":"🎵","Chanson":"🎵","歌曲":"🎵","노래":"🎵","Canción":"🎵",
  "本":"📚","Book":"📚","Livre":"📚","书籍":"📚","책":"📚","Libro":"📚",
  "ゲーム":"🎮","Game":"🎮","Jeu":"🎮","游戏":"🎮","게임":"🎮","Juego":"🎮",
};

const T = {
  ja: {
    appName:"LifeMap", tagline:"あなたのペースで、あなたの地図を描こう",
    tabChat:"学習ナビ", tabSlide:"スライド生成", tabMemory:"記憶の扉", tabHistory:"履歴",
    chatPlaceholder:"本や学びたいこと、目標を話してみて...", send:"送信",
    slideTitle:"スライドのお題", slidePlaceholder:"例: 機械学習の基礎...",
    styleLabel:"スタイル", styleBusiness:"ビジネス向け", styleCasual:"カジュアル",
    generateSlide:"スライドを生成", generating:"生成中...",
    askQuestion:"このスライドについて質問する", questionPlaceholder:"質問を入力...", askBtn:"質問する",
    memoTitle:"視点メモ", memoPlaceholder:"新しい視点や気づきをメモ...", saveMemo:"保存",
    historyEmpty:"履歴はまだありません", slideOf:"枚目", prev:"◀", next:"▶",
    darkMode:"ダーク", clearChat:"リセット",
    memoryTitle:"記憶の扉", memorySubtitle:"心に残った言葉を、ここに閉じ込めておこう",
    addMemory:"+ 記憶を追加", mediaType:"メディア種別",
    workTitle:"作品名", workTitlePh:"例：進撃の巨人、ワンピース...",
    episode:"話数・巻数", episodePh:"例：エピソード3、第12話...",
    timestamp:"時間（分:秒）", timestampPh:"例：23:14",
    quote:"心に残ったセリフ・歌詞", quotePh:"ここに言葉を...",
    situation:"シチュエーション・雰囲気", situationPh:"どんな場面だった？どんな空気感だったか...",
    impression:"感想・なぜ刺さったか", impressionPh:"このセリフが刺さったのは...",
    moodLabel:"気分タグ", customTag:"カスタムタグ（カンマ区切り）", customTagPh:"例：主人公, 友情, 別れ",
    saveMemory:"記憶を保存", memorySaved:"保存しました ✓",
    searchPh:"作品名・セリフで検索...", filterAll:"すべて",
    noMemories:"まだ記憶がありません\n心に残った言葉を保存してみよう",
    deleteConfirm:"この記憶を削除しますか？", editMemory:"編集", deleteMemory:"削除",
    aiReflect:"AIに感想を聞く", aiReflecting:"考え中...", totalMemories:"件の記憶",
    savedBadge:"💾 データは自動保存されています",
    systemPrompt:`あなたは「LifeMap」の学習ナビゲーターAIです。ユーザーは鬱療養中で、読書・学習・スキルアップで回復と成長を目指しています。優しく丁寧に、無理のない読了スケジュールやロードマップを提案し、励まし・共感を忘れずに。まず「今どんな本を持っていますか？」など優しく切り出してください。`,
  },
  en: {
    appName:"LifeMap", tagline:"Draw your own map, at your own pace",
    tabChat:"Learning Nav", tabSlide:"Slide Gen", tabMemory:"Memory Door", tabHistory:"History",
    chatPlaceholder:"Tell me about books or what you want to learn...", send:"Send",
    slideTitle:"Slide Topic", slidePlaceholder:"e.g. Machine Learning Basics...",
    styleLabel:"Style", styleBusiness:"Business", styleCasual:"Casual",
    generateSlide:"Generate Slides", generating:"Generating...",
    askQuestion:"Ask about this slide", questionPlaceholder:"Enter your question...", askBtn:"Ask",
    memoTitle:"Perspective Memo", memoPlaceholder:"Note new insights...", saveMemo:"Save",
    historyEmpty:"No history yet", slideOf:"/", prev:"◀", next:"▶",
    darkMode:"Dark", clearChat:"Reset",
    memoryTitle:"Memory Door", memorySubtitle:"Lock away the words that touched your heart",
    addMemory:"+ Add Memory", mediaType:"Media Type",
    workTitle:"Title", workTitlePh:"e.g. Attack on Titan...",
    episode:"Episode / Volume", episodePh:"e.g. Episode 3...",
    timestamp:"Timestamp (min:sec)", timestampPh:"e.g. 23:14",
    quote:"Quote / Lyric", quotePh:"The words that stayed with you...",
    situation:"Situation / Atmosphere", situationPh:"What was the scene like?",
    impression:"Why it hit you", impressionPh:"This line hit me because...",
    moodLabel:"Mood Tags", customTag:"Custom Tags (comma separated)", customTagPh:"e.g. friendship, farewell",
    saveMemory:"Save Memory", memorySaved:"Saved ✓",
    searchPh:"Search by title or quote...", filterAll:"All",
    noMemories:"No memories yet\nSave words that touched your heart",
    deleteConfirm:"Delete this memory?", editMemory:"Edit", deleteMemory:"Delete",
    aiReflect:"Ask AI for thoughts", aiReflecting:"Thinking...", totalMemories:"memories",
    savedBadge:"💾 Data is auto-saved",
    systemPrompt:`You are the Learning Navigator AI for "LifeMap". The user is recovering from depression. Gently propose achievable plans, always encourage and empathize.`,
  },
  zh: {
    appName:"LifeMap", tagline:"用自己的节奏，画自己的地图",
    tabChat:"学习导航", tabSlide:"幻灯片生成", tabMemory:"记忆之门", tabHistory:"历史",
    chatPlaceholder:"告诉我你有什么书或想学什么...", send:"发送",
    slideTitle:"幻灯片主题", slidePlaceholder:"例：机器学习基础...",
    styleLabel:"风格", styleBusiness:"商务风格", styleCasual:"休闲风格",
    generateSlide:"生成幻灯片", generating:"生成中...",
    askQuestion:"关于本幻灯片提问", questionPlaceholder:"输入您的问题...", askBtn:"提问",
    memoTitle:"观点备忘", memoPlaceholder:"记录新的见解...", saveMemo:"保存",
    historyEmpty:"暂无历史记录", slideOf:"/", prev:"◀", next:"▶",
    darkMode:"暗色", clearChat:"重置",
    memoryTitle:"记忆之门", memorySubtitle:"把触动你心灵的话语留存在这里",
    addMemory:"+ 添加记忆", mediaType:"媒体类型",
    workTitle:"作品名称", workTitlePh:"例：进击的巨人...",
    episode:"集数/卷数", episodePh:"例：第3集...",
    timestamp:"时间戳（分:秒）", timestampPh:"例：23:14",
    quote:"台词/歌词", quotePh:"让你印象深刻的话...",
    situation:"场景/氛围", situationPh:"是什么样的场景？",
    impression:"为什么触动了你", impressionPh:"这句话触动我，因为...",
    moodLabel:"心情标签", customTag:"自定义标签（逗号分隔）", customTagPh:"例：主角, 友情",
    saveMemory:"保存记忆", memorySaved:"已保存 ✓",
    searchPh:"按作品名或台词搜索...", filterAll:"全部",
    noMemories:"还没有记忆\n保存触动你心灵的话语吧",
    deleteConfirm:"确定删除？", editMemory:"编辑", deleteMemory:"删除",
    aiReflect:"让AI分享感想", aiReflecting:"思考中...", totalMemories:"条记忆",
    savedBadge:"💾 数据已自动保存",
    systemPrompt:`你是"LifeMap"的学习导航AI。用户正在从抑郁症中恢复。温柔地提供无压力的学习计划，给予鼓励与共鸣。`,
  },
  ko: {
    appName:"LifeMap", tagline:"나만의 속도로, 나만의 지도를 그려요",
    tabChat:"학습 네비", tabSlide:"슬라이드 생성", tabMemory:"기억의 문", tabHistory:"기록",
    chatPlaceholder:"가지고 있는 책이나 배우고 싶은 것을 말해봐요...", send:"전송",
    slideTitle:"슬라이드 주제", slidePlaceholder:"예: 머신러닝 기초...",
    styleLabel:"스타일", styleBusiness:"비즈니스", styleCasual:"캐주얼",
    generateSlide:"슬라이드 생성", generating:"생성 중...",
    askQuestion:"이 슬라이드에 대해 질문하기", questionPlaceholder:"질문을 입력하세요...", askBtn:"질문",
    memoTitle:"관점 메모", memoPlaceholder:"새로운 시각이나 깨달음...", saveMemo:"저장",
    historyEmpty:"아직 기록이 없습니다", slideOf:"/", prev:"◀", next:"▶",
    darkMode:"다크", clearChat:"초기화",
    memoryTitle:"기억의 문", memorySubtitle:"마음에 남은 말을 여기에 담아두자",
    addMemory:"+ 기억 추가", mediaType:"미디어 종류",
    workTitle:"작품명", workTitlePh:"예: 진격의 거인...",
    episode:"화수/권수", episodePh:"예: 에피소드 3...",
    timestamp:"타임스탬프（분:초）", timestampPh:"예: 23:14",
    quote:"마음에 남은 대사/가사", quotePh:"여기에 말을...",
    situation:"상황/분위기", situationPh:"어떤 장면이었나요?",
    impression:"왜 마음에 꽂혔는지", impressionPh:"이 대사가 마음에 꽂힌 이유는...",
    moodLabel:"감정 태그", customTag:"커스텀 태그 (쉼표 구분)", customTagPh:"예: 우정, 이별",
    saveMemory:"기억 저장", memorySaved:"저장됨 ✓",
    searchPh:"작품명·대사로 검색...", filterAll:"전체",
    noMemories:"아직 기억이 없습니다\n마음에 남은 말을 저장해보세요",
    deleteConfirm:"삭제하시겠습니까?", editMemory:"편집", deleteMemory:"삭제",
    aiReflect:"AI에게 감상 물어보기", aiReflecting:"생각 중...", totalMemories:"개의 기억",
    savedBadge:"💾 데이터가 자동 저장됩니다",
    systemPrompt:`당신은 "LifeMap" 앱의 학습 네비게이터 AI입니다. 사용자는 우울증 회복 중입니다. 부드럽게 무리 없는 학습 계획을 제안하며 격려해주세요.`,
  },
  es: {
    appName:"LifeMap", tagline:"Dibuja tu mapa, a tu propio ritmo",
    tabChat:"Nav. Aprendizaje", tabSlide:"Generar Slides", tabMemory:"Puerta Memoria", tabHistory:"Historial",
    chatPlaceholder:"Cuéntame qué libros tienes o qué quieres aprender...", send:"Enviar",
    slideTitle:"Tema del Slide", slidePlaceholder:"Ej: Bases del Machine Learning...",
    styleLabel:"Estilo", styleBusiness:"Profesional", styleCasual:"Casual",
    generateSlide:"Generar Slides", generating:"Generando...",
    askQuestion:"Preguntar sobre este slide", questionPlaceholder:"Escribe tu pregunta...", askBtn:"Preguntar",
    memoTitle:"Memo de Perspectivas", memoPlaceholder:"Anota nuevas perspectivas...", saveMemo:"Guardar",
    historyEmpty:"Sin historial aún", slideOf:"/", prev:"◀", next:"▶",
    darkMode:"Oscuro", clearChat:"Reiniciar",
    memoryTitle:"Puerta Memoria", memorySubtitle:"Guarda las palabras que tocaron tu corazón",
    addMemory:"+ Añadir Memoria", mediaType:"Tipo de Media",
    workTitle:"Título", workTitlePh:"Ej: Attack on Titan...",
    episode:"Episodio / Volumen", episodePh:"Ej: Episodio 3...",
    timestamp:"Tiempo (min:seg)", timestampPh:"Ej: 23:14",
    quote:"Cita / Letra", quotePh:"Las palabras que se quedaron contigo...",
    situation:"Situación / Atmósfera", situationPh:"¿Cómo era la escena?",
    impression:"Por qué te llegó", impressionPh:"Esta frase me llegó porque...",
    moodLabel:"Etiquetas de Humor", customTag:"Etiquetas personalizadas (comas)", customTagPh:"Ej: amistad, despedida",
    saveMemory:"Guardar Memoria", memorySaved:"Guardado ✓",
    searchPh:"Buscar por título o cita...", filterAll:"Todos",
    noMemories:"Sin memorias aún\nGuarda palabras que tocaron tu corazón",
    deleteConfirm:"¿Eliminar esto?", editMemory:"Editar", deleteMemory:"Eliminar",
    aiReflect:"Pedir opinión a IA", aiReflecting:"Pensando...", totalMemories:"memorias",
    savedBadge:"💾 Datos guardados automáticamente",
    systemPrompt:`Eres el AI Navegador de "LifeMap". El usuario se recupera de depresión. Propón planes alcanzables y muestra empatía siempre.`,
  },
  fr: {
    appName:"LifeMap", tagline:"Dessine ta carte, à ton propre rythme",
    tabChat:"Nav. Apprentissage", tabSlide:"Générer Slides", tabMemory:"Porte Mémoire", tabHistory:"Historique",
    chatPlaceholder:"Dis-moi quels livres tu as ou ce que tu veux apprendre...", send:"Envoyer",
    slideTitle:"Sujet du Slide", slidePlaceholder:"Ex: Bases du Machine Learning...",
    styleLabel:"Style", styleBusiness:"Professionnel", styleCasual:"Décontracté",
    generateSlide:"Générer les Slides", generating:"Génération...",
    askQuestion:"Poser une question sur ce slide", questionPlaceholder:"Entrez votre question...", askBtn:"Demander",
    memoTitle:"Mémo de Perspectives", memoPlaceholder:"Notez de nouvelles perspectives...", saveMemo:"Sauvegarder",
    historyEmpty:"Pas encore d'historique", slideOf:"/", prev:"◀", next:"▶",
    darkMode:"Sombre", clearChat:"Réinitialiser",
    memoryTitle:"Porte Mémoire", memorySubtitle:"Gardez les mots qui ont touché votre cœur",
    addMemory:"+ Ajouter Souvenir", mediaType:"Type de Média",
    workTitle:"Titre", workTitlePh:"Ex: L'Attaque des Titans...",
    episode:"Épisode / Volume", episodePh:"Ex: Épisode 3...",
    timestamp:"Horodatage (min:sec)", timestampPh:"Ex: 23:14",
    quote:"Citation / Paroles", quotePh:"Les mots qui sont restés avec vous...",
    situation:"Situation / Atmosphère", situationPh:"Quelle était la scène ?",
    impression:"Pourquoi ça vous a touché", impressionPh:"Cette réplique m'a touché parce que...",
    moodLabel:"Tags d'humeur", customTag:"Tags personnalisés (virgules)", customTagPh:"Ex: amitié, adieux",
    saveMemory:"Sauvegarder", memorySaved:"Sauvegardé ✓",
    searchPh:"Rechercher par titre ou citation...", filterAll:"Tous",
    noMemories:"Pas encore de souvenirs\nSauvegardez les mots qui vous ont touché",
    deleteConfirm:"Supprimer ?", editMemory:"Modifier", deleteMemory:"Supprimer",
    aiReflect:"Demander l'avis de l'IA", aiReflecting:"Réflexion...", totalMemories:"souvenirs",
    savedBadge:"💾 Données sauvegardées automatiquement",
    systemPrompt:`Tu es l'IA Navigateur de "LifeMap". L'utilisateur se remet d'une dépression. Propose des plans réalistes et encourage-le toujours.`,
  },
};

const callClaude = async (messages, sys) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:sys, messages }),
  });
  const d = await res.json();
  return d.content.filter(b=>b.type==="text").map(b=>b.text).join("\n");
};

const emptyForm = () => ({
  mediaType:"", workTitle:"", episode:"", timestamp:"", quote:"",
  situation:"", impression:"", moodTags:[], customTags:"", id:null,
});

export default function App() {
  const [lang, setLang]           = useState(() => load("lm_lang","ja"));
  const [dark, setDark]           = useState(() => load("lm_dark",true));
  const [tab, setTab]             = useState("chat");
  const [messages, setMessages]   = useState(() => load("lm_messages",[]));
  const [input, setInput]         = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [slideTopic, setSlideTopic]   = useState("");
  const [slideStyle, setSlideStyle]   = useState("casual");
  const [slides, setSlides]           = useState([]);
  const [slideIdx, setSlideIdx]       = useState(0);
  const [slideLoading, setSlideLoading] = useState(false);
  const [qaInput, setQaInput]         = useState("");
  const [qaAnswer, setQaAnswer]       = useState("");
  const [qaLoading, setQaLoading]     = useState(false);
  const [memo, setMemo]               = useState("");
  const [memos, setMemos]             = useState(() => load("lm_memos",[]));
  const [slideHistory, setSlideHistory] = useState(() => load("lm_slide_history",[]));

  const [memories, setMemories]       = useState(() => load("lm_memories",[]));
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(emptyForm());
  const [savedAnim, setSavedAnim]     = useState(false);
  const [memSearch, setMemSearch]     = useState("");
  const [memFilter, setMemFilter]     = useState("all");
  const [expandedId, setExpandedId]   = useState(null);
  const [aiRefl, setAiRefl]           = useState({});
  const [aiReflLoading, setAiReflLoading] = useState(null);

  const t = T[lang];
  const mediaTypes = MEDIA_TYPES[lang];
  const moodList   = MOOD_TAGS[lang];

  // ── persist to localStorage ──
  useEffect(()=>save("lm_lang",lang),[lang]);
  useEffect(()=>save("lm_dark",dark),[dark]);
  useEffect(()=>save("lm_messages",messages),[messages]);
  useEffect(()=>save("lm_memories",memories),[memories]);
  useEffect(()=>save("lm_memos",memos),[memos]);
  useEffect(()=>save("lm_slide_history",slideHistory),[slideHistory]);

  // Theme
  const bg     = dark?"#080810":"#f5f0e8";
  const surf   = dark?"#10101c":"#ffffff";
  const surf2  = dark?"#17172a":"#f0ebe0";
  const border = dark?"#2a2a45":"#ddd5c0";
  const text   = dark?"#e8e4ff":"#1a1520";
  const sub    = dark?"#6868a0":"#80705a";
  const gold   = "#c8a96e";
  const blue   = dark?"#7e8ec8":"#4a6fa5";
  const rose   = "#c86e8e";
  const green  = "#5ec88a";
  const purple = "#a96ec8";
  const cardAccents = [gold,blue,rose,green,purple,"#c8956e","#6ec8c8"];

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);
  useEffect(()=>{ if(messages.length===0) initChat(); },[lang]);

  const initChat = async () => {
    setChatLoading(true); setMessages([]);
    try {
      const r = await callClaude([{role:"user",content:"こんにちは"}],t.systemPrompt);
      setMessages([{role:"assistant",content:r}]);
    } catch { setMessages([{role:"assistant",content:"こんにちは！何を学びたいですか？"}]); }
    setChatLoading(false);
  };

  const sendChat = async () => {
    if(!input.trim()||chatLoading) return;
    const nm = [...messages,{role:"user",content:input}];
    setMessages(nm); setInput(""); setChatLoading(true);
    try {
      const r = await callClaude(nm,t.systemPrompt);
      setMessages([...nm,{role:"assistant",content:r}]);
    } catch { setMessages([...nm,{role:"assistant",content:"エラーが発生しました。"}]); }
    setChatLoading(false);
  };

  const generateSlides = async () => {
    if(!slideTopic.trim()||slideLoading) return;
    setSlideLoading(true); setSlides([]); setQaAnswer("");
    const p = `Generate exactly 10 slides about: "${slideTopic}". Style: ${slideStyle==="business"?t.styleBusiness:t.styleCasual}. Respond ONLY with a valid JSON array, no markdown. Each element: {"title":"...","content":"bullet points separated by \\n","emoji":"...","evidence":"one key fact"}`;
    try {
      const raw = await callClaude([{role:"user",content:p}],"You are a JSON-only slide generator. Output only valid JSON array, no markdown.");
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setSlides(parsed); setSlideIdx(0);
      setSlideHistory(h=>{
        const nh = [{topic:slideTopic,slides:parsed,date:new Date().toLocaleDateString(lang)},...h].slice(0,20);
        return nh;
      });
    } catch { setSlides([{title:"Error",content:"Could not generate. Try again.",emoji:"⚠️",evidence:""}]); }
    setSlideLoading(false);
  };

  const askQA = async () => {
    if(!qaInput.trim()||!slides.length||qaLoading) return;
    setQaLoading(true);
    const s = slides[slideIdx];
    try {
      const r = await callClaude([{role:"user",content:qaInput}],`Answer concisely about slide "${s.title}": ${s.content}`);
      setQaAnswer(r);
    } catch { setQaAnswer("Error."); }
    setQaLoading(false);
  };

  useEffect(()=>{
    const h = e => {
      if(tab!=="slide"||!slides.length) return;
      if(e.key==="ArrowRight") setSlideIdx(i=>Math.min(i+1,slides.length-1));
      if(e.key==="ArrowLeft")  setSlideIdx(i=>Math.max(i-1,0));
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[tab,slides]);

  const toggleMood = tag => setForm(f=>({...f,moodTags:f.moodTags.includes(tag)?f.moodTags.filter(x=>x!==tag):[...f.moodTags,tag]}));

  const saveMemory = () => {
    if(!form.workTitle.trim()&&!form.quote.trim()) return;
    const entry = {
      ...form,
      id: form.id??Date.now(),
      customTagsArr: form.customTags.split(",").map(s=>s.trim()).filter(Boolean),
      savedAt: new Date().toLocaleString(lang),
      mediaLabel: form.mediaType||(mediaTypes[mediaTypes.length-1]),
    };
    setMemories(prev=>form.id?prev.map(m=>m.id===form.id?entry:m):[entry,...prev]);
    setSavedAnim(true);
    setTimeout(()=>{setSavedAnim(false);setShowForm(false);setForm(emptyForm());},1200);
  };

  const getAiRefl = async mem => {
    setAiReflLoading(mem.id);
    const langName={ja:"Japanese",en:"English",zh:"Chinese",ko:"Korean",es:"Spanish",fr:"French"}[lang];
    const p=`A user saved this memory from ${mem.mediaLabel} "${mem.workTitle}"${mem.episode?` (${mem.episode})`:""}${mem.timestamp?` at ${mem.timestamp}`:""}.
Quote: "${mem.quote}"
Situation: "${mem.situation}"
Why it resonated: "${mem.impression}"
Mood: ${mem.moodTags.join(", ")}
Write a warm reflection under 120 words on why this is memorable. Respond in ${langName}.`;
    try {
      const r = await callClaude([{role:"user",content:p}],"You are a thoughtful literary and emotional companion.");
      setAiRefl(prev=>({...prev,[mem.id]:r}));
    } catch { setAiRefl(prev=>({...prev,[mem.id]:"Error."})); }
    setAiReflLoading(null);
  };

  const filteredMemories = memories.filter(m=>{
    const typeOk = memFilter==="all"||m.mediaLabel===memFilter;
    const q = memSearch.toLowerCase();
    const searchOk = !q||m.workTitle?.toLowerCase().includes(q)||m.quote?.toLowerCase().includes(q)||m.impression?.toLowerCase().includes(q);
    return typeOk&&searchOk;
  });

  const slColors=[gold,blue,rose,green,purple,"#c8956e","#6ec8c8","#c8c86e","#8ec86e","#c86e6e"];
  const sc=slides.length?slColors[slideIdx%slColors.length]:gold;

  const S={
    app:{minHeight:"100vh",background:bg,color:text,fontFamily:"'Noto Sans JP','Segoe UI',sans-serif",display:"flex",flexDirection:"column",transition:"background .3s,color .3s"},
    hdr:{padding:"12px 18px",borderBottom:`1px solid ${border}`,display:"flex",alignItems:"center",gap:10,background:surf,position:"sticky",top:0,zIndex:200,flexWrap:"wrap"},
    logo:{fontSize:19,fontWeight:900,letterSpacing:"-0.04em",color:gold},
    tabs:{display:"flex",gap:3,marginLeft:"auto",alignItems:"center",flexWrap:"wrap"},
    tb:(a)=>({padding:"5px 11px",borderRadius:20,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,background:a?gold:"transparent",color:a?"#1a1200":sub,transition:"all .2s",whiteSpace:"nowrap"}),
    ls:{padding:"4px 6px",borderRadius:10,border:`1px solid ${border}`,background:surf2,color:text,fontSize:10,cursor:"pointer"},
    dk:{padding:"4px 8px",borderRadius:10,border:`1px solid ${border}`,background:"transparent",color:sub,fontSize:10,cursor:"pointer"},
    main:{flex:1,display:"flex",flexDirection:"column",maxWidth:860,width:"100%",margin:"0 auto",padding:"0 16px",boxSizing:"border-box"},
    badge:{textAlign:"center",fontSize:10,color:sub,padding:"6px 0 0",opacity:.6},
    chatArea:{flex:1,overflowY:"auto",padding:"16px 0",display:"flex",flexDirection:"column",gap:10,minHeight:260,maxHeight:"60vh"},
    bub:(r)=>({display:"flex",justifyContent:r==="user"?"flex-end":"flex-start"}),
    msg:(r)=>({maxWidth:"76%",padding:"10px 14px",borderRadius:r==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:r==="user"?gold:surf2,color:r==="user"?"#1a1200":text,fontSize:14,lineHeight:1.75,whiteSpace:"pre-wrap",boxShadow:"0 2px 8px rgba(0,0,0,.18)"}),
    irow:{display:"flex",gap:8,padding:"10px 0 14px",borderTop:`1px solid ${border}`},
    ibox:{flex:1,padding:"9px 13px",borderRadius:24,border:`1px solid ${border}`,background:surf2,color:text,fontSize:14,outline:"none",fontFamily:"inherit"},
    sbtn:{padding:"9px 16px",borderRadius:24,border:"none",background:gold,color:"#1a1200",fontWeight:800,cursor:"pointer",fontSize:13},
    lbl:{fontSize:10,color:sub,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",marginBottom:5},
    ti:{padding:"8px 13px",borderRadius:10,border:`1px solid ${border}`,background:surf2,color:text,fontSize:13,outline:"none",fontFamily:"inherit",width:"100%"},
    gbtn:{padding:"11px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${gold},${blue})`,color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer"},
    dot:(i)=>({width:6,height:6,borderRadius:"50%",background:sub,animation:`bounce 1.2s ${i*.2}s infinite`}),
    typing:{display:"flex",gap:4,padding:"10px 14px",background:surf2,borderRadius:"18px 18px 18px 4px",width:"fit-content"},
  };

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#444;border-radius:2px}
        .fi{animation:fadeIn .3s ease}.pi{animation:popIn .25s cubic-bezier(.34,1.56,.64,1)}
        input::placeholder,textarea::placeholder{opacity:.4}
        textarea{resize:vertical}
      `}</style>
      <div style={S.app}>

        {/* Header */}
        <header style={S.hdr}>
          <div style={{flexShrink:0}}>
            <div style={S.logo}>✦ {t.appName}</div>
            <div style={{fontSize:9,color:sub}}>{t.tagline}</div>
          </div>
          <div style={S.tabs}>
            {["chat","slide","memory","history"].map(tb=>(
              <button key={tb} style={S.tb(tab===tb)} onClick={()=>setTab(tb)}>
                {tb==="chat"?t.tabChat:tb==="slide"?t.tabSlide:tb==="memory"?t.tabMemory:t.tabHistory}
              </button>
            ))}
            <select style={S.ls} value={lang} onChange={e=>{setLang(e.target.value);setMessages([]);}}>
              {Object.entries(LANGUAGES).map(([k,v])=><option key={k} value={k}>{v.flag} {v.name}</option>)}
            </select>
            <button style={S.dk} onClick={()=>setDark(d=>!d)}>{t.darkMode}</button>
          </div>
        </header>

        <div style={S.main}>
          <div style={S.badge}>{t.savedBadge}</div>

          {/* ═══ CHAT ═══ */}
          {tab==="chat"&&(<>
            <div style={S.chatArea}>
              {messages.map((m,i)=>(
                <div key={i} style={S.bub(m.role)} className="fi">
                  <div style={S.msg(m.role)}>{m.content}</div>
                </div>
              ))}
              {chatLoading&&<div style={S.bub("assistant")}><div style={S.typing}>{[0,1,2].map(i=><div key={i} style={S.dot(i)}/>)}</div></div>}
              <div ref={chatEndRef}/>
            </div>
            <div style={S.irow}>
              <input style={S.ibox} value={input} onChange={e=>setInput(e.target.value)} placeholder={t.chatPlaceholder} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendChat()}/>
              <button style={S.sbtn} onClick={sendChat} disabled={chatLoading}>{t.send}</button>
              <button style={S.dk} onClick={initChat}>{t.clearChat}</button>
            </div>
          </>)}

          {/* ═══ SLIDES ═══ */}
          {tab==="slide"&&(
            <div style={{overflowY:"auto",flex:1,paddingBottom:28}}>
              <div style={{padding:"14px 0 0",display:"flex",flexDirection:"column",gap:10}}>
                <div><div style={S.lbl}>{t.slideTitle}</div><input style={S.ti} value={slideTopic} onChange={e=>setSlideTopic(e.target.value)} placeholder={t.slidePlaceholder} onKeyDown={e=>e.key==="Enter"&&generateSlides()}/></div>
                <div>
                  <div style={S.lbl}>{t.styleLabel}</div>
                  <div style={{display:"flex",gap:8}}>
                    {["business","casual"].map(s=>(
                      <button key={s} onClick={()=>setSlideStyle(s)} style={{flex:1,padding:"7px",borderRadius:10,border:`2px solid ${slideStyle===s?gold:border}`,background:slideStyle===s?`${gold}20`:"transparent",color:slideStyle===s?gold:sub,cursor:"pointer",fontSize:12,fontWeight:700}}>
                        {s==="business"?t.styleBusiness:t.styleCasual}
                      </button>
                    ))}
                  </div>
                </div>
                <button style={S.gbtn} onClick={generateSlides} disabled={slideLoading}>{slideLoading?t.generating:t.generateSlide}</button>
              </div>
              {slides.length>0&&(<>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,padding:"10px 0"}}>
                  <button onClick={()=>setSlideIdx(i=>Math.max(i-1,0))} style={{padding:"6px 13px",borderRadius:9,border:`1px solid ${border}`,background:slideIdx===0?"transparent":surf2,color:slideIdx===0?border:text,cursor:slideIdx===0?"default":"pointer"}}>{t.prev}</button>
                  <span style={{fontSize:12,color:sub}}>{slideIdx+1} {t.slideOf} {slides.length}</span>
                  <button onClick={()=>setSlideIdx(i=>Math.min(i+1,slides.length-1))} style={{padding:"6px 13px",borderRadius:9,border:`1px solid ${border}`,background:slideIdx===slides.length-1?"transparent":surf2,color:slideIdx===slides.length-1?border:text,cursor:slideIdx===slides.length-1?"default":"pointer"}}>{t.next}</button>
                </div>
                <div style={{background:surf2,borderRadius:18,border:`2px solid ${sc}44`,overflow:"hidden",marginBottom:12}} className="fi">
                  <div style={{background:`linear-gradient(135deg,${sc}28,${sc}0a)`,padding:"16px 20px",borderBottom:`1px solid ${sc}30`}}>
                    <div style={{fontSize:32,marginBottom:5}}>{slides[slideIdx]?.emoji}</div>
                    <div style={{fontSize:18,fontWeight:800,color:sc}}>{slides[slideIdx]?.title}</div>
                  </div>
                  <div style={{padding:"16px 20px"}}>
                    <div style={{fontSize:14,lineHeight:2.1,whiteSpace:"pre-wrap"}}>{slides[slideIdx]?.content}</div>
                    {slides[slideIdx]?.evidence&&<div style={{marginTop:10,padding:"7px 11px",borderRadius:8,background:`${sc}18`,border:`1px solid ${sc}44`,fontSize:12,color:sc}}>📊 {slides[slideIdx].evidence}</div>}
                  </div>
                </div>
                <div style={{padding:"13px",background:surf,borderRadius:14,border:`1px solid ${border}`,marginBottom:10}}>
                  <div style={S.lbl}>💬 {t.askQuestion}</div>
                  <div style={{display:"flex",gap:8}}>
                    <input style={{...S.ti,width:"auto",flex:1}} value={qaInput} onChange={e=>setQaInput(e.target.value)} placeholder={t.questionPlaceholder} onKeyDown={e=>e.key==="Enter"&&askQA()}/>
                    <button onClick={askQA} disabled={qaLoading} style={{padding:"8px 13px",borderRadius:10,border:"none",background:blue,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>{qaLoading?"...":t.askBtn}</button>
                  </div>
                  {qaAnswer&&<div style={{marginTop:8,padding:"9px 13px",borderRadius:10,background:`${green}18`,border:`1px solid ${green}44`,fontSize:13,lineHeight:1.7}}>{qaAnswer}</div>}
                </div>
                <div style={{padding:"13px",background:surf,borderRadius:14,border:`1px solid ${border}`}}>
                  <div style={S.lbl}>📝 {t.memoTitle}</div>
                  <div style={{display:"flex",gap:8}}>
                    <input style={{...S.ti,flex:1,width:"auto"}} value={memo} onChange={e=>setMemo(e.target.value)} placeholder={t.memoPlaceholder} onKeyDown={e=>{if(e.key==="Enter"&&memo.trim()){setMemos(m=>[{text:memo,date:new Date().toLocaleString(lang),slide:slides[slideIdx]?.title||""},...m]);setMemo("");}}}/>
                    <button onClick={()=>{if(memo.trim()){setMemos(m=>[{text:memo,date:new Date().toLocaleString(lang),slide:slides[slideIdx]?.title||""},...m]);setMemo("");}}} style={{padding:"8px 13px",borderRadius:10,border:"none",background:green,color:"#0a1a10",cursor:"pointer",fontSize:12,fontWeight:700}}>{t.saveMemo}</button>
                  </div>
                  {memos.length>0&&<div style={{marginTop:8,display:"flex",flexDirection:"column",gap:5}}>{memos.slice(0,5).map((m,i)=><div key={i} style={{padding:"6px 10px",borderRadius:8,background:surf2,fontSize:12,color:sub,borderLeft:`3px solid ${green}`}}><strong style={{color:text}}>{m.text}</strong><div style={{marginTop:1,fontSize:10}}>{m.slide&&`[${m.slide}] `}{m.date}</div></div>)}</div>}
                </div>
              </>)}
            </div>
          )}

          {/* ═══ MEMORY DOOR ═══ */}
          {tab==="memory"&&(
            <div style={{overflowY:"auto",flex:1,paddingBottom:36}}>
              <div style={{padding:"16px 0 12px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontSize:20,fontWeight:900,color:rose}}>🚪 {t.memoryTitle}</div>
                  <div style={{fontSize:12,color:sub,marginTop:3}}>{t.memorySubtitle}</div>
                  {memories.length>0&&<div style={{fontSize:11,color:sub,marginTop:3,opacity:.7}}>{memories.length} {t.totalMemories}</div>}
                </div>
                <button onClick={()=>{setForm(emptyForm());setShowForm(s=>!s);}}
                  style={{padding:"8px 16px",borderRadius:20,border:"none",background:showForm?surf2:`linear-gradient(135deg,${rose},${purple})`,color:showForm?sub:"#fff",fontWeight:800,fontSize:12,cursor:"pointer",boxShadow:showForm?"none":`0 4px 14px ${rose}40`}}>
                  {showForm?"✕":t.addMemory}
                </button>
              </div>

              {showForm&&(
                <div style={{background:surf,border:`1.5px solid ${rose}44`,borderRadius:20,padding:"16px",marginBottom:16}} className="pi">
                  {/* Media type */}
                  <div style={{marginBottom:12}}>
                    <div style={S.lbl}>{t.mediaType}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {mediaTypes.map(mt=>(
                        <button key={mt} onClick={()=>setForm(f=>({...f,mediaType:mt}))}
                          style={{padding:"4px 11px",borderRadius:20,border:`1.5px solid ${form.mediaType===mt?rose:border}`,background:form.mediaType===mt?`${rose}22`:"transparent",color:form.mediaType===mt?rose:sub,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                          {MEDIA_EMOJI[mt]||"✨"} {mt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                    <div><div style={S.lbl}>{t.workTitle}</div><input style={S.ti} value={form.workTitle} onChange={e=>setForm(f=>({...f,workTitle:e.target.value}))} placeholder={t.workTitlePh}/></div>
                    <div><div style={S.lbl}>{t.episode}</div><input style={S.ti} value={form.episode} onChange={e=>setForm(f=>({...f,episode:e.target.value}))} placeholder={t.episodePh}/></div>
                  </div>
                  <div style={{marginBottom:10}}><div style={S.lbl}>⏱ {t.timestamp}</div><input style={{...S.ti,width:130}} value={form.timestamp} onChange={e=>setForm(f=>({...f,timestamp:e.target.value}))} placeholder={t.timestampPh}/></div>
                  <div style={{marginBottom:10}}><div style={{...S.lbl,color:gold}}>💬 {t.quote}</div><textarea rows={3} style={S.ti} value={form.quote} onChange={e=>setForm(f=>({...f,quote:e.target.value}))} placeholder={t.quotePh}/></div>
                  <div style={{marginBottom:10}}><div style={S.lbl}>🎬 {t.situation}</div><textarea rows={2} style={S.ti} value={form.situation} onChange={e=>setForm(f=>({...f,situation:e.target.value}))} placeholder={t.situationPh}/></div>
                  <div style={{marginBottom:12}}><div style={S.lbl}>✍️ {t.impression}</div><textarea rows={2} style={S.ti} value={form.impression} onChange={e=>setForm(f=>({...f,impression:e.target.value}))} placeholder={t.impressionPh}/></div>
                  <div style={{marginBottom:10}}>
                    <div style={S.lbl}>🏷 {t.moodLabel}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {moodList.map(tag=>(
                        <button key={tag} onClick={()=>toggleMood(tag)}
                          style={{padding:"3px 10px",borderRadius:20,border:`1.5px solid ${form.moodTags.includes(tag)?purple:border}`,background:form.moodTags.includes(tag)?`${purple}28`:"transparent",color:form.moodTags.includes(tag)?purple:sub,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{marginBottom:14}}><div style={S.lbl}>🔖 {t.customTag}</div><input style={S.ti} value={form.customTags} onChange={e=>setForm(f=>({...f,customTags:e.target.value}))} placeholder={t.customTagPh}/></div>
                  <button onClick={saveMemory} style={{width:"100%",padding:"11px",borderRadius:14,border:"none",background:savedAnim?green:`linear-gradient(135deg,${rose},${purple})`,color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",transition:"background .4s"}}>
                    {savedAnim?t.memorySaved:t.saveMemory}
                  </button>
                </div>
              )}

              {memories.length>0&&(
                <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                  <input style={{...S.ti,flex:1,minWidth:140,fontSize:13}} value={memSearch} onChange={e=>setMemSearch(e.target.value)} placeholder={t.searchPh}/>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {[t.filterAll,...mediaTypes].map((f,i)=>{
                      const fv=i===0?"all":mediaTypes[i-1];
                      return <button key={f} onClick={()=>setMemFilter(fv)} style={{padding:"4px 9px",borderRadius:16,border:`1.5px solid ${memFilter===fv?rose:border}`,background:memFilter===fv?`${rose}20`:"transparent",color:memFilter===fv?rose:sub,fontSize:11,fontWeight:700,cursor:"pointer"}}>{i===0?"":MEDIA_EMOJI[mediaTypes[i-1]]||""} {f}</button>;
                    })}
                  </div>
                </div>
              )}

              {memories.length===0?(
                <div style={{textAlign:"center",color:sub,marginTop:50,fontSize:14,lineHeight:2.2,whiteSpace:"pre-line"}}>{t.noMemories}</div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {filteredMemories.map((mem,idx)=>{
                    const ca=cardAccents[idx%cardAccents.length];
                    const exp=expandedId===mem.id;
                    return(
                      <div key={mem.id} className="fi" style={{background:surf2,borderRadius:18,border:`1.5px solid ${ca}44`,overflow:"hidden"}}>
                        <div style={{background:`linear-gradient(135deg,${ca}22,${ca}08)`,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setExpandedId(exp?null:mem.id)}>
                          <div style={{fontSize:18}}>{MEDIA_EMOJI[mem.mediaLabel]||"✨"}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:14,fontWeight:800,color:ca,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{mem.workTitle||"—"}</div>
                            <div style={{fontSize:10,color:sub,marginTop:1,display:"flex",gap:8,flexWrap:"wrap"}}>
                              {mem.episode&&<span>{mem.episode}</span>}
                              {mem.timestamp&&<span>⏱ {mem.timestamp}</span>}
                              <span>{mem.savedAt}</span>
                            </div>
                          </div>
                          <div style={{color:sub,fontSize:11,opacity:.6}}>{exp?"▲":"▼"}</div>
                        </div>
                        {mem.quote&&(
                          <div style={{padding:"10px 14px 8px"}}>
                            <div style={{fontSize:15,lineHeight:1.85,fontStyle:"italic",whiteSpace:"pre-wrap",paddingLeft:12,borderLeft:`3px solid ${ca}88`}}>"{mem.quote}"</div>
                          </div>
                        )}
                        {!exp&&(mem.moodTags?.length>0||mem.customTagsArr?.length>0)&&(
                          <div style={{padding:"0 14px 10px",display:"flex",flexWrap:"wrap",gap:4}}>
                            {mem.moodTags?.slice(0,3).map(tag=><span key={tag} style={{padding:"2px 7px",borderRadius:12,background:`${purple}20`,border:`1px solid ${purple}44`,color:purple,fontSize:10,fontWeight:700}}>{tag}</span>)}
                            {mem.customTagsArr?.slice(0,2).map(tag=><span key={tag} style={{padding:"2px 7px",borderRadius:12,background:`${gold}18`,border:`1px solid ${gold}44`,color:gold,fontSize:10}}>{tag}</span>)}
                          </div>
                        )}
                        {exp&&(
                          <div style={{padding:"4px 14px 14px"}} className="fi">
                            {mem.situation&&<div style={{marginTop:9}}><div style={{fontSize:10,color:sub,fontWeight:700,marginBottom:3}}>🎬 {t.situation}</div><div style={{fontSize:13,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{mem.situation}</div></div>}
                            {mem.impression&&<div style={{marginTop:9}}><div style={{fontSize:10,color:sub,fontWeight:700,marginBottom:3}}>✍️ {t.impression}</div><div style={{fontSize:13,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{mem.impression}</div></div>}
                            {(mem.moodTags?.length>0||mem.customTagsArr?.length>0)&&(
                              <div style={{marginTop:9,display:"flex",flexWrap:"wrap",gap:5}}>
                                {mem.moodTags?.map(tag=><span key={tag} style={{padding:"3px 9px",borderRadius:14,background:`${purple}22`,border:`1px solid ${purple}44`,color:purple,fontSize:11,fontWeight:700}}>{tag}</span>)}
                                {mem.customTagsArr?.map(tag=><span key={tag} style={{padding:"3px 9px",borderRadius:14,background:`${gold}18`,border:`1px solid ${gold}44`,color:gold,fontSize:11}}>{tag}</span>)}
                              </div>
                            )}
                            <div style={{marginTop:11,padding:"10px 12px",background:`${rose}12`,borderRadius:12,border:`1px solid ${rose}35`}}>
                              <button onClick={()=>getAiRefl(mem)} disabled={aiReflLoading===mem.id}
                                style={{padding:"5px 13px",borderRadius:16,border:"none",background:`${rose}33`,color:rose,fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:aiRefl[mem.id]?8:0}}>
                                {aiReflLoading===mem.id?"✦ "+t.aiReflecting:"✦ "+t.aiReflect}
                              </button>
                              {aiRefl[mem.id]&&<div style={{fontSize:13,lineHeight:1.85,whiteSpace:"pre-wrap"}} className="fi">{aiRefl[mem.id]}</div>}
                            </div>
                            <div style={{marginTop:10,display:"flex",gap:8}}>
                              <button onClick={()=>{setForm({...mem,customTags:mem.customTagsArr?.join(", ")||""});setShowForm(true);setExpandedId(null);window.scrollTo({top:0,behavior:"smooth"});}} style={{padding:"5px 12px",borderRadius:10,border:`1px solid ${border}`,background:"transparent",color:sub,fontSize:12,cursor:"pointer"}}>✏️ {t.editMemory}</button>
                              <button onClick={()=>{if(window.confirm(t.deleteConfirm))setMemories(p=>p.filter(m=>m.id!==mem.id));}} style={{padding:"5px 12px",borderRadius:10,border:`1px solid ${rose}50`,background:"transparent",color:rose,fontSize:12,cursor:"pointer"}}>🗑 {t.deleteMemory}</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ HISTORY ═══ */}
          {tab==="history"&&(
            <div style={{padding:"14px 0",display:"flex",flexDirection:"column",gap:10}}>
              {slideHistory.length===0?(
                <div style={{textAlign:"center",color:sub,marginTop:40,fontSize:14}}>{t.historyEmpty}</div>
              ):slideHistory.map((h,i)=>(
                <div key={i} className="fi" style={{padding:"12px 16px",borderRadius:13,background:surf2,border:`1px solid ${border}`,cursor:"pointer"}} onClick={()=>{setSlides(h.slides);setSlideIdx(0);setTab("slide");}}>
                  <div style={{fontSize:14,fontWeight:700,color:gold}}>{h.topic}</div>
                  <div style={{fontSize:11,color:sub,marginTop:3}}>{h.date} · {h.slides?.length??0} slides</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
