var WA="966540845087";
var RV=["Luxury Sedan","Premium SUV","Family Van","Group Minibus"];
var RVN=["Luxury Sedan","Premium SUV","Hyundai Staria","Toyota HiAce"];
var REDUCED=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
function byId(i){return document.getElementById(i)}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function tr(root){if(typeof walk==="function"&&typeof LANG!=="undefined"&&LANG!=="en")walk(root)}
var ARR='<svg class="i ar-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
var PIN='<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';

// select an option by exact value, or the first option that starts with it ("Makkah" -> "Makkah Hotel")
function setSel(id,v){var s=byId(id);if(!s||!v)return false;v=String(v);var i,lv=v.toLowerCase();
 for(i=0;i<s.options.length;i++)if(s.options[i].value===v){s.selectedIndex=i;return true}
 for(i=0;i<s.options.length;i++)if(s.options[i].value&&s.options[i].value.toLowerCase().indexOf(lv)===0){s.selectedIndex=i;return true}
 return false}
function bookUrl(p){var q=[];for(var k in p)if(p[k])q.push(k+"="+encodeURIComponent(p[k]));return "/book"+(q.length?"?"+q.join("&"):"")+"#book"}

/* ---------- header: mobile menu, scroll state, back to top ---------- */
(function(){
 var b=document.body,burger=document.querySelector(".burger"),scrim=document.querySelector(".scrim"),menu=byId("menu");
 function setOpen(o){b.classList.toggle("menu-open",o);if(burger){burger.setAttribute("aria-expanded",o?"true":"false");burger.setAttribute("aria-label",o?"Close menu":"Open menu")}
  if(scrim){if(o)scrim.hidden=false;else setTimeout(function(){if(!b.classList.contains("menu-open"))scrim.hidden=true},300)}
  if(o&&menu){var f=menu.querySelector("a");if(f)setTimeout(function(){f.focus({preventScroll:true})},350)}}
 if(burger)burger.addEventListener("click",function(){setOpen(!b.classList.contains("menu-open"))});
 if(scrim)scrim.addEventListener("click",function(){setOpen(false)});
 var x=document.querySelector(".menu .x");if(x)x.addEventListener("click",function(){setOpen(false);if(burger)burger.focus()});
 if(menu)menu.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("a"))setOpen(false)});
 document.addEventListener("keydown",function(e){if(e.key==="Escape"&&b.classList.contains("menu-open")){setOpen(false);if(burger)burger.focus()}});
 window.addEventListener("resize",function(){if(window.innerWidth>1100&&b.classList.contains("menu-open"))setOpen(false)});
 var tick=false;function onScroll(){var y=window.scrollY||window.pageYOffset;b.classList.toggle("scrolled",y>10);b.classList.toggle("scrolled-far",y>700);tick=false}
 window.addEventListener("scroll",function(){if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();
 var top=document.querySelector(".totop");if(top)top.addEventListener("click",function(){window.scrollTo({top:0,behavior:REDUCED?"auto":"smooth"})});
})();

/* ---------- scroll reveal + counters ---------- */
var io=("IntersectionObserver" in window&&!REDUCED)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);if(e.target.hasAttribute("data-count"))count(e.target)}})},{threshold:.12,rootMargin:"0px 0px -40px 0px"}):null;
var RSEL=".sec-head,.strip>div,.card,.steps>div,.cta,.split>*,details,.stat,.rc,.side-card,.rev-form,.more,.tw2";
function reveal(root){(root||document).querySelectorAll(RSEL).forEach(function(el){
 if(el.classList.contains("rv-on"))return;
 if(!io){return}
 var sib=el.parentNode?Array.prototype.indexOf.call(el.parentNode.children,el):0;
 el.classList.add("rv-on");if(el.classList.contains("stat")||el.classList.contains("cta"))el.classList.add("zoom");
 el.style.transitionDelay=Math.min(sib%4,3)*90+"ms";io.observe(el)})
 document.querySelectorAll("[data-count]").forEach(function(el){if(!io){return}if(!el._c){el._c=1;io.observe(el)}})}
function count(el){var n=+el.getAttribute("data-count"),t0=null,d=1400;
 function f(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/d,1);el.textContent=Math.round(n*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)}
 el.textContent="0";requestAnimationFrame(f)}

