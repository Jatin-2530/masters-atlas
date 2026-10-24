/* Programme detail page. */
(function(){
"use strict";
var A=window.A,h=A.h;
A.views=A.views||{};

function bullets(arr,gloss){var u=h("ul",{class:"bul"});arr.forEach(function(x){u.appendChild(h("li",null,gloss?A.gl(x):x));});return u;}
function track(id){var T=A.state.track;if(!T[id])T[id]={st:"researching",note:"",chk:{}};return T[id];}
A.track=track;
function emailDraft(p){
  var D=A.DET[p.id]||{},items=(D.unverified||[]).slice();
  if(p.threeYear!=="yes")items.push("Is a 3-year Indian bachelor's degree accepted for this programme, and what minimum percentage or CGPA do you expect?");
  if(p.testNeed==="unknown"||p.testNeed==="either"||p.testNeed==="required")items.push("Is a GMAT or GRE score required, and are there alternative tests or waivers?");
  items.push("What are the application deadlines for the next intake, and are scholarships open to Indian students?");
  var body="Dear Admissions Team,\n\nI am an applicant from India interested in the "+p.program+" at "+p.university+" ("+p.intake+"). Could you please confirm the following?\n\n"+
    items.map(function(x,i){return (i+1)+". "+x;}).join("\n")+"\n\nThank you for your time.\n\nKind regards,\n[Your name]\n[Your degree, university and marks]";
  return {subject:"Admission query: "+p.program,body:body};}
function issueUrl(p){
  var body="Programme: "+p.id+" "+p.university+" / "+p.program+"\nWhat is wrong or out of date?\n\nOfficial source link:\n";
  return "https://github.com/Jatin-2530/masters-atlas/issues/new?title="+encodeURIComponent("Correction: "+p.id+" "+p.program)+"&body="+encodeURIComponent(body);}

A.views.detail=function(p){
  var S=A.state,D=A.DET[p.id],C=A.CTRY[p.country],s=A.score(p),fit=A.fit(p);
  var root=h("div",{class:"fresh"});
  root.appendChild(h("div",{class:"crumb"},
    h("a",{href:"#/explore"},"All programmes"),h("span",{text:"/"}),h("span",{text:p.continent}),h("span",{text:"/"}),h("span",{text:p.country}),h("span",{text:"/"}),h("span",{text:p.university})));
  var Cc=2*Math.PI*34,ring=h("div",{class:"ring "+A.band(s),role:"img","aria-label":"Your score "+s.toFixed(2)+" out of 10"},
    A.svg('<svg viewBox="0 0 80 80" aria-hidden="true"><circle class="tr" cx="40" cy="40" r="34"/><circle class="fg" cx="40" cy="40" r="34" style="--circ:'+Cc.toFixed(1)+';stroke-dasharray:'+Cc.toFixed(1)+';stroke-dashoffset:'+(Cc*(1-s/10)).toFixed(1)+'"/></svg>'),
    h("span",{text:s.toFixed(1)}));
  root.appendChild(h("div",{class:"dtop"},
    h("div",{class:"dhead"},A.uniLogo(p.university,p.links.university,true),
      h("div",null,h("h1",{id:"main-h",tabindex:"-1",text:p.program}),h("p",{class:"dsub"},A.flag(p.country,true),p.university+", "+p.country))),ring));

  /* actions */
  var star=h("button",{class:"btn"+(S.short.indexOf(p.id)>=0?" on":""),type:"button",onclick:function(){var on=A.shortToggle(p.id);star.classList.toggle("on",on);star.lastChild.textContent=on?"Shortlisted":"Add to shortlist";}},
    A.svg(A.ICON.star,"ib-i"),h("span",{text:S.short.indexOf(p.id)>=0?"Shortlisted":"Add to shortlist"}));
  star.firstChild.style.cssText="width:14px;height:14px;vertical-align:-2px;margin-right:6px";
  var cmpB=h("button",{class:"btn",type:"button",onclick:function(){A.cmpToggle(p.id);cmpB.textContent=S.cmp.indexOf(p.id)>=0?"In compare":"Compare";},text:S.cmp.indexOf(p.id)>=0?"In compare":"Compare"});
  root.appendChild(h("div",{class:"dact"},star,cmpB,
    h("button",{class:"btn",type:"button",onclick:function(){A.copy(location.origin+location.pathname+"#"+p.id,"Link copied");},text:"Copy link"}),
    h("button",{class:"btn",type:"button",onclick:function(){window.print();},text:"Print"}),
    h("a",{class:"btn",href:"#/funding",style:"text-decoration:none",onclick:function(){S.fund.pid=p.id;A.save("fund");},text:"Plan funding"})));

  /* quick facts + summary */
  var pills=h("div",{class:"pills"});A.facts(p).forEach(function(f){pills.appendChild(h("span",{class:"pill "+f.c,text:f.t}));});
  if(A.career(p).l==="strong")pills.appendChild(h("span",{class:"pill g",text:"Strong career network"}));
  if(A.bgFit(p).level==="strong"||A.bgFit(p).level==="good")pills.appendChild(h("span",{class:"pill g",text:A.BGCHIP[A.bgFit(p).level]}));
  root.appendChild(pills);
  root.appendChild(h("p",{class:"tldr",text:A.summary(p)}));

  /* facts */
  var f=h("dl",{class:"facts",style:"margin-inline:0"});
  function fact(k,v){f.appendChild(h("div",{class:"fact"},h("dt",{text:k}),h("dd",{text:v})));}
  fact("Your score",s.toFixed(2)+" / 10");fact("Total cost",A.money(p.costLakh));
  var tier=A.budgetTier(p);fact("Your budget",tier==="over"?"Over INR "+A.cap()+" L":tier==="near"?"Near INR "+A.cap()+" L":"Within INR "+A.cap()+" L");
  fact("Duration",p.months+" months");fact("Mode",p.mode);fact("Rank by default weights","#"+p.rank);
  A.stag(f.children);root.appendChild(f);

  var grid=h("div",{class:"dgrid"}),left=h("div",{style:"display:grid;gap:16px;align-content:start"}),right=h("div",{style:"display:grid;gap:16px;align-content:start"});

  /* fit + watch-outs */
  var fitBox=h("section",{class:"panel fitbox "+fit.level},h("h3",{text:A.profileSet()?"For your profile":"Your budget check"}),
    h("p",{style:"margin:0 0 6px",text:fit.hard.length?"Hard to qualify: "+fit.hard.join("; ")+".":fit.soft.length?"Check before applying: "+fit.soft.join("; ")+".":A.profileSet()?"Nothing in your profile conflicts with the requirements we found.":"Within your budget."}));
  if(!A.profileSet())fitBox.appendChild(h("p",{class:"note",style:"margin:0"},"Add your degree length, marks, IELTS and test plans on ",h("a",{href:"#/explore",text:"Explore"})," to see a full fit check."));
  var wo=A.watchouts(p);if(wo.length){fitBox.appendChild(h("p",{class:"note",style:"margin:10px 0 4px;font-weight:600",text:"Watch-outs"}));var u=bullets(wo);u.classList.add("watch");fitBox.appendChild(u);}
  left.appendChild(fitBox);
  /* background fit */
  var bf=A.bgFit(p),B=A.bg(p),picked=A.bgPicked();
  if(B){
    var bp=h("section",{class:"panel"},h("h3",{text:"How this fits your background"}));
    if(bf.level!=="none")bp.appendChild(h("p",{style:"margin:0 0 4px"},A.bgChip(p),h("span",{class:"small",style:"margin-left:8px",text:bf.strong+" strong, "+bf.ok+" fits, "+bf.ask+" to check, "+bf.risk+" risks across your "+bf.picked+" ticked points"})));
    var rows=h("div",{class:"bgrows"});
    ["workex","mba","iitm","sap"].forEach(function(k){var x=B[k],on=picked.indexOf(k)>=0;
      rows.appendChild(h("div",{class:"bgr"+(on?" on":"")},h("div",null,h("b",{text:A.BGLABEL[k]}),h("br"),h("span",{class:"lv "+x.l,text:A.LEVEL_TXT[x.l]})),
        h("div",null,h("p",null,A.gl(x.n)),h("span",{class:"ev",text:x.ev==="documented"?"Stated on an official page":"My inference from the programme's audience or prerequisites"}))));});
    bp.appendChild(rows);
    bp.appendChild(h("p",{class:"note",style:"margin:10px 0 0",text:"Highlighted rows are the ones you ticked in your profile on Explore."}));
    left.appendChild(bp);
  }

  /* scores */
  var bars=h("section",{class:"panel"},h("h3",{text:"Scores"}));
  Object.keys(A.WDEF).forEach(function(k,ki){var b=h("i");b.appendChild(h("b",{style:"width:"+(p[k]*10)+"%;--i:"+ki}));
    bars.appendChild(h("div",{class:"bar"},h("span",{text:A.LABEL[k]}),b,h("span",{class:"v",text:p[k]+"/10"})));});
  bars.appendChild(h("p",{class:"note",style:"margin-top:8px",text:"Scores are judgement-based on official fee pages, visa rules and programme fit. Weights on the Explore page change your total, not these ratings."}));
  left.appendChild(bars);

  if(D){
    var adm=h("section",{class:"panel"},h("h3",{text:"Admission process"}));
    var ol=h("ol",{class:"steps"});D.process.forEach(function(x){ol.appendChild(h("li",null,A.gl(x)));});adm.appendChild(ol);
    if(D.deadlines&&D.deadlines.length){adm.appendChild(h("p",{class:"note",style:"margin:4px 0 4px;font-weight:600",text:"Deadlines"}));adm.appendChild(bullets(D.deadlines));}
    left.appendChild(adm);
    /* checklist */
    if(D.documents&&D.documents.length){
      var T=track(p.id),prog=h("div",{class:"prog"},h("b")),pct=h("span",{class:"small"});
      var ck=h("section",{class:"panel"},h("h3",{text:"Document checklist"}),h("p",{class:"note",style:"margin:0 0 8px",text:"Tick each item as you get it. Saved in this browser."}));
      var ul=h("ul",{class:"todo"});
      function upd(){var n=D.documents.filter(function(_,i){return T.chk[i];}).length;prog.firstChild.style.width=(100*n/D.documents.length)+"%";pct.textContent=n+" of "+D.documents.length+" ready";}
      D.documents.forEach(function(x,i){var id="ck-"+p.id+"-"+i;
        ul.appendChild(h("li",null,h("input",{type:"checkbox",id:id,checked:T.chk[i]?true:null,onchange:function(e){T.chk[i]=e.target.checked;if(!e.target.checked)delete T.chk[i];A.save("track");upd();}}),h("label",{for:id},A.gl(x))));});
      ck.appendChild(prog);ck.appendChild(pct);ck.appendChild(ul);upd();left.appendChild(ck);}
    var Tt=D.tests||{},tp=h("section",{class:"panel"},h("h3",{text:"Tests and scores"})),kv=h("dl",{class:"kv"});
    [["English",Tt.english],["GMAT / GRE",Tt.aptitude],["Other",Tt.other]].forEach(function(r){if(r[1])kv.appendChild(h("div",{style:"display:contents"},h("dt",{text:r[0]}),h("dd",null,A.gl(r[1]))));});
    tp.appendChild(kv);left.appendChild(tp);
  }
  left.appendChild(h("section",{class:"panel"},h("h3",{text:"Immigration and PR pathway"}),h("p",null,A.gl(p.visaNote))));
  left.appendChild(h("section",{class:"panel"},h("h3",{text:"Admission summary"}),h("p",{text:p.admission}),h("p",{class:"note",text:"Intake and deadline: "+p.intake})));
  left.appendChild(h("section",{class:"panel"},h("h3",{text:"Cost build-up"}),
    h("p",{text:"Tuition: "+p.tuition}),h("p",{text:"Living cost per year: "+p.living}),
    h("p",{class:"note",text:"Total includes living cost for the whole programme, insurance and visa fees, and a one-off INR 2.0 to 2.5 lakh setup allowance. Fees are 2026/27 or 2027/28, not inflated to 2029. "+A.DATA.meta.fx})));

  /* right column */
  var Cr=A.career(p);
  var cp=h("section",{class:"panel career-box"},h("h3",{text:"Career outcomes and campus network"}),
    h("span",{class:"fit gold "+(Cr.l==="strong"?"strong":""),style:"margin-bottom:8px",text:A.CAREER_TXT[Cr.l]||"Basic career service"}));
  cp.appendChild(h("p",{style:"margin:8px 0 4px;font-weight:600",text:Cr.s||"No programme-level figures found."}));
  if(Cr.n)cp.appendChild(h("p",{class:"small",style:"margin:0 0 6px",text:Cr.n}));
  if(Cr.u)cp.appendChild(h("a",{href:Cr.u,target:"_blank",rel:"noopener noreferrer",text:"Source",style:"font-size:13px"}));
  cp.appendChild(h("p",{class:"note",style:"margin:8px 0 0",text:"Figures are published by the schools and are self-reported. Definitions of 'employed', timing and response rates differ between schools, so compare with care."}));
  right.appendChild(cp);
  var T2=track(p.id);
  var tr=h("section",{class:"panel"},h("h3",{text:"My tracker"}));
  var sel=h("select",{class:"status-sel","aria-label":"Application status",onchange:function(e){T2.st=e.target.value;A.save("track");}});
  Object.keys(A.STATUS).forEach(function(k){var o=h("option",{value:k,text:A.STATUS[k]});if(T2.st===k)o.selected=true;sel.appendChild(o);});
  tr.appendChild(h("label",{class:"small",style:"display:grid;gap:4px"},"Status",sel));
  tr.appendChild(h("label",{class:"small",style:"display:grid;gap:4px;margin-top:10px"},"Notes",h("textarea",{class:"notes",placeholder:"Contacts, essay ideas, what to ask...",maxlength:"2000",oninput:function(e){T2.note=e.target.value;A.save("track");},text:T2.note||""})));
  tr.appendChild(h("p",{class:"note",style:"margin-top:6px",text:"Saved only in this browser. Add the programme to your shortlist to see it on the Shortlist page."}));
  right.appendChild(tr);

  if(D){
    var ind=h("section",{class:"panel"},h("h3",{text:"For Indian applicants"}));if(D.india&&D.india.length)ind.appendChild(bullets(D.india,true));right.appendChild(ind);
    var sc=h("section",{class:"panel"},h("h3",{text:"Scholarships and funding"}));
    (D.scholarships||[]).forEach(function(x){var b=h("div",{class:"sch"},h("b",{text:x.name}));
      if(x.amount&&x.amount!=="-")b.appendChild(h("span",{class:"amt",text:x.amount}));
      if(x.who)b.appendChild(h("p",{class:"note",style:"margin:2px 0 0",text:x.who}));
      if(x.how)b.appendChild(h("p",{class:"note",style:"margin:2px 0 0",text:x.how}));
      if(x.url)b.appendChild(h("a",{href:x.url,target:"_blank",rel:"noopener noreferrer",text:"Official page",style:"font-size:13px"}));sc.appendChild(b);});
    sc.appendChild(h("p",{class:"note",style:"margin-top:8px",text:"Costs on this site assume no scholarship. Awards are shown for information and change each year."}));
    right.appendChild(sc);
  }
  if(C){
    var g=h("details",{class:"panel guide"},h("summary",{text:"Country guide: "+p.country})),gk=h("dl",{class:"kv",style:"margin-top:8px"});
    [["Degree check",C.credential],["3-year degree",C.threeYear],["Visa and funds",C.visa],["Work rules",C.work],["After study",C.after],["English",C.english]].forEach(function(r){if(r[1])gk.appendChild(h("div",{style:"display:contents"},h("dt",{text:r[0]}),h("dd",null,A.gl(r[1]))));});
    g.appendChild(gk);
    if(C.scholarships&&C.scholarships.length){g.appendChild(h("p",{class:"note",style:"margin:6px 0 4px;font-weight:600",text:"Country-level funding"}));
      C.scholarships.forEach(function(x){var b=h("div",{class:"sch"},h("b",{text:x.name}));if(x.amount)b.appendChild(h("span",{class:"amt",text:x.amount}));if(x.who)b.appendChild(h("p",{class:"note",style:"margin:2px 0 0",text:x.who}));
        if(x.url)b.appendChild(h("a",{href:x.url,target:"_blank",rel:"noopener noreferrer",text:"Official page",style:"font-size:13px"}));g.appendChild(b);});}
    g.appendChild(h("p",{class:"note",style:"margin-top:8px",text:"Country guide confidence: "+(C.confidence||"partial")+". Rules change often: confirm on the official sources before paying."}));
    right.appendChild(g);
  }
  /* email draft */
  var em=emailDraft(p);
  right.appendChild(h("section",{class:"panel"},h("h3",{text:"Questions to ask admissions"}),
    h("p",{class:"note",style:"margin:0 0 8px",text:"A ready-to-send email built from what we could not confirm."}),
    h("div",{class:"row"},h("button",{class:"btn",type:"button",onclick:function(){A.copy("Subject: "+em.subject+"\n\n"+em.body,"Email draft copied");},text:"Copy draft"}),
      h("a",{class:"btn",href:"mailto:?subject="+encodeURIComponent(em.subject)+"&body="+encodeURIComponent(em.body),style:"text-decoration:none",text:"Open in email"}))));
  /* data quality */
  var st=h("section",{class:"panel"},h("h3",{text:"Data quality"}),h("span",{class:"badge "+A.vclass(p.status),text:p.status}));
  if(D){
    st.appendChild(h("p",{class:"note conf "+(D.confidence==="verified"?"verified":""),style:"margin-top:10px"},h("span",{class:"dot"}),"Detail confidence: "+D.confidence+". Checked "+D.checked+"."));
    if(D.unverified&&D.unverified.length){st.appendChild(h("p",{class:"note",style:"margin:6px 0 2px;font-weight:600",text:"Not confirmed"}));st.appendChild(bullets(D.unverified));}}
  var src=p.sourceUrls.slice();if(D&&D.sources)D.sources.forEach(function(u){if(src.indexOf(u)<0)src.push(u);});
  if(src.length){var sul=h("ul",{class:"src"});src.forEach(function(u){sul.appendChild(h("li",null,h("a",{href:u,target:"_blank",rel:"noopener noreferrer",text:u})));});
    st.appendChild(h("p",{class:"note",style:"margin-top:10px",text:"Sources used"}));st.appendChild(sul);}
  else st.appendChild(h("p",{class:"note",style:"margin-top:10px",text:"No official page was retrieved for this row. Treat every figure as indicative and check the university site."}));
  st.appendChild(h("p",{class:"note",style:"margin-top:10px"},h("a",{href:issueUrl(p),target:"_blank",rel:"noopener noreferrer",text:"Report a wrong or outdated detail"})));
  right.appendChild(st);
  var lk=h("section",{class:"panel"},h("h3",{text:"Links"})),lw=h("div",{class:"links"});
  lw.appendChild(h("a",{href:p.links.university,target:"_blank",rel:"noopener noreferrer",text:"University site"}));
  if(p.links.program)lw.appendChild(h("a",{href:p.links.program,target:"_blank",rel:"noopener noreferrer",text:"Programme page"}));
  lw.appendChild(h("a",{href:p.links.youtube,target:"_blank",rel:"noopener noreferrer",text:"Search YouTube"}));lk.appendChild(lw);
  lk.appendChild(h("p",{class:"note",style:"margin-top:8px",text:"The YouTube link is a search for this programme, not a vetted video."}));
  right.appendChild(lk);

  A.stag(left.children);A.stag(right.children);grid.appendChild(left);grid.appendChild(right);root.appendChild(grid);

  /* previous / next by default rank */
  var byRank=A.P.slice().sort(function(a,b){return a.rank-b.rank;}),i=byRank.indexOf(p);
  var prev=byRank[i-1],next=byRank[i+1];
  root.appendChild(h("nav",{class:"pager","aria-label":"Neighbouring programmes"},
    prev?h("a",{href:"#"+prev.id},h("small",{text:"Previous by rank"}),prev.program+", "+prev.university):h("span"),
    next?h("a",{href:"#"+next.id},h("small",{text:"Next by rank"}),next.program+", "+next.university):h("span")));
  return root;};
})();
