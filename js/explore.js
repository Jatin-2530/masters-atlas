/* Explore view: profile, quick picks, filters, top picks, grouped or flat list. */
(function(){
"use strict";
var A=window.A,h=A.h;
A.views=A.views||{};
var root,ctlHost,treeHost,profHost,first=true,advOpen=false,wOpen=false;

function F(){return A.state.F;}
function setF(patch,repaintControls){Object.assign(F(),patch);A.save("filters");if(repaintControls!==false)paintControls();paintTree();}
function anyFilter(){var f=F(),d=A.DEFAULT_FILTERS;return Object.keys(d).some(function(k){return k!=="q"&&k!=="sort"&&k!=="view"&&f[k]!==d[k];})||f.q;}
function budgetBadge(p){var t=A.budgetTier(p);
  return h("span",{class:"badge "+(t==="over"?"b-no":t==="near"?"b-edge":"b-yes"),text:t==="over"?"Over budget":t==="near"?"Near budget":"Within budget"});}
function meter(p){var cap=A.cap(),pct=Math.min(1,p.costLakh/(cap/0.75)),t=A.budgetTier(p);
  var b=h("b");b.style.transform="scaleX("+pct.toFixed(3)+")";
  return h("span",{class:"meter "+(t==="over"?"over":t==="near"?"near":""),"aria-hidden":"true",title:"Share of your INR "+cap+" L budget (the tick marks the budget)"},b);}

/* ---------- row ---------- */
function actBtns(p){
  var star=h("button",{class:"ib star",type:"button","aria-pressed":A.state.short.indexOf(p.id)>=0?"true":"false","aria-label":"Shortlist "+p.program,title:"Shortlist",
    onclick:function(){var on=A.shortToggle(p.id);star.setAttribute("aria-pressed",on?"true":"false");}},A.svg(A.ICON.star));
  var cmp=h("button",{class:"ib cmp",type:"button","aria-pressed":A.state.cmp.indexOf(p.id)>=0?"true":"false","aria-label":"Compare "+p.program,title:"Add to compare",
    onclick:function(){if(A.cmpToggle(p.id))cmp.setAttribute("aria-pressed",A.state.cmp.indexOf(p.id)>=0?"true":"false");}},A.svg(A.ICON.cmp));
  return h("div",{class:"acts"},star,cmp);}
A.actBtns=actBtns;
function bgChip(p){var f=A.bgFit(p);if(f.level==="none")return null;
  var tip=f.items.map(function(x){return A.BGLABEL[x.k]+": "+A.LEVEL_TXT[x.l]+". "+x.n;}).join("\n");
  return h("span",{class:"fit gold "+f.level,title:tip,tabindex:"0",role:"img","aria-label":A.BGCHIP[f.level]+". "+tip,text:A.BGCHIP[f.level]});}
A.bgChip=bgChip;
function careerChip(p){var c=A.career(p);if(c.l==="strong")return h("span",{class:"mini-t gold",title:c.s,text:"Strong career network"});
  if(c.l==="good")return h("span",{class:"mini-t",title:c.s,text:"Good career support"});return null;}
A.careerChip=careerChip;
function tags(p){
  var out=[];
  var bc=bgChip(p);if(bc&&(A.bgFit(p).level==="strong"||A.bgFit(p).level==="good"||A.bgFit(p).level==="risk"))out.push(bc);
  var cc=careerChip(p);if(cc)out.push(cc);
  if(A.profileSet())out.push(A.fitChip(p));
  if(p.testNeed==="required")out.push(h("span",{class:"mini-t w",text:"GMAT/GRE needed"}));
  else if(p.testNeed==="none")out.push(h("span",{class:"mini-t g",text:"No GMAT/GRE"}));
  if(p.tuitionFree)out.push(h("span",{class:"mini-t g",text:"Tuition-free"}));
  return out.length?h("div",{class:"chiprow"},out):null;}
function row(p,flat){
  var s=A.score(p),v=A.conf(p)==="verified";
  return h("div",{class:"prow"+(A.bgFit(p).level==="strong"?" hl":"")},
    h("a",{class:"pmain",href:"#"+p.id},
      h("div",{class:"pn"},
        flat?h("span",{style:"display:flex;align-items:center;gap:6px;color:var(--muted);font-size:12px"},A.flag(p.country),p.university+", "+p.country):null,
        h("span",{class:"cdot"+(v?" v":""),title:v?"Details verified on official pages":"Some details only partly verified"}),p.program,
        h("span",{text:p.months+" months, "+p.mode})),
      tags(p)),
    h("div",{class:"cost"},A.money(p.costLakh),meter(p)),
    budgetBadge(p),
    h("div",{class:"score "+A.band(s),text:s.toFixed(2)}),
    actBtns(p));}
function ubest(arr){return Math.max.apply(null,arr.map(A.score));}
function bestOf(unis){var m=0;Object.keys(unis).forEach(function(u){m=Math.max(m,ubest(unis[u]));});return m;}

/* ---------- tree ---------- */
function paintTree(){
  if(!treeHost)return;
  var list=A.filtered(),f=F(),all=A.P;
  var frag=h("div");
  var within=list.filter(function(p){return p.costLakh<=A.cap();}).length;
  var sorted=list.slice().sort(A.sorters.score);
  var bar=h("div",{class:"viewbar"},
    h("div",{class:"seg",role:"group","aria-label":"List layout"},
      h("button",{type:"button","aria-pressed":f.view==="tree"?"true":"false",onclick:function(){setF({view:"tree",sort:"score"});},text:"By country"}),
      h("button",{type:"button","aria-pressed":f.view==="flat"?"true":"false",onclick:function(){setF({view:"flat"});},text:"Flat list"})),
    f.view==="flat"?h("label",{class:"small",style:"display:flex;align-items:center;gap:6px"},"Sort",
      (function(){var s=h("select",{"aria-label":"Sort order",style:"width:auto",onchange:function(e){setF({sort:e.target.value});}});
        Object.keys(A.SORTLABEL).forEach(function(k){var o=h("option",{value:k,text:A.SORTLABEL[k]});if(f.sort===k)o.selected=true;s.appendChild(o);});return s;})()):null,
    h("span",{class:"sp"}),
    anyFilter()?h("button",{class:"btn",type:"button",onclick:function(){var q=document.getElementById("q");if(q)q.value="";setF(Object.assign({},A.DEFAULT_FILTERS,{view:f.view,sort:f.sort}));A.toast("Filters cleared");},text:"Clear filters"}):null,
    h("button",{class:"btn",type:"button",onclick:downloadCsv,text:"Download CSV"}));
  frag.appendChild(bar);
  var sum=h("p",{class:"summary"});
  sum.appendChild(h("span",null,"Showing ",h("b",{text:String(list.length)})," of "+all.length));
  sum.appendChild(h("span",null,"Within budget ",h("b",{text:String(within)})));
  if(sorted[0])sum.appendChild(h("span",null,"Top score ",h("b",{text:A.score(sorted[0]).toFixed(2)})," "+sorted[0].university));
  frag.appendChild(sum);
  var live=document.getElementById("live");if(live)live.textContent="Showing "+list.length+" of "+all.length+" programmes";
  if(!list.length){
    frag.appendChild(h("div",{class:"panel empty2"},h("b",{text:"Nothing matches these filters"}),h("p",{style:"margin:0 0 12px",text:"Try removing one filter, or raise your budget."}),
      h("button",{class:"btn primary",type:"button",onclick:function(){setF(Object.assign({},A.DEFAULT_FILTERS));},text:"Clear all filters"})));
    treeHost.replaceChildren(frag);return;}
  /* top picks */
  var pool=sorted.filter(function(p){return A.fit(p).level!=="block"||!A.profileSet();});
  if(!f.q&&pool.length>=4){
    var tp=h("div",{class:"tp"});
    pool.slice(0,5).forEach(function(p,i){
      tp.appendChild(h("a",{class:"tcard",href:"#"+p.id},
        h("div",{class:"tt"},A.uniLogo(p.university,p.links.university),A.flag(p.country),h("span",{class:"small",text:p.country})),
        h("b",{text:p.program}),h("div",{class:"meta",text:p.university}),
        h("div",{class:"row"},h("span",{class:"big",text:A.score(p).toFixed(2)}),h("span",{class:"mono small",text:A.money(p.costLakh)})),
        A.profileSet()?A.fitChip(p):null,A.bgChip(p),A.careerChip(p)));});
    A.stag(tp.children,1);
    frag.appendChild(h("h2",{style:"font-size:18px;margin:6px 0 8px",text:A.profileSet()?"Top picks for you":"Top picks by your weights"}));frag.appendChild(tp);}
  if(f.view==="flat"){
    var fl=list.slice().sort(A.sorters[f.sort]||A.sorters.score);
    var box=h("div",{class:"uni flat"});fl.forEach(function(p){box.appendChild(row(p,true));});frag.appendChild(box);
  }else{
    var tree={};list.forEach(function(p){var c=tree[p.continent]=tree[p.continent]||{};var k=c[p.country]=c[p.country]||{};(k[p.university]=k[p.university]||[]).push(p);});
    var secN=0,uniN=0;
    ["Europe","North America","Oceania","Asia"].forEach(function(cn){
      if(!tree[cn])return;
      var n=0;Object.keys(tree[cn]).forEach(function(c){Object.keys(tree[cn][c]).forEach(function(u){n+=tree[cn][c][u].length;});});
      var sec=h("section",{class:"cont"},h("h2",null,cn,h("small",{text:n+" programmes"})));sec.style.setProperty("--i",String(secN++));
      Object.keys(tree[cn]).sort(function(a,b){return bestOf(tree[cn][b])-bestOf(tree[cn][a]);}).forEach(function(c){
        var cc=h("div",{class:"country"});
        cc.appendChild(h("h3",null,A.flag(c),c,h("small",{text:"best "+bestOf(tree[cn][c]).toFixed(2)})));
        Object.keys(tree[cn][c]).sort(function(a,b){return ubest(tree[cn][c][b])-ubest(tree[cn][c][a]);}).forEach(function(u){
          var box=h("div",{class:"uni"},h("div",{class:"un"},A.uniLogo(u,tree[cn][c][u][0].links.university),h("span",{text:u})));box.style.setProperty("--i",String(uniN++));
          tree[cn][c][u].slice().sort(A.sorters.score).forEach(function(p){box.appendChild(row(p,false));});
          cc.appendChild(box);});
        sec.appendChild(cc);});
      frag.appendChild(sec);});
  }
  treeHost.classList.toggle("fresh",first);
  treeHost.replaceChildren(frag);
  first=false;}

/* ---------- controls ---------- */
function opt(sel,pairs,cur){pairs.forEach(function(o){var x=h("option",{value:o[0],text:o[1]});if(String(cur)===String(o[0]))x.selected=true;sel.appendChild(x);});return sel;}
function chk(label,key){var f=F();return h("label",{class:"chk"},h("input",{type:"checkbox",checked:f[key]?true:null,onchange:function(e){setF((function(o){o[key]=e.target.checked;return o;})({}));}}),label);}
function paintControls(){
  if(!ctlHost)return;
  var f=F(),S=A.state,frag=h("div");
  /* quick picks */
  var presets=[["Within my budget",{budget:"within"},f.budget==="within"],["No GMAT/GRE",{tests:"none"},f.tests==="none"],["One year or less",{dur:"12"},f.dur==="12"],
    ["Tuition-free",{free:true},f.free],["Strong career network",{career:"strong"},f.career==="strong"],["Fits my background",{bg:true},f.bg],["Strong PR route",{pr:true},f.pr],["Funding for Indians",{india:true},f.india],["Good fit for me",{fit:"good"},f.fit==="good"]];
  var pk=h("div",{class:"picks",role:"group","aria-label":"Quick filters"},h("span",{class:"lbl",text:"Quick picks"}));
  presets.forEach(function(pr){pk.appendChild(h("button",{class:"chip soft",type:"button","aria-pressed":pr[2]?"true":"false",
    onclick:function(){var patch={};Object.keys(pr[1]).forEach(function(k){patch[k]=pr[2]?A.DEFAULT_FILTERS[k]:pr[1][k];});if(pr[0]==="Good fit for me"&&!A.profileSet()&&!pr[2]){A.toast("Fill in your profile above first");var d=document.querySelector("details.profile");if(d)d.open=true;return;}setF(patch);},text:pr[0]}));});
  frag.appendChild(pk);
  /* main controls */
  var ctrl=h("div",{class:"controls panel"});
  ctrl.appendChild(h("label",null,"Search",h("input",{type:"search",id:"q",placeholder:"University, programme or country (press / )",value:f.q,autocomplete:"off",oninput:function(e){F().q=e.target.value;paintTree();}})));
  var countries=[];A.P.forEach(function(p){if((f.cont==="All"||p.continent===f.cont)&&countries.indexOf(p.country)<0)countries.push(p.country);});countries.sort();
  var cs=h("select",{id:"f-country",onchange:function(e){setF({country:e.target.value});}},h("option",{value:"All",text:"All countries"}));
  countries.forEach(function(c){var o=h("option",{value:c,text:c});if(c===f.country)o.selected=true;cs.appendChild(o);});
  ctrl.appendChild(h("label",null,"Country",cs));
  var bud=h("input",{type:"range",min:"20",max:"120",step:"1",value:String(S.budget),"aria-label":"Budget in INR lakh",
    oninput:function(e){S.budget=+e.target.value;document.getElementById("bud-v").textContent="INR "+S.budget+" L";A.save("budget");paintTree();}});
  ctrl.appendChild(h("label",null,h("span",{style:"display:flex;justify-content:space-between"},"Your budget",h("b",{id:"bud-v",class:"mono",style:"color:var(--ink)",text:"INR "+S.budget+" L"})),bud));
  var vs=h("select",{id:"f-verify",onchange:function(e){setF({verify:e.target.value});}});
  opt(vs,[["all","All data quality"],["ok","Hide fully unverified"]],f.verify);
  ctrl.appendChild(h("label",null,"Data quality",vs));
  frag.appendChild(ctrl);
  /* advanced */
  var adv=h("details",{class:"filters panel"},h("summary",{text:"More filters"}));
  var g=h("div",{class:"fgrid"});
  g.appendChild(h("label",null,"Duration",opt(h("select",{onchange:function(e){setF({dur:e.target.value});}}),[["all","Any length"],["12","12 months or less"],["18","18 months or less"],["24","Up to 24 months"]],f.dur)));
  g.appendChild(h("label",null,"GMAT / GRE",opt(h("select",{onchange:function(e){setF({tests:e.target.value});}}),[["all","Any"],["none","Not needed or optional"],["req","Needed"]],f.tests)));
  g.appendChild(h("label",null,"English bar I can meet",opt(h("select",{onchange:function(e){setF({ielts:e.target.value});}}),[["all","Any"],["6","IELTS 6.0"],["6.5","IELTS 6.5"],["7","IELTS 7.0"],["7.5","IELTS 7.5"]],f.ielts)));
  g.appendChild(h("label",null,"Career support",opt(h("select",{onchange:function(e){setF({career:e.target.value});}}),[["all","Any"],["strong","Strong career network"],["good","Good or strong"]],f.career)));
  g.appendChild(h("label",null,"Fit with my profile",opt(h("select",{onchange:function(e){setF({fit:e.target.value});}}),[["all","Show all"],["ok","Hide hard to qualify"],["good","Good fit only"]],f.fit)));
  g.appendChild(h("label",null,"Budget",opt(h("select",{onchange:function(e){setF({budget:e.target.value});}}),[["all","Any"],["within","Within budget"],["over","Over budget"]],f.budget)));
  g.appendChild(chk("Tuition-free","free"));g.appendChild(chk("Funding for Indians","india"));g.appendChild(chk("Strong PR route (8+)","pr"));
  g.appendChild(chk("Verified details only","conf"));g.appendChild(chk("My shortlist only","short"));
  adv.appendChild(g);
  adv.open=advOpen;adv.addEventListener("toggle",function(){advOpen=adv.open;});
  frag.appendChild(adv);
  /* continent chips */
  var cc={All:A.P.length};A.P.forEach(function(p){cc[p.continent]=(cc[p.continent]||0)+1;});
  var chips=h("div",{class:"chips",role:"group","aria-label":"Continent"});
  ["All","Europe","North America","Oceania","Asia"].forEach(function(c){if(!cc[c])return;
    chips.appendChild(h("button",{class:"chip","aria-pressed":f.cont===c?"true":"false",onclick:function(){setF({cont:c,country:"All"});}},c,h("span",{class:"n",text:String(cc[c])})));});
  frag.appendChild(chips);
  /* weights */
  var wd=h("details",{class:"weights panel"},h("summary",{text:"Scoring weights (drag to re-rank)"}));
  var wg=h("div",{class:"wgrid"});
  Object.keys(A.WDEF).forEach(function(k){
    var val=h("span",{class:"mono",id:"wv-"+k,text:Math.round(S.W[k]*100)+"%"});
    wg.appendChild(h("label",{for:"w-"+k},h("span",{text:A.LABEL[k]}),val,h("input",{type:"range",id:"w-"+k,min:"0",max:"40",step:"1",value:String(Math.round(S.W[k]*100)),
      oninput:function(e){S.W[k]=e.target.value/100;document.getElementById("wv-"+k).textContent=e.target.value+"%";A.save("weights");paintTree();}})));});
  wd.appendChild(wg);
  wd.appendChild(h("button",{class:"btn",type:"button",style:"margin-top:12px",onclick:function(){S.W=Object.assign({},A.WDEF);A.save("weights");paintControls();paintTree();},text:"Reset to default weights"}));
  wd.open=wOpen;wd.addEventListener("toggle",function(){wOpen=wd.open;});
  wd.appendChild(h("p",{class:"note",style:"margin-top:8px",text:"Each programme is scored 1 to 10 on seven parameters. The total is the weighted average. Weights are saved in this browser only."}));
  frag.appendChild(wd);
  ctlHost.replaceChildren(frag);}

/* ---------- profile ---------- */
function paintProfile(){
  var S=A.state,P=S.profile;
  function save(){A.save("profile");paintTree();var pill=document.getElementById("prof-pill");if(pill)pill.hidden=!A.profileSet();}
  var d=h("details",{class:"profile panel"});d.open=!S.welcomed&&!A.profileSet();
  d.appendChild(h("summary",null,"Your profile",h("span",{class:"pill-on",id:"prof-pill",hidden:A.profileSet()?null:true,text:"Active: checking every programme"})));
  var g=h("div",{class:"pgrid"});
  g.appendChild(h("label",null,"Bachelor's length",opt(h("select",{onchange:function(e){P.years=e.target.value;save();}}),[["","Not set"],["3","3 years"],["4","4 years"]],P.years)));
  g.appendChild(h("label",null,"Final marks (%)",h("input",{type:"number",min:"35",max:"100",step:"0.5",placeholder:"e.g. 68",value:P.pct,oninput:function(e){P.pct=e.target.value;save();}})));
  g.appendChild(h("label",null,"Work experience (years)",h("input",{type:"number",min:"0",max:"20",step:"0.5",placeholder:"e.g. 1",value:P.exp,oninput:function(e){P.exp=e.target.value;save();}})));
  g.appendChild(h("label",null,"Best IELTS band",h("input",{type:"number",min:"4",max:"9",step:"0.5",placeholder:"e.g. 6.5",value:P.ielts,oninput:function(e){P.ielts=e.target.value;save();}})));
  g.appendChild(h("label",null,"GMAT / GRE",opt(h("select",{onchange:function(e){P.tests=e.target.value;save();}}),[["","Not set"],["have","I have a score"],["willing","I will take it"],["no","I will not take it"]],P.tests)));
  d.appendChild(g);
  d.appendChild(h("p",{class:"small",style:"margin:14px 0 6px;font-weight:600;color:var(--ink)",text:"Your background: highlight programmes that value"}));
  var bgr=h("div",{class:"row"});
  [["mba","MBA"],["iitm","IIT Madras BS Data Science"],["sap","SAP experience"],["work","2 years of work experience"]].forEach(function(x){
    bgr.appendChild(h("label",{class:"chk",style:"display:flex;gap:8px;align-items:center;font-size:13px"},h("input",{type:"checkbox",checked:P[x[0]]?true:null,onchange:function(e){P[x[0]]=e.target.checked;A.save("profile");paintTree();}}),x[1]));});
  d.appendChild(bgr);
  d.appendChild(h("div",{class:"row mt"},
    h("button",{class:"btn",type:"button",onclick:function(){S.profile={years:"",pct:"",exp:"",ielts:"",tests:"",mba:true,iitm:true,sap:true,work:true};A.save("profile");paintProfile();paintTree();},text:"Reset profile"}),
    h("span",{class:"small",text:"Saved only in this browser. It flags programmes you may struggle to qualify for. It cannot predict an admission decision."})));
  profHost.replaceChildren(d);}

/* ---------- welcome + hero ---------- */
function welcome(){
  if(A.state.welcomed)return null;
  return h("div",{class:"panel welcome"},
    A.svg('<svg viewBox="0 0 40 40" width="34" height="34" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="2.2"/><ellipse cx="20" cy="20" rx="6" ry="14" stroke="currentColor" stroke-width="2.2"/><path d="M6 20h28" stroke="currentColor" stroke-width="2.2"/></svg>'),
    h("div",null,h("h2",{style:"font-size:18px",text:"New here? Three steps"}),
      h("ol",null,h("li",null,"Fill in ",h("b",{text:"Your profile"})," below so every programme shows whether you are likely to qualify."),
        h("li",null,"Press the star on programmes you like. Open ",h("b",{text:"Shortlist"})," to track status, documents and notes."),
        h("li",null,"Check ",h("b",{text:"Deadlines"})," and ",h("b",{text:"Funding"})," before you apply. The ",h("b",{text:"Guide"})," explains every term."))),
    h("button",{class:"btn",type:"button",onclick:function(){A.state.welcomed=true;A.save("welcomed");var w=this.closest(".welcome");if(w)w.remove();},text:"Got it"}));}

A.views.explore=function(params,animate){
  var S=A.state;first=animate;
  root=h("div",{class:animate?"fresh":""});
  var all=A.P,cs={};all.forEach(function(p){cs[p.country]=1;});
  var within=all.filter(function(p){return p.costLakh<=A.cap();}).length,cheapest=Math.min.apply(null,all.map(function(p){return p.costLakh;}));
  var dl=h("button",{class:"btn",type:"button",onclick:downloadCsv,text:"Download CSV"});
  var copy=h("div",{class:"hero-copy"},
    h("div",{class:"brand"},A.svg(A.LOGO,"logo"),"Overseas master's explorer"),
    h("h1",null,"Masters ",h("em",{text:"Atlas"})),
    h("p",{text:all.length+" analytics, AI and technology-management master's programmes in "+Object.keys(cs).length+" countries, scored for an Indian applicant. Data as of "+A.DATA.meta.updated+"."}),
    h("div",{class:"hero-actions"},h("a",{class:"btn primary",href:"#/guide",style:"text-decoration:none",text:"How this works"}),dl));
  A.stag(copy.children);
  var stats=h("div",{class:"stats"});
  [[all.length,0,"Programmes"],[Object.keys(cs).length,0,"Countries"],[within,0,"Within budget"],[cheapest,1,"Lowest total, INR L"]].forEach(function(x){
    var b=h("b",{text:x[0].toFixed(x[1])});stats.appendChild(h("div",{class:"stat"},b,h("span",{text:x[2]})));A.countUp(b,x[0],x[1],animate);});
  var hero=h("header",{class:"hero"},A.svg(A.GLOBE,"globe"),copy,stats);
  var wl=welcome();
  profHost=h("div");ctlHost=h("div");treeHost=h("div",{id:"tree"});
  [wl,hero,profHost,ctlHost,treeHost].forEach(function(n,i){if(n){if(i>0&&animate)n.style.setProperty("--i",String(i*2));root.appendChild(n);}});
  paintProfile();paintControls();paintTree();
  root.appendChild(h("footer",{class:"foot"},
    h("p",{class:"note",style:"margin:0;max-width:70ch",text:A.DATA.meta.caveat+" Exchange rates: "+A.DATA.meta.fx}),
    h("a",{class:"note",href:"https://github.com/Jatin-2530/masters-atlas",target:"_blank",rel:"noopener noreferrer",text:"Source on GitHub"})));
  return root;};

/* CSV of the filtered list */
function downloadCsv(){
  var cols=["rank","continent","country","university","program","months","mode","tuition","living","costLakh","withinBudget","testNeed","rel","emp","imm","pr","aff","adm","dur","weighted","visaNote","admission","intake","status"];
  var rows=[cols.concat(["yourScore","universityLink","programLink","nextDeadline","careerNetwork","backgroundFit"]).join(",")];
  A.filtered().sort(A.sorters.score).forEach(function(p){var nd=A.nextDeadline(p);
    rows.push(cols.map(function(c){return A.csvCell(p[c]);}).concat([A.csvCell(A.score(p).toFixed(2)),A.csvCell(p.links.university),A.csvCell(p.links.program),A.csvCell(nd?nd.iso:""),A.csvCell(A.CAREER_TXT[A.career(p).l]),A.csvCell(A.BGCHIP[A.bgFit(p).level]||"")]).join(","));});
  A.saveFile("masters-atlas.csv",rows.join("\n"),"text/csv");A.toast("CSV downloaded");}
A.downloadCsv=downloadCsv;
})();
