var WA="966540845087";
var routes=[["Jeddah Airport","Makkah","✈️","route-jeddah-makkah"],["Makkah","Madinah","🕌","route-makkah-madinah"],["Madinah","Jeddah Airport","🛣️","route-madinah-jeddah"],["Makkah","Ziyarat Tour","🕋","route-ziyarat"]];
var rc=document.getElementById("routeCards");
routes.forEach(function(r){var d=document.createElement("div");d.className="card";
d.innerHTML='<div class="img" data-img="images/'+r[3]+'.jpg">'+r[2]+'</div><div class="b"><b>'+r[0]+' &rarr; '+r[1]+'</b><p>Private ride, clear quote before travel.</p><a class="btn s" href="#book">Request a Quote</a></div>';
d.querySelector("a").onclick=function(){setSel("from",r[0]);setSel("to",r[1])};rc.appendChild(d)});
// photos: if the file exists in /images it replaces the emoji placeholder
document.querySelectorAll("[data-img]").forEach(function(el){var i=new Image();
i.onload=function(){el.style.backgroundImage=el.classList.contains("hero")?"linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),url("+i.src+")":"url("+i.src+")";var c=el.firstChild;if(c&&c.nodeType===3&&!el.classList.contains("hero"))c.textContent=""};
i.src=el.getAttribute("data-img")});
function setSel(id,v){var s=document.getElementById(id);for(var i=0;i<s.options.length;i++){if(s.options[i].text===v)s.selectedIndex=i}}
document.querySelectorAll("[data-v]").forEach(function(a){a.onclick=function(){setSel("veh",a.dataset.v)}});
document.getElementById("date").min=new Date().toISOString().split("T")[0];
function send(e){e.preventDefault();
var g=function(i){return document.getElementById(i).value.trim()},m=document.getElementById("msg"),btn=e.target.querySelector("button");
m.className="";
if(!g("from")||!g("to")||!g("date")){m.textContent="Please select pickup, drop-off and date.";return false}
var data={name:g("name"),phone:g("phone"),pickup:g("from"),dropoff:g("to"),date:g("date"),passengers:g("pax"),vehicle:g("veh"),notes:g("notes")};
btn.disabled=true;
fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
.then(function(r){return r.json().then(function(j){return{ok:r.ok,status:r.status,j:j}})})
.then(function(x){
 if(!x.ok){m.textContent=x.j.error||"Could not send. Please try again.";if(x.status>=500)openWA(data,"");return}
 openWA(data,x.j.ref);m.className="ok";m.textContent="Request received. Reference: "+x.j.ref+". We will contact you shortly.";e.target.reset()})
.catch(function(){openWA(data,"");m.textContent="Server unavailable. Opening WhatsApp instead."})
.then(function(){btn.disabled=false});
return false}
function openWA(d,ref){var t="Assalamu Alaikum, I would like a quote from ZHA Riders Makkah."+(ref?"\nRef: "+ref:"")+"\nName: "+(d.name||"-")+"\nPickup: "+d.pickup+"\nDrop-off: "+d.dropoff+"\nDate: "+d.date+"\nPassengers: "+d.passengers+"\nVehicle: "+d.vehicle;
window.open("https://wa.me/"+WA+"?text="+encodeURIComponent(t),"_blank")}
