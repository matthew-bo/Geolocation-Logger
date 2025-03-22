(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[186],{54367:function(e,t,a){(window.__NEXT_P=window.__NEXT_P||[]).push(["/share/stats",function(){return a(98547)}])},98547:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return z}});var l={};a.r(l);var n=a(85893),i=a(67294),s=a(11163),r=a(65582),c=a(15861),d=a(5616),o=a(29009),u=a(28935),h=a(14195),x=a(3023),j=a(75358),Z=a(26050),y=a(33558),v=a(18242),p=a(66242),m=a(44267),f=a(51233),b=a(34386),g=a(93946),w=a(591),S=a(47120),C=a(61903),M=a(18972),k=a(69417),D=a(46901),E=a(98456),_=a(64666),R=a(37645),L=a(6514),N=a(31425),P=a(52649),U=a(49718),O=a(75108),T=a(22400),B=a(17389),F=a(7069),K=a(54559),W=a(23855),q=a(32912),I=a(92098);let J=[{value:"day",label:"Daily"},{value:"week",label:"Weekly"},{value:"month",label:"Monthly"}],A=[{value:"7d",label:"Past Week",fn:e=>(0,F.Z)(e,7)},{value:"1m",label:"Past Month",fn:e=>(0,K.Z)(e,1)},{value:"3m",label:"Past 3 Months",fn:e=>(0,K.Z)(e,3)},{value:"1y",label:"Past Year",fn:e=>(0,K.Z)(e,12)}],V=[{value:"total",label:"Total Beers",color:"#8884d8"},{value:"unique",label:"Unique Beers",color:"#82ca9d"},{value:"rating",label:"Average Rating",color:"#ffc658"}];function X(e){let{initialView:t,initialTimeUnit:a,initialStartDate:s,initialEndDate:r,initialMetrics:K,initialLocation:X,isShared:z=!1}=e,{user:G}=(0,I.a)(),[H,Y]=(0,i.useState)(t||"bar"),[$,Q]=(0,i.useState)(a||"day"),[ee,et]=(0,i.useState)(()=>s?(0,W.Z)(s):(0,F.Z)(new Date,7)),[ea,el]=(0,i.useState)(()=>r?(0,W.Z)(r):new Date),[en,ei]=(0,i.useState)(K||["total"]),[es,er]=(0,i.useState)(X||null),[ec,ed]=(0,i.useState)(!1),[eo,eu]=(0,i.useState)(""),[eh,ex]=(0,i.useState)(!0),[ej,eZ]=(0,i.useState)(null),[ey,ev]=(0,i.useState)([]),ep=(0,i.useCallback)(async()=>{try{ex(!0),eZ(null);let e=new URLSearchParams({startDate:(0,q.Z)(ee,"yyyy-MM-dd"),endDate:(0,q.Z)(ea,"yyyy-MM-dd"),timeUnit:$});es&&e.append("location",JSON.stringify(es));let t=await fetch("/api/stats?".concat(e.toString()));if(!t.ok)throw Error("Failed to fetch statistics");let a=await t.json();ev(a)}catch(e){eZ(e.message),console.error("Error fetching stats:",e)}finally{ex(!1)}},[ee,ea,$,es]);(0,i.useEffect)(()=>{ep()},[ep]);let em=e=>{let t=new Date;et(e.fn(t)),el(t)},ef=(0,i.useCallback)(()=>{let e=new URLSearchParams({view:H,timeUnit:$,start:(0,q.Z)(ee,"yyyy-MM-dd"),end:(0,q.Z)(ea,"yyyy-MM-dd"),metrics:en.join(",")});es&&e.append("location",JSON.stringify(es)),eu("".concat(window.location.origin,"/share/stats?").concat(e.toString())),ed(!0)},[H,$,ee,ea,en,es]),eb=(0,i.useCallback)(()=>{let e=ey.map(e=>{let t=[e.date];return en.forEach(a=>t.push(e[a])),t.join(",")}).join("\n"),t=["date",...en].join(","),a=new Blob([t+"\n"+e],{type:"text/csv"}),l=window.URL.createObjectURL(a),n=document.createElement("a");n.href=l,n.download="drink-stats-".concat((0,q.Z)(new Date,"yyyy-MM-dd"),".csv"),document.body.appendChild(n),n.click(),document.body.removeChild(n),window.URL.revokeObjectURL(l)},[ey,en]);return(0,n.jsxs)(p.Z,{children:[(0,n.jsx)(m.Z,{children:(0,n.jsxs)(f.Z,{spacing:3,children:[(0,n.jsxs)(d.Z,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,n.jsx)(c.Z,{variant:"h5",children:"Drink Statistics"}),!z&&(0,n.jsxs)(f.Z,{direction:"row",spacing:1,children:[(0,n.jsx)(b.Z,{title:"Share",children:(0,n.jsx)(g.Z,{onClick:ef,children:(0,n.jsx)(P.Z,{})})}),(0,n.jsx)(b.Z,{title:"Export CSV",children:(0,n.jsx)(g.Z,{onClick:eb,children:(0,n.jsx)(U.Z,{})})})]})]}),(0,n.jsxs)(f.Z,{direction:{xs:"column",sm:"row"},spacing:2,children:[(0,n.jsxs)(w.Z,{value:H,exclusive:!0,onChange:(e,t)=>t&&Y(t),children:[(0,n.jsx)(S.Z,{value:"bar",children:(0,n.jsx)(O.Z,{})}),(0,n.jsx)(S.Z,{value:"heatmap",children:(0,n.jsx)(T.Z,{})})]}),(0,n.jsx)(w.Z,{value:en,onChange:(e,t)=>{t.length&&ei(t)},"aria-label":"metrics",multiple:!0,children:V.map(e=>(0,n.jsx)(S.Z,{value:e.value,children:e.label},e.value))}),(0,n.jsx)(C.Z,{select:!0,label:"Time Unit",value:$,onChange:e=>Q(e.target.value),sx:{minWidth:120},children:J.map(e=>(0,n.jsx)(M.Z,{value:e.value,children:e.label},e.value))})]}),(0,n.jsxs)(f.Z,{direction:{xs:"column",sm:"row"},spacing:2,children:[(0,n.jsx)(B.M,{label:"Start Date",value:ee,onChange:et,renderInput:e=>(0,n.jsx)(C.Z,{...e})}),(0,n.jsx)(B.M,{label:"End Date",value:ea,onChange:el,renderInput:e=>(0,n.jsx)(C.Z,{...e})}),(0,n.jsx)(f.Z,{direction:"row",spacing:1,children:A.map(e=>(0,n.jsx)(k.Z,{variant:"outlined",size:"small",onClick:()=>em(e),children:e.label},e.value))})]}),(0,n.jsxs)(C.Z,{label:"Location Filter",select:!0,value:(null==es?void 0:es.type)||"",onChange:e=>{e.target.value?er({type:e.target.value,value:""}):er(null)},children:[(0,n.jsx)(M.Z,{value:"",children:"None"}),(0,n.jsx)(M.Z,{value:"city",children:"City"}),(0,n.jsx)(M.Z,{value:"state",children:"State"}),(0,n.jsx)(M.Z,{value:"country",children:"Country"})]}),es&&(0,n.jsx)(C.Z,{label:"Select ".concat(es.type),value:es.value,onChange:e=>er({...es,value:e.target.value})}),ej&&(0,n.jsx)(D.Z,{severity:"error",onClose:()=>eZ(null),children:ej}),eh?(0,n.jsx)(d.Z,{sx:{display:"flex",justifyContent:"center",p:3},children:(0,n.jsx)(E.Z,{})}):(0,n.jsx)(n.Fragment,{children:"bar"===H?(0,n.jsx)(o.h,{width:"100%",height:400,children:(0,n.jsxs)(u.v,{data:ey,children:[(0,n.jsx)(h.q,{strokeDasharray:"3 3"}),(0,n.jsx)(x.K,{dataKey:"date",tickFormatter:e=>(0,q.Z)((0,W.Z)(e),"MMM d")}),(0,n.jsx)(j.B,{}),(0,n.jsx)(Z.u,{content:e=>{let{active:t,payload:a,label:l}=e;return t&&a&&a.length?(0,n.jsx)(p.Z,{children:(0,n.jsxs)(m.Z,{children:[(0,n.jsx)(c.Z,{variant:"subtitle2",children:(0,q.Z)((0,W.Z)(l),"MMM d, yyyy")}),a.map(e=>(0,n.jsxs)(c.Z,{variant:"body2",children:[e.name,": ",e.value]},e.name))]})}):null}}),(0,n.jsx)(y.D,{}),en.map(e=>{let t=V.find(t=>t.value===e);return(0,n.jsx)(v.$,{dataKey:e,name:t.label,fill:t.color},e)})]})}):(0,n.jsx)(o.h,{width:"100%",height:400,children:(0,n.jsx)(l.HeatMapGrid,{data:ey,dataKey:"total",xAxis:{dataKey:"date",tickFormatter:e=>(0,q.Z)((0,W.Z)(e),"MMM d")}})})})]})}),!z&&(0,n.jsxs)(_.Z,{open:ec,onClose:()=>ed(!1),children:[(0,n.jsx)(R.Z,{children:"Share Statistics"}),(0,n.jsx)(L.Z,{children:(0,n.jsx)(C.Z,{fullWidth:!0,value:eo,InputProps:{readOnly:!0},margin:"normal"})}),(0,n.jsxs)(N.Z,{children:[(0,n.jsx)(k.Z,{onClick:()=>ed(!1),children:"Close"}),(0,n.jsx)(k.Z,{variant:"contained",onClick:()=>{navigator.clipboard.writeText(eo),ed(!1)},children:"Copy Link"})]})]})]})}function z(){let e=(0,s.useRouter)(),{view:t,timeUnit:a,start:l,end:o,metrics:u,location:h}=e.query;return((0,i.useEffect)(()=>{if(e.isReady){if(!l||!o||!u){e.push("/404");return}try{(0,W.Z)(l),(0,W.Z)(o)}catch(t){e.push("/404")}}},[e,l,o,u]),e.isReady)?(0,n.jsxs)(r.Z,{maxWidth:"lg",sx:{py:4},children:[(0,n.jsx)(c.Z,{variant:"h4",gutterBottom:!0,children:"Shared Drink Statistics"}),(0,n.jsx)(d.Z,{sx:{mt:3},children:(0,n.jsx)(X,{initialView:t||"bar",initialTimeUnit:a||"day",initialStartDate:l,initialEndDate:o,initialMetrics:u.split(","),initialLocation:h?JSON.parse(h):null,isShared:!0})})]}):null}}},function(e){e.O(0,[903,738,294,699,739,869,801,842,96,8,774,888,179],function(){return e(e.s=54367)}),_N_E=e.O()}]);