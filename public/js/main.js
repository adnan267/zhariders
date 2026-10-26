var WA="966540845087";
var routes=[["Jeddah Airport","Makkah","✈️","route-jeddah-makkah",200],["Makkah","Madinah","🕌","route-makkah-madinah",350],["Madinah","Jeddah Airport","🛣️","route-madinah-jeddah",null],["Makkah","Ziyarat Tour","🕋","route-ziyarat",160]];
var rc=document.getElementById("routeCards");
routes.forEach(function(r){var d=document.createElement("div");d.className="card";
d.innerHTML='<div class="img" data-img="/images/'+r[3]+'.jpg">'+r[2]+'</div><div class="b"><b>'+r[0]+' &rarr; '+r[1]+'</b>'+(r[4]?'<p class="from"><span>From</span> SAR '+r[4]+'</p>':'')+'<p>Private ride, clear quote before travel.</p><a class="btn s" href="#book">Request a Quote</a></div>';
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
document.querySelectorAll(".zb").forEach(function(a){a.onclick=function(){setSel("to","Ziyarat Tour");document.getElementById("notes").value=a.dataset.tour}});
// ---- RATES TABLE: edit prices here (columns: Sedan, SUV, Staria, HiAce). null = "Ask" ----
var RATES=[["Jeddah Airport → Makkah",200,400,280,300],["Makkah → Jeddah Airport",160,320,200,280],["Makkah → Madinah",350,640,450,500],["Madinah → Makkah",null,null,450,null],
["Madinah Hotel → Madinah Airport",100,240,150,180],["Madinah Airport → Madinah Hotel",150,280,200,250],["Makkah Ziyarat",160,320,220,280],["Madinah Ziyarat",160,320,200,250],["Badr Ziyarat",null,null,null,null],
["Taif Ziyarat / Tour",300,760,350,450],["Makkah Hotel → Miqat",100,240,150,180],["Makkah → Jeddah Tours",280,440,350,450],["Kiswa Factory + Museum Ziyarat",200,400,250,350]];
var RV=["Luxury Sedan","Premium SUV","Family Van","Group Minibus"];
var rb=document.getElementById("rateBody");
RATES.forEach(function(r){var tr=document.createElement("tr"),td=document.createElement("td");td.textContent=r[0];tr.appendChild(td);
 for(var i=1;i<5;i++){var c=document.createElement("td"),a=document.createElement("a");a.href="#book";a.className="pc";a.textContent=r[i]===null?"Ask":r[i];
  (function(i,r){a.onclick=function(){setSel("veh",RV[i-1]);document.getElementById("notes").value=r[0]+(r[i]!==null?" - "+r[i]+" SAR":"")}})(i,r);c.appendChild(a);tr.appendChild(c)}
 rb.appendChild(tr)});
function G(i){return document.getElementById(i).value.trim()}
function send(e){e.preventDefault();
var m=document.getElementById("msg"),btn=e.target.querySelector("button");m.className="";
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
