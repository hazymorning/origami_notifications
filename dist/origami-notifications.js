var ci="1.6.0";var It=globalThis,Pt=It.ShadowRoot&&(It.ShadyCSS===void 0||It.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Se=Symbol(),li=new WeakMap,wt=class{constructor(t,e,n){if(this._$cssResult$=!0,n!==Se)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(Pt&&t===void 0){let n=e!==void 0&&e.length===1;n&&(t=li.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&li.set(e,t))}return t}toString(){return this.cssText}},Lt=i=>new wt(typeof i=="string"?i:i+"",void 0,Se),L=(i,...t)=>{let e=i.length===1?i[0]:t.reduce((n,s,o)=>n+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[o+1],i[0]);return new wt(e,i,Se)},zt=(i,t)=>{if(Pt)i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let n=document.createElement("style"),s=It.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=e.cssText,i.appendChild(n)}},Ee=Pt?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(let n of t.cssRules)e+=n.cssText;return Lt(e)})(i):i;var{is:rs,defineProperty:cs,getOwnPropertyDescriptor:ls,getOwnPropertyNames:ds,getOwnPropertySymbols:hs,getPrototypeOf:us}=Object,Ut=globalThis,di=Ut.trustedTypes,ps=di?di.emptyScript:"",ms=Ut.reactiveElementPolyfillSupport,vt=(i,t)=>i,Te={toAttribute(i,t){switch(t){case Boolean:i=i?ps:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},ui=(i,t)=>!rs(i,t),hi={attribute:!0,type:String,converter:Te,reflect:!1,useDefault:!1,hasChanged:ui};Symbol.metadata??=Symbol("metadata"),Ut.litPropertyMetadata??=new WeakMap;var W=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=hi){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let n=Symbol(),s=this.getPropertyDescriptor(t,n,e);s!==void 0&&cs(this.prototype,t,s)}}static getPropertyDescriptor(t,e,n){let{get:s,set:o}=ls(this.prototype,t)??{get(){return this[e]},set(a){this[e]=a}};return{get:s,set(a){let r=s?.call(this);o?.call(this,a),this.requestUpdate(t,r,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??hi}static _$Ei(){if(this.hasOwnProperty(vt("elementProperties")))return;let t=us(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(vt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(vt("properties"))){let e=this.properties,n=[...ds(e),...hs(e)];for(let s of n)this.createProperty(s,e[s])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[n,s]of e)this.elementProperties.set(n,s)}this._$Eh=new Map;for(let[e,n]of this.elementProperties){let s=this._$Eu(e,n);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let s of n)e.unshift(Ee(s))}else t!==void 0&&e.push(Ee(t));return e}static _$Eu(t,e){let n=e.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let n of e.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return zt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,n){this._$AK(t,n)}_$ET(t,e){let n=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,n);if(s!==void 0&&n.reflect===!0){let o=(n.converter?.toAttribute!==void 0?n.converter:Te).toAttribute(e,n.type);this._$Em=t,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){let n=this.constructor,s=n._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let o=n.getPropertyOptions(s),a=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:Te;this._$Em=s;let r=a.fromAttribute(e,o.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(t,e,n,s=!1,o){if(t!==void 0){let a=this.constructor;if(s===!1&&(o=this[t]),n??=a.getPropertyOptions(t),!((n.hasChanged??ui)(o,e)||n.useDefault&&n.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,n))))return;this.C(t,e,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:n,reflect:s,wrapped:o},a){n&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,a??e??this[t]),o!==!0||a!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[s,o]of n){let{wrapped:a}=o,r=this[s];a!==!0||this._$AL.has(s)||r===void 0||this.C(s,void 0,o,r)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(e)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};W.elementStyles=[],W.shadowRootOptions={mode:"open"},W[vt("elementProperties")]=new Map,W[vt("finalized")]=new Map,ms?.({ReactiveElement:W}),(Ut.reactiveElementVersions??=[]).push("2.1.2");var Oe=globalThis,pi=i=>i,Bt=Oe.trustedTypes,mi=Bt?Bt.createPolicy("lit-html",{createHTML:i=>i}):void 0,Ne="$lit$",q=`lit$${Math.random().toFixed(9).slice(2)}$`,Me="?"+q,fs=`<${Me}>`,st=document,$t=()=>st.createComment(""),xt=i=>i===null||typeof i!="object"&&typeof i!="function",De=Array.isArray,wi=i=>De(i)||typeof i?.[Symbol.iterator]=="function",Ce=`[ 	
\f\r]`,kt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,fi=/-->/g,_i=/>/g,it=RegExp(`>|${Ce}(?:([^\\s"'>=/]+)(${Ce}*=${Ce}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),gi=/'/g,yi=/"/g,vi=/^(?:script|style|textarea|title)$/i,Re=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),y=Re(1),ua=Re(2),pa=Re(3),I=Symbol.for("lit-noChange"),g=Symbol.for("lit-nothing"),bi=new WeakMap,nt=st.createTreeWalker(st,129);function ki(i,t){if(!De(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return mi!==void 0?mi.createHTML(t):t}var $i=(i,t)=>{let e=i.length-1,n=[],s,o=t===2?"<svg>":t===3?"<math>":"",a=kt;for(let r=0;r<e;r++){let c=i[r],l,d,h=-1,u=0;for(;u<c.length&&(a.lastIndex=u,d=a.exec(c),d!==null);)u=a.lastIndex,a===kt?d[1]==="!--"?a=fi:d[1]!==void 0?a=_i:d[2]!==void 0?(vi.test(d[2])&&(s=RegExp("</"+d[2],"g")),a=it):d[3]!==void 0&&(a=it):a===it?d[0]===">"?(a=s??kt,h=-1):d[1]===void 0?h=-2:(h=a.lastIndex-d[2].length,l=d[1],a=d[3]===void 0?it:d[3]==='"'?yi:gi):a===yi||a===gi?a=it:a===fi||a===_i?a=kt:(a=it,s=void 0);let p=a===it&&i[r+1].startsWith("/>")?" ":"";o+=a===kt?c+fs:h>=0?(n.push(l),c.slice(0,h)+Ne+c.slice(h)+q+p):c+q+(h===-2?r:p)}return[ki(i,o+(i[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},At=class i{constructor({strings:t,_$litType$:e},n){let s;this.parts=[];let o=0,a=0,r=t.length-1,c=this.parts,[l,d]=$i(t,e);if(this.el=i.createElement(l,n),nt.currentNode=this.el.content,e===2||e===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(s=nt.nextNode())!==null&&c.length<r;){if(s.nodeType===1){if(s.hasAttributes())for(let h of s.getAttributeNames())if(h.endsWith(Ne)){let u=d[a++],p=s.getAttribute(h).split(q),f=/([.?@])?(.*)/.exec(u);c.push({type:1,index:o,name:f[2],strings:p,ctor:f[1]==="."?Ht:f[1]==="?"?Wt:f[1]==="@"?qt:at}),s.removeAttribute(h)}else h.startsWith(q)&&(c.push({type:6,index:o}),s.removeAttribute(h));if(vi.test(s.tagName)){let h=s.textContent.split(q),u=h.length-1;if(u>0){s.textContent=Bt?Bt.emptyScript:"";for(let p=0;p<u;p++)s.append(h[p],$t()),nt.nextNode(),c.push({type:2,index:++o});s.append(h[u],$t())}}}else if(s.nodeType===8)if(s.data===Me)c.push({type:2,index:o});else{let h=-1;for(;(h=s.data.indexOf(q,h+1))!==-1;)c.push({type:7,index:o}),h+=q.length-1}o++}}static createElement(t,e){let n=st.createElement("template");return n.innerHTML=t,n}};function ot(i,t,e=i,n){if(t===I)return t;let s=n!==void 0?e._$Co?.[n]:e._$Cl,o=xt(t)?void 0:t._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(i),s._$AT(i,e,n)),n!==void 0?(e._$Co??=[])[n]=s:e._$Cl=s),s!==void 0&&(t=ot(i,s._$AS(i,t.values),s,n)),t}var jt=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:n}=this._$AD,s=(t?.creationScope??st).importNode(e,!0);nt.currentNode=s;let o=nt.nextNode(),a=0,r=0,c=n[0];for(;c!==void 0;){if(a===c.index){let l;c.type===2?l=new dt(o,o.nextSibling,this,t):c.type===1?l=new c.ctor(o,c.name,c.strings,this,t):c.type===6&&(l=new Ft(o,this,t)),this._$AV.push(l),c=n[++r]}a!==c?.index&&(o=nt.nextNode(),a++)}return nt.currentNode=st,s}p(t){let e=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,e),e+=n.strings.length-2):n._$AI(t[e])),e++}},dt=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,n,s){this.type=2,this._$AH=g,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=n,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=ot(this,t,e),xt(t)?t===g||t==null||t===""?(this._$AH!==g&&this._$AR(),this._$AH=g):t!==this._$AH&&t!==I&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):wi(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==g&&xt(this._$AH)?this._$AA.nextSibling.data=t:this.T(st.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:n}=t,s=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=At.createElement(ki(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===s)this._$AH.p(e);else{let o=new jt(s,this),a=o.u(this.options);o.p(e),this.T(a),this._$AH=o}}_$AC(t){let e=bi.get(t.strings);return e===void 0&&bi.set(t.strings,e=new At(t)),e}k(t){De(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,n,s=0;for(let o of t)s===e.length?e.push(n=new i(this.O($t()),this.O($t()),this,this.options)):n=e[s],n._$AI(o),s++;s<e.length&&(this._$AR(n&&n._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let n=pi(t).nextSibling;pi(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},at=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,n,s,o){this.type=1,this._$AH=g,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=g}_$AI(t,e=this,n,s){let o=this.strings,a=!1;if(o===void 0)t=ot(this,t,e,0),a=!xt(t)||t!==this._$AH&&t!==I,a&&(this._$AH=t);else{let r=t,c,l;for(t=o[0],c=0;c<o.length-1;c++)l=ot(this,r[n+c],e,c),l===I&&(l=this._$AH[c]),a||=!xt(l)||l!==this._$AH[c],l===g?t=g:t!==g&&(t+=(l??"")+o[c+1]),this._$AH[c]=l}a&&!s&&this.j(t)}j(t){t===g?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Ht=class extends at{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===g?void 0:t}},Wt=class extends at{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==g)}},qt=class extends at{constructor(t,e,n,s,o){super(t,e,n,s,o),this.type=5}_$AI(t,e=this){if((t=ot(this,t,e,0)??g)===I)return;let n=this._$AH,s=t===g&&n!==g||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,o=t!==g&&(n===g||s);s&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Ft=class{constructor(t,e,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){ot(this,t)}},xi={M:Ne,P:q,A:Me,C:1,L:$i,R:jt,D:wi,V:ot,I:dt,H:at,N:Wt,U:qt,B:Ht,F:Ft},_s=Oe.litHtmlPolyfillSupport;_s?.(At,dt),(Oe.litHtmlVersions??=[]).push("3.3.3");var Ai=(i,t,e)=>{let n=e?.renderBefore??t,s=n._$litPart$;if(s===void 0){let o=e?.renderBefore??null;n._$litPart$=s=new dt(t.insertBefore($t(),o),o,void 0,e??{})}return s._$AI(i),s};var Ie=globalThis,D=class extends W{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ai(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};D._$litElement$=!0,D.finalized=!0,Ie.litElementHydrateSupport?.({LitElement:D});var gs=Ie.litElementPolyfillSupport;gs?.({LitElement:D});(Ie.litElementVersions??=[]).push("4.2.2");var Kt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ht=i=>(...t)=>({_$litDirective$:i,values:t}),V=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,n){this._$Ct=t,this._$AM=e,this._$Ci=n}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var G=ht(class extends V{constructor(i){if(super(i),i.type!==Kt.ATTRIBUTE||i.name!=="class"||i.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(i){return" "+Object.keys(i).filter(t=>i[t]).join(" ")+" "}update(i,[t]){if(this.st===void 0){this.st=new Set,i.strings!==void 0&&(this.nt=new Set(i.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in t)t[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(t)}let e=i.element.classList;for(let n of this.st)n in t||(e.remove(n),this.st.delete(n));for(let n in t){let s=!!t[n];s===this.st.has(n)||this.nt?.has(n)||(s?(e.add(n),this.st.add(n)):(e.remove(n),this.st.delete(n)))}return I}});var{I:ys}=xi,Si=i=>i;var Ei=()=>document.createComment(""),ut=(i,t,e)=>{let n=i._$AA.parentNode,s=t===void 0?i._$AB:t._$AA;if(e===void 0){let o=n.insertBefore(Ei(),s),a=n.insertBefore(Ei(),s);e=new ys(o,a,i,i.options)}else{let o=e._$AB.nextSibling,a=e._$AM,r=a!==i;if(r){let c;e._$AQ?.(i),e._$AM=i,e._$AP!==void 0&&(c=i._$AU)!==a._$AU&&e._$AP(c)}if(o!==s||r){let c=e._$AA;for(;c!==o;){let l=Si(c).nextSibling;Si(n).insertBefore(c,s),c=l}}}return e},Y=(i,t,e=i)=>(i._$AI(t,e),i),bs={},Vt=(i,t=bs)=>i._$AH=t,Ti=i=>i._$AH,Gt=i=>{i._$AR(),i._$AA.remove()};var St=ht(class extends V{constructor(){super(...arguments),this.key=g}render(i,t){return this.key=i,t}update(i,[t,e]){return t!==this.key&&(Vt(i),this.key=t),e}});var Pe=new Map;function X(i,t){let e=i+JSON.stringify(t);if(!Pe.has(e)){let n;try{n=new Intl.DateTimeFormat(i,t)}catch{n=new Intl.DateTimeFormat(void 0,{...t,timeZone:void 0})}Pe.set(e,n)}return Pe.get(e)}function Ci(i,t){try{return new Intl.NumberFormat(i,t)}catch{return new Intl.NumberFormat(void 0,t)}}var x=(i,t)=>i.replace(/\{(\w+)\}/g,(e,n)=>t[n]??"");function pt(i,t){let e=X("en-US",{hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric",timeZone:t}).formatToParts(i);return Object.fromEntries(e.map(({type:n,value:s})=>[n,Number(s)]))}var ws=/^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d):(\d\d)(?::(\d\d)(\.\d+)?)?)?$/;function rt(i,t){let e=ws.exec(i);if(!e)return Date.parse(i);let n=Date.UTC(+e[1],e[2]-1,+e[3],+(e[4]||0),+(e[5]||0),+(e[6]||0)),s=o=>{let a=pt(o,t);return Date.UTC(a.year,a.month-1,a.day,a.hour,a.minute,a.second)-o};return n-s(n-s(n))+(e[7]?Math.round(parseFloat(e[7])*1e3):0)}var P=(i,t)=>typeof i=="string"&&/^\d{4}-\d\d-\d\d/.test(i)?rt(i,t):NaN,S=(i,t=NaN)=>{let e=i?Date.parse(i):NaN;return Number.isNaN(e)?t:e};function O(i,t){let e=pt(i,t);return Date.UTC(e.year,e.month-1,e.day)/864e5}var ct=i=>new Date(i*864e5).toISOString().slice(0,10),J=(i,t)=>rt(ct(i),t);function Le(i){let t=i>0?Math.ceil(i/1e3):0,e=Math.floor(t/3600),n=Math.floor(t%3600/60),s=String(t%60).padStart(2,"0");return e?`${e}:${String(n).padStart(2,"0")}:${s}`:`${n}:${s}`}function Oi(i){let t=/^(\d+):(\d\d):(\d\d)$/.exec(String(i??"").trim());return t?(+t[1]*3600+ +t[2]*60+ +t[3])*1e3:NaN}var vs={comma_decimal:"en-US",decimal_comma:"de",space_comma:"fr",quote_decimal:"de-CH",none:"en-US"};function ks(){return X(void 0,{hour:"numeric"}).resolvedOptions().hour12}var Yt=class{constructor(t,e,n){let s=t?.locale||{};this.lang=e,this.t=n,this.server=t?.config?.time_zone||void 0,this.zone=s.time_zone==="server"?this.server:void 0;let o={12:!0,24:!1,system:ks()}[s.time_format];this.time={timeZone:this.zone,...o===void 0?{}:{hour12:o}},this.numbers=Ci(s.number_format==="system"?void 0:vs[s.number_format]||e,{maximumFractionDigits:1,useGrouping:s.number_format!=="none"}),this.percents=Ci(e,{style:"percent",maximumFractionDigits:0});try{this.rel=new Intl.RelativeTimeFormat(e,{numeric:"auto",style:"short"})}catch{this.rel=new Intl.RelativeTimeFormat("en",{numeric:"auto",style:"short"})}}relative(t,e){let n=Math.round((t-e)/1e3),s=Math.round(n/60),o=Math.round(n/3600);return Math.abs(n)<60?(n>0?this.t.soon:this.t.just_now)||this.rel.format(0,"second"):Math.abs(s)<60?this.rel.format(s,"minute"):Math.abs(o)<24?this.rel.format(o,"hour"):this.rel.format(Math.round(n/86400),"day")}entryTime(t,e){if(!Number.isFinite(t.ts))return"";if(t.clock)return Le(t.ts-e);if(t.day){let{near:n,text:s}=this.day(t.ts,this.server,e);return n?s:x(this.t.on_date,{d:s})}return this.relative(t.past?Math.min(t.ts,e):t.ts,e)}absolute(t){return X(this.lang,{dateStyle:"medium",timeStyle:"short",...this.time}).format(t)}absoluteDate(t,e){return X(this.lang,{dateStyle:"medium",timeZone:e}).format(t)}clockTime(t){return X(this.lang,{hour:"numeric",minute:"2-digit",...this.time}).format(t)}hour(t){let e=X(this.lang,{hour:"numeric",...this.time});return e.formatToParts(t).every(n=>n.type==="hour")?this.clockTime(t):e.format(t).replace(/^0(?=\d\D)/,"")}day(t,e,n){let s=O(t,e)-O(n,this.zone);return Math.abs(s)<=1?{near:!0,text:this.rel.format(s,"day")}:{near:!1,text:X(this.lang,{day:"2-digit",month:"2-digit",timeZone:e}).format(t)}}at(t,e){let{near:n,text:s}=this.day(t,this.zone,e);return x(n?this.t.day_at:this.t.date_at,{d:s,t:this.clockTime(t)})}calendar(t,e,n){let s=t?rt(t,this.server):NaN;if(Number.isNaN(s))return this.t.event;if(!e)return this.at(s,n);let{near:o,text:a}=this.day(s,this.server,n);return o?a:x(this.t.on_date,{d:a})}slotLabel(t,e,n){let s=O(t,this.zone)-O(n,this.zone),o=Math.abs(s)<=1?this.rel.format(s,"day"):X(this.lang,{weekday:"long",timeZone:this.zone}).format(t);return this.capital(e!=="hourly"?o:s===0?this.clockTime(t):x(this.t.day_at,{d:o,t:this.clockTime(t)}))}nowLabel(){return this.capital(this.rel.format(0,"second"))}capital(t){return t.charAt(0).toLocaleUpperCase(this.lang)+t.slice(1)}number(t){return this.numbers.format(t)}percent(t){return this.percents.format(t/100)}};var b=i=>i.split(".")[0],Ri=new Set(["ai_task","button","conversation","event","image","infrared","input_button","notify","radio_frequency","scene","stt","tag","tts","wake_word","datetime"]),$s={alarm_control_panel:["disarmed"],alert:["idle"],cover:["closed"],device_tracker:["not_home"],lawn_mower:["docked","paused","idle"],lock:["locked"],media_player:["standby"],person:["not_home"],vacuum:["idle","docked","paused"],valve:["closed"]},Ni={camera:["streaming","recording"],group:["on","home","open","locked","problem"],plant:["problem"],timer:["active"]},Ii=i=>Ri.has(i);function Z(i,t=i.state){let e=b(i.entity_id);return Ri.has(e)?t!=="unavailable":t==="unavailable"||t==="unknown"||t==="off"&&e!=="alert"?!1:Ni[e]?Ni[e].includes(t):!($s[e]||[]).includes(t)}var xs=new Set(["alarm_control_panel","alert","automation","binary_sensor","calendar","camera","climate","cover","device_tracker","fan","group","humidifier","input_boolean","lawn_mower","light","lock","media_player","person","plant","remote","schedule","script","siren","sun","switch","timer","update","vacuum","valve","water_heater","weather"]),As=i=>i.reduceRight((t,e)=>`var(${e}${t?", "+t:""})`,""),Pi="\xE0\xE1\xE2\xE4\xE6\xE3\xE5\u0101\u0103\u0105\u0430\u0431\xE7\u0107\u010D\u0111\u010F\u0434\xE8\xE9\xEA\xEB\u0113\u0117\u0119\u011B\u0435\u0451\u044D\u0444\u011F\u01F5\u0433\u1E27\xEE\xEF\xED\u012B\u012F\xEC\u0131\u0130\u0438\u0439\u043A\u0142\u043B\u1E3F\u043C\xF1\u0144\u01F9\u0148\u043D\xF4\xF6\xF2\xF3\u0153\xF8\u014D\xF5\u0151\u043E\u1E55\u043F\u0155\u0159\u0440\xDF\u015B\u0161\u015F\u0219\u0441\u0165\u021B\u0442\xFB\xFC\xF9\xFA\u016B\u01D8\u016F\u0171\u0173\u0443\u0432\u1E83\u1E8D\xFF\xFD\u044B\u017E\u017A\u017C\u0437\xB7",Ss="aaaaaaaaaaabcccdddeeeeeeeeeeefggghiiiiiiiiijkllmmnnnnnoooooooooopprrrsssssstttuuuuuuuuuuvwxyyyzzzz_",Es={\u0436:"zh",\u0445:"kh",\u0446:"ts",\u0447:"ch",\u0448:"sh",\u0449:"shch",\u044E:"iu",\u044F:"ia"},Ts=new RegExp(Pi.split("").join("|"),"g");function Mi(i){return i===""?"":String(i).toLowerCase().replace(Ts,e=>Ss.charAt(Pi.indexOf(e))).replace(/[а-я]/g,e=>Es[e]||"").replace(/(\d),(?=\d)/g,"$1").replace(/[^a-z0-9]+/g,"_").replace(/_+/g,"_").replace(/^_+|_+$/g,"")||"unknown"}function Q(i,t,e,n){let s=n?"active":"inactive";return As([...t?[`--state-${i}-${t}-${Mi(e)}-color`]:[],`--state-${i}-${Mi(e)}-color`,`--state-${i}-${s}-color`,`--state-${s}-color`])}var Di=(i,t=i.state)=>Q(b(i.entity_id),i.attributes.device_class,t,Z(i,t)),Cs=i=>{let t=new Set((i.attributes.entity_id||[]).map(e=>b(String(e))));return t.size===1?[...t][0]:void 0};function Et(i){let{state:t,attributes:e}=i;if(t==="unavailable")return"var(--state-unavailable-color)";let n=b(i.entity_id),s=Z(i);if(n==="sensor"&&e.device_class==="battery"&&t!==""&&!isNaN(Number(t))){let a=Number(t);return`var(--state-sensor-battery-${a>=70?"high":a>=30?"medium":"low"}-color)`}let o=n==="group"?Cs(i):n;return xs.has(o)&&n!=="person"&&n!=="device_tracker"?Q(o,e.device_class,t,s):s?"var(--state-icon-color)":"var(--state-inactive-color)"}var Os=new Set(["primary","accent","red","pink","purple","deep-purple","indigo","blue","light-blue","cyan","teal","green","light-green","lime","yellow","amber","orange","deep-orange","brown","light-grey","grey","dark-grey","blue-grey","black","white","primary-text","secondary-text","disabled"]),Jt=i=>Os.has(i)?`var(--${i}-color)`:i,tt={updateInstall:1,todoUpdate:4,coverClose:2,valveClose:2,vacuumReturn:16,mowerDock:4,sirenOff:2},Zt=(i,t)=>(Number(i.attributes.supported_features)&t)===t,Ns="zone.home",Ue=i=>i.entity_id===Ns?"home":i.attributes.friendly_name===void 0?i.entity_id.split(".")[1].replace(/_/g," "):String(i.attributes.friendly_name??"");function Be(i,t){return[...Array.isArray(i.attributes.in_zones)?i.attributes.in_zones:[],...Object.keys(t).filter(s=>s.startsWith("zone."))].map(s=>t[s]).find(s=>s&&Ue(s)===i.state)}var Ms={climate:{attribute:"hvac_action",modes:{cooling:"cool",defrosting:"heat",drying:"dry",fan:"fan_only",heating:"heat",idle:"off",off:"off",preheating:"heat"},icons:{cooling:"mdi:snowflake",defrosting:"mdi:snowflake-melt",drying:"mdi:water-percent",fan:"mdi:fan",heating:"mdi:fire",idle:"mdi:clock-outline",preheating:"mdi:heat-wave"}},humidifier:{attribute:"action",modes:{drying:"on",humidifying:"on",idle:"off",off:"off"},icons:{drying:"mdi:arrow-down-bold",humidifying:"mdi:arrow-up-bold",idle:"mdi:clock-outline"}}};function Li(i,t){let e=b(i.entity_id);if(i.state==="unknown")return null;if(e==="person"||e==="device_tracker")return{icon:(i.state==="home"||i.state==="not_home"?void 0:Be(i,t))?.attributes.icon||(i.state==="not_home"?"mdi:home-export-outline":"mdi:home"),color:Di(i)};let n=Ms[e],s=n&&i.attributes[n.attribute];return!s||s==="off"?null:{attribute:n.attribute,icon:n.icons[s]||"mdi:circle-medium",color:Di(i,n.modes[s])}}var ze=new WeakMap;function zi(i,t){if(!ze.has(i)){let e=new Map;for(let[n,s]of Object.entries(i))s?.device_id&&e.set(s.device_id,[...e.get(s.device_id)||[],n]);ze.set(i,e)}return ze.get(i).get(t)||[]}var Xt=["sensor","binary_sensor"],mt=i=>!!(i&&i.attributes.device_class==="battery"&&Xt.includes(b(i.entity_id)));function Ui(i,t){let e=i.entities?.[t]?.device_id;return e?zi(i.entities,e).find(n=>i.states[n]?.attributes.device_class==="battery_charging"):void 0}var Ds=(i,t)=>zi(i.entities,t).filter(e=>i.states[e]?.attributes.device_class==="battery"&&Xt.includes(b(e))).sort((e,n)=>Xt.indexOf(b(e))-Xt.indexOf(b(n)))[0];function Qt(i,t){let e=b(t.entity_id)==="person"?t.attributes.device_trackers:[t.entity_id];for(let n of Array.isArray(e)?e:[]){let s=i.entities?.[n]?.device_id,o=s&&Ds(i,s);if(o)return o}}var ft=i=>String(i??"").replace(/<br\s*\/?>/gi,`
`).replace(/!\[[^[\]]*\]\([^()]*\)/g,"").replace(/\[([^[\]]*)\]\([^()]*\)/g,"$1").replace(/<\/?[a-z][^<>]*>/gi,"").replace(/(\*\*|__|~~|`)(.+?)\1/g,"$2").replace(/^ {0,3}(#{1,6} +|> ?|[-*+] +)/gm,"").replace(/\n{3,}/g,`

`).trim(),Bi=/^(https?:\/\/|\/(?!\/))/i;function ji(i){let t=/\[[^[\]]*\]\(([^()\s]+)[^()]*\)/.exec(String(i??"").replace(/!\[[^[\]]*\]\([^()]*\)/g,""));return t&&Bi.test(t[1])?t[1]:null}function Hi(i){let t=/!\[[^[\]]*\]\(\s*([^()\s]*)[^()]*\)/.exec(String(i??""));return t&&Bi.test(t[1])?t[1]:null}var Tt=i=>({tap_action:i.startsWith("/")?{action:"navigate",navigation_path:i}:{action:"url",url_path:i}});var qi=["person","device_tracker"],Fi=[...qi,"zone"],Rs=36e5,Is=["unavailable","unknown"];function Ki(i,t,e){let n=i.concat(t);i.length&&t[0].lu<i.at(-1).lu&&n.sort((o,a)=>o.lu-a.lu);let s=0;for(;s+1<n.length&&n[s+1].lu*1e3<e;)s++;return n.slice(s)}function Ps(i,t){let e=[],n;for(let s of i){if(Is.includes(s.s))continue;let o=t(s);n!==void 0&&o!==n&&e.push(s),n=o}return e}var Ls=i=>t=>Array.isArray(t.a?.in_zones)?t.a.in_zones.includes(i.entity_id):t.s===Ue(i);function Wi(i,t,e,n,s){let o=Math.round(t.lu*1e3),a={...i,state:t.s};return{key:`presence:${i.entity_id}:${o}`,entity:i.entity_id,kind:"presence",title:n.name(i,s),message:n.state(a),place:qi.includes(b(i.entity_id))?t.s:void 0,ts:o,past:!0,expires:o+e,ack:t.s,stateObj:a}}function Vi(i,t,e){let n=t.trail>=0?t.trail:Rs,s=e.now-n,o=(r,c)=>{let l=e.history(r,n);return l&&Ps(l,c).filter(d=>d.lu*1e3>=s).at(-1)};if(b(i.entity_id)!=="zone"){let r=o(i.entity_id,c=>c.s);return r?[Wi(i,r,n,e,t.name)]:[]}return Object.values(e.hass.states).filter(r=>b(r.entity_id)==="person").flatMap(r=>{let c=o(r.entity_id,Ls(i));return c?[{...Wi(r,c,n,e),image:r.attributes.entity_picture||null}]:[]})}var T=i=>i!=null&&typeof i=="object"&&!Array.isArray(i),z=i=>i==null||i===""||i===!1||typeof i=="object"&&Object.keys(i).length===0;var B=(...i)=>i.join("\0"),lt=(i,t,e,n={})=>({label:t,action:{entity:i,tap_action:{action:"perform-action",perform_action:e,target:{entity_id:i},...n}}}),U=(i,t)=>{for(let e of t){let n=i?.[e];if(typeof n=="string"&&n||typeof n=="number")return String(n)}return""},Xi=(i,t)=>t.split(".").reduce((e,n)=>e?.[n],i),He=["image","image_url","picture","thumbnail"];function te(i){return typeof i.entity_picture=="string"&&i.entity_picture?i.entity_picture:He.map(t=>i[t]).find(t=>typeof t=="string"&&/^(https?:\/\/|\/|data:image\/)/i.test(t))||null}var Ji=["description","summary"],Zi=i=>T(i)&&U(i,["name","title"])!=="",Qi=i=>Object.keys(i).find(t=>Zi(i[t])&&[...Ji,...He].some(e=>!z(i[t][e]))),tn=i=>{let t=String(i).trim().toLowerCase();return["off","unavailable","unknown","idle","none",""].includes(t)||Number(t)===0},zs=i=>{let t=String(i).toLowerCase();return t==="on"||t==="active"||Number(i)>0};function Gi(i,t,e,n){let s=i.attributes,o=t.attribute||Qi(s),a=o?Xi(s,o):void 0,r={kind:n,ts:S(i.last_changed,e.now),past:!0,once:!0};if(Zi(a)){let c=U(a,["name","title"]),l=U(a,Ji);return[{...r,title:c,message:l||e.name(i,t.name),image:U(a,He),ack:B(c,l)}]}return n==="attribute"?!t.attribute||z(a)||typeof a=="object"?[]:[{...r,title:e.attr(i,o,a),message:e.name(i,t.name),ack:String(a)}]:tn(i.state)?[]:[{...r,title:e.state(i),message:e.name(i,t.name),ack:String(i.state)}]}function ee(i,t,e){return i>e.now?i-e.now>t?(e.wake(i-t),!1):!0:!1}function en(i,t,e){let n=i.attributes;if(!n.message)return[];let s={kind:"calendar",title:n.message,message:e.clock.calendar(n.start_time,n.all_day,e.now),color:Q("calendar",null,"on",!0)};if(i.state==="on")return[{...s,ts:S(i.last_changed,e.now),past:!0,ack:B(n.message,n.start_time)}];let o=P(n.start_time,e.clock.server);return i.state!=="off"||!(t.lead>=0)||!ee(o,t.lead,e)?[]:[{...s,...n.all_day?{message:""}:{},ts:o,day:!!n.all_day,ack:B(n.message,n.start_time,"ahead")}]}var Us=12*36e5,Bs=/^\d{4}-\d\d-\d\d$/;function js(i,t,e){let n=t.lead>=0?t.lead:Us;if(b(i.entity_id)==="calendar")return en(i,{...t,lead:n},e).map(l=>({...l,kind:"waste"}));let s=e.dayOf(e.now,e.clock.server),o=Object.keys(i.attributes).filter(l=>Bs.test(l)&&O(Date.parse(l+"T12:00:00Z"),"UTC")>=s).sort()[0];if(!o)return[];let a=O(Date.parse(o+"T12:00:00Z"),"UTC"),r=J(a,e.clock.server);if(a>s&&!ee(r,n,e))return[];let c=i.attributes[o];return[{kind:"waste",title:typeof c=="string"&&c||e.name(i,t.name),message:"",ts:r,day:!0,expires:J(a+1,e.clock.server),ack:B(o,c)}]}function Hs(i,t,e){if(i.state!=="on")return[];let{attributes:n,entity_id:s}=i,o=e.t,a=typeof n.update_percentage=="number"?Math.round(n.update_percentage):null,r=n.in_progress?[{label:a===null?o.installing:x(o.installing_pct,{p:a}),disabled:!0}]:null,c=e.admin&&Zt(i,tt.updateInstall)?[lt(s,o.install,"update.install")]:[];return[{kind:"update",title:(t.name?e.name(i,t.name):n.title||e.name(i).replace(/\s*update\s*$/i,"").trim())||o.update,message:n.latest_version?x(o.update_msg,{v:n.latest_version}):o.update_msg_plain,ts:S(i.last_changed,e.now),past:!0,actions:r||c,...e.admin&&!n.auto_update?{dismiss:{service:["update","skip",{entity_id:s}]}}:{ack:String(n.latest_version)}}]}var Yi={triggered:"crit",pending:"warn",arming:"warn"};function Ws(i,t,e){return Yi[i.state]?[{kind:"alarm",sev:Yi[i.state],title:e.name(i,t.name),message:e.state(i),ts:S(i.last_changed,e.now),past:!0}]:[]}function qs(i,t,e){return i.state!=="on"?[]:[{kind:"alert",sev:"warn",title:e.name(i,t.name),message:"",ts:S(i.last_changed,e.now),past:!0,ack:"on"}]}function Fs(i,t,e){let{attributes:n,entity_id:s}=i,o=e.t,a={kind:"timer",title:e.name(i,t.name)};if(i.state==="active"){let r=S(n.finishes_at),c=Number.isFinite(r)?x(o.ends_at,{t:e.clock.clockTime(r),s:e.state(i)}):e.state(i);return[{...a,message:c,ts:r,live:!0,clock:!0,ack:String(n.finishes_at),actions:[lt(s,o.act_pause,"timer.pause"),lt(s,o.act_cancel,"timer.cancel")]}]}return i.state!=="paused"?[]:[{...a,message:x(o.paused_left,{t:Le(Oi(n.remaining)),s:e.state(i)}),ts:S(i.last_changed,e.now),past:!0,ack:B("paused",n.remaining),actions:[lt(s,o.act_resume,"timer.start"),lt(s,o.act_cancel,"timer.cancel")]}]}var Ks={d:864e5,h:36e5,min:6e4,s:1e3,ms:1},Vs=i=>i.device_class==="timestamp"?void 0:Ks[i.unit_of_measurement];function Gs(i,t,e){let n=Vs(i.attributes),s=n?S(i.last_changed)+Number(i.state)*n:P(i.state,e.clock.server),o=Math.round(s/6e4)*6e4;return ee(o,t.lead>=0?t.lead:1/0,e)?[{kind:"countdown",title:e.name(i,t.name),message:n?e.clock.absolute(o):e.state(i),ts:o,live:!0,ack:""}]:[]}var Ys=12*36e5;function Xs(i,t,e){let n=P(i.state,e.clock.server);return ee(n,t.lead>=0?t.lead:Ys,e)?[{kind:"next_alarm",title:t.name?e.name(i,t.name):e.t.next_alarm,message:e.clock.at(n,e.now),ts:n,ack:String(i.state)}]:[]}function Js(i,t){for(let e of t){let n=i.states[e],s=n?.attributes||{};if(e.startsWith("image.")&&s.access_token)return`/api/image_proxy/${e}?token=${encodeURIComponent(s.access_token)}&state=${encodeURIComponent(n.state)}`;if(s.entity_picture)return s.entity_picture}return null}function Zs(i,t,e){let n=P(i.state,e.clock.server);if(!Number.isFinite(n))return[];let s=i.attributes.event_type,o=e.devicePictures(i.entity_id);return o.forEach(e.watch),[{kind:"event",title:e.name(i,t.name),message:s==null||s===""?"":e.attr(i,"event_type",s),ts:n,past:!0,expires:n+(t.trail>=0?t.trail:864e5),image:te(i.attributes)||Js(e.hass,o),ack:String(i.state)}]}function Qs(i,t,e){let n=i.entity_id,s=t.lead>=0?t.lead:0,o=e.dayOf(e.now),a=Zt(i,tt.todoUpdate),r=l=>a?[lt(n,e.t.act_done,"todo.update_item",{data:{item:l.uid,status:"completed"}})]:[],c=[];for(let l of e.todos(n)||[]){if(l?.status!=="needs_action"||!l.uid||typeof l.due!="string")continue;let d=!l.due.includes("T"),h=P(l.due,e.clock.server);if(Number.isFinite(h)){if(e.dayOf(h,d?e.clock.server:e.clock.zone)>o&&h-e.now>s){e.wake(h-s),e.wake(e.midnight);continue}c.push({key:`t:${n}:${l.uid}`,kind:"todo",title:String(l.summary||""),message:e.name(i,t.name),ts:h,day:d,ack:B(l.uid,l.due),tap:Tt("/todo?entity_id="+n),actions:r(l)})}}return c}var nn={lock:{sev:{jammed:"warn"},label:"act_lock",action:"lock.lock",when:["unlocked","open","jammed"],assumed:!0},cover:{label:"act_close_cover",action:"cover.close_cover",feature:tt.coverClose,when:["open","opening"],assumed:!0,confirm:!0},valve:{label:"act_close_valve",action:"valve.close_valve",feature:tt.valveClose,when:["open","opening"],assumed:!0,confirm:!0},vacuum:{sev:{error:"warn"},label:"act_dock_vacuum",action:"vacuum.return_to_base",feature:tt.vacuumReturn,when:["cleaning","error"]},lawn_mower:{sev:{error:"warn"},label:"act_dock_mower",action:"lawn_mower.dock",feature:tt.mowerDock,when:["mowing","returning","error"]},siren:{sev:{on:"crit"},label:"act_off",action:"siren.turn_off",feature:tt.sirenOff,when:["on"]}};function to(i,t,e){if(!Z(i))return[];let{attributes:n,entity_id:s}=i,o=nn[b(s)],a=o&&(o.when.includes(i.state)||o.assumed&&n.assumed_state===!0)&&(!o.feature||Zt(i,o.feature))&&!(b(s)==="lock"&&n.code_format);return[{kind:"device",sev:o?.sev?.[i.state],title:e.name(i,t.name),message:e.members(i)||e.state(i),ts:S(i.last_changed,e.now),past:!0,ack:String(i.state),actions:a?[lt(s,e.t[o.label],o.action,o.confirm?{confirmation:!0}:{})]:[]}]}var sn={extreme:"crit",severe:"crit",moderate:"warn"},on=i=>!!(U(i,["severity"])&&U(i,["headline","event"])),eo=/^([a-z][a-z0-9]*)_(\d+)_(headline|name|title|event)$/,an=i=>{let t=new Map;for(let e of Object.keys(i)){let n=eo.exec(e);if(!n||z(i[e]))continue;let s=a=>i[`${n[1]}_${n[2]}_${a}`];(n[3]==="headline"||n[3]==="event"||!z(s("level"))||!z(s("severity")))&&t.set(n[1]+n[2],{prefix:n[1],n:Number(n[2])})}return[...t.values()].sort((e,n)=>e.n-n.n)},je=(i,t,e)=>i.map(n=>P(t(n),e)).find(Number.isFinite);function io(i,t,e){let n=i.entity_id,s=new Set;return t.map(({prefix:o,n:a})=>{let r=_=>i.attributes[`${o}_${a}_${_}`],c={headline:r("headline"),name:r("name"),title:r("title"),event:r("event")},l=U(c,["headline","name","title","event"]),d=Number(r("level"))||0,h=ft(U({d:r("description")},["d"])),u=je(["start","onset"],r,e.clock.server),p=je(["end","expires"],r,e.clock.server),f=`w:${n}:${r("name")||l}:${r("start")||r("onset")||""}`;for(;s.has(f);)f+="+";return s.add(f),{key:f,kind:"warning",sev:d>=3||sn[String(r("severity")).toLowerCase()]==="crit"?"crit":"warn",title:l,message:h||(d?x(e.t.level,{l:d}):e.name(i)),ts:u??S(i.last_changed,e.now),past:u===void 0,expires:p,ack:B(l,d,h)}})}function no(i,t,e){let n=an(i.attributes);if(n.length)return io(i,n,e);if(i.state!=="on")return[];let s=on(i.attributes)?i.attributes:e.details(i),o=s||{},a=p=>o[p],r=e.clock.server,c=je(["start","onset","effective"],a,r),l=P(o.sent,r),d=P(o.expires,r),h=U(o,["headline","event"]),u=ft(U(o,["description"]));return[{kind:"warning",sev:sn[String(o.severity).toLowerCase()],title:h||e.name(i,t.name),message:u,ts:c??(Number.isFinite(l)?l:S(i.last_changed,e.now)),past:c===void 0,expires:Number.isFinite(d)?d:void 0,waiting:s===void 0,ack:h?B(h,o.severity,u):String(i.attributes.id||"")}]}var so=20;function oo(i,t){if(b(i.entity_id)==="binary_sensor")return i.state==="on";let e=parseFloat(i.state);if(Number.isNaN(e)||e>so)return!1;let n=Ui(t.hass,i.entity_id);return n&&t.watch(n),t.hass.states[n]?.state!=="on"}function ao(i,t,e){return(t.visibility?!["unavailable","unknown"].includes(i.state):oo(i,e))?[{kind:"battery",sev:"warn",deviceClass:"battery",title:e.name(i,t.name),message:e.state(i),ts:S(i.last_changed,e.now),past:!0,once:!0,ack:"low"}]:[]}var ro={smoke:"crit",gas:"crit",carbon_monoxide:"crit",moisture:"crit",safety:"crit",heat:"crit",problem:"warn",tamper:"warn",battery:"warn",sound:"warn"};function co(i,t,e){if(!(t.visibility?!["unavailable","unknown"].includes(i.state):t.type?!tn(i.state):zs(i.state)))return[];let s=i.attributes,o=b(i.entity_id)==="binary_sensor";return[{kind:"generic",sev:o&&i.state==="on"?ro[s.device_class]:void 0,deviceClass:o&&typeof s.device_class=="string"&&!Array.isArray(s.entity_id)?s.device_class:void 0,title:e.name(i,t.name),message:e.members(i)||e.state(i),ts:S(i.last_changed,e.now),past:!0,ack:String(i.state)}]}var _t=[{name:"warning",icon:"mdi:alert-circle",fits:(i,t)=>an(i.attributes).length>0||b(i.entity_id)==="binary_sensor"&&(on(i.attributes)||We(t,i.entity_id)),show:no},{name:"waste",icon:"mdi:trash-can-outline",ahead:!0,fits:(i,t)=>ne(t,i.entity_id)==="waste_collection_schedule",show:js},{name:"calendar",icon:"mdi:calendar-month",ahead:!0,fits:i=>b(i.entity_id)==="calendar",show:en},{name:"update",icon:"mdi:rocket-launch",fits:i=>b(i.entity_id)==="update",show:Hs},{name:"alarm",icon:"mdi:shield-alert",fits:i=>b(i.entity_id)==="alarm_control_panel",show:Ws},{name:"alert",icon:"mdi:alert",fits:i=>b(i.entity_id)==="alert",show:qs},{name:"timer",icon:"mdi:timer-outline",fits:i=>b(i.entity_id)==="timer",show:Fs},{name:"attribute",icon:"mdi:card-text-outline",fits:i=>!!Qi(i.attributes),show:(i,t,e)=>Gi(i,t,e,"attribute")},{name:"event",icon:"mdi:eye-check",behind:!0,fits:i=>b(i.entity_id)==="event",show:Zs},{name:"presence",icon:"mdi:map-marker-account",behind:!0,fits:i=>Fi.includes(b(i.entity_id)),show:Vi},{name:"device",icon:"mdi:devices",fits:i=>!!nn[b(i.entity_id)],show:to},{name:"next_alarm",icon:"mdi:alarm",ahead:!0,fits:i=>i.attributes["Time in Milliseconds"]!=null&&i.attributes.device_class==="timestamp",show:Xs},{name:"countdown",icon:"mdi:timer-sand",ahead:!0,fits:i=>b(i.entity_id)==="sensor"&&i.attributes.device_class==="timestamp",show:Gs},{name:"todo",icon:"mdi:clipboard-check-outline",ahead:!0,show:Qs},{name:"picture",icon:"mdi:image-outline",show:(i,t,e)=>Gi(i,t,e,"picture")},{name:"battery",icon:"mdi:battery-alert-variant-outline",fits:mt,show:ao},{name:"generic",icon:"mdi:information-outline",fits:()=>!0,show:co}],lo=Object.fromEntries(_t.map(i=>[i.name,i])),ie=_t.map(i=>i.name),rn=_t.filter(i=>i.ahead).map(i=>i.name),cn=_t.filter(i=>i.behind).map(i=>i.name),N={...Object.fromEntries(_t.map(i=>[i.name,i.icon])),system:"mdi:bell",repair:"mdi:wrench",group:"mdi:google-circles-communities",weather:"mdi:weather-partly-rainy"};function Ct(i,t,e){return i.type?i.type:i.attribute?"attribute":t?_t.find(n=>n.fits?.(t,e)).name:"generic"}var ne=(i,t)=>i?.entities?.[t]?.platform||"",We=(i,t)=>!!i?.services?.[ne(i,t)]?.get_details;function ln(i,t,e){if(!t)return[];let n=Ct(i,t,e.hass),s;try{s=lo[n].show(t,i,e)}catch(l){return console.warn(`origami-notifications: ${t.entity_id} could not be shown`,l),[]}let o=t.entity_id,a=i.image&&(i.image.includes("/")?i.image:Xi(t.attributes,i.image)),r=i.tap_action&&i.tap_action.action!=="none"?{entity:o,tap_action:i.tap_action}:void 0,c=(i.actions||[]).map(l=>({label:l.label,action:{entity:o,tap_action:l.tap_action}}));return s.map(l=>{let d=i.image?a:l.image||te(t.attributes);return{key:`${n}:${o}${i.attribute?":"+i.attribute:""}`,entity:o,...l,icon:i.icon||l.icon,color:i.color&&i.color!=="state"?Jt(i.color):l.color,image:typeof d=="string"&&d?d:null,backdrop:!!i.background,tap:i.tap_action?r:l.tap,inert:i.tap_action?.action==="none",actions:[...l.actions||[],...c],stateObj:l.kind==="todo"?void 0:l.stateObj||t}})}var K="origami-notifications",qe=["daily","hourly","twice_daily"],Ot={updates:!0,repairs:!0,batteries:!1,hide_when_empty:!0,vertical:!1,rotate:8,slide:"up"},se=i=>typeof i=="string"&&/^\w+\.\w+$/.test(i),dn={days:864e5,hours:36e5,minutes:6e4,seconds:1e3};function F(i){let t=NaN;if(typeof i=="number")t=i*6e4;else if(typeof i=="string"){let e=/^(\d+):(\d+)(?::(\d+(?:\.\d+)?))?$/.exec(i.trim());e&&(t=e[1]*36e5+e[2]*6e4+(e[3]||0)*1e3)}else T(i)&&Object.keys(i).length&&Object.keys(i).every(e=>e in dn)&&(t=Object.entries(i).reduce((e,[n,s])=>e+Number(s)*dn[n],0));return t>=0&&Number.isFinite(t)?t:NaN}var ho=i=>{throw new Error(`${K}: ${i}`)},v=(i,t)=>i||ho(t),A=(i,t)=>i==null||t(i),hn=i=>A(i,T);function uo(i){let t=typeof i=="string"?{entity:i}:T(i)?{...i}:null;return v(t&&se(t.entity),"entities must contain entity ids, got "+JSON.stringify(i)),v(A(t.type,e=>ie.includes(e)),`unknown type '${t.type}'`),v(A(t.attribute,e=>typeof e=="string"),"attribute must be the name of an attribute"),v(A(t.image,e=>typeof e=="string"),"image must be an attribute path or URL"),v(A(t.background,e=>typeof e=="boolean"),"background must be true or false"),v(A(t.color,e=>typeof e=="string"),"color must be a theme color like green, or a CSS color"),v(A(t.visibility,Array.isArray),`visibility of ${t.entity} must be a list of conditions`),v(A(t.before,e=>F(e)>=0),"before must be minutes or a duration like 1:30:00"),v(A(t.after,e=>F(e)>=0),"after must be minutes or a duration like 1:30:00"),v(hn(t.tap_action),"tap_action must be an action"),v(A(t.actions,e=>Array.isArray(e)&&e.every(n=>T(n)&&typeof n.label=="string"&&T(n.tap_action))),"actions must be a list of buttons with a label and a tap_action"),{...t,lead:t.before==null?void 0:F(t.before),trail:t.after==null?void 0:F(t.after)}}function po(i){let t=typeof i=="string"?{entity:i}:T(i)?{...i}:null;v(t&&se(t.entity),"infos must contain entity ids, got "+JSON.stringify(i)),v(A(t.visibility,Array.isArray),`visibility of ${t.entity} must be a list of conditions`),v(A(t.forecast_type,e=>qe.includes(e)),"forecast_type must be daily, hourly or twice_daily");for(let e of["show_current","show_forecast","show_entity_picture","show_battery"])v(A(t[e],n=>typeof n=="boolean"),e+" must be true or false");v(A(t.forecast_slots,e=>Number.isInteger(e)&&e>0),"forecast_slots must be a whole number above 0");for(let e of["tap_action","hold_action","double_tap_action"])v(hn(t[e]),e+" must be an action");return t}function mo(i){v(A(i,T),"audience must map sources to only or except");for(let[t,e]of Object.entries(i||{})){let n=T(e)?["only","except"].filter(o=>o in e):[];v(n.length===1,`audience.${t} needs either only or except`);let s=e[n[0]];v(Array.isArray(s)&&s.every(o=>typeof o=="string"&&o.startsWith("person.")),`audience.${t}.${n[0]} must list person entities, e.g. person.anna`)}return i||{}}function oe(i){v(A(i.entities,Array.isArray),"entities must be a list"),v(A(i.infos,Array.isArray),"infos must be a list"),v(A(i.weather,e=>typeof e=="string"&&e.startsWith("weather.")),"weather must be a weather entity, e.g. weather.home"),v(A(i.label,e=>typeof e=="string"),"label must be a label ID"),v(A(i.css,e=>typeof e=="string"),"css must be a string"),v(A(i.rotate,e=>typeof e=="number"&&e>=0),"rotate must be the seconds between turns, or 0 to turn them off"),v(A(i.slide,e=>e==="up"||e==="side"),"slide must be up or side");for(let e of["updates","repairs","batteries","hide_when_empty","vertical"])v(A(i[e],n=>typeof n=="boolean"),e+" must be true or false");let t=[];for(let e of i.entities||[]){let n=uo(e);t.some(s=>s.entity===n.entity)||t.push(n)}return{...Ot,...i,entities:t,infos:(i.infos||[]).map(po),audience:mo(i.audience)}}var un=new Map;function pn(i,t,e){let n=t.entity_id,s=t.attributes.id||t.last_changed,o=un.get(n);if(o?.warning!==s){if(!We(i,n))return Object.keys(i.services||{}).length?null:void 0;o={warning:s,data:void 0,waiting:new Set},un.set(n,o);let a=r=>{o.data=T(r)?r:null,o.waiting.forEach(c=>c()),o.waiting.clear()};Promise.resolve().then(()=>i.callService(ne(i,n),"get_details",{},{entity_id:n},!1,!0)).then(r=>a(r?.response?.[n]),()=>a(null))}return o.data===void 0&&o.waiting.add(e),o.data}var Ve="origami-notifications-ack",fo=64,_o=1e4,et=null,Fe=new Map;function mn(){if(!et)try{let i=JSON.parse(localStorage.getItem(Ve)||"{}");et=i&&typeof i=="object"&&!Array.isArray(i)?i:{}}catch{et={}}return et}function fn(){let i=new Set([...Fe.values()].flatMap(n=>[...n])),t=Object.keys(et),e=[...t.filter(n=>!i.has(n)),...t.filter(n=>i.has(n))];for(let n of e.slice(0,Math.max(t.length-fo,0)))delete et[n];try{localStorage.setItem(Ve,JSON.stringify(et))}catch{}}var Ke=new Set,_n=i=>Ke.forEach(t=>t!==i&&t());window.addEventListener("storage",i=>{i.key===Ve&&(et=null,_n())});var ae=class{constructor(t){this.onChange=t,this.pending=new Map}connect(){this.connected=!0,Ke.add(this.onChange)}disconnect(){this.connected=!1,Ke.delete(this.onChange),Fe.delete(this)}apply(t,e,n,s){let o=mn(),a=new Set(t.map(d=>d.key)),r=!1,c=d=>{o[d]!==void 0&&(delete o[d],r=!0)};for(let[d,h]of this.pending)!a.has(d)||h<=n?this.pending.delete(d):Number.isFinite(h)&&s(h);let l=[];for(let d of t){if(this.pending.has(d.key))continue;if(d.waiting){o[d.key]===void 0&&l.push({...d,ack:void 0});continue}if(d.dismiss||d.ack===void 0){l.push(d);continue}let h=d.once?d.ack:B(d.ack,d.ts);o[d.key]!==h&&(c(d.key),l.push({...d,signature:h}))}for(let d of e)a.has(d)||c(d);return this.connected&&Fe.set(this,a),r&&fn(),l}dismiss(t,e){let n=mn(),s=!1;for(let o of t.flatMap(a=>a.members||[a]))if(o.signature)n[o.key]=o.signature,s=!0;else if(o.dismiss){let{key:a}=o;this.pending.set(a,1/0),e(o.dismiss).then(()=>{this.pending.get(a)===1/0&&(this.pending.set(a,Date.now()+_o),this.onChange())},r=>{console.warn(`origami-notifications: Home Assistant kept ${a}`,r),this.pending.delete(a)&&this.onChange()})}s&&(fn(),_n(this.onChange)),this.onChange()}},re=i=>!!(i.dismiss||i.signature||i.members?.every(t=>t.signature));var ce=class{constructor(t,e){this.head=t,this.on=e,this.press=null,this.suppress=!1,this.tapWait=null,t.addEventListener("pointerdown",n=>this.down(n)),t.addEventListener("pointermove",n=>this.move(n)),t.addEventListener("pointerup",n=>this.up(n,!1)),t.addEventListener("pointercancel",n=>n!==this.ownCancel&&this.up(n,!0)),t.addEventListener("pointerleave",n=>!this.press?.drag&&this.up(n,!0)),t.parentElement.addEventListener("click",n=>this.click(n),!0),t.addEventListener("keydown",n=>this.key(n))}down(t){if(t.button>0||!t.isPrimary)return;this.suppress=!1;let e={id:t.pointerId,x:t.clientX,y:t.clientY,t:t.timeStamp,dx:0,drag:!1},n=this.on.holdAction();n&&(e.timer=setTimeout(()=>{this.suppress=!0,n()},500)),this.press=e}move(t){let e=this.press;if(!e||t.pointerId!==e.id)return;let n=t.clientX-e.x,s=t.clientY-e.y;if(!e.drag){if(Math.hypot(n,s)>10&&clearTimeout(e.timer),!this.on.canDrag()||Math.abs(n)<10||Math.abs(n)<Math.abs(s)*1.5)return;e.drag=!0,this.suppress=!0,this.head.setPointerCapture?.(e.id),this.ownCancel=new PointerEvent("pointercancel",{pointerId:t.pointerId,pointerType:t.pointerType,isPrimary:!0}),this.head.dispatchEvent(this.ownCancel)}e.dx=n,this.on.drag(n)}up(t,e){let n=this.press;if(!n||t.pointerId!==n.id||(this.press=null,clearTimeout(n.timer),!n.drag))return;let s=Math.abs(n.dx)/Math.max(t.timeStamp-n.t,1)>.5,o=!e&&(Math.abs(n.dx)>48||s);this.on.dragEnd(o?Math.sign(-n.dx)*(this.on.rtl()?-1:1):0)}click(t){if(this.head.contains(t.target)){if(this.suppress){this.suppress=!1,t.stopPropagation();return}this.activate()}}activate(){let t=this.on.doubleTapAction();if(!t)return this.on.tap();if(this.tapWait)return clearTimeout(this.tapWait),this.tapWait=null,t();this.tapWait=setTimeout(()=>{this.tapWait=null,this.on.tap()},250)}key(t){let e={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[t.key];e&&this.on.canDrag()?(t.preventDefault(),this.on.step(t.key.startsWith("ArrowL")||t.key.startsWith("ArrowR")?e*(this.on.rtl()?-1:1):e)):(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),this.activate())}reset(){this.press&&clearTimeout(this.press.timer),this.press=null,clearTimeout(this.tapWait),this.tapWait=null}};var gt=i=>i.length>4?`${i.slice(0,4).join(", ")} +${i.length-4}`:i.join(", "),go=i=>(i.kind==="generic"||i.kind==="battery")&&i.deviceClass&&!i.image&&!i.tap&&!i.actions.length,gn=i=>go(i)?"class:"+i.deviceClass:i.place?"place:"+i.place:null;function yo(i,t){let e=i.entities?.[t],n=e?.device_id&&i.devices?.[e.device_id];return i.areas?.[e?.area_id||n?.area_id]?.name||""}function yn(i,t){let e=new Map;for(let s of i){let o=gn(s);o&&!e.has(o)&&e.set(o,[]),o&&e.get(o).push(s)}let n=[];for(let s of i){let o=e.get(gn(s));!o||o.length<2?n.push(s):o[0]===s&&n.push(s.kind==="presence"?wo(o,t):bo(s.deviceClass,o,t))}return n}function bo(i,t,e){let n=[...t].sort((o,a)=>a.ts-o.ts),s=[...new Set(n.map(o=>yo(e.hass,o.entity)||o.title))];return{key:"group:"+i,kind:"group",sev:n[0].sev,title:e.alikeTitle(i,t.length),message:gt(s),ts:n[0].ts,past:!0,icon:n[0].icon,stateObj:n[0].stateObj,members:n,actions:[]}}function wo(i,t){let e=[...i].sort((o,a)=>a.ts-o.ts),n=e[0].place,s=n==="not_home"?void 0:Be(e[0].stateObj,t.hass.states);return{key:`group:place:${n}:${e[0].key}`,kind:"group",title:e[0].message,message:gt([...new Set(e.map(o=>o.title))]),ts:e[0].ts,past:!0,icon:s?void 0:n==="not_home"?"mdi:home-export-outline":"mdi:home",stateObj:s,color:Q("person",void 0,n,n!=="not_home"),members:e,actions:[]}}var bn={daily:1,hourly:2,twice_daily:4},Nt={hourly:36e5,twice_daily:12*36e5,daily:24*36e5},Mt=(i,t)=>!!(bn[t]&&Number(i?.attributes.supported_features)&bn[t]),le=i=>["hourly","twice_daily","daily"].find(t=>Mt(i,t))||null,$n=new Set(["rainy","pouring","lightning","lightning-rainy","snowy","snowy-rainy","hail"]),xn=(i,t)=>$n.has(i.condition)||Number(i.precipitation)>=(t==="in"?.01:.2)||Number(i.precipitation_probability)>=60;function wn(i,t,e){let n=String(i||"");return n.startsWith("lightning")?"thunder":n==="hail"?"hail":n.startsWith("snowy")||t!=null&&t!==""&&Number(t)<=e?"snow":"rain"}var vn={rain:"mdi:weather-rainy",snow:"mdi:weather-snowy",thunder:"mdi:weather-lightning",hail:"mdi:weather-hail",frost:"mdi:snowflake-thermometer"},vo={rain:"rainy",snow:"snowy",thunder:"lightning",hail:"hail",frost:"snowy"},kn=i=>Q("weather",null,vo[i],!0);function An(i,t,e,n){let s=i.entity_id,o=i.attributes,a=n.t,r=o.temperature_unit==="\xB0F",c=e==="hourly"||e==="twice_daily"?t.filter(p=>Date.parse(p.datetime)+Nt[e]>n.now):[],l=n.openWindows(),d=[],h=(p,f,_,w,$)=>d.push({key:`wx:${s}:wet`,kind:"weather",entity:s,icon:vn[p],color:kn(p),sev:l?"warn":void 0,title:f,message:_,ts:w,past:$,once:!$,ack:p+(l?" open":"")});if($n.has(i.state)){let p=wn(i.state,o.temperature,r?34:1);l&&h(p,a[`wx_${p}_now`],n.alikeTitle("window",l),S(i.last_changed,n.now),!0)}else{let p=c.find(f=>Date.parse(f.datetime)<n.now+6*36e5&&xn(f,o.precipitation_unit));if(p){let f=Math.max(Date.parse(p.datetime),n.now),_=wn(p.condition,p.temperature,r?34:1),w=p.precipitation_probability==null?NaN:Number(p.precipitation_probability),$=l?n.alikeTitle("window",l):Number.isFinite(w)?x(a.wx_chance,{p:n.clock.percent(w)}):"";h(_,x(a[`wx_${_}_from`],{t:n.clock.hour(f)}),$,f,!1)}}let u=r?32:0;if(c.length&&o.temperature!=null&&Number(o.temperature)>u){let p=c.filter(_=>Date.parse(_.datetime)<n.now+18*36e5&&_.temperature!=null&&Number.isFinite(Number(_.temperature))),f=p.find(_=>Number(_.temperature)<u);if(f){let _=Math.max(Date.parse(f.datetime),n.now),w=Math.min(...p.map($=>Number($.temperature)));d.push({key:`wx:${s}:frost`,kind:"weather",entity:s,icon:vn.frost,color:kn("frost"),title:x(a.wx_frost_from,{t:n.clock.hour(_)}),message:x(a.wx_low,{v:n.attr(i,"temperature",w)}),ts:_,once:!0,ack:"frost"})}}return c.length&&n.wake(Math.floor(n.now/36e5)*36e5+36e5),d}var ko=[[5,"morning"],[12,"afternoon"],[17,"evening"],[22,"night"]],$o=["lightning-rainy","lightning","hail","snowy-rainy","snowy","pouring","rainy"];function xo(i,t){let e=i.filter(s=>xn(s,t));if(e.length)return $o.find(s=>e.some(o=>o.condition===s))||"rainy";let n=new Map;for(let s of i)s.condition&&n.set(s.condition,(n.get(s.condition)||0)+1);return[...n].sort((s,o)=>o[1]-s[1])[0]?.[0]}function Sn(i,t,e,n){let s=n.t,o=n.clock.zone,a=n.dayOf(n.now),r=(d,h)=>rt(`${ct(d)} ${String(h).padStart(2,"0")}:00:00`,o),c=pt(n.now,o).hour>=17,l=[];if(e==="daily"){let d=c?a+1:a;l.push({label:n.clock.slotLabel(r(d,12),"daily",n.now),start:Math.max(r(d,0),n.now),end:r(d+1,0)})}else{let d=[a,a+1].flatMap(p=>ko.map(([f,_])=>({name:_,day:p,start:r(p,f)})));d.forEach((p,f)=>p.end=d[f+1]?.start??r(a+2,5));let h=d.find(p=>p.start>n.now),u={morning:h.day===a?s.wx_this_morning:s.wx_tomorrow_morning,afternoon:s.wx_this_afternoon,evening:s.wx_this_evening,night:s.wx_tonight};c&&h.day>a||l.push({label:u[h.name],start:h.start,end:h.end,night:h.name==="night"}),c&&l.push({label:n.clock.slotLabel(r(a+1,12),"daily",n.now),start:r(a+1,5),end:r(a+1,22)}),n.wake(h.start)}return n.wake(r(a,17)),n.wake(n.midnight),l.map(d=>{let h=t.filter(m=>{let k=Date.parse(m?.datetime);return k<d.end&&k+Nt[e]>d.start});if(!h.length)return null;let u=h.flatMap(m=>[m.temperature,m.templow]).filter(m=>m!=null&&m!==""&&Number.isFinite(Number(m))).map(m=>Math.round(Number(m))),[p,f]=[Math.min(...u),Math.max(...u)],_=u.length?p===f?n.clock.number(f)+"\xB0":x(s.wx_range,{lo:n.clock.number(p),hi:n.clock.number(f)}):"",w=xo(h,i.attributes.precipitation_unit),$={...i,state:w||"unknown"};return{label:d.label,condition:w,night:d.night,text:[w?n.state($):"",_].filter(Boolean).join(" \xB7 ")}}).filter(Boolean)}var En=i=>Object.keys(i).filter(t=>{let e=i[t]?.attributes;return e?.device_class==="window"&&!Array.isArray(e.entity_id)&&/^(binary_sensor|cover)\./.test(t)}),Tn=i=>i&&(i.entity_id.startsWith("binary_sensor.")?i.state==="on":!["closed","unavailable","unknown"].includes(i.state));var Ao={sunny:"mdi:weather-night",partlycloudy:"mdi:weather-night-partly-cloudy"},So=(i,t)=>i.entity.startsWith("weather.")&&i.show_forecast!==!1&&Mt(t,i.forecast_type);function Cn(i,t,e,n,s){if(i.hide_when_empty!==!1)return i.infos;let o=new Set(i.infos.map(c=>c.entity)),a=[],r=i.weather&&e.states[i.weather];if(r&&!o.has(i.weather)&&n(i.weather)){let c=le(r);a.push({entity:i.weather,state_content:["state","temperature"],...c?{forecast_type:c,outlook:!0}:{}})}for(let c of t){let l=e.states[c.entity];!c.entity.startsWith("calendar.")||o.has(c.entity)||s.has(c.entity)||!n(c.entity)||l?.state==="off"&&!z(l.attributes.message)&&a.push({entity:c.entity,name:c.name,icon:c.icon,color:c.color})}return[...i.infos,...a]}function Ge(i,t,e,n){return[].concat(t??"state").map(o=>{if(o==="state")return n.state(i);if(o==="name")return e;if(/^last[_-](changed|updated)$/.test(o))return n.clock.relative(S(i[o.replace("-","_")],n.now),n.now);let a=i.attributes[o];if(a==null)return"";let r=P(a,n.clock.server);return Number.isFinite(r)?n.clock.relative(r,n.now):n.attr(i,o,a)}).filter(Boolean).join(" \xB7 ")||n.state(i)}function Eo(i,t,e,n){let s=[i.temperature,i.templow].filter(a=>a!=null&&a!==""&&Number.isFinite(Number(a))).map(a=>n.clock.number(Number(a))+"\xB0").join(" / ");return[e==="twice_daily"?i.is_daytime===!1?n.t.wx_night:n.t.wx_day:"",s,i.condition?n.state(t):""].filter(Boolean).join(" \xB7 ")}function To(i,t,e){if(!So(i,t))return null;let n=i.forecast_type,s=e.forecast(i.entity,n);if(!s)return[];if(i.outlook)return Sn(t,s,n,e);let o=e.dayOf(e.now),a=s.filter(r=>Number.isFinite(Date.parse(r?.datetime))).filter(r=>n==="daily"?e.dayOf(Date.parse(r.datetime))>=o:Date.parse(r.datetime)+Nt[n]>e.now).slice(0,i.forecast_slots||1);return a.length?(e.wake(e.midnight),n!=="daily"&&e.wake(Date.parse(a[0].datetime)+Nt[n]),a.map(r=>({label:e.clock.slotLabel(Date.parse(r.datetime),n,e.now),condition:r.condition,night:r.is_daytime===!1,text:Eo(r,{...t,state:r.condition||"unknown"},n,e)}))):null}var Co=(i,t)=>gt([].concat(i.attributes.persons||[]).flatMap(e=>t.hass.states[e]?[t.name(t.hass.states[e])]:[]));function On(i,t){let e=[],n=new Set;for(let s of i){t.watch(s.entity);let o=t.hass.states[s.entity];if(!o||o.state==="unavailable"||o.state==="unknown"||!t.conditionsMet(s.visibility,s.entity))continue;let a="info:"+s.entity;for(;n.has(a);)a+="+";n.add(a);let r=s.color&&s.color!=="state",c=m=>r?Z(m)?Jt(s.color):"var(--state-inactive-color)":Et(m),l=t.name(o,s.name),d=s.show_battery?Qt(t.hass,o):void 0;d&&t.watch(d);let h=d&&t.hass.states[d],u={kind:"info",info:s,entity:s.entity,row:a,name:l,icon:s.icon,image:s.show_entity_picture?te(o.attributes):null,battery:h&&!["unavailable","unknown"].includes(h.state)?h:void 0},p=To(s,o,t),f=b(s.entity),_=f==="calendar"&&!z(o.attributes.message),w=T(s.name)||!z(s.name)?l:"",$={...u,key:a,stateObj:o,title:l,color:c(_?{...o,state:"on"}:o)};_&&Object.assign($,w?{content:s.state_content??["message","start_time"]}:{title:o.attributes.message,content:s.state_content??["start_time"]}),!w&&f==="weather"&&($.title=t.clock.nowLabel()),f==="zone"&&s.state_content==null&&($.text=Co(o,t)||t.t.no_one),(!p||s.show_current!==!1)&&e.push($),(p||[]).forEach((m,k)=>{let E={...o,state:m.condition||"unknown"};e.push({...u,key:`${a}#${k}`,stateObj:E,title:w||m.label,text:[w?m.label:"",m.text].filter(Boolean).join(" \xB7 "),icon:s.icon||m.night&&Ao[m.condition]||void 0,color:c(E)})})}return e}var Oo=new Set(["state","numeric_state","screen","user","location","time","view_columns"]),Nn={and:i=>i.every(Boolean),or:i=>i.some(Boolean),not:i=>!i.every(Boolean)},No=["sun","mon","tue","wed","thu","fri","sat"],Ye=i=>i==null?[]:Array.isArray(i)?i:[i],Mn=i=>!(T(i)&&i.enabled===!1),Dn=i=>{let[t,e,n]=String(i).split(":").map(s=>parseInt(s,10));return t*3600+e*60+(n||0)},Xe=i=>String(i).padStart(2,"0"),Mo=(i,t,e)=>t>=864e5/1e3?J(i+1,e):rt(`${ct(i)}T${Xe(Math.floor(t/3600))}:${Xe(Math.floor(t/60)%60)}:${Xe(t%60)}`,e);function Do(i,t){let e=pt(t.now,t.zone),n=O(t.now,t.zone),s=e.hour*3600+e.minute*60+e.second,o=i.after?Dn(i.after):null,a=i.before?Dn(i.before):null;for(let r of[o,a==null?null:a+1])r!=null&&[n,n+1].forEach(c=>t.wake(Mo(c,r,t.zone)));return t.wake(J(n+1,t.zone)),i.weekdays?.length&&!i.weekdays.includes(No[new Date(n*864e5).getUTCDay()])?!1:o!=null&&a!=null?a<o?s>=o||s<=a:s>=o&&s<=a:o!=null?s>=o:a==null||s<=a}function Rn(i,t,e){let{hass:n}=e,s=!1,o=l=>(e.watch(l),n.states[l]),a=l=>se(l)&&n.states[l]?o(l).state:void 0,r=l=>{if(!T(l)||"enabled"in l&&typeof l.enabled!="boolean")return!1;let d=l.condition??"state";if(Nn[d])return l.conditions==null||Nn[d](Ye(l.conditions).filter(Mn).map(r));if("entity_id"in l||!Oo.has(d)){let _=e.server(l);return s||=_.failed,_.result}if(d==="screen")return!!l.media_query&&e.media(l.media_query);if(d==="user")return!!(n.user?.id&&l.users?.includes(n.user.id));if(d==="view_columns")return!0;if(d==="time")return Do(l,e);if(d==="location"){let _=Object.values(n.states).find(w=>w.entity_id.startsWith("person.")&&w.attributes.user_id===n.user?.id);return _&&e.watch(_.entity_id),!!(_&&l.locations?.includes(_.state))}let h=o(l.entity||t),u=h&&l.attribute?h.attributes[l.attribute]:h?.state;if(d==="numeric_state"){let _=Number(u),w=$=>Number(typeof $=="string"?a($)??$:$);return!Number.isNaN(_)&&(l.above==null||!(w(l.above)>=_))&&(l.below==null||!(w(l.below)<=_))}let p=l.state??l.state_not;return p===void 0?!1:Ye(p).flatMap(_=>a(_)!==void 0?[_,a(_)]:[_]).includes(String(u??"unknown"))===(l.state!=null)};return Ye(i).filter(Mn).map(r).every(Boolean)&&!s}var In={en:{idle_title:"All quiet",idle_msg:"No notifications",clear:"Clear all",dismiss:"Dismiss",install:"Install",installing:"Installing",installing_pct:"Installing ({p}%)",just_now:"just now",soon:"in a moment",count_one:"1 notification",count_other:"{n} notifications",event:"Event",notification:"Notification",update:"Update",update_msg:"Update {v} available",update_msg_plain:"Update available",level:"Level {l}",breaks_in:"Stops working in {v}",day_at:"{d} at {t}",date_at:"on {d} at {t}",on_date:"on {d}",paused_left:"Paused, {t} left",ends_at:"Ends at {t}",act_pause:"Pause",act_resume:"Resume",act_cancel:"Cancel",act_lock:"Lock",act_close_cover:"Close",act_close_valve:"Close",act_dock_vacuum:"Dock",act_dock_mower:"Dock",act_off:"Turn off",act_done:"Done",next_alarm:"Alarm",no_one:"No one here",wx_rain_from:"Rain from {t}",wx_snow_from:"Snow from {t}",wx_thunder_from:"Thunderstorms from {t}",wx_hail_from:"Hail from {t}",wx_rain_now:"It is raining",wx_snow_now:"It is snowing",wx_thunder_now:"Thunderstorm",wx_hail_now:"Hail",wx_chance:"{p} chance",wx_frost_from:"Frost from {t}",wx_low:"Low of {v}",wx_day:"Day",wx_night:"Night",wx_this_morning:"This morning",wx_tomorrow_morning:"Tomorrow morning",wx_this_afternoon:"This afternoon",wx_this_evening:"This evening",wx_tonight:"Tonight",wx_range:"{lo} to {hi}\xB0"},de:{idle_title:"Alles ruhig",just_now:"gerade eben",soon:"gleich",count_one:"1 Benachrichtigung",count_other:"{n} Benachrichtigungen",event:"Termin",notification:"Benachrichtigung",update_msg:"Update {v} verf\xFCgbar",update_msg_plain:"Update verf\xFCgbar",level:"Stufe {l}",breaks_in:"Funktioniert ab {v} nicht mehr",day_at:"{d} um {t}",date_at:"am {d} um {t}",on_date:"am {d}",paused_left:"Pausiert, noch {t}",ends_at:"Endet um {t}",act_done:"Erledigt",next_alarm:"Wecker",no_one:"Niemand da",wx_rain_from:"Regen ab {t}",wx_snow_from:"Schnee ab {t}",wx_thunder_from:"Gewitter ab {t}",wx_hail_from:"Hagel ab {t}",wx_rain_now:"Es regnet",wx_snow_now:"Es schneit",wx_thunder_now:"Gewitter",wx_hail_now:"Hagel",wx_chance:"{p} Wahrscheinlichkeit",wx_frost_from:"Frost ab {t}",wx_low:"Tiefstwert {v}",wx_this_morning:"Heute Vormittag",wx_tomorrow_morning:"Morgen fr\xFCh",wx_this_afternoon:"Heute Nachmittag",wx_this_evening:"Heute Abend",wx_tonight:"Heute Nacht",wx_range:"{lo} bis {hi}\xB0"}},Ro={just_now:null,soon:null,day_at:"{d}, {t}",date_at:"{d}, {t}",on_date:"{d}",paused_left:"{s}, {t}",ends_at:"{s}, {t}"},Io={idle_msg:["ui.notification_drawer.empty"],clear:["ui.notification_drawer.dismiss_all"],dismiss:["ui.card.persistent_notification.dismiss"],install:["ui.dialogs.more_info_control.update.install"],installing:["ui.card.update.installing"],installing_pct:["ui.card.update.installing_with_progress",{progress:"{p}"}],update:["ui.dialogs.more_info_control.update.update"],act_pause:["ui.card.timer.actions.pause"],act_resume:["ui.card.timer.actions.start"],act_cancel:["ui.card.timer.actions.cancel"],act_lock:["ui.card.lock.lock"],act_close_cover:["ui.card.cover.close_cover"],act_close_valve:["ui.card.valve.close_valve"],act_dock_vacuum:["ui.card.vacuum.actions.return_to_base"],act_dock_mower:["ui.card.lawn_mower.actions.dock"],act_off:["ui.card.common.turn_off"],wx_day:["ui.card.weather.day"],wx_night:["ui.card.weather.night"],no_one:["ui.panel.lovelace.cards.map.overview.people_in_zone",{count:0}]},Po={rain:"rainy",snow:"snowy",thunder:"lightning",hail:"hail"},Je=i=>String(i).split("-")[0],de=i=>i?.locale?.language||i?.language||"en";function Un(i,t){let e=In[Je(i)],n={...In.en,...e||Ro},s=(o,a)=>typeof t=="function"&&t(o,a)||"";for(let[o,[a,r]]of Object.entries(Io))n[o]=s(a,r)||n[o];if(!e){let o=s("ui.notification_drawer.title");o&&(n.count_one=n.count_other=o+" ({n})");for(let[a,r]of Object.entries(Po)){let c=s("component.weather.entity_component._.state."+r);c&&Object.assign(n,{[`wx_${a}_now`]:c,[`wx_${a}_from`]:c+", {t}"})}}return n}var Lo={en:{window:{one:"1 window open",other:"{n} windows open"},door:{other:"{n} doors open"},garage_door:{other:"{n} garage doors open"},opening:{other:"{n} sensors open"},battery:{other:"{n} batteries low"},moisture:{other:"{n} water alarms"},smoke:{other:"{n} smoke alarms"},gas:{other:"{n} gas alarms"},carbon_monoxide:{other:"{n} CO alarms"},heat:{other:"{n} heat alarms"},problem:{other:"{n} problems"},tamper:{other:"{n} tamper alerts"},safety:{other:"{n} safety alerts"},sound:{other:"{n} sounds detected"}},de:{window:{one:"1 Fenster offen",other:"{n} Fenster offen"},door:{other:"{n} T\xFCren offen"},garage_door:{other:"{n} Garagentore offen"},opening:{other:"{n} Sensoren offen"},battery:{other:"{n} Batterien schwach"},moisture:{other:"{n} Wassermelder ausgel\xF6st"},smoke:{other:"{n} Rauchmelder ausgel\xF6st"},gas:{other:"{n} Gasmelder ausgel\xF6st"},carbon_monoxide:{other:"{n} CO-Melder ausgel\xF6st"},heat:{other:"{n} Hitzemelder ausgel\xF6st"},problem:{other:"{n} Probleme"},tamper:{other:"{n} Sabotagealarme"},safety:{other:"{n} Sicherheitswarnungen"},sound:{other:"{n} Ger\xE4usche erkannt"}}};function Bn(i,t,e,n){let s=Lo[Je(i)]?.[t];return s?x(e===1&&s.one?s.one:s.other,{n:e}):`${typeof n=="function"&&n(`component.binary_sensor.entity_component.${t}.name`)||Ze(t)} (${e})`}function Ze(i){let t=String(i).replace(/[_-]+/g," ").trim();return t.charAt(0).toUpperCase()+t.slice(1)}var Pn={en:{label:"Include entities by label",weather:"Weather",updates:"Pending updates",repairs:"Repairs",batteries:"Low batteries",hide_when_empty:"Hide when there is nothing to show",infos:"Infos",info_options:"Info options",rotate:"Seconds between turns",slide:"Turn",slide_up:"Upwards",slide_side:"Sideways",options:"Entity options",type:"Kind",image:"Picture",background:"Picture as card background",before:"Show ahead of time",after:"Keep showing for",audience:"Who sees what",styling:"Styling",css:"CSS",visible:"Visible to",people:"People",system:"System notifications",everyone:"Everyone",only:"Only these people",except:"Everyone except these people",nobody:"Nobody",only_x:"Only {x}",except_x:"Everyone except {x}",type_auto:"Detect automatically",type_calendar:"Calendar event",type_update:"Update",type_alarm:"Alarm panel",type_alert:"Alert",type_timer:"Timer",type_countdown:"Countdown",type_next_alarm:"Next alarm",type_waste:"Waste collection",type_event:"Event",type_todo:"To-do list",type_device:"Device",type_warning:"Warnings",type_attribute:"Details from an attribute",type_picture:"State as title",type_battery:"Battery",type_presence:"Arrivals and departures",type_generic:"Plain entity",entities:"Entities",name:"Name",icon:"Icon",attribute:"Attribute",tap_action:"Tap behavior",hold_action:"Hold behavior",double_tap_action:"Double tap behavior",color:"Color",state_content:"State content",time_format:"Time format",show_entity_picture:"Show entity picture",show_battery:"Show battery",visibility:"Visibility",content_layout:"Content layout",horizontal:"Horizontal",vertical:"Vertical",forecast:"Weather to show",show_both:"Current weather and forecast",show_current:"Only the current weather",show_forecast:"Only the forecast",forecast_type:"Forecast",forecast_slots:"Forecasts to show",daily:"Daily",hourly:"Hourly",twice_daily:"Twice daily"},de:{label:"Entit\xE4ten mit diesem Label einbeziehen",weather:"Wetter",updates:"Ausstehende Updates",repairs:"Reparaturen",batteries:"Schwache Batterien",hide_when_empty:"Ausblenden, wenn nichts anliegt",infos:"Infos",info_options:"Optionen je Info",rotate:"Sekunden bis zum Wechsel",slide:"Wechsel",slide_up:"Nach oben",slide_side:"Seitlich",options:"Optionen je Entit\xE4t",type:"Art",image:"Bild",background:"Bild als Kartenhintergrund",before:"Im Voraus zeigen",after:"Danach noch zeigen",audience:"Wer sieht was",styling:"Gestaltung",css:"CSS",visible:"Sichtbar f\xFCr",people:"Personen",system:"Systembenachrichtigungen",everyone:"Alle",only:"Nur diese Personen",except:"Alle au\xDFer diesen Personen",nobody:"Niemand",only_x:"Nur {x}",except_x:"Alle au\xDFer {x}",type_auto:"Automatisch erkennen",type_calendar:"Kalendertermin",type_update:"Update",type_alarm:"Alarmanlage",type_alert:"Alarm (alert)",type_timer:"Timer",type_countdown:"Countdown",type_next_alarm:"N\xE4chster Wecker",type_waste:"M\xFCllabfuhr",type_event:"Ereignis",type_todo:"To-do-Liste",type_device:"Ger\xE4t",type_warning:"Warnungen",type_attribute:"Details aus einem Attribut",type_picture:"Zustand als Titel",type_battery:"Batterie",type_presence:"Kommen und Gehen",type_generic:"Einfache Entit\xE4t",show_battery:"Batterie zeigen"}},Ln={entities:"ui.panel.lovelace.editor.card.generic.entities",name:"ui.panel.lovelace.editor.card.generic.name",icon:"ui.panel.lovelace.editor.card.generic.icon",attribute:"ui.panel.lovelace.editor.card.generic.attribute",tap_action:"ui.panel.lovelace.editor.card.generic.tap_action",hold_action:"ui.panel.lovelace.editor.card.generic.hold_action",double_tap_action:"ui.panel.lovelace.editor.card.generic.double_tap_action",color:"ui.panel.lovelace.editor.card.tile.color",state_content:"ui.panel.lovelace.editor.card.tile.state_content",time_format:"ui.panel.lovelace.editor.card.generic.time_format",show_entity_picture:"ui.panel.lovelace.editor.card.tile.show_entity_picture",visibility:"ui.panel.lovelace.editor.card.heading.entity_config.visibility",visibility_intro:"ui.panel.lovelace.editor.card.heading.entity_config.visibility_explanation",content_layout:"ui.panel.lovelace.editor.card.tile.content_layout",horizontal:"ui.panel.lovelace.editor.card.tile.content_layout_options.horizontal",vertical:"ui.panel.lovelace.editor.card.tile.content_layout_options.vertical",forecast:"ui.panel.lovelace.editor.card.weather-forecast.weather_to_show",show_both:"ui.panel.lovelace.editor.card.weather-forecast.show_both",show_current:"ui.panel.lovelace.editor.card.weather-forecast.show_only_current",show_forecast:"ui.panel.lovelace.editor.card.weather-forecast.show_only_forecast",forecast_type:"ui.panel.lovelace.editor.card.weather-forecast.forecast_type",forecast_slots:"ui.panel.lovelace.editor.card.weather-forecast.forecast_slots",daily:"ui.panel.lovelace.editor.card.weather-forecast.daily",hourly:"ui.panel.lovelace.editor.card.weather-forecast.hourly",twice_daily:"ui.panel.lovelace.editor.card.weather-forecast.twice_daily"},zn={en:{label:"Every entity with this label is added and detected automatically.",weather:"Shows rain, snow and frost ahead.",batteries:"Every battery at 20 % or less whose device is not charging, as in the maintenance view of Home Assistant.",visible:"Applies outside edit mode, like Home Assistant's own card visibility.",people:"Matches the user account linked to each person in Settings \u2192 People.",attribute:"An attribute that holds an object with a name or title, or a plain value. If empty, the card looks for an object with a description or a picture.",attribute_picture:"An attribute that holds an object with a name or title. The object is shown instead of the state.",image:"An attribute, a path into one like book.cover, or a URL. If empty, the card uses the picture of the shown object or of the entity.",background:"Blurred behind the card while this entity is on top.",before:"How long before it starts or is due.",after:"How long it stays after it happened. An event stays a day, an arrival or a departure an hour.",infos:"Shown in turn after what needs attention.",rotate:"At 0 the card holds still.",css:"Goes into the card after its own styles, so you can change any part of it.",visibility_intro:"It shows while all of these conditions hold.",row_tap_action:"What a tap on its row in the list does. A tap on the closed card opens the list, or does this when it is the only entry.",show_battery:"The battery of its device. A person shows the battery of the phone that tracks them."},de:{label:"Jede Entit\xE4t mit diesem Label kommt dazu und wird automatisch erkannt.",weather:"Zeigt Regen, Schnee und Frost im Voraus.",batteries:"Jede Batterie bei 20 % oder weniger, deren Ger\xE4t nicht l\xE4dt, wie in der Wartungsansicht von Home Assistant.",visible:"Gilt au\xDFerhalb des Bearbeitungsmodus, wie die Sichtbarkeit von Home Assistant selbst.",people:"Verglichen wird das Benutzerkonto, das unter Einstellungen \u2192 Personen verkn\xFCpft ist.",attribute:"Ein Attribut, das ein Objekt mit name oder title enth\xE4lt, oder ein einfacher Wert. Bleibt es leer, sucht die Karte ein Objekt mit description oder Bild.",attribute_picture:"Ein Attribut, das ein Objekt mit name oder title enth\xE4lt. Das Objekt erscheint statt des Zustands.",image:"Ein Attribut, ein Pfad darin wie book.cover, oder eine URL. Bleibt es leer, nimmt die Karte das Bild des gezeigten Objekts oder der Entit\xE4t.",background:"Unscharf hinter der Karte, solange diese Entit\xE4t oben steht.",before:"Wie lange vor dem Beginn oder der F\xE4lligkeit.",after:"Wie lange es nach dem Ereignis bleibt. Ein Event bleibt einen Tag, ein Kommen oder Gehen eine Stunde.",infos:"Erscheinen im Wechsel nach dem, was anliegt.",rotate:"Bei 0 bleibt die Karte stehen.",css:"Kommt nach den Styles der Karte, so l\xE4sst sich jeder Teil \xE4ndern.",visibility_intro:"Es erscheint, solange alle diese Bedingungen erf\xFCllt sind.",row_tap_action:"Was ein Tippen auf seine Zeile in der Liste tut. Ein Tippen auf die geschlossene Karte \xF6ffnet die Liste, oder tut dies, wenn es der einzige Eintrag ist.",show_battery:"Die Batterie ihres Ger\xE4ts. Eine Person zeigt die Batterie des Handys, das sie ortet."}};function jn(i,t){let e=Je(i),n=s=>s&&typeof t=="function"&&t(s)||"";return{label:s=>n(Ln[s])||Pn[e]?.[s]||Pn.en[s]||s,helper:s=>s==="visibility_intro"&&n(Ln[s])||zn[e]?.[s]||zn.en[s]}}function Hn(i,t){return[...i.values()].map(e=>{let n=ji(e.message);return{key:"s:"+e.notification_id,kind:"system",title:ft(e.title)||t.t.notification,message:ft(e.message),image:Hi(e.message),ts:S(e.created_at,t.now),past:!0,seq:e.seq,tap:n?Tt(n):void 0,dismiss:{service:["persistent_notification","dismiss",{notification_id:e.notification_id}]}}})}var zo={critical:"crit",error:"crit",warning:"warn"};function Wn(i,t){let e=(n,s)=>t.hass.localize?.(n,s)||"";return i.map(n=>{let s=n.translation_key||n.issue_id;return{key:`i:${n.domain}/${n.issue_id}`,kind:"repair",sev:zo[n.severity]||"warn",title:e(`component.${n.domain}.issues.${s}.title`,n.translation_placeholders||{})||Ze(s),message:n.breaks_in_ha_version?x(t.t.breaks_in,{v:n.breaks_in_ha_version}):e(`component.${n.issue_domain||n.domain}.title`),ts:S(n.created,t.now),past:!0,tap:Tt("/config/repairs"),dismiss:{ws:{type:"repairs/ignore_issue",domain:n.domain,issue_id:n.issue_id,ignore:!0}}}})}var Uo=(i,t)=>!i||(i.only?i.only.includes(t):!i.except.includes(t)),Qe=(i,t)=>!i.past&&i.ts>t,ti=i=>(t,e)=>typeof e=="string"&&e||i.formatEntityName?.(t,e||void 0)||t.attributes.friendly_name||t.entity_id,Dt=i=>({state:t=>i.formatEntityState?i.formatEntityState(t):String(t.state),attr:(t,e,n)=>!e.includes(".")&&i.formatEntityAttributeValue?.(t,e,n)||String(n)}),Bo=i=>Array.isArray(i.attributes.entity_id)&&!i.entity_id.startsWith("sensor.")?i.attributes.entity_id.filter(t=>typeof t=="string"):[];function Fn(i){let{hass:t,config:e,now:n,data:s}=i,o=new Set,a=[],r=new Set,c=new Set,l=m=>i.preview||Uo(e.audience[m],i.viewer),d={...i,t:i.texts,watch:m=>o.add(m),wake:m=>Number.isFinite(m)&&m>n&&a.push(m),midnight:J(O(n,i.clock.zone)+1,i.clock.zone),dayOf:(m,k=i.clock.zone)=>O(m,k),name:ti(t),...Dt(t),alikeTitle:(m,k)=>Bn(i.clock.lang,m,k,t.localize),members:m=>{let k=Bo(m);return k.forEach(E=>o.add(E)),gt(k.map(E=>t.states[E]).filter(E=>E&&Z(E)).map(E=>d.name(E)))},conditionsMet:(m,k)=>Rn(m,k,{hass:t,now:n,zone:i.clock.zone,watch:d.watch,wake:d.wake,media:i.media,server:i.serverCondition})},h=[];l("system")&&h.push(...Hn(s.notifications,d)),e.repairs&&i.admin&&l("repairs")&&h.push(...Wn(s.repairs,d));let u=[...i.sources];for(let m of[...i.updates,...i.batteries])u.some(k=>k.entity===m)||u.push({entity:m});for(let m of u){let k=m.entity;o.add(k);let E=t.states[k];!l(k)||k.startsWith("update.")&&!l("updates")||mt(E)&&!l("batteries")||((!m.visibility||d.conditionsMet(m.visibility,k))&&h.push(...ln(m,E,d)),!(!E||E.state==="unavailable"||E.state==="unknown")&&(c.add(k),Ct(m,E,t)==="battery"&&r.add("battery:"+k)))}let p=e.weather&&t.states[e.weather];if(p&&l(e.weather)){o.add(e.weather);let m=le(p),k=m&&s.forecast(e.weather,m);if(k){let E=()=>(i.windows.forEach(Ae=>o.add(Ae)),i.windows.filter(Ae=>Tn(t.states[Ae])).length);h.push(...An(p,k,m,{...d,openWindows:E})),r.add(`wx:${e.weather}:wet`).add(`wx:${e.weather}:frost`)}}let f=new Set,_=h.filter(m=>m.expires<=n||f.has(m.key)?!1:(f.add(m.key),d.wake(m.expires),m.live&&d.wake(m.ts),!0));_.some(m=>m.day||m.kind==="calendar")&&d.wake(d.midnight);let w=new Set(_.map(m=>m.entity)),$=On(Cn(e,i.sources,t,l,w),{...d,forecast:s.forecast});return{entries:_,slides:$,watched:o,wakes:a,known:r,available:c,ctx:d}}var qn=(i,t)=>Number.isFinite(i.ts)?i.past?t-i.ts:Math.abs(i.ts-t):1/0;function jo(i,t){return i.sort((e,n)=>(n.sev==="crit")-(e.sev==="crit")||qn(e,t)-qn(n,t)||(n.seq||0)-(e.seq||0)||(e.key<n.key?-1:e.key>n.key?1:0))}function Ho(i,t){let e=1/0;for(let n=1;n<i.length;n++){let[s,o]=[i[n-1],i[n]];s.sev==="crit"!=(o.sev==="crit")||!Qe(o,t)||!(o.ts>s.ts)||(e=Math.min(e,Math.max((s.ts+o.ts)/2,t+1)))}return e}function Kn(i,t){let e=jo(yn(i,t),t.now);return t.wake(Ho(e,t.now)),e}var Vn=(i,t)=>i.length?Math.min(Math.max(Math.min(...i)-t,0),864e5)+50:null;var Wo={fast:150,normal:250,slow:350};function H(i,t){let e=getComputedStyle(i).getPropertyValue(`--ha-animation-duration-${t}`).trim(),n=parseFloat(e);return Number.isFinite(n)?e.endsWith("ms")?n:n*1e3:Wo[t]}var qo=i=>1-Math.exp(-8*i)*(Math.cos(6*i)+8/6*Math.sin(6*i)),Gn=`linear(${Array.from({length:33},(i,t)=>t===32?1:+qo(t/32).toFixed(3)).join(", ")})`,M={standard:"cubic-bezier(0.4, 0, 0.2, 1)",out:"cubic-bezier(0.4, 0, 1, 1)",in:"cubic-bezier(0, 0, 0.2, 1)"},yt=class{constructor(t){this.onGone=t,this.rendered=[],this.ghosts=new Map,this.before=new Map}withLeaving(t,e){e||this.ghosts.clear();let n=new Set(t.map(o=>o.key));for(let o of this.ghosts.keys())n.has(o)&&this.ghosts.delete(o);let s=[...t];return this.rendered.forEach((o,a)=>{if(n.has(o.key))return;e&&!o.leaving&&!this.ghosts.has(o.key)&&this.ghosts.set(o.key,{...o,leaving:!0});let r=this.ghosts.get(o.key);if(!r)return;let c=s.findIndex(l=>l.key===this.rendered[a-1]?.key);s.splice(c<0?Math.min(a,s.length):c+1,0,r)}),this.rendered=s,s}measure(t){this.before=new Map([...t?.children||[]].map(e=>[e.dataset.key,{top:e.offsetTop,height:e.querySelector(".row")?.offsetHeight}]))}play(t,e){if(!t||!e)return;let n=H(t,"fast"),s=H(t,"normal"),o=getComputedStyle(t),a=o.direction==="rtl"?"-16px":"16px",r=`${-(parseFloat(o.rowGap)||0)}px`;for(let c of t.children){let l=c.dataset.key;if(c.dataset.leaving&&!this.ghosts.has(l)&&(c.getAnimations().forEach(d=>d.cancel()),delete c.dataset.leaving),this.ghosts.has(l)){if(c.dataset.leaving)continue;c.dataset.leaving="1",this.run(c,[{opacity:1,gridTemplateRows:"1fr",marginTop:"0px",transform:"none",easing:M.out},{opacity:0,gridTemplateRows:"1fr",marginTop:"0px",transform:`translateX(${a})`,offset:n/(n+s),easing:M.standard},{opacity:0,gridTemplateRows:"0fr",marginTop:r,transform:`translateX(${a})`}],n+s,()=>{this.ghosts.delete(l),this.onGone()})}else if(!this.before.has(l))this.run(c,[{opacity:0,gridTemplateRows:"0fr",marginTop:r,easing:M.standard},{opacity:0,gridTemplateRows:"1fr",marginTop:"0px",offset:s/(n+s),easing:M.in},{opacity:1,gridTemplateRows:"1fr",marginTop:"0px"}],n+s);else{let d=this.before.get(l),h=c.querySelector(".row");h.getAnimations().forEach(f=>f.cancel());let u=h.offsetHeight;Math.abs(d.height-u)>1&&this.run(c,[{height:`${d.height}px`,easing:M.standard},{height:`${u}px`}],s,null,h);let p=d.top-c.offsetTop;Math.abs(p)>1&&c.animate([{transform:`translateY(${p}px)`},{transform:"none"}],{duration:s,easing:M.standard})}}}run(t,e,n,s,o=t){t.classList.add("moving"),o.animate(e,{duration:n,fill:s?"forwards":"none"}).finished.then(()=>{t.classList.remove("moving"),s?.()},()=>o.getAnimations().length||t.classList.remove("moving"))}};var Yn=(i,t,e)=>{let n=new Map;for(let s=t;s<=e;s++)n.set(i[s],s);return n},Xn=ht(class extends V{constructor(i){if(super(i),i.type!==Kt.CHILD)throw Error("repeat() can only be used in text expressions")}dt(i,t,e){let n;e===void 0?e=t:t!==void 0&&(n=t);let s=[],o=[],a=0;for(let r of i)s[a]=n?n(r,a):a,o[a]=e(r,a),a++;return{values:o,keys:s}}render(i,t,e){return this.dt(i,t,e).values}update(i,[t,e,n]){let s=Ti(i),{values:o,keys:a}=this.dt(t,e,n);if(!Array.isArray(s))return this.ut=a,o;let r=this.ut??=[],c=[],l,d,h=0,u=s.length-1,p=0,f=o.length-1;for(;h<=u&&p<=f;)if(s[h]===null)h++;else if(s[u]===null)u--;else if(r[h]===a[p])c[p]=Y(s[h],o[p]),h++,p++;else if(r[u]===a[f])c[f]=Y(s[u],o[f]),u--,f--;else if(r[h]===a[f])c[f]=Y(s[h],o[f]),ut(i,c[f+1],s[h]),h++,f--;else if(r[u]===a[p])c[p]=Y(s[u],o[p]),ut(i,s[h],s[u]),u--,p++;else if(l===void 0&&(l=Yn(a,p,f),d=Yn(r,h,u)),l.has(r[h]))if(l.has(r[u])){let _=d.get(a[p]),w=_!==void 0?s[_]:null;if(w===null){let $=ut(i,s[h]);Y($,o[p]),c[p]=$}else c[p]=Y(w,o[p]),ut(i,s[h],w),s[_]=null;p++}else Gt(s[u]),u--;else Gt(s[h]),h++;for(;p<=f;){let _=ut(i,c[f+1]);Y(_,o[p]),c[p++]=_}for(;h<=u;){let _=s[h++];_!==null&&Gt(_)}return this.ut=a,Vt(i,c),I}});var Fo={system:"var(--info-color)",repair:"var(--warning-color)"};function he(i){return i.sev==="crit"?"var(--error-color)":i.sev==="warn"?"var(--warning-color)":i.color||(i.stateObj?Et(i.stateObj):Fo[i.kind]||"var(--state-icon-color)")}function ue(i){return i.inert?null:i.tap||(i.entity?{entity:i.entity,tap_action:{action:"more-info"}}:null)}function ei(i,t){if(!t)return null;try{return i.hassUrl(t)}catch{return null}}var Ko=(i,t)=>i.icon||t.entities?.[i.stateObj?.entity_id]?.icon||i.stateObj?.attributes.icon||N[i.kind]||N.generic;function Vo(i,t){let e=Li(i,t.states);if(!e)return g;let n=e.attribute&&customElements.get("ha-attribute-icon")?y`<ha-attribute-icon .stateObj=${i} .attribute=${e.attribute}></ha-attribute-icon>`:y`<ha-icon .icon=${e.icon}></ha-icon>`;return y`<span class="tile-badge" style="--badge-color: ${e.color}" aria-hidden="true">${n}</span>`}function pe(i,t){let e=ei(t,i.image);return y`${e?y`<img
        src=${e}
        alt=""
        decoding="async"
        draggable="false"
        referrerpolicy="no-referrer"
        @load=${n=>n.target.classList.add("ready")}
        @error=${n=>n.target.classList.remove("ready")}
      />`:g}${i.stateObj&&customElements.get("ha-state-icon")?y`<ha-state-icon .hass=${t} .stateObj=${i.stateObj} .icon=${i.icon}></ha-state-icon>`:y`<ha-icon .icon=${Ko(i,t)}></ha-icon>`}${i.stateObj?Vo(i.stateObj,t):g}`}function ts(i,t){return y`<span class="battery" style="--battery-color: ${Et(i)}"
    >${customElements.get("ha-state-icon")?y`<ha-state-icon .hass=${t} .stateObj=${i}></ha-state-icon>`:g}${Dt(t).state(i)}</span
  >`}function Jn(i,t){if(!Number.isFinite(i.ts))return y`<time class="time"></time>`;let e=t.clock.server,n=i.day?ct(O(i.ts,e)):new Date(i.ts).toISOString(),s=i.day?t.clock.absoluteDate(i.ts,e):t.clock.absolute(i.ts);return y`<time class="time" datetime=${n} title=${s}>${t.clock.entryTime(i,t.now)}</time>`}var Zn=i=>i.scrollHeight>i.clientHeight+1||i.scrollWidth>i.clientWidth+1,Qn=(i,t)=>Zn(i.querySelector(".message"))||!t&&Zn(i.querySelector(".title")),Go=i=>{let t=i.getSelection?.()||document.getSelection();return!!(t&&!t.isCollapsed&&String(t).trim())},Yo=i=>t=>{t.key!=="Enter"&&t.key!==" "||(t.preventDefault(),t.stopPropagation(),i())};function Xo(i,t){let e=ue(i),n=()=>e&&t.run(e),s=a=>{let r=a.currentTarget;Go(r.getRootNode())||(r.classList.contains("open")||Qn(r,e)?t.toggle(i.key):n())},o=!!i.message||!Number.isFinite(i.ts);return y`<div class=${G({item:!0,leaving:!!i.leaving})} role="listitem" data-key=${i.key}><div class="clip">
    <div
      class="row ${G({warn:i.sev==="warn",crit:i.sev==="crit",link:!!e,open:t.opened.has(i.key)})}"
      data-kind=${i.kind}
      style="--tile-color: ${he(i)}"
      @click=${s}
      @pointerenter=${a=>a.currentTarget.classList.toggle("expandable",Qn(a.currentTarget,e))}
    >
      <div
        class="icon"
        role=${e?"button":g}
        tabindex=${e?"0":g}
        aria-label=${e?i.title:g}
        @click=${a=>e&&(a.stopPropagation(),n())}
        @keydown=${e?Yo(n):g}
      >
        ${pe(i,t.hass)}
      </div>
      <div class="title">${i.title}</div>
      <div class="meta">
        ${o?Jn(i,t):g}
        ${re(i)?y`<button class="dismiss" type="button" aria-label=${t.texts.dismiss} title=${t.texts.dismiss} @click=${a=>(a.stopPropagation(),t.dismiss(i,a.detail===0))}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>`:g}
      </div>
      <div class="message">${i.message||(o?"":Jn(i,t))}</div>
      ${i.actions?.length?y`<div class="actions">
            ${i.actions.map(a=>y`<button class="action" type="button" ?disabled=${a.disabled} @click=${r=>(r.stopPropagation(),t.run(a.action))}>${a.label}</button>`)}
          </div>`:g}
    </div>
  </div></div>`}function me(i,t,e){let n=[...i.querySelectorAll(".item:not(.leaving)")];(n[Math.min(t,n.length-1)]?.querySelector(".dismiss, .icon[role=button]")||e)?.focus({preventScroll:!0})}var fe=(i,t)=>Xn(i,e=>e.key,e=>Xo(e,t));var _e=(i,t)=>zt(i.renderRoot,[...i.constructor.elementStyles,Lt(t)]),ge=L`
  .list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .item {
    display: grid;
    grid-template-rows: 1fr;
  }
  .clip {
    min-height: 0;
  }
  .item.moving > .clip,
  .item.moving .row {
    overflow: hidden;
  }
  .row {
    position: relative;
    display: grid;
    grid-template-columns: var(--origami-row-tile) minmax(0, 1fr) auto;
    grid-template-areas: "icon title meta" "icon message message" ". actions actions";
    align-content: start;
    align-items: center;
    column-gap: var(--origami-gap);
    padding: 6px 4px;
    background: var(--origami-row-bg);
    border-radius: var(--origami-radius);
    transition: background-color var(--ha-animation-duration-normal, 250ms) ease-in-out;
  }
  .row.crit {
    background: color-mix(in srgb, var(--error-color) 12%, var(--origami-row-bg));
  }
  .row.link,
  .row.expandable,
  .row.open {
    cursor: pointer;
  }
  .item.leaving {
    pointer-events: none;
  }
  .row .icon {
    grid-area: icon;
    align-self: start;
    width: var(--origami-row-tile);
    height: var(--origami-row-tile);
  }
  .row .icon[role="button"] {
    cursor: pointer;
  }
  .row .title {
    grid-area: title;
    min-width: 0;
    color: var(--primary-text-color);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: var(--ha-line-height-normal, 1.6);
    letter-spacing: 0.1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .meta {
    grid-area: meta;
    align-self: start;
    min-height: calc(var(--ha-font-size-m, 14px) * var(--ha-line-height-normal, 1.6));
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .time {
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-s, 12px);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    white-space: nowrap;
  }
  .message {
    grid-area: message;
    margin-top: var(--ha-space-1, 4px);
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-s, 12px);
    line-height: 1.4;
    letter-spacing: 0.2px;
    overflow-wrap: anywhere;
    text-wrap: pretty;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    max-height: 2.8em;
    overflow: hidden;
  }
  .message:empty {
    display: none;
  }
  .message .time {
    font-size: inherit;
    line-height: inherit;
  }
  .row:is(.open, :has(:focus-visible)) .title {
    white-space: normal;
    overflow-wrap: anywhere;
    text-wrap: pretty;
  }
  .row:is(.open, :has(:focus-visible)) .message {
    display: block;
    -webkit-line-clamp: unset;
    line-clamp: none;
    max-height: none;
    white-space: pre-line;
    user-select: text;
    cursor: text;
  }
  button {
    appearance: none;
    font: inherit;
    touch-action: manipulation;
    border: none;
    cursor: pointer;
  }
  .dismiss {
    position: relative;
    width: 32px;
    height: 32px;
    margin: -5px -4px -5px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: transparent;
    color: var(--secondary-text-color);
    border-radius: 50%;
    --mdc-icon-size: 20px;
  }
  .dismiss::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: currentColor;
    opacity: 0;
    transition: opacity var(--ha-animation-duration-fast, 150ms) ease;
  }
  .dismiss::before {
    content: "";
    position: absolute;
    inset: -6px -4px;
  }
  .dismiss:active::after {
    opacity: 0.16;
  }
  .dismiss ha-icon {
    display: flex;
  }
  .actions {
    grid-area: actions;
    display: flex;
    flex-wrap: wrap;
    gap: var(--ha-space-2, 8px);
    margin: var(--ha-space-2, 8px) 0 2px;
  }
  /* Sized and shaped like a small filled ha-button, see ha-button.ts. */
  .action {
    height: var(--ha-button-height, var(--button-height, 32px));
    padding: 0 12px;
    background: var(--ha-color-fill-primary-normal-resting, color-mix(in srgb, var(--primary-color) 14%, transparent));
    color: var(--ha-color-on-primary-normal, var(--primary-color));
    border-radius: var(--ha-button-border-radius, var(--ha-border-radius-pill, 9999px));
    box-shadow: var(--ha-button-box-shadow, none);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    white-space: nowrap;
    transition: background-color var(--ha-animation-duration-fast, 150ms) ease-out;
  }
  .action:active {
    background: var(--ha-color-fill-primary-normal-active, color-mix(in srgb, var(--primary-color) 24%, transparent));
  }
  .action[disabled] {
    background: var(--ha-color-fill-disabled-normal-resting, color-mix(in srgb, var(--primary-text-color) 8%, transparent));
    color: var(--ha-color-on-disabled-normal, var(--disabled-text-color));
    pointer-events: none;
  }
  .row .icon:focus-visible,
  .dismiss:focus-visible,
  .action:focus-visible {
    outline: 2px solid var(--origami-focus);
    outline-offset: -2px;
  }
  @media (hover: hover) {
    .row:is(.link, .expandable, .open):hover {
      background-color: var(--origami-hover);
    }
    .row.crit.link:hover {
      background-color: color-mix(in srgb, var(--error-color) 16%, var(--origami-hover));
    }
    .dismiss:hover::after {
      opacity: 0.1;
    }
    .row .icon[role="button"]:hover::before {
      opacity: 0.35;
    }
    .action:hover {
      background: var(--ha-color-fill-primary-normal-hover, color-mix(in srgb, var(--primary-color) 20%, transparent));
    }
  }
`,ye=L`
  .icon {
    position: relative;
    flex: none;
    width: var(--origami-tile);
    height: var(--origami-tile);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--ha-tile-icon-border-radius, var(--ha-border-radius-pill, 9999px));
    color: var(--tile-color);
    --mdc-icon-size: var(--origami-icon);
    transition: color var(--ha-animation-duration-normal, 250ms) ease-in-out;
    outline: none;
  }
  .icon::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: var(--tile-color);
    opacity: 0.2;
    transition:
      background-color var(--ha-animation-duration-normal, 250ms) ease-in-out,
      opacity var(--ha-animation-duration-normal, 250ms) ease-in-out;
  }
  .glyph {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: inherit;
  }
  .icon :is(ha-icon, ha-state-icon) {
    display: flex;
  }
  .icon img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
    opacity: 0;
    transition: opacity var(--ha-animation-duration-normal, 250ms) ease-in-out;
    -webkit-user-drag: none;
  }
  .icon img.ready {
    opacity: 1;
  }
  .icon img.ready ~ :is(ha-icon, ha-state-icon) {
    visibility: hidden;
  }
  /* Sized like ha-tile-badge.ts. It sits below, since the count takes the top of the card's icon. */
  .tile-badge {
    position: absolute;
    bottom: -3px;
    inset-inline-end: -3px;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--badge-color);
    color: var(--white-color, #fff);
    border-radius: var(--ha-border-radius-md, 8px);
    box-shadow: 0 0 0 2px var(--origami-card-bg);
    --mdc-icon-size: 12px;
    transition: background-color var(--ha-animation-duration-normal, 250ms) ease-in-out;
  }
  .tile-badge > * {
    display: flex;
  }
  .battery {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    vertical-align: bottom;
    white-space: nowrap;
  }
  .battery ha-state-icon {
    display: flex;
    color: var(--battery-color);
    --mdc-icon-size: 1.2em;
  }
`,be=L`
  :host {
    --origami-pad: 10px;
    --origami-gap: 10px;
    --origami-radius: var(--ha-border-radius-md, 8px);
    --origami-tile: 36px;
    --origami-row-tile: 40px;
    --origami-icon: 24px;
    --origami-card-bg: var(--ha-card-background, var(--card-background-color, #fff));
    --origami-row-bg: transparent;
    --origami-hover: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
    --origami-focus: var(--ha-color-focus, var(--primary-color));
    -webkit-tap-highlight-color: transparent;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`,es=L`
  :host {
    --origami-bg-auto: 0.22;
    display: grid;
  }
  :host(.dark) {
    --origami-bg-auto: 0.32;
  }
  :host([hidden]) {
    display: none !important;
  }
  :host(.hiding) {
    pointer-events: none;
  }
  :host([preview]) *,
  :host([preview]) *::before {
    transition: none !important;
    animation: none !important;
  }
  ha-card {
    --tile-color: var(--state-inactive-color);
    display: flex;
    flex-direction: column;
    min-height: 0;
    max-height: var(--origami-max-height, none);
    overflow: hidden;
    isolation: isolate;
    background: var(--origami-card-bg);
    user-select: none;
    -webkit-touch-callout: none;
    transition: box-shadow var(--ha-animation-duration-normal, 250ms) ease-in-out, border-color var(--ha-animation-duration-normal, 250ms) ease-in-out;
  }
  ha-card:has(.head:focus-visible) {
    border-color: var(--tile-color);
    box-shadow: var(--ha-card-box-shadow, 0 0 0 0 transparent), 0 0 0 1px var(--tile-color);
  }
  :host(.docked) ha-card {
    max-height: var(--origami-max-height, 25dvh);
  }
  :host(.bounded) {
    height: 100%;
  }
  :host(.bounded) ha-card:not(.open) .head-wrap {
    flex: 1 1 auto;
  }
  :host(.bounded) ha-card:not(.open) .head {
    height: 100%;
  }

  .backdrop,
  .pulse {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    border-radius: inherit;
    pointer-events: none;
  }
  .backdrop img {
    --blur: var(--origami-bg-blur, 24px);
    position: absolute;
    top: calc(var(--blur) * -2);
    left: calc(var(--blur) * -2);
    width: calc(100% + var(--blur) * 4);
    height: calc(100% + var(--blur) * 4);
    max-width: none;
    object-fit: cover;
    filter: blur(var(--blur)) saturate(1.3);
    opacity: 0;
    transition: opacity calc(2 * var(--ha-animation-duration-slow, 350ms)) ease-in-out;
  }
  .backdrop img.on {
    opacity: var(--origami-bg-opacity, var(--origami-bg-auto));
  }
  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active) {
    .backdrop {
      display: none;
    }
  }

  .pulse {
    background: var(--error-color);
    opacity: 0;
  }
  @keyframes pulse {
    to {
      opacity: var(--origami-pulse-opacity, 0.3);
    }
  }
  ha-card.crit:not(.open) .pulse {
    animation: pulse 1s ease-in-out infinite alternate;
  }
  @media (prefers-reduced-motion: reduce) {
    ha-card.crit:not(.open) .pulse {
      animation: none;
      opacity: var(--origami-pulse-opacity, 0.3);
    }
  }

  .head-wrap,
  .drawer {
    display: grid;
    transition: grid-template-rows var(--ha-animation-duration-normal, 250ms) ease-in-out;
  }
  .head-wrap {
    flex: none;
    grid-template-rows: 1fr;
  }
  .drawer {
    flex: 0 1 auto;
    min-height: 0;
    grid-template-rows: 0fr;
  }
  ha-card.open .head-wrap {
    grid-template-rows: 0fr;
  }
  ha-card.open .drawer {
    grid-template-rows: 1fr;
  }
  .head,
  .inner {
    min-height: 0;
    overflow: hidden;
    transition:
      opacity var(--ha-animation-duration-fast, 150ms) ease-in-out,
      visibility 0s var(--ha-animation-duration-normal, 250ms);
  }
  ha-card:not(.open) .inner,
  ha-card.open .head {
    opacity: 0;
    visibility: hidden;
  }
  ha-card.open .inner,
  ha-card:not(.open) .head {
    transition:
      opacity var(--ha-animation-duration-fast, 150ms) ease-in-out var(--ha-animation-duration-instant, 75ms),
      visibility 0s;
  }

  .head,
  .bar {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--origami-gap);
    padding: 0 var(--origami-pad);
    outline: none;
  }
  .head {
    touch-action: pan-y;
  }
  ha-card.tappable .head,
  .bar {
    cursor: pointer;
  }
  ha-card:not(.tappable) .head ha-ripple {
    display: none;
  }
  ha-ripple {
    --ha-ripple-color: var(--tile-color);
    --ha-ripple-hover-opacity: 0.04;
    --ha-ripple-pressed-opacity: 0.12;
  }
  .head .icon.idle {
    color: var(--state-inactive-color);
  }
  .badge {
    position: absolute;
    top: -2px;
    inset-inline-end: -6px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-color);
    color: var(--text-accent-color, var(--text-primary-color, #fff));
    border-radius: 8px;
    box-shadow: 0 0 0 2px var(--origami-card-bg);
    font-size: var(--ha-font-size-xs, 10px);
    font-weight: var(--ha-font-weight-medium, 500);
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  .texts {
    flex: 1 1 auto;
    min-width: 0;
    min-height: max(var(--row-height, 56px), calc(var(--origami-tile) + 2 * var(--origami-pad)));
    align-self: stretch;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    margin-inline: calc(var(--origami-gap) * -1);
    padding-inline: var(--origami-gap);
    overflow: hidden;
  }
  .texts.up {
    mask-image: linear-gradient(to bottom, transparent, #000 8px, #000 calc(100% - 8px), transparent);
  }
  .texts.side {
    mask-image: linear-gradient(to right, transparent, #000 var(--origami-gap), #000 calc(100% - var(--origami-gap)), transparent);
  }
  .slide {
    grid-area: 1 / 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--ha-tile-info-gap, 0);
  }
  .head :is(.title, .secondary) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .head .title {
    color: var(--ha-tile-info-primary-color, var(--primary-text-color));
    font-size: var(--ha-tile-info-primary-font-size, var(--ha-font-size-m, 14px));
    font-weight: var(--ha-tile-info-primary-font-weight, var(--ha-font-weight-medium, 500));
    line-height: var(--ha-tile-info-primary-line-height, var(--ha-line-height-normal, 1.6));
    letter-spacing: var(--ha-tile-info-primary-letter-spacing, 0.1px);
  }
  .head .secondary {
    color: var(--ha-tile-info-secondary-color, var(--primary-text-color));
    font-size: var(--ha-tile-info-secondary-font-size, var(--ha-font-size-s, 12px));
    font-weight: var(--ha-tile-info-secondary-font-weight, var(--ha-font-weight-normal, 400));
    line-height: var(--ha-tile-info-secondary-line-height, var(--ha-line-height-condensed, 1.2));
    letter-spacing: var(--ha-tile-info-secondary-letter-spacing, 0.4px);
  }
  .head .secondary.time {
    font-variant-numeric: tabular-nums;
  }
  .head state-display {
    display: inline;
  }
  .head :is(.title, .secondary) > span {
    display: inline-block;
  }
  .head [data-long] {
    text-overflow: clip;
    mask-image: linear-gradient(to right, transparent, #000 var(--fade-start, 0px), #000 calc(100% - var(--fade-end, 0px)), transparent);
  }
  .head [data-long]:dir(rtl) {
    mask-image: linear-gradient(to left, transparent, #000 var(--fade-start, 0px), #000 calc(100% - var(--fade-end, 0px)), transparent);
  }
  @media (prefers-reduced-motion: reduce) {
    .head :is(.title, .secondary) > span {
      display: inline;
    }
  }
  :host([preview]) .head :is(.title, .secondary) > span {
    display: inline;
  }

  .cycle {
    position: absolute;
    inset: -4px;
    padding: 2px;
    border-radius: calc(var(--ha-tile-icon-border-radius, var(--ha-border-radius-pill, 9999px)) + 4px);
    color: color-mix(in srgb, var(--tile-color) 60%, transparent);
    mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
    animation: origami-cycle-fade var(--origami-cycle, 8s) linear both;
    pointer-events: none;
  }
  .cycle i {
    position: absolute;
    inset: 0;
    clip-path: inset(0 0 0 50%);
  }
  .cycle i + i {
    clip-path: inset(0 50% 0 0);
  }
  .cycle i::before {
    content: "";
    position: absolute;
    inset: -25%;
    background: linear-gradient(to right, currentColor 50%, transparent 0);
    animation: origami-cycle-right var(--origami-cycle, 8s) linear both;
  }
  .cycle i + i::before {
    background: linear-gradient(to left, currentColor 50%, transparent 0);
    animation-name: origami-cycle-left;
  }
  @keyframes origami-cycle-right {
    50%,
    100% {
      transform: rotate(180deg);
    }
  }
  @keyframes origami-cycle-left {
    0%,
    50% {
      transform: none;
    }
    100% {
      transform: rotate(180deg);
    }
  }
  @keyframes origami-cycle-fade {
    0%,
    92% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .chevron {
    flex: none;
    color: var(--secondary-text-color);
    --mdc-icon-size: 20px;
  }
  :host(.narrow) .head .chevron,
  :host(.vertical) .head .chevron {
    display: none;
  }
  :host(.vertical) .head {
    flex-direction: column;
    justify-content: center;
    padding: 10px var(--ha-space-2, 8px);
    text-align: center;
  }
  :host(.vertical) .texts {
    min-height: 0;
  }

  .bar {
    flex: none;
    min-height: 48px;
  }
  .bar:focus-visible,
  .clear:focus-visible {
    outline: 2px solid var(--origami-focus);
    outline-offset: -2px;
  }
  .bar:focus-visible {
    border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
  }
  .count {
    flex: 1 1 auto;
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    font-variant-numeric: tabular-nums;
  }
  .inner {
    display: flex;
    flex-direction: column;
  }
  ha-card.open .inner {
    padding-bottom: var(--ha-space-2, 8px);
  }
  .list {
    flex: 0 1 auto;
    min-height: 0;
    padding: 0 calc(var(--origami-pad) - 4px);
  }
  :host(:is(.docked, .bounded, .capped)) .list {
    overflow: hidden;
    overscroll-behavior: contain;
    scrollbar-width: thin;
  }
  :host(:is(.docked, .bounded, .capped)) ha-card.settled .list {
    overflow-y: auto;
  }
  :host(.with-backdrop) .row {
    background: color-mix(in srgb, var(--origami-card-bg) 60%, transparent);
  }
  :host(.with-backdrop) .row.crit {
    background: color-mix(in srgb, var(--error-color) 16%, color-mix(in srgb, var(--origami-card-bg) 60%, transparent));
  }
  .foot-wrap {
    flex: none;
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    visibility: hidden;
    transition:
      grid-template-rows var(--ha-animation-duration-normal, 250ms) ease-in-out,
      opacity var(--ha-animation-duration-fast, 150ms) ease-in-out,
      visibility 0s var(--ha-animation-duration-normal, 250ms);
  }
  .foot-wrap.shown {
    grid-template-rows: 1fr;
    opacity: 1;
    visibility: visible;
    transition-delay: 0s;
  }
  .foot-wrap > .clip {
    overflow: hidden;
  }
  .foot {
    margin: var(--ha-space-2, 8px) var(--origami-pad) 0;
    border-top: 1px solid var(--divider-color, color-mix(in srgb, currentColor 12%, transparent));
    padding-top: var(--ha-space-2, 8px);
    text-align: end;
  }
  .clear {
    height: 36px;
    padding: 0 12px;
    background: transparent;
    color: var(--ha-color-on-primary-normal, var(--primary-color));
    border-radius: var(--ha-border-radius-pill, 9999px);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    transition: background-color var(--ha-animation-duration-fast, 150ms) ease-out;
  }
  .clear:active {
    background: var(--ha-color-fill-primary-quiet-active, color-mix(in srgb, var(--primary-color) 12%, transparent));
  }
  @media (hover: hover) {
    .clear:hover {
      background: var(--ha-color-fill-primary-quiet-hover, color-mix(in srgb, var(--primary-color) 8%, transparent));
    }
    .bar:hover .chevron {
      color: var(--primary-text-color);
    }
  }
  .say {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;var Jo=i=>i.unsub.then(t=>t()).catch(()=>{}),we=class{constructor(){this.subs=new Map}sync(t){for(let[e,n]of this.subs){let s=t.get(e);s&&!(n.failed&&n.retryOn!==s.retryOn)||(this.subs.delete(e),Jo(n))}for(let[e,{start:n,retryOn:s}]of t){if(this.subs.has(e))continue;let o={retryOn:s,failed:!1};o.unsub=Promise.resolve().then(n),o.unsub.catch(()=>o.failed=!0),this.subs.set(e,o)}}clear(){this.sync(new Map)}};var ni=K+"-dialog",Zo=300,Qo=2*6e4,Rt=1500,ta=2e3,is=30,ea=1e4,ns=16,ia=["connection","user","locale","config","localize","entities","devices","areas","services","themes","formatEntityState","formatEntityName","formatEntityAttributeValue"],bt=(i,t,e)=>i.dispatchEvent(new CustomEvent(t,{bubbles:!0,composed:!0,detail:e})),ii=new Set;for(let i of["ha-state-icon","state-display","ha-ripple","ha-attribute-icon"])customElements.get(i)||customElements.whenDefined(i).then(()=>ii.forEach(t=>t.requestUpdate()));var ve=class extends D{static styles=[be,ye,ge,es];static properties={preview:{type:Boolean,reflect:!0}};constructor(){super(),this.connectedWhileHidden=!0,this.preview=!1,this._data={notifications:new Map,repairs:[],todos:new Map,forecasts:new Map,conditions:new Map,history:new Map},this._seq=0,this._subs=new we,this._dismissals=new ae(()=>this._refresh()),this._onDetails=()=>this._refresh(),this._motion=new yt(()=>this.requestUpdate()),this._entries=[],this._slides=[],this._turnable=[],this._watched=[],this._wakes=[],this._opened=new Set,this._things=new Map,this._media=new Map,this._backdrops=[{},{}],this._open=!1,this._visible=!0,this._cycleKey=0,this._now=Date.now()}static getConfigElement(){return document.createElement(K+"-editor")}static getStubConfig(){return{}}setConfig(t){this._config=oe(t),this.classList.toggle("vertical",this._config.vertical),this.classList.toggle("bounded",typeof t.grid_options?.rows=="number"),this._derived=null,this._refresh(),this._cycle()}set hass(t){let e=this._hass;this._hass=t,(!e||ia.some(n=>e[n]!==t[n])||this._watched.some(n=>e.states[n]!==t.states[n]))&&this._refresh()}get hass(){return this._hass}getCardSize(){return this._open?1+this.listed().length:this._config?.vertical?2:1}getGridOptions(){return{columns:12,rows:"auto",min_columns:this._config?.vertical?3:6}}connectedCallback(){super.connectedCallback(),ii.add(this),clearTimeout(this._collapseTimer);let t=this.getRootNode().host?.localName;this.classList.toggle("docked",t==="hui-view-footer"),this._inPicker=t==="hui-card-picker",this._dismissals.connect(),this._onVisibility||=()=>{document.hidden||this._cycle(),this._onView(this._visible)},document.addEventListener("visibilitychange",this._onVisibility),this._resize||=new ResizeObserver(([n])=>this._onResize(n.contentRect.width)),this._view||=window.IntersectionObserver&&new IntersectionObserver(n=>this._onView(n.at(-1).isIntersecting),{threshold:.01}),this._view?.observe(this);let e=this.renderRoot?.querySelector("ha-card");e&&this._resize.observe(e),this._painted=!1,this._intro=!0,this._refresh(),this._cycle()}disconnectedCallback(){super.disconnectedCallback(),ii.delete(this),this._subs.clear(),this._dismissals.disconnect(),this._gestures?.reset();for(let t of this._media.values())t.onchange=null;this._media.clear(),document.removeEventListener("visibilitychange",this._onVisibility),this._resize?.disconnect(),this._view?.disconnect(),[this._wakeTimer,this._clock,this._turnTimer,this._repairsTimer,this._holdTimer,this._showTimer].forEach(clearTimeout),cancelAnimationFrame(this._frameId),this._sizes?.disconnect(),this._collapseTimer=setTimeout(()=>this._setOpen(!1),150)}_derive(){let t=this._hass,e=this._config,n=[e,t.entities,t.devices,t.locale,t.localize,t.config,t.user];if(this._derived?.key.every((h,u)=>h===n[u]))return this._derived;let s=de(t),o=Un(s,t.localize),a=t.entities||{},r=new Set(e.entities.map(h=>h.entity)),c=e.label?Object.keys(a).filter(h=>!r.has(h)&&a[h]?.labels?.includes(e.label)):[],l=[...new Set(Object.values(e.audience).flatMap(h=>h.only||h.except))],d=new Map;for(let[h,u]of Object.entries(a))u?.device_id&&/^(image|camera)\./.test(h)&&d.set(u.device_id,[...d.get(u.device_id)||[],h].sort().reverse());return this._derived={key:n,lang:s,texts:o,clock:new Yt(t,s,o),sources:[...e.entities,...c.map(h=>({entity:h}))],people:l,viewer:l.find(h=>t.states[h]?.attributes.user_id===t.user?.id)||"",updates:e.updates?[...new Set([...Object.keys(t.states),...Object.keys(a)])].filter(h=>h.startsWith("update.")):[],batteries:e.batteries?Object.keys(t.states).filter(h=>mt(t.states[h])):[],windows:e.weather?En(t.states):[],pictures:h=>d.get(a[h]?.device_id)||[]},this._derived}_refresh(){let t=this._hass;if(!t||!this._config)return;let e=this._derive(),n=this._data,s=Date.now(),o={todos:new Set,forecasts:new Map,conditions:new Map,history:new Map},a=Fn({hass:t,config:this._config,now:s,texts:e.texts,clock:e.clock,admin:!!t.user?.is_admin,viewer:e.viewer,preview:this.preview,sources:e.sources,updates:e.updates,batteries:e.batteries,windows:e.windows,devicePictures:e.pictures,details:u=>pn(t,u,this._onDetails),todos:u=>(o.todos.add(u),n.todos.get(u)),history:(u,p)=>(o.history.set(u,Math.max(o.history.get(u)||0,p)),n.history.get(u)),media:u=>this._matches(u),serverCondition:u=>{let p=JSON.stringify(u);return o.conditions.set(p,u),n.conditions.get(p)||{result:!1,failed:!1}},data:{notifications:n.notifications,repairs:n.repairs,forecast:(u,p)=>(o.forecasts.set(`${u}|${p}`,[u,p]),n.forecasts.get(`${u}|${p}`))}});this._sync(o);for(let u of a.entries)(u.kind==="attribute"||u.kind==="picture")&&this._things.set(u.key,u.entity);let r=new Set([...a.known,...[...this._things].filter(([,u])=>a.available.has(u)).map(([u])=>u)]),c=Kn(this._dismissals.apply(a.entries,r,s,a.ctx.wake),a.ctx),l=this._seen&&c.find(u=>!this._seen.has(u.key)&&Math.abs(s-u.ts)<Qo);l&&(this._say=[l.title,l.message].filter(Boolean).join(". ")),this._seen=new Set(c.map(u=>u.key)),this._entries=c,this._slides=a.slides;let d=new Set([...c.map(u=>u.key),...a.slides.map(u=>u.row)]);for(let u of this._opened)d.has(u)||this._opened.delete(u);this._watched=[...a.watched,...e.people],this._wakes=a.wakes,this._now=s,this._pick(l),clearTimeout(this._wakeTimer);let h=this.isConnected?Vn(this._wakes,s):null;h!==null&&(this._wakeTimer=setTimeout(()=>this._refresh(),h)),this._tick(),this.requestUpdate(),this._dialog?.requestUpdate()}_sync(t){let e=this._hass,n=e.connection,s=new Map,o=(a,r,c,l)=>s.set(a,{retryOn:l,start:()=>n.subscribeMessage(c,r)});if(n&&this.isConnected){o("notifications",{type:"persistent_notification/subscribe"},a=>this._onNotifications(a)),this._config.repairs&&e.user?.is_admin&&s.set("repairs",{start:()=>(this._fetchRepairs(),n.subscribeEvents(()=>{clearTimeout(this._repairsTimer),this._repairsTimer=setTimeout(()=>this._fetchRepairs(),500)},"repairs_issue_registry_updated"))});for(let a of t.todos)o("todo|"+a,{type:"todo/item/subscribe",entity_id:a},r=>this._store("todos",a,r.items||[]),e.states[a]);for(let[a,[r,c]]of t.forecasts)o("forecast|"+a,{type:"weather/subscribe_forecast",entity_id:r,forecast_type:c},l=>this._store("forecasts",a,l.forecast||[]),e.states[r]);for(let[a,r]of t.conditions)o("condition|"+a,{type:"subscribe_condition",condition:r},c=>this._store("conditions",a,{result:c.result===!0,failed:!!c.error}));for(let[a,r]of t.history)s.set(`history|${a}|${r}`,{retryOn:e.states[a],start:()=>this._history(a,r)})}this._subs.sync(s);for(let a of["todos","forecasts","conditions","history"])for(let r of this._data[a].keys())t[a].has(r)||this._data[a].delete(r)}_history(t,e){let n=!0,s={type:"history/stream",entity_ids:[t],start_time:new Date(Date.now()-e).toISOString(),minimal_response:!1,significant_changes_only:!0,no_attributes:!t.startsWith("person.")};return this._hass.connection.subscribeMessage(o=>{let a=o.states?.[t]||[];!n&&!a.length||(this._data.history.set(t,Ki(n?[]:this._data.history.get(t)||[],a,Date.now()-e)),n=!1,this._refresh())},s)}_store(t,e,n){this._data[t].set(e,n),this._refresh()}_onNotifications({type:t,notifications:e={}}){t==="current"&&(this._data.notifications=new Map);for(let[n,s]of Object.entries(e))t==="removed"?this._data.notifications.delete(n):this._data.notifications.set(n,{...s,seq:++this._seq});this._refresh()}async _fetchRepairs(){let t=this._hass;try{let{issues:e=[]}=await t.callWS({type:"repairs/list_issues"});if(this._data.repairs=e.filter(n=>!n.ignored),this._refresh(),!this._data.repairs.length)return;await t.loadBackendTranslation?.("issues",[...new Set(this._data.repairs.map(n=>n.domain))]),await t.loadBackendTranslation?.("title",[...new Set(this._data.repairs.map(n=>n.issue_domain||n.domain))])}catch{}}_matches(t){if(!this.isConnected)return window.matchMedia(t).matches;if(!this._media.has(t)){let e=window.matchMedia(t);e.onchange=()=>this._refresh(),this._media.set(t,e)}return this._media.get(t).matches}listed(){let t=new Map;for(let e of this._slides)t.has(e.row)||t.set(e.row,e);return[...this._entries,...[...t.values()].map(e=>this._infoRow(e))]}_formatters(){return{...Dt(this._hass),clock:this._derive().clock,now:this._now}}_withBattery(t,e){return e.battery?y`${t} · ${ts(e.battery,this._hass)}`:t}_infoRow(t){let e=this._hass.states[t.entity],n=this._infoAction(t,"tap");return{key:t.row,kind:"info",title:t.title,message:this._withBattery(t.text??Ge(e,t.content??t.info.state_content,t.name,this._formatters()),t),icon:t.icon,image:t.image,stateObj:e,color:t.color,ts:NaN,tap:n,inert:!n,actions:[]}}_infoAction(t,e){let n=t.info,s={entity:t.entity,tap_action:n.tap_action||{action:"more-info"},hold_action:n.hold_action,double_tap_action:n.double_tap_action},o=s[e+"_action"];return o&&o.action!=="none"?{...s,gesture:e}:null}_run({gesture:t="tap",...e}){bt(this,"hass-action",{config:e,action:t})}dismiss(t){let e=this._hass;this._dismissals.dismiss(t,n=>n.service?e.callService(...n.service):e.callWS(n.ws))}_pick(t){let e=this._entries.filter(c=>c.sev==="crit"),n=e.length?e:[...this._entries,...this._slides],s=n[0]||null,o=!!(s&&s.kind!=="info"&&s.key!==this._topKey);this._topKey=s?.key,this._turnable=n;let a=n.find(c=>c.key===this._target?.key),r=t&&this._config.rotate?n.find(c=>c.key===t.key):null;r?(a=r,this._byHand=!1):(!a||o||!this._turned||!(this._config.rotate||this._byHand))&&(a=s),this._show(a,1,this._config.slide==="side")}_show(t,e,n,s=!1){if(this._target=t,clearTimeout(this._showTimer),t?.key===this._shown?.key){this._shown=t;return}let o=this._shownAt+ta-Date.now();if(this._turnable.some(l=>l.key===this._shown?.key)&&!s&&o>0){this._showTimer=setTimeout(()=>this._show(this._target,e,n,!0),o);return}let r=this._shown;this._shown=t,this._shownAt=Date.now(),this._cycle();let c=this.renderRoot?.querySelector(".slide:not(.leaving)");r&&c&&this._animate()&&!this._open?this._turn(r,c,e,n):c&&(c.style.transform=c.style.opacity="")}async _turn(t,e,n,s){let o=getComputedStyle(e),a={transform:o.transform,opacity:o.opacity,filter:o.filter},r=[...e.querySelectorAll(":scope > div")].map(p=>[p.hasAttribute("data-long"),p.getAttribute("style"),p.firstElementChild.getAttribute("style")]);e.style.transform=e.style.opacity="",this._turnAnims?.forEach(p=>p.cancel());let c=n*(s&&this._rtl()?-1:1),l=this._leaving={entry:t,side:s};await this.updateComplete,this.renderRoot.querySelectorAll(".slide.leaving > div").forEach((p,f)=>{let[_,w,$]=r[f]||[];p.toggleAttribute("data-long",!!_),p.setAttribute("style",w||""),p.firstElementChild.setAttribute("style",$||"")});let d={duration:H(this,"slow")*.8,easing:M.out,fill:"forwards"},[h,u]=s?["X",24]:["Y",12];this._turnAnims=[this.renderRoot.querySelector(".slide.leaving").animate([a,{transform:`translate${h}(${-c*u}px)`,opacity:0,filter:"blur(4px)"}],d),this.renderRoot.querySelector(".head .glyph.leaving").animate([{opacity:1},{opacity:0,transform:"scale(0.8)",filter:"blur(2px)"}],d),...this._enter(c,s,H(this,"slow")*.35)],await Promise.all(this._turnAnims.map(p=>p.finished)).catch(()=>{}),this._leaving===l&&(this._leaving=null,this.requestUpdate())}_enter(t,e,n=0){let[s,o]=e?["X",24]:["Y",12],a={duration:H(this,"slow")*2,delay:n,easing:Gn,fill:"backwards"};return[this.renderRoot.querySelector(".slide:not(.leaving)").animate([{transform:`translate${s}(${t*o}px)`,opacity:0,filter:"blur(4px)"},{transform:"none",opacity:1,filter:"none"}],a),this.renderRoot.querySelector(".head .glyph:not(.leaving)").animate([{opacity:0,transform:"scale(0.8)",filter:"blur(2px)"},{opacity:1,transform:"none",filter:"none"}],a)]}_step(t,e){let n=this._turnable;if(n.length<2)return;this._turned=!0,e!=="auto"&&(this._byHand=!0);let s=Math.max(0,n.findIndex(o=>o.key===this._shown?.key));this._show(n[(s+t+n.length)%n.length],t,e==="swipe"||this._config.slide==="side",!0),this._tick()}_cycle(){this._cycleKey++,this._cycleAt=Date.now(),this._turnAfter(this._config?.rotate*1e3),this.requestUpdate()}_turnAfter(t){clearTimeout(this._turnTimer),t>0&&this.isConnected&&(this._turnTimer=setTimeout(()=>this._autoTurn(),t-(Date.now()-this._cycleAt)))}_autoTurn(){let t=this._shown,e=this._visible&&!document.hidden;this._config.rotate>0&&e&&!this._open&&!this._dialog&&!this._gestures?.press&&this._step(1,"auto"),this._shown===t&&e&&this._cycle()}_scroll(){this._scrolled=this._cycleKey;let t=this._shown?.key,e=this._marquee,n=!!(e&&e.key===t&&!e.back&&e.end&&performance.now()>=e.end);this._sizes||=new ResizeObserver(()=>this._measure()),this._sizes.disconnect();let s=[...this.renderRoot.querySelectorAll(".head .slide:not(.leaving) > div")];for(let o of s)[o,o.firstElementChild].forEach(a=>this._sizes.observe(a));this._marquee={key:t,back:n,rtl:this._rtl(),start:performance.now(),end:0,lines:s.map(o=>({line:o,over:0}))},this._measure()}_measure(){let t=this._marquee,e=this.preview||this._matches("(prefers-reduced-motion: reduce)");for(let a of t.lines){let r=e?0:a.line.firstElementChild.offsetWidth-a.line.clientWidth;a.over=r>1?r:0,a.line.toggleAttribute("data-long",a.over>0)}let n=Math.max(0,...t.lines.map(a=>a.over)),s=n/is*1e3;t.end=n?t.start+Rt+s:0;let o=Math.max(this._config.rotate*1e3,Math.min(n&&2*Rt+s,ea));this.renderRoot.querySelector(".head .cycle")?.style.setProperty("--origami-cycle",`${o}ms`),this._turnAfter(o),this._frame()}_frame(){cancelAnimationFrame(this._frameId),clearTimeout(this._holdTimer);let t=this._marquee,e=performance.now(),n=Math.max(0,e-t.start-Rt)*is/1e3;for(let{line:s,over:o}of t.lines){let a=Math.min(n,o),r=t.back?a-o:-a;s.firstElementChild.style.transform=r?`translateX(${t.rtl?-r:r}px)`:"",s.style.setProperty("--fade-start",`${+Math.min(ns,-r).toFixed(1)||0}px`),s.style.setProperty("--fade-end",`${+Math.min(ns,o+r).toFixed(1)}px`)}!t.end||e>=t.end||(e<t.start+Rt?this._holdTimer=setTimeout(()=>this._frame(),t.start+Rt-e):this._frameId=requestAnimationFrame(()=>this._frame()))}_tick(){if(clearTimeout(this._clock),!this.isConnected||!this._visible||document.hidden)return;let t=Date.now(),e=this._open||!!this._dialog,n=this._shown?.kind!=="info"?this._shown:null,s=(e?this._entries:n?[n]:[]).find(a=>a.clock&&a.ts>t),o=0;s?o=(s.ts-t)%1e3||1e3:(e||this._entries.some(a=>Qe(a,t))||n&&this._headTime(n))&&(o=6e4-t%6e4),o&&(this._clock=setTimeout(()=>{this._now=Date.now(),this.requestUpdate(),this._dialog?.requestUpdate(),this._tick()},o))}_headTime(t){return!!(t.live||!t.message&&Number.isFinite(t.ts))}_onView(t){let e=t&&!this._visible;this._visible=t,this._now=Date.now(),e&&this._cycle(),this.requestUpdate(),this._tick()}_onResize(t){Math.round(t)!==this._width&&(this._width=Math.round(t),this._cycle());let e=t>0&&t<Zo;e!==this.classList.contains("narrow")&&(this.classList.toggle("narrow",e),this.requestUpdate())}_rtl(){return getComputedStyle(this).direction==="rtl"}_animate(){return!!(this._painted&&!this.preview&&this.isConnected&&this.getClientRects().length)}_empty(){return!this._entries.length&&!this._slides.length&&this._config.hide_when_empty&&!this.preview&&!this._inPicker}_setOpen(t){t!==this._open&&(this._open=t,this._settled=!1,clearTimeout(this._settleTimer),t&&(this.classList.toggle("capped",getComputedStyle(this).getPropertyValue("--origami-max-height").trim()!==""),this._settleTimer=setTimeout(()=>{this._settled=!0,this.requestUpdate()},this._animate()?H(this,"normal"):0)),t||this._cycle(),this.requestUpdate(),this._tick())}_toggle(){if(!this.listed().length)return;if(!this._open&&this.classList.contains("narrow")&&!this.preview&&customElements.get("ha-adaptive-dialog")){bt(this,"show-dialog",{dialogTag:ni,dialogImport:()=>Promise.resolve(),dialogParams:{card:this}});return}let t=!!this.renderRoot.activeElement;this._setOpen(!this._open),t&&this.updateComplete.then(()=>this.renderRoot.querySelector(this._open?".bar":".head").focus({preventScroll:!0}))}_tap(){let t=this.listed(),e=t.length===1&&ue(t[0]);e?this._run(e):this._toggle()}_tappable(t){let e=this._shown;return t.length>1||!!(t[0]&&ue(t[0]))||e?.kind==="info"&&["hold","double_tap"].some(n=>this._infoAction(e,n))}_gestureAction(t){let e=this._shown?.kind==="info"&&this._infoAction(this._shown,t);return e?()=>this._run(e):null}firstUpdated(){let t=this.renderRoot.querySelector(".head");this._resize.observe(this.renderRoot.querySelector("ha-card")),this._gestures=new ce(t,{canDrag:()=>this._turnable.length>1&&!this._open,drag:e=>{let n=this.renderRoot.querySelector(".slide:not(.leaving)");n.style.transform=`translateX(${e*.6}px)`,n.style.opacity=String(Math.max(.2,1-Math.abs(e)/160))},dragEnd:e=>{if(e)return this._step(e,"swipe");let n=this.renderRoot.querySelector(".slide:not(.leaving)"),s={transform:n.style.transform||"none",opacity:n.style.opacity||"1"};n.style.transform=n.style.opacity="",n.animate([s,{transform:"none",opacity:1}],{duration:H(this,"normal"),easing:M.standard})},step:e=>this._step(e,"key"),tap:()=>this._tap(),holdAction:()=>this._gestureAction("hold"),doubleTapAction:()=>this._gestureAction("double_tap"),rtl:()=>this._rtl()})}willUpdate(t){t.has("preview")&&this._refresh(),this._updateBackdrop(this._shown?.backdrop?ei(this._hass,this._shown.image):null),this._listMotion=this._open&&this._animate(),this._listMotion&&this._motion.measure(this.renderRoot.querySelector(".list"))}updated(){!this._config||!this._hass||!this.isConnected||(this._motion.play(this.renderRoot.querySelector(".list"),this._listMotion),this._setHidden(this._empty()),this.classList.toggle("dark",!!this._hass.themes?.darkMode),this.classList.toggle("with-backdrop",this._backdrops.some(t=>t.on)),this._css!==this._config.css&&(this._css=this._config.css,_e(this,this._css||"")),this._refocus!=null&&this._focusRow(this._refocus),this._intro&&this._playIntro(),this._scrolled!==this._cycleKey&&this._scroll())}_playIntro(){this._intro=!1;let t=this._config.slide==="side";!this._introduced&&this._turnable.length>1&&!this.preview&&this.getClientRects().length&&(this._introduced=!0,this._enter(t&&this._rtl()?-1:1,t)),requestAnimationFrame(()=>this._painted=!0)}_setHidden(t){if(t===!!(this._hiding||this.hidden))return;this._hostAnim?.cancel();let e=getComputedStyle(this).height,n=!this.classList.contains("bounded"),[s,o]=[H(this,"fast"),H(this,"normal")];if(t){if(!this._animate())return this._gone();this._hiding=!0,this.classList.add("hiding");let c=[{opacity:1,height:e,easing:M.out},{opacity:0,height:e,offset:s/(s+o),easing:M.standard},{opacity:0,height:n?"0px":e}],l=this._hostAnim=this.animate(c,{duration:s+o,fill:"forwards"});l.finished.then(()=>this._hostAnim===l&&this._gone(),()=>{});return}if(this._hiding=!1,this.classList.remove("hiding"),!this.hidden||(this.hidden=!1,bt(this,"card-visibility-changed",{value:!0}),!this._animate()))return;let a=getComputedStyle(this).height,r=n?[{height:"0px",opacity:0,easing:M.standard},{height:a,opacity:0,offset:o/(s+o),easing:M.in},{height:a,opacity:1}]:[{opacity:0},{opacity:1}];this._hostAnim=this.animate(r,{duration:s+o})}_gone(){this._hostAnim?.cancel(),this._hostAnim=null,this._hiding=!1,this.classList.remove("hiding"),this.hidden=!0,bt(this,"card-visibility-changed",{value:!1}),this._setOpen(!1)}_focusRow(t){this._refocus=null,me(this.renderRoot,t,this.renderRoot.querySelector(this._open?".bar":".head"))}rowView(t){let e=this._derive();return{hass:this._hass,texts:e.texts,clock:e.clock,now:this._now,opened:this._opened,run:n=>this._run(n),toggle:n=>{this._opened.delete(n)||this._opened.add(n),this.requestUpdate(),this._dialog?.requestUpdate()},dismiss:(n,s)=>{let o=this.listed().findIndex(a=>a.key===n.key);this.dismiss([n]),s&&t(o)}}}setDialog(t){this._dialog=t,this._tick(),t||this._cycle()}get gone(){return this.hidden||!!this._hiding}get css(){return this._config.css||""}get texts(){return this._derive().texts}dismissible(){return this._entries.length>1?this._entries.filter(re):[]}listTitle(){let t=this._entries.length,e=this._derive().texts;return t?x(t===1?e.count_one:e.count_other,{n:t}):e.idle_title}_secondary(t,e){if(!t)return e.idle_msg;if(t.kind!=="info")return this._headTime(t)?this._derive().clock.entryTime(t,this._now):t.message;if(t.text!=null)return this._withBattery(t.text,t);let n=t.content??t.info.state_content;return customElements.get("state-display")?this._withBattery(y`<state-display .hass=${this._hass} .stateObj=${t.stateObj} .content=${n} .timeFormat=${t.info.time_format} .name=${t.name}></state-display>`,t):this._withBattery(Ge(t.stateObj,n,t.name,this._formatters()),t)}_slideTemplate(t,e,n){let s=t&&t.kind!=="info"&&this._headTime(t),o=this._secondary(t,e),a=r=>St(t?.key,y`<span>${r}</span>`);return y`
      <div class="slide ${n?"leaving":""}" aria-hidden=${n?"true":g}>
        <div class="title">${a(t?t.title:e.idle_title)}</div>
        ${o?y`<div class="secondary ${s?"time":""}" aria-live=${s&&!n?"off":g}>${a(o)}</div>`:g}
      </div>
    `}render(){if(!this._config||!this._hass)return g;let t=this._derive().texts,e=this._shown,n=this.listed(),s=this._tappable(n),o=n.length>1,a=this.classList.contains("narrow"),r=this._entries.length,c=this._leaving,l=this.dismissible();return y`
      <ha-card
        class=${G({open:this._open,crit:e?.sev==="crit",tappable:s,settled:this._open&&this._settled})}
        style="--tile-color: ${e?he(e):"var(--state-inactive-color)"}"
        @keydown=${d=>d.key==="Escape"&&this._open&&(d.stopPropagation(),this._toggle())}
      >
        <div class="backdrop" aria-hidden="true">
          ${this._backdrops.map(d=>d.url?y`<img class=${d.on?"on":""} src=${d.url} alt="" draggable="false" referrerpolicy="no-referrer" @load=${()=>this._reveal(d)} />`:g)}
        </div>
        <div class="pulse"></div>
        <div class="head-wrap">
          <div
            class="head"
            role="button"
            tabindex="0"
            aria-disabled=${String(!s)}
            aria-expanded=${o&&!a?String(this._open):g}
            aria-haspopup=${o&&a?"dialog":g}
          >
            <ha-ripple></ha-ripple>
            <div class=${G({icon:!0,idle:!e})}>
              ${this._config.rotate>0&&this._turnable.length>1?St(this._cycleKey,y`<div class="cycle"><i></i><i></i></div>`):g}
              <div class="glyph">${pe(e||{icon:"mdi:bell-outline"},this._hass)}</div>
              ${c?St(c,y`<div class="glyph leaving" style="color: ${he(c.entry)}">${pe(c.entry,this._hass)}</div>`):g}
              ${r>1?y`<div class="badge">${r>9?"9+":r}</div>`:g}
            </div>
            <div class=${G({texts:!0,up:!!(c&&!c.side),side:!!c?.side})}>
              ${this._slideTemplate(e,t)}
              ${c?St(c,this._slideTemplate(c.entry,t,c)):g}
            </div>
            ${o?y`<ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>`:g}
          </div>
        </div>
        <div class="drawer">
          <div class="inner">
            <div class="bar" role="button" tabindex="0" aria-expanded="true" @click=${()=>this._toggle()} @keydown=${d=>(d.key==="Enter"||d.key===" ")&&(d.preventDefault(),this._toggle())}>
              <ha-ripple></ha-ripple>
              <span class="count">${this.listTitle()}</span>
              <ha-icon class="chevron" icon="mdi:chevron-up"></ha-icon>
            </div>
            <div class="list" role="list">${fe(this._motion.withLeaving(n,this._listMotion),this.rowView(d=>this._refocus=d))}</div>
            <div class=${G({"foot-wrap":!0,shown:l.length>0})}>
              <div class="clip">
                <div class="foot">
                  <button class="clear" type="button" tabindex=${l.length?"0":"-1"} @click=${d=>(this.dismiss(l),d.detail===0&&(this._refocus=0))}>${t.clear}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="say" aria-live="polite">${this._say||""}</div>
      </ha-card>
    `}_updateBackdrop(t){if(t===this._backdropUrl)return;this._backdropUrl=t;let e=this._backdrops,n=e.find(s=>s.on);if(!t)e.forEach(s=>s.on=!1);else if(n?.url!==t){let s=n===e[0]?e[1]:e[0];s.url=t,s.loaded===t&&this._reveal(s)}}_reveal(t){t.loaded=t.url,t.url===this._backdropUrl&&(this._backdrops.forEach(e=>e.on=e===t),this.requestUpdate())}};var ke=class extends D{static styles=[be,ye,ge,L`
      :host {
        font-family: var(--ha-font-family-body);
        -webkit-font-smoothing: var(--ha-font-smoothing);
        -moz-osx-font-smoothing: var(--ha-moz-osx-font-smoothing);
      }
      ha-adaptive-dialog {
        --dialog-content-padding: 0;
        --ha-bottom-sheet-max-height: var(--origami-max-height, 70vh);
        --ha-dialog-max-height: var(--origami-max-height, 70vh);
      }
      .list {
        --inset: 12px;
        padding: 0 var(--inset) var(--inset);
      }
      /* As a bottom sheet the list keeps the sides of a sections view, see ha-adaptive-dialog.ts and hui-sections-view.ts. */
      @media (max-width: 870px), (max-height: 500px) {
        .list {
          --inset: var(--ha-view-sections-column-gap, 32px);
        }
      }
      @media (max-width: 600px) {
        .list {
          --inset: var(--ha-view-sections-narrow-column-gap, 8px);
        }
      }
    `];constructor(){super(),this._motion=new yt(()=>this.requestUpdate())}showDialog({card:t}){this._card&&this._card!==t&&this._release(),this._card=t,t.setDialog(this),this.requestUpdate()}closeDialog(){let t=this.renderRoot?.querySelector("ha-adaptive-dialog");return t&&this._shown?t.open=!1:this._closed(),!0}_release(){this._card?._dialog===this&&this._card.setDialog(null)}_closed(){this._release(),this._card=null,this._shown=!1,this.requestUpdate(),bt(this,"dialog-closed",{dialog:this.localName})}willUpdate(){this._animate=this._shown&&!this._card?.preview,this._animate&&this._motion.measure(this.renderRoot.querySelector(".list"))}updated(){this._motion.play(this.renderRoot.querySelector(".list"),this._animate),this._card&&this._css!==this._card.css&&(this._css=this._card.css,_e(this,this._css)),this._refocus!=null&&me(this.renderRoot,this._refocus,null),this._refocus=null}render(){let t=this._card;if(!t)return g;let e=t.gone?[]:t.listed();e.length||queueMicrotask(()=>this._card===t&&this.closeDialog());let n=t.dismissible();return y`
      <ha-adaptive-dialog
        open
        flexcontent
        .hass=${t.hass}
        @opened=${s=>s.target===s.currentTarget&&(this._shown=!0,this.requestUpdate())}
        @closed=${s=>s.target===s.currentTarget&&this._closed()}
      >
        <span slot="headerTitle" class="heading">${t.listTitle()}</span>
        ${n.length?y`<ha-icon-button slot="headerActionItems" .label=${t.texts.clear} @click=${()=>t.dismiss(n)}>
              <ha-icon icon="mdi:notification-clear-all"></ha-icon>
            </ha-icon-button>`:g}
        <div class="list" role="list">${fe(this._motion.withLeaving(e,this._animate),t.rowView(s=>this._refocus=s))}</div>
      </ha-adaptive-dialog>
    `}};var na=["entities","label","weather","infos","updates","repairs","batteries","hide_when_empty","vertical","rotate","slide","audience","css"],os=["type","attribute","name","icon","color","image","background","before","after","tap_action","visibility"],sa=["entity",...os,"actions"],oa=["entity","name","icon","color","show_entity_picture","show_battery","state_content","time_format","show_current","show_forecast","forecast_type","forecast_slots","tap_action","hold_action","double_tap_action","visibility"],ss=["attribute","picture"],si=i=>i==null||i===""||i===!1||Array.isArray(i)&&!i.length||T(i)&&!Object.keys(i).length,oi=(i,t)=>Object.fromEntries([...new Set([...t,...Object.keys(i)])].filter(e=>e in i).map(e=>[e,i[e]])),ai=i=>i?i.only?"only":"except":"everyone",aa=i=>({days:Math.floor(i/864e5),hours:Math.floor(i%864e5/36e5),minutes:Math.floor(i%36e5/6e4),seconds:i%6e4/1e3}),$e=i=>!i.forecast_type||i.show_forecast===!1?"show_current":i.show_current===!1?"show_forecast":"show_both",xe=class extends D{static properties={hass:{attribute:!1},_config:{state:!0}};static styles=L`
    .entities,
    .infos {
      margin-top: 24px;
    }
    .content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
    }
    .intro {
      margin: 0;
      color: var(--secondary-text-color);
    }
  `;constructor(){super(),this._memos=new Map}setConfig(t){oe(t),this._config=t}get _t(){return jn(de(this.hass),this.hass?.localize)}_memo(t,e){let n=JSON.stringify(e),s=this._memos.get(t);return s?.json===n?s.value:(this._memos.set(t,{json:n,value:e}),e)}_name(t,e){let n=this.hass.states[t];return n?ti(this.hass)(n,e):typeof e=="string"&&e||t}_entries(t=this._config){return(t.entities||[]).map(e=>typeof e=="string"?{entity:e}:e)}_infos(t=this._config){return(t.infos||[]).map(e=>typeof e=="string"?{entity:e}:{...e})}_sources(t=this._config){let e=this._t,n=[{key:"system",name:e.label("system"),icon:N.system}];t.updates!==!1&&n.push({key:"updates",name:e.label("updates"),icon:N.update}),t.repairs!==!1&&n.push({key:"repairs",name:e.label("repairs"),icon:N.repair}),t.batteries&&n.push({key:"batteries",name:e.label("batteries"),icon:N.battery}),t.weather&&n.push({key:t.weather,name:this._name(t.weather),icon:N.weather});let s=this.hass.entities||{},o=t.label?Object.keys(s).filter(a=>s[a]?.labels?.includes(t.label)).map(a=>({entity:a})):[];for(let a of[...this._entries(t),...o])n.some(r=>r.key===a.entity)||n.push({key:a.entity,name:a.name||this._name(a.entity),icon:a.icon||N[this._kind(a)]});return n}_kind(t){return Ct(t,this.hass.states[t.entity],this.hass)}_summary(t){let e=this._t,n=ai(t);if(n==="everyone")return e.label("everyone");let s=t[n].map(o=>this._name(o)).join(", ");return s?x(e.label(n+"_x"),{x:s}):e.label(n==="only"?"nobody":"everyone")}_schema(t){let e=this._t,n=this._config.audience||{},s=(o,a=r=>e.label(r))=>o.map(r=>({value:r,label:a(r)}));return[{name:"entities",selector:{entity:{multiple:!0}}},{name:"label",selector:{label:{}}},{name:"weather",selector:{entity:{filter:{domain:"weather"}}}},{name:"infos",selector:{entity:{multiple:!0,reorder:!0}}},{name:"",type:"grid",schema:["updates","repairs","batteries"].map(o=>({name:o,selector:{boolean:{}}}))},{name:"hide_when_empty",selector:{boolean:{}}},{name:"content_layout",selector:{select:{mode:"box",options:["horizontal","vertical"].map(o=>({value:o,label:e.label(o),image:{src:`/static/images/form/tile_content_layout_${o}.svg`,src_dark:`/static/images/form/tile_content_layout_${o}_dark.svg`,flip_rtl:!0}}))}}},{name:"",type:"grid",schema:[{name:"rotate",selector:{number:{min:0,max:60,step:1,mode:"box",unit_of_measurement:"s"}}},{name:"slide",selector:{select:{mode:"dropdown",options:s(["up","side"],o=>e.label("slide_"+o))}}}]},{name:"audience",type:"expandable",title:e.label("audience"),icon:"mdi:account-eye-outline",schema:t.map(o=>({name:o.key,type:"expandable",title:`${o.name} \xB7 ${this._summary(n[o.key])}`,icon:o.icon,schema:[{name:"visible",selector:{select:{mode:"list",options:s(["everyone","only","except"])}}},...ai(n[o.key])==="everyone"?[]:[{name:"people",selector:{entity:{multiple:!0,filter:{domain:"person"}}}}]]}))},{name:"styling",type:"expandable",flatten:!0,title:e.label("styling"),icon:"mdi:palette-outline",schema:[{name:"css",selector:{text:{multiline:!0}}}]}]}_data(t){let e=this._config,n=e.audience||{};return{...Ot,...e,content_layout:e.vertical?"vertical":"horizontal",entities:this._entries().map(s=>s.entity),infos:this._infos().map(s=>s.entity),audience:Object.fromEntries(t.map(s=>[s.key,{visible:ai(n[s.key]),people:n[s.key]?.only||n[s.key]?.except||[]}]))}}_mergeEntities(t,e={}){let n=this._entries(),s=new Map(n.map(r=>[r.entity,r])),o=t.map((r,c)=>n[c]&&r!==n[c].entity?c:-1).filter(r=>r>=0),a=t.length===n.length&&o.length===1&&!s.has(t[o[0]])?o[0]:-1;return this._swapped=a<0?null:[n[a].entity,t[a]],t.map((r,c)=>{let l=s.get(r)||(c===a?n[c]:{}),d={...l,entity:r},h=e[r]||{};for(let u of os){if(!(u in h))continue;let p=h[u],f=u==="before"||u==="after";f&&F(p)===F(l[u])||(si(p)||u==="type"&&p==="auto"||u==="color"&&p==="state"||f&&!F(p)?delete d[u]:d[u]=p)}return d.type&&!ss.includes(d.type)&&delete d.attribute,Object.keys(d).length===1?r:oi(d,sa)})}_onChange(t){t.stopPropagation();let{content_layout:e,...n}=t.detail.value;e&&(n.vertical=e==="vertical");let s=this._sources().map(r=>r.key);this._swapped=null,Array.isArray(n.entities)&&(n.entities=this._mergeEntities(n.entities)),Array.isArray(n.infos)&&(n.infos=this._mergeInfos(n.infos));let o={...this._config.audience};for(let[r,c]of Object.entries(n.audience||{}))c.visible==="only"||c.visible==="except"?o[r]={[c.visible]:c.people||[]}:delete o[r];for(let[r,c]of[this._swapped||[],[this._config.weather,n.weather]])r&&c&&o[r]&&!o[c]&&(o[c]=o[r]);let a=new Set(this._sources({...this._config,...n}).map(r=>r.key));for(let r of s)!a.has(r)&&r!=="updates"&&r!=="batteries"&&!r.startsWith("update.")&&delete o[r];n.audience=o,this._write(n)}_write(t){let e={...this._config,...t},n={type:this._config.type};for(let[s,o]of Object.entries(oi(e,na)))s==="type"||si(o)&&o!==!1||s in Ot&&o===Ot[s]||(n[s]=o);this._config=n,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:n},bubbles:!0,composed:!0}))}_mergeInfos(t){let e=this._infos(),n=new Set,s=o=>o>=0&&!n.has(o)?(n.add(o),e[o]):null;return t.map((o,a)=>{let r=o.startsWith("person.")?{show_entity_picture:!0}:{},c=s(e.findIndex((l,d)=>l.entity===o&&!n.has(d)))||e.length===t.length&&!t.includes(e[a].entity)&&s(a)||r;return this._infoEntry({...c,entity:o})})}_infoEntry(t){let e={};for(let[n,s]of Object.entries(oi(t,oa)))(n==="show_current"||n==="show_forecast"?s===!1:!si(s)&&!(n==="color"&&s==="state"))&&(e[n]=s);return Object.keys(e).length===1?e.entity:e}_forecastTypes(t){if(!t.entity.startsWith("weather."))return[];let e=this.hass.states[t.entity];return qe.filter(n=>Mt(e,n)||t.forecast_type===n)}_infoSchema(t){let e=this._t,n=this.hass.states[t.entity],s=t.entity.split(".")[0],o=[].concat(t.state_content??"state").some(u=>/^last[_-](changed|updated|triggered)$/.test(u)||s==="sun"&&u.startsWith("next_")||s==="calendar"&&u.endsWith("_time")||u==="state"&&!!n&&(n.attributes.device_class==="timestamp"||Ii(s))),a={entity_id:"entity"},r=this._forecastTypes(t),c=$e(t),l=u=>({select:{mode:"dropdown",options:u.map(p=>({value:p,label:e.label(p)}))}}),d=[{name:"state_content",selector:{ui_state_content:{}},context:{filter_entity:"entity"}},...o?[{name:"time_format",selector:{ui_time_format:{}}}]:[]],h=[{name:"forecast",selector:l(["show_both","show_current","show_forecast"])},...c==="show_current"?[]:[{name:"forecast_type",selector:l(r)},{name:"forecast_slots",selector:{number:{min:1,max:12,mode:"box"}}}],...c==="show_forecast"?[]:d];return[{name:"name",selector:{entity_name:{}},context:{entity:"entity"}},{name:"",type:"grid",schema:[{name:"icon",selector:{icon:{}},context:{icon_entity:"entity"}},{name:"color",selector:{ui_color:{default_color:"state",include_state:!0}}}]},...r.length?h:d,{name:"show_entity_picture",selector:{boolean:{}}},...t.show_battery||n&&Qt(this.hass,n)?[{name:"show_battery",selector:{boolean:{}}}]:[],{name:"tap_action",selector:{ui_action:{default_action:"more-info"}},context:a},{name:"",type:"optional_actions",flatten:!0,schema:["hold_action","double_tap_action"].map(u=>({name:u,selector:{ui_action:{default_action:"none"}},context:a}))}]}_onInfo(t,e,n){t.stopPropagation();let s=this._infos(),{forecast:o,...a}=n,r={...s[e],...a,entity:s[e].entity},c="forecast"in n?o||"show_current":null;if(c&&c!==$e(s[e])&&(Object.assign(r,{show_current:c==="show_forecast"?!1:void 0,show_forecast:void 0}),r.forecast_type=c==="show_current"?void 0:r.forecast_type||this._forecastTypes(r)[0]),!r.forecast_type)for(let l of["forecast_slots","show_current","show_forecast"])delete r[l];s[e]=r,this._write({infos:s.map(l=>this._infoEntry(l))})}_entitySchema(t){let e=this._t,n=this._kind(t);return[{name:"type",selector:{select:{mode:"dropdown",options:(o=>o.map(a=>({value:a,label:e.label("type_"+a)})))(["auto",...ie])}}},...!t.type||ss.includes(t.type)?[{name:"attribute",helper:t.type==="picture"?"attribute_picture":"attribute",selector:{attribute:{entity_id:t.entity}}}]:[],{name:"",type:"grid",schema:[{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{placeholder:N[n]}}}]},{name:"color",selector:{ui_color:{default_color:"state",include_state:!0}}},{name:"image",selector:{text:{}}},{name:"background",selector:{boolean:{}}},...rn.includes(n)?[{name:"before",selector:{duration:{enable_day:!0}}}]:[],...cn.includes(n)?[{name:"after",selector:{duration:{enable_day:!0}}}]:[],{name:"tap_action",helper:"row_tap_action",selector:{ui_action:{default_action:"more-info"}}}]}_onEntity(t,e,n){t.stopPropagation();let s=this._entries().map(o=>o.entity);this._write({entities:this._mergeEntities(s,{[s[e]]:n})})}_entityPanel(t,e){let n=this._t,s=r=>r==null?void 0:aa(F(r)),o={...t,type:t.type||"auto",color:t.color||"state",background:!!t.background,before:s(t.before),after:s(t.after)},a=Array.isArray(t.visibility)?t.visibility:[];return y`<ha-expansion-panel outlined .header=${t.name||this._name(t.entity)} .secondary=${n.label("type_"+this._kind(t))}>
      <ha-icon slot="leading-icon" .icon=${t.icon||N[this._kind(t)]}></ha-icon>
      <div class="content">
        <ha-form
          .hass=${this.hass}
          .data=${this._memo("entity-data-"+e,o)}
          .schema=${this._memo("entity-schema-"+e,this._entitySchema(t))}
          .computeLabel=${r=>n.label(r.name)}
          .computeHelper=${r=>n.helper(r.helper||r.name)}
          @value-changed=${r=>this._onEntity(r,e,r.detail.value)}
        ></ha-form>
        <ha-expansion-panel outlined .header=${n.label("visibility")}>
          <ha-icon slot="leading-icon" icon="mdi:eye"></ha-icon>
          <div class="content">
            <p class="intro">${n.helper("visibility_intro")}</p>
            <ha-card-conditions-editor
              .hass=${this.hass}
              .conditions=${this._memo("entity-conditions-"+e,a)}
              @value-changed=${r=>this._onEntity(r,e,{visibility:r.detail.value})}
            ></ha-card-conditions-editor>
          </div>
        </ha-expansion-panel>
      </div>
    </ha-expansion-panel>`}_infoPanel(t,e){let n=this._t,s=this.hass.states[t.entity],o=this._forecastTypes(t),a=o.length?{...t,forecast:$e(t)}:t,r=Array.isArray(t.visibility)?t.visibility:[];return y`<ha-expansion-panel outlined .header=${this._name(t.entity,t.name)} .secondary=${o.length&&$e(t)!=="show_current"?n.label(t.forecast_type):""}>
      ${s&&customElements.get("ha-state-icon")?y`<ha-state-icon slot="leading-icon" .hass=${this.hass} .stateObj=${s} .icon=${t.icon}></ha-state-icon>`:y`<ha-icon slot="leading-icon" .icon=${t.icon||N.generic}></ha-icon>`}
      <div class="content">
        <ha-form
          .hass=${this.hass}
          .data=${this._memo("info-data-"+e,a)}
          .schema=${this._memo("info-schema-"+e,this._infoSchema(t))}
          .computeLabel=${c=>n.label(c.name)}
          .computeHelper=${c=>n.helper(c.name)}
          @value-changed=${c=>this._onInfo(c,e,c.detail.value)}
        ></ha-form>
        <ha-expansion-panel outlined .header=${n.label("visibility")}>
          <ha-icon slot="leading-icon" icon="mdi:eye"></ha-icon>
          <div class="content">
            <p class="intro">${n.helper("visibility_intro")}</p>
            <ha-card-conditions-editor
              .hass=${this.hass}
              .conditions=${this._memo("conditions-"+e,r)}
              @value-changed=${c=>this._onInfo(c,e,{visibility:c.detail.value?.length?c.detail.value:void 0})}
            ></ha-card-conditions-editor>
          </div>
        </ha-expansion-panel>
      </div>
    </ha-expansion-panel>`}render(){if(!this._config||!this.hass)return g;let t=this._t,e=this._sources(),n=this._entries(),s=this._infos();return y`
      <ha-form
        .hass=${this.hass}
        .data=${this._memo("data",this._data(e))}
        .schema=${this._memo("schema",this._schema(e))}
        .computeLabel=${o=>t.label(o.name)}
        .computeHelper=${o=>t.helper(o.helper||o.name)}
        @value-changed=${this._onChange}
      ></ha-form>
      ${n.length?y`<ha-expansion-panel class="entities" outlined .header=${t.label("options")}>
            <ha-icon slot="leading-icon" icon="mdi:tune-variant"></ha-icon>
            <div class="content">${n.map((o,a)=>this._entityPanel(o,a))}</div>
          </ha-expansion-panel>`:g}
      ${s.length?y`<ha-expansion-panel class="infos" outlined .header=${t.label("info_options")}>
            <ha-icon slot="leading-icon" icon="mdi:information-outline"></ha-icon>
            <div class="content">${s.map((o,a)=>this._infoPanel(o,a))}</div>
          </ha-expansion-panel>`:g}
    `}};var ri=(i,t)=>customElements.get(i)||customElements.define(i,t);ri(K,ve);ri(K+"-editor",xe);ri(ni,ke);window.customCards||=[];window.customCards.some(i=>i.type===K)||(window.customCards.push({type:K,name:"Origami Notifications",description:"System notifications, repairs, updates, warnings and any entity you add.",preview:!0,documentationURL:"https://github.com/hazymorning/origami_notifications"}),console.info(`%c Origami Notifications %c v${ci} `,"font-weight: bold","opacity: 0.7"));
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
lit-html/directive.js:
lit-html/directives/repeat.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/class-map.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/keyed.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
