exports.id=392,exports.ids=[392],exports.modules={51797:(o,e,t)=>{"use strict";t.d(e,{Z:()=>r});var n=t(57077),a=t(20997);let r=(0,n.createSvgIcon)((0,a.jsx)("path",{d:"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"}),"Edit")},53630:(o,e,t)=>{"use strict";t.d(e,{Z:()=>r});var n=t(57077),a=t(20997);let r=(0,n.createSvgIcon)((0,a.jsx)("path",{d:"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5"}),"LocationOn")},29392:(o,e,t)=>{"use strict";t.r(e),t.d(e,{default:()=>y});var n=t(20997),a=t(16689),r=t(25372),i=t.n(r);t(45991);var l=t(9285),s=t.n(l),c=t(34904),d=t.n(c),p=t(86024),x=t.n(p),g=t(75244),u=t(19933),m=t(53630),h=t(51797),b=t(56933),f=t.n(b),j=t(11163);let v="pk.eyJ1IjoibWJvMTE1NzAiLCJhIjoiY204MmgxZjBuMHh2cjJrb3F3NmlyOXJjNSJ9.9XPT8wv6gvv6axeoIl7wPQ";function y({drinks:o=[],friendDrinks:e=[],selectedDrink:t,setSelectedDrink:l,handleMouseMove:c,getMarkerSize:p,getMarkerColor:b,onEditLocation:y}){let k=(0,a.useRef)(null),[N,C]=(0,a.useState)(null),[w,S]=(0,a.useState)({latitude:40,longitude:-74.5,zoom:9,bearing:0,pitch:0});(0,j.useRouter)(),(0,a.useEffect)(()=>{console.log("MapComponent mounted"),console.log("Drinks data:",o),console.log("Map reference:",k.current),console.log("Mapbox token available:",!!v),v||C("Mapbox token not found. Please check your environment variables.")},[]),(0,a.useEffect)(()=>{if(o.length>0&&k.current)try{let e=new(f()).LngLatBounds,t=!1;o.forEach(o=>{o.location&&o.location.lat&&!isNaN(o.location.lat)&&o.location.lng&&!isNaN(o.location.lng)&&(e.extend([o.location.lng,o.location.lat]),t=!0)}),t&&k.current.fitBounds(e,{padding:50,duration:1e3})}catch(o){console.error("Error setting map bounds:",o),C("Error loading map. Please try refreshing the page.")}},[o]);let z=(o,e)=>{e.stopPropagation(),y&&y(o)};return N?(0,n.jsxs)(s(),{sx:{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",bgcolor:"#1A1A1A",color:"var(--text-primary)",flexDirection:"column",gap:2,p:3},children:[n.jsx(d(),{variant:"h6",align:"center",children:N}),n.jsx(d(),{variant:"body2",align:"center",color:"var(--text-secondary)",children:"If the problem persists, please check your configuration or contact support."})]}):n.jsx("div",{style:{position:"relative",width:"100%",height:"100%",backgroundColor:"#1A1A1A"},children:(0,n.jsxs)(i(),{ref:k,initialViewState:w,onMove:o=>S(o.viewState),onMouseMove:c,mapStyle:"mapbox://styles/mapbox/dark-v11",mapboxAccessToken:v,style:{width:"100%",height:"100%"},minZoom:1,maxZoom:20,attributionControl:!0,antialias:!0,onError:o=>{console.error("Map error:",o),C("Error loading map. Please try refreshing the page.")},children:[n.jsx(r.GeolocateControl,{position:"top-right"}),n.jsx(r.FullscreenControl,{position:"top-right"}),n.jsx(r.NavigationControl,{position:"top-right"}),n.jsx(r.ScaleControl,{position:"bottom-right"}),o.map(o=>o.location&&o.location.lat&&!isNaN(o.location.lat)&&o.location.lng&&!isNaN(o.location.lng)?n.jsx(r.Marker,{latitude:Number(o.location.lat),longitude:Number(o.location.lng),onClick:e=>{e.originalEvent.stopPropagation(),l(o)},children:n.jsx(s(),{sx:{width:p(w.zoom),height:p(w.zoom),backgroundColor:`${b(o)}80`,border:`2px solid ${b(o)}`,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s ease","&:hover":{backgroundColor:b(o),transform:"scale(1.1)",boxShadow:`0 0 10px ${b(o)}80`}},children:n.jsx(g.Z,{sx:{color:"white",fontSize:.6*p(w.zoom)}})})},o.id):null),e.map(o=>o.location&&o.location.lat&&!isNaN(o.location.lat)&&o.location.lng&&!isNaN(o.location.lng)?n.jsx(r.Marker,{latitude:Number(o.location.lat),longitude:Number(o.location.lng),onClick:e=>{e.originalEvent.stopPropagation(),l(o)},children:n.jsx(s(),{sx:{width:p(w.zoom),height:p(w.zoom),backgroundColor:`${b(o)}80`,border:`2px solid ${b(o)}`,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s ease","&:hover":{backgroundColor:b(o),transform:"scale(1.1)",boxShadow:`0 0 10px ${b(o)}80`}},children:n.jsx(u.Z,{sx:{color:"white",fontSize:.6*p(w.zoom)}})})},o.id):null),t&&t.location&&n.jsx(r.Popup,{latitude:Number(t.location.lat),longitude:Number(t.location.lng),onClose:()=>l(null),closeButton:!0,closeOnClick:!1,className:"beer-popup",children:(0,n.jsxs)(s(),{sx:{p:1},children:[n.jsx(d(),{variant:"h6",sx:{fontWeight:"bold",fontSize:"1rem"},children:t.brand||"Unknown Beer"}),(0,n.jsxs)(s(),{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mt:.5},children:[(0,n.jsxs)(d(),{variant:"body2",color:"text.secondary",children:[t.drinkType||"Unknown Type"," • ",t.containerType||"Unknown Container"]}),(0,n.jsxs)(d(),{variant:"body2",color:"text.secondary",children:["Rating: ",t.rating||0,"/5"]})]}),(0,n.jsxs)(s(),{sx:{display:"flex",alignItems:"center",mt:1,p:.5,bgcolor:"rgba(255,255,255,0.05)",borderRadius:1},children:[n.jsx(m.Z,{sx:{fontSize:"1rem",color:"var(--beer-amber)",mr:.5}}),n.jsx(d(),{variant:"body2",sx:{fontSize:"0.8rem",flex:1},children:t.placeInfo&&(t.placeInfo.customName||t.placeInfo.placeName)||"Unknown Location"}),y&&n.jsx(x(),{size:"small",onClick:o=>z(t,o),sx:{p:.3,ml:.5,"&:hover":{bgcolor:"rgba(255,255,255,0.1)"}},children:n.jsx(h.Z,{sx:{fontSize:"0.8rem"}})})]}),n.jsx(d(),{variant:"caption",display:"block",sx:{mt:1,color:"text.secondary"},children:t.timestamp instanceof Date?t.timestamp.toLocaleString():t.timestamp?.seconds?new Date(1e3*t.timestamp.seconds).toLocaleString():"Unknown date"})]})})]})})}},45991:()=>{}};