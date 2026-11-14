var WA="966540845087";
var CFG=window.__CFG||{},DF=window.DEFAULTS||{};
function mk(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function ml(el,o){el.setAttribute("data-ml",JSON.stringify(o));el.textContent=o.en||""}
// mobile menu
var bg=document.getElementById("burger"),mn=document.getElementById("menu");
function closeMenu(){mn.classList.remove("open");bg.setAttribute("aria-expanded","false")}
bg.onclick=function(e){e.stopPropagation();var o=mn.classList.toggle("open");bg.setAttribute("aria-expanded",o?"true":"false")};
mn.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("a"))closeMenu()});
document.addEventListener("click",function(e){if(!(e.target.closest&&e.target.closest("nav")))closeMenu()});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeMenu()});
// services (from the admin panel; the built-in cards stay if nothing was saved)
if(CFG.services){var sb=document.getElementById("svcList");sb.innerHTML="";CFG.services.forEach(function(s){var c=mk("div","card"),im=mk("div","img",s.icon||"🚗");im.setAttribute("data-img","/images/service-"+s.id+".jpg");
 var b=mk("div","b"),h=mk("b"),p=mk("p"),a=mk("a","btn s","Book");a.href="#book";ml(h,s.t);ml(p,s.d||{en:""});b.appendChild(h);b.appendChild(p);b.appendChild(a);c.appendChild(im);c.appendChild(b);sb.appendChild(c)})}
// ziyarat packages
var FEATS=["Driver explains every location","Private family tours available","Pickup and drop-off included","Clean and comfortable vehicle"];
if(CFG.packages){var pb=document.getElementById("pkgList");pb.innerHTML="";CFG.packages.forEach(function(s){var c=mk("div","card"),im=mk("div","img",s.icon||"🕌");im.setAttribute("data-img","/images/ziyarat-"+s.id+".jpg");
 var b=mk("div","b"),h=mk("b");ml(h,s.t);b.appendChild(h);
 if(s.price!==""&&s.price!=null){var f=mk("p","from");f.appendChild(mk("span",null,"From"));f.appendChild(document.createTextNode(" SAR "+s.price));b.appendChild(f)}
 var p=mk("p");ml(p,s.d||{en:""});b.appendChild(p);
 var ul=mk("ul","ck");(s.f&&s.f.length?s.f:FEATS).forEach(function(x){ul.appendChild(mk("li",null,x))});b.appendChild(ul);
 var a=mk("a","btn s zb","Book This Tour");a.href="#book";a.dataset.tour=s.t.en;b.appendChild(a);c.appendChild(im);c.appendChild(b);pb.appendChild(c)})}
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest(".zb");if(a){setSel("to","Ziyarat Tour");document.getElementById("notes").value=a.dataset.tour}});
// rates (edit them in the admin panel under Rates)
var rows=(CFG.rates&&CFG.rates.rows)||DF.rates.rows;
var RV=["Luxury Sedan","Premium SUV","Family Van","Group Minibus"],RVN=["Luxury Sedan","Premium SUV","Hyundai Staria","Toyota HiAce"];
function minPrice(n){var r=rows.filter(function(x){return x.n===n})[0];if(!r)return null;var v=r.p.filter(function(x){return x!=null});return v.length?Math.min.apply(null,v):null}
var rb=document.getElementById("rateBody");
rows.forEach(function(r){var tr=document.createElement("tr"),td=document.createElement("td");td.textContent=r.n;tr.appendChild(td);
 for(var i=0;i<4;i++){var c=document.createElement("td"),a=document.createElement("a"),v=r.p[i];a.href="#book";a.className="pc";a.textContent=v==null?"Ask":v;
  (function(i,r,v){a.onclick=function(){setSel("veh",RV[i]);document.getElementById("notes").value=r.n+(v!=null?" - "+v+" SAR":"")}})(i,r,v);var vl=document.createElement("span");vl.className="vl";vl.textContent=RVN[i];c.appendChild(vl);c.appendChild(a);tr.appendChild(c)}
 rb.appendChild(tr)});
