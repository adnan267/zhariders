var WA="966540845087";
var RV=["Luxury Sedan","Premium SUV","Family Van","Group Minibus"];
function byId(i){return document.getElementById(i)}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function setSel(id,v){var s=byId(id);if(!s)return;for(var i=0;i<s.options.length;i++){if(s.options[i].value===v)s.selectedIndex=i}}

// photos: if the file exists in /images it replaces the emoji placeholder
function loadImgs(root){(root||document).querySelectorAll("[data-img]").forEach(function(el){var i=new Image();
i.onload=function(){el.style.backgroundImage=el.classList.contains("hero")?"linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),url("+i.src+")":"url("+i.src+")";var c=el.firstChild;if(c&&c.nodeType===3&&!el.classList.contains("hero"))c.textContent=""};
i.src=el.getAttribute("data-img")})}

// ---- SITE CONTENT: services, ziyarat tours, routes, rates and fleet come from /api/content (managed in /admin) ----
function card(img,emoji,body){return '<div class="card"><div class="img"'+(img?' data-img="'+esc(img)+'"':'')+'>'+esc(emoji)+'</div><div class="b">'+body+'</div></div>'}
function renderServices(list){byId("svcCards").innerHTML=list.map(function(s){
 return card(s.image,s.emoji,'<b>'+esc(s.title)+'</b><p>'+esc(s.desc)+'</p><a class="btn s" href="#book">Book</a>')}).join("")}
function renderZiyarat(list){byId("zCards").innerHTML=list.map(function(z){
 var pts=(z.points||[]).map(function(p){return '<li>'+esc(p)+'</li>'}).join("");
 return card(z.image,z.emoji,'<b>'+esc(z.title)+'</b>'+(z.from!==""&&z.from!=null?'<p class="from"><span>From</span> SAR '+esc(z.from)+'</p>':'')+'<p>'+esc(z.desc)+'</p><ul class="ck">'+pts+'</ul><a class="btn s zb" href="#book" data-tour="'+esc(z.title)+'">Book This Tour</a>')}).join("")}
function renderFleet(list){byId("fleetCards").innerHTML=list.map(function(f){
 return card(f.image,f.emoji,'<b>'+esc(f.name)+'</b><p>'+esc(f.desc)+'</p><a class="btn s" href="#book" data-v="'+esc(f.name)+'">Check Availability</a>')}).join("")}
function renderRoutes(list){var rc=byId("routeCards");rc.innerHTML=list.map(function(r){
 return card(r.image,r.emoji,'<b>'+esc(r.from)+' &rarr; '+esc(r.to)+'</b>'+(r.price!==""&&r.price!=null?'<p class="from"><span>From</span> SAR '+esc(r.price)+'</p>':'')+'<p>Private ride, clear quote before travel.</p><a class="btn s" href="#book" data-rf="'+esc(r.from)+'" data-rt="'+esc(r.to)+'">Request a Quote</a>')}).join("")}
function renderRates(list){byId("rateBody").innerHTML=list.map(function(r){
 var cells=["sedan","suv","staria","hiace"].map(function(k,i){var p=r[k];
  var note=r.route+(p!==""&&p!=null?" - "+p+" SAR":"");
  return '<td><a href="#book" class="pc" data-rv="'+esc(RV[i])+'" data-note="'+esc(note)+'">'+(p===""||p==null?"Ask":esc(p))+'</a></td>'}).join("");
 return '<tr><td>'+esc(r.route)+'</td>'+cells+'</tr>'}).join("")}

// clicks on prices, "book" buttons and route cards fill the booking form (works for dynamic cards too)
document.addEventListener("click",function(e){var t=e.target;if(!t||!t.closest)return;
 var v=t.closest("[data-v]");if(v){setSel("veh",v.getAttribute("data-v"));return}
 var z=t.closest(".zb");if(z){setSel("to","Ziyarat Tour");byId("notes").value=z.getAttribute("data-tour");return}
 var rf=t.closest("[data-rf]");if(rf){setSel("from",rf.getAttribute("data-rf"));setSel("to",rf.getAttribute("data-rt"));return}
 var rv=t.closest("[data-rv]");if(rv){setSel("veh",rv.getAttribute("data-rv"));byId("notes").value=rv.getAttribute("data-note")}});

