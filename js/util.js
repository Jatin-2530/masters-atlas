/* Shared helpers: DOM builder, storage, flags, logos, glossary tooltips, toasts, file export. Everything hangs off window.A. */
(function(){
"use strict";
var A=window.A=window.A||{};

function h(tag,attrs){var e=document.createElement(tag);
  if(attrs)for(var k in attrs){var v=attrs[k];if(v==null||v===false)continue;
    if(k==="class")e.className=v;else if(k==="text")e.textContent=v;
    else if(k.slice(0,2)==="on")e.addEventListener(k.slice(2),v);else e.setAttribute(k,v===true?"":v);}
  for(var i=2;i<arguments.length;i++){var c=arguments[i];if(c==null||c===false)continue;
    if(Array.isArray(c)){c.forEach(function(x){if(x!=null&&x!==false)e.appendChild(typeof x==="string"?document.createTextNode(x):x);});continue;}
    e.appendChild(typeof c==="string"?document.createTextNode(c):c);}
  return e;}
A.h=h;
A.svg=function(markup,cls){var d=document.createElement("div");d.innerHTML=markup;var e=d.firstChild;if(cls)e.setAttribute("class",cls);return e;};
A.stag=function(nodes,step){Array.prototype.forEach.call(nodes,function(n,i){n.style.setProperty("--i",String((step||1)*i));});};
A.REDUCED=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);

/* storage: JSON under one prefix, never throws */
A.store={
  get:function(k,d){try{var v=localStorage.getItem("atlas:"+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},
  set:function(k,v){try{localStorage.setItem("atlas:"+k,JSON.stringify(v));}catch(e){}},
  raw:function(k){try{return localStorage.getItem(k);}catch(e){return null;}}
};

A.ICON={
  star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
  cmp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="7.5" height="14" rx="2"/><rect x="13.5" y="5" width="7.5" height="14" rx="2"/></svg>',
  up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
};

/* flags and logos */
A.ISO={"Hong Kong":"hk","Poland":"pl","Czechia":"cz","Hungary":"hu","Portugal":"pt","Estonia":"ee","Lithuania":"lt","Luxembourg":"lu","Australia":"au","Austria":"at","Canada":"ca","Denmark":"dk","Finland":"fi","France":"fr","Germany":"de","Ireland":"ie","Italy":"it","Netherlands":"nl","New Zealand":"nz","Norway":"no","Singapore":"sg","Spain":"es","Sweden":"se","Switzerland":"ch","United Arab Emirates":"ae","United Kingdom":"gb","United States":"us"};
A.flag=function(country,lg){var c=A.ISO[country];if(!c)return null;
  return h("img",{class:"flag"+(lg?" lg":""),src:"https://flagcdn.com/w40/"+c+".png",srcset:"https://flagcdn.com/w80/"+c+".png 2x",alt:"",width:lg?24:20,height:lg?18:15,loading:"lazy",decoding:"async",onerror:function(e){e.target.remove();}});};
function initials(name){var w=name.split("/")[0].split(/[\s,()-]+/).filter(function(x){return /^[A-Z]/.test(x)&&!/^(Of|The|And)$/.test(x);});
  return (w.length>1?w[0][0]+w[1][0]:(w[0]||"?").slice(0,2)).toUpperCase();}
function hue(str){var n=0;for(var i=0;i<str.length;i++)n=(n*31+str.charCodeAt(i))%360;return n;}
A.uniLogo=function(name,url,lg){
  var el=h("span",{class:"ulogo"+(lg?" lg":""),"aria-hidden":"true",style:"--h:"+hue(name)},initials(name));
  var host="";try{host=new URL(url).hostname;}catch(e){}
  if(host){el.appendChild(h("img",{alt:"",loading:"lazy",decoding:"async",src:"https://www.google.com/s2/favicons?domain="+encodeURIComponent(host)+"&sz=64",
    onload:function(e){if(e.target.naturalWidth<32)e.target.remove();},onerror:function(e){e.target.remove();}}));}
  return el;};
A.countUp=function(el,to,dec,animate){
  if(A.REDUCED||!animate){el.textContent=to.toFixed(dec);return;}
  var t0=null,dur=900;el.textContent=(0).toFixed(dec);
  function f(t){if(t0===null)t0=t;var k=Math.min(1,(t-t0)/dur);k=1-Math.pow(1-k,4);el.textContent=(to*k).toFixed(dec);if(k<1)requestAnimationFrame(f);}
  requestAnimationFrame(f);};

/* theme */
A.applyTheme=function(t){if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);else document.documentElement.removeAttribute("data-theme");};
A.toggleTheme=function(){var cur=document.documentElement.getAttribute("data-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
  var nx=cur==="dark"?"light":"dark";A.applyTheme(nx);A.store.set("theme",nx);};

/* money and dates */
A.money=function(l){return "INR "+l.toFixed(1)+" L";};
A.MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
A.parseISO=function(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2]);};
A.daysLeft=function(iso){var t=new Date();t.setHours(0,0,0,0);return Math.round((A.parseISO(iso)-t)/86400000);};
A.fmtDate=function(iso){var d=A.parseISO(iso);return d.getDate()+" "+A.MON[d.getMonth()]+" "+d.getFullYear();};

/* toast */
var toastEl=null,toastT=null;
A.toast=function(msg){
  if(!toastEl){toastEl=h("div",{class:"toast",role:"status","aria-live":"polite"});document.body.appendChild(toastEl);}
  toastEl.textContent=msg;toastEl.classList.add("on");clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove("on");},2400);};

