"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[386],{34386:function(e,t,o){o.d(t,{Z:function(){return B}});var r=o(63366),n=o(87462),p=o(67294),i=o(90512),l=o(46271),a=o(94780),s=o(2101),u=o(82056),c=o(86542),m=o(57907),d=o(90948),h=o(2734),g=o(28628),f=o(98216),Z=o(50294),v=o(11535),b=o(2068),w=o(51705),y=o(27909),x=o(79674),T=o(49299),R=o(1588),M=o(34867);function P(e){return(0,M.ZP)("MuiTooltip",e)}let E=(0,R.Z)("MuiTooltip",["popper","popperInteractive","popperArrow","popperClose","tooltip","tooltipArrow","touch","tooltipPlacementLeft","tooltipPlacementRight","tooltipPlacementTop","tooltipPlacementBottom","arrow"]);var k=o(85893);let O=["arrow","children","classes","components","componentsProps","describeChild","disableFocusListener","disableHoverListener","disableInteractive","disableTouchListener","enterDelay","enterNextDelay","enterTouchDelay","followCursor","id","leaveDelay","leaveTouchDelay","onClose","onOpen","open","placement","PopperComponent","PopperProps","slotProps","slots","title","TransitionComponent","TransitionProps"],C=e=>{let{classes:t,disableInteractive:o,arrow:r,touch:n,placement:p}=e,i={popper:["popper",!o&&"popperInteractive",r&&"popperArrow"],tooltip:["tooltip",r&&"tooltipArrow",n&&"touch",`tooltipPlacement${(0,f.Z)(p.split("-")[0])}`],arrow:["arrow"]};return(0,a.Z)(i,P,t)},L=(0,d.ZP)(v.Z,{name:"MuiTooltip",slot:"Popper",overridesResolver:(e,t)=>{let{ownerState:o}=e;return[t.popper,!o.disableInteractive&&t.popperInteractive,o.arrow&&t.popperArrow,!o.open&&t.popperClose]}})(({theme:e,ownerState:t,open:o})=>(0,n.Z)({zIndex:(e.vars||e).zIndex.tooltip,pointerEvents:"none"},!t.disableInteractive&&{pointerEvents:"auto"},!o&&{pointerEvents:"none"},t.arrow&&{[`&[data-popper-placement*="bottom"] .${E.arrow}`]:{top:0,marginTop:"-0.71em","&::before":{transformOrigin:"0 100%"}},[`&[data-popper-placement*="top"] .${E.arrow}`]:{bottom:0,marginBottom:"-0.71em","&::before":{transformOrigin:"100% 0"}},[`&[data-popper-placement*="right"] .${E.arrow}`]:(0,n.Z)({},t.isRtl?{right:0,marginRight:"-0.71em"}:{left:0,marginLeft:"-0.71em"},{height:"1em",width:"0.71em","&::before":{transformOrigin:"100% 100%"}}),[`&[data-popper-placement*="left"] .${E.arrow}`]:(0,n.Z)({},t.isRtl?{left:0,marginLeft:"-0.71em"}:{right:0,marginRight:"-0.71em"},{height:"1em",width:"0.71em","&::before":{transformOrigin:"0 0"}})})),S=(0,d.ZP)("div",{name:"MuiTooltip",slot:"Tooltip",overridesResolver:(e,t)=>{let{ownerState:o}=e;return[t.tooltip,o.touch&&t.touch,o.arrow&&t.tooltipArrow,t[`tooltipPlacement${(0,f.Z)(o.placement.split("-")[0])}`]]}})(({theme:e,ownerState:t})=>(0,n.Z)({backgroundColor:e.vars?e.vars.palette.Tooltip.bg:(0,s.Fq)(e.palette.grey[700],.92),borderRadius:(e.vars||e).shape.borderRadius,color:(e.vars||e).palette.common.white,fontFamily:e.typography.fontFamily,padding:"4px 8px",fontSize:e.typography.pxToRem(11),maxWidth:300,margin:2,wordWrap:"break-word",fontWeight:e.typography.fontWeightMedium},t.arrow&&{position:"relative",margin:0},t.touch&&{padding:"8px 16px",fontSize:e.typography.pxToRem(14),lineHeight:`${Math.round(16/14*1e5)/1e5}em`,fontWeight:e.typography.fontWeightRegular},{[`.${E.popper}[data-popper-placement*="left"] &`]:(0,n.Z)({transformOrigin:"right center"},t.isRtl?(0,n.Z)({marginLeft:"14px"},t.touch&&{marginLeft:"24px"}):(0,n.Z)({marginRight:"14px"},t.touch&&{marginRight:"24px"})),[`.${E.popper}[data-popper-placement*="right"] &`]:(0,n.Z)({transformOrigin:"left center"},t.isRtl?(0,n.Z)({marginRight:"14px"},t.touch&&{marginRight:"24px"}):(0,n.Z)({marginLeft:"14px"},t.touch&&{marginLeft:"24px"})),[`.${E.popper}[data-popper-placement*="top"] &`]:(0,n.Z)({transformOrigin:"center bottom",marginBottom:"14px"},t.touch&&{marginBottom:"24px"}),[`.${E.popper}[data-popper-placement*="bottom"] &`]:(0,n.Z)({transformOrigin:"center top",marginTop:"14px"},t.touch&&{marginTop:"24px"})})),N=(0,d.ZP)("span",{name:"MuiTooltip",slot:"Arrow",overridesResolver:(e,t)=>t.arrow})(({theme:e})=>({overflow:"hidden",position:"absolute",width:"1em",height:"0.71em",boxSizing:"border-box",color:e.vars?e.vars.palette.Tooltip.bg:(0,s.Fq)(e.palette.grey[700],.9),"&::before":{content:'""',margin:"auto",display:"block",width:"100%",height:"100%",backgroundColor:"currentColor",transform:"rotate(45deg)"}})),$=!1,F=new l.V,W={x:0,y:0};function A(e,t){return(o,...r)=>{t&&t(o,...r),e(o,...r)}}var B=p.forwardRef(function(e,t){var o,a,s,d,f,R,M,P,E,B,I,j,z,D,U,_,V,q,H;let X=(0,g.i)({props:e,name:"MuiTooltip"}),{arrow:Y=!1,children:G,components:J={},componentsProps:K={},describeChild:Q=!1,disableFocusListener:ee=!1,disableHoverListener:et=!1,disableInteractive:eo=!1,disableTouchListener:er=!1,enterDelay:en=100,enterNextDelay:ep=0,enterTouchDelay:ei=700,followCursor:el=!1,id:ea,leaveDelay:es=0,leaveTouchDelay:eu=1500,onClose:ec,onOpen:em,open:ed,placement:eh="bottom",PopperComponent:eg,PopperProps:ef={},slotProps:eZ={},slots:ev={},title:eb,TransitionComponent:ew=Z.Z,TransitionProps:ey}=X,ex=(0,r.Z)(X,O),eT=p.isValidElement(G)?G:(0,k.jsx)("span",{children:G}),eR=(0,h.Z)(),eM=(0,u.V)(),[eP,eE]=p.useState(),[ek,eO]=p.useState(null),eC=p.useRef(!1),eL=eo||el,eS=(0,l.Z)(),eN=(0,l.Z)(),e$=(0,l.Z)(),eF=(0,l.Z)(),[eW,eA]=(0,T.Z)({controlled:ed,default:!1,name:"Tooltip",state:"open"}),eB=eW,eI=(0,y.Z)(ea),ej=p.useRef(),ez=(0,b.Z)(()=>{void 0!==ej.current&&(document.body.style.WebkitUserSelect=ej.current,ej.current=void 0),eF.clear()});p.useEffect(()=>ez,[ez]);let eD=e=>{F.clear(),$=!0,eA(!0),em&&!eB&&em(e)},eU=(0,b.Z)(e=>{F.start(800+es,()=>{$=!1}),eA(!1),ec&&eB&&ec(e),eS.start(eR.transitions.duration.shortest,()=>{eC.current=!1})}),e_=e=>{eC.current&&"touchstart"!==e.type||(eP&&eP.removeAttribute("title"),eN.clear(),e$.clear(),en||$&&ep?eN.start($?ep:en,()=>{eD(e)}):eD(e))},eV=e=>{eN.clear(),e$.start(es,()=>{eU(e)})},{isFocusVisibleRef:eq,onBlur:eH,onFocus:eX,ref:eY}=(0,x.Z)(),[,eG]=p.useState(!1),eJ=e=>{eH(e),!1===eq.current&&(eG(!1),eV(e))},eK=e=>{eP||eE(e.currentTarget),eX(e),!0===eq.current&&(eG(!0),e_(e))},eQ=e=>{eC.current=!0;let t=eT.props;t.onTouchStart&&t.onTouchStart(e)};p.useEffect(()=>{if(eB)return document.addEventListener("keydown",e),()=>{document.removeEventListener("keydown",e)};function e(e){("Escape"===e.key||"Esc"===e.key)&&eU(e)}},[eU,eB]);let e0=(0,w.Z)((0,m.Z)(eT),eY,eE,t);eb||0===eb||(eB=!1);let e1=p.useRef(),e4={},e7="string"==typeof eb;Q?(e4.title=eB||!e7||et?null:eb,e4["aria-describedby"]=eB?eI:null):(e4["aria-label"]=e7?eb:null,e4["aria-labelledby"]=eB&&!e7?eI:null);let e2=(0,n.Z)({},e4,ex,eT.props,{className:(0,i.Z)(ex.className,eT.props.className),onTouchStart:eQ,ref:e0},el?{onMouseMove:e=>{let t=eT.props;t.onMouseMove&&t.onMouseMove(e),W={x:e.clientX,y:e.clientY},e1.current&&e1.current.update()}}:{}),e8={};er||(e2.onTouchStart=e=>{eQ(e),e$.clear(),eS.clear(),ez(),ej.current=document.body.style.WebkitUserSelect,document.body.style.WebkitUserSelect="none",eF.start(ei,()=>{document.body.style.WebkitUserSelect=ej.current,e_(e)})},e2.onTouchEnd=e=>{eT.props.onTouchEnd&&eT.props.onTouchEnd(e),ez(),e$.start(eu,()=>{eU(e)})}),et||(e2.onMouseOver=A(e_,e2.onMouseOver),e2.onMouseLeave=A(eV,e2.onMouseLeave),eL||(e8.onMouseOver=e_,e8.onMouseLeave=eV)),ee||(e2.onFocus=A(eK,e2.onFocus),e2.onBlur=A(eJ,e2.onBlur),eL||(e8.onFocus=eK,e8.onBlur=eJ));let e6=p.useMemo(()=>{var e;let t=[{name:"arrow",enabled:!!ek,options:{element:ek,padding:4}}];return null!=(e=ef.popperOptions)&&e.modifiers&&(t=t.concat(ef.popperOptions.modifiers)),(0,n.Z)({},ef.popperOptions,{modifiers:t})},[ek,ef]),e9=(0,n.Z)({},X,{isRtl:eM,arrow:Y,disableInteractive:eL,placement:eh,PopperComponentProp:eg,touch:eC.current}),e5=C(e9),e3=null!=(o=null!=(a=ev.popper)?a:J.Popper)?o:L,te=null!=(s=null!=(d=null!=(f=ev.transition)?f:J.Transition)?d:ew)?s:Z.Z,tt=null!=(R=null!=(M=ev.tooltip)?M:J.Tooltip)?R:S,to=null!=(P=null!=(E=ev.arrow)?E:J.Arrow)?P:N,tr=(0,c.Z)(e3,(0,n.Z)({},ef,null!=(B=eZ.popper)?B:K.popper,{className:(0,i.Z)(e5.popper,null==ef?void 0:ef.className,null==(I=null!=(j=eZ.popper)?j:K.popper)?void 0:I.className)}),e9),tn=(0,c.Z)(te,(0,n.Z)({},ey,null!=(z=eZ.transition)?z:K.transition),e9),tp=(0,c.Z)(tt,(0,n.Z)({},null!=(D=eZ.tooltip)?D:K.tooltip,{className:(0,i.Z)(e5.tooltip,null==(U=null!=(_=eZ.tooltip)?_:K.tooltip)?void 0:U.className)}),e9),ti=(0,c.Z)(to,(0,n.Z)({},null!=(V=eZ.arrow)?V:K.arrow,{className:(0,i.Z)(e5.arrow,null==(q=null!=(H=eZ.arrow)?H:K.arrow)?void 0:q.className)}),e9);return(0,k.jsxs)(p.Fragment,{children:[p.cloneElement(eT,e2),(0,k.jsx)(e3,(0,n.Z)({as:null!=eg?eg:v.Z,placement:eh,anchorEl:el?{getBoundingClientRect:()=>({top:W.y,left:W.x,right:W.x,bottom:W.y,width:0,height:0})}:eP,popperRef:e1,open:!!eP&&eB,id:eI,transition:!0},e8,tr,{popperOptions:e6,children:({TransitionProps:e})=>(0,k.jsx)(te,(0,n.Z)({timeout:eR.transitions.duration.shorter},e,tn,{children:(0,k.jsxs)(tt,(0,n.Z)({},tp,{children:[eb,Y?(0,k.jsx)(to,(0,n.Z)({},ti,{ref:eO})):null]}))}))}))]})})}}]);