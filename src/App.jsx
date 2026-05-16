import { useState, useRef, useEffect, useCallback } from "react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  dark: {
    bg:"#080a0f", sidebar:"#0e1018", card:"#161b26", border:"#1e2333",
    borderHover:"#2a3047", text:"#e2e6f3", textMuted:"#6b7299", textDim:"#2e3455",
    accent:"#7c6af7", accentSoft:"#7c6af718", accentText:"#b8adff",
    accentBorder:"#7c6af755", userBubble:"#1a183a", aiBubble:"#111520",
    inputBg:"#12151f", inputBorder:"#1e2333", codeBg:"#090b12", codeText:"#8ba3cc",
    green:"#34d399", greenSoft:"#0d2e22", red:"#f87171", redSoft:"#2e1010",
    amber:"#fbbf24", amberSoft:"#2e2208", blue:"#60a5fa", blueSoft:"#0a1a2e",
    pink:"#f472b6", teal:"#2dd4bf", orange:"#fb923c",
    thumb:"#1e2333", glass:"#ffffff08", overlay:"#000000bb",
    agentPurple:"#a78bfa", agentBlue:"#60a5fa", agentGreen:"#34d399",
    agentOrange:"#fb923c", agentPink:"#f472b6", agentTeal:"#2dd4bf",
  },
  light: {
    bg:"#f0f2f8", sidebar:"#ffffff", card:"#ffffff", border:"#e2e6f0",
    borderHover:"#c8cee0", text:"#111827", textMuted:"#5b6380", textDim:"#b8bdd4",
    accent:"#6b5cf6", accentSoft:"#6b5cf610", accentText:"#5548d9",
    accentBorder:"#6b5cf640", userBubble:"#ebe8ff", aiBubble:"#f5f6fc",
    inputBg:"#ffffff", inputBorder:"#dde1ef", codeBg:"#f2f3f9", codeText:"#3d4875",
    green:"#059669", greenSoft:"#d1fae5", red:"#dc2626", redSoft:"#fee2e2",
    amber:"#d97706", amberSoft:"#fef3c7", blue:"#2563eb", blueSoft:"#dbeafe",
    pink:"#db2777", teal:"#0d9488", orange:"#ea580c",
    thumb:"#dde1ef", glass:"#00000008", overlay:"#00000055",
    agentPurple:"#7c3aed", agentBlue:"#2563eb", agentGreen:"#059669",
    agentOrange:"#ea580c", agentPink:"#db2777", agentTeal:"#0d9488",
  },
};

// ─── MODELS ──────────────────────────────────────────────────────────────────
const MODELS = [
  { id:"claude-opus-4-6", label:"Opus 4.6", full:"Claude Opus 4.6", family:"Claude 4", badge:"⚡ Elite", badgeColor:"#a78bfa", desc:"Maximum intelligence for the hardest problems", ctx:"200K", speed:2, power:5, icon:"◆", iconColor:"#a78bfa" },
  { id:"claude-sonnet-4-6", label:"Sonnet 4.6", full:"Claude Sonnet 4.6", family:"Claude 4", badge:"★ Best", badgeColor:"#34d399", desc:"Perfect balance — smart, fast, reliable", ctx:"200K", speed:4, power:4, icon:"◈", iconColor:"#34d399" },
  { id:"claude-sonnet-4-20250514", label:"Sonnet 4", full:"Claude Sonnet 4", family:"Claude 4", badge:null, badgeColor:"#60a5fa", desc:"Highly capable across all task types", ctx:"200K", speed:4, power:4, icon:"◈", iconColor:"#60a5fa" },
  { id:"claude-haiku-4-5-20251001", label:"Haiku 4.5", full:"Claude Haiku 4.5", family:"Claude 4", badge:"🚀 Fast", badgeColor:"#fbbf24", desc:"Lightning responses for quick tasks", ctx:"200K", speed:5, power:3, icon:"◇", iconColor:"#fbbf24" },
  { id:"claude-opus-4-20250514", label:"Opus 4", full:"Claude Opus 4", family:"Previous", badge:null, badgeColor:"#8b5cf6", desc:"Previous flagship, deep reasoning", ctx:"200K", speed:2, power:5, icon:"◆", iconColor:"#8b5cf6" },
  { id:"claude-haiku-3-5-20241022", label:"Haiku 3.5", full:"Claude Haiku 3.5", family:"Previous", badge:null, badgeColor:"#f59e0b", desc:"Compact and efficient for simple tasks", ctx:"200K", speed:5, power:2, icon:"◇", iconColor:"#f59e0b" },
];
const DEF_MODEL = MODELS[1];

// ─── AGENTS ──────────────────────────────────────────────────────────────────
const AGENTS = [
  {
    id:"nova", name:"Nova", subtitle:"General Assistant", icon:"✦", color:"#7c6af7",
    desc:"Your all-purpose AI companion — helpful, smart, and friendly",
    model:"claude-sonnet-4-6", temp:"balanced",
    system:"You are Nova, a world-class AI assistant. Be helpful, clear, insightful, and occasionally witty. Format responses beautifully with structure when useful.",
    tools:["web","memory","calculator"],
    badge:"Default", badgeColor:"#7c6af7",
  },
  {
    id:"dev", name:"DevBot", subtitle:"Senior Engineer", icon:"⌨", color:"#34d399",
    desc:"Expert full-stack engineer. Writes clean, tested, production-ready code",
    model:"claude-sonnet-4-6", temp:"precise",
    system:"You are DevBot, a senior software engineer with 15+ years of experience. Write clean, well-commented, production-ready code. Always use markdown code blocks with correct language tags. Explain your approach, suggest best practices, point out edge cases, and offer to refactor if needed.",
    tools:["code","terminal","memory"],
    badge:"🔥 Popular", badgeColor:"#34d399",
  },
  {
    id:"research", name:"Scholar", subtitle:"Research Analyst", icon:"🔬", color:"#60a5fa",
    desc:"Deep research, fact-checking, citations, and structured analysis",
    model:"claude-opus-4-6", temp:"balanced",
    system:"You are Scholar, an expert research analyst. Provide thorough, well-structured analysis with clear reasoning. Cite sources when known, acknowledge uncertainty, compare multiple perspectives, and deliver actionable conclusions.",
    tools:["web","memory","calculator"],
    badge:"🧠 Deep", badgeColor:"#60a5fa",
  },
  {
    id:"creative", name:"Muse", subtitle:"Creative Director", icon:"✿", color:"#f472b6",
    desc:"Storytelling, copywriting, creative brainstorming, and imaginative work",
    model:"claude-sonnet-4-6", temp:"creative",
    system:"You are Muse, a world-class creative director and writer. Be expressive, original, and inspiring. Help with stories, scripts, marketing copy, poetry, brainstorming, and any creative endeavor. Push boundaries, offer unexpected angles, and make every word count.",
    tools:["memory"],
    badge:"✨ Creative", badgeColor:"#f472b6",
  },
  {
    id:"data", name:"DataWiz", subtitle:"Data Scientist", icon:"◈", color:"#fb923c",
    desc:"Data analysis, statistics, charts, SQL, Python pandas, and insights",
    model:"claude-sonnet-4-6", temp:"precise",
    system:"You are DataWiz, an expert data scientist. Help with data analysis, statistics, SQL queries, Python (pandas, numpy, matplotlib), visualization recommendations, and deriving business insights. Be precise, show your work, and explain findings clearly.",
    tools:["code","calculator","memory"],
    badge:"📊 Analytics", badgeColor:"#fb923c",
  },
  {
    id:"tutor", name:"Sage", subtitle:"Personal Tutor", icon:"◉", color:"#2dd4bf",
    desc:"Patient, Socratic teaching across all subjects. Makes anything click",
    model:"claude-sonnet-4-6", temp:"balanced",
    system:"You are Sage, a brilliant and patient tutor. Use the Socratic method — ask questions to guide understanding rather than just giving answers. Break complex concepts into digestible steps, use analogies and examples, check understanding, and celebrate progress. Adapt to the learner's level.",
    tools:["calculator","memory"],
    badge:"📚 Tutor", badgeColor:"#2dd4bf",
  },
  {
    id:"business", name:"Exec", subtitle:"Business Strategist", icon:"◰", color:"#fbbf24",
    desc:"Strategy, marketing, finance, pitch decks, and business decision support",
    model:"claude-opus-4-6", temp:"balanced",
    system:"You are Exec, a seasoned business strategist and consultant. Provide sharp, actionable business advice on strategy, marketing, operations, finance, and leadership. Think like a McKinsey partner — structured, data-informed, decisive. Use frameworks (SWOT, OKRs, Porter's Five Forces) when helpful.",
    tools:["calculator","memory"],
    badge:"💼 Strategy", badgeColor:"#fbbf24",
  },
  {
    id:"custom", name:"Custom Agent", subtitle:"Configure your own", icon:"⚙", color:"#7a7f96",
    desc:"Build your own agent with a custom name, persona, and system prompt",
    model:"claude-sonnet-4-6", temp:"balanced",
    system:"",
    tools:[], isCustom:true,
    badge:"🛠 DIY", badgeColor:"#7a7f96",
  },
];