var routes=[["Jeddah Airport","Makkah","✈️","route-jeddah-makkah","Jeddah Airport → Makkah"],["Makkah","Madinah","🕌","route-makkah-madinah","Makkah → Madinah"],["Madinah","Jeddah Airport","🛣️","route-madinah-jeddah","Madinah → Jeddah Airport"],["Makkah","Ziyarat Tour","🕋","route-ziyarat","Makkah Ziyarat"]];
var rc=document.getElementById("routeCards");
routes.forEach(function(r){var d=document.createElement("div"),pr=minPrice(r[4]);d.className="card";
d.innerHTML='<div class="img" data-img="/images/'+r[3]+'.jpg">'+r[2]+'</div><div class="b"><b>'+r[0]+' &rarr; '+r[1]+'</b>'+(pr?'<p class="from"><span>From</span> SAR '+pr+'</p>':'')+'<p>Private ride, clear quote before travel.</p><a class="btn s" href="#book">Request a Quote</a></div>';
d.querySelector("a").onclick=function(){setSel("from",r[0]);setSel("to",r[1])};rc.appendChild(d)});
// photos: if the file exists in /images it replaces the emoji placeholder
document.querySelectorAll("[data-img]").forEach(function(el){var i=new Image();
i.onload=function(){el.style.backgroundImage=el.classList.contains("hero")?"linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),url("+i.src+")":"url("+i.src+")";var c=el.firstChild;if(c&&c.nodeType===3&&!el.classList.contains("hero"))c.textContent=""};
i.src=el.getAttribute("data-img")});
function setSel(id,v){var s=document.getElementById(id);for(var i=0;i<s.options.length;i++){if(s.options[i].value===v)s.selectedIndex=i}}
document.querySelectorAll("[data-v]").forEach(function(a){a.onclick=function(){setSel("veh",a.dataset.v)}});
var today=new Date().toISOString().split("T")[0];
["date","rdate"].forEach(function(i){document.getElementById(i).min=today});
document.getElementById("trip").onchange=function(){var r=this.value==="return";document.querySelectorAll(".ret").forEach(function(e){e.style.display=r?"":"none"})};
function G(i){return document.getElementById(i).value.trim()}
function waUrl(d,ref){var x="Assalamu Alaikum, I would like a quote from ZHA Riders Makkah."+(ref?"\nRef: "+ref:"")+"\nName: "+(d.name||"-")+"\nPickup: "+d.pickup+"\nDrop-off: "+d.dropoff+"\nDate: "+d.date+" "+d.time+(d.flight?"\nFlight: "+d.flight:"")+(d.trip==="return"?"\nReturn: "+d.rdate+" "+d.rtime:"\nOne way")+"\nPassengers: "+d.passengers+"\nVehicle: "+d.vehicle;
return "https://wa.me/"+WA+"?text="+encodeURIComponent(x)}
function flag(ids){["from","to","date","time","rdate"].forEach(function(i){document.getElementById(i).classList.remove("bad")});ids.forEach(function(i){document.getElementById(i).classList.add("bad")})}
function showResult(m,text,url,ok){m.innerHTML="";m.className=ok?"okbox":"errbox";m.appendChild(document.createTextNode(text));
 if(url){m.appendChild(document.createElement("br"));var a=document.createElement("a");a.className="btn wab";a.href=url;a.target="_blank";a.rel="noopener";a.textContent=t("Send on WhatsApp");m.appendChild(a)}
 try{m.scrollIntoView({behavior:"smooth",block:"center"})}catch(x){}}
var bookForm=document.getElementById("book");
["input","change"].forEach(function(ev){bookForm.addEventListener(ev,function(e){if(e.target.classList)e.target.classList.remove("bad")})});
document.getElementById("date").addEventListener("change",function(){document.getElementById("rdate").min=this.value||today});
function send(e){e.preventDefault();var f=e.target,m=document.getElementById("msg"),btn=f.querySelector("button[type=submit]"),ret=G("trip")==="return",bad=[];
m.className="";m.textContent="";
if(!G("from"))bad.push("from");if(!G("to"))bad.push("to");if(!G("date"))bad.push("date");if(!G("time"))bad.push("time");if(ret&&!G("rdate"))bad.push("rdate");
flag(bad);
if(bad.length){showResult(m,t(bad.length===1&&bad[0]==="rdate"?"Please select the return date.":"Please select pickup, drop-off, date and time."),null,false);document.getElementById(bad[0]).focus();return false}
var data={name:G("name"),phone:G("phone"),pickup:G("from"),dropoff:G("to"),date:G("date"),time:G("time"),trip:G("trip"),rdate:G("rdate"),rtime:G("rtime"),flight:G("flight"),passengers:G("pax"),vehicle:G("veh"),notes:G("notes")};
btn.disabled=true;btn.classList.add("busy");
fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
.then(function(r){return r.json().then(function(j){return{ok:r.ok,status:r.status,j:j}})})
.then(function(x){
 if(!x.ok){showResult(m,x.j.error||"Could not send. Please try again.",x.status>=500?waUrl(data,""):null,false);return}
 var u=waUrl(data,x.j.ref);showResult(m,t("Request received. Reference:")+" "+x.j.ref+". "+t("We will contact you shortly."),u,true);
 f.reset();flag([]);document.querySelectorAll(".ret").forEach(function(e){e.style.display="none"});
 if(window.matchMedia&&matchMedia("(pointer:fine)").matches)window.open(u,"_blank")})
.catch(function(){showResult(m,t("Server unavailable. Please send your request on WhatsApp."),waUrl(data,""),false)})
.then(function(){btn.disabled=false;btn.classList.remove("busy")});
return false}
// reviews
function stars(n){return "★★★★★".slice(0,n)+"☆☆☆☆☆".slice(0,5-n)}
fetch("/api/reviews").then(function(r){return r.json()}).then(function(list){
 if(!Array.isArray(list)||!list.length)return;
 document.getElementById("revTop").style.display="";var box=document.getElementById("revList");
 list.forEach(function(v){var d=document.createElement("div");d.className="card rv";var s=document.createElement("div");s.className="stars";s.textContent=stars(v.rating);
 var p=document.createElement("p");p.textContent=v.text;var b=document.createElement("b");b.textContent=v.name;d.appendChild(s);d.appendChild(p);d.appendChild(b);box.appendChild(d)})}).catch(function(){});
function sendReview(e){e.preventDefault();var m=document.getElementById("rmsg");m.className="";
if(G("rtext").length<10){m.textContent=t("Please write a short review (at least 10 characters).");return false}
fetch("/api/reviews",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:G("rname"),rating:G("rrate"),text:G("rtext")})})
.then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})}).then(function(x){
 if(!x.ok){m.textContent=x.j.error||"Error";return}m.className="ok";m.textContent=t("Thank you! Your review will appear after approval.");e.target.reset()})
.catch(function(){m.textContent="Error"});return false}
initLang();
