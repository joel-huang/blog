(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[931],{6462:function(e,t,a){Promise.resolve().then(a.bind(a,29080)),Promise.resolve().then(a.bind(a,75622)),Promise.resolve().then(a.bind(a,5434)),Promise.resolve().then(a.bind(a,15791)),Promise.resolve().then(a.bind(a,80490)),Promise.resolve().then(a.t.bind(a,28321,23)),Promise.resolve().then(a.t.bind(a,45827,23)),Promise.resolve().then(a.t.bind(a,28522,23)),Promise.resolve().then(a.bind(a,84539)),Promise.resolve().then(a.bind(a,23869))},29080:function(e,t,a){"use strict";a.r(t);var n=a(22512),l=a(63548),s=a(99541),r=a(72995),i=a(74682),o=a(78567),c=a(4317),u=a(11118),d=a(54204),m=a(38872),x=a(93940),h=a(47486),g=a(37287);let f=[{name:"scipy",time:142362},{name:"numpy",time:112752.9},{name:"torch",time:83144.2},{name:"sklearn",time:401.8},{name:"np matrix",time:136.2},{name:"✨ ours",time:48.6}],p=(e,t)=>{let a=RegExp("\\.0+$|(?<=\\.[0-9]*[1-9])0+$"),n=[{value:1,symbol:""},{value:1e3,symbol:"k"},{value:1e6,symbol:"M"},{value:1e9,symbol:"G"},{value:1e12,symbol:"T"},{value:1e15,symbol:"P"},{value:1e18,symbol:"E"}].findLast(t=>e>=t.value);return n?(e/n.value).toFixed(t).replace(a,"").concat(n.symbol):"0"},b=e=>{let{isLog:t,setIsLog:a}=e;return(0,n.jsxs)("div",{className:"w-full flex gap-2 justify-end",children:[(0,n.jsx)("span",{className:"text-neutral-200",children:t?"Log":"Linear"}),(0,n.jsx)("button",{className:"bg-neutral-800 hover:bg-neutral-700 elevated py-1 px-1.5 rounded-sm",onClick:()=>a(!t),children:t?(0,n.jsx)("div",{className:"flex gap-1 justify-center items-center",children:(0,n.jsx)(l.Z,{size:16})}):(0,n.jsx)("div",{className:"flex gap-1 justify-center items-center",children:(0,n.jsx)(s.Z,{size:16})})})]})};t.default=function(){let[e,t]=r.useState(!0),[a,l]=r.useState(!1);if(r.useEffect(()=>{l(!0)},[]),!a)return null;let s=f.map(t=>({...t,time:e?Math.log(t.time):t.time}));return(0,n.jsxs)("div",{className:"flex flex-col gap-2",children:[(0,n.jsx)(b,{isLog:e,setIsLog:t}),(0,n.jsx)(i.h,{width:"100%",height:400,children:(0,n.jsxs)(o.v,{data:s,children:[(0,n.jsx)(c.q,{strokeDasharray:"3 3",style:{stroke:"#222"}}),(0,n.jsx)(u.K,{dataKey:"name",domain:["auto","auto"],tickFormatter:e=>e.length>10?e.slice(0,10)+"...":e,children:(0,n.jsx)(d._,{dy:10,position:"insideBottom",value:"Method"})}),(0,n.jsx)(m.B,{tickFormatter:e=>p(e,1),children:(0,n.jsx)(d._,{style:{textAnchor:"middle"},position:"insideLeft",angle:270,value:e?"Log Time (\xb5s)":"Time (\xb5s)"})}),(0,n.jsx)(x.u,{labelStyle:{color:"rgb(229, 229, 229)"},itemStyle:{color:"rgb(229, 229, 229)"},cursor:{fill:"rgba(38, 38, 38, 0.25)"},contentStyle:{backgroundColor:"rgb(38, 38, 38)",border:"none",boxShadow:"0px 3px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.18), inset 0px 1px 0px rgba(255, 255, 255, 0.08), inset 0px 0px 1px rgba(255, 255, 255, 0.3)",borderRadius:"0.25rem"},wrapperStyle:{transition:"all 100ms"},formatter:t=>e?"".concat(p(Math.exp(t),1)," \xb5s"):"".concat(p(t,1)," \xb5s")}),(0,n.jsx)(h.$,{dataKey:"time",fill:"#000000",children:f.map((e,t)=>(0,n.jsx)(g.b,{fill:t===f.length-1?"#CE9178":"#333"},"cell-".concat(t)))})]})})]})}},75622:function(e,t,a){"use strict";a.d(t,{default:function(){return c}});var n=a(22512),l=a(30072),s=a(42069),r=a(72995);let i=function(){for(var e=arguments.length,t=Array(e),a=0;a<e;a++)t[a]=arguments[a];return t.filter(Boolean).join(" ")};var o=e=>{let{href:t,children:a,...r}=e;return(0,n.jsxs)(l.default,{href:t,...r,className:i("w-fit h-2 inline-block items-center",r.className),children:[(0,n.jsx)(s.Z,{className:"inline-block",size:16}),a]})},c=e=>{let{text:t,imageUrl:a,href:l}=e,[s,i]=(0,r.useState)(!1),[c,u]=(0,r.useState)(!1);return r.useEffect(()=>{let e=window.matchMedia("(max-width: 480px)");u(e.matches);let t=e=>{u(e.matches)};return e.addEventListener("change",t),()=>{e.removeEventListener("change",t)}},[]),(0,n.jsxs)("div",{className:"preview-container",children:[l?(0,n.jsx)(o,{href:l,className:"preview-text",onMouseEnter:()=>i(!0),onMouseLeave:()=>i(!1),children:t}):(0,n.jsx)("div",{className:"preview-text",onMouseEnter:()=>i(!0),onMouseLeave:()=>i(!1),children:t}),s&&(c?(0,n.jsx)(n.Fragment,{}):(0,n.jsx)("div",{className:"preview-popup absolute mx-auto left-0 right-0 elevated rounded p-2 max-w-md h-fit bg-neutral-900",children:(0,n.jsx)("img",{src:a||"/dalle1.webp"})}))]})}},5434:function(e,t,a){"use strict";a.d(t,{default:function(){return o}});var n=a(22512),l=a(84992),s=a(72995),r=a(33202),i=e=>{let{min:t,max:a,value:l,labels:s,onChange:i,onSliderClick:o}=e;return(0,n.jsx)("div",{className:"w-full px-4 py-10",children:(0,n.jsx)(r.Z,{className:"h-2 w-full bg-neutral-400 rounded-md",thumbClassName:"w-4 h-4 bg-neutral-300 hover:bg-neutral-100 outline-none rounded-full -mt-1",trackClassName:"track",markClassName:"mark",marks:!0,min:t,max:a,value:l,step:1,alignTracks:!1,onSliderClick:o,onChange:e=>i&&i(e),renderThumb:(e,t)=>(0,n.jsx)("div",{...e,children:(0,n.jsx)("div",{className:"absolute w-fit text-nowrap -bottom-14 left-1/2 -translate-x-1/2 elevated px-2 py-1 rounded text-sm",children:s?(0,n.jsxs)("div",{className:"flex flex-col items-center",children:[(0,n.jsx)("span",{children:s[t.valueNow].year}),(0,n.jsx)("span",{children:s[t.valueNow].name})]}):t.valueNow})})})})},o=()=>{let e=(0,s.useRef)(null),t=(0,s.useRef)(null),[a,r]=s.useState(0),[o,c]=s.useState(!1),u=[{name:"DALL-E 1",date:new Date("2021-01-01"),image:"/dalle1.webp"},{name:"VQGAN-CLIP",date:new Date("2021-06-01"),image:"/vqgan-clip.webp"},{name:"DALL-E Mini",date:new Date("2021-07-01"),image:"/dalle-mini.webp"},{name:"Latent Diffusion",date:new Date("2021-12-01"),image:"/ldm.webp"},{name:"Midjourney v1",date:new Date("2022-02-01"),image:"/midjourney.webp"},{name:"DALL-E 2",date:new Date("2022-04-01"),image:"/dalle2.webp"},{name:"Parti",date:new Date("2022-06-22"),image:"/parti.webp"},{name:"Stable Diffusion",date:new Date("2022-08-22"),image:"/sd15.webp"},{name:"Imagen",date:new Date("2023-04-01"),image:"/imagen.webp"},{name:"DALL-E 3",date:new Date("2023-09-01"),image:"/dalle3.webp"},{name:"Flux",date:new Date("2024-08-01"),image:"/flux.webp"}];return s.useEffect(()=>{let e=u[a];if(e.image&&t.current){var n;let a=null===(n=t.current)||void 0===n?void 0:n.querySelector("img");a&&(a.src=e.image,a.alt=e.name)}},[a]),s.useEffect(()=>{if(o){let e=setTimeout(()=>{c(!1)},100);return()=>clearTimeout(e)}},[o]),s.useEffect(()=>{if(!o){let e=setTimeout(()=>{r((a+1)%u.length)},2e3);return()=>clearTimeout(e)}},[a,o]),(0,n.jsxs)("div",{ref:e,className:"flex flex-col w-full gap-4 p-4 items-center",children:[(0,n.jsx)(l.default,{ref:t,src:u[a].image||"/dalle1.webp",alt:"",width:256,height:256}),(0,n.jsx)(i,{min:0,max:u.length-1,value:a,onChange:e=>r(e),onSliderClick:()=>c(!0),labels:u.map(e=>({year:e.date.getFullYear(),name:e.name}))})]})}},15791:function(e,t,a){"use strict";a.r(t),a.d(t,{CopyCodeButton:function(){return i}});var n=a(22512),l=a(74695),s=a(52994),r=a(72995);function i(e){let{pre:t,className:a,...i}=e,[o,c]=(0,r.useState)(!1),[u,d]=(0,r.useState)("");(0,r.useEffect)(()=>{t&&r.isValidElement(t)&&t.props.dangerouslySetInnerHTML&&d(t.props.dangerouslySetInnerHTML.__html)},[t]);let m=async()=>{u&&(await navigator.clipboard.writeText(u.trim()),c(!0),setTimeout(()=>{c(!1)},1e3))};return(0,n.jsxs)("button",{className:"text-neutral-400 hover:text-neutral-200 cursor-pointer",disabled:o,onClick:m,"aria-label":"Copy",...i,children:[(0,n.jsx)("span",{className:"sr-only",children:"Copy"}),o?(0,n.jsx)(l.Z,{size:16,className:"text-green-300"}):(0,n.jsx)(s.Z,{size:16})]})}},80490:function(e,t,a){"use strict";a.d(t,{AllPosts:function(){return c}});var n=a(22512),l=a(30072),s=a(72995),r=a(40571),i=a.n(r),o=e=>{let{uniqueTags:t,selectedTag:a,setSelectedTag:l}=e;return(0,n.jsxs)("div",{className:"flex justify-end gap-2 mb-6 text-xs",children:[(0,n.jsx)("h2",{className:"text-neutral-300",children:"Filter tagged"}),(0,n.jsx)("div",{className:"flex gap-1",children:t.map(e=>(0,n.jsx)("button",{onClick:l.bind(null,e),className:"".concat(e===a?"bg-neutral-400 text-neutral-800":"bg-neutral-800 text-neutral-400"," elevated rounded-sm px-1 ").concat(i().className),children:e},e))})]})};function c(e){let{posts:t,tags:a}=e,[r,i]=s.useState("all"),[c,u]=s.useState(!1);s.useEffect(()=>{{let e=window.matchMedia("(max-width: 480px)");u(e.matches);let t=e=>{u(e.matches)};return e.addEventListener("change",t),()=>{e.removeEventListener("change",t)}}},[]);let d=s.useMemo(()=>{try{return"all"===r?t:t.filter(e=>{var t;return null===(t=e.metadata.tags)||void 0===t?void 0:t.includes(r)})}catch(e){return console.error("Error filtering posts:",e),[]}},[t,r]),m=s.useMemo(()=>{try{return[...d].sort((e,t)=>{let a=new Date(e.metadata.publishedAt);return new Date(t.metadata.publishedAt).getTime()-a.getTime()})}catch(e){return console.error("Error sorting posts:",e),d}},[d]);return(0,n.jsxs)("div",{children:[(0,n.jsx)(o,{uniqueTags:a,selectedTag:r,setSelectedTag:i}),(0,n.jsxs)("div",{className:"w-full flex flex-col gap-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg overflow-x-auto elevated p-4 pb-6",children:[(0,n.jsx)("h2",{className:"text-lg font-semibold tracking-tight",children:"Articles"}),m.map(e=>(0,n.jsx)(l.default,{className:"flex flex-col space-y-1",href:"/blog/".concat(e.slug),prefetch:!0,children:(0,n.jsxs)("div",{className:"grid grid-cols-3 gap-2",children:[(0,n.jsx)("p",{className:"text-neutral-600 dark:text-neutral-400",children:function(e){let t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],a=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=new Date;e.includes("T")||(e="".concat(e,"T00:00:00"));let l=new Date(e),s=n.getFullYear()-l.getFullYear(),r=n.getMonth()-l.getMonth(),i=n.getDate()-l.getDate(),o="";o=s>0?"".concat(s,"y ago"):r>0?"".concat(r,"mo ago"):i>0?"".concat(i,"d ago"):"Today";let c=l.toLocaleString("en-us",{month:a?"short":"long",day:"numeric",year:a?"2-digit":"numeric"});return t?"".concat(c," (").concat(o,")"):c}(e.metadata.publishedAt,!1,c)}),(0,n.jsx)("p",{className:"col-span-2 text-neutral-900 dark:text-neutral-200 dark:hover:text-neutral-100 tracking-tight",children:e.metadata.title})]})},e.slug))]})]})}},40571:function(e){e.exports={style:{fontFamily:"'__Inconsolata_262b13', '__Inconsolata_Fallback_262b13'",fontStyle:"normal"},className:"__className_262b13"}}},function(e){e.O(0,[706,375,522,29,21,104,744],function(){return e(e.s=6462)}),_N_E=e.O()}]);