const TOOLS_META = {
  web:       { icon:"🌐", label:"Web Search",    color:"#60a5fa" },
  memory:    { icon:"🧠", label:"Memory",        color:"#a78bfa" },
  calculator:{ icon:"🔢", label:"Calculator",    color:"#34d399" },
  code:      { icon:"⌨", label:"Code Runner",   color:"#fb923c" },
  terminal:  { icon:"⬛", label:"Terminal",      color:"#fbbf24" },
};

const PRESETS = {
  balanced:{ label:"Balanced",  desc:"Smart default",    icon:"◈" },
  precise: { label:"Precise",   desc:"Low creativity",   icon:"◆" },
  creative:{ label:"Creative",  desc:"High creativity",  icon:"✿" },
};

// ─── SMART PROMPTS (context-aware) ──────────────────────────────────────────
const AGENT_STARTERS = {
  nova:     ["What can you help me with?","Explain a complex topic simply","Draft a professional email","Compare two ideas"],
  dev:      ["Review my code for bugs","Write a REST API in Node.js","Explain async/await deeply","Debug this error message"],
  research: ["Deep dive into quantum computing","Compare climate policies","Analyze this topic pros/cons","Summarize latest AI research"],
  creative: ["Write a short story opening","Brainstorm product names","Create a compelling tagline","Help me with a plot twist"],
  data:     ["Write a SQL query for sales data","Explain p-value simply","Python code to visualize data","What stats test should I use?"],
  tutor:    ["Teach me calculus from scratch","Explain relativity like I'm 10","Help me understand recursion","Quiz me on world history"],
  business: ["Build a go-to-market strategy","Write an investor pitch","Analyze my business idea","Create OKRs for my team"],
  custom:   ["Start chatting with your custom agent"],
};

// ─── UTILS ──────────────────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(true);
  return { t: dark ? T.dark : T.light, dark, toggle: () => setDark(d => !d) };
}

function ago(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// ─── SMALL COMPONENTS ───────────────────────────────────────────────────────
function Bars({ val, max=5, color, t }) {
  return <div style={{display:"flex",gap:3}}>{Array.from({length:max}).map((_,i)=>
    <div key={i} style={{width:14,height:3,borderRadius:2,background:i<val?color:t.border,transition:"background 0.2s"}}/>
  )}</div>;
}

function Tag({ children, color, soft, t }) {
  return <span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:soft||color+"22",color,fontWeight:600,letterSpacing:0.3,flexShrink:0}}>{children}</span>;
}

function Dot({ color, pulse }) {
  return <div style={{width:7,height:7,borderRadius:"50%",background:color,boxShadow:pulse?`0 0 0 2px ${color}44`:undefined,animation:pulse?"dotPulse 2s infinite":undefined,flexShrink:0}}/>;
}

// ─── CODE BLOCK ─────────────────────────────────────────────────────────────
function CodeBlock({ code, lang, t }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{margin:"10px 0",borderRadius:10,overflow:"hidden",border:`1px solid ${t.border}`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 14px",background:t.codeBg,borderBottom:`1px solid ${t.border}`}}>
        <span style={{fontSize:11,color:t.textMuted,fontFamily:"monospace",letterSpacing:1}}>{lang||"code"}</span>
        <button onClick={()=>{navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
          style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:copied?t.green:t.textMuted,padding:"2px 7px",borderRadius:4,transition:"color 0.2s"}}>
          {copied?"✓ copied":"copy"}
        </button>
      </div>
      <pre style={{margin:0,padding:"13px 16px",background:t.codeBg,overflowX:"auto",fontSize:12.5,lineHeight:1.7,fontFamily:"'JetBrains Mono','Fira Code',monospace",color:t.codeText}}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function parseMsg(text, t) {
  const parts=[]; const re=/```(\w*)\n?([\s\S]*?)```/g; let last=0,m;
  while((m=re.exec(text))!==null){
    if(m.index>last) parts.push({type:"text",content:text.slice(last,m.index)});
    parts.push({type:"code",lang:m[1],content:m[2].trim()});
    last=m.index+m[0].length;
  }
  if(last<text.length) parts.push({type:"text",content:text.slice(last)});
  return parts.map((p,i)=>p.type==="code"
    ?<CodeBlock key={i} code={p.content} lang={p.lang} t={t}/>
    :<span key={i} style={{whiteSpace:"pre-wrap",lineHeight:1.8}}>{p.content}</span>);
}

// ─── MESSAGE ─────────────────────────────────────────────────────────────────
function Message({ msg, t, agent, model }) {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = msg.role==="user";
  const ag = agent || AGENTS[0];
  const wc = countWords(msg.content||"");
  return (
    <div style={{display:"flex",gap:11,padding:"14px 0",flexDirection:isUser?"row-reverse":"row",alignItems:"flex-start",animation:"fadeUp 0.25s ease"}}>
      <div title={isUser?"You":ag.name} style={{width:32,height:32,borderRadius:isUser?"50%":9,flexShrink:0,background:isUser?ag.color:t.card,border:`1px solid ${isUser?ag.color:t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isUser?13:15,color:isUser?"#fff":ag.color,fontWeight:700,cursor:"default",transition:"transform 0.2s"}}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
      >{isUser?"U":ag.icon}</div>
      <div style={{maxWidth:"79%",minWidth:0}}>
        {!isUser&&<div style={{fontSize:11,color:t.textMuted,marginBottom:5,display:"flex",alignItems:"center",gap:6}}>
          <span style={{color:ag.color,fontWeight:600}}>{ag.name}</span>
          <span style={{color:t.textDim}}>·</span>
          <span style={{color:t.textDim,fontSize:10}}>{model?.full||ag.model}</span>
          {msg.ts&&<span style={{color:t.textDim,fontSize:10,marginLeft:"auto"}}>{ago(msg.ts)}</span>}
        </div>}
        <div style={{padding:"12px 16px",background:isUser?t.userBubble:t.aiBubble,borderRadius:isUser?"16px 4px 16px 16px":"4px 16px 16px 16px",border:`1px solid ${t.border}`,fontSize:14,color:t.text,lineHeight:1.8}}>
          {msg.streaming
            ?<span style={{whiteSpace:"pre-wrap"}}>{msg.content||""}<span style={{opacity:0.5,animation:"blink 1s infinite"}}>▌</span></span>
            :parseMsg(msg.content||"",t)}
        </div>
        {!isUser&&!msg.streaming&&msg.content&&(
          <div style={{display:"flex",gap:6,marginTop:6,alignItems:"center"}}>
            <button onClick={()=>{setLiked(l=>!l);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:liked?t.amber:t.textDim,padding:"2px 4px",borderRadius:5,transition:"all 0.15s"}} title="Like">{liked?"★":"☆"}</button>
            <button onClick={()=>{navigator.clipboard.writeText(msg.content);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
              style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:copied?t.green:t.textDim,padding:"2px 6px",borderRadius:5,transition:"all 0.15s"}} title="Copy">
              {copied?"✓":"⎘"}
            </button>
            <span style={{fontSize:10,color:t.textDim,marginLeft:4}}>{wc} words · ~{estimateTokens(msg.content)} tokens</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AGENT CARD ─────────────────────────────────────────────────────────────
function AgentCard({ agent, active, onSelect, t }) {
  return (
    <button onClick={()=>onSelect(agent)} style={{width:"100%",padding:"12px",borderRadius:12,border:`1px solid ${active?agent.color+"88":t.border}`,background:active?agent.color+"12":t.card,cursor:"pointer",textAlign:"left",transition:"all 0.15s",marginBottom:8}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <div style={{width:36,height:36,borderRadius:9,background:agent.color+"20",border:`1px solid ${agent.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:agent.color,flexShrink:0}}>{agent.icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
            <span style={{fontSize:13.5,fontWeight:700,color:t.text}}>{agent.name}</span>
            <Tag color={agent.color} t={t}>{agent.badge}</Tag>
            {active&&<span style={{fontSize:10,color:t.green,marginLeft:"auto"}}>✓ active</span>}
          </div>
          <p style={{margin:"0 0 4px",fontSize:11.5,color:agent.color,fontWeight:500}}>{agent.subtitle}</p>
          <p style={{margin:0,fontSize:12,color:t.textMuted,lineHeight:1.4}}>{agent.desc}</p>
          {agent.tools?.length>0&&(
            <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>
              {agent.tools.map(tool=>TOOLS_META[tool]&&(
                <span key={tool} style={{fontSize:10,padding:"1px 6px",borderRadius:20,background:t.border,color:t.textMuted}}>{TOOLS_META[tool].icon} {TOOLS_META[tool].label}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── MODEL PICKER ────────────────────────────────────────────────────────────
function ModelPicker({ current, onSelect, t }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[]);
  const families=[...new Set(MODELS.map(m=>m.family))];
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px 5px 8px",background:open?t.accentSoft:t.card,border:`1px solid ${open?t.accent:t.border}`,borderRadius:9,cursor:"pointer",transition:"all 0.15s"}}
        onMouseEnter={e=>{if(!open){e.currentTarget.style.borderColor=t.accent;e.currentTarget.style.background=t.accentSoft;}}}
        onMouseLeave={e=>{if(!open){e.currentTarget.style.borderColor=t.border;e.currentTarget.style.background=t.card;}}}
      >
        <span style={{fontSize:13,color:current.iconColor}}>{current.icon}</span>
        <span style={{fontSize:12,fontWeight:600,color:t.text,whiteSpace:"nowrap"}}>{current.label}</span>
        {current.badge&&<Tag color={current.badgeColor} t={t}>{current.badge}</Tag>}
        <span style={{fontSize:9,color:t.textMuted,transform:open?"rotate(180deg)":"none",transition:"transform 0.2s",display:"inline-block"}}>▾</span>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,zIndex:9999,background:t.sidebar,border:`1px solid ${t.border}`,borderRadius:14,width:360,boxShadow:`0 16px 50px ${t.overlay}`,overflow:"hidden",animation:"fadeUp 0.18s ease"}}>
          <div style={{padding:"10px 14px 7px",borderBottom:`1px solid ${t.border}`}}>
            <p style={{margin:0,fontSize:10,color:t.textMuted,fontWeight:700,letterSpacing:0.9,textTransform:"uppercase"}}>Select Model</p>
          </div>
          <div style={{maxHeight:400,overflowY:"auto",padding:"6px"}}>
            {families.map(fam=>(
              <div key={fam}>
                <p style={{margin:"7px 8px 3px",fontSize:9.5,color:t.textDim,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>{fam}</p>
                {MODELS.filter(m=>m.family===fam).map(model=>(
                  <button key={model.id} onClick={()=>{onSelect(model);setOpen(false);}} style={{width:"100%",padding:"9px 10px",borderRadius:10,border:`1px solid ${model.id===current.id?model.iconColor+"55":"transparent"}`,background:model.id===current.id?model.iconColor+"10":"none",cursor:"pointer",textAlign:"left",transition:"all 0.12s",marginBottom:2,display:"flex",gap:10,alignItems:"flex-start"}}
                    onMouseEnter={e=>{if(model.id!==current.id){e.currentTarget.style.background=t.card;e.currentTarget.style.borderColor=t.border;}}}
                    onMouseLeave={e=>{if(model.id!==current.id){e.currentTarget.style.background="none";e.currentTarget.style.borderColor="transparent";}}}
                  >
                    <span style={{fontSize:17,color:model.iconColor,flexShrink:0,marginTop:2}}>{model.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,fontWeight:600,color:t.text}}>{model.full}</span>
                        {model.badge&&<Tag color={model.badgeColor} t={t}>{model.badge}</Tag>}
                        {model.id===current.id&&<span style={{fontSize:10,color:t.green,marginLeft:"auto"}}>✓</span>}
                      </div>
                      <p style={{margin:"0 0 6px",fontSize:11.5,color:t.textMuted,lineHeight:1.4}}>{model.desc}</p>
                      <div style={{display:"flex",gap:14,alignItems:"center"}}>
                        <div><p style={{margin:"0 0 3px",fontSize:9,color:t.textDim,letterSpacing:0.8,textTransform:"uppercase"}}>Speed</p><Bars val={model.speed} color={model.badgeColor||model.iconColor} t={t}/></div>
                        <div><p style={{margin:"0 0 3px",fontSize:9,color:t.textDim,letterSpacing:0.8,textTransform:"uppercase"}}>Power</p><Bars val={model.power} color={model.iconColor} t={t}/></div>
                        <span style={{marginLeft:"auto",fontSize:10,padding:"2px 7px",borderRadius:6,background:t.accentSoft,color:t.accentText,fontWeight:500}}>{model.ctx}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CUSTOM AGENT BUILDER ────────────────────────────────────────────────────
function CustomAgentBuilder({ t, onSave, onCancel }) {
  const [name, setName] = useState("My Agent");
  const [subtitle, setSubtitle] = useState("Custom Assistant");
  const [icon, setIcon] = useState("⚡");
  const [color, setColor] = useState("#7c6af7");
  const [system, setSystem] = useState("");
  const [model, setModel] = useState(DEF_MODEL.id);
  const icons = ["⚡","🎯","🔮","🌟","🎨","🧬","🛸","🔥","💡","🌊","⚔","🦋","🎭","🧿","◆"];
  const colors = ["#7c6af7","#34d399","#60a5fa","#f472b6","#fb923c","#fbbf24","#2dd4bf","#a78bfa"];
  return (
    <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
        <div style={{width:48,height:48,borderRadius:12,background:color+"22",border:`2px solid ${color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{icon}</div>
        <div>
          <p style={{margin:0,fontSize:16,fontWeight:700,color:t.text}}>{name||"My Agent"}</p>
          <p style={{margin:0,fontSize:12,color:t.textMuted}}>{subtitle||"Custom Assistant"}</p>
        </div>
      </div>
      <div>
        <label style={{fontSize:11,color:t.textMuted,fontWeight:600,letterSpacing:0.8,textTransform:"uppercase",display:"block",marginBottom:6}}>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:9,border:`1px solid ${t.border}`,background:t.inputBg,color:t.text,fontSize:14,fontFamily:"inherit"}}/>
      </div>
      <div>
        <label style={{fontSize:11,color:t.textMuted,fontWeight:600,letterSpacing:0.8,textTransform:"uppercase",display:"block",marginBottom:6}}>Subtitle</label>
        <input value={subtitle} onChange={e=>setSubtitle(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:9,border:`1px solid ${t.border}`,background:t.inputBg,color:t.text,fontSize:14,fontFamily:"inherit"}}/>
      </div>
      <div>
        <label style={{fontSize:11,color:t.textMuted,fontWeight:600,letterSpacing:0.8,textTransform:"uppercase",display:"block",marginBottom:6}}>Icon</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {icons.map(ic=><button key={ic} onClick={()=>setIcon(ic)} style={{width:36,height:36,borderRadius:8,border:`1px solid ${ic===icon?color:t.border}`,background:ic===icon?color+"22":"none",fontSize:18,cursor:"pointer",transition:"all 0.15s"}}>{ic}</button>)}
        </div>
      </div>
      <div>
        <label style={{fontSize:11,color:t.textMuted,fontWeight:600,letterSpacing:0.8,textTransform:"uppercase",display:"block",marginBottom:6}}>Color</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {colors.map(c=><button key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:"50%",background:c,border:`2px solid ${c===color?"#fff":"transparent"}`,cursor:"pointer",outline:c===color?`2px solid ${c}`:"none",outlineOffset:2,transition:"all 0.15s"}}/>)}
        </div>
      </div>
      <div>
        <label style={{fontSize:11,color:t.textMuted,fontWeight:600,letterSpacing:0.8,textTransform:"uppercase",display:"block",marginBottom:6}}>Model</label>
        <select value={model} onChange={e=>setModel(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:9,border:`1px solid ${t.border}`,background:t.inputBg,color:t.text,fontSize:13,fontFamily:"inherit"}}>
          {MODELS.map(m=><option key={m.id} value={m.id}>{m.full}</option>)}
        </select>
      </div>
      <div>
        <label style={{fontSize:11,color:t.textMuted,fontWeight:600,letterSpacing:0.8,textTransform:"uppercase",display:"block",marginBottom:6}}>System Prompt</label>
        <textarea value={system} onChange={e=>setSystem(e.target.value)} rows={5} placeholder="You are a helpful assistant that specializes in..." style={{width:"100%",padding:"10px 12px",borderRadius:9,border:`1px solid ${t.border}`,background:t.inputBg,color:t.text,fontSize:13,fontFamily:"inherit",resize:"vertical",lineHeight:1.6}}/>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onCancel} style={{flex:1,padding:"9px",borderRadius:10,border:`1px solid ${t.border}`,background:"none",color:t.textMuted,cursor:"pointer",fontSize:13,fontWeight:500}}>Cancel</button>
        <button onClick={()=>onSave({id:"custom_"+Date.now(),name:name||"My Agent",subtitle:subtitle||"Custom",icon,color,desc:"Your custom AI agent",model,system,tools:[],badge:"🛠 Custom",badgeColor:color})}
          style={{flex:2,padding:"9px",borderRadius:10,border:"none",background:color,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>
          Create Agent
        </button>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, onRename, onPin, t, collapsed, onToggle, panel, setPanel }) {
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState(null); // {id, x, y}
  const [renaming, setRenaming] = useState(null); // conv id
  const [renameVal, setRenameVal] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // conv id
  const menuRef = useRef(null);

  // Close context menu on outside click
  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleRightClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenu({ id, x: rect.right + 4, y: rect.top });
  };

  const filtered = conversations.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase())
  );
  const pinned = filtered.filter(c => c.pinned);
  const unpinned = filtered.filter(c => !c.pinned);

  return (
    <div style={{width:collapsed?50:240,flexShrink:0,background:t.sidebar,borderRight:`1px solid ${t.border}`,display:"flex",flexDirection:"column",transition:"width 0.25s cubic-bezier(0.4,0,0.2,1)",overflow:"hidden",position:"relative"}}>

      {/* Header */}
      <div style={{padding:"13px 10px",display:"flex",alignItems:"center",gap:8,borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onToggle} style={{background:"none",border:"none",cursor:"pointer",width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",color:t.textMuted,fontSize:16,flexShrink:0,padding:0,transition:"background 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.background=t.border}
          onMouseLeave={e=>e.currentTarget.style.background="none"}
        >☰</button>
        {!collapsed&&<span style={{fontSize:15,fontWeight:800,color:t.text,letterSpacing:-0.5,whiteSpace:"nowrap"}}>Nova <span style={{color:t.accent}}>AI</span></span>}
      </div>

      {/* Nav items */}
      {!collapsed&&(
        <div style={{padding:"10px 10px 0",display:"flex",flexDirection:"column",gap:3}}>
          {[
            {id:"chat",icon:"✦",label:"Chats"},
            {id:"agents",icon:"⚡",label:"Agents"},
            {id:"memory",icon:"🧠",label:"Memory"},
            {id:"settings",icon:"⚙",label:"Settings"},
          ].map(item=>(
            <button key={item.id} onClick={()=>setPanel(item.id==="chat"?null:item.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,border:"none",background:panel===item.id?t.accentSoft:"none",color:panel===item.id?t.accentText:t.textMuted,cursor:"pointer",fontSize:12.5,transition:"all 0.15s",textAlign:"left"}}
              onMouseEnter={e=>{if(panel!==item.id)e.currentTarget.style.background=t.card;}}
              onMouseLeave={e=>{if(panel!==item.id)e.currentTarget.style.background="none";}}
            >
              <span style={{fontSize:13,width:16,textAlign:"center"}}>{item.icon}</span>
              <span style={{fontWeight:panel===item.id?600:400}}>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {collapsed&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 0"}}>
          {["✦","⚡","🧠","⚙"].map((ic,i)=>(
            <button key={i} style={{width:34,height:34,borderRadius:8,border:"none",background:"none",cursor:"pointer",fontSize:14,color:t.textMuted,transition:"background 0.15s",display:"flex",alignItems:"center",justifyContent:"center"}}
              onMouseEnter={e=>e.currentTarget.style.background=t.card}
              onMouseLeave={e=>e.currentTarget.style.background="none"}
            >{ic}</button>
          ))}
        </div>
      )}

      {/* New Chat + Search */}
      <div style={{padding:"8px",borderTop:`1px solid ${t.border}`,margin:"6px 0 0",display:"flex",flexDirection:"column",gap:6}}>
        <button onClick={onNew} style={{width:"100%",padding:collapsed?"8px":"7px 12px",borderRadius:8,border:`1px solid ${t.border}`,background:t.accentSoft,color:t.accentText,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:7,justifyContent:collapsed?"center":"flex-start",fontWeight:600,transition:"all 0.15s",whiteSpace:"nowrap"}}
          onMouseEnter={e=>{e.currentTarget.style.background=t.accent;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=t.accent;}}
          onMouseLeave={e=>{e.currentTarget.style.background=t.accentSoft;e.currentTarget.style.color=t.accentText;e.currentTarget.style.borderColor=t.border;}}
        ><span style={{fontSize:15}}>+</span>{!collapsed&&"New Chat"}</button>

        {/* Search box */}
        {!collapsed&&(
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:12,color:t.textDim,pointerEvents:"none"}}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search chats…"
              style={{width:"100%",padding:"6px 8px 6px 26px",borderRadius:8,border:`1px solid ${t.border}`,background:t.inputBg,color:t.text,fontSize:12,fontFamily:"inherit"}}/>
            {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:7,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:t.textDim,fontSize:14,lineHeight:1,padding:0}}>×</button>}
          </div>
        )}
      </div>

      {/* Chat list */}
      <div style={{flex:1,overflowY:"auto",padding:"4px 8px 8px"}}>

        {/* Pinned section */}
        {!collapsed&&pinned.length>0&&(
          <>
            <p style={{fontSize:9.5,color:t.textDim,fontWeight:700,letterSpacing:1,textTransform:"uppercase",margin:"6px 4px 4px"}}>📌 Pinned</p>
            {pinned.map(c=>
              <ChatRow key={c.id} c={c} activeId={activeId} onSelect={onSelect} onRightClick={handleRightClick}
                renaming={renaming} renameVal={renameVal} setRenameVal={setRenameVal}
                onRenameCommit={()=>{if(renameVal.trim())onRename(c.id,renameVal.trim());setRenaming(null);}}
                onRenameCancel={()=>setRenaming(null)} collapsed={collapsed} t={t}/>
            )}
            {unpinned.length>0&&<p style={{fontSize:9.5,color:t.textDim,fontWeight:700,letterSpacing:1,textTransform:"uppercase",margin:"10px 4px 4px"}}>Recent</p>}
          </>
        )}

        {/* Main list */}
        {(collapsed?filtered:unpinned).map(c=>
          <ChatRow key={c.id} c={c} activeId={activeId} onSelect={onSelect} onRightClick={handleRightClick}
            renaming={renaming} renameVal={renameVal} setRenameVal={setRenameVal}
            onRenameCommit={()=>{if(renameVal.trim())onRename(c.id,renameVal.trim());setRenaming(null);}}
            onRenameCancel={()=>setRenaming(null)} collapsed={collapsed} t={t}/>
        )}

        {!collapsed&&filtered.length===0&&(
          <p style={{fontSize:12,color:t.textDim,textAlign:"center",padding:"20px 0"}}>
            {search?"No chats match your search":"No chats yet"}
          </p>
        )}
      </div>

      {/* Context Menu */}
      {menu&&(
        <div ref={menuRef} style={{position:"fixed",top:menu.y,left:menu.x,zIndex:99999,background:t.sidebar,border:`1px solid ${t.border}`,borderRadius:11,padding:"5px",boxShadow:`0 8px 30px ${t.overlay}`,minWidth:170,animation:"fadeUp 0.15s ease"}}>
          {[
            { icon:"✏", label:"Rename", action:()=>{ const c=conversations.find(x=>x.id===menu.id); setRenaming(menu.id); setRenameVal(c?.title||""); setMenu(null); }},
            { icon:conversations.find(x=>x.id===menu.id)?.pinned?"📌":"📌", label:conversations.find(x=>x.id===menu.id)?.pinned?"Unpin":"Pin to top", action:()=>{ onPin(menu.id); setMenu(null); }},
            { icon:"⎘", label:"Duplicate", action:()=>{ const c=conversations.find(x=>x.id===menu.id); if(c){const nc={...c,id:Date.now(),title:c.title+" (copy)",createdAt:Date.now(),pinned:false}; onNew(nc);} setMenu(null); }, divider:true },
            { icon:"🗑", label:"Delete", color:t.red, action:()=>{ setConfirmDelete(menu.id); setMenu(null); }},
          ].map((item,i)=>(
            <div key={i}>
              {item.divider&&<div style={{height:1,background:t.border,margin:"4px 0"}}/>}
              <button onClick={item.action} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"8px 12px",borderRadius:8,border:"none",background:"none",cursor:"pointer",fontSize:13,color:item.color||t.text,fontWeight:item.color?600:400,transition:"background 0.12s",textAlign:"left"}}
                onMouseEnter={e=>e.currentTarget.style.background=item.color?t.redSoft:t.card}
                onMouseLeave={e=>e.currentTarget.style.background="none"}
              >
                <span style={{fontSize:13,width:18,textAlign:"center"}}>{item.icon}</span>
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete&&(
        <div style={{position:"fixed",inset:0,zIndex:99999,background:t.overlay,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setConfirmDelete(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:t.sidebar,border:`1px solid ${t.border}`,borderRadius:16,padding:"24px",maxWidth:320,width:"90%",boxShadow:`0 16px 50px ${t.overlay}`,animation:"fadeUp 0.2s ease"}}>
            <div style={{fontSize:28,textAlign:"center",marginBottom:12}}>🗑</div>
            <h3 style={{margin:"0 0 8px",fontSize:16,fontWeight:700,color:t.text,textAlign:"center"}}>Delete Chat?</h3>
            <p style={{margin:"0 0 20px",fontSize:13,color:t.textMuted,textAlign:"center",lineHeight:1.5}}>
              "<strong>{conversations.find(c=>c.id===confirmDelete)?.title}</strong>" will be permanently deleted.
            </p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setConfirmDelete(null)} style={{flex:1,padding:"9px",borderRadius:10,border:`1px solid ${t.border}`,background:"none",color:t.textMuted,cursor:"pointer",fontSize:13,fontWeight:500}}>Cancel</button>
              <button onClick={()=>{onDelete(confirmDelete);setConfirmDelete(null);}} style={{flex:1,padding:"9px",borderRadius:10,border:"none",background:t.red,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatRow({ c, activeId, onSelect, onRightClick, renaming, renameVal, setRenameVal, onRenameCommit, onRenameCancel, collapsed, t }) {
  const ag = AGENTS.find(a=>a.id===c.agentId)||AGENTS[0];
  const isActive = c.id===activeId;
  const inputRef = useRef(null);
  useEffect(()=>{ if(renaming===c.id) inputRef.current?.select(); },[renaming]);

  return (
    <div key={c.id} style={{position:"relative",marginBottom:1}}>
      {renaming===c.id&&!collapsed?(
        <input ref={inputRef} value={renameVal} onChange={e=>setRenameVal(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter")onRenameCommit();if(e.key==="Escape")onRenameCancel();}}
          onBlur={onRenameCommit}
          style={{width:"100%",padding:"7px 10px",borderRadius:8,border:`1px solid ${t.accent}`,background:t.inputBg,color:t.text,fontSize:12.5,fontFamily:"inherit",boxShadow:`0 0 0 2px ${t.accentSoft}`}}
          autoFocus
        />
      ):(
        <button onClick={()=>onSelect(c.id)} onContextMenu={e=>onRightClick(e,c.id)}
          style={{width:"100%",padding:collapsed?"9px":"7px 10px",borderRadius:8,border:`1px solid ${isActive?t.accentBorder:"transparent"}`,background:isActive?t.accentSoft:"none",color:isActive?t.accentText:t.textMuted,cursor:"pointer",fontSize:12.5,textAlign:"left",display:"flex",alignItems:"center",gap:8,transition:"all 0.12s",whiteSpace:"nowrap",overflow:"hidden"}}
          onMouseEnter={e=>{if(!isActive){e.currentTarget.style.background=t.card;e.currentTarget.style.borderColor=t.border;}}}
          onMouseLeave={e=>{if(!isActive){e.currentTarget.style.background="none";e.currentTarget.style.borderColor="transparent";}}}
          title={collapsed?c.title:undefined}
        >
          <span style={{fontSize:12,color:ag.color,flexShrink:0}}>{ag.icon}</span>
          {!collapsed&&(
            <>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",flex:1}}>{c.title}</span>
              {c.pinned&&<span style={{fontSize:9,opacity:0.5,flexShrink:0}}>📌</span>}
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ─── MEMORY PANEL ────────────────────────────────────────────────────────────
function MemoryPanel({ memories, onDelete, onAdd, t }) {
  const [newMem, setNewMem] = useState("");
  return (
    <div style={{padding:"20px",flex:1,overflowY:"auto"}}>
      <h3 style={{margin:"0 0 6px",fontSize:16,fontWeight:700,color:t.text}}>🧠 Memory</h3>
      <p style={{margin:"0 0 18px",fontSize:12.5,color:t.textMuted}}>Nova remembers these facts across all conversations</p>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <input value={newMem} onChange={e=>setNewMem(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newMem.trim()){onAdd(newMem.trim());setNewMem("");}}} placeholder="Add a memory…" style={{flex:1,padding:"8px 12px",borderRadius:9,border:`1px solid ${t.border}`,background:t.inputBg,color:t.text,fontSize:13,fontFamily:"inherit"}}/>
        <button onClick={()=>{if(newMem.trim()){onAdd(newMem.trim());setNewMem("");}}} style={{padding:"8px 14px",borderRadius:9,border:"none",background:t.accent,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>Add</button>
      </div>
      {memories.length===0&&<p style={{color:t.textDim,fontSize:13,textAlign:"center",padding:"30px 0"}}>No memories yet. Add facts about yourself for personalized responses.</p>}
      {memories.map((m,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,border:`1px solid ${t.border}`,background:t.card,marginBottom:8}}>
          <span style={{fontSize:14}}>🧠</span>
          <span style={{flex:1,fontSize:13,color:t.text}}>{m.text}</span>
          <span style={{fontSize:11,color:t.textDim}}>{ago(m.ts)}</span>
          <button onClick={()=>onDelete(i)} style={{background:"none",border:"none",cursor:"pointer",color:t.textDim,fontSize:14,padding:"2px 5px",borderRadius:4}}
            onMouseEnter={e=>e.currentTarget.style.color=t.red}
            onMouseLeave={e=>e.currentTarget.style.color=t.textDim}
          >×</button>
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS PANEL ──────────────────────────────────────────────────────────
function SettingsPanel({ settings, onChange, t, dark, toggleTheme }) {
  return (
    <div style={{padding:"20px",flex:1,overflowY:"auto"}}>
      <h3 style={{margin:"0 0 18px",fontSize:16,fontWeight:700,color:t.text}}>⚙ Settings</h3>
      {[
        {key:"streaming",label:"Streaming responses",desc:"Show responses as they generate"},
        {key:"wordCount",label:"Word & token count",desc:"Display stats under each response"},
        {key:"timestamps",label:"Timestamps",desc:"Show time on messages"},
        {key:"autoTitle",label:"Auto-title chats",desc:"Generate titles from first message"},
        {key:"soundFx",label:"Sound effects",desc:"Play sound when response completes"},
      ].map(s=>(
        <div key={s.key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 0",borderBottom:`1px solid ${t.border}`}}>
          <div>
            <p style={{margin:0,fontSize:14,color:t.text,fontWeight:500}}>{s.label}</p>
            <p style={{margin:"2px 0 0",fontSize:12,color:t.textMuted}}>{s.desc}</p>
          </div>
          <button onClick={()=>onChange(s.key,!settings[s.key])} style={{width:44,height:24,borderRadius:12,border:"none",background:settings[s.key]?t.accent:t.border,cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
            <div style={{position:"absolute",top:3,left:settings[s.key]?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
          </button>
        </div>
      ))}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 0",borderBottom:`1px solid ${t.border}`}}>
        <div>
          <p style={{margin:0,fontSize:14,color:t.text,fontWeight:500}}>Dark mode</p>
          <p style={{margin:"2px 0 0",fontSize:12,color:t.textMuted}}>Toggle light/dark theme</p>
        </div>
        <button onClick={toggleTheme} style={{width:44,height:24,borderRadius:12,border:"none",background:dark?t.accent:t.border,cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
          <div style={{position:"absolute",top:3,left:dark?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
        </button>
      </div>
      <div style={{marginTop:20}}>
        <p style={{margin:"0 0 10px",fontSize:11,color:t.textMuted,fontWeight:600,letterSpacing:0.8,textTransform:"uppercase"}}>Response Style</p>
        {["concise","balanced","detailed"].map(s=>(
          <button key={s} onClick={()=>onChange("responseStyle",s)} style={{display:"block",width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${settings.responseStyle===s?t.accent:t.border}`,background:settings.responseStyle===s?t.accentSoft:"none",color:settings.responseStyle===s?t.accentText:t.textMuted,cursor:"pointer",fontSize:13,textAlign:"left",marginBottom:6,fontWeight:settings.responseStyle===s?600:400,transition:"all 0.15s"}}>
            {s.charAt(0).toUpperCase()+s.slice(1)}{settings.responseStyle===s&&" ✓"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
let cid = 1;
function newConv(agentId="nova",modelId=DEF_MODEL.id) {
  return { id:cid++, title:"New Chat", messages:[], agentId, modelId, createdAt:Date.now() };
}

export default function NovaAI() {
  const { t, dark, toggle } = useTheme();
  const [convs, setConvs] = useState([newConv()]);
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [panel, setPanel] = useState(null); // null|"agents"|"memory"|"settings"
  const [agents, setAgents] = useState(AGENTS);
  const [memories, setMemories] = useState([
    {text:"The user is building a world-class AI chat app called Nova AI",ts:Date.now()-3600000},
  ]);
  const [settings, setSettings] = useState({streaming:true,wordCount:true,timestamps:true,autoTitle:true,soundFx:false,responseStyle:"balanced"});
  const [showAgentBuilder, setShowAgentBuilder] = useState(false);
  const endRef = useRef(null);
  const abortRef = useRef(null);
  const inputRef = useRef(null);

  const active = convs.find(c=>c.id===activeId);
  const messages = active?.messages||[];
  const agentId = active?.agentId||"nova";
  const modelId = active?.modelId||DEF_MODEL.id;
  const currentAgent = agents.find(a=>a.id===agentId)||agents[0];
  const currentModel = MODELS.find(m=>m.id===modelId)||DEF_MODEL;

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const setCF = (id,f,v) => setConvs(cs=>cs.map(c=>c.id===id?{...c,[f]:v}:c));
  const addMsg = (cid,msg) => setConvs(cs=>cs.map(c=>c.id===cid?{...c,messages:[...c.messages,msg]}:c));
  const patchLast = (cid,patch) => setConvs(cs=>cs.map(c=>{
    if(c.id!==cid) return c;
    const ms=[...c.messages]; const l=ms[ms.length-1];
    if(l?.role==="assistant") ms[ms.length-1]={...l,...patch};
    return {...c,messages:ms};
  }));

  const buildSystem = useCallback((agent) => {
    let sys = agent.system||"";
    if(memories.length>0) {
      sys += `\n\nUser memories:\n${memories.map(m=>`- ${m.text}`).join("\n")}`;
    }
    if(settings.responseStyle==="concise") sys+="\n\nBe concise and to the point.";
    if(settings.responseStyle==="detailed") sys+="\n\nBe thorough and detailed in your responses.";
    return sys;
  },[memories,settings.responseStyle]);

  const send = useCallback(async (text) => {
    const txt=(text||input).trim();
    if(!txt||loading) return;
    setInput("");
    const convId=activeId;
    const isFirst=(active?.messages||[]).length===0;
    const ag=agents.find(a=>a.id===agentId)||agents[0];
    const mId=modelId;

    addMsg(convId,{role:"user",content:txt,ts:Date.now()});
    if(isFirst&&settings.autoTitle) setCF(convId,"title",txt.slice(0,38)+(txt.length>38?"…":""));
    addMsg(convId,{role:"assistant",content:"",streaming:true,modelId:mId,agentId,ts:Date.now()});
    setLoading(true);

    const history=[...(active?.messages||[]),{role:"user",content:txt}]
      .filter(m=>m.role!=="assistant"||m.content)
      .map(m=>({role:m.role,content:m.content}));

    try {
      abortRef.current=new AbortController();
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},signal:abortRef.current.signal,
        body:JSON.stringify({
          model:mId,max_tokens:1500,
          system:buildSystem(ag),
          messages:history,
          stream:settings.streaming,
        }),
      });

      if(settings.streaming) {
        const reader=res.body.getReader(); const dec=new TextDecoder(); let full="";
        while(true){
          const{done,value}=await reader.read(); if(done) break;
          for(const line of dec.decode(value).split("\n")){
            if(line.startsWith("data: ")){
              const d=line.slice(6); if(d==="[DONE]") continue;
              try{const j=JSON.parse(d);if(j.type==="content_block_delta"&&j.delta?.text){full+=j.delta.text;patchLast(convId,{content:full,streaming:true});}}catch{}
            }
          }
        }
        patchLast(convId,{content:full,streaming:false});
      } else {
        const data=await res.json();
        const content=data.content?.map(b=>b.text||"").join("")||"";
        patchLast(convId,{content,streaming:false});
      }
    } catch(e) {
      if(e.name!=="AbortError") patchLast(convId,{content:"⚠️ Something went wrong. Please try again.",streaming:false});
    } finally { setLoading(false); }
  },[input,loading,activeId,active,agentId,modelId,agents,settings,buildSystem]);

  const handleKey = e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} };

  const starters = AGENT_STARTERS[agentId]||AGENT_STARTERS.nova;

  return (
    <div style={{display:"flex",height:"100vh",background:t.bg,fontFamily:"'Inter','SF Pro Display',system-ui,sans-serif",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${t.thumb};border-radius:4px}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes dotPulse{0%,100%{box-shadow:0 0 0 0 currentColor}50%{box-shadow:0 0 0 4px transparent}}
        @keyframes shimmer{0%{opacity:0.6}50%{opacity:1}100%{opacity:0.6}}
        textarea:focus,input:focus,select:focus{outline:none}
        input,select{font-family:inherit}
      `}</style>

      <Sidebar conversations={convs} activeId={activeId}
        onSelect={id=>{setActiveId(id);setPanel(null);}}
        onNew={(preset)=>{
          if(preset&&preset.messages){
            setConvs(cs=>[preset,...cs]);
            setActiveId(preset.id);
          } else {
            const c=newConv(agentId,modelId);
            setConvs(cs=>[c,...cs]);
            setActiveId(c.id);
          }
          setPanel(null);
        }}
        onDelete={id=>{
          setConvs(cs=>{
            const remaining=cs.filter(c=>c.id!==id);
            if(remaining.length===0){
              const fresh=newConv(agentId,modelId);
              setActiveId(fresh.id);
              return [fresh];
            }
            if(id===activeId) setActiveId(remaining[0].id);
            return remaining;
          });
        }}
        onRename={(id,title)=>setCF(id,"title",title)}
        onPin={id=>setCF(id,"pinned",!convs.find(c=>c.id===id)?.pinned)}
        t={t} collapsed={collapsed} onToggle={()=>setCollapsed(v=>!v)}
        panel={panel} setPanel={setPanel}
      />

      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {/* TOPBAR */}
        <div style={{height:52,borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",padding:"0 14px",gap:8,background:t.sidebar,flexShrink:0}}>
          {/* Agent pill */}
          <button onClick={()=>setPanel(p=>p==="agents"?null:"agents")} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 11px 5px 8px",background:panel==="agents"?currentAgent.color+"22":t.card,border:`1px solid ${panel==="agents"?currentAgent.color:t.border}`,borderRadius:20,cursor:"pointer",transition:"all 0.15s"}}
            onMouseEnter={e=>{if(panel!=="agents"){e.currentTarget.style.borderColor=currentAgent.color;e.currentTarget.style.background=currentAgent.color+"18";}}}
            onMouseLeave={e=>{if(panel!=="agents"){e.currentTarget.style.borderColor=t.border;e.currentTarget.style.background=t.card;}}}
          >
            <span style={{fontSize:14,color:currentAgent.color}}>{currentAgent.icon}</span>
            <span style={{fontSize:12.5,fontWeight:600,color:t.text,whiteSpace:"nowrap"}}>{currentAgent.name}</span>
            <span style={{fontSize:11,color:t.textMuted}}>▾</span>
          </button>

          <div style={{flex:1}}/>

          {/* Token/message count */}
          {messages.length>0&&(
            <div style={{display:"flex",gap:6,alignItems:"center",padding:"4px 10px",borderRadius:8,background:t.card,border:`1px solid ${t.border}`}}>
              <span style={{fontSize:11,color:t.textDim}}>{messages.length} msgs</span>
              <span style={{color:t.textDim,fontSize:11}}>·</span>
              <span style={{fontSize:11,color:t.textDim}}>~{estimateTokens(messages.map(m=>m.content||"").join(" "))} tokens</span>
            </div>
          )}

          <ModelPicker current={currentModel} onSelect={m=>setCF(activeId,"modelId",m.id)} t={t}/>

          {/* Theme */}
          <button onClick={toggle} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:8,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:t.textMuted,transition:"all 0.15s",flexShrink:0}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=t.accent}
            onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}
          >{dark?"☀":"☽"}</button>
        </div>

        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          {/* SIDE PANEL */}
          {panel&&(
            <div style={{width:360,flexShrink:0,borderRight:`1px solid ${t.border}`,background:t.sidebar,display:"flex",flexDirection:"column",overflow:"hidden",animation:"fadeUp 0.2s ease"}}>
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:14,fontWeight:700,color:t.text}}>{panel==="agents"?"🤖 Agents":panel==="memory"?"🧠 Memory":panel==="settings"?"⚙ Settings":""}</span>
                <button onClick={()=>setPanel(null)} style={{background:"none",border:"none",cursor:"pointer",color:t.textMuted,fontSize:18,lineHeight:1,padding:"2px 6px",borderRadius:5,transition:"color 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.color=t.text}
                  onMouseLeave={e=>e.currentTarget.style.color=t.textMuted}
                >×</button>
              </div>

              {panel==="agents"&&(
                <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
                  {showAgentBuilder
                    ? <CustomAgentBuilder t={t} onCancel={()=>setShowAgentBuilder(false)} onSave={ag=>{setAgents(a=>[...a.filter(x=>!x.isCustom||x.id===ag.id),ag]);setCF(activeId,"agentId",ag.id);setShowAgentBuilder(false);setPanel(null);}}/>
                    : <>
                        <p style={{fontSize:12,color:t.textMuted,marginBottom:12,padding:"0 2px"}}>Choose an AI agent with specialized skills and personality</p>
                        {agents.filter(a=>!a.isCustom).map(ag=>(
                          <AgentCard key={ag.id} agent={ag} active={ag.id===agentId} t={t} onSelect={a=>{setCF(activeId,"agentId",a.id);setPanel(null);}}/>
                        ))}
                        <button onClick={()=>setShowAgentBuilder(true)} style={{width:"100%",padding:"12px",borderRadius:12,border:`2px dashed ${t.border}`,background:"none",color:t.textMuted,cursor:"pointer",fontSize:13,fontWeight:500,transition:"all 0.15s",marginTop:4}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=t.accent;e.currentTarget.style.color=t.accentText;}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.textMuted;}}
                        >+ Build Custom Agent</button>
                      </>
                  }
                </div>
              )}

              {panel==="memory"&&<MemoryPanel memories={memories} onDelete={i=>setMemories(m=>m.filter((_,idx)=>idx!==i))} onAdd={text=>setMemories(m=>[{text,ts:Date.now()},...m])} t={t}/>}

              {panel==="settings"&&<SettingsPanel settings={settings} onChange={(k,v)=>setSettings(s=>({...s,[k]:v}))} t={t} dark={dark} toggleTheme={toggle}/>}
            </div>
          )}

          {/* CHAT AREA */}
          <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>
            <div style={{flex:1,overflowY:"auto",padding:"0 20px"}}>
              {messages.length===0?(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:22,animation:"fadeUp 0.5s ease"}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{width:60,height:60,borderRadius:16,background:currentAgent.color+"22",border:`2px solid ${currentAgent.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 14px"}}>{currentAgent.icon}</div>
                    <h2 style={{fontSize:22,fontWeight:800,color:t.text,letterSpacing:-0.5,marginBottom:6}}>
                      {currentAgent.name} <span style={{color:t.accent,fontWeight:400,fontSize:18}}>ready</span>
                    </h2>
                    <p style={{color:t.textMuted,fontSize:13.5,marginBottom:4}}>{currentAgent.subtitle}</p>
                    <p style={{color:t.textDim,fontSize:12}}>{currentModel.full} · {currentModel.ctx} context</p>
                    {currentAgent.tools?.length>0&&(
                      <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:10,flexWrap:"wrap"}}>
                        {currentAgent.tools.map(tool=>TOOLS_META[tool]&&(
                          <span key={tool} style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:t.card,border:`1px solid ${t.border}`,color:t.textMuted}}>{TOOLS_META[tool].icon} {TOOLS_META[tool].label}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,width:"100%",maxWidth:520}}>
                    {starters.map((s,i)=>(
                      <button key={i} onClick={()=>send(s)} style={{padding:"11px 14px",borderRadius:12,border:`1px solid ${t.border}`,background:t.card,color:t.textMuted,cursor:"pointer",fontSize:13,textAlign:"left",lineHeight:1.4,transition:"all 0.15s"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=currentAgent.color;e.currentTarget.style.color=t.text;e.currentTarget.style.background=currentAgent.color+"12";}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.textMuted;e.currentTarget.style.background=t.card;}}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              ):(
                <div style={{maxWidth:740,margin:"0 auto",paddingBottom:20}}>
                  {messages.map((msg,i)=>{
                    const ag=agents.find(a=>a.id===msg.agentId)||currentAgent;
                    const mod=MODELS.find(m=>m.id===msg.modelId)||currentModel;
                    return <Message key={i} msg={msg} t={t} agent={ag} model={mod}/>;
                  })}
                  <div ref={endRef}/>
                </div>
              )}
            </div>

            {/* INPUT */}
            <div style={{padding:"10px 20px 16px",borderTop:`1px solid ${t.border}`,background:t.sidebar,flexShrink:0}}>
              <div style={{maxWidth:740,margin:"0 auto",background:t.inputBg,border:`1px solid ${loading?currentAgent.color:t.inputBorder}`,borderRadius:16,padding:"10px 13px 8px",display:"flex",flexDirection:"column",gap:8,transition:"border-color 0.2s, box-shadow 0.2s",boxShadow:loading?`0 0 0 3px ${currentAgent.color}22`:"none"}}>
                <textarea value={input} ref={inputRef} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
                  placeholder={`Message ${currentAgent.name}…`} rows={1}
                  style={{background:"none",border:"none",resize:"none",color:t.text,fontSize:14,lineHeight:1.65,width:"100%",fontFamily:"inherit",caretColor:currentAgent.color,maxHeight:180,overflowY:"auto"}}
                  onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,180)+"px";}}
                />
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <Dot color={loading?currentAgent.color:t.textDim} pulse={loading}/>
                    <span style={{fontSize:11.5,color:t.textMuted,fontWeight:500}}>{currentAgent.name}</span>
                    <span style={{fontSize:11,color:t.textDim}}>·</span>
                    <span style={{fontSize:11,color:t.textDim}}>{currentModel.label}</span>
                    {memories.length>0&&<span style={{fontSize:10,padding:"1px 6px",borderRadius:10,background:t.accentSoft,color:t.accentText}}>🧠 {memories.length}</span>}
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {input.trim()&&<span style={{fontSize:11,color:t.textDim}}>{countWords(input)}w</span>}
                    {loading&&<button onClick={()=>abortRef.current?.abort()} style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${t.red}44`,background:t.redSoft,color:t.red,cursor:"pointer",fontSize:12,fontWeight:500}}>■ Stop</button>}
                    <button onClick={()=>send()} disabled={!input.trim()||loading} style={{padding:"6px 18px",borderRadius:10,border:"none",background:input.trim()&&!loading?currentAgent.color:t.border,color:input.trim()&&!loading?"#fff":t.textDim,cursor:input.trim()&&!loading?"pointer":"not-allowed",fontSize:13,fontWeight:700,transition:"all 0.15s",display:"flex",alignItems:"center",gap:5}}>
                      {loading?<span style={{width:13,height:13,border:"2px solid #fff4",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>:"Send ↑"}
                    </button>
                  </div>
                </div>
              </div>
              <p style={{textAlign:"center",fontSize:10.5,color:t.textDim,marginTop:7}}>Nova AI · {agents.length} agents · {MODELS.length} models · Responses may be inaccurate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
