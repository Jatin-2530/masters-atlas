/* Data loading, persisted state, scoring, profile fit, filtering and sorting. */
(function(){
"use strict";
var A=window.A;

A.state={};
var DEFAULT_FILTERS={q:"",cont:"All",country:"All",budget:"all",verify:"all",sort:"score",view:"tree",dur:"all",tests:"all",free:false,india:false,conf:false,fit:"all",ielts:"all",pr:false,short:false};
A.DEFAULT_FILTERS=DEFAULT_FILTERS;

function jget(u){return fetch(u).then(function(r){if(!r.ok)throw new Error(u);return r.json();});}

A.load=function(){
  return Promise.all([jget("data/programs.json"),jget("data/details.json").catch(function(){return {};}),jget("data/countries.json").catch(function(){return {};})]).then(function(a){
    A.DATA=a[0];A.DET=a[1]||{};A.CTRY=a[2]||{};A.P=A.DATA.programs;
    A.byId={};A.P.forEach(function(p){A.byId[p.id]=p;});
    A.WDEF=Object.assign({},A.DATA.meta.weights);A.LABEL=A.DATA.meta.weightLabels;
    var S=A.state;
    S.W=Object.assign({},A.WDEF);
    var sw=A.store.get("weights",null)||(function(){try{return JSON.parse(A.store.raw("atlas-weights")||"null");}catch(e){return null;}})();
    if(sw)Object.keys(A.WDEF).forEach(function(k){if(typeof sw[k]==="number")S.W[k]=sw[k];});
    S.profile=A.store.get("profile",{years:"",pct:"",exp:"",ielts:"",tests:""});
    S.short=A.store.get("short",[]).filter(function(id){return A.byId[id];});
    S.cmp=A.store.get("cmp",[]).filter(function(id){return A.byId[id];});
    S.track=A.store.get("track",{});
    S.road=A.store.get("road",{});
    S.budget=A.store.get("budget",A.DATA.meta.budgetLakhINR);
    S.F=Object.assign({},DEFAULT_FILTERS,A.store.get("filters",{}));S.F.q="";
    S.welcomed=A.store.get("welcomed",false);
    S.fund=A.store.get("fund",{pid:"",savings:0,family:0,schol:0,cont:10,rate:10,years:10,morat:6});
  });
};
A.save=function(k){var S=A.state;var v={weights:S.W,profile:S.profile,short:S.short,cmp:S.cmp,track:S.track,road:S.road,budget:S.budget,welcomed:S.welcomed,fund:S.fund}[k];
  if(k==="filters"){var f=Object.assign({},S.F);f.q="";A.store.set("filters",f);}else A.store.set(k,v);};

/* score and tiers */
A.score=function(p){var t=0,s=0,W=A.state.W;for(var k in W){t+=W[k]*p[k];s+=W[k];}return s?t/s:0;};
A.band=function(x){return x>=7.5?"s-hi":x>=6.5?"s-mid":"s-lo";};
A.cap=function(){return A.state.budget;};
A.budgetTier=function(p){var c=A.cap();return p.costLakh>c?"over":p.costLakh>=c*0.9?"near":"within";};
A.vclass=function(st){
  if(/^Unverified|^Conflicting/.test(st))return "b-no";
  if(/artly|caution|Conflicting|unverified|conflict|to confirm|to check/i.test(st))return "b-edge";
  return "b-yes";};
A.conf=function(p){var d=A.DET[p.id];return d?d.confidence:"partial";};

/* profile and fit */
A.profileSet=function(){var P=A.state.profile;return !!(P.years||P.pct||P.exp||P.ielts||P.tests);};
var TEST_LABEL={required:"GMAT or GRE required",either:"A test is needed (GMAT/GRE or the school's own)",optional:"GMAT/GRE optional",none:"No GMAT/GRE found",unknown:"GMAT/GRE rule unclear"};
A.TEST_LABEL=TEST_LABEL;
A.fit=function(p){
  var P=A.state.profile,hard=[],soft=[],c=A.cap();
  if(p.costLakh>c)hard.push("Costs "+A.money(p.costLakh)+", over your INR "+c+" L budget");
  else if(p.costLakh>=c*0.9)soft.push("Close to your budget at "+A.money(p.costLakh));
  if(!A.profileSet())return {level:hard.length?"block":(soft.length?"check":"good"),hard:hard,soft:soft,profile:false};
  if(p.testNeed==="required"){if(P.tests==="no")hard.push("Needs a GMAT or GRE score and you do not plan to take one");else if(P.tests==="willing")soft.push("Needs a GMAT or GRE: plan the exam");}
  else if(p.testNeed==="either"&&P.tests==="no")soft.push("Needs a test, but the school's own test may work");
  var D=A.DET[p.id];
  if(P.ielts&&D&&D.ieltsMin&&+P.ielts<D.ieltsMin)hard.push("Your IELTS "+P.ielts+" is below the "+D.ieltsMin+" minimum");
  if(P.years==="3"){if(p.threeYear==="no")hard.push("Expects a 4-year bachelor's");else if(p.threeYear==="ask")soft.push("Ask whether a 3-year degree is accepted");}
  if(P.pct&&p.minPct){if(+P.pct<p.minPct-5)hard.push("Your "+P.pct+"% is well under the about "+p.minPct+"% bar");else if(+P.pct<p.minPct)soft.push("Your "+P.pct+"% is close to the about "+p.minPct+"% bar");}
  if(p.expNeed&&P.exp!==""&&+P.exp<p.expNeed)hard.push("Expects about "+p.expNeed+" years of work experience");
  return {level:hard.length?"block":(soft.length?"check":"good"),hard:hard,soft:soft,profile:true};};
A.FITLABEL={good:"Good fit",check:"Check details",block:"Hard to qualify"};
A.fitChip=function(p){var f=A.fit(p),h=A.h;
  var tip=f.hard.concat(f.soft).join(". ")||(f.profile?"Nothing in your profile conflicts with the requirements we found.":"Fits your budget.");
  var chip=h("span",{class:"fit "+f.level,title:tip,tabindex:"0",role:"img","aria-label":A.FITLABEL[f.level]+". "+tip,text:A.FITLABEL[f.level]});chip._fit=f;return chip;};

/* filtering and sorting */
A.filtered=function(){
  var F=A.state.F,q=F.q.trim().toLowerCase(),S=A.state;
  return A.P.filter(function(p){
    var D=A.DET[p.id];
    if(F.cont!=="All"&&p.continent!==F.cont)return false;
    if(F.country!=="All"&&p.country!==F.country)return false;
    if(F.budget==="within"&&p.costLakh>S.budget)return false;
    if(F.budget==="over"&&p.costLakh<=S.budget)return false;
    if(F.verify==="ok"&&A.vclass(p.status)==="b-no")return false;
    if(F.dur!=="all"&&p.months>+F.dur)return false;
    if(F.tests==="none"&&!(p.testNeed==="none"||p.testNeed==="optional"))return false;
    if(F.tests==="req"&&!(p.testNeed==="required"||p.testNeed==="either"))return false;
    if(F.free&&!p.tuitionFree)return false;
    if(F.india&&!p.indiaFunding)return false;
    if(F.conf&&A.conf(p)!=="verified")return false;
    if(F.pr&&p.pr<8)return false;
    if(F.short&&S.short.indexOf(p.id)<0)return false;
    if(F.ielts!=="all"&&!(D&&D.ieltsMin&&D.ieltsMin<=+F.ielts))return false;
    if(F.fit==="good"&&A.fit(p).level!=="good")return false;
    if(F.fit==="ok"&&A.fit(p).level==="block")return false;
    if(q&&(p.university+" "+p.program+" "+p.country).toLowerCase().indexOf(q)<0)return false;
    return true;});};
A.sorters={
  score:function(a,b){return A.score(b)-A.score(a);},
  cost:function(a,b){return a.costLakh-b.costLakh;},
  costDesc:function(a,b){return b.costLakh-a.costLakh;},
  months:function(a,b){return a.months-b.months||a.costLakh-b.costLakh;},
  name:function(a,b){return a.university.localeCompare(b.university);},
  deadline:function(a,b){var x=A.nextDeadline(a),y=A.nextDeadline(b);return (x?x.iso:"9999")<(y?y.iso:"9999")?-1:1;}
};
A.SORTLABEL={score:"Best score",cost:"Lowest cost",costDesc:"Highest cost",months:"Shortest",name:"University A to Z",deadline:"Next deadline"};

/* deadlines */
A.nextDeadline=function(p){var D=A.DET[p.id];if(!D||!D.dates)return null;
  for(var i=0;i<D.dates.length;i++){var x=D.dates[i];if((x.kind==="deadline"||x.kind==="early")&&A.daysLeft(x.iso)>=0)return x;}return null;};
A.allDeadlines=function(){var out=[];A.P.forEach(function(p){var D=A.DET[p.id];if(D&&D.dates)D.dates.forEach(function(x){out.push({p:p,iso:x.iso,kind:x.kind,text:x.text});});});
  out.sort(function(a,b){return a.iso<b.iso?-1:a.iso>b.iso?1:0;});return out;};
A.ics=function(items){
  function d8(iso){return iso.replace(/-/g,"");}
  var L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Masters Atlas//EN","CALSCALE:GREGORIAN"];
  items.forEach(function(x,i){var end=new Date(A.parseISO(x.iso).getTime()+86400000);
    var e8=end.getFullYear()+("0"+(end.getMonth()+1)).slice(-2)+("0"+end.getDate()).slice(-2);
    L.push("BEGIN:VEVENT","UID:"+x.p.id+"-"+d8(x.iso)+"-"+i+"@masters-atlas","DTSTAMP:"+new Date().toISOString().replace(/[-:]|\.\d{3}/g,""),
      "DTSTART;VALUE=DATE:"+d8(x.iso),"DTEND;VALUE=DATE:"+e8,
      "SUMMARY:"+(x.kind==="opens"?"Opens: ":"Deadline: ")+x.p.program.replace(/[,;]/g," ")+" ("+x.p.university.replace(/[,;]/g," ")+")",
      "DESCRIPTION:"+x.text.replace(/[,;\n]/g," ")+" Check the official page before relying on this date.",
      "BEGIN:VALARM","TRIGGER:-P14D","ACTION:DISPLAY","DESCRIPTION:Deadline in 14 days","END:VALARM","END:VEVENT");});
  L.push("END:VCALENDAR");return L.join("\r\n");};

/* plain-language helpers */
A.summary=function(p){
  var D=A.DET[p.id],t=A.TEST_LABEL[p.testNeed]||"";
  var bits=[p.months+"-month "+(/part-time|online/i.test(p.mode)?p.mode.toLowerCase():"full-time")+" programme at "+p.university+" in "+p.country+".",
    "Estimated all-in cost is "+A.money(p.costLakh)+(p.costLakh>A.cap()?", over your budget.":", within your budget.")];
  bits.push(t+".");
  if(D&&D.ieltsMin)bits.push("English: IELTS "+D.ieltsMin+" or equivalent.");
  var nd=A.nextDeadline(p);if(nd)bits.push("Next date we found: "+A.fmtDate(nd.iso)+".");
  return bits.join(" ");};
A.watchouts=function(p){
  var D=A.DET[p.id],w=[];
  if(p.costLakh>A.cap())w.push("Over your INR "+A.cap()+" L budget at "+A.money(p.costLakh)+".");
  if(p.testNeed==="required")w.push("A GMAT or GRE score is required: book the exam early.");
  if(p.threeYear==="no")w.push("A 3-year bachelor's will likely not be accepted.");
  else if(p.threeYear==="ask")w.push("Ask whether a 3-year Indian bachelor's is accepted.");
  if(D&&D.ieltsMin>=7)w.push("High English bar: IELTS "+D.ieltsMin+".");
  if(D&&D.india)D.india.forEach(function(x){if(/strict|risk|will usually fail|will not|not accepted|cannot|rejected|mandatory|unclear|conflict/i.test(x)&&w.length<6)w.push(x);});
  if(A.conf(p)!=="verified")w.push("Some details are only partly verified: see 'Not confirmed' below.");
  var nd=A.nextDeadline(p);if(nd&&A.daysLeft(nd.iso)<=45)w.push("A deadline is close: "+A.fmtDate(nd.iso)+" ("+A.daysLeft(nd.iso)+" days).");
  return w;};
A.facts=function(p){
  var D=A.DET[p.id],o=[];
  o.push({t:p.months+" months",c:""});
  o.push({t:A.money(p.costLakh),c:p.costLakh>A.cap()?"b":p.costLakh>=A.cap()*0.9?"w":"g"});
  o.push({t:A.TEST_LABEL[p.testNeed],c:p.testNeed==="required"?"w":p.testNeed==="none"||p.testNeed==="optional"?"g":""});
  if(p.tuitionFree)o.push({t:"Tuition-free",c:"g"});
  if(p.pr>=8)o.push({t:"Strong PR route",c:"g"});
  if(p.indiaFunding)o.push({t:"Funding for Indians",c:"g"});
  if(D&&D.ieltsMin)o.push({t:"IELTS "+D.ieltsMin,c:D.ieltsMin>=7?"w":""});
  return o;};
A.shortToggle=function(id){var S=A.state,i=S.short.indexOf(id);
  if(i>=0){S.short.splice(i,1);A.toast("Removed from shortlist");}else{S.short.push(id);if(!S.track[id])S.track[id]={st:"researching",note:"",chk:{}};A.toast("Added to shortlist");}
  A.save("short");A.save("track");A.refreshNav();return i<0;};
A.cmpToggle=function(id){var S=A.state,i=S.cmp.indexOf(id);
  if(i>=0)S.cmp.splice(i,1);else{if(S.cmp.length>=4){A.toast("Compare up to 4 programmes. Remove one first.");return false;}S.cmp.push(id);A.toast("Added to compare ("+S.cmp.length+" of 4)");}
  A.save("cmp");A.refreshNav();return true;};
A.STATUS={researching:"Researching",preparing:"Preparing documents",applied:"Applied",offer:"Offer received",rejected:"Rejected",dropped:"Not applying"};
})();
