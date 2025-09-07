const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/LobbyPage-Bj1UBIRf.js","assets/three-BQE6C20b.js","assets/vendor-CnEhrtKZ.js","assets/index-DpsEWzRx.js","assets/gameService-CS8lbNSt.js","assets/ui-Cda-PtV-.js","assets/CreateGamePage-BpEeNBkf.js","assets/JoinGamePage-CARWWTix.js","assets/GamePage-nfwfhyqv.js","assets/GameScene-CFPaSG5E.js","assets/ReplayPage-BiEJW7vj.js"])))=>i.map(i=>d[i]);
import{a as F,j as m,c as Ne}from"./three-BQE6C20b.js";import{r as c,R as Le,c as $}from"./vendor-CnEhrtKZ.js";import{c as _e,T as $e,C as Te}from"./ui-Cda-PtV-.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function r(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(n){if(n.ep)return;n.ep=!0;const o=r(n);fetch(n.href,o)}})();/**
 * @remix-run/router v1.23.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function B(){return B=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var a in r)Object.prototype.hasOwnProperty.call(r,a)&&(e[a]=r[a])}return e},B.apply(this,arguments)}var S;(function(e){e.Pop="POP",e.Push="PUSH",e.Replace="REPLACE"})(S||(S={}));const re="popstate";function ke(e){e===void 0&&(e={});function t(a,n){let{pathname:o,search:i,hash:l}=a.location;return Y("",{pathname:o,search:i,hash:l},n.state&&n.state.usr||null,n.state&&n.state.key||"default")}function r(a,n){return typeof n=="string"?n:pe(n)}return Ue(t,r,null,e)}function b(e,t){if(e===!1||e===null||typeof e>"u")throw new Error(t)}function de(e,t){if(!e){typeof console<"u"&&console.warn(t);try{throw new Error(t)}catch{}}}function Be(){return Math.random().toString(36).substr(2,8)}function ae(e,t){return{usr:e.state,key:e.key,idx:t}}function Y(e,t,r,a){return r===void 0&&(r=null),B({pathname:typeof e=="string"?e:e.pathname,search:"",hash:""},typeof t=="string"?k(t):t,{state:r,key:t&&t.key||a||Be()})}function pe(e){let{pathname:t="/",search:r="",hash:a=""}=e;return r&&r!=="?"&&(t+=r.charAt(0)==="?"?r:"?"+r),a&&a!=="#"&&(t+=a.charAt(0)==="#"?a:"#"+a),t}function k(e){let t={};if(e){let r=e.indexOf("#");r>=0&&(t.hash=e.substr(r),e=e.substr(0,r));let a=e.indexOf("?");a>=0&&(t.search=e.substr(a),e=e.substr(0,a)),e&&(t.pathname=e)}return t}function Ue(e,t,r,a){a===void 0&&(a={});let{window:n=document.defaultView,v5Compat:o=!1}=a,i=n.history,l=S.Pop,s=null,p=d();p==null&&(p=0,i.replaceState(B({},i.state,{idx:p}),""));function d(){return(i.state||{idx:null}).idx}function u(){l=S.Pop;let h=d(),E=h==null?null:h-p;p=h,s&&s({action:l,location:v.location,delta:E})}function f(h,E){l=S.Push;let C=Y(v.location,h,E);p=d()+1;let x=ae(C,p),O=v.createHref(C);try{i.pushState(x,"",O)}catch(H){if(H instanceof DOMException&&H.name==="DataCloneError")throw H;n.location.assign(O)}o&&s&&s({action:l,location:v.location,delta:1})}function g(h,E){l=S.Replace;let C=Y(v.location,h,E);p=d();let x=ae(C,p),O=v.createHref(C);i.replaceState(x,"",O),o&&s&&s({action:l,location:v.location,delta:0})}function y(h){let E=n.location.origin!=="null"?n.location.origin:n.location.href,C=typeof h=="string"?h:pe(h);return C=C.replace(/ $/,"%20"),b(E,"No window.location.(origin|href) available to create URL for href: "+C),new URL(C,E)}let v={get action(){return l},get location(){return e(n,i)},listen(h){if(s)throw new Error("A history only accepts one active listener");return n.addEventListener(re,u),s=h,()=>{n.removeEventListener(re,u),s=null}},createHref(h){return t(n,h)},createURL:y,encodeLocation(h){let E=y(h);return{pathname:E.pathname,search:E.search,hash:E.hash}},push:f,replace:g,go(h){return i.go(h)}};return v}var ne;(function(e){e.data="data",e.deferred="deferred",e.redirect="redirect",e.error="error"})(ne||(ne={}));function Fe(e,t,r){return r===void 0&&(r="/"),Me(e,t,r)}function Me(e,t,r,a){let n=typeof t=="string"?k(t):t,o=me(n.pathname||"/",r);if(o==null)return null;let i=fe(e);De(i);let l=null;for(let s=0;l==null&&s<i.length;++s){let p=Qe(o);l=Ke(i[s],p)}return l}function fe(e,t,r,a){t===void 0&&(t=[]),r===void 0&&(r=[]),a===void 0&&(a="");let n=(o,i,l)=>{let s={relativePath:l===void 0?o.path||"":l,caseSensitive:o.caseSensitive===!0,childrenIndex:i,route:o};s.relativePath.startsWith("/")&&(b(s.relativePath.startsWith(a),'Absolute route path "'+s.relativePath+'" nested under path '+('"'+a+'" is not valid. An absolute child route path ')+"must start with the combined path of all its parent routes."),s.relativePath=s.relativePath.slice(a.length));let p=_([a,s.relativePath]),d=r.concat(s);o.children&&o.children.length>0&&(b(o.index!==!0,"Index routes must not have child routes. Please remove "+('all child routes from route path "'+p+'".')),fe(o.children,t,d,p)),!(o.path==null&&!o.index)&&t.push({path:p,score:Ge(p,o.index),routesMeta:d})};return e.forEach((o,i)=>{var l;if(o.path===""||!((l=o.path)!=null&&l.includes("?")))n(o,i);else for(let s of he(o.path))n(o,i,s)}),t}function he(e){let t=e.split("/");if(t.length===0)return[];let[r,...a]=t,n=r.endsWith("?"),o=r.replace(/\?$/,"");if(a.length===0)return n?[o,""]:[o];let i=he(a.join("/")),l=[];return l.push(...i.map(s=>s===""?o:[o,s].join("/"))),n&&l.push(...i),l.map(s=>e.startsWith("/")&&s===""?"/":s)}function De(e){e.sort((t,r)=>t.score!==r.score?r.score-t.score:He(t.routesMeta.map(a=>a.childrenIndex),r.routesMeta.map(a=>a.childrenIndex)))}const Ae=/^:[\w-]+$/,ze=3,We=2,Ve=1,Je=10,qe=-2,ie=e=>e==="*";function Ge(e,t){let r=e.split("/"),a=r.length;return r.some(ie)&&(a+=qe),t&&(a+=We),r.filter(n=>!ie(n)).reduce((n,o)=>n+(Ae.test(o)?ze:o===""?Ve:Je),a)}function He(e,t){return e.length===t.length&&e.slice(0,-1).every((a,n)=>a===t[n])?e[e.length-1]-t[t.length-1]:0}function Ke(e,t,r){let{routesMeta:a}=e,n={},o="/",i=[];for(let l=0;l<a.length;++l){let s=a[l],p=l===a.length-1,d=o==="/"?t:t.slice(o.length)||"/",u=Ye({path:s.relativePath,caseSensitive:s.caseSensitive,end:p},d),f=s.route;if(!u)return null;Object.assign(n,u.params),i.push({params:n,pathname:_([o,u.pathname]),pathnameBase:nt(_([o,u.pathnameBase])),route:f}),u.pathnameBase!=="/"&&(o=_([o,u.pathnameBase]))}return i}function Ye(e,t){typeof e=="string"&&(e={path:e,caseSensitive:!1,end:!0});let[r,a]=Ze(e.path,e.caseSensitive,e.end),n=t.match(r);if(!n)return null;let o=n[0],i=o.replace(/(.)\/+$/,"$1"),l=n.slice(1);return{params:a.reduce((p,d,u)=>{let{paramName:f,isOptional:g}=d;if(f==="*"){let v=l[u]||"";i=o.slice(0,o.length-v.length).replace(/(.)\/+$/,"$1")}const y=l[u];return g&&!y?p[f]=void 0:p[f]=(y||"").replace(/%2F/g,"/"),p},{}),pathname:o,pathnameBase:i,pattern:e}}function Ze(e,t,r){t===void 0&&(t=!1),r===void 0&&(r=!0),de(e==="*"||!e.endsWith("*")||e.endsWith("/*"),'Route path "'+e+'" will be treated as if it were '+('"'+e.replace(/\*$/,"/*")+'" because the `*` character must ')+"always follow a `/` in the pattern. To get rid of this warning, "+('please change the route path to "'+e.replace(/\*$/,"/*")+'".'));let a=[],n="^"+e.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(i,l,s)=>(a.push({paramName:l,isOptional:s!=null}),s?"/?([^\\/]+)?":"/([^\\/]+)"));return e.endsWith("*")?(a.push({paramName:"*"}),n+=e==="*"||e==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):r?n+="\\/*$":e!==""&&e!=="/"&&(n+="(?:(?=\\/|$))"),[new RegExp(n,t?void 0:"i"),a]}function Qe(e){try{return e.split("/").map(t=>decodeURIComponent(t).replace(/\//g,"%2F")).join("/")}catch(t){return de(!1,'The URL path "'+e+'" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent '+("encoding ("+t+").")),e}}function me(e,t){if(t==="/")return e;if(!e.toLowerCase().startsWith(t.toLowerCase()))return null;let r=t.endsWith("/")?t.length-1:t.length,a=e.charAt(r);return a&&a!=="/"?null:e.slice(r)||"/"}function Xe(e,t){t===void 0&&(t="/");let{pathname:r,search:a="",hash:n=""}=typeof e=="string"?k(e):e;return{pathname:r?r.startsWith("/")?r:et(r,t):t,search:it(a),hash:ot(n)}}function et(e,t){let r=t.replace(/\/+$/,"").split("/");return e.split("/").forEach(n=>{n===".."?r.length>1&&r.pop():n!=="."&&r.push(n)}),r.length>1?r.join("/"):"/"}function K(e,t,r,a){return"Cannot include a '"+e+"' character in a manually specified "+("`to."+t+"` field ["+JSON.stringify(a)+"].  Please separate it out to the ")+("`to."+r+"` field. Alternatively you may provide the full path as ")+'a string in <Link to="..."> and the router will parse it for you.'}function tt(e){return e.filter((t,r)=>r===0||t.route.path&&t.route.path.length>0)}function rt(e,t){let r=tt(e);return t?r.map((a,n)=>n===r.length-1?a.pathname:a.pathnameBase):r.map(a=>a.pathnameBase)}function at(e,t,r,a){a===void 0&&(a=!1);let n;typeof e=="string"?n=k(e):(n=B({},e),b(!n.pathname||!n.pathname.includes("?"),K("?","pathname","search",n)),b(!n.pathname||!n.pathname.includes("#"),K("#","pathname","hash",n)),b(!n.search||!n.search.includes("#"),K("#","search","hash",n)));let o=e===""||n.pathname==="",i=o?"/":n.pathname,l;if(i==null)l=r;else{let u=t.length-1;if(!a&&i.startsWith("..")){let f=i.split("/");for(;f[0]==="..";)f.shift(),u-=1;n.pathname=f.join("/")}l=u>=0?t[u]:"/"}let s=Xe(n,l),p=i&&i!=="/"&&i.endsWith("/"),d=(o||i===".")&&r.endsWith("/");return!s.pathname.endsWith("/")&&(p||d)&&(s.pathname+="/"),s}const _=e=>e.join("/").replace(/\/\/+/g,"/"),nt=e=>e.replace(/\/+$/,"").replace(/^\/*/,"/"),it=e=>!e||e==="?"?"":e.startsWith("?")?e:"?"+e,ot=e=>!e||e==="#"?"":e.startsWith("#")?e:"#"+e;function st(e){return e!=null&&typeof e.status=="number"&&typeof e.statusText=="string"&&typeof e.internal=="boolean"&&"data"in e}const ge=["post","put","patch","delete"];new Set(ge);const lt=["get",...ge];new Set(lt);/**
 * React Router v6.30.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function U(){return U=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var a in r)Object.prototype.hasOwnProperty.call(r,a)&&(e[a]=r[a])}return e},U.apply(this,arguments)}const ee=c.createContext(null),ct=c.createContext(null),W=c.createContext(null),V=c.createContext(null),T=c.createContext({outlet:null,matches:[],isDataRoute:!1}),ve=c.createContext(null);function J(){return c.useContext(V)!=null}function ye(){return J()||b(!1),c.useContext(V).location}function xe(e){c.useContext(W).static||c.useLayoutEffect(e)}function Nr(){let{isDataRoute:e}=c.useContext(T);return e?wt():ut()}function ut(){J()||b(!1);let e=c.useContext(ee),{basename:t,future:r,navigator:a}=c.useContext(W),{matches:n}=c.useContext(T),{pathname:o}=ye(),i=JSON.stringify(rt(n,r.v7_relativeSplatPath)),l=c.useRef(!1);return xe(()=>{l.current=!0}),c.useCallback(function(p,d){if(d===void 0&&(d={}),!l.current)return;if(typeof p=="number"){a.go(p);return}let u=at(p,JSON.parse(i),o,d.relative==="path");e==null&&t!=="/"&&(u.pathname=u.pathname==="/"?t:_([t,u.pathname])),(d.replace?a.replace:a.push)(u,d.state,d)},[t,a,i,o,e])}function Lr(){let{matches:e}=c.useContext(T),t=e[e.length-1];return t?t.params:{}}function dt(e,t){return pt(e,t)}function pt(e,t,r,a){J()||b(!1);let{navigator:n}=c.useContext(W),{matches:o}=c.useContext(T),i=o[o.length-1],l=i?i.params:{};i&&i.pathname;let s=i?i.pathnameBase:"/";i&&i.route;let p=ye(),d;if(t){var u;let h=typeof t=="string"?k(t):t;s==="/"||(u=h.pathname)!=null&&u.startsWith(s)||b(!1),d=h}else d=p;let f=d.pathname||"/",g=f;if(s!=="/"){let h=s.replace(/^\//,"").split("/");g="/"+f.replace(/^\//,"").split("/").slice(h.length).join("/")}let y=Fe(e,{pathname:g}),v=vt(y&&y.map(h=>Object.assign({},h,{params:Object.assign({},l,h.params),pathname:_([s,n.encodeLocation?n.encodeLocation(h.pathname).pathname:h.pathname]),pathnameBase:h.pathnameBase==="/"?s:_([s,n.encodeLocation?n.encodeLocation(h.pathnameBase).pathname:h.pathnameBase])})),o,r,a);return t&&v?c.createElement(V.Provider,{value:{location:U({pathname:"/",search:"",hash:"",state:null,key:"default"},d),navigationType:S.Pop}},v):v}function ft(){let e=Et(),t=st(e)?e.status+" "+e.statusText:e instanceof Error?e.message:JSON.stringify(e),r=e instanceof Error?e.stack:null,n={padding:"0.5rem",backgroundColor:"rgba(200,200,200, 0.5)"};return c.createElement(c.Fragment,null,c.createElement("h2",null,"Unexpected Application Error!"),c.createElement("h3",{style:{fontStyle:"italic"}},t),r?c.createElement("pre",{style:n},r):null,null)}const ht=c.createElement(ft,null);class mt extends c.Component{constructor(t){super(t),this.state={location:t.location,revalidation:t.revalidation,error:t.error}}static getDerivedStateFromError(t){return{error:t}}static getDerivedStateFromProps(t,r){return r.location!==t.location||r.revalidation!=="idle"&&t.revalidation==="idle"?{error:t.error,location:t.location,revalidation:t.revalidation}:{error:t.error!==void 0?t.error:r.error,location:r.location,revalidation:t.revalidation||r.revalidation}}componentDidCatch(t,r){console.error("React Router caught the following error during render",t,r)}render(){return this.state.error!==void 0?c.createElement(T.Provider,{value:this.props.routeContext},c.createElement(ve.Provider,{value:this.state.error,children:this.props.component})):this.props.children}}function gt(e){let{routeContext:t,match:r,children:a}=e,n=c.useContext(ee);return n&&n.static&&n.staticContext&&(r.route.errorElement||r.route.ErrorBoundary)&&(n.staticContext._deepestRenderedBoundaryId=r.route.id),c.createElement(T.Provider,{value:t},a)}function vt(e,t,r,a){var n;if(t===void 0&&(t=[]),r===void 0&&(r=null),a===void 0&&(a=null),e==null){var o;if(!r)return null;if(r.errors)e=r.matches;else if((o=a)!=null&&o.v7_partialHydration&&t.length===0&&!r.initialized&&r.matches.length>0)e=r.matches;else return null}let i=e,l=(n=r)==null?void 0:n.errors;if(l!=null){let d=i.findIndex(u=>u.route.id&&(l==null?void 0:l[u.route.id])!==void 0);d>=0||b(!1),i=i.slice(0,Math.min(i.length,d+1))}let s=!1,p=-1;if(r&&a&&a.v7_partialHydration)for(let d=0;d<i.length;d++){let u=i[d];if((u.route.HydrateFallback||u.route.hydrateFallbackElement)&&(p=d),u.route.id){let{loaderData:f,errors:g}=r,y=u.route.loader&&f[u.route.id]===void 0&&(!g||g[u.route.id]===void 0);if(u.route.lazy||y){s=!0,p>=0?i=i.slice(0,p+1):i=[i[0]];break}}}return i.reduceRight((d,u,f)=>{let g,y=!1,v=null,h=null;r&&(g=l&&u.route.id?l[u.route.id]:void 0,v=u.route.errorElement||ht,s&&(p<0&&f===0?(Ct("route-fallback"),y=!0,h=null):p===f&&(y=!0,h=u.route.hydrateFallbackElement||null)));let E=t.concat(i.slice(0,f+1)),C=()=>{let x;return g?x=v:y?x=h:u.route.Component?x=c.createElement(u.route.Component,null):u.route.element?x=u.route.element:x=d,c.createElement(gt,{match:u,routeContext:{outlet:d,matches:E,isDataRoute:r!=null},children:x})};return r&&(u.route.ErrorBoundary||u.route.errorElement||f===0)?c.createElement(mt,{location:r.location,revalidation:r.revalidation,component:v,error:g,children:C(),routeContext:{outlet:null,matches:E,isDataRoute:!0}}):C()},null)}var be=function(e){return e.UseBlocker="useBlocker",e.UseRevalidator="useRevalidator",e.UseNavigateStable="useNavigate",e}(be||{}),Ee=function(e){return e.UseBlocker="useBlocker",e.UseLoaderData="useLoaderData",e.UseActionData="useActionData",e.UseRouteError="useRouteError",e.UseNavigation="useNavigation",e.UseRouteLoaderData="useRouteLoaderData",e.UseMatches="useMatches",e.UseRevalidator="useRevalidator",e.UseNavigateStable="useNavigate",e.UseRouteId="useRouteId",e}(Ee||{});function yt(e){let t=c.useContext(ee);return t||b(!1),t}function xt(e){let t=c.useContext(ct);return t||b(!1),t}function bt(e){let t=c.useContext(T);return t||b(!1),t}function we(e){let t=bt(),r=t.matches[t.matches.length-1];return r.route.id||b(!1),r.route.id}function Et(){var e;let t=c.useContext(ve),r=xt(),a=we();return t!==void 0?t:(e=r.errors)==null?void 0:e[a]}function wt(){let{router:e}=yt(be.UseNavigateStable),t=we(Ee.UseNavigateStable),r=c.useRef(!1);return xe(()=>{r.current=!0}),c.useCallback(function(n,o){o===void 0&&(o={}),r.current&&(typeof n=="number"?e.navigate(n):e.navigate(n,U({fromRouteId:t},o)))},[e,t])}const oe={};function Ct(e,t,r){oe[e]||(oe[e]=!0)}function Pt(e,t){e==null||e.v7_startTransition,e==null||e.v7_relativeSplatPath}function L(e){b(!1)}function jt(e){let{basename:t="/",children:r=null,location:a,navigationType:n=S.Pop,navigator:o,static:i=!1,future:l}=e;J()&&b(!1);let s=t.replace(/^\/*/,"/"),p=c.useMemo(()=>({basename:s,navigator:o,static:i,future:U({v7_relativeSplatPath:!1},l)}),[s,l,o,i]);typeof a=="string"&&(a=k(a));let{pathname:d="/",search:u="",hash:f="",state:g=null,key:y="default"}=a,v=c.useMemo(()=>{let h=me(d,s);return h==null?null:{location:{pathname:h,search:u,hash:f,state:g,key:y},navigationType:n}},[s,d,u,f,g,y,n]);return v==null?null:c.createElement(W.Provider,{value:p},c.createElement(V.Provider,{children:r,value:v}))}function Rt(e){let{children:t,location:r}=e;return dt(Z(t),r)}new Promise(()=>{});function Z(e,t){t===void 0&&(t=[]);let r=[];return c.Children.forEach(e,(a,n)=>{if(!c.isValidElement(a))return;let o=[...t,n];if(a.type===c.Fragment){r.push.apply(r,Z(a.props.children,o));return}a.type!==L&&b(!1),!a.props.index||!a.props.children||b(!1);let i={id:a.props.id||o.join("-"),caseSensitive:a.props.caseSensitive,element:a.props.element,Component:a.props.Component,index:a.props.index,path:a.props.path,loader:a.props.loader,action:a.props.action,errorElement:a.props.errorElement,ErrorBoundary:a.props.ErrorBoundary,hasErrorBoundary:a.props.ErrorBoundary!=null||a.props.errorElement!=null,shouldRevalidate:a.props.shouldRevalidate,handle:a.props.handle,lazy:a.props.lazy};a.props.children&&(i.children=Z(a.props.children,o)),r.push(i)}),r}/**
 * React Router DOM v6.30.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const Ot="6";try{window.__reactRouterVersion=Ot}catch{}const It="startTransition",se=Le[It];function St(e){let{basename:t,children:r,future:a,window:n}=e,o=c.useRef();o.current==null&&(o.current=ke({window:n,v5Compat:!0}));let i=o.current,[l,s]=c.useState({action:i.action,location:i.location}),{v7_startTransition:p}=a||{},d=c.useCallback(u=>{p&&se?se(()=>s(u)):s(u)},[s,p]);return c.useLayoutEffect(()=>i.listen(d),[i,d]),c.useEffect(()=>Pt(a),[a]),c.createElement(jt,{basename:t,children:r,location:l.location,navigationType:l.action,navigator:i,future:a})}var le;(function(e){e.UseScrollRestoration="useScrollRestoration",e.UseSubmit="useSubmit",e.UseSubmitFetcher="useSubmitFetcher",e.UseFetcher="useFetcher",e.useViewTransitionState="useViewTransitionState"})(le||(le={}));var ce;(function(e){e.UseFetcher="useFetcher",e.UseFetchers="useFetchers",e.UseScrollRestoration="useScrollRestoration"})(ce||(ce={}));let Nt={data:""},Lt=e=>typeof window=="object"?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||Nt,_t=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,$t=/\/\*[^]*?\*\/|  +/g,ue=/\n+/g,I=(e,t)=>{let r="",a="",n="";for(let o in e){let i=e[o];o[0]=="@"?o[1]=="i"?r=o+" "+i+";":a+=o[1]=="f"?I(i,o):o+"{"+I(i,o[1]=="k"?"":t)+"}":typeof i=="object"?a+=I(i,t?t.replace(/([^,])+/g,l=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,s=>/&/.test(s)?s.replace(/&/g,l):l?l+" "+s:s)):o):i!=null&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),n+=I.p?I.p(o,i):o+":"+i+";")}return r+(t&&n?t+"{"+n+"}":n)+a},j={},Ce=e=>{if(typeof e=="object"){let t="";for(let r in e)t+=r+Ce(e[r]);return t}return e},Tt=(e,t,r,a,n)=>{let o=Ce(e),i=j[o]||(j[o]=(s=>{let p=0,d=11;for(;p<s.length;)d=101*d+s.charCodeAt(p++)>>>0;return"go"+d})(o));if(!j[i]){let s=o!==e?e:(p=>{let d,u,f=[{}];for(;d=_t.exec(p.replace($t,""));)d[4]?f.shift():d[3]?(u=d[3].replace(ue," ").trim(),f.unshift(f[0][u]=f[0][u]||{})):f[0][d[1]]=d[2].replace(ue," ").trim();return f[0]})(e);j[i]=I(n?{["@keyframes "+i]:s}:s,r?"":"."+i)}let l=r&&j.g?j.g:null;return r&&(j.g=j[i]),((s,p,d,u)=>{u?p.data=p.data.replace(u,s):p.data.indexOf(s)===-1&&(p.data=d?s+p.data:p.data+s)})(j[i],t,a,l),i},kt=(e,t,r)=>e.reduce((a,n,o)=>{let i=t[o];if(i&&i.call){let l=i(r),s=l&&l.props&&l.props.className||/^go/.test(l)&&l;i=s?"."+s:l&&typeof l=="object"?l.props?"":I(l,""):l===!1?"":l}return a+n+(i??"")},"");function q(e){let t=this||{},r=e.call?e(t.p):e;return Tt(r.unshift?r.raw?kt(r,[].slice.call(arguments,1),t.p):r.reduce((a,n)=>Object.assign(a,n&&n.call?n(t.p):n),{}):r,Lt(t.target),t.g,t.o,t.k)}let Pe,Q,X;q.bind({g:1});let R=q.bind({k:1});function Bt(e,t,r,a){I.p=t,Pe=e,Q=r,X=a}function N(e,t){let r=this||{};return function(){let a=arguments;function n(o,i){let l=Object.assign({},o),s=l.className||n.className;r.p=Object.assign({theme:Q&&Q()},l),r.o=/ *go\d+/.test(s),l.className=q.apply(r,a)+(s?" "+s:"");let p=e;return e[0]&&(p=l.as||e,delete l.as),X&&p[0]&&X(l),Pe(p,l)}return n}}var Ut=e=>typeof e=="function",z=(e,t)=>Ut(e)?e(t):e,Ft=(()=>{let e=0;return()=>(++e).toString()})(),je=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),Mt=20,te="default",Re=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(i=>i.id===t.toast.id?{...i,...t.toast}:i)};case 2:let{toast:a}=t;return Re(e,{type:e.toasts.find(i=>i.id===a.id)?1:0,toast:a});case 3:let{toastId:n}=t;return{...e,toasts:e.toasts.map(i=>i.id===n||n===void 0?{...i,dismissed:!0,visible:!1}:i)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(i=>i.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(i=>({...i,pauseDuration:i.pauseDuration+o}))}}},A=[],Oe={toasts:[],pausedAt:void 0,settings:{toastLimit:Mt}},P={},Ie=(e,t=te)=>{P[t]=Re(P[t]||Oe,e),A.forEach(([r,a])=>{r===t&&a(P[t])})},Se=e=>Object.keys(P).forEach(t=>Ie(e,t)),Dt=e=>Object.keys(P).find(t=>P[t].toasts.some(r=>r.id===e)),G=(e=te)=>t=>{Ie(t,e)},At={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},zt=(e={},t=te)=>{let[r,a]=c.useState(P[t]||Oe),n=c.useRef(P[t]);c.useEffect(()=>(n.current!==P[t]&&a(P[t]),A.push([t,a]),()=>{let i=A.findIndex(([l])=>l===t);i>-1&&A.splice(i,1)}),[t]);let o=r.toasts.map(i=>{var l,s,p;return{...e,...e[i.type],...i,removeDelay:i.removeDelay||((l=e[i.type])==null?void 0:l.removeDelay)||(e==null?void 0:e.removeDelay),duration:i.duration||((s=e[i.type])==null?void 0:s.duration)||(e==null?void 0:e.duration)||At[i.type],style:{...e.style,...(p=e[i.type])==null?void 0:p.style,...i.style}}});return{...r,toasts:o}},Wt=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(r==null?void 0:r.id)||Ft()}),M=e=>(t,r)=>{let a=Wt(t,e,r);return G(a.toasterId||Dt(a.id))({type:2,toast:a}),a.id},w=(e,t)=>M("blank")(e,t);w.error=M("error");w.success=M("success");w.loading=M("loading");w.custom=M("custom");w.dismiss=(e,t)=>{let r={type:3,toastId:e};t?G(t)(r):Se(r)};w.dismissAll=e=>w.dismiss(void 0,e);w.remove=(e,t)=>{let r={type:4,toastId:e};t?G(t)(r):Se(r)};w.removeAll=e=>w.remove(void 0,e);w.promise=(e,t,r)=>{let a=w.loading(t.loading,{...r,...r==null?void 0:r.loading});return typeof e=="function"&&(e=e()),e.then(n=>{let o=t.success?z(t.success,n):void 0;return o?w.success(o,{id:a,...r,...r==null?void 0:r.success}):w.dismiss(a),n}).catch(n=>{let o=t.error?z(t.error,n):void 0;o?w.error(o,{id:a,...r,...r==null?void 0:r.error}):w.dismiss(a)}),e};var Vt=1e3,Jt=(e,t="default")=>{let{toasts:r,pausedAt:a}=zt(e,t),n=c.useRef(new Map).current,o=c.useCallback((u,f=Vt)=>{if(n.has(u))return;let g=setTimeout(()=>{n.delete(u),i({type:4,toastId:u})},f);n.set(u,g)},[]);c.useEffect(()=>{if(a)return;let u=Date.now(),f=r.map(g=>{if(g.duration===1/0)return;let y=(g.duration||0)+g.pauseDuration-(u-g.createdAt);if(y<0){g.visible&&w.dismiss(g.id);return}return setTimeout(()=>w.dismiss(g.id,t),y)});return()=>{f.forEach(g=>g&&clearTimeout(g))}},[r,a,t]);let i=c.useCallback(G(t),[t]),l=c.useCallback(()=>{i({type:5,time:Date.now()})},[i]),s=c.useCallback((u,f)=>{i({type:1,toast:{id:u,height:f}})},[i]),p=c.useCallback(()=>{a&&i({type:6,time:Date.now()})},[a,i]),d=c.useCallback((u,f)=>{let{reverseOrder:g=!1,gutter:y=8,defaultPosition:v}=f||{},h=r.filter(x=>(x.position||v)===(u.position||v)&&x.height),E=h.findIndex(x=>x.id===u.id),C=h.filter((x,O)=>O<E&&x.visible).length;return h.filter(x=>x.visible).slice(...g?[C+1]:[0,C]).reduce((x,O)=>x+(O.height||0)+y,0)},[r]);return c.useEffect(()=>{r.forEach(u=>{if(u.dismissed)o(u.id,u.removeDelay);else{let f=n.get(u.id);f&&(clearTimeout(f),n.delete(u.id))}})},[r,o]),{toasts:r,handlers:{updateHeight:s,startPause:l,endPause:p,calculateOffset:d}}},qt=R`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,Gt=R`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Ht=R`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,Kt=N("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${qt} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${Gt} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${Ht} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,Yt=R`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,Zt=N("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${Yt} 1s linear infinite;
`,Qt=R`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Xt=R`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,er=N("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Qt} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Xt} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,tr=N("div")`
  position: absolute;
`,rr=N("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ar=R`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,nr=N("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ar} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,ir=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return t!==void 0?typeof t=="string"?c.createElement(nr,null,t):t:r==="blank"?null:c.createElement(rr,null,c.createElement(Zt,{...a}),r!=="loading"&&c.createElement(tr,null,r==="error"?c.createElement(Kt,{...a}):c.createElement(er,{...a})))},or=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,sr=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,lr="0%{opacity:0;} 100%{opacity:1;}",cr="0%{opacity:1;} 100%{opacity:0;}",ur=N("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,dr=N("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,pr=(e,t)=>{let r=e.includes("top")?1:-1,[a,n]=je()?[lr,cr]:[or(r),sr(r)];return{animation:t?`${R(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${R(n)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},fr=c.memo(({toast:e,position:t,style:r,children:a})=>{let n=e.height?pr(e.position||t||"top-center",e.visible):{opacity:0},o=c.createElement(ir,{toast:e}),i=c.createElement(dr,{...e.ariaProps},z(e.message,e));return c.createElement(ur,{className:e.className,style:{...n,...r,...e.style}},typeof a=="function"?a({icon:o,message:i}):c.createElement(c.Fragment,null,o,i))});Bt(c.createElement);var hr=({id:e,className:t,style:r,onHeightUpdate:a,children:n})=>{let o=c.useCallback(i=>{if(i){let l=()=>{let s=i.getBoundingClientRect().height;a(e,s)};l(),new MutationObserver(l).observe(i,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return c.createElement("div",{ref:o,className:t,style:r},n)},mr=(e,t)=>{let r=e.includes("top"),a=r?{top:0}:{bottom:0},n=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:je()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...a,...n}},gr=q`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,D=16,vr=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:n,toasterId:o,containerStyle:i,containerClassName:l})=>{let{toasts:s,handlers:p}=Jt(r,o);return c.createElement("div",{"data-rht-toaster":o||"",style:{position:"fixed",zIndex:9999,top:D,left:D,right:D,bottom:D,pointerEvents:"none",...i},className:l,onMouseEnter:p.startPause,onMouseLeave:p.endPause},s.map(d=>{let u=d.position||t,f=p.calculateOffset(d,{reverseOrder:e,gutter:a,defaultPosition:t}),g=mr(u,f);return c.createElement(hr,{id:d.id,key:d.id,onHeightUpdate:p.updateHeight,className:d.visible?gr:"",style:g},d.type==="custom"?z(d.message,d):n?n(d):c.createElement(fr,{toast:d,position:u}))}))};const yr=$.lazy(()=>F(()=>import("./LobbyPage-Bj1UBIRf.js"),__vite__mapDeps([0,1,2,3,4,5]))),xr=$.lazy(()=>F(()=>import("./CreateGamePage-BpEeNBkf.js"),__vite__mapDeps([6,1,2,4,5]))),br=$.lazy(()=>F(()=>import("./JoinGamePage-CARWWTix.js"),__vite__mapDeps([7,1,2,4,5]))),Er=$.lazy(()=>F(()=>import("./GamePage-nfwfhyqv.js"),__vite__mapDeps([8,1,2,9,3,4,5]))),wr=$.lazy(()=>F(()=>import("./ReplayPage-BiEJW7vj.js"),__vite__mapDeps([10,1,2,9,3,4,5]))),Cr=()=>m.jsx("div",{className:"min-h-screen flex items-center justify-center",children:m.jsxs("div",{className:"text-center",children:[m.jsx("div",{className:"loading-spinner mx-auto mb-4"}),m.jsx("h2",{className:"text-xl font-semibold text-white",children:"Loading TI Chess..."}),m.jsx("p",{className:"text-white/80 mt-2",children:"Preparing your strategic experience"})]})});class Pr extends $.Component{constructor(t){super(t),this.state={hasError:!1,error:null}}static getDerivedStateFromError(t){return{hasError:!0,error:t}}componentDidCatch(t,r){console.error("Application error:",t,r)}render(){return this.state.hasError?m.jsx("div",{className:"min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700",children:m.jsxs("div",{className:"text-center text-white p-8 max-w-md",children:[m.jsx("h1",{className:"text-3xl font-bold mb-4",children:"Oops! Something went wrong"}),m.jsx("p",{className:"text-lg mb-6 opacity-90",children:"We encountered an unexpected error. Please refresh the page and try again."}),m.jsx("button",{onClick:()=>window.location.reload(),className:"bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors",children:"Reload Page"}),!1]})}):this.props.children}}const jr=_e({palette:{mode:"light",primary:{main:"#667eea",light:"#8fa4f3",dark:"#4c63d2"},secondary:{main:"#764ba2",light:"#9575cd",dark:"#5e35b1"},background:{default:"transparent",paper:"rgba(255, 255, 255, 0.95)"}},typography:{fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"},components:{MuiCssBaseline:{styleOverrides:{body:{background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",minHeight:"100vh"}}},MuiPaper:{styleOverrides:{root:{backdropFilter:"blur(10px)"}}},MuiButton:{styleOverrides:{root:{textTransform:"none",borderRadius:"8px",padding:"12px 24px",fontWeight:600}}}}}),Rr=()=>m.jsx(Pr,{children:m.jsxs($e,{theme:jr,children:[m.jsx(Te,{}),m.jsx(St,{children:m.jsx(c.Suspense,{fallback:m.jsx(Cr,{}),children:m.jsxs(Rt,{children:[m.jsx(L,{path:"/",element:m.jsx(yr,{})}),m.jsx(L,{path:"/create",element:m.jsx(xr,{})}),m.jsx(L,{path:"/join/:gameId?",element:m.jsx(br,{})}),m.jsx(L,{path:"/play/:gameId",element:m.jsx(Er,{})}),m.jsx(L,{path:"/replay/:gameId",element:m.jsx(wr,{})}),m.jsx(L,{path:"*",element:m.jsx("div",{className:"min-h-screen flex items-center justify-center",children:m.jsxs("div",{className:"text-center text-white",children:[m.jsx("h1",{className:"text-4xl font-bold mb-4",children:"404"}),m.jsx("p",{className:"text-xl mb-6",children:"Page not found"}),m.jsx("a",{href:"/",className:"bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors",children:"Return to Lobby"})]})})})]})})}),m.jsx(vr,{position:"top-right",toastOptions:{duration:4e3,style:{background:"rgba(255, 255, 255, 0.95)",backdropFilter:"blur(10px)",border:"1px solid rgba(102, 126, 234, 0.2)",borderRadius:"8px"},success:{iconTheme:{primary:"#4ecdc4",secondary:"#fff"}},error:{iconTheme:{primary:"#ff6b6b",secondary:"#fff"}}}})]})});Ne.createRoot(document.getElementById("root")).render(m.jsx($.StrictMode,{children:m.jsx(Rr,{})}));export{Lr as a,ye as b,w as n,Nr as u};
//# sourceMappingURL=index-Cx1_nSxO.js.map
