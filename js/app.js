/* App shell: navigation, hash router, keyboard shortcuts, boot. */
(function(){
"use strict";
var A=window.A,h=A.h;
A.LOGO='<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="2.2"/><ellipse cx="20" cy="20" rx="6" ry="14" stroke="currentColor" stroke-width="2.2"/><path d="M6 20h28" stroke="currentColor" stroke-width="2.2"/><path class="spark" d="M32 3l1.8 4.2L38 9l-4.2 1.8L32 15l-1.8-4.2L26 9l4.2-1.8z"/></svg>';
A.GLOBE='<svg viewBox="-100 -100 200 200" aria-hidden="true" focusable="false"><circle class="halo" r="94"/><circle class="rim" r="80"/>'
  +[-52,-26,0,26,52].map(function(y){var x=Math.sqrt(6400-y*y).toFixed(1);return '<path class="lat" d="M-'+x+' '+y+'H'+x+'"/>';}).join("")
  +[0,-3.5,-7,-10.5].map(function(d){return '<ellipse class="mer" rx="80" ry="80" style="animation-delay:'+d+'s"/>';}).join("")
  +[[-24,-20,0],[28,-34,-1.1],[44,18,-2.1]].map(function(p){return '<circle class="pulse" cx="'+p[0]+'" cy="'+p[1]+'" r="5" style="animation-delay:'+p[2]+'s"/><circle class="pin" cx="'+p[0]+'" cy="'+p[1]+'" r="2.4"/>';}).join("")
  +'</svg>';

var TABS=[["explore","Explore"],["shortlist","Shortlist"],["compare","Compare"],["deadlines","Deadlines"],["funding","Funding"],["roadmap","Roadmap"],["countries","Countries"],["guide","Guide"]];
var TITLES={explore:"Explore programmes",shortlist:"My shortlist",compare:"Compare programmes",deadlines:"Deadlines",funding:"Funding planner",roadmap:"Application roadmap",countries:"Countries compared",guide:"Guide"};
var app,nav,cur="",scrollY={},fromDetail=false;

function buildNav(){
  var S=A.state,tabs=h("div",{class:"tabs",role:"list"});
  TABS.forEach(function(t){
    var n=t[0]==="shortlist"?S.short.length:t[0]==="compare"?S.cmp.length:0;
    var a=h("a",{class:"tab",role:"listitem",href:"#/"+t[0],"data-tab":t[0],"aria-current":cur===t[0]?"page":null},t[1],n?h("span",{class:"n",text:String(n)}):null);
    tabs.appendChild(a);});
  var theme=h("button",{class:"iconbtn",type:"button","aria-label":"Toggle light or dark theme",title:"Toggle theme",onclick:A.toggleTheme},
    A.svg('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></svg>'));
  nav.replaceChildren(h("a",{class:"mini",href:"#/explore","aria-label":"Masters Atlas home"},A.svg(A.LOGO,"logo"),h("span",{text:"Atlas"})),tabs,theme);}
A.refreshNav=function(){if(nav)buildNav();};

function parse(){
  var raw=location.hash.replace(/^#/,""),q=raw.split("?"),path=q[0],params={};
  if(q[1])q[1].split("&").forEach(function(kv){var p=kv.split("=");params[decodeURIComponent(p[0])]=decodeURIComponent(p[1]||"");});
  var m=/^\/?(p\d+)$/.exec(path);
  if(m)return {name:"detail",id:m[1],params:params};
  var name=path.replace(/^\//,"")||"explore";
  if(!A.views[name]||name==="detail")name="explore";
  return {name:name,params:params};}

var mounts=0;
function route(){
  var r=parse();
  if(cur==="explore")scrollY.explore=window.scrollY;
  var prev=cur;cur=r.name==="detail"?"detail":r.name;
  var node,title;
  if(r.name==="detail"){var p=A.byId[r.id];if(!p){location.hash="#/explore";return;}node=A.views.detail(p);title=p.program+", "+p.university;}
  else{node=A.views[r.name](r.params,mounts===0||prev!=="explore");title=TITLES[r.name];}
  app.replaceChildren(node);mounts++;
  document.title=title+" · Masters Atlas";
  buildNav();
  var h1=document.getElementById("main-h");
  if(r.name==="explore"&&prev==="detail"&&scrollY.explore){window.scrollTo(0,scrollY.explore);}
  else window.scrollTo(0,0);
  if(h1&&r.name!=="explore"){try{h1.focus({preventScroll:true});}catch(e){}}
  var live=document.getElementById("live");if(live&&r.name!=="explore")live.textContent=title;}
A.route=route;

function typing(e){var t=e.target;return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);}
document.addEventListener("keydown",function(e){
  if(e.key==="/"&&!typing(e)&&!e.metaKey&&!e.ctrlKey){e.preventDefault();
    var go=function(){var q=document.getElementById("q");if(q){q.focus();q.select();}};
    if(cur!=="explore"){location.hash="#/explore";setTimeout(go,60);}else go();}
  if(e.key==="Escape"&&typing(e)&&e.target.id==="q"){e.target.value="";A.state.F.q="";e.target.dispatchEvent(new Event("input"));e.target.blur();}});

function boot(){
  var sv=A.store.get("theme",null)||A.store.raw("atlas-theme");A.applyTheme(sv);
  app=document.getElementById("app");nav=document.getElementById("nav");
  var skip=document.querySelector(".skip");if(skip)skip.addEventListener("click",function(e){e.preventDefault();app.setAttribute("tabindex","-1");app.focus();});
  var top=document.getElementById("totop");
  if(top){top.appendChild(A.svg(A.ICON.up));top.addEventListener("click",function(){window.scrollTo({top:0,behavior:A.REDUCED?"auto":"smooth"});});
    window.addEventListener("scroll",function(){top.classList.toggle("on",window.scrollY>700);},{passive:true});}
  A.load().then(function(){
    buildNav();window.addEventListener("hashchange",route);route();
    if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))navigator.serviceWorker.register("sw.js").catch(function(){});
  }).catch(function(){app.replaceChildren(h("div",{class:"empty panel",text:"Could not load the data files. Check that the data folder is published next to this page."}));});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