/* save a text file; falls back from the Claude artifact API to a normal download */
A.saveFile=function(name,text,mime){
  var blob=new Blob([text],{type:(mime||"text/plain")+";charset=utf-8"});
  var a=h("a",{href:URL.createObjectURL(blob),download:name});document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);};
A.csvCell=function(v){v=String(v==null?"":v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
A.copy=function(text,ok){
  function done(){A.toast(ok||"Copied");}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(done,function(){A.toast("Could not copy");});return;}
  var t=h("textarea",{style:"position:fixed;opacity:0"});t.value=text;document.body.appendChild(t);t.select();try{document.execCommand("copy");done();}catch(e){A.toast("Could not copy");}t.remove();};

/* glossary: wraps known terms in <abbr> and shows a tooltip on hover, focus or tap */
A.GLOSS={
 "APS":"Akademische Prüfstelle: the German-run check of Indian degrees that German visas ask for. Apply early; it takes weeks. (In France, APS is a different thing: a job-search residence permit.)",
 "uni-assist":"A service many German universities use to check foreign applicants' documents before they apply.",
 "VPD":"Vorprüfungsdokumentation: uni-assist's preliminary document check. Some universities require it and it can take about 8 weeks.",
 "ECTS":"European credit points. 60 ECTS is one full-time year, so a 3-year bachelor's is usually 180 ECTS.",
 "anabin":"A German database that rates foreign universities and degrees.",
 "Blue Card":"An EU work permit for graduate-level jobs above a salary threshold.",
 "Red-White-Red Card":"Austria's work and residence card for qualified workers, including graduates of Austrian universities.",
 "CAS":"Confirmation of Acceptance for Studies: the reference number a UK university issues for your student visa.",
 "IHS":"Immigration Health Surcharge: the UK health fee paid with the visa application.",
 "GIC":"Guaranteed Investment Certificate: a Canadian bank deposit some students use to show funds.",
 "PGWP":"Post-Graduation Work Permit: Canada's open work permit after study.",
 "CLB":"Canadian Language Benchmarks: a language scale. The PGWP asks for CLB 7 in all four skills.",
 "STEM OPT":"A 24-month extension of US work training for degrees on the DHS STEM list.",
 "OPT":"Optional Practical Training: up to 12 months of US work after study.",
 "I-20":"The US form your university issues so you can apply for the F-1 student visa.",
 "F-1":"The US student visa.",
 "CoE":"Confirmation of Enrolment: the Australian document you need for the student visa.",
 "MVV":"The Dutch entry visa. Your university arranges it for you.",
 "IND":"The Dutch immigration service.",
 "zoekjaar":"The Dutch orientation-year permit that lets you look for work after graduating.",
 "Nuffic":"The Dutch organisation that compares foreign degrees with Dutch levels.",
 "HBO":"Dutch applied-sciences level. Some 3-year Indian degrees are rated here, below research-university level.",
 "WO":"Dutch research-university level, the level most Dutch masters require.",
 "Stamp 1G":"Ireland's post-study permission to look for graduate work.",
 "ENIC/NARIC":"European offices that evaluate foreign degrees.",
 "GMAT":"A business-school admission test (Graduate Management Admission Test).",
 "GRE":"A general graduate admission test, widely accepted for analytics and CS masters.",
 "GATE":"India's engineering aptitude test; TUM accepts it in place of the GRE for one programme.",
 "IELTS":"An English test. Most universities want the Academic version, not General.",
 "TOEFL":"An English test taken on a computer. Scores moved to a 1 to 6 scale for tests after 21 January 2026.",
 "CGPA":"Cumulative grade point average, usually out of 10 in India.",
 "WAM":"Weighted Average Mark: Australia's grade average.",
 "GPA":"Grade point average.",
 "MOI":"Medium of instruction letter: a certificate that your degree was taught in English. Many universities do not accept it as English proof.",
 "NAAC":"India's university accreditation body.",
 "AICTE":"India's technical education regulator.",
 "SOP":"Statement of purpose: your essay on why this programme.",
 "DAAD":"The German academic exchange service, which lists many scholarships.",
 "EQF":"European Qualifications Framework: level 7 is a master's.",
 "H+":"The best anabin rating for a foreign university: its degrees are recognised in Germany."
};
var glRe=null,glKeys=null;
function buildGl(){glKeys=Object.keys(A.GLOSS).sort(function(a,b){return b.length-a.length;});
  glRe=new RegExp("(?:^|[^A-Za-z0-9+-])("+glKeys.map(function(k){return k.replace(/[.*+?^${}()|[\]\\\/]/g,"\\$&");}).join("|")+")(?![A-Za-z0-9-])","g");}
A.gl=function(text){
  if(!glRe)buildGl();
  var frag=document.createDocumentFragment(),last=0,m;glRe.lastIndex=0;
  var seen={};
  while((m=glRe.exec(text))){
    var term=m[1],start=m.index+m[0].length-term.length;
    if(seen[term])continue;seen[term]=1;   // define each term once per block
    if(start>last)frag.appendChild(document.createTextNode(text.slice(last,start)));
    frag.appendChild(h("abbr",{class:"gl",tabindex:"0","data-def":A.GLOSS[term],text:term}));
    last=start+term.length;glRe.lastIndex=last;}
  if(last<text.length)frag.appendChild(document.createTextNode(text.slice(last)));
  return frag;};
var tip=null;
function showTip(el){
  if(!tip){tip=h("div",{class:"tip",role:"tooltip"});document.body.appendChild(tip);}
  tip.textContent=el.getAttribute("data-def");var r=el.getBoundingClientRect();
  tip.style.left=Math.max(8,Math.min(window.innerWidth-296,r.left))+"px";
  tip.style.top=(r.bottom+8>window.innerHeight-80?r.top-tip.offsetHeight-8:r.bottom+8)+"px";tip.classList.add("on");}
function hideTip(){if(tip)tip.classList.remove("on");}
document.addEventListener("mouseover",function(e){var t=e.target.closest&&e.target.closest("abbr.gl");if(t)showTip(t);});
document.addEventListener("mouseout",function(e){if(e.target.closest&&e.target.closest("abbr.gl"))hideTip();});
document.addEventListener("focusin",function(e){var t=e.target.closest&&e.target.closest("abbr.gl");if(t)showTip(t);});
document.addEventListener("focusout",hideTip);
document.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest("abbr.gl");if(t)showTip(t);else hideTip();});
window.addEventListener("scroll",hideTip,{passive:true});
})();