fetch("/api/content").then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(c){
 var hero=document.querySelector(".hero");if(hero&&c.settings&&c.settings.hero)hero.setAttribute("data-img",c.settings.hero);
 renderServices(c.services||[]);renderZiyarat(c.ziyarat||[]);renderRoutes(c.routes||[]);renderRates(c.rates||[]);renderFleet(c.fleet||[]);
 loadImgs(document)}).catch(function(){loadImgs(document)}); // if the API is down, the static HTML stays

var today=new Date().toISOString().split("T")[0];
["date","rdate"].forEach(function(i){byId(i).min=today});
byId("trip").onchange=function(){var r=this.value==="return";document.querySelectorAll(".ret").forEach(function(e){e.style.display=r?"":"none"})};
function G(i){return byId(i).value.trim()}
function send(e){e.preventDefault();
var m=byId("msg"),btn=e.target.querySelector("button");m.className="";
var ret=G("trip")==="return";
if(!G("from")||!G("to")||!G("date")||!G("time")){m.textContent=t("Please select pickup, drop-off, date and time.");return false}
if(ret&&!G("rdate")){m.textContent=t("Please select the return date.");return false}
var data={name:G("name"),phone:G("phone"),pickup:G("from"),dropoff:G("to"),date:G("date"),time:G("time"),trip:G("trip"),rdate:G("rdate"),rtime:G("rtime"),flight:G("flight"),passengers:G("pax"),vehicle:G("veh"),notes:G("notes")};
btn.disabled=true;
fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
.then(function(r){return r.json().then(function(j){return{ok:r.ok,status:r.status,j:j}})})
.then(function(x){
 if(!x.ok){m.textContent=x.j.error||"Could not send. Please try again.";if(x.status>=500)openWA(data,"");return}
 openWA(data,x.j.ref);m.className="ok";m.textContent=t("Request received. Reference:")+" "+x.j.ref+". "+t("We will contact you shortly.");e.target.reset();document.querySelectorAll(".ret").forEach(function(e){e.style.display="none"})})
.catch(function(){openWA(data,"");m.textContent=t("Server unavailable. Opening WhatsApp instead.")})
.then(function(){btn.disabled=false});
return false}
function openWA(d,ref){var x="Assalamu Alaikum, I would like a quote from ZHA Riders Makkah."+(ref?"\nRef: "+ref:"")+"\nName: "+(d.name||"-")+"\nPickup: "+d.pickup+"\nDrop-off: "+d.dropoff+"\nDate: "+d.date+" "+d.time+(d.flight?"\nFlight: "+d.flight:"")+(d.trip==="return"?"\nReturn: "+d.rdate+" "+d.rtime:"\nOne way")+"\nPassengers: "+d.passengers+"\nVehicle: "+d.vehicle;
window.open("https://wa.me/"+WA+"?text="+encodeURIComponent(x),"_blank")}
// reviews
function stars(n){return "★★★★★".slice(0,n)+"☆☆☆☆☆".slice(0,5-n)}
fetch("/api/reviews").then(function(r){return r.json()}).then(function(list){
 if(!Array.isArray(list)||!list.length)return;
 byId("revTop").style.display="";var box=byId("revList");
 list.forEach(function(v){var d=document.createElement("div");d.className="card rv";var s=document.createElement("div");s.className="stars";s.textContent=stars(v.rating);
 var p=document.createElement("p");p.textContent=v.text;var b=document.createElement("b");b.textContent=v.name;d.appendChild(s);d.appendChild(p);d.appendChild(b);box.appendChild(d)})}).catch(function(){});
function sendReview(e){e.preventDefault();var m=byId("rmsg");m.className="";
if(G("rtext").length<10){m.textContent=t("Please write a short review (at least 10 characters).");return false}
fetch("/api/reviews",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:G("rname"),rating:G("rrate"),text:G("rtext")})})
.then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})}).then(function(x){
 if(!x.ok){m.textContent=x.j.error||"Error";return}m.className="ok";m.textContent=t("Thank you! Your review will appear after approval.");e.target.reset()})
.catch(function(){m.textContent="Error"});return false}
initLang();