/* ---------- photos ---------- */
function loadHero(){document.querySelectorAll(".hero[data-img]").forEach(function(h){var bg=h.querySelector(".hero-bg");if(!bg)return;
 var i=new Image();i.onload=function(){bg.style.backgroundImage="url("+i.src+")";requestAnimationFrame(function(){bg.classList.add("ready")})};i.src=h.getAttribute("data-img")})}
document.addEventListener("load",function(e){var t=e.target;if(t&&t.tagName==="IMG"&&t.parentNode&&t.parentNode.classList.contains("img")){t.classList.add("ld");t.parentNode.classList.remove("sk")}},true);
document.addEventListener("error",function(e){var t=e.target;if(t&&t.tagName==="IMG"&&t.parentNode&&t.parentNode.classList.contains("img")){t.parentNode.classList.remove("sk");t.remove()}},true);

/* ---------- site content from /api/content (managed in /admin) ---------- */
function card(img,emoji,alt,body,tag){
 return '<article class="card"><div class="img'+(img?' sk':'')+'">'+(tag?'<span class="tag">'+tag+'</span>':'')+esc(emoji)+(img?'<img src="'+esc(img)+'" alt="'+esc(alt)+'" loading="lazy" decoding="async">':'')+'</div><div class="b">'+body+'</div></article>'}
function price(v){return v!==""&&v!=null?'<p class="from"><span>From</span> SAR '+esc(v)+'</p>':''}
function renderServices(list){byId("svcCards").innerHTML=list.map(function(s){
 return card(s.image,s.emoji,s.title,'<b>'+esc(s.title)+'</b><p>'+esc(s.desc)+'</p><a class="btn s" href="'+esc(bookUrl({notes:s.title}))+'">Book '+ARR+'</a>')}).join("")}
function renderZiyarat(list){byId("zCards").innerHTML=list.map(function(z){
 var pts=(z.points||[]).map(function(p){return '<li>'+esc(p)+'</li>'}).join("");
 return card(z.image,z.emoji,z.title,'<b>'+esc(z.title)+'</b>'+price(z.from)+'<p>'+esc(z.desc)+'</p><ul class="ck">'+pts+'</ul><a class="btn s" href="'+esc(bookUrl({to:"Ziyarat Tour",notes:z.title}))+'">Book This Tour '+ARR+'</a>')}).join("")}
function renderFleet(list){byId("fleetCards").innerHTML=list.map(function(f){
 return card(f.image,f.emoji,f.name,'<b>'+esc(f.name)+'</b><p>'+esc(f.desc)+'</p><a class="btn s" href="'+esc(bookUrl({veh:f.name}))+'">Check Availability '+ARR+'</a>')}).join("")}
function renderRoutes(list){byId("routeCards").innerHTML=list.map(function(r){
 var tag=r.price!==""&&r.price!=null?'<span>From</span> SAR '+esc(r.price):'';
 return card(r.image,r.emoji,r.from+" - "+r.to,'<b>'+esc(r.from)+' &rarr; '+esc(r.to)+'</b><p>Private ride, clear quote before travel.</p><a class="btn s" href="'+esc(bookUrl({from:r.from,to:r.to}))+'">Request a Quote '+ARR+'</a>',tag)}).join("")}
function rateLink(r,i,cls){var p=r[["sedan","suv","staria","hiace"][i]],has=p!==""&&p!=null;
 var ft=String(r.route||"").split(/\s*→\s*/);
 return esc(bookUrl({from:ft.length===2?ft[0]:"",to:ft.length===2?ft[1]:"",veh:RV[i],notes:r.route+(has?" - "+p+" SAR":"")}))}
