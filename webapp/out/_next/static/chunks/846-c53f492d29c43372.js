"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[846],{87918:function(e,t,o){o.d(t,{Z:function(){return k}});var r=o(63366),n=o(87462),a=o(67294),i=o(90512),l=o(94780),s=o(2101),c=o(88169),p=o(85893),f=(0,c.Z)((0,p.jsx)("path",{d:"M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"}),"Cancel"),d=o(51705),u=o(98216),m=o(49990),v=o(28628),h=o(90948),g=o(1588),y=o(34867);function b(e){return(0,y.ZP)("MuiChip",e)}let x=(0,g.Z)("MuiChip",["root","sizeSmall","sizeMedium","colorError","colorInfo","colorPrimary","colorSecondary","colorSuccess","colorWarning","disabled","clickable","clickableColorPrimary","clickableColorSecondary","deletable","deletableColorPrimary","deletableColorSecondary","outlined","filled","outlinedPrimary","outlinedSecondary","filledPrimary","filledSecondary","avatar","avatarSmall","avatarMedium","avatarColorPrimary","avatarColorSecondary","icon","iconSmall","iconMedium","iconColorPrimary","iconColorSecondary","label","labelSmall","labelMedium","deleteIcon","deleteIconSmall","deleteIconMedium","deleteIconColorPrimary","deleteIconColorSecondary","deleteIconOutlinedColorPrimary","deleteIconOutlinedColorSecondary","deleteIconFilledColorPrimary","deleteIconFilledColorSecondary","focusVisible"]),w=["avatar","className","clickable","color","component","deleteIcon","disabled","icon","label","onClick","onDelete","onKeyDown","onKeyUp","size","variant","tabIndex","skipFocusWhenDisabled"],O=e=>{let{classes:t,disabled:o,size:r,color:n,iconColor:a,onDelete:i,clickable:s,variant:c}=e,p={root:["root",c,o&&"disabled",`size${(0,u.Z)(r)}`,`color${(0,u.Z)(n)}`,s&&"clickable",s&&`clickableColor${(0,u.Z)(n)}`,i&&"deletable",i&&`deletableColor${(0,u.Z)(n)}`,`${c}${(0,u.Z)(n)}`],label:["label",`label${(0,u.Z)(r)}`],avatar:["avatar",`avatar${(0,u.Z)(r)}`,`avatarColor${(0,u.Z)(n)}`],icon:["icon",`icon${(0,u.Z)(r)}`,`iconColor${(0,u.Z)(a)}`],deleteIcon:["deleteIcon",`deleteIcon${(0,u.Z)(r)}`,`deleteIconColor${(0,u.Z)(n)}`,`deleteIcon${(0,u.Z)(c)}Color${(0,u.Z)(n)}`]};return(0,l.Z)(p,b,t)},C=(0,h.ZP)("div",{name:"MuiChip",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:o}=e,{color:r,iconColor:n,clickable:a,onDelete:i,size:l,variant:s}=o;return[{[`& .${x.avatar}`]:t.avatar},{[`& .${x.avatar}`]:t[`avatar${(0,u.Z)(l)}`]},{[`& .${x.avatar}`]:t[`avatarColor${(0,u.Z)(r)}`]},{[`& .${x.icon}`]:t.icon},{[`& .${x.icon}`]:t[`icon${(0,u.Z)(l)}`]},{[`& .${x.icon}`]:t[`iconColor${(0,u.Z)(n)}`]},{[`& .${x.deleteIcon}`]:t.deleteIcon},{[`& .${x.deleteIcon}`]:t[`deleteIcon${(0,u.Z)(l)}`]},{[`& .${x.deleteIcon}`]:t[`deleteIconColor${(0,u.Z)(r)}`]},{[`& .${x.deleteIcon}`]:t[`deleteIcon${(0,u.Z)(s)}Color${(0,u.Z)(r)}`]},t.root,t[`size${(0,u.Z)(l)}`],t[`color${(0,u.Z)(r)}`],a&&t.clickable,a&&"default"!==r&&t[`clickableColor${(0,u.Z)(r)})`],i&&t.deletable,i&&"default"!==r&&t[`deletableColor${(0,u.Z)(r)}`],t[s],t[`${s}${(0,u.Z)(r)}`]]}})(({theme:e,ownerState:t})=>{let o="light"===e.palette.mode?e.palette.grey[700]:e.palette.grey[300];return(0,n.Z)({maxWidth:"100%",fontFamily:e.typography.fontFamily,fontSize:e.typography.pxToRem(13),display:"inline-flex",alignItems:"center",justifyContent:"center",height:32,color:(e.vars||e).palette.text.primary,backgroundColor:(e.vars||e).palette.action.selected,borderRadius:16,whiteSpace:"nowrap",transition:e.transitions.create(["background-color","box-shadow"]),cursor:"unset",outline:0,textDecoration:"none",border:0,padding:0,verticalAlign:"middle",boxSizing:"border-box",[`&.${x.disabled}`]:{opacity:(e.vars||e).palette.action.disabledOpacity,pointerEvents:"none"},[`& .${x.avatar}`]:{marginLeft:5,marginRight:-6,width:24,height:24,color:e.vars?e.vars.palette.Chip.defaultAvatarColor:o,fontSize:e.typography.pxToRem(12)},[`& .${x.avatarColorPrimary}`]:{color:(e.vars||e).palette.primary.contrastText,backgroundColor:(e.vars||e).palette.primary.dark},[`& .${x.avatarColorSecondary}`]:{color:(e.vars||e).palette.secondary.contrastText,backgroundColor:(e.vars||e).palette.secondary.dark},[`& .${x.avatarSmall}`]:{marginLeft:4,marginRight:-4,width:18,height:18,fontSize:e.typography.pxToRem(10)},[`& .${x.icon}`]:(0,n.Z)({marginLeft:5,marginRight:-6},"small"===t.size&&{fontSize:18,marginLeft:4,marginRight:-4},t.iconColor===t.color&&(0,n.Z)({color:e.vars?e.vars.palette.Chip.defaultIconColor:o},"default"!==t.color&&{color:"inherit"})),[`& .${x.deleteIcon}`]:(0,n.Z)({WebkitTapHighlightColor:"transparent",color:e.vars?`rgba(${e.vars.palette.text.primaryChannel} / 0.26)`:(0,s.Fq)(e.palette.text.primary,.26),fontSize:22,cursor:"pointer",margin:"0 5px 0 -6px","&:hover":{color:e.vars?`rgba(${e.vars.palette.text.primaryChannel} / 0.4)`:(0,s.Fq)(e.palette.text.primary,.4)}},"small"===t.size&&{fontSize:16,marginRight:4,marginLeft:-4},"default"!==t.color&&{color:e.vars?`rgba(${e.vars.palette[t.color].contrastTextChannel} / 0.7)`:(0,s.Fq)(e.palette[t.color].contrastText,.7),"&:hover, &:active":{color:(e.vars||e).palette[t.color].contrastText}})},"small"===t.size&&{height:24},"default"!==t.color&&{backgroundColor:(e.vars||e).palette[t.color].main,color:(e.vars||e).palette[t.color].contrastText},t.onDelete&&{[`&.${x.focusVisible}`]:{backgroundColor:e.vars?`rgba(${e.vars.palette.action.selectedChannel} / calc(${e.vars.palette.action.selectedOpacity} + ${e.vars.palette.action.focusOpacity}))`:(0,s.Fq)(e.palette.action.selected,e.palette.action.selectedOpacity+e.palette.action.focusOpacity)}},t.onDelete&&"default"!==t.color&&{[`&.${x.focusVisible}`]:{backgroundColor:(e.vars||e).palette[t.color].dark}})},({theme:e,ownerState:t})=>(0,n.Z)({},t.clickable&&{userSelect:"none",WebkitTapHighlightColor:"transparent",cursor:"pointer","&:hover":{backgroundColor:e.vars?`rgba(${e.vars.palette.action.selectedChannel} / calc(${e.vars.palette.action.selectedOpacity} + ${e.vars.palette.action.hoverOpacity}))`:(0,s.Fq)(e.palette.action.selected,e.palette.action.selectedOpacity+e.palette.action.hoverOpacity)},[`&.${x.focusVisible}`]:{backgroundColor:e.vars?`rgba(${e.vars.palette.action.selectedChannel} / calc(${e.vars.palette.action.selectedOpacity} + ${e.vars.palette.action.focusOpacity}))`:(0,s.Fq)(e.palette.action.selected,e.palette.action.selectedOpacity+e.palette.action.focusOpacity)},"&:active":{boxShadow:(e.vars||e).shadows[1]}},t.clickable&&"default"!==t.color&&{[`&:hover, &.${x.focusVisible}`]:{backgroundColor:(e.vars||e).palette[t.color].dark}}),({theme:e,ownerState:t})=>(0,n.Z)({},"outlined"===t.variant&&{backgroundColor:"transparent",border:e.vars?`1px solid ${e.vars.palette.Chip.defaultBorder}`:`1px solid ${"light"===e.palette.mode?e.palette.grey[400]:e.palette.grey[700]}`,[`&.${x.clickable}:hover`]:{backgroundColor:(e.vars||e).palette.action.hover},[`&.${x.focusVisible}`]:{backgroundColor:(e.vars||e).palette.action.focus},[`& .${x.avatar}`]:{marginLeft:4},[`& .${x.avatarSmall}`]:{marginLeft:2},[`& .${x.icon}`]:{marginLeft:4},[`& .${x.iconSmall}`]:{marginLeft:2},[`& .${x.deleteIcon}`]:{marginRight:5},[`& .${x.deleteIconSmall}`]:{marginRight:3}},"outlined"===t.variant&&"default"!==t.color&&{color:(e.vars||e).palette[t.color].main,border:`1px solid ${e.vars?`rgba(${e.vars.palette[t.color].mainChannel} / 0.7)`:(0,s.Fq)(e.palette[t.color].main,.7)}`,[`&.${x.clickable}:hover`]:{backgroundColor:e.vars?`rgba(${e.vars.palette[t.color].mainChannel} / ${e.vars.palette.action.hoverOpacity})`:(0,s.Fq)(e.palette[t.color].main,e.palette.action.hoverOpacity)},[`&.${x.focusVisible}`]:{backgroundColor:e.vars?`rgba(${e.vars.palette[t.color].mainChannel} / ${e.vars.palette.action.focusOpacity})`:(0,s.Fq)(e.palette[t.color].main,e.palette.action.focusOpacity)},[`& .${x.deleteIcon}`]:{color:e.vars?`rgba(${e.vars.palette[t.color].mainChannel} / 0.7)`:(0,s.Fq)(e.palette[t.color].main,.7),"&:hover, &:active":{color:(e.vars||e).palette[t.color].main}}})),$=(0,h.ZP)("span",{name:"MuiChip",slot:"Label",overridesResolver:(e,t)=>{let{ownerState:o}=e,{size:r}=o;return[t.label,t[`label${(0,u.Z)(r)}`]]}})(({ownerState:e})=>(0,n.Z)({overflow:"hidden",textOverflow:"ellipsis",paddingLeft:12,paddingRight:12,whiteSpace:"nowrap"},"outlined"===e.variant&&{paddingLeft:11,paddingRight:11},"small"===e.size&&{paddingLeft:8,paddingRight:8},"small"===e.size&&"outlined"===e.variant&&{paddingLeft:7,paddingRight:7}));function Z(e){return"Backspace"===e.key||"Delete"===e.key}var k=a.forwardRef(function(e,t){let o=(0,v.i)({props:e,name:"MuiChip"}),{avatar:l,className:s,clickable:c,color:u="default",component:h,deleteIcon:g,disabled:y=!1,icon:b,label:x,onClick:k,onDelete:P,onKeyDown:S,onKeyUp:j,size:E="medium",variant:R="filled",tabIndex:D,skipFocusWhenDisabled:I=!1}=o,M=(0,r.Z)(o,w),L=a.useRef(null),T=(0,d.Z)(L,t),A=e=>{e.stopPropagation(),P&&P(e)},W=!1!==c&&!!k||c,V=W||P?m.Z:h||"div",z=(0,n.Z)({},o,{component:V,disabled:y,size:E,color:u,iconColor:a.isValidElement(b)&&b.props.color||u,onDelete:!!P,clickable:W,variant:R}),B=O(z),N=V===m.Z?(0,n.Z)({component:h||"div",focusVisibleClassName:B.focusVisible},P&&{disableRipple:!0}):{},q=null;P&&(q=g&&a.isValidElement(g)?a.cloneElement(g,{className:(0,i.Z)(g.props.className,B.deleteIcon),onClick:A}):(0,p.jsx)(f,{className:(0,i.Z)(B.deleteIcon),onClick:A}));let F=null;l&&a.isValidElement(l)&&(F=a.cloneElement(l,{className:(0,i.Z)(B.avatar,l.props.className)}));let H=null;return b&&a.isValidElement(b)&&(H=a.cloneElement(b,{className:(0,i.Z)(B.icon,b.props.className)})),(0,p.jsxs)(C,(0,n.Z)({as:V,className:(0,i.Z)(B.root,s),disabled:!!W&&!!y||void 0,onClick:k,onKeyDown:e=>{e.currentTarget===e.target&&Z(e)&&e.preventDefault(),S&&S(e)},onKeyUp:e=>{e.currentTarget===e.target&&(P&&Z(e)?P(e):"Escape"===e.key&&L.current&&L.current.blur()),j&&j(e)},ref:T,tabIndex:I&&y?-1:D,ownerState:z},N,M,{children:[F||H,(0,p.jsx)($,{className:(0,i.Z)(B.label),ownerState:z,children:x}),q]}))})},11535:function(e,t,o){o.d(t,{Z:function(){return eL}});var r,n,a,i,l,s=o(87462),c=o(63366),p=o(91070),f=o(67294),d=o(33703),u=o(73546),m=o(82690);function v(e){if(null==e)return window;if("[object Window]"!==e.toString()){var t=e.ownerDocument;return t&&t.defaultView||window}return e}function h(e){var t=v(e).Element;return e instanceof t||e instanceof Element}function g(e){var t=v(e).HTMLElement;return e instanceof t||e instanceof HTMLElement}function y(e){if("undefined"==typeof ShadowRoot)return!1;var t=v(e).ShadowRoot;return e instanceof t||e instanceof ShadowRoot}var b=Math.max,x=Math.min,w=Math.round;function O(){var e=navigator.userAgentData;return null!=e&&e.brands&&Array.isArray(e.brands)?e.brands.map(function(e){return e.brand+"/"+e.version}).join(" "):navigator.userAgent}function C(){return!/^((?!chrome|android).)*safari/i.test(O())}function $(e,t,o){void 0===t&&(t=!1),void 0===o&&(o=!1);var r=e.getBoundingClientRect(),n=1,a=1;t&&g(e)&&(n=e.offsetWidth>0&&w(r.width)/e.offsetWidth||1,a=e.offsetHeight>0&&w(r.height)/e.offsetHeight||1);var i=(h(e)?v(e):window).visualViewport,l=!C()&&o,s=(r.left+(l&&i?i.offsetLeft:0))/n,c=(r.top+(l&&i?i.offsetTop:0))/a,p=r.width/n,f=r.height/a;return{width:p,height:f,top:c,right:s+p,bottom:c+f,left:s,x:s,y:c}}function Z(e){var t=v(e);return{scrollLeft:t.pageXOffset,scrollTop:t.pageYOffset}}function k(e){return e?(e.nodeName||"").toLowerCase():null}function P(e){return((h(e)?e.ownerDocument:e.document)||window.document).documentElement}function S(e){return $(P(e)).left+Z(e).scrollLeft}function j(e){return v(e).getComputedStyle(e)}function E(e){var t=j(e),o=t.overflow,r=t.overflowX,n=t.overflowY;return/auto|scroll|overlay|hidden/.test(o+n+r)}function R(e){var t=$(e),o=e.offsetWidth,r=e.offsetHeight;return 1>=Math.abs(t.width-o)&&(o=t.width),1>=Math.abs(t.height-r)&&(r=t.height),{x:e.offsetLeft,y:e.offsetTop,width:o,height:r}}function D(e){return"html"===k(e)?e:e.assignedSlot||e.parentNode||(y(e)?e.host:null)||P(e)}function I(e,t){void 0===t&&(t=[]);var o,r=function e(t){return["html","body","#document"].indexOf(k(t))>=0?t.ownerDocument.body:g(t)&&E(t)?t:e(D(t))}(e),n=r===(null==(o=e.ownerDocument)?void 0:o.body),a=v(r),i=n?[a].concat(a.visualViewport||[],E(r)?r:[]):r,l=t.concat(i);return n?l:l.concat(I(D(i)))}function M(e){return g(e)&&"fixed"!==j(e).position?e.offsetParent:null}function L(e){for(var t=v(e),o=M(e);o&&["table","td","th"].indexOf(k(o))>=0&&"static"===j(o).position;)o=M(o);return o&&("html"===k(o)||"body"===k(o)&&"static"===j(o).position)?t:o||function(e){var t=/firefox/i.test(O());if(/Trident/i.test(O())&&g(e)&&"fixed"===j(e).position)return null;var o=D(e);for(y(o)&&(o=o.host);g(o)&&0>["html","body"].indexOf(k(o));){var r=j(o);if("none"!==r.transform||"none"!==r.perspective||"paint"===r.contain||-1!==["transform","perspective"].indexOf(r.willChange)||t&&"filter"===r.willChange||t&&r.filter&&"none"!==r.filter)return o;o=o.parentNode}return null}(e)||t}var T="bottom",A="right",W="left",V="auto",z=["top",T,A,W],B="start",N="viewport",q="popper",F=z.reduce(function(e,t){return e.concat([t+"-"+B,t+"-end"])},[]),H=[].concat(z,[V]).reduce(function(e,t){return e.concat([t,t+"-"+B,t+"-end"])},[]),_=["beforeRead","read","afterRead","beforeMain","main","afterMain","beforeWrite","write","afterWrite"],U={placement:"bottom",modifiers:[],strategy:"absolute"};function K(){for(var e=arguments.length,t=Array(e),o=0;o<e;o++)t[o]=arguments[o];return!t.some(function(e){return!(e&&"function"==typeof e.getBoundingClientRect)})}var X={passive:!0};function Y(e){return e.split("-")[0]}function G(e){return e.split("-")[1]}function J(e){return["top","bottom"].indexOf(e)>=0?"x":"y"}function Q(e){var t,o=e.reference,r=e.element,n=e.placement,a=n?Y(n):null,i=n?G(n):null,l=o.x+o.width/2-r.width/2,s=o.y+o.height/2-r.height/2;switch(a){case"top":t={x:l,y:o.y-r.height};break;case T:t={x:l,y:o.y+o.height};break;case A:t={x:o.x+o.width,y:s};break;case W:t={x:o.x-r.width,y:s};break;default:t={x:o.x,y:o.y}}var c=a?J(a):null;if(null!=c){var p="y"===c?"height":"width";switch(i){case B:t[c]=t[c]-(o[p]/2-r[p]/2);break;case"end":t[c]=t[c]+(o[p]/2-r[p]/2)}}return t}var ee={top:"auto",right:"auto",bottom:"auto",left:"auto"};function et(e){var t,o,r,n,a,i,l,s=e.popper,c=e.popperRect,p=e.placement,f=e.variation,d=e.offsets,u=e.position,m=e.gpuAcceleration,h=e.adaptive,g=e.roundOffsets,y=e.isFixed,b=d.x,x=void 0===b?0:b,O=d.y,C=void 0===O?0:O,$="function"==typeof g?g({x:x,y:C}):{x:x,y:C};x=$.x,C=$.y;var Z=d.hasOwnProperty("x"),k=d.hasOwnProperty("y"),S=W,E="top",R=window;if(h){var D=L(s),I="clientHeight",M="clientWidth";D===v(s)&&"static"!==j(D=P(s)).position&&"absolute"===u&&(I="scrollHeight",M="scrollWidth"),("top"===p||(p===W||p===A)&&"end"===f)&&(E=T,C-=(y&&D===R&&R.visualViewport?R.visualViewport.height:D[I])-c.height,C*=m?1:-1),(p===W||("top"===p||p===T)&&"end"===f)&&(S=A,x-=(y&&D===R&&R.visualViewport?R.visualViewport.width:D[M])-c.width,x*=m?1:-1)}var V=Object.assign({position:u},h&&ee),z=!0===g?(t={x:x,y:C},o=v(s),r=t.x,n=t.y,{x:w(r*(a=o.devicePixelRatio||1))/a||0,y:w(n*a)/a||0}):{x:x,y:C};return(x=z.x,C=z.y,m)?Object.assign({},V,((l={})[E]=k?"0":"",l[S]=Z?"0":"",l.transform=1>=(R.devicePixelRatio||1)?"translate("+x+"px, "+C+"px)":"translate3d("+x+"px, "+C+"px, 0)",l)):Object.assign({},V,((i={})[E]=k?C+"px":"",i[S]=Z?x+"px":"",i.transform="",i))}var eo={left:"right",right:"left",bottom:"top",top:"bottom"};function er(e){return e.replace(/left|right|bottom|top/g,function(e){return eo[e]})}var en={start:"end",end:"start"};function ea(e){return e.replace(/start|end/g,function(e){return en[e]})}function ei(e,t){var o=t.getRootNode&&t.getRootNode();if(e.contains(t))return!0;if(o&&y(o)){var r=t;do{if(r&&e.isSameNode(r))return!0;r=r.parentNode||r.host}while(r)}return!1}function el(e){return Object.assign({},e,{left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height})}function es(e,t,o){var r,n,a,i,l,s,c,p,f,d;return t===N?el(function(e,t){var o=v(e),r=P(e),n=o.visualViewport,a=r.clientWidth,i=r.clientHeight,l=0,s=0;if(n){a=n.width,i=n.height;var c=C();(c||!c&&"fixed"===t)&&(l=n.offsetLeft,s=n.offsetTop)}return{width:a,height:i,x:l+S(e),y:s}}(e,o)):h(t)?((r=$(t,!1,"fixed"===o)).top=r.top+t.clientTop,r.left=r.left+t.clientLeft,r.bottom=r.top+t.clientHeight,r.right=r.left+t.clientWidth,r.width=t.clientWidth,r.height=t.clientHeight,r.x=r.left,r.y=r.top,r):el((n=P(e),i=P(n),l=Z(n),s=null==(a=n.ownerDocument)?void 0:a.body,c=b(i.scrollWidth,i.clientWidth,s?s.scrollWidth:0,s?s.clientWidth:0),p=b(i.scrollHeight,i.clientHeight,s?s.scrollHeight:0,s?s.clientHeight:0),f=-l.scrollLeft+S(n),d=-l.scrollTop,"rtl"===j(s||i).direction&&(f+=b(i.clientWidth,s?s.clientWidth:0)-c),{width:c,height:p,x:f,y:d}))}function ec(){return{top:0,right:0,bottom:0,left:0}}function ep(e){return Object.assign({},ec(),e)}function ef(e,t){return t.reduce(function(t,o){return t[o]=e,t},{})}function ed(e,t){void 0===t&&(t={});var o,r,n,a,i,l,s,c=t,p=c.placement,f=void 0===p?e.placement:p,d=c.strategy,u=void 0===d?e.strategy:d,m=c.boundary,v=c.rootBoundary,y=c.elementContext,w=void 0===y?q:y,O=c.altBoundary,C=c.padding,Z=void 0===C?0:C,S=ep("number"!=typeof Z?Z:ef(Z,z)),E=e.rects.popper,R=e.elements[void 0!==O&&O?w===q?"reference":q:w],M=(o=h(R)?R:R.contextElement||P(e.elements.popper),l=(i=[].concat("clippingParents"===(r=void 0===m?"clippingParents":m)?(n=I(D(o)),h(a=["absolute","fixed"].indexOf(j(o).position)>=0&&g(o)?L(o):o)?n.filter(function(e){return h(e)&&ei(e,a)&&"body"!==k(e)}):[]):[].concat(r),[void 0===v?N:v]))[0],(s=i.reduce(function(e,t){var r=es(o,t,u);return e.top=b(r.top,e.top),e.right=x(r.right,e.right),e.bottom=x(r.bottom,e.bottom),e.left=b(r.left,e.left),e},es(o,l,u))).width=s.right-s.left,s.height=s.bottom-s.top,s.x=s.left,s.y=s.top,s),W=$(e.elements.reference),V=Q({reference:W,element:E,strategy:"absolute",placement:f}),B=el(Object.assign({},E,V)),F=w===q?B:W,H={top:M.top-F.top+S.top,bottom:F.bottom-M.bottom+S.bottom,left:M.left-F.left+S.left,right:F.right-M.right+S.right},_=e.modifiersData.offset;if(w===q&&_){var U=_[f];Object.keys(H).forEach(function(e){var t=[A,T].indexOf(e)>=0?1:-1,o=["top",T].indexOf(e)>=0?"y":"x";H[e]+=U[o]*t})}return H}function eu(e,t,o){return b(e,x(t,o))}function em(e,t,o){return void 0===o&&(o={x:0,y:0}),{top:e.top-t.height-o.y,right:e.right-t.width+o.x,bottom:e.bottom-t.height+o.y,left:e.left-t.width-o.x}}function ev(e){return["top",A,T,W].some(function(t){return e[t]>=0})}var eh=(a=void 0===(n=(r={defaultModifiers:[{name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:function(e){var t=e.state,o=e.instance,r=e.options,n=r.scroll,a=void 0===n||n,i=r.resize,l=void 0===i||i,s=v(t.elements.popper),c=[].concat(t.scrollParents.reference,t.scrollParents.popper);return a&&c.forEach(function(e){e.addEventListener("scroll",o.update,X)}),l&&s.addEventListener("resize",o.update,X),function(){a&&c.forEach(function(e){e.removeEventListener("scroll",o.update,X)}),l&&s.removeEventListener("resize",o.update,X)}},data:{}},{name:"popperOffsets",enabled:!0,phase:"read",fn:function(e){var t=e.state,o=e.name;t.modifiersData[o]=Q({reference:t.rects.reference,element:t.rects.popper,strategy:"absolute",placement:t.placement})},data:{}},{name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:function(e){var t=e.state,o=e.options,r=o.gpuAcceleration,n=o.adaptive,a=o.roundOffsets,i=void 0===a||a,l={placement:Y(t.placement),variation:G(t.placement),popper:t.elements.popper,popperRect:t.rects.popper,gpuAcceleration:void 0===r||r,isFixed:"fixed"===t.options.strategy};null!=t.modifiersData.popperOffsets&&(t.styles.popper=Object.assign({},t.styles.popper,et(Object.assign({},l,{offsets:t.modifiersData.popperOffsets,position:t.options.strategy,adaptive:void 0===n||n,roundOffsets:i})))),null!=t.modifiersData.arrow&&(t.styles.arrow=Object.assign({},t.styles.arrow,et(Object.assign({},l,{offsets:t.modifiersData.arrow,position:"absolute",adaptive:!1,roundOffsets:i})))),t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-placement":t.placement})},data:{}},{name:"applyStyles",enabled:!0,phase:"write",fn:function(e){var t=e.state;Object.keys(t.elements).forEach(function(e){var o=t.styles[e]||{},r=t.attributes[e]||{},n=t.elements[e];g(n)&&k(n)&&(Object.assign(n.style,o),Object.keys(r).forEach(function(e){var t=r[e];!1===t?n.removeAttribute(e):n.setAttribute(e,!0===t?"":t)}))})},effect:function(e){var t=e.state,o={popper:{position:t.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};return Object.assign(t.elements.popper.style,o.popper),t.styles=o,t.elements.arrow&&Object.assign(t.elements.arrow.style,o.arrow),function(){Object.keys(t.elements).forEach(function(e){var r=t.elements[e],n=t.attributes[e]||{},a=Object.keys(t.styles.hasOwnProperty(e)?t.styles[e]:o[e]).reduce(function(e,t){return e[t]="",e},{});g(r)&&k(r)&&(Object.assign(r.style,a),Object.keys(n).forEach(function(e){r.removeAttribute(e)}))})}},requires:["computeStyles"]},{name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:function(e){var t=e.state,o=e.options,r=e.name,n=o.offset,a=void 0===n?[0,0]:n,i=H.reduce(function(e,o){var r,n,i,l,s,c;return e[o]=(r=t.rects,i=[W,"top"].indexOf(n=Y(o))>=0?-1:1,s=(l="function"==typeof a?a(Object.assign({},r,{placement:o})):a)[0],c=l[1],s=s||0,c=(c||0)*i,[W,A].indexOf(n)>=0?{x:c,y:s}:{x:s,y:c}),e},{}),l=i[t.placement],s=l.x,c=l.y;null!=t.modifiersData.popperOffsets&&(t.modifiersData.popperOffsets.x+=s,t.modifiersData.popperOffsets.y+=c),t.modifiersData[r]=i}},{name:"flip",enabled:!0,phase:"main",fn:function(e){var t=e.state,o=e.options,r=e.name;if(!t.modifiersData[r]._skip){for(var n=o.mainAxis,a=void 0===n||n,i=o.altAxis,l=void 0===i||i,s=o.fallbackPlacements,c=o.padding,p=o.boundary,f=o.rootBoundary,d=o.altBoundary,u=o.flipVariations,m=void 0===u||u,v=o.allowedAutoPlacements,h=t.options.placement,g=Y(h)===h,y=s||(g||!m?[er(h)]:function(e){if(Y(e)===V)return[];var t=er(e);return[ea(e),t,ea(t)]}(h)),b=[h].concat(y).reduce(function(e,o){var r,n,a,i,l,s,d,u,h,g,y,b;return e.concat(Y(o)===V?(n=(r={placement:o,boundary:p,rootBoundary:f,padding:c,flipVariations:m,allowedAutoPlacements:v}).placement,a=r.boundary,i=r.rootBoundary,l=r.padding,s=r.flipVariations,u=void 0===(d=r.allowedAutoPlacements)?H:d,0===(y=(g=(h=G(n))?s?F:F.filter(function(e){return G(e)===h}):z).filter(function(e){return u.indexOf(e)>=0})).length&&(y=g),Object.keys(b=y.reduce(function(e,o){return e[o]=ed(t,{placement:o,boundary:a,rootBoundary:i,padding:l})[Y(o)],e},{})).sort(function(e,t){return b[e]-b[t]})):o)},[]),x=t.rects.reference,w=t.rects.popper,O=new Map,C=!0,$=b[0],Z=0;Z<b.length;Z++){var k=b[Z],P=Y(k),S=G(k)===B,j=["top",T].indexOf(P)>=0,E=j?"width":"height",R=ed(t,{placement:k,boundary:p,rootBoundary:f,altBoundary:d,padding:c}),D=j?S?A:W:S?T:"top";x[E]>w[E]&&(D=er(D));var I=er(D),M=[];if(a&&M.push(R[P]<=0),l&&M.push(R[D]<=0,R[I]<=0),M.every(function(e){return e})){$=k,C=!1;break}O.set(k,M)}if(C)for(var L=m?3:1,N=function(e){var t=b.find(function(t){var o=O.get(t);if(o)return o.slice(0,e).every(function(e){return e})});if(t)return $=t,"break"},q=L;q>0&&"break"!==N(q);q--);t.placement!==$&&(t.modifiersData[r]._skip=!0,t.placement=$,t.reset=!0)}},requiresIfExists:["offset"],data:{_skip:!1}},{name:"preventOverflow",enabled:!0,phase:"main",fn:function(e){var t=e.state,o=e.options,r=e.name,n=o.mainAxis,a=o.altAxis,i=o.boundary,l=o.rootBoundary,s=o.altBoundary,c=o.padding,p=o.tether,f=void 0===p||p,d=o.tetherOffset,u=void 0===d?0:d,m=ed(t,{boundary:i,rootBoundary:l,padding:c,altBoundary:s}),v=Y(t.placement),h=G(t.placement),g=!h,y=J(v),w="x"===y?"y":"x",O=t.modifiersData.popperOffsets,C=t.rects.reference,$=t.rects.popper,Z="function"==typeof u?u(Object.assign({},t.rects,{placement:t.placement})):u,k="number"==typeof Z?{mainAxis:Z,altAxis:Z}:Object.assign({mainAxis:0,altAxis:0},Z),P=t.modifiersData.offset?t.modifiersData.offset[t.placement]:null,S={x:0,y:0};if(O){if(void 0===n||n){var j,E="y"===y?"top":W,D="y"===y?T:A,I="y"===y?"height":"width",M=O[y],V=M+m[E],z=M-m[D],N=f?-$[I]/2:0,q=h===B?C[I]:$[I],F=h===B?-$[I]:-C[I],H=t.elements.arrow,_=f&&H?R(H):{width:0,height:0},U=t.modifiersData["arrow#persistent"]?t.modifiersData["arrow#persistent"].padding:ec(),K=U[E],X=U[D],Q=eu(0,C[I],_[I]),ee=g?C[I]/2-N-Q-K-k.mainAxis:q-Q-K-k.mainAxis,et=g?-C[I]/2+N+Q+X+k.mainAxis:F+Q+X+k.mainAxis,eo=t.elements.arrow&&L(t.elements.arrow),er=eo?"y"===y?eo.clientTop||0:eo.clientLeft||0:0,en=null!=(j=null==P?void 0:P[y])?j:0,ea=eu(f?x(V,M+ee-en-er):V,M,f?b(z,M+et-en):z);O[y]=ea,S[y]=ea-M}if(void 0!==a&&a){var ei,el,es="x"===y?"top":W,ep="x"===y?T:A,ef=O[w],em="y"===w?"height":"width",ev=ef+m[es],eh=ef-m[ep],eg=-1!==["top",W].indexOf(v),ey=null!=(el=null==P?void 0:P[w])?el:0,eb=eg?ev:ef-C[em]-$[em]-ey+k.altAxis,ex=eg?ef+C[em]+$[em]-ey-k.altAxis:eh,ew=f&&eg?(ei=eu(eb,ef,ex))>ex?ex:ei:eu(f?eb:ev,ef,f?ex:eh);O[w]=ew,S[w]=ew-ef}t.modifiersData[r]=S}},requiresIfExists:["offset"]},{name:"arrow",enabled:!0,phase:"main",fn:function(e){var t,o,r=e.state,n=e.name,a=e.options,i=r.elements.arrow,l=r.modifiersData.popperOffsets,s=Y(r.placement),c=J(s),p=[W,A].indexOf(s)>=0?"height":"width";if(i&&l){var f=ep("number"!=typeof(t="function"==typeof(t=a.padding)?t(Object.assign({},r.rects,{placement:r.placement})):t)?t:ef(t,z)),d=R(i),u="y"===c?"top":W,m="y"===c?T:A,v=r.rects.reference[p]+r.rects.reference[c]-l[c]-r.rects.popper[p],h=l[c]-r.rects.reference[c],g=L(i),y=g?"y"===c?g.clientHeight||0:g.clientWidth||0:0,b=f[u],x=y-d[p]-f[m],w=y/2-d[p]/2+(v/2-h/2),O=eu(b,w,x);r.modifiersData[n]=((o={})[c]=O,o.centerOffset=O-w,o)}},effect:function(e){var t=e.state,o=e.options.element,r=void 0===o?"[data-popper-arrow]":o;null!=r&&("string"!=typeof r||(r=t.elements.popper.querySelector(r)))&&ei(t.elements.popper,r)&&(t.elements.arrow=r)},requires:["popperOffsets"],requiresIfExists:["preventOverflow"]},{name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:function(e){var t=e.state,o=e.name,r=t.rects.reference,n=t.rects.popper,a=t.modifiersData.preventOverflow,i=ed(t,{elementContext:"reference"}),l=ed(t,{altBoundary:!0}),s=em(i,r),c=em(l,n,a),p=ev(s),f=ev(c);t.modifiersData[o]={referenceClippingOffsets:s,popperEscapeOffsets:c,isReferenceHidden:p,hasPopperEscaped:f},t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-reference-hidden":p,"data-popper-escaped":f})}}]}).defaultModifiers)?[]:n,l=void 0===(i=r.defaultOptions)?U:i,function(e,t,o){void 0===o&&(o=l);var r,n={placement:"bottom",orderedModifiers:[],options:Object.assign({},U,l),modifiersData:{},elements:{reference:e,popper:t},attributes:{},styles:{}},i=[],s=!1,c={state:n,setOptions:function(o){var r,s,f,d,u,m="function"==typeof o?o(n.options):o;p(),n.options=Object.assign({},l,n.options,m),n.scrollParents={reference:h(e)?I(e):e.contextElement?I(e.contextElement):[],popper:I(t)};var v=(s=Object.keys(r=[].concat(a,n.options.modifiers).reduce(function(e,t){var o=e[t.name];return e[t.name]=o?Object.assign({},o,t,{options:Object.assign({},o.options,t.options),data:Object.assign({},o.data,t.data)}):t,e},{})).map(function(e){return r[e]}),f=new Map,d=new Set,u=[],s.forEach(function(e){f.set(e.name,e)}),s.forEach(function(e){d.has(e.name)||function e(t){d.add(t.name),[].concat(t.requires||[],t.requiresIfExists||[]).forEach(function(t){if(!d.has(t)){var o=f.get(t);o&&e(o)}}),u.push(t)}(e)}),_.reduce(function(e,t){return e.concat(u.filter(function(e){return e.phase===t}))},[]));return n.orderedModifiers=v.filter(function(e){return e.enabled}),n.orderedModifiers.forEach(function(e){var t=e.name,o=e.options,r=e.effect;if("function"==typeof r){var a=r({state:n,name:t,instance:c,options:void 0===o?{}:o});i.push(a||function(){})}}),c.update()},forceUpdate:function(){if(!s){var e,t,o,r,a,i,l,p,f,d,u,m,h=n.elements,y=h.reference,b=h.popper;if(K(y,b)){n.rects={reference:(t=L(b),o="fixed"===n.options.strategy,r=g(t),p=g(t)&&(i=w((a=t.getBoundingClientRect()).width)/t.offsetWidth||1,l=w(a.height)/t.offsetHeight||1,1!==i||1!==l),f=P(t),d=$(y,p,o),u={scrollLeft:0,scrollTop:0},m={x:0,y:0},(r||!r&&!o)&&(("body"!==k(t)||E(f))&&(u=(e=t)!==v(e)&&g(e)?{scrollLeft:e.scrollLeft,scrollTop:e.scrollTop}:Z(e)),g(t)?(m=$(t,!0),m.x+=t.clientLeft,m.y+=t.clientTop):f&&(m.x=S(f))),{x:d.left+u.scrollLeft-m.x,y:d.top+u.scrollTop-m.y,width:d.width,height:d.height}),popper:R(b)},n.reset=!1,n.placement=n.options.placement,n.orderedModifiers.forEach(function(e){return n.modifiersData[e.name]=Object.assign({},e.data)});for(var x=0;x<n.orderedModifiers.length;x++){if(!0===n.reset){n.reset=!1,x=-1;continue}var O=n.orderedModifiers[x],C=O.fn,j=O.options,D=void 0===j?{}:j,I=O.name;"function"==typeof C&&(n=C({state:n,options:D,name:I,instance:c})||n)}}}},update:function(){return r||(r=new Promise(function(e){Promise.resolve().then(function(){r=void 0,e(new Promise(function(e){c.forceUpdate(),e(n)}))})})),r},destroy:function(){p(),s=!0}};if(!K(e,t))return c;function p(){i.forEach(function(e){return e()}),i=[]}return c.setOptions(o).then(function(e){!s&&o.onFirstUpdate&&o.onFirstUpdate(e)}),c}),eg=o(94780),ey=o(82963),eb=o(40424),ex=o(1588),ew=o(34867);function eO(e){return(0,ew.ZP)("MuiPopper",e)}(0,ex.Z)("MuiPopper",["root"]);var eC=o(85893);let e$=["anchorEl","children","direction","disablePortal","modifiers","open","placement","popperOptions","popperRef","slotProps","slots","TransitionProps","ownerState"],eZ=["anchorEl","children","container","direction","disablePortal","keepMounted","modifiers","open","placement","popperOptions","popperRef","style","transition","slotProps","slots"];function ek(e){return"function"==typeof e?e():e}let eP=e=>{let{classes:t}=e;return(0,eg.Z)({root:["root"]},eO,t)},eS={},ej=f.forwardRef(function(e,t){var o;let{anchorEl:r,children:n,direction:a,disablePortal:i,modifiers:l,open:p,placement:m,popperOptions:v,popperRef:h,slotProps:g={},slots:y={},TransitionProps:b}=e,x=(0,c.Z)(e,e$),w=f.useRef(null),O=(0,d.Z)(w,t),C=f.useRef(null),$=(0,d.Z)(C,h),Z=f.useRef($);(0,u.Z)(()=>{Z.current=$},[$]),f.useImperativeHandle(h,()=>C.current,[]);let k=function(e,t){if("ltr"===t)return e;switch(e){case"bottom-end":return"bottom-start";case"bottom-start":return"bottom-end";case"top-end":return"top-start";case"top-start":return"top-end";default:return e}}(m,a),[P,S]=f.useState(k),[j,E]=f.useState(ek(r));f.useEffect(()=>{C.current&&C.current.forceUpdate()}),f.useEffect(()=>{r&&E(ek(r))},[r]),(0,u.Z)(()=>{if(!j||!p)return;let e=e=>{S(e.placement)},t=[{name:"preventOverflow",options:{altBoundary:i}},{name:"flip",options:{altBoundary:i}},{name:"onUpdate",enabled:!0,phase:"afterWrite",fn:({state:t})=>{e(t)}}];null!=l&&(t=t.concat(l)),v&&null!=v.modifiers&&(t=t.concat(v.modifiers));let o=eh(j,w.current,(0,s.Z)({placement:k},v,{modifiers:t}));return Z.current(o),()=>{o.destroy(),Z.current(null)}},[j,i,l,p,v,k]);let R={placement:P};null!==b&&(R.TransitionProps=b);let D=eP(e),I=null!=(o=y.root)?o:"div",M=(0,ey.Z)({elementType:I,externalSlotProps:g.root,externalForwardedProps:x,additionalProps:{role:"tooltip",ref:O},ownerState:e,className:D.root});return(0,eC.jsx)(I,(0,s.Z)({},M,{children:"function"==typeof n?n(R):n}))}),eE=f.forwardRef(function(e,t){let o;let{anchorEl:r,children:n,container:a,direction:i="ltr",disablePortal:l=!1,keepMounted:p=!1,modifiers:d,open:u,placement:v="bottom",popperOptions:h=eS,popperRef:g,style:y,transition:b=!1,slotProps:x={},slots:w={}}=e,O=(0,c.Z)(e,eZ),[C,$]=f.useState(!0);if(!p&&!u&&(!b||C))return null;if(a)o=a;else if(r){let e=ek(r);o=e&&void 0!==e.nodeType?(0,m.Z)(e).body:(0,m.Z)(null).body}let Z=!u&&p&&(!b||C)?"none":void 0,k=b?{in:u,onEnter:()=>{$(!1)},onExited:()=>{$(!0)}}:void 0;return(0,eC.jsx)(eb.Z,{disablePortal:l,container:o,children:(0,eC.jsx)(ej,(0,s.Z)({anchorEl:r,direction:i,disablePortal:l,modifiers:d,ref:t,open:b?!C:u,placement:v,popperOptions:h,popperRef:g,slotProps:x,slots:w},O,{style:(0,s.Z)({position:"fixed",top:0,left:0,display:Z},y),TransitionProps:k,children:n}))})});var eR=o(90948),eD=o(28628);let eI=["anchorEl","component","components","componentsProps","container","disablePortal","keepMounted","modifiers","open","placement","popperOptions","popperRef","transition","slots","slotProps"],eM=(0,eR.ZP)(eE,{name:"MuiPopper",slot:"Root",overridesResolver:(e,t)=>t.root})({});var eL=f.forwardRef(function(e,t){var o;let r=(0,p.Z)(),n=(0,eD.i)({props:e,name:"MuiPopper"}),{anchorEl:a,component:i,components:l,componentsProps:f,container:d,disablePortal:u,keepMounted:m,modifiers:v,open:h,placement:g,popperOptions:y,popperRef:b,transition:x,slots:w,slotProps:O}=n,C=(0,c.Z)(n,eI),$=null!=(o=null==w?void 0:w.root)?o:null==l?void 0:l.Root,Z=(0,s.Z)({anchorEl:a,container:d,disablePortal:u,keepMounted:m,modifiers:v,open:h,placement:g,popperOptions:y,popperRef:b,transition:x},C);return(0,eC.jsx)(eM,(0,s.Z)({as:i,direction:null==r?void 0:r.direction,slots:{root:$},slotProps:null!=O?O:f},Z,{ref:t}))})},91070:function(e,t,o){t.Z=void 0;var r=function(e,t){if(!t&&e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var o=a(t);if(o&&o.has(e))return o.get(e);var r={__proto__:null},n=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var i in e)if("default"!==i&&Object.prototype.hasOwnProperty.call(e,i)){var l=n?Object.getOwnPropertyDescriptor(e,i):null;l&&(l.get||l.set)?Object.defineProperty(r,i,l):r[i]=e[i]}return r.default=e,o&&o.set(e,r),r}(o(67294)),n=o(63390);function a(e){if("function"!=typeof WeakMap)return null;var t=new WeakMap,o=new WeakMap;return(a=function(e){return e?o:t})(e)}t.Z=function(e=null){let t=r.useContext(n.ThemeContext);return t&&0!==Object.keys(t).length?t:e}}}]);