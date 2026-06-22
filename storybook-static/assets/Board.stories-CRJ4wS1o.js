import{j as e}from"./jsx-runtime-jW5tO4-1.js";import{r as k}from"./iframe-BqjRyM6M.js";import"./preload-helper-C1FmrZbK.js";const Be={9:1,10:2,J:3,Q:4,K:5,A:6};function Qe(l,g){return Be[g]+(l-1)*6}const De={0:{name:"Alpha Ranger",color:"#818cf8",bg:"rgba(99, 102, 241, 0.15)",border:"#6366f1"},1:{name:"Vortex Phantom",color:"#34d399",bg:"rgba(52, 211, 153, 0.15)",border:"#10b981"},2:{name:"Nebula Sentinel",color:"#f472b6",bg:"rgba(244, 114, 182, 0.15)",border:"#ec4899"}},Pe=()=>e.jsx("style",{children:`
    @keyframes pulse-gold {
      0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5); border-color: rgba(245, 158, 11, 1); }
      70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); border-color: rgba(245, 158, 11, 0.5); }
      100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); border-color: rgba(245, 158, 11, 0.3); }
    }
    @keyframes pulse-green {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
      70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    @keyframes pulse-red {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
      70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    @keyframes rotate-maldito {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .glowing-gold {
      animation: pulse-gold 2s infinite;
    }
    .glowing-green {
      animation: pulse-green 1.5s infinite;
    }
    .glowing-red {
      animation: pulse-red 1.5s infinite;
    }
    .spin-maldito {
      animation: rotate-maldito 6s linear infinite;
    }
  `}),ue=({G:l,ctx:g,moves:b,playerID:y,reset:h})=>{var K,W,L;const[P,pe]=k.useState(1),[I,xe]=k.useState("9"),[u,ge]=k.useState("0"),f=!!g.gameover,m=g.phase,A=g.currentPlayer,be=()=>{b.handleDirectionChange()},ye=n=>{n.preventDefault(),b.submitBid({amount:P,symbol:I})},he=()=>{b.disbelieve()},O=(n,t)=>{b.castVote(t)},fe=()=>{b.resolveDevilDice()},d=n=>De[n]||{name:`Player ${n}`,color:"#9ca3af",bg:"rgba(156, 163, 175, 0.15)",border:"#9ca3af"},z=Qe(P,I),w=l.currentBid===null||z>l.currentBid.value,me=()=>{const n=A===y||!y;return e.jsxs("div",{style:r.card,children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"},children:[e.jsx("h3",{style:r.cardTitle,children:"Bidding Phase Controls"}),e.jsx("span",{style:{...r.badge,backgroundColor:n?"rgba(56, 189, 248, 0.15)":"rgba(239, 68, 68, 0.15)",color:n?"#38bdf8":"#ef4444",borderColor:n?"rgba(56, 189, 248, 0.3)":"rgba(239, 68, 68, 0.3)"},children:n?"Your Action":"Waiting for Active Player"})]}),e.jsx("div",{style:r.buttonGroup,children:e.jsx("button",{type:"button",onClick:be,disabled:l.currentBid!==null||f,style:{...r.button,...l.currentBid===null?r.primaryButton:r.disabledButton,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"},children:l.currentBid!==null?"🔒 Direction Locked":`🔄 Invert Direction (Current: ${l.direction})`})}),e.jsxs("form",{onSubmit:ye,style:r.form,children:[e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"15px"},children:[e.jsxs("div",{style:r.formGroup,children:[e.jsx("label",{style:r.label,children:"Dice Amount"}),e.jsx("input",{type:"number",min:1,value:P,onChange:t=>pe(parseInt(t.target.value)||1),style:r.input})]}),e.jsxs("div",{style:r.formGroup,children:[e.jsx("label",{style:r.label,children:"Symbol"}),e.jsxs("select",{value:I,onChange:t=>xe(t.target.value),style:r.select,children:[e.jsx("option",{value:"9",children:"9"}),e.jsx("option",{value:"10",children:"10"}),e.jsx("option",{value:"J",children:"J (Jota)"}),e.jsx("option",{value:"Q",children:"Q (Reina)"}),e.jsx("option",{value:"K",children:"K (Rey)"}),e.jsx("option",{value:"A",children:"A (As)"})]})]})]}),e.jsxs("div",{style:r.bidPreview,children:[e.jsx("span",{children:"Proposed Bid Value:"}),e.jsxs("strong",{style:{color:w?"#34d399":"#ef4444"},children:[z," pts ",l.currentBid?`(Required > ${l.currentBid.value})`:""]})]}),e.jsx("button",{type:"submit",disabled:!w||f,style:{...r.button,...w?r.successButton:r.disabledButton,width:"100%",fontSize:"15px",fontWeight:"bold"},children:"Submit Bid"})]}),l.currentBid&&e.jsx("div",{style:{marginTop:"15px",borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:"15px"},children:e.jsx("button",{onClick:he,disabled:f,style:{...r.button,...r.dangerButton,width:"100%",fontWeight:"bold"},children:'✋ Declaro "No Creo" (Challenge)'})})]})},ve=()=>{var s,c,i;const n=Object.keys(l.players).filter(o=>l.players[o].diceCount>0),t=l.votes||{};return e.jsx("div",{style:r.overlay,children:e.jsxs("div",{style:r.modal,children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:"20px"},children:[e.jsx("span",{style:{fontSize:"32px"},children:"🗳️"}),e.jsx("h2",{style:{margin:"10px 0 5px 0",color:"#f3f4f6"},children:"Collective Voting Phase"}),e.jsxs("p",{style:{color:"#9ca3af",fontSize:"14px",margin:0},children:["Player ",e.jsx("strong",{children:d(l.challengerId||"").name})," challenged the active bid."]})]}),e.jsxs("div",{style:r.bidHighlightBox,children:[e.jsx("div",{style:{fontSize:"12px",textTransform:"uppercase",letterSpacing:"0.05em",color:"#9ca3af"},children:"Current Bid to Validate"}),e.jsxs("div",{style:{fontSize:"24px",fontWeight:"bold",color:"#f59e0b",margin:"5px 0"},children:[(s=l.currentBid)==null?void 0:s.amount," x ",(c=l.currentBid)==null?void 0:c.symbol]}),e.jsxs("div",{style:{fontSize:"11px",color:"#9ca3af"},children:["Bid placed by: ",d(((i=l.currentBid)==null?void 0:i.playerId)||"").name]})]}),e.jsx("h4",{style:{color:"#f3f4f6",margin:"15px 0 8px 0",fontSize:"14px"},children:"Active Voters Progress"}),e.jsx("div",{style:r.voterList,children:n.map(o=>{const a=t[o]!==void 0,p=d(o);return e.jsxs("div",{style:r.voterRow,children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px"},children:[e.jsx("div",{style:{...r.avatarSmall,backgroundColor:p.bg,color:p.color,borderColor:p.border},children:o}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"14px",fontWeight:"500",color:"#f3f4f6"},children:p.name}),e.jsx("div",{style:{fontSize:"11px",color:"#9ca3af"},children:o===y?"You":"Opponent"})]})]}),a?e.jsxs("span",{style:{...r.badge,backgroundColor:t[o]?"rgba(16, 185, 129, 0.15)":"rgba(239, 68, 68, 0.15)",color:t[o]?"#10b981":"#ef4444",borderColor:t[o]?"rgba(16, 185, 129, 0.3)":"rgba(239, 68, 68, 0.3)"},children:["✓ ",t[o]?"Believes":"Disbelieves"]}):e.jsx("span",{style:{...r.badge,backgroundColor:"rgba(255, 255, 255, 0.05)",color:"#9ca3af",borderColor:"rgba(255, 255, 255, 0.1)"},children:"⏳ Pending..."})]},o)})}),e.jsxs("div",{style:{marginTop:"20px",borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:"15px"},children:[e.jsx("h4",{style:{color:"#f3f4f6",margin:"0 0 10px 0",textAlign:"center",fontSize:"13px"},children:"Cast Your Vote"}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"},children:[e.jsx("button",{onClick:()=>O(y||"0",!0),style:{...r.button,...r.successButton,padding:"12px"},children:"👍 Believe (Cree)"}),e.jsx("button",{onClick:()=>O(y||"0",!1),style:{...r.button,...r.dangerButton,padding:"12px"},children:"👎 Disbelieve (No Cree)"})]})]})]})})},Ce=()=>{var i,o,a;const n=((i=l.currentBid)==null?void 0:i.playerId)||"0",t=d(n),s=l.devilDiceResult===((o=l.currentBid)==null?void 0:o.symbol),c=s?"glowing-green":"glowing-red";return e.jsxs("div",{style:r.card,children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:"20px"},children:[e.jsx("span",{style:{display:"inline-block",fontSize:"32px"},className:"spin-maldito",children:"😈"}),e.jsx("h3",{style:{...r.cardTitle,margin:"10px 0 0 0"},children:"The Devil's Dice Reveal"}),e.jsx("p",{style:{color:"#9ca3af",fontSize:"13px",margin:"5px 0 0 0"},children:"Challenged bid is short by exactly one die. Bidder gets a chance to be saved!"})]}),e.jsxs("div",{style:r.devilDiceDisplay,children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{...r.avatarLarge,backgroundColor:t.bg,color:t.color,borderColor:t.border},children:n}),e.jsxs("strong",{style:{color:t.color,fontSize:"14px"},children:[t.name," (Bidder)"]})]}),e.jsx("div",{style:{fontSize:"24px",color:"#9ca3af"},children:"➔"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"},children:[e.jsx("div",{className:c,style:{...r.devilDieSlot,borderColor:s?"#10b981":"#ef4444",color:s?"#10b981":"#ef4444",backgroundColor:s?"rgba(16, 185, 129, 0.1)":"rgba(239, 68, 68, 0.1)"},children:l.devilDiceResult||"?"}),e.jsx("span",{style:{fontSize:"11px",color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.05em"},children:"Maldito Die"})]})]}),e.jsx("div",{style:{...r.devilResultBanner,backgroundColor:s?"rgba(16, 185, 129, 0.15)":"rgba(239, 68, 68, 0.15)",color:s?"#34d399":"#f87171",borderColor:s?"rgba(16, 185, 129, 0.3)":"rgba(239, 68, 68, 0.3)"},children:s?`✨ Saved! Rolled matching "${l.devilDiceResult}" symbol.`:`💀 Failed! Rolled "${l.devilDiceResult}" (needed "${(a=l.currentBid)==null?void 0:a.symbol}").`}),e.jsx("button",{onClick:fe,style:{...r.button,...r.primaryButton,width:"100%",fontWeight:"bold",padding:"12px",marginTop:"15px"},children:"Confirm & Resolve Round"})]})},je=()=>{if(!l.currentBid)return e.jsxs("div",{style:r.card,children:[e.jsx("h3",{style:r.cardTitle,children:"Resolution Phase"}),e.jsx("p",{style:{color:"#9ca3af"},children:"No current bid to resolve."})]});let n=0;const t={};for(const i in l.players)if(l.players[i].diceCount>0){const o=l.players[i].currentRoll.filter(a=>a===l.currentBid.symbol).length;n+=o,t[i]={roll:l.players[i].currentRoll,matching:o,vote:l.votes[i],losesDie:!1}}const s=l.devilDiceResult&&l.devilDiceResult===l.currentBid.symbol;s&&(n+=1);const c=l.currentBid.amount;for(const i in t){const o=t[i].vote;let a=!1;o===!1?n>=c&&(a=!0):n<c&&(a=!0),t[i].losesDie=a}return e.jsxs("div",{style:r.card,children:[e.jsx("h3",{style:r.cardTitle,children:"Round Revelation Scorecard"}),e.jsxs("p",{style:{color:"#9ca3af",fontSize:"13px",marginTop:0},children:["Everyone lifted their cups! Let's check the quantities of symbol ",e.jsxs("strong",{children:['"',l.currentBid.symbol,'"']}),"."]}),e.jsxs("div",{style:r.scoreSummaryBox,children:[e.jsxs("div",{children:[e.jsx("div",{style:r.summaryLabel,children:"Active Bid"}),e.jsxs("div",{style:{fontSize:"18px",fontWeight:"bold",color:"#f59e0b"},children:[c," x ",l.currentBid.symbol]})]}),e.jsxs("div",{style:{borderLeft:"1px solid rgba(255,255,255,0.08)",paddingLeft:"15px"},children:[e.jsx("div",{style:r.summaryLabel,children:"Total Found"}),e.jsxs("div",{style:{fontSize:"18px",fontWeight:"bold",color:"#38bdf8"},children:[n," x ",l.currentBid.symbol,s&&e.jsx("span",{style:{fontSize:"11px",color:"#10b981"},children:" (+1 Devil's Die)"})]})]}),e.jsxs("div",{style:{borderLeft:"1px solid rgba(255,255,255,0.08)",paddingLeft:"15px"},children:[e.jsx("div",{style:r.summaryLabel,children:"Outcome"}),e.jsx("div",{style:{fontSize:"18px",fontWeight:"bold",color:n>=c?"#10b981":"#ef4444"},children:n>=c?"Bid Met":"Bid Failed"})]})]}),e.jsx("div",{style:{overflowX:"auto",marginTop:"15px"},children:e.jsxs("table",{style:r.table,children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:r.th,children:"Player"}),e.jsx("th",{style:r.th,children:"Rolled Hand"}),e.jsx("th",{style:r.th,children:"Matches"}),e.jsx("th",{style:r.th,children:"Vote"}),e.jsx("th",{style:r.th,children:"Resolution Status"})]})}),e.jsx("tbody",{children:Object.keys(t).map(i=>{const o=d(i),a=t[i];return e.jsxs("tr",{style:{...r.tr,boxShadow:a.losesDie?"inset 0 0 10px rgba(239, 68, 68, 0.08)":"inset 0 0 10px rgba(16, 185, 129, 0.05)",borderColor:a.losesDie?"rgba(239, 68, 68, 0.2)":"rgba(16, 185, 129, 0.1)"},children:[e.jsx("td",{style:r.td,children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{...r.avatarSmall,backgroundColor:o.bg,color:o.color,borderColor:o.border},children:i}),e.jsx("span",{style:{fontWeight:"500",color:o.color},children:o.name})]})}),e.jsx("td",{style:r.td,children:e.jsx("div",{style:{display:"flex",gap:"3px"},children:a.roll.map((p,Re)=>{var T,J,E;return e.jsx("span",{style:{...r.die,borderColor:p===((T=l.currentBid)==null?void 0:T.symbol)?"#38bdf8":"rgba(255,255,255,0.1)",backgroundColor:p===((J=l.currentBid)==null?void 0:J.symbol)?"rgba(56, 189, 248, 0.15)":"rgba(255,255,255,0.05)",color:p===((E=l.currentBid)==null?void 0:E.symbol)?"#38bdf8":"#d1d5db"},children:p},Re)})})}),e.jsx("td",{style:{...r.td,textAlign:"center",color:"#f3f4f6"},children:e.jsx("strong",{children:a.matching})}),e.jsx("td",{style:r.td,children:e.jsx("span",{style:{...r.badge,backgroundColor:a.vote?"rgba(56, 189, 248, 0.1)":"rgba(245, 158, 11, 0.1)",color:a.vote?"#38bdf8":"#f59e0b",borderColor:a.vote?"rgba(56, 189, 248, 0.2)":"rgba(245, 158, 11, 0.2)"},children:a.vote?"Believe":"Disbelieve"})}),e.jsx("td",{style:r.td,children:a.losesDie?e.jsxs("span",{style:{color:"#f87171",fontWeight:"bold",display:"flex",alignItems:"center",gap:"5px"},children:["💥 Loses Die",e.jsxs("span",{style:{fontSize:"11px",fontWeight:"normal",color:"#9ca3af"},children:["(",a.vote?"Believed but failed":"Challenged but met",")"]})]}):e.jsx("span",{style:{color:"#34d399",fontWeight:"bold"},children:"🛡️ Saved"})})]},i)})})]})})]})},Se=()=>{var s;const n=((s=g.gameover)==null?void 0:s.winner)||"0",t=d(n);return e.jsx("div",{style:r.victoryContainer,children:e.jsxs("div",{style:r.victoryCard,children:[e.jsx("div",{style:r.victoryCup,children:"🏆"}),e.jsx("h1",{style:r.victoryTitle,children:"Victory Achieved!"}),e.jsx("p",{style:r.victorySubtitle,children:"The battle of dice has concluded."}),e.jsxs("div",{style:r.winnerProfile,children:[e.jsx("div",{style:{...r.avatarLarge,backgroundColor:t.bg,color:t.color,borderColor:t.border,width:"80px",height:"80px",lineHeight:"80px",fontSize:"36px",boxShadow:"0 0 20px rgba(56, 189, 248, 0.3)"},children:n}),e.jsx("h2",{style:{color:t.color,margin:"10px 0 0 0"},children:t.name}),e.jsx("span",{style:{...r.badge,backgroundColor:"rgba(56, 189, 248, 0.15)",color:"#38bdf8",borderColor:"rgba(56, 189, 248, 0.3)"},children:"Sole Survivor"})]}),e.jsxs("div",{style:r.matchHistorySummary,children:[e.jsx("h4",{style:{color:"#f3f4f6",margin:"0 0 10px 0",borderBottom:"1px solid rgba(255,255,255,0.08)",paddingBottom:"6px"},children:"Final Standings"}),Object.keys(l.players).map(c=>{const i=d(c),o=c===n;return e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:"13px"},children:[e.jsxs("span",{style:{color:i.color,fontWeight:o?"bold":"normal"},children:[i.name," ",o?"👑":""]}),e.jsxs("span",{style:{color:"#9ca3af"},children:[l.players[c].diceCount," dice remaining"]})]},c)})]}),e.jsx("button",{onClick:()=>h==null?void 0:h(),style:{...r.button,...r.primaryButton,width:"100%",padding:"12px",fontSize:"15px",fontWeight:"bold"},children:"Play Again"})]})})};return e.jsxs("div",{style:r.container,children:[e.jsx(Pe,{}),e.jsx("header",{style:r.header,children:e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs("div",{children:[e.jsx("h1",{style:r.title,children:"Cubilete Variation"}),e.jsx("p",{style:r.subtitle,children:"Developer Debugging Dashboard"})]}),e.jsx("button",{onClick:()=>h==null?void 0:h(),style:{...r.button,padding:"6px 12px",fontSize:"12px"},children:"🔄 Reset Game State"})]})}),e.jsxs("div",{style:r.statusBar,children:[e.jsxs("div",{style:r.statusCol,children:[e.jsx("span",{style:r.statusLabel,children:"Phase"}),e.jsx("strong",{style:{textTransform:"uppercase",color:"#38bdf8"},children:m})]}),e.jsxs("div",{style:r.statusCol,children:[e.jsx("span",{style:r.statusLabel,children:"Active Player"}),e.jsx("strong",{style:{color:d(A).color},children:d(A).name})]}),e.jsxs("div",{style:r.statusCol,children:[e.jsx("span",{style:r.statusLabel,children:"Direction"}),e.jsx("strong",{style:{color:"#f3f4f6"},children:l.direction})]})]}),e.jsxs("div",{style:r.grid,children:[e.jsxs("div",{style:r.leftCol,children:[e.jsxs("div",{style:r.card,children:[e.jsx("h3",{style:r.cardTitle,children:"Active Bid Table"}),l.currentBid?e.jsxs("div",{style:r.activeBidCard,children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{...r.avatarSmall,backgroundColor:d(l.currentBid.playerId).bg,color:d(l.currentBid.playerId).color,borderColor:d(l.currentBid.playerId).border},children:l.currentBid.playerId}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"13px",color:"#9ca3af"},children:"Bidder"}),e.jsx("div",{style:{fontSize:"14px",fontWeight:"bold",color:"#f3f4f6"},children:d(l.currentBid.playerId).name})]})]}),e.jsxs("span",{style:{...r.badge,backgroundColor:"rgba(245, 158, 11, 0.15)",color:"#f59e0b",borderColor:"rgba(245, 158, 11, 0.3)"},children:["Rank Value: ",l.currentBid.value]})]}),e.jsxs("div",{style:{fontSize:"32px",fontWeight:"bold",color:"#f3f4f6",textAlign:"center",padding:"15px 0",borderTop:"1px solid rgba(255,255,255,0.05)"},children:[l.currentBid.amount," x ",l.currentBid.symbol]})]}):e.jsx("div",{style:r.emptyState,children:"No bids placed yet this round. Waiting for first bid."})]}),e.jsxs("div",{style:r.card,children:[e.jsx("h3",{style:r.cardTitle,children:"Player Rosters"}),e.jsx("div",{style:r.tabs,children:Object.keys(l.players).map(n=>{const t=d(n),s=l.players[n].diceCount===0;return e.jsxs("button",{onClick:()=>ge(n),style:{...r.tabButton,borderBottom:u===n?`2px solid ${t.color}`:"none",color:u===n?"#f3f4f6":"#9ca3af",fontWeight:u===n?"bold":"normal",opacity:s?.5:1},children:["Player ",n," ",s?"(Dead)":""]},n)})}),e.jsxs("div",{style:r.tabContent,children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"15px"},children:[e.jsxs("div",{children:[e.jsx("div",{style:r.metaLabel,children:"Player Name"}),e.jsx("strong",{style:{color:d(u).color,fontSize:"16px"},children:d(u).name})]}),e.jsxs("div",{style:{textAlign:"right"},children:[e.jsx("div",{style:r.metaLabel,children:"Dice Count"}),e.jsx("strong",{style:{color:"#f3f4f6",fontSize:"18px"},children:(K=l.players[u])==null?void 0:K.diceCount})]})]}),((W=l.players[u])==null?void 0:W.hasQuintilla)&&e.jsxs("div",{className:"glowing-gold",style:r.quintillaBuffer,children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("span",{style:{fontSize:"20px"},children:"🌟"}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"12px",fontWeight:"bold",color:"#f59e0b"},children:"Quintilla Buffer Active"}),e.jsx("div",{style:{fontSize:"10px",color:"#d1d5db"},children:"Extra buffer life. Prevents next loss."})]})]}),e.jsx("div",{style:{...r.die,borderColor:"#f59e0b",backgroundColor:"rgba(245, 158, 11, 0.2)",color:"#f59e0b",fontWeight:"bold",width:"32px",height:"32px",lineHeight:"32px",margin:0},children:"+1"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{...r.metaLabel,marginBottom:"8px"},children:"Current Roll (Hidden to others)"}),e.jsx("div",{style:{display:"flex",gap:"6px"},children:(L=l.players[u])!=null&&L.currentRoll&&l.players[u].currentRoll.length>0?l.players[u].currentRoll.map((n,t)=>e.jsx("span",{style:r.die,children:n},t)):e.jsx("em",{style:{color:"#9ca3af",fontSize:"13px"},children:"None (Needs rolling)"})})]})]})]})]}),e.jsxs("div",{style:r.rightCol,children:[f&&Se(),!f&&e.jsxs(e.Fragment,{children:[m==="bidding"&&me(),m==="devilDice"&&Ce(),m==="resolution"&&je()]}),e.jsxs("div",{style:r.card,children:[e.jsx("h3",{style:r.cardTitle,children:"State Inspector"}),e.jsx("pre",{style:r.pre,children:JSON.stringify({G:l,ctx:g,playerID:y},null,2)})]})]})]}),!f&&m==="voting"&&ve()]})},r={container:{fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',maxWidth:"1200px",margin:"0 auto",padding:"24px",color:"#e5e7eb",backgroundColor:"#0b111e",minHeight:"100vh"},header:{borderBottom:"1px solid rgba(255, 255, 255, 0.08)",marginBottom:"20px",paddingBottom:"12px"},title:{color:"#f3f4f6",fontSize:"24px",fontWeight:"800",margin:0},subtitle:{color:"#9ca3af",margin:"4px 0 0 0",fontSize:"14px"},statusBar:{display:"flex",justifyContent:"space-between",backgroundColor:"rgba(22, 28, 45, 0.65)",padding:"12px 24px",borderRadius:"10px",marginBottom:"20px",border:"1px solid rgba(255, 255, 255, 0.06)"},statusCol:{display:"flex",flexDirection:"column",gap:"2px"},statusLabel:{fontSize:"11px",color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.05em"},grid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"},leftCol:{display:"flex",flexDirection:"column",gap:"20px"},rightCol:{display:"flex",flexDirection:"column",gap:"20px"},card:{border:"1px solid rgba(255, 255, 255, 0.08)",borderRadius:"12px",padding:"20px",backgroundColor:"rgba(22, 28, 45, 0.55)",boxShadow:"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",backdropFilter:"blur(8px)"},cardTitle:{fontSize:"16px",fontWeight:"bold",color:"#f3f4f6",margin:"0 0 15px 0"},buttonGroup:{display:"flex",gap:"10px",marginBottom:"15px"},button:{padding:"10px 16px",borderRadius:"6px",border:"1px solid rgba(255, 255, 255, 0.1)",cursor:"pointer",fontSize:"14px",backgroundColor:"rgba(255, 255, 255, 0.05)",color:"#f3f4f6",transition:"all 0.2s"},primaryButton:{backgroundColor:"#38bdf8",color:"#0b111e",border:"none",fontWeight:"600"},successButton:{backgroundColor:"#10b981",color:"#ffffff",border:"none",fontWeight:"600"},dangerButton:{backgroundColor:"#ef4444",color:"#ffffff",border:"none",fontWeight:"600"},disabledButton:{backgroundColor:"rgba(255, 255, 255, 0.02)",color:"#6b7280",borderColor:"rgba(255,255,255,0.03)",cursor:"not-allowed"},form:{display:"flex",flexDirection:"column",gap:"15px"},formGroup:{display:"flex",flexDirection:"column",gap:"5px"},label:{fontSize:"13px",fontWeight:"bold",color:"#9ca3af"},input:{padding:"10px",borderRadius:"6px",border:"1px solid rgba(255, 255, 255, 0.1)",backgroundColor:"rgba(0, 0, 0, 0.2)",color:"#f3f4f6"},select:{padding:"10px",borderRadius:"6px",border:"1px solid rgba(255, 255, 255, 0.1)",backgroundColor:"rgba(0, 0, 0, 0.2)",color:"#f3f4f6"},badge:{padding:"4px 8px",borderRadius:"12px",fontSize:"11px",fontWeight:"bold",border:"1px solid transparent"},activeBidCard:{backgroundColor:"rgba(0,0,0,0.15)",borderRadius:"8px",padding:"15px",border:"1px solid rgba(255,255,255,0.04)"},emptyState:{color:"#9ca3af",textAlign:"center",padding:"30px 0",fontSize:"13px",fontStyle:"italic"},bidPreview:{display:"flex",justifyContent:"space-between",fontSize:"13px",backgroundColor:"rgba(255,255,255,0.03)",padding:"8px 12px",borderRadius:"6px"},tabs:{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.08)",marginBottom:"15px",gap:"10px"},tabButton:{padding:"8px 4px",border:"none",backgroundColor:"transparent",cursor:"pointer",fontSize:"13px"},tabContent:{padding:"5px 0"},metaLabel:{fontSize:"11px",color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.05em"},die:{display:"inline-block",width:"34px",height:"34px",lineHeight:"32px",textAlign:"center",backgroundColor:"rgba(255, 255, 255, 0.05)",border:"1px solid rgba(255, 255, 255, 0.1)",borderRadius:"6px",fontWeight:"bold",fontSize:"14px",color:"#f3f4f6"},avatarSmall:{width:"28px",height:"28px",borderRadius:"50%",textAlign:"center",lineHeight:"26px",fontSize:"12px",fontWeight:"bold",border:"1px solid"},avatarLarge:{width:"56px",height:"56px",borderRadius:"50%",textAlign:"center",lineHeight:"54px",fontSize:"24px",fontWeight:"bold",border:"2px solid"},quintillaBuffer:{display:"flex",justifyContent:"space-between",alignItems:"center",backgroundColor:"rgba(245, 158, 11, 0.12)",border:"1px dashed #f59e0b",borderRadius:"8px",padding:"8px 12px",marginBottom:"15px"},pre:{backgroundColor:"rgba(0, 0, 0, 0.25)",padding:"12px",borderRadius:"6px",overflowX:"auto",maxHeight:"220px",fontSize:"11px",color:"#9ca3af",border:"1px solid rgba(255, 255, 255, 0.04)",fontFamily:"monospace"},overlay:{position:"fixed",top:0,left:0,width:"100%",height:"100%",backgroundColor:"rgba(7, 11, 20, 0.85)",display:"flex",justifyContent:"center",alignItems:"center",zIndex:999,backdropFilter:"blur(6px)"},modal:{backgroundColor:"#111827",border:"1px solid rgba(255, 255, 255, 0.1)",borderRadius:"16px",padding:"24px",width:"100%",maxWidth:"440px",boxShadow:"0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)"},bidHighlightBox:{backgroundColor:"rgba(255, 255, 255, 0.03)",borderRadius:"8px",padding:"12px",textAlign:"center",border:"1px solid rgba(255, 255, 255, 0.06)",marginBottom:"15px"},voterList:{display:"flex",flexDirection:"column",gap:"8px"},voterRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px",backgroundColor:"rgba(255,255,255,0.02)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.04)"},devilDiceDisplay:{display:"flex",justifyContent:"center",alignItems:"center",gap:"30px",margin:"20px 0"},devilDieSlot:{width:"56px",height:"56px",borderRadius:"12px",border:"3px solid",textAlign:"center",lineHeight:"50px",fontSize:"28px",fontWeight:"bold"},devilResultBanner:{padding:"10px",borderRadius:"8px",textAlign:"center",fontWeight:"bold",fontSize:"13px",border:"1px solid"},scoreSummaryBox:{display:"flex",backgroundColor:"rgba(255,255,255,0.03)",padding:"12px 15px",borderRadius:"8px",marginBottom:"15px",gap:"20px",border:"1px solid rgba(255,255,255,0.05)"},summaryLabel:{fontSize:"10px",textTransform:"uppercase",color:"#9ca3af"},table:{width:"100%",borderCollapse:"collapse"},th:{textAlign:"left",padding:"10px",fontSize:"11px",color:"#9ca3af",textTransform:"uppercase",borderBottom:"1px solid rgba(255, 255, 255, 0.08)"},tr:{borderBottom:"1px solid rgba(255, 255, 255, 0.05)"},td:{padding:"12px 10px",fontSize:"13px"},victoryContainer:{position:"fixed",top:0,left:0,width:"100%",height:"100%",backgroundColor:"#070a13",backgroundImage:"radial-gradient(circle at center, rgba(56, 189, 248, 0.12) 0%, transparent 70%)",display:"flex",justifyContent:"center",alignItems:"center",zIndex:1e3},victoryCard:{backgroundColor:"rgba(17, 24, 39, 0.8)",border:"1px solid rgba(56, 189, 248, 0.3)",borderRadius:"24px",padding:"40px",width:"100%",maxWidth:"480px",textAlign:"center",backdropFilter:"blur(12px)",boxShadow:"0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 189, 248, 0.15)"},victoryCup:{fontSize:"60px",marginBottom:"15px",filter:"drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))"},victoryTitle:{fontSize:"28px",fontWeight:"800",color:"#f3f4f6",margin:0},victorySubtitle:{color:"#9ca3af",fontSize:"14px",marginTop:"5px",marginBottom:"25px"},winnerProfile:{backgroundColor:"rgba(255, 255, 255, 0.03)",border:"1px solid rgba(255, 255, 255, 0.06)",borderRadius:"16px",padding:"20px",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",marginBottom:"25px"},matchHistorySummary:{textAlign:"left",backgroundColor:"rgba(0,0,0,0.2)",borderRadius:"12px",padding:"15px",marginBottom:"25px"}};ue.__docgenInfo={description:"",methods:[],displayName:"CubileteBoard"};var x=(l=>(l.CLOCKWISE="CLOCKWISE",l.COUNTERCLOCKWISE="COUNTERCLOCKWISE",l))(x||{});const ke={title:"Game/CubileteBoard",component:ue,parameters:{layout:"fullscreen"},args:{reset:()=>console.log("Reset clicked"),moves:{handleDirectionChange:()=>console.log("handleDirectionChange called"),submitBid:l=>console.log("submitBid called with",l),disbelieve:()=>console.log("disbelieve called"),castVote:l=>console.log("castVote called with",l),resolveDevilDice:()=>console.log("resolveDevilDice called")},playerID:"0"}},v={name:"Story A: Fresh Round Setup",args:{G:{players:{0:{diceCount:5,currentRoll:["9","10","J","Q","K"],hasQuintilla:!1},1:{diceCount:5,currentRoll:["A","A","10","J","Q"],hasQuintilla:!1},2:{diceCount:5,currentRoll:["9","10","J","Q","K"],hasQuintilla:!1}},direction:x.CLOCKWISE,currentBid:null,votes:{},challengerId:null,devilDiceResult:null},ctx:{numPlayers:3,turn:1,currentPlayer:"0",playOrder:["0","1","2"],playOrderPos:0,phase:"bidding",activePlayers:null}}},C={name:"Story B: Mid-Bidding Table Escalation",args:{G:{players:{0:{diceCount:5,currentRoll:["Q","Q","10","J","A"],hasQuintilla:!1},1:{diceCount:5,currentRoll:["A","9","J","K","K"],hasQuintilla:!1},2:{diceCount:5,currentRoll:["9","10","J","Q","Q"],hasQuintilla:!1}},direction:x.CLOCKWISE,currentBid:{amount:3,symbol:"Q",value:16,playerId:"1"},votes:{},challengerId:null,devilDiceResult:null},ctx:{numPlayers:3,turn:4,currentPlayer:"0",playOrder:["0","1","2"],playOrderPos:0,phase:"bidding",activePlayers:null}}},j={name:"Story C: Collective Voting Overlay",args:{G:{players:{0:{diceCount:5,currentRoll:["9","Q","K","A","10"],hasQuintilla:!1},1:{diceCount:4,currentRoll:["10","J","Q","9"],hasQuintilla:!1},2:{diceCount:5,currentRoll:["Q","Q","Q","10","J"],hasQuintilla:!1}},direction:x.CLOCKWISE,currentBid:{amount:4,symbol:"Q",value:22,playerId:"0"},votes:{0:!0},challengerId:"1",devilDiceResult:null},ctx:{numPlayers:3,turn:5,currentPlayer:"1",playOrder:["0","1","2"],playOrderPos:1,phase:"voting",activePlayers:{0:"voteStage",1:"voteStage",2:"voteStage"}}}},S={name:"Story D: Devil's Dice Reveal (Saved)",args:{G:{players:{0:{diceCount:5,currentRoll:["K","9","10","10","A"],hasQuintilla:!1},1:{diceCount:4,currentRoll:["K","J","Q","9"],hasQuintilla:!1},2:{diceCount:5,currentRoll:["K","K","J","10","A"],hasQuintilla:!1}},direction:x.CLOCKWISE,currentBid:{amount:5,symbol:"K",value:29,playerId:"0"},votes:{0:!0,1:!1,2:!1},challengerId:"1",devilDiceResult:"K"},ctx:{numPlayers:3,turn:5,currentPlayer:"0",playOrder:["0","1","2"],playOrderPos:0,phase:"devilDice",activePlayers:null}}},R={name:"Story D: Devil's Dice Reveal (Failed)",args:{G:{players:{0:{diceCount:5,currentRoll:["K","9","10","10","A"],hasQuintilla:!1},1:{diceCount:4,currentRoll:["K","J","Q","9"],hasQuintilla:!1},2:{diceCount:5,currentRoll:["K","K","J","10","A"],hasQuintilla:!1}},direction:x.CLOCKWISE,currentBid:{amount:5,symbol:"K",value:29,playerId:"0"},votes:{0:!0,1:!1,2:!1},challengerId:"1",devilDiceResult:"A"},ctx:{numPlayers:3,turn:5,currentPlayer:"0",playOrder:["0","1","2"],playOrderPos:0,phase:"devilDice",activePlayers:null}}},B={name:"Story E: Round Revelation Scorecard",args:{G:{players:{0:{diceCount:5,currentRoll:["Q","Q","9","10","A"],hasQuintilla:!1},1:{diceCount:4,currentRoll:["Q","J","10","9"],hasQuintilla:!1},2:{diceCount:5,currentRoll:["9","9","10","J","A"],hasQuintilla:!1}},direction:x.CLOCKWISE,currentBid:{amount:4,symbol:"Q",value:22,playerId:"0"},votes:{0:!0,1:!1,2:!0},challengerId:"1",devilDiceResult:null},ctx:{numPlayers:3,turn:6,currentPlayer:"0",playOrder:["0","1","2"],playOrderPos:0,phase:"resolution",activePlayers:null}}},Q={name:"Story F: Quintilla Glow Buffer",args:{G:{players:{0:{diceCount:5,currentRoll:["9","10","J","Q","K"],hasQuintilla:!1},1:{diceCount:6,currentRoll:["Q","Q","Q","Q","Q"],hasQuintilla:!0},2:{diceCount:5,currentRoll:["9","10","J","Q","K"],hasQuintilla:!1}},direction:x.CLOCKWISE,currentBid:null,votes:{},challengerId:null,devilDiceResult:null},ctx:{numPlayers:3,turn:1,currentPlayer:"0",playOrder:["0","1","2"],playOrderPos:0,phase:"bidding",activePlayers:null},playerID:"1"}},D={name:"Story G: Victory Screen",args:{G:{players:{0:{diceCount:0,currentRoll:[],hasQuintilla:!1},1:{diceCount:4,currentRoll:["9","Q","A","J"],hasQuintilla:!1},2:{diceCount:0,currentRoll:[],hasQuintilla:!1}},direction:x.CLOCKWISE,currentBid:null,votes:{},challengerId:null,devilDiceResult:null},ctx:{numPlayers:3,turn:14,currentPlayer:"1",playOrder:["0","1","2"],playOrderPos:1,phase:"bidding",activePlayers:null,gameover:{winner:"1"}}}};var V,F,H;v.parameters={...v.parameters,docs:{...(V=v.parameters)==null?void 0:V.docs,source:{originalSource:`{
  name: 'Story A: Fresh Round Setup',
  args: {
    G: {
      players: {
        '0': {
          diceCount: 5,
          currentRoll: ['9', '10', 'J', 'Q', 'K'],
          hasQuintilla: false
        },
        '1': {
          diceCount: 5,
          currentRoll: ['A', 'A', '10', 'J', 'Q'],
          hasQuintilla: false
        },
        '2': {
          diceCount: 5,
          currentRoll: ['9', '10', 'J', 'Q', 'K'],
          hasQuintilla: false
        }
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: null,
      votes: {},
      challengerId: null,
      devilDiceResult: null
    },
    ctx: {
      numPlayers: 3,
      turn: 1,
      currentPlayer: '0',
      playOrder: ['0', '1', '2'],
      playOrderPos: 0,
      phase: 'bidding',
      activePlayers: null
    } as any
  }
}`,...(H=(F=v.parameters)==null?void 0:F.docs)==null?void 0:H.source}}};var N,M,_;C.parameters={...C.parameters,docs:{...(N=C.parameters)==null?void 0:N.docs,source:{originalSource:`{
  name: 'Story B: Mid-Bidding Table Escalation',
  args: {
    G: {
      players: {
        '0': {
          diceCount: 5,
          currentRoll: ['Q', 'Q', '10', 'J', 'A'],
          hasQuintilla: false
        },
        '1': {
          diceCount: 5,
          currentRoll: ['A', '9', 'J', 'K', 'K'],
          hasQuintilla: false
        },
        '2': {
          diceCount: 5,
          currentRoll: ['9', '10', 'J', 'Q', 'Q'],
          hasQuintilla: false
        }
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: {
        amount: 3,
        symbol: 'Q',
        value: 16,
        // Calculated: 4 (Q base) + (3-1)*6 = 16
        playerId: '1'
      },
      votes: {},
      challengerId: null,
      devilDiceResult: null
    },
    ctx: {
      numPlayers: 3,
      turn: 4,
      currentPlayer: '0',
      // It's Player 0's turn to escalate
      playOrder: ['0', '1', '2'],
      playOrderPos: 0,
      phase: 'bidding',
      activePlayers: null
    } as any
  }
}`,...(_=(M=C.parameters)==null?void 0:M.docs)==null?void 0:_.source}}};var $,Y,q;j.parameters={...j.parameters,docs:{...($=j.parameters)==null?void 0:$.docs,source:{originalSource:`{
  name: 'Story C: Collective Voting Overlay',
  args: {
    G: {
      players: {
        '0': {
          diceCount: 5,
          currentRoll: ['9', 'Q', 'K', 'A', '10'],
          hasQuintilla: false
        },
        '1': {
          diceCount: 4,
          currentRoll: ['10', 'J', 'Q', '9'],
          hasQuintilla: false
        },
        '2': {
          diceCount: 5,
          currentRoll: ['Q', 'Q', 'Q', '10', 'J'],
          hasQuintilla: false
        }
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: {
        amount: 4,
        symbol: 'Q',
        value: 22,
        playerId: '0'
      },
      votes: {
        '0': true // Player 0 has voted (believes their own bid)
      },
      challengerId: '1',
      // Player 1 declared "No Creo"
      devilDiceResult: null
    },
    ctx: {
      numPlayers: 3,
      turn: 5,
      currentPlayer: '1',
      playOrder: ['0', '1', '2'],
      playOrderPos: 1,
      phase: 'voting',
      activePlayers: {
        '0': 'voteStage',
        '1': 'voteStage',
        '2': 'voteStage'
      }
    } as any
  }
}`,...(q=(Y=j.parameters)==null?void 0:Y.docs)==null?void 0:q.source}}};var U,X,Z;S.parameters={...S.parameters,docs:{...(U=S.parameters)==null?void 0:U.docs,source:{originalSource:`{
  name: 'Story D: Devil\\'s Dice Reveal (Saved)',
  args: {
    G: {
      players: {
        '0': {
          diceCount: 5,
          currentRoll: ['K', '9', '10', '10', 'A'],
          hasQuintilla: false
        },
        '1': {
          diceCount: 4,
          currentRoll: ['K', 'J', 'Q', '9'],
          hasQuintilla: false
        },
        '2': {
          diceCount: 5,
          currentRoll: ['K', 'K', 'J', '10', 'A'],
          hasQuintilla: false
        }
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: {
        amount: 5,
        symbol: 'K',
        value: 29,
        // 5 + (5-1)*6 = 29
        playerId: '0'
      },
      votes: {
        '0': true,
        '1': false,
        '2': false
      },
      challengerId: '1',
      devilDiceResult: 'K' // Matching symbol! Saves the bidder
    },
    ctx: {
      numPlayers: 3,
      turn: 5,
      currentPlayer: '0',
      playOrder: ['0', '1', '2'],
      playOrderPos: 0,
      phase: 'devilDice',
      activePlayers: null
    } as any
  }
}`,...(Z=(X=S.parameters)==null?void 0:X.docs)==null?void 0:Z.source}}};var G,ee,re;R.parameters={...R.parameters,docs:{...(G=R.parameters)==null?void 0:G.docs,source:{originalSource:`{
  name: 'Story D: Devil\\'s Dice Reveal (Failed)',
  args: {
    G: {
      players: {
        '0': {
          diceCount: 5,
          currentRoll: ['K', '9', '10', '10', 'A'],
          hasQuintilla: false
        },
        '1': {
          diceCount: 4,
          currentRoll: ['K', 'J', 'Q', '9'],
          hasQuintilla: false
        },
        '2': {
          diceCount: 5,
          currentRoll: ['K', 'K', 'J', '10', 'A'],
          hasQuintilla: false
        }
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: {
        amount: 5,
        symbol: 'K',
        value: 29,
        playerId: '0'
      },
      votes: {
        '0': true,
        '1': false,
        '2': false
      },
      challengerId: '1',
      devilDiceResult: 'A' // Different symbol! Fails to save the bidder
    },
    ctx: {
      numPlayers: 3,
      turn: 5,
      currentPlayer: '0',
      playOrder: ['0', '1', '2'],
      playOrderPos: 0,
      phase: 'devilDice',
      activePlayers: null
    } as any
  }
}`,...(re=(ee=R.parameters)==null?void 0:ee.docs)==null?void 0:re.source}}};var le,ne,te;B.parameters={...B.parameters,docs:{...(le=B.parameters)==null?void 0:le.docs,source:{originalSource:`{
  name: 'Story E: Round Revelation Scorecard',
  args: {
    G: {
      players: {
        '0': {
          diceCount: 5,
          currentRoll: ['Q', 'Q', '9', '10', 'A'],
          hasQuintilla: false
        },
        '1': {
          diceCount: 4,
          currentRoll: ['Q', 'J', '10', '9'],
          hasQuintilla: false
        },
        '2': {
          diceCount: 5,
          currentRoll: ['9', '9', '10', 'J', 'A'],
          hasQuintilla: false
        }
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: {
        amount: 4,
        symbol: 'Q',
        value: 22,
        playerId: '0'
      },
      votes: {
        '0': true,
        // Believed (loses because only 3 Qs exist total)
        '1': false,
        // Disbelieved (survives because total count 3 < bid 4)
        '2': true // Believed (loses because total count 3 < bid 4)
      },
      challengerId: '1',
      devilDiceResult: null
    },
    ctx: {
      numPlayers: 3,
      turn: 6,
      currentPlayer: '0',
      playOrder: ['0', '1', '2'],
      playOrderPos: 0,
      phase: 'resolution',
      activePlayers: null
    } as any
  }
}`,...(te=(ne=B.parameters)==null?void 0:ne.docs)==null?void 0:te.source}}};var oe,ie,ae;Q.parameters={...Q.parameters,docs:{...(oe=Q.parameters)==null?void 0:oe.docs,source:{originalSource:`{
  name: 'Story F: Quintilla Glow Buffer',
  args: {
    G: {
      players: {
        '0': {
          diceCount: 5,
          currentRoll: ['9', '10', 'J', 'Q', 'K'],
          hasQuintilla: false
        },
        '1': {
          diceCount: 6,
          currentRoll: ['Q', 'Q', 'Q', 'Q', 'Q'],
          hasQuintilla: true
        },
        // Has +1 buffer life
        '2': {
          diceCount: 5,
          currentRoll: ['9', '10', 'J', 'Q', 'K'],
          hasQuintilla: false
        }
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: null,
      votes: {},
      challengerId: null,
      devilDiceResult: null
    },
    ctx: {
      numPlayers: 3,
      turn: 1,
      currentPlayer: '0',
      playOrder: ['0', '1', '2'],
      playOrderPos: 0,
      phase: 'bidding',
      activePlayers: null
    } as any,
    playerID: '1' // Focus view on Player 1 to see their card details clearly
  }
}`,...(ae=(ie=Q.parameters)==null?void 0:ie.docs)==null?void 0:ae.source}}};var se,de,ce;D.parameters={...D.parameters,docs:{...(se=D.parameters)==null?void 0:se.docs,source:{originalSource:`{
  name: 'Story G: Victory Screen',
  args: {
    G: {
      players: {
        '0': {
          diceCount: 0,
          currentRoll: [],
          hasQuintilla: false
        },
        '1': {
          diceCount: 4,
          currentRoll: ['9', 'Q', 'A', 'J'],
          hasQuintilla: false
        },
        // Winner
        '2': {
          diceCount: 0,
          currentRoll: [],
          hasQuintilla: false
        }
      },
      direction: GameDirection.CLOCKWISE,
      currentBid: null,
      votes: {},
      challengerId: null,
      devilDiceResult: null
    },
    ctx: {
      numPlayers: 3,
      turn: 14,
      currentPlayer: '1',
      playOrder: ['0', '1', '2'],
      playOrderPos: 1,
      phase: 'bidding',
      activePlayers: null,
      gameover: {
        winner: '1'
      }
    } as any
  }
}`,...(ce=(de=D.parameters)==null?void 0:de.docs)==null?void 0:ce.source}}};const Oe=["FreshRoundSetup","MidBiddingTableEscalation","CollectiveVotingOverlay","DevilDiceRevealSaved","DevilDiceRevealFailed","RoundRevelationScorecard","QuintillaGlow","VictoryScreen"];export{j as CollectiveVotingOverlay,R as DevilDiceRevealFailed,S as DevilDiceRevealSaved,v as FreshRoundSetup,C as MidBiddingTableEscalation,Q as QuintillaGlow,B as RoundRevelationScorecard,D as VictoryScreen,Oe as __namedExportsOrder,ke as default};