function renderRates(list){
 byId("rateBody").innerHTML=list.map(function(r){
  var cells=["sedan","suv","staria","hiace"].map(function(k,i){var p=r[k],has=p!==""&&p!=null;
   return '<td><a href="'+rateLink(r,i)+'" class="pc'+(has?'':' ask')+'">'+(has?esc(p):"Ask")+'</a></td>'}).join("");
  return '<tr><td>'+esc(r.route)+'</td>'+cells+'</tr>'}).join("");
 var rc=byId("rateCards");if(rc)rc.innerHTML=list.map(function(r){
  var cells=["sedan","suv","staria","hiace"].map(function(k,i){var p=r[k],has=p!==""&&p!=null;
   return '<a href="'+rateLink(r,i)+'"><small>'+RVN[i]+'</small>'+(has?'<b>'+esc(p)+' <small>SAR</small></b>':'<b class="ask">Ask</b>')+'</a>'}).join("");
  return '<div class="rc"><h4>'+PIN+esc(r.route)+'</h4><div class="rc-g">'+cells+'</div></div>'}).join("")}

fetch("/api/content").then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(c){
 var st=c.settings||{};var hm=document.querySelector(".hero[data-img]:not([data-page])");if(hm&&st.hero)hm.setAttribute("data-img",st.hero);
 var ph=document.querySelector(".hero[data-page]");if(ph&&st.heroes&&st.heroes[ph.getAttribute("data-page")])ph.setAttribute("data-img",st.heroes[ph.getAttribute("data-page")]);
 var home=!!byId("quick");
 if(byId("svcCards"))renderServices(c.services||[]);if(byId("zCards"))renderZiyarat(c.ziyarat||[]);
 if(byId("routeCards"))renderRoutes(home?(c.routes||[]).slice(0,4):(c.routes||[]));
 if(byId("rateBody"))renderRates(c.rates||[]);if(byId("fleetCards"))renderFleet(c.fleet||[]);
 loadHero();tr(document.body);reveal();rails()}).catch(function(){loadHero();reveal()}); // if the API is down, the static HTML stays

/* ---------- booking form ---------- */
var today=new Date();today=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().split("T")[0];
["date","rdate","qd"].forEach(function(i){if(byId(i))byId(i).min=today});
function syncTrip(){var r=byId("tt2")&&byId("tt2").checked;if(byId("trip"))byId("trip").value=r?"return":"oneway";
 document.querySelectorAll(".ret").forEach(function(e){e.style.display=r?"":"none"})}
document.querySelectorAll("input[name=tt]").forEach(function(x){x.addEventListener("change",syncTrip)});
document.querySelectorAll("input[name=rr]").forEach(function(x){x.addEventListener("change",function(){if(byId("rrate"))byId("rrate").value=this.value})});
if(byId("book")){
 var q=new URLSearchParams(location.search);
 if(q.get("from"))setSel("from",q.get("from"));if(q.get("to"))setSel("to",q.get("to"));
 if(q.get("veh"))setSel("veh",q.get("veh"));if(q.get("notes"))byId("notes").value=q.get("notes").slice(0,300);
 if(q.get("date")&&q.get("date")>=today)byId("date").value=q.get("date");
 if(q.get("trip")==="return"&&byId("tt2")){byId("tt2").checked=true}
 syncTrip();
 byId("book").addEventListener("input",function(e){e.target.classList.remove("bad")});
 byId("book").addEventListener("change",function(e){e.target.classList.remove("bad")});
}
function G(i){var e=byId(i);return e?e.value.trim():""}
function need(ids){var miss=ids.filter(function(i){return !G(i)});miss.forEach(function(i){var e=byId(i);e.classList.remove("bad");void e.offsetWidth;e.classList.add("bad")});
 if(miss.length){var f=byId(miss[0]);f.scrollIntoView({behavior:REDUCED?"auto":"smooth",block:"center"});setTimeout(function(){f.focus({preventScroll:true})},350)}return !miss.length}
