(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{75557:function(e,r,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return t(96883)}])},96883:function(e,r,t){"use strict";t.r(r),t.d(r,{default:function(){return N}});var a=t(85893),n=t(67294),o=t(11163),i=t(65582),s=t(5616),c=t(15861),d=t(69417),l=t(75244),u=t(92098),m=t(9008),p=t.n(m),g=t(41664),h=t.n(g),x=t(98456),k=t(90948),b=t(90109),f=t(42498);let v={async logDrink(e,r){try{let t=await (0,b.ET)((0,b.hJ)(f.db,"drinks"),{userId:e,...r,timestamp:new Date().toISOString()}),a=(0,b.JU)(f.db,"users",e);return(await (0,b.QT)(a)).exists()?await (0,b.r7)(a,{previousDrinks:(0,b.vr)(r.drinkName)}):await (0,b.pl)(a,{previousDrinks:[r.drinkName],createdAt:new Date().toISOString()}),{success:!0,drinkId:t.id}}catch(e){return console.error("Error logging drink:",e),{success:!1,error:e.message}}},async getUserDrinks(e){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};try{let t=(0,b.IO)((0,b.hJ)(f.db,"drinks"),(0,b.ar)("userId","==",e),(0,b.Xo)("timestamp","desc")),a=await (0,b.PL)(t),n=[];return a.forEach(e=>{n.push({id:e.id,...e.data()})}),n.filter(e=>{let t=!0;return r.drinkName&&(t=t&&e.drinkName.toLowerCase().includes(r.drinkName.toLowerCase())),r.container&&(t=t&&e.container===r.container),r.rating&&(t=t&&e.rating===r.rating),r.startDate&&(t=t&&new Date(e.timestamp)>=new Date(r.startDate)),r.endDate&&(t=t&&new Date(e.timestamp)<=new Date(r.endDate)),t})}catch(e){return console.error("Error getting drinks:",e),[]}},async getPreviousDrinks(e){try{let r=(0,b.JU)(f.db,"users",e),t=await (0,b.QT)(r);return t.exists()&&t.data().previousDrinks||[]}catch(e){return console.error("Error getting previous drinks:",e),[]}},async exportDrinks(e){try{let r=(await this.getUserDrinks(e)).map(e=>['"'.concat(e.drinkName,'"'),e.container,e.rating,e.location.coordinates[1],e.location.coordinates[0],e.timestamp].join(","));return"Drink Name,Container,Rating,Latitude,Longitude,Timestamp\n"+r.join("\n")}catch(e){throw console.error("Error exporting drinks:",e),e}},async quickLogLastDrink(e){try{let r=(0,b.IO)((0,b.hJ)(f.db,"drinks"),(0,b.ar)("userId","==",e),(0,b.Xo)("timestamp","desc"),(0,b.b9)(1)),t=await (0,b.PL)(r);if(t.empty)return{success:!1,message:"No previous drinks found. Please log a drink first."};let a=t.docs[0].data(),n=a.location,o=a.placeInfo;try{let e=await new Promise((e,r)=>{navigator.geolocation.getCurrentPosition(e,r)});n={coordinates:[e.coords.longitude,e.coords.latitude]};let r=await fetch("https://nominatim.openstreetmap.org/reverse?format=json&lat=".concat(e.coords.latitude,"&lon=").concat(e.coords.longitude)),t=await r.json();o={address:t.display_name,city:t.address.city||t.address.town||t.address.village,state:t.address.state,country:t.address.country,neighborhood:t.address.suburb||t.address.neighbourhood||"Unknown",placeName:t.name||t.display_name.split(",")[0]}}catch(e){console.warn("Using last drink location due to geolocation error:",e)}let i={...a,timestamp:new Date,location:n,placeInfo:o},s=await (0,b.ET)((0,b.hJ)(f.db,"drinks"),i),c=(0,b.JU)(f.db,"users",e);return(await (0,b.QT)(c)).exists()?await (0,b.r7)(c,{previousDrinks:(0,b.vr)(i.drinkName)}):await (0,b.pl)(c,{previousDrinks:[i.drinkName],createdAt:new Date().toISOString()}),{success:!0,message:"\uD83C\uDF7A Drink logged successfully!",drinkId:s.id}}catch(e){return console.error("Error quick logging drink:",e),{success:!1,message:this.getErrorMessage(e)}}},getErrorMessage(e){switch(e.code){case"permission-denied":return"Location access denied. Please enable location services to log drinks.";case"position-unavailable":return"Unable to get current location. Using last known location.";case"timeout":return"Location request timed out. Please try again.";case"not-found":return"No previous drinks found. Please log a drink first.";default:return e.message||"An unexpected error occurred. Please try again."}}};var w=t(91444);let y=(0,k.ZP)(d.Z)(e=>{let{theme:r}=e;return{width:"100%",background:"var(--glass-background)",border:"1px solid var(--glass-border)",backdropFilter:"blur(10px)",color:"var(--beer-amber)",transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)","&:hover":{background:"linear-gradient(135deg, var(--beer-amber) 0%, var(--copper) 100%)",color:"var(--dark-wood)",transform:"scale(1.02)",boxShadow:"0 8px 32px rgba(251, 192, 45, 0.3)"},"&:disabled":{background:"var(--glass-background)",opacity:.5}}});function D(e){let{userId:r}=e,[t,o]=(0,n.useState)(!1),i=async()=>{if(!r){w.Am.error("Please log in to use this feature",{position:"top-center",autoClose:3e3,theme:"dark"});return}o(!0);try{let e=await v.quickLogLastDrink(r);e.success?w.Am.success(e.message,{position:"top-center",autoClose:3e3,theme:"dark"}):w.Am.error(e.message,{position:"top-center",autoClose:5e3,theme:"dark"})}catch(e){w.Am.error("An unexpected error occurred. Please try again.",{position:"top-center",autoClose:5e3,theme:"dark"})}finally{o(!1)}};return(0,a.jsx)(y,{onClick:i,disabled:t,startIcon:t?(0,a.jsx)(x.Z,{size:20,color:"inherit"}):(0,a.jsx)(l.Z,{}),children:t?"Logging...":"Repeat Last Beer"})}let j=e=>{let{delay:r,size:t,left:n}=e;return(0,a.jsx)("div",{className:"bubble",style:{width:t,height:t,left:"".concat(n,"%"),bottom:"-100px",animation:"float 3s infinite ease-in-out ".concat(r,"s"),opacity:.5*Math.random()+.1}})};function N(){let e=(0,o.useRouter)(),{handleProtectedAction:r,user:t}=(0,u.a)(),n=Array.from({length:15},(e,r)=>({id:r,size:30*Math.random()+10,left:100*Math.random(),delay:2*Math.random()}));return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)(p(),{children:[(0,a.jsx)("title",{children:"Beer Peer | Track Your Beers"}),(0,a.jsx)("meta",{name:"description",content:"Track and share your beer experiences with friends"}),(0,a.jsx)("link",{rel:"icon",href:"/favicon.ico"})]}),(0,a.jsxs)(i.Z,{maxWidth:!1,sx:{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",background:"linear-gradient(to bottom, var(--dark-wood), #121212)",position:"relative",overflow:"hidden",pt:8},children:[n.map(e=>(0,a.jsx)(j,{...e},e.id)),(0,a.jsxs)(s.Z,{sx:{position:"relative",zIndex:1,textAlign:"center",maxWidth:"600px",width:"100%",px:3,display:"flex",flexDirection:"column",alignItems:"center"},children:[(0,a.jsx)(c.Z,{variant:"h1",component:"h1",className:"logo-text",sx:{mb:2,fontSize:{xs:"3rem",sm:"4rem",md:"5rem"},fontWeight:700},children:"Beer Peer"}),(0,a.jsx)(c.Z,{variant:"h2",component:"h2",sx:{mb:6,fontSize:{xs:"1.5rem",sm:"2rem"},color:"var(--text-primary)",fontWeight:300},children:"Track your beer adventures"}),(0,a.jsxs)(s.Z,{sx:{position:"relative",display:"inline-block",width:{xs:"220px",sm:"300px"}},children:[(0,a.jsxs)(d.Z,{onClick:()=>{r("logDrink",()=>{e.push("/log-drink")})},sx:{width:"100%",height:{xs:"220px",sm:"300px"},borderRadius:"50%",fontSize:{xs:"1.5rem",sm:"2rem"},fontWeight:500,background:"linear-gradient(135deg, var(--beer-amber) 0%, var(--copper) 100%)",color:"var(--dark-wood)","&:hover":{background:"linear-gradient(135deg, var(--copper-light) 0%, var(--copper) 100%)",transform:"scale(1.05)",boxShadow:"0 12px 40px rgba(0,0,0,0.4)"},"&:active":{transform:"scale(0.95)",boxShadow:"0 6px 20px rgba(0,0,0,0.3)"},boxShadow:"0 8px 32px rgba(0,0,0,0.3)",transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,mb:2},children:[(0,a.jsx)(l.Z,{sx:{fontSize:{xs:"4rem",sm:"5rem"},filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.2))",transition:"all 0.3s ease"}}),"Log a Beer"]}),(0,a.jsx)(D,{userId:null==t?void 0:t.uid})]}),(0,a.jsxs)(s.Z,{sx:{display:"flex",justifyContent:"center",gap:2,position:"relative",zIndex:2},children:[(0,a.jsx)(d.Z,{component:h(),href:"/map",variant:"text",sx:{color:"var(--text-primary)","&:hover":{color:"var(--beer-amber)"}},children:"View Map"}),(0,a.jsx)(d.Z,{component:h(),href:"/friends",variant:"text",sx:{color:"var(--text-primary)","&:hover":{color:"var(--beer-amber)"}},children:"Friends"})]})]}),(0,a.jsx)(c.Z,{variant:"body2",sx:{position:"absolute",bottom:"20px",color:"var(--text-secondary)",textAlign:"center",width:"100%"},children:"Made with \uD83C\uDF7A for beer lovers"})]})]})}},9008:function(e,r,t){e.exports=t(14764)}},function(e){e.O(0,[738,774,888,179],function(){return e(e.s=75557)}),_N_E=e.O()}]);