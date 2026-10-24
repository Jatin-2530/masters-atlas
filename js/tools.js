/* Tool pages: shortlist, compare, deadlines, funding, roadmap, countries, guide. */
(function(){
"use strict";
var A=window.A,h=A.h;
A.views=A.views||{};

function head(title,lede){return [h("h1",{class:"page-h",id:"main-h",tabindex:"-1",text:title}),lede?h("p",{class:"lede",text:lede}):null];}
function empty(title,msg,cta,href){return h("div",{class:"panel empty2"},h("b",{text:title}),h("p",{style:"margin:0 0 12px",text:msg}),h("a",{class:"btn primary",href:href||"#/explore",style:"text-decoration:none",text:cta||"Browse programmes"}));}
function wrap(){var r=h("div",{class:"fresh"});
  (function add(c){if(Array.isArray(c))c.forEach(add);else if(c)r.appendChild(c);})(Array.prototype.slice.call(arguments));
  A.stag(r.children,1);return r;}

/* ================= shortlist ================= */
A.views.shortlist=function(params){
  var S=A.state,shared=params&&params.ids?params.ids.split(",").filter(function(id){return A.byId[id];}):null;
  var ids=shared||S.short.slice(),order=A.store.get("slorder","added");
  var out=[head(shared?"Shared shortlist":"My shortlist",shared?"Someone shared these programmes with you. Save them to start tracking.":"Your starred programmes, with status, documents and notes. Saved in this browser.")];
  if(shared){out.push(h("div",{class:"panel row",style:"margin-bottom:12px"},h("span",{text:shared.length+" programmes in this link."}),h("span",{class:"sp"}),
    h("button",{class:"btn primary",type:"button",onclick:function(){shared.forEach(function(id){if(S.short.indexOf(id)<0){S.short.push(id);}A.track(id);});A.save("short");A.save("track");A.refreshNav();A.toast("Saved to your shortlist");location.hash="#/shortlist";},text:"Save to my shortlist"})));}
  if(!ids.length){out.push(empty("Nothing shortlisted yet","Press the star on any programme to add it here.","Browse programmes"));return wrap(out);}
  var list=ids.map(function(id){return A.byId[id];});
  if(order==="deadline")list.sort(A.sorters.deadline);else if(order==="cost")list.sort(A.sorters.cost);else if(order==="score")list.sort(A.sorters.score);
  var needTest=list.filter(function(p){return p.testNeed==="required"||p.testNeed==="either";}).length;
  var costs=list.map(function(p){return p.costLakh;}),nd=list.map(A.nextDeadline).filter(Boolean).sort(function(a,b){return a.iso<b.iso?-1:1;})[0];
  var sum=h("div",{class:"facts",style:"margin:0 0 14px"});
  [["Programmes",String(list.length)],["Cost range",A.money(Math.min.apply(null,costs))+" to "+Math.max.apply(null,costs).toFixed(1)+" L"],["Need GMAT/GRE",needTest+" of "+list.length],["Next date",nd?A.fmtDate(nd.iso):"none found"]].forEach(function(f){sum.appendChild(h("div",{class:"fact"},h("dt",{text:f[0]}),h("dd",{text:f[1]})));});
  out.push(sum);
  var ordSel=h("select",{"aria-label":"Order",style:"width:auto",onchange:function(e){A.store.set("slorder",e.target.value);A.route();}});
  [["added","Order added"],["deadline","Next deadline"],["cost","Lowest cost"],["score","Best score"]].forEach(function(o){var x=h("option",{value:o[0],text:o[1]});if(order===o[0])x.selected=true;ordSel.appendChild(x);});
  out.push(h("div",{class:"row mb"},ordSel,h("span",{class:"sp"}),
    h("button",{class:"btn",type:"button",onclick:function(){S.cmp=list.slice(0,4).map(function(p){return p.id;});A.save("cmp");A.refreshNav();location.hash="#/compare";},text:"Compare top 4"}),
    h("button",{class:"btn",type:"button",onclick:function(){A.copy(location.origin+location.pathname+"#/shortlist?ids="+ids.join(","),"Share link copied");},text:"Copy share link"}),
    h("button",{class:"btn",type:"button",onclick:function(){
      var rows=[["id","university","programme","country","cost_inr_lakh","months","gmat_gre","status","next_deadline","documents_ready","notes"].join(",")];
      list.forEach(function(p){var T=A.track(p.id),D=A.DET[p.id],n=D&&D.documents?D.documents.filter(function(_,i){return T.chk[i];}).length+"/"+D.documents.length:"";var d=A.nextDeadline(p);
        rows.push([p.id,p.university,p.program,p.country,p.costLakh,p.months,A.TEST_LABEL[p.testNeed],A.STATUS[T.st],d?d.iso:"",n,T.note].map(A.csvCell).join(","));});
      A.saveFile("my-shortlist.csv",rows.join("\n"),"text/csv");A.toast("Shortlist exported");},text:"Export CSV"}),
    h("button",{class:"btn",type:"button",onclick:function(){window.print();},text:"Print"})));
  list.forEach(function(p){
    var T=A.track(p.id),D=A.DET[p.id],n=D&&D.documents?D.documents.filter(function(_,i){return T.chk[i];}).length:0,tot=D&&D.documents?D.documents.length:0,d=A.nextDeadline(p);
    var sel=h("select",{class:"status-sel","aria-label":"Status for "+p.program,onchange:function(e){T.st=e.target.value;A.save("track");}});
    Object.keys(A.STATUS).forEach(function(k){var o=h("option",{value:k,text:A.STATUS[k]});if(T.st===k)o.selected=true;sel.appendChild(o);});
    var pr=h("div",{class:"prog"},h("b",{style:"width:"+(tot?100*n/tot:0)+"%"}));
    out.push(h("article",{class:"sl"},
      h("div",null,h("div",{class:"row",style:"flex-wrap:nowrap;margin-bottom:4px"},A.uniLogo(p.university,p.links.university),
          h("div",null,h("h3",null,h("a",{href:"#"+p.id,style:"color:inherit;text-decoration:none",text:p.program})),h("div",{class:"meta"},A.flag(p.country)," "+p.university+", "+p.country))),
        h("div",{class:"chiprow",style:"margin:6px 0"},h("span",{class:"mini-t",text:A.money(p.costLakh)}),h("span",{class:"mini-t",text:p.months+" months"}),h("span",{class:"mini-t",text:"Score "+A.score(p).toFixed(2)}),
          h("span",{class:"mini-t "+(p.testNeed==="required"?"w":p.testNeed==="none"?"g":""),text:A.TEST_LABEL[p.testNeed]}),A.profileSet()?A.fitChip(p):null),
        d?h("p",{class:"small",style:"margin:4px 0",text:"Next date: "+A.fmtDate(d.iso)+" ("+A.daysLeft(d.iso)+" days)"}):h("p",{class:"small",style:"margin:4px 0",text:"No dated deadline found: check the programme page."}),
        tot?h("div",{style:"max-width:320px"},pr,h("span",{class:"small",text:n+" of "+tot+" documents ready"})):null,
        T.note?h("p",{class:"small",style:"margin:6px 0 0;white-space:pre-wrap",text:T.note.length>140?T.note.slice(0,140)+"...":T.note}):null),
      h("div",{style:"display:grid;gap:8px;align-content:start;justify-items:end"},sel,
        h("a",{class:"btn",href:"#"+p.id,style:"text-decoration:none",text:"Open"}),
        shared?null:h("button",{class:"btn",type:"button",onclick:function(){A.shortToggle(p.id);A.route();},text:"Remove"}))));});
  return wrap(out);};

/* ================= compare ================= */
A.views.compare=function(){
  var S=A.state,list=S.cmp.map(function(id){return A.byId[id];});
  var out=[head("Compare programmes","Side by side, up to four. Green marks the best value in a row.")];
  if(list.length<2){out.push(empty(list.length?"Add one more to compare":"Nothing to compare yet","Use the compare button (two squares) on any programme row or page.","Browse programmes"));
    if(list.length)out.push(h("p",{class:"small",text:"In compare: "+list[0].program}));return wrap(out);}
  var best=function(vals,fn){var v=vals.map(fn);var b=Math.min.apply(null,v);return v.map(function(x){return x===b;});};
  var rows=[];
  function addRow(label,fn,opts){rows.push({label:label,fn:fn,opts:opts||{}});}
  addRow("University",function(p){return p.university;});
  addRow("Country",function(p){return p.country;});
  addRow("Total cost",function(p){return A.money(p.costLakh);},{best:function(p){return p.costLakh;},num:1});
  addRow("Duration",function(p){return p.months+" months";},{best:function(p){return p.months;},num:1});
  addRow("Your score",function(p){return A.score(p).toFixed(2);},{best:function(p){return -A.score(p);},num:1});
  addRow("Tuition",function(p){return p.tuition;});
  addRow("Living cost",function(p){return p.living;});
  addRow("GMAT / GRE",function(p){return A.TEST_LABEL[p.testNeed];});
  addRow("English",function(p){var D=A.DET[p.id];return D&&D.tests&&D.tests.english?D.tests.english:"Not captured";});
  addRow("Next date",function(p){var d=A.nextDeadline(p);return d?A.fmtDate(d.iso):"None found";});
  addRow("PR route (1-10)",function(p){return String(p.pr);},{best:function(p){return -p.pr;},num:1});
  addRow("Admission odds (1-10)",function(p){return String(p.adm);},{best:function(p){return -p.adm;},num:1});
  addRow("Scholarships",function(p){var D=A.DET[p.id];return D&&D.scholarships&&D.scholarships.length?D.scholarships.map(function(x){return x.name;}).join("; "):"None listed";});
  addRow("Fit for you",function(p){return A.FITLABEL[A.fit(p).level];});
  addRow("Details verified",function(p){return A.conf(p)==="verified"?"Yes":"Partly";});
  var t=h("table",{class:"tbl"});
  var hr=h("tr",null,h("th",{text:""}));
  list.forEach(function(p){hr.appendChild(h("th",null,h("a",{href:"#"+p.id,text:p.program,style:"text-transform:none;letter-spacing:0;font-size:13px"}),h("div",{class:"small",style:"text-transform:none;letter-spacing:0;font-weight:400",text:p.university}),
    h("button",{class:"btn",type:"button",style:"margin-top:6px;padding:3px 8px;font-size:12px",onclick:function(){A.cmpToggle(p.id);A.route();},text:"Remove"})));});
  t.appendChild(h("thead",null,hr));
  var tb=h("tbody");
  rows.forEach(function(r){
    var tr=h("tr",null,h("td",{text:r.label}));
    var flags=r.opts.best?best(list,r.opts.best):null;
    list.forEach(function(p,i){tr.appendChild(h("td",{class:(r.opts.num?"num ":"")+(flags&&flags[i]&&new Set(list.map(r.opts.best)).size>1?"best":""),text:r.fn(p)}));});
    tb.appendChild(tr);});
  t.appendChild(tb);
  out.push(h("div",{class:"tblw"},t));
  out.push(h("div",{class:"row mt"},h("button",{class:"btn",type:"button",onclick:function(){S.cmp=[];A.save("cmp");A.refreshNav();A.route();},text:"Clear comparison"}),
    h("button",{class:"btn",type:"button",onclick:function(){window.print();},text:"Print"})));
  return wrap(out);};

/* ================= deadlines ================= */
A.views.deadlines=function(){
  var S=A.state,mode=A.store.get("dlmode",S.short.length?"short":"all"),past=A.store.get("dlpast",false);
  var out=[head("Deadlines","Every dated deadline we found, soonest first. Dates come from official pages when we read them: confirm before you rely on one.")];
  var all=A.allDeadlines().filter(function(x){return (past||A.daysLeft(x.iso)>=0);});
  if(mode==="short")all=all.filter(function(x){return S.short.indexOf(x.p.id)>=0;});
  var kinds={deadline:"Deadline",early:"Early bird",opens:"Applications open",result:"Results",documents:"Documents due",scholarship:"Scholarship"};
  var seg=h("div",{class:"seg",role:"group","aria-label":"Which programmes"},
    h("button",{type:"button","aria-pressed":mode==="short"?"true":"false",onclick:function(){A.store.set("dlmode","short");A.route();},text:"My shortlist ("+S.short.length+")"}),
    h("button",{type:"button","aria-pressed":mode==="all"?"true":"false",onclick:function(){A.store.set("dlmode","all");A.route();},text:"All programmes"}));
  out.push(h("div",{class:"row mb"},seg,h("label",{class:"chk small",style:"display:flex;gap:8px;align-items:center"},h("input",{type:"checkbox",checked:past?true:null,onchange:function(e){A.store.set("dlpast",e.target.checked);A.route();}}),"Show past"),h("span",{class:"sp"}),
    all.length?h("button",{class:"btn",type:"button",onclick:function(){A.saveFile("masters-atlas-deadlines.ics",A.ics(all.filter(function(x){return x.kind!=="result";})),"text/calendar");A.toast("Calendar file downloaded");},text:"Add all to calendar (.ics)"}):null));
  if(!all.length){out.push(empty(mode==="short"&&!S.short.length?"Shortlist some programmes first":"No dated deadlines to show","Programmes without a published date are not listed. Open a programme for its deadline notes.",mode==="short"?"Browse programmes":"Show all programmes",mode==="short"&&S.short.length?"#/deadlines":"#/explore"));
    if(mode==="short"&&S.short.length)out[out.length-1].appendChild(h("button",{class:"btn",type:"button",style:"margin-top:10px",onclick:function(){A.store.set("dlmode","all");A.route();},text:"Show all programmes"}));
    return wrap(out);}
  var groups={};all.forEach(function(x){var k=x.iso.slice(0,7);(groups[k]=groups[k]||[]).push(x);});
  Object.keys(groups).sort().forEach(function(k){
    var d=A.parseISO(k+"-01"),g=h("section",{class:"dl-group"},h("h3",{text:["January","February","March","April","May","June","July","August","September","October","November","December"][d.getMonth()]+" "+d.getFullYear()}));
    groups[k].forEach(function(x){var dd=A.parseISO(x.iso),n=A.daysLeft(x.iso);
      g.appendChild(h("div",{class:"dl"+(n>=0&&n<=21?" soon":"")+(n<0?" past":"")},
        h("div",{class:"dt"},A.MON[dd.getMonth()],h("b",{text:String(dd.getDate())})),
        h("div",null,h("a",{class:"t",href:"#"+x.p.id,text:x.p.program}),h("div",{class:"k",text:x.p.university+", "+x.p.country+" · "+kinds[x.kind]+" · "+x.text})),
        h("div",{class:"row",style:"flex-wrap:nowrap"},h("span",{class:"left",text:n<0?"past":n===0?"today":n+" days"}),
          h("button",{class:"ib",type:"button",title:"Add to calendar","aria-label":"Add to calendar",onclick:function(){A.saveFile(x.p.id+"-deadline.ics",A.ics([x]),"text/calendar");A.toast("Calendar file downloaded");}},
            A.svg('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>')))));});
    out.push(g);});
  out.push(h("p",{class:"small mt",text:"Calendar files include a reminder 14 days before. Many universities publish rolling or round-based deadlines that are not listed here."}));
  return wrap(out);};

/* ================= funding ================= */
function emi(P,rate,months){var r=rate/1200;if(!P)return 0;if(!r)return P/months;return P*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1);}
A.views.funding=function(){
  var S=A.state,F=S.fund,out=[head("Funding planner","Work out how much you may need to borrow and what the monthly repayment could look like. These are illustrative numbers: use your bank's real rate and rules.")];
  var sel=h("select",{id:"fp","aria-label":"Programme",onchange:function(e){F.pid=e.target.value;A.save("fund");calc();}});
  if(S.short.length){var og=h("optgroup",{label:"My shortlist"});S.short.forEach(function(id){var p=A.byId[id];og.appendChild(h("option",{value:id,text:p.program+", "+p.university,selected:F.pid===id?true:null}));});sel.appendChild(og);}
  var og2=h("optgroup",{label:"All programmes"});A.P.slice().sort(A.sorters.name).forEach(function(p){og2.appendChild(h("option",{value:p.id,text:p.program+", "+p.university,selected:F.pid===p.id&&S.short.indexOf(p.id)<0?true:null}));});sel.appendChild(og2);
  if(!A.byId[F.pid])F.pid=S.short[0]||A.P[0].id;sel.value=F.pid;
  function num(key,label,min,max,step,hint){return h("label",null,label,h("input",{type:"number",min:min,max:max,step:step,value:String(F[key]),"aria-label":label,oninput:function(e){F[key]=+e.target.value||0;A.save("fund");calc();}}),hint?h("span",{class:"hint",text:hint}):null);}
  var inputs=h("div",{class:"fgrid2"},num("savings","Your savings (INR lakh)",0,200,0.5),num("family","Family support (INR lakh)",0,200,0.5),num("schol","Scholarship you expect (INR lakh)",0,100,0.5,"Costs here assume none. Only count what is confirmed."),
    num("cont","Safety margin (%)",0,40,1,"Exchange rates and fees move."),num("rate","Loan interest (% a year)",0,25,0.25,"Replace with your bank's quote."),num("years","Repayment years",1,20,1),num("morat","Moratorium after study (months)",0,24,1));
  var res=h("div",{id:"fres"}),tbl=h("div",{id:"ftbl"});
  out.push(h("div",{class:"panel"},h("label",{class:"small",style:"display:grid;gap:4px;margin-bottom:12px"},"Programme",sel),inputs,res));
  out.push(h("h2",{style:"font-size:18px;margin:18px 0 8px",text:"Across your shortlist"}),tbl);
  function calc(){
    var p=A.byId[F.pid];if(!p)return;
    var cost=p.costLakh*(1+F.cont/100),funds=F.savings+F.family+F.schol,loan=Math.max(0,cost-funds);
    var studyY=p.months/12,accr=loan*F.rate/100*(studyY+F.morat/12),start=loan+accr,n=F.years*12,m=emi(start,F.rate,n),totalPaid=m*n;
    function fact(k,v,cls){return h("div",{class:"fact"},h("dt",{text:k}),h("dd",{text:v,style:cls?"color:var(--"+cls+")":""}));}
    var r=h("div",{class:"res"},fact("Cost with margin",A.money(cost)),fact("Your funds",A.money(funds)),fact("To borrow",loan>0?A.money(loan):"Nothing",loan>0?"warn":"good"),
      fact("Interest during study",A.money(accr)),fact("Owed at repayment start",A.money(start)),fact("Monthly repayment","INR "+Math.round(m*100000).toLocaleString("en-IN")),fact("Total repaid",A.money(totalPaid)));
    res.replaceChildren(r,h("p",{class:"hint",text:"Interest during study is simple interest on the loan over the programme plus the moratorium. Banks may differ: some charge simple interest, some compound, and some ask for collateral. Ask for the written terms."}));
    var rows=S.short.length?S.short:[p.id];
    var t=h("table",{class:"tbl"},h("thead",null,h("tr",null,h("th",{text:"Programme"}),h("th",{text:"Cost + margin"}),h("th",{text:"To borrow"}),h("th",{text:"Monthly repayment"}))));
    var tb=h("tbody");rows.forEach(function(id){var q=A.byId[id],c=q.costLakh*(1+F.cont/100),l=Math.max(0,c-funds),st=l+l*F.rate/100*(q.months/12+F.morat/12);
      tb.appendChild(h("tr",null,h("td",null,h("a",{href:"#"+id,text:q.program}),h("div",{class:"small",text:q.university})),h("td",{class:"num",text:A.money(c)}),h("td",{class:"num",text:l>0?A.money(l):"Nothing"}),h("td",{class:"num",text:"INR "+Math.round(emi(st,F.rate,n)*100000).toLocaleString("en-IN")})));});
    t.appendChild(tb);tbl.replaceChildren(h("div",{class:"tblw"},t));}
  calc();return wrap(out);};

/* ================= roadmap ================= */
var ROAD=[
 {t:"Now to mid-November 2026",h:"Decide where to apply",tasks:[
  ["r1","Fill in your profile on Explore and star 8 to 12 programmes across at least three countries: some safe, some target, some reach."],
  ["r2","Open each shortlisted programme's official page and read its 'Not confirmed' list. Use the email draft to ask what is unclear."],
  ["r3","Check the 3-year versus 4-year degree rule for every country on your list."],
  ["r4","Decide how you will pay: savings, family, loan, scholarships. Try the Funding planner."]]},
 {t:"November 2026 to January 2027",h:"Tests and documents",tasks:[
  ["r5","Book IELTS Academic (or the test each school accepts). Slots fill, and results are usually valid for 2 years."],
  ["r6","If any shortlisted programme needs a GMAT or GRE, book it now and leave time to retake. Send official score reports."],
  ["r7","Germany: start the APS certificate and any uni-assist VPD early. They take weeks."],
  ["r8","Request transcripts, degree certificate and module descriptions from your university. Order certified translations if needed."],
  ["r9","Ask two referees. Draft your CV and statement of purpose."]]},
 {t:"December 2026 to March 2027",h:"Early rounds and scholarships",tasks:[
  ["r10","Apply to programmes with early rounds first (see Deadlines). Many scholarship deadlines match the early rounds."],
  ["r11","Apply for scholarships you qualify for. Keep a copy of every form."],
  ["r12","Update each programme's status in your shortlist as you submit."]]},
 {t:"March to June 2027",h:"Main deadlines and offers",tasks:[
  ["r13","Submit the remaining applications before their deadlines. Check each school's rules on documents arriving late."],
  ["r14","Compare offers on cost, fit and visa route. Read refund terms before paying any deposit."],
  ["r15","Accept one offer and tell the others you are withdrawing."]]},
 {t:"April to July 2027",h:"Money and visa",tasks:[
  ["r16","Arrange proof of funds as your country requires: blocked account, GIC, bank statements or loan sanction. See the country guide."],
  ["r17","Book your visa appointment as soon as you have the documents. Peak months fill up."],
  ["r18","Buy health insurance and arrange accommodation."]]},
 {t:"July to September 2027",h:"Before you fly",tasks:[
  ["r19","Carry originals and copies of your documents. Register with the university on arrival."],
  ["r20","Set up a local bank account, SIM and transport pass in your first week."]]}];
A.views.roadmap=function(){
  var S=A.state,out=[head("Application roadmap","A month-by-month plan for a September 2027 start. Tick tasks as you go: progress saves in this browser.")];
  var total=0,done=0;ROAD.forEach(function(ph){ph.tasks.forEach(function(t){total++;if(S.road[t[0]])done++;});});
  var pb=h("div",{class:"prog"},h("b",{style:"width:"+(100*done/total)+"%"})),lbl=h("span",{class:"small",text:done+" of "+total+" tasks done"});
  out.push(h("div",{class:"panel",style:"margin-bottom:16px"},pb,lbl));
  ROAD.forEach(function(ph){
    var box=h("section",{class:"phase"},h("div",{class:"when",text:ph.t}),h("h3",{text:ph.h}));
    var ul=h("ul",{class:"todo",style:"margin-top:6px"});
    ph.tasks.forEach(function(t){ul.appendChild(h("li",null,h("input",{type:"checkbox",id:t[0],checked:S.road[t[0]]?true:null,onchange:function(e){if(e.target.checked)S.road[t[0]]=true;else delete S.road[t[0]];A.save("road");
      var dn=0;ROAD.forEach(function(p){p.tasks.forEach(function(x){if(S.road[x[0]])dn++;});});pb.firstChild.style.width=(100*dn/total)+"%";lbl.textContent=dn+" of "+total+" tasks done";}}),h("label",{for:t[0]},A.gl(t[1]))));});
    box.appendChild(ul);out.push(box);});
  out.push(h("div",{class:"row"},h("a",{class:"btn",href:"#/deadlines",style:"text-decoration:none",text:"See deadlines"}),h("a",{class:"btn",href:"#/funding",style:"text-decoration:none",text:"Funding planner"}),h("a",{class:"btn",href:"#/guide",style:"text-decoration:none",text:"Glossary"})));
  return wrap(out);};

/* ================= countries ================= */
A.views.countries=function(){
  var by={};A.P.forEach(function(p){(by[p.country]=by[p.country]||[]).push(p);});
  var out=[head("Countries compared","What each country offers in this dataset. Click a country to see its programmes.")];
  var rows=Object.keys(by).map(function(c){var L=by[c],cs=L.map(function(p){return p.costLakh;}),C=A.CTRY[c]||{};
    return {c:c,n:L.length,min:Math.min.apply(null,cs),max:Math.max.apply(null,cs),within:L.filter(function(p){return p.costLakh<=A.cap();}).length,
      free:L.filter(function(p){return p.testNeed==="none"||p.testNeed==="optional";}).length,pr:Math.round(10*L.reduce(function(a,p){return a+p.pr;},0)/L.length)/10,
      after:(C.after||"Not verified here.").split(/(?<=\.)\s/)[0],three:L[0].threeYear,cont:L[0].continent};});
  rows.sort(function(a,b){return b.n-a.n||a.min-b.min;});
  var t=h("table",{class:"tbl ctry"},h("thead",null,h("tr",null,["Country","Programmes","Cost range","Within budget","No GMAT/GRE needed","PR score","3-year degree","After study"].map(function(x){return h("th",{text:x});}))));
  var tb=h("tbody");
  rows.forEach(function(r){tb.appendChild(h("tr",null,
    h("td",null,h("a",{href:"#/explore",onclick:function(e){e.preventDefault();Object.assign(A.state.F,A.DEFAULT_FILTERS,{cont:r.cont,country:r.c});A.save("filters");location.hash="#/explore";},text:r.c}),h("span",{style:"margin-left:6px"},A.flag(r.c))),
    h("td",{class:"num",text:String(r.n)}),h("td",{class:"num",text:r.min.toFixed(0)+" to "+r.max.toFixed(0)+" L"}),h("td",{class:"num",text:r.within+" of "+r.n}),h("td",{class:"num",text:r.free+" of "+r.n}),
    h("td",{class:"num",text:String(r.pr)}),h("td",{text:r.three==="yes"?"Usually fine":r.three==="no"?"Usually not":"Ask"}),h("td",null,A.gl(r.after))));});
  t.appendChild(tb);out.push(h("div",{class:"tblw"},t));
  out.push(h("p",{class:"small mt",text:"PR score is the average of our 1-10 rating. 'After study' is the first sentence of each country guide: open a programme for the full guide and its caveats."}));
  return wrap(out);};

/* ================= guide ================= */
var FAQ=[
 ["How is the total cost calculated?","Tuition for the whole programme, plus living cost for each year, insurance and visa fees, and a one-off setup allowance of INR 2.0 to 2.5 lakh, converted at the listed exchange rates. It assumes no scholarship. Living costs marked 'assumed' are my estimates, not a university figure."],
 ["What do 'verified' and 'partial' mean?","Verified means the key facts were read on the official page on the date shown. Partial means some items came from a search summary, an older page or a consultancy source, or could not be read. Each programme lists what is 'Not confirmed'. Check those before paying anything."],
 ["Are the scores facts?","Affordability follows cost bands, immigration and PR follow country rules, and duration follows months. Relevance, employability and admission odds are my judgement. Change the weights on Explore to reflect what matters to you."],
 ["Can I trust the 'Good fit' check?","Use it to spot obvious problems: a missing test, a 3-year degree where 4 years is expected, an IELTS score under the minimum. It compares your answers with the requirements we found. It cannot predict an admission decision."],
 ["Is a 3-year Indian bachelor's accepted?","It depends on the country and programme. Germany often accepts 180 ECTS if your university is recognised. Canada usually wants 4 years. The Netherlands can rate some 3-year degrees below research-university level. Each programme page and country guide gives what we found."],
 ["Which exam should I book first?","IELTS Academic is accepted at most schools. Book a GMAT or GRE only if a programme you want requires it: use the GMAT/GRE filter and your shortlist summary to count how many do."],
 ["Why might a fact differ from the university's page?","Fees, deadlines and visa rules change. Every programme shows the date checked. If something is wrong, use 'Report a wrong or outdated detail' on the programme page."],
 ["Where is my shortlist saved?","Only in this browser, on this device. Clearing site data removes it. Export your shortlist as CSV, or copy a share link, to keep or move it."],
 ["Can I use this offline?","After your first visit the site works offline for pages you have already opened, and you can add it to your phone's home screen."],
 ["Is this legal or migration advice?","No. Confirm visa and immigration rules with official government sources or a registered adviser before paying any fee."]];
A.views.guide=function(){
  var out=[head("Guide","How to use this site, what the labels mean, and what every acronym stands for.")];
  out.push(h("div",{class:"grid3 mb"},
    h("div",{class:"panel"},h("h3",{class:"h3s",text:"1. Set your profile"}),h("p",{class:"small",style:"margin:0",text:"On Explore, add your degree length, marks, IELTS and test plans. Every programme then shows a fit chip."})),
    h("div",{class:"panel"},h("h3",{class:"h3s",text:"2. Shortlist and compare"}),h("p",{class:"small",style:"margin:0",text:"Star programmes to track status, documents and notes. Compare up to four side by side."})),
    h("div",{class:"panel"},h("h3",{class:"h3s",text:"3. Plan dates and money"}),h("p",{class:"small",style:"margin:0",text:"Deadlines lists every date with calendar export. Funding shows what you may need to borrow."}))));
  out.push(h("section",{class:"panel faq mb"},h("h3",{class:"h3s",text:"Questions"}),FAQ.map(function(q){return h("details",null,h("summary",{text:q[0]}),h("p",null,q[1]));})));
  var gl=h("div",{class:"gloss"});Object.keys(A.GLOSS).sort(function(a,b){return a.toLowerCase()<b.toLowerCase()?-1:1;}).forEach(function(k){gl.appendChild(h("div",null,h("b",{text:k}),h("div",{class:"small",text:A.GLOSS[k]})));});
  out.push(h("section",{class:"panel mb"},h("h3",{class:"h3s",text:"Glossary"}),h("p",{class:"small",style:"margin:0 0 10px",text:"Terms in the programme pages are underlined: hover, focus or tap to read them."}),gl));
  out.push(h("section",{class:"panel"},h("h3",{class:"h3s",text:"Limits"}),
    h("ul",{class:"bul"},h("li",{text:"Only 16 of 100 programme detail sets are fully verified. The rest are partial and say what is missing."}),
      h("li",{text:"Some existing fee figures are estimates and are labelled 'Unverified' or 'assumed'."}),
      h("li",{text:"Post-study permit rules were not confirmed for several countries. The country guide says so."}),
      h("li",{text:"Exchange rates for SGD, NZD, SEK, NOK, DKK, AED and HKD are working assumptions."}))));
  return wrap(out);};
})();