function send(e){e.preventDefault();
var m=byId("msg"),btn=e.target.querySelector("button[type=submit]");m.className="";
var ret=G("trip")==="return";
if(!need(["from","to","date","time"])){m.textContent=t("Please select pickup, drop-off, date and time.");return false}
if(ret&&!need(["rdate"])){m.textContent=t("Please select the return date.");return false}
var data={name:G("name"),phone:G("phone"),pickup:G("from"),dropoff:G("to"),date:G("date"),time:G("time"),trip:G("trip"),rdate:G("rdate"),rtime:G("rtime"),flight:G("flight"),passengers:G("pax"),vehicle:G("veh"),notes:G("notes")};
btn.disabled=true;m.textContent=t("Sending...");
fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
.then(function(r){return r.json().then(function(j){return{ok:r.ok,status:r.status,j:j}})})
.then(function(x){
 if(!x.ok){m.textContent=x.j.error||t("Could not send. Please try again.");if(x.status>=500)openWA(data,"");return}
 openWA(data,x.j.ref);m.className="ok";m.textContent=t("Request received. Reference:")+" "+x.j.ref+". "+t("We will contact you shortly.");e.target.reset();byId("tt1").checked=true;syncTrip();
 m.scrollIntoView({behavior:REDUCED?"auto":"smooth",block:"center"})})
.catch(function(){openWA(data,"");m.textContent=t("Server unavailable. Opening WhatsApp instead.")})
.then(function(){btn.disabled=false});
return false}
function openWA(d,ref){var x="Assalamu Alaikum, I would like a quote from ZHA Riders Makkah."+(ref?"\nRef: "+ref:"")+"\nName: "+(d.name||"-")+(d.phone?"\nPhone: "+d.phone:"")+"\nPickup: "+d.pickup+"\nDrop-off: "+d.dropoff+"\nDate: "+d.date+" "+d.time+(d.flight?"\nFlight: "+d.flight:"")+(d.trip==="return"?"\nReturn: "+d.rdate+" "+d.rtime:"\nOne way")+"\nPassengers: "+d.passengers+"\nVehicle: "+d.vehicle+(d.notes?"\nNotes: "+d.notes:"");
window.open("https://wa.me/"+WA+"?text="+encodeURIComponent(x),"_blank")}

/* ---------- reviews ---------- */
function stars(n){n=Math.max(1,Math.min(5,+n||5));return "★★★★★".slice(0,n)+"☆☆☆☆☆".slice(0,5-n)}
fetch("/api/reviews").then(function(r){return r.json()}).then(function(list){
 if(!byId("revTop")||!Array.isArray(list)||!list.length)return;
 byId("revTop").style.display="";var box=byId("revList");if(byId("quick"))list=list.slice(0,6);
 list.forEach(function(v){var d=document.createElement("article");d.className="card rv";var s=document.createElement("div");s.className="stars";s.textContent=stars(v.rating);s.setAttribute("aria-label",(v.rating||5)+" / 5");
 var p=document.createElement("p");p.textContent=v.text;var b=document.createElement("b");var av=document.createElement("span");av.className="av";av.textContent=(String(v.name||"?").trim()[0]||"?").toUpperCase();
 b.appendChild(av);b.appendChild(document.createTextNode(v.name||""));d.appendChild(s);d.appendChild(p);d.appendChild(b);box.appendChild(d)});reveal(box);rails()}).catch(function(){});
function sendReview(e){e.preventDefault();var m=byId("rmsg");m.className="";
if(G("rtext").length<10){need(["rtext"]);m.textContent=t("Please write a short review (at least 10 characters).");return false}
fetch("/api/reviews",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:G("rname"),rating:G("rrate"),text:G("rtext")})})
.then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})}).then(function(x){
 if(!x.ok){m.textContent=x.j.error||"Error";return}m.className="ok";m.textContent=t("Thank you! Your review will appear after approval.");e.target.reset();if(byId("r5"))byId("r5").checked=true;if(byId("rrate"))byId("rrate").value="5"})
.catch(function(){m.textContent="Error"});return false}

/* ---------- swipe rails (home page on phones): dots follow the scroll ---------- */
function rails(){document.querySelectorAll(".rail-hint").forEach(function(h){var r=byId(h.getAttribute("data-for"));if(!r)return;var n=r.children.length;
 if(h._n===n)return;h._n=n;h.innerHTML=n>1?new Array(n+1).join("<i></i>"):"";var dots=h.children;
 function upd(){if(!dots.length)return;var w=r.children[0].getBoundingClientRect().width+14,x=Math.abs(r.scrollLeft),k=Math.min(n-1,Math.round(x/w));for(var i=0;i<dots.length;i++)dots[i].classList.toggle("on",i===k)}
 if(!r._s){r._s=1;r.addEventListener("scroll",function(){requestAnimationFrame(upd)},{passive:true})}upd()})}

initLang();reveal();rails();
