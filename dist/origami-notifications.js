var si="1.6.0";var Nt=globalThis,Dt=Nt.ShadowRoot&&(Nt.ShadyCSS===void 0||Nt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ve=Symbol(),oi=new WeakMap,gt=class{constructor(t,e,n){if(this._$cssResult$=!0,n!==ve)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(Dt&&t===void 0){let n=e!==void 0&&e.length===1;n&&(t=oi.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&oi.set(e,t))}return t}toString(){return this.cssText}},Rt=i=>new gt(typeof i=="string"?i:i+"",void 0,ve),P=(i,...t)=>{let e=i.length===1?i[0]:t.reduce((n,s,o)=>n+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[o+1],i[0]);return new gt(e,i,ve)},It=(i,t)=>{if(Dt)i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let n=document.createElement("style"),s=Nt.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=e.cssText,i.appendChild(n)}},ke=Dt?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(let n of t.cssRules)e+=n.cssText;return Rt(e)})(i):i;var{is:Yn,defineProperty:Xn,getOwnPropertyDescriptor:Jn,getOwnPropertyNames:Zn,getOwnPropertySymbols:Qn,getPrototypeOf:ts}=Object,Pt=globalThis,ai=Pt.trustedTypes,es=ai?ai.emptyScript:"",is=Pt.reactiveElementPolyfillSupport,yt=(i,t)=>i,xe={toAttribute(i,t){switch(t){case Boolean:i=i?es:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},ci=(i,t)=>!Yn(i,t),ri={attribute:!0,type:String,converter:xe,reflect:!1,useDefault:!1,hasChanged:ci};Symbol.metadata??=Symbol("metadata"),Pt.litPropertyMetadata??=new WeakMap;var H=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=ri){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let n=Symbol(),s=this.getPropertyDescriptor(t,n,e);s!==void 0&&Xn(this.prototype,t,s)}}static getPropertyDescriptor(t,e,n){let{get:s,set:o}=Jn(this.prototype,t)??{get(){return this[e]},set(a){this[e]=a}};return{get:s,set(a){let r=s?.call(this);o?.call(this,a),this.requestUpdate(t,r,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ri}static _$Ei(){if(this.hasOwnProperty(yt("elementProperties")))return;let t=ts(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(yt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(yt("properties"))){let e=this.properties,n=[...Zn(e),...Qn(e)];for(let s of n)this.createProperty(s,e[s])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[n,s]of e)this.elementProperties.set(n,s)}this._$Eh=new Map;for(let[e,n]of this.elementProperties){let s=this._$Eu(e,n);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let s of n)e.unshift(ke(s))}else t!==void 0&&e.push(ke(t));return e}static _$Eu(t,e){let n=e.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let n of e.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return It(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,n){this._$AK(t,n)}_$ET(t,e){let n=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,n);if(s!==void 0&&n.reflect===!0){let o=(n.converter?.toAttribute!==void 0?n.converter:xe).toAttribute(e,n.type);this._$Em=t,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){let n=this.constructor,s=n._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let o=n.getPropertyOptions(s),a=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:xe;this._$Em=s;let r=a.fromAttribute(e,o.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(t,e,n,s=!1,o){if(t!==void 0){let a=this.constructor;if(s===!1&&(o=this[t]),n??=a.getPropertyOptions(t),!((n.hasChanged??ci)(o,e)||n.useDefault&&n.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,n))))return;this.C(t,e,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:n,reflect:s,wrapped:o},a){n&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,a??e??this[t]),o!==!0||a!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[s,o]of n){let{wrapped:a}=o,r=this[s];a!==!0||this._$AL.has(s)||r===void 0||this.C(s,void 0,o,r)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(e)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};H.elementStyles=[],H.shadowRootOptions={mode:"open"},H[yt("elementProperties")]=new Map,H[yt("finalized")]=new Map,is?.({ReactiveElement:H}),(Pt.reactiveElementVersions??=[]).push("2.1.2");var Ae=globalThis,li=i=>i,Lt=Ae.trustedTypes,hi=Lt?Lt.createPolicy("lit-html",{createHTML:i=>i}):void 0,Se="$lit$",W=`lit$${Math.random().toFixed(9).slice(2)}$`,Ee="?"+W,ns=`<${Ee}>`,et=document,wt=()=>et.createComment(""),vt=i=>i===null||typeof i!="object"&&typeof i!="function",Te=Array.isArray,_i=i=>Te(i)||typeof i?.[Symbol.iterator]=="function",$e=`[ 	
\f\r]`,bt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,di=/-->/g,ui=/>/g,Q=RegExp(`>|${$e}(?:([^\\s"'>=/]+)(${$e}*=${$e}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),pi=/'/g,mi=/"/g,gi=/^(?:script|style|textarea|title)$/i,Ce=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),b=Ce(1),Ko=Ce(2),Go=Ce(3),R=Symbol.for("lit-noChange"),g=Symbol.for("lit-nothing"),fi=new WeakMap,tt=et.createTreeWalker(et,129);function yi(i,t){if(!Te(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return hi!==void 0?hi.createHTML(t):t}var bi=(i,t)=>{let e=i.length-1,n=[],s,o=t===2?"<svg>":t===3?"<math>":"",a=bt;for(let r=0;r<e;r++){let c=i[r],l,h,d=-1,u=0;for(;u<c.length&&(a.lastIndex=u,h=a.exec(c),h!==null);)u=a.lastIndex,a===bt?h[1]==="!--"?a=di:h[1]!==void 0?a=ui:h[2]!==void 0?(gi.test(h[2])&&(s=RegExp("</"+h[2],"g")),a=Q):h[3]!==void 0&&(a=Q):a===Q?h[0]===">"?(a=s??bt,d=-1):h[1]===void 0?d=-2:(d=a.lastIndex-h[2].length,l=h[1],a=h[3]===void 0?Q:h[3]==='"'?mi:pi):a===mi||a===pi?a=Q:a===di||a===ui?a=bt:(a=Q,s=void 0);let p=a===Q&&i[r+1].startsWith("/>")?" ":"";o+=a===bt?c+ns:d>=0?(n.push(l),c.slice(0,d)+Se+c.slice(d)+W+p):c+W+(d===-2?r:p)}return[yi(i,o+(i[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},kt=class i{constructor({strings:t,_$litType$:e},n){let s;this.parts=[];let o=0,a=0,r=t.length-1,c=this.parts,[l,h]=bi(t,e);if(this.el=i.createElement(l,n),tt.currentNode=this.el.content,e===2||e===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(s=tt.nextNode())!==null&&c.length<r;){if(s.nodeType===1){if(s.hasAttributes())for(let d of s.getAttributeNames())if(d.endsWith(Se)){let u=h[a++],p=s.getAttribute(d).split(W),f=/([.?@])?(.*)/.exec(u);c.push({type:1,index:o,name:f[2],strings:p,ctor:f[1]==="."?zt:f[1]==="?"?jt:f[1]==="@"?Bt:nt}),s.removeAttribute(d)}else d.startsWith(W)&&(c.push({type:6,index:o}),s.removeAttribute(d));if(gi.test(s.tagName)){let d=s.textContent.split(W),u=d.length-1;if(u>0){s.textContent=Lt?Lt.emptyScript:"";for(let p=0;p<u;p++)s.append(d[p],wt()),tt.nextNode(),c.push({type:2,index:++o});s.append(d[u],wt())}}}else if(s.nodeType===8)if(s.data===Ee)c.push({type:2,index:o});else{let d=-1;for(;(d=s.data.indexOf(W,d+1))!==-1;)c.push({type:7,index:o}),d+=W.length-1}o++}}static createElement(t,e){let n=et.createElement("template");return n.innerHTML=t,n}};function it(i,t,e=i,n){if(t===R)return t;let s=n!==void 0?e._$Co?.[n]:e._$Cl,o=vt(t)?void 0:t._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(i),s._$AT(i,e,n)),n!==void 0?(e._$Co??=[])[n]=s:e._$Cl=s),s!==void 0&&(t=it(i,s._$AS(i,t.values),s,n)),t}var Ut=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:n}=this._$AD,s=(t?.creationScope??et).importNode(e,!0);tt.currentNode=s;let o=tt.nextNode(),a=0,r=0,c=n[0];for(;c!==void 0;){if(a===c.index){let l;c.type===2?l=new lt(o,o.nextSibling,this,t):c.type===1?l=new c.ctor(o,c.name,c.strings,this,t):c.type===6&&(l=new Ht(o,this,t)),this._$AV.push(l),c=n[++r]}a!==c?.index&&(o=tt.nextNode(),a++)}return tt.currentNode=et,s}p(t){let e=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,e),e+=n.strings.length-2):n._$AI(t[e])),e++}},lt=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,n,s){this.type=2,this._$AH=g,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=n,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=it(this,t,e),vt(t)?t===g||t==null||t===""?(this._$AH!==g&&this._$AR(),this._$AH=g):t!==this._$AH&&t!==R&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):_i(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==g&&vt(this._$AH)?this._$AA.nextSibling.data=t:this.T(et.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:n}=t,s=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=kt.createElement(yi(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===s)this._$AH.p(e);else{let o=new Ut(s,this),a=o.u(this.options);o.p(e),this.T(a),this._$AH=o}}_$AC(t){let e=fi.get(t.strings);return e===void 0&&fi.set(t.strings,e=new kt(t)),e}k(t){Te(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,n,s=0;for(let o of t)s===e.length?e.push(n=new i(this.O(wt()),this.O(wt()),this,this.options)):n=e[s],n._$AI(o),s++;s<e.length&&(this._$AR(n&&n._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let n=li(t).nextSibling;li(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},nt=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,n,s,o){this.type=1,this._$AH=g,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=g}_$AI(t,e=this,n,s){let o=this.strings,a=!1;if(o===void 0)t=it(this,t,e,0),a=!vt(t)||t!==this._$AH&&t!==R,a&&(this._$AH=t);else{let r=t,c,l;for(t=o[0],c=0;c<o.length-1;c++)l=it(this,r[n+c],e,c),l===R&&(l=this._$AH[c]),a||=!vt(l)||l!==this._$AH[c],l===g?t=g:t!==g&&(t+=(l??"")+o[c+1]),this._$AH[c]=l}a&&!s&&this.j(t)}j(t){t===g?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},zt=class extends nt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===g?void 0:t}},jt=class extends nt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==g)}},Bt=class extends nt{constructor(t,e,n,s,o){super(t,e,n,s,o),this.type=5}_$AI(t,e=this){if((t=it(this,t,e,0)??g)===R)return;let n=this._$AH,s=t===g&&n!==g||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,o=t!==g&&(n===g||s);s&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Ht=class{constructor(t,e,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){it(this,t)}},wi={M:Se,P:W,A:Ee,C:1,L:bi,R:Ut,D:_i,V:it,I:lt,H:nt,N:jt,U:Bt,B:zt,F:Ht},ss=Ae.litHtmlPolyfillSupport;ss?.(kt,lt),(Ae.litHtmlVersions??=[]).push("3.3.3");var vi=(i,t,e)=>{let n=e?.renderBefore??t,s=n._$litPart$;if(s===void 0){let o=e?.renderBefore??null;n._$litPart$=s=new lt(t.insertBefore(wt(),o),o,void 0,e??{})}return s._$AI(i),s};var Me=globalThis,O=class extends H{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=vi(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return R}};O._$litElement$=!0,O.finalized=!0,Me.litElementHydrateSupport?.({LitElement:O});var os=Me.litElementPolyfillSupport;os?.({LitElement:O});(Me.litElementVersions??=[]).push("4.2.2");var Wt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ht=i=>(...t)=>({_$litDirective$:i,values:t}),F=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,n){this._$Ct=t,this._$AM=e,this._$Ci=n}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var V=ht(class extends F{constructor(i){if(super(i),i.type!==Wt.ATTRIBUTE||i.name!=="class"||i.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(i){return" "+Object.keys(i).filter(t=>i[t]).join(" ")+" "}update(i,[t]){if(this.st===void 0){this.st=new Set,i.strings!==void 0&&(this.nt=new Set(i.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in t)t[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(t)}let e=i.element.classList;for(let n of this.st)n in t||(e.remove(n),this.st.delete(n));for(let n in t){let s=!!t[n];s===this.st.has(n)||this.nt?.has(n)||(s?(e.add(n),this.st.add(n)):(e.remove(n),this.st.delete(n)))}return R}});var{I:as}=wi,ki=i=>i;var xi=()=>document.createComment(""),dt=(i,t,e)=>{let n=i._$AA.parentNode,s=t===void 0?i._$AB:t._$AA;if(e===void 0){let o=n.insertBefore(xi(),s),a=n.insertBefore(xi(),s);e=new as(o,a,i,i.options)}else{let o=e._$AB.nextSibling,a=e._$AM,r=a!==i;if(r){let c;e._$AQ?.(i),e._$AM=i,e._$AP!==void 0&&(c=i._$AU)!==a._$AU&&e._$AP(c)}if(o!==s||r){let c=e._$AA;for(;c!==o;){let l=ki(c).nextSibling;ki(n).insertBefore(c,s),c=l}}}return e},K=(i,t,e=i)=>(i._$AI(t,e),i),rs={},qt=(i,t=rs)=>i._$AH=t,$i=i=>i._$AH,Ft=i=>{i._$AR(),i._$AA.remove()};var xt=ht(class extends F{constructor(){super(...arguments),this.key=g}render(i,t){return this.key=i,t}update(i,[t,e]){return t!==this.key&&(qt(i),this.key=t),e}});var Oe=new Map;function G(i,t){let e=i+JSON.stringify(t);if(!Oe.has(e)){let n;try{n=new Intl.DateTimeFormat(i,t)}catch{n=new Intl.DateTimeFormat(void 0,{...t,timeZone:void 0})}Oe.set(e,n)}return Oe.get(e)}function Ai(i,t){try{return new Intl.NumberFormat(i,t)}catch{return new Intl.NumberFormat(void 0,t)}}var x=(i,t)=>i.replace(/\{(\w+)\}/g,(e,n)=>t[n]??"");function ut(i,t){let e=G("en-US",{hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric",timeZone:t}).formatToParts(i);return Object.fromEntries(e.map(({type:n,value:s})=>[n,Number(s)]))}var cs=/^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d):(\d\d)(?::(\d\d)(\.\d+)?)?)?$/;function st(i,t){let e=cs.exec(i);if(!e)return Date.parse(i);let n=Date.UTC(+e[1],e[2]-1,+e[3],+(e[4]||0),+(e[5]||0),+(e[6]||0)),s=o=>{let a=ut(o,t);return Date.UTC(a.year,a.month-1,a.day,a.hour,a.minute,a.second)-o};return n-s(n-s(n))+(e[7]?Math.round(parseFloat(e[7])*1e3):0)}var I=(i,t)=>typeof i=="string"&&/^\d{4}-\d\d-\d\d/.test(i)?st(i,t):NaN,S=(i,t=NaN)=>{let e=i?Date.parse(i):NaN;return Number.isNaN(e)?t:e};function C(i,t){let e=ut(i,t);return Date.UTC(e.year,e.month-1,e.day)/864e5}var ot=i=>new Date(i*864e5).toISOString().slice(0,10),Y=(i,t)=>st(ot(i),t);function Ne(i){let t=i>0?Math.ceil(i/1e3):0,e=Math.floor(t/3600),n=Math.floor(t%3600/60),s=String(t%60).padStart(2,"0");return e?`${e}:${String(n).padStart(2,"0")}:${s}`:`${n}:${s}`}function Si(i){let t=/^(\d+):(\d\d):(\d\d)$/.exec(String(i??"").trim());return t?(+t[1]*3600+ +t[2]*60+ +t[3])*1e3:NaN}var ls={comma_decimal:"en-US",decimal_comma:"de",space_comma:"fr",quote_decimal:"de-CH",none:"en-US"};function hs(){return G(void 0,{hour:"numeric"}).resolvedOptions().hour12}var Vt=class{constructor(t,e,n){let s=t?.locale||{};this.lang=e,this.t=n,this.server=t?.config?.time_zone||void 0,this.zone=s.time_zone==="server"?this.server:void 0;let o={12:!0,24:!1,system:hs()}[s.time_format];this.time={timeZone:this.zone,...o===void 0?{}:{hour12:o}},this.numbers=Ai(s.number_format==="system"?void 0:ls[s.number_format]||e,{maximumFractionDigits:1,useGrouping:s.number_format!=="none"}),this.percents=Ai(e,{style:"percent",maximumFractionDigits:0});try{this.rel=new Intl.RelativeTimeFormat(e,{numeric:"auto",style:"short"})}catch{this.rel=new Intl.RelativeTimeFormat("en",{numeric:"auto",style:"short"})}}relative(t,e){let n=Math.round((t-e)/1e3),s=Math.round(n/60),o=Math.round(n/3600);return Math.abs(n)<60?(n>0?this.t.soon:this.t.just_now)||this.rel.format(0,"second"):Math.abs(s)<60?this.rel.format(s,"minute"):Math.abs(o)<24?this.rel.format(o,"hour"):this.rel.format(Math.round(n/86400),"day")}entryTime(t,e){if(!Number.isFinite(t.ts))return"";if(t.clock)return Ne(t.ts-e);if(t.day){let{near:n,text:s}=this.day(t.ts,this.server,e);return n?s:x(this.t.on_date,{d:s})}return this.relative(t.past?Math.min(t.ts,e):t.ts,e)}absolute(t){return G(this.lang,{dateStyle:"medium",timeStyle:"short",...this.time}).format(t)}absoluteDate(t,e){return G(this.lang,{dateStyle:"medium",timeZone:e}).format(t)}clockTime(t){return G(this.lang,{hour:"numeric",minute:"2-digit",...this.time}).format(t)}hour(t){let e=G(this.lang,{hour:"numeric",...this.time});return e.formatToParts(t).every(n=>n.type==="hour")?this.clockTime(t):e.format(t).replace(/^0(?=\d\D)/,"")}day(t,e,n){let s=C(t,e)-C(n,this.zone);return Math.abs(s)<=1?{near:!0,text:this.rel.format(s,"day")}:{near:!1,text:G(this.lang,{day:"2-digit",month:"2-digit",timeZone:e}).format(t)}}at(t,e){let{near:n,text:s}=this.day(t,this.zone,e);return x(n?this.t.day_at:this.t.date_at,{d:s,t:this.clockTime(t)})}calendar(t,e,n){let s=t?st(t,this.server):NaN;if(Number.isNaN(s))return this.t.event;if(!e)return this.at(s,n);let{near:o,text:a}=this.day(s,this.server,n);return o?a:x(this.t.on_date,{d:a})}slotLabel(t,e,n){let s=C(t,this.zone)-C(n,this.zone),o=Math.abs(s)<=1?this.rel.format(s,"day"):G(this.lang,{weekday:"long",timeZone:this.zone}).format(t);return this.capital(e!=="hourly"?o:s===0?this.clockTime(t):x(this.t.day_at,{d:o,t:this.clockTime(t)}))}nowLabel(){return this.capital(this.rel.format(0,"second"))}capital(t){return t.charAt(0).toLocaleUpperCase(this.lang)+t.slice(1)}number(t){return this.numbers.format(t)}percent(t){return this.percents.format(t/100)}};var k=i=>i.split(".")[0],Mi=new Set(["ai_task","button","conversation","event","image","infrared","input_button","notify","radio_frequency","scene","stt","tag","tts","wake_word","datetime"]),ds={alarm_control_panel:["disarmed"],alert:["idle"],cover:["closed"],device_tracker:["not_home"],lawn_mower:["docked","paused","idle"],lock:["locked"],media_player:["standby"],person:["not_home"],vacuum:["idle","docked","paused"],valve:["closed"]},Ei={camera:["streaming","recording"],group:["on","home","open","locked","problem"],plant:["problem"],timer:["active"]},Oi=i=>Mi.has(i);function X(i,t=i.state){let e=k(i.entity_id);return Mi.has(e)?t!=="unavailable":t==="unavailable"||t==="unknown"||t==="off"&&e!=="alert"?!1:Ei[e]?Ei[e].includes(t):!(ds[e]||[]).includes(t)}var us=new Set(["alarm_control_panel","alert","automation","binary_sensor","calendar","camera","climate","cover","device_tracker","fan","group","humidifier","input_boolean","lawn_mower","light","lock","media_player","person","plant","remote","schedule","script","siren","sun","switch","timer","update","vacuum","valve","water_heater","weather"]),ps=i=>i.reduceRight((t,e)=>`var(${e}${t?", "+t:""})`,""),Ni="\xE0\xE1\xE2\xE4\xE6\xE3\xE5\u0101\u0103\u0105\u0430\u0431\xE7\u0107\u010D\u0111\u010F\u0434\xE8\xE9\xEA\xEB\u0113\u0117\u0119\u011B\u0435\u0451\u044D\u0444\u011F\u01F5\u0433\u1E27\xEE\xEF\xED\u012B\u012F\xEC\u0131\u0130\u0438\u0439\u043A\u0142\u043B\u1E3F\u043C\xF1\u0144\u01F9\u0148\u043D\xF4\xF6\xF2\xF3\u0153\xF8\u014D\xF5\u0151\u043E\u1E55\u043F\u0155\u0159\u0440\xDF\u015B\u0161\u015F\u0219\u0441\u0165\u021B\u0442\xFB\xFC\xF9\xFA\u016B\u01D8\u016F\u0171\u0173\u0443\u0432\u1E83\u1E8D\xFF\xFD\u044B\u017E\u017A\u017C\u0437\xB7",ms="aaaaaaaaaaabcccdddeeeeeeeeeeefggghiiiiiiiiijkllmmnnnnnoooooooooopprrrsssssstttuuuuuuuuuuvwxyyyzzzz_",fs={\u0436:"zh",\u0445:"kh",\u0446:"ts",\u0447:"ch",\u0448:"sh",\u0449:"shch",\u044E:"iu",\u044F:"ia"},_s=new RegExp(Ni.split("").join("|"),"g");function Ti(i){return i===""?"":String(i).toLowerCase().replace(_s,e=>ms.charAt(Ni.indexOf(e))).replace(/[а-я]/g,e=>fs[e]||"").replace(/(\d),(?=\d)/g,"$1").replace(/[^a-z0-9]+/g,"_").replace(/_+/g,"_").replace(/^_+|_+$/g,"")||"unknown"}function pt(i,t,e,n){let s=n?"active":"inactive";return ps([...t?[`--state-${i}-${t}-${Ti(e)}-color`]:[],`--state-${i}-${Ti(e)}-color`,`--state-${i}-${s}-color`,`--state-${s}-color`])}var Ci=(i,t=i.state)=>pt(k(i.entity_id),i.attributes.device_class,t,X(i,t)),gs=i=>{let t=new Set((i.attributes.entity_id||[]).map(e=>k(String(e))));return t.size===1?[...t][0]:void 0};function $t(i){let{state:t,attributes:e}=i;if(t==="unavailable")return"var(--state-unavailable-color)";let n=k(i.entity_id),s=X(i);if(n==="sensor"&&e.device_class==="battery"&&t!==""&&!isNaN(Number(t))){let a=Number(t);return`var(--state-sensor-battery-${a>=70?"high":a>=30?"medium":"low"}-color)`}let o=n==="group"?gs(i):n;return us.has(o)&&n!=="person"&&n!=="device_tracker"?pt(o,e.device_class,t,s):s?"var(--state-icon-color)":"var(--state-inactive-color)"}var ys=new Set(["primary","accent","red","pink","purple","deep-purple","indigo","blue","light-blue","cyan","teal","green","light-green","lime","yellow","amber","orange","deep-orange","brown","light-grey","grey","dark-grey","blue-grey","black","white","primary-text","secondary-text","disabled"]),Kt=i=>ys.has(i)?`var(--${i}-color)`:i,J={updateInstall:1,todoUpdate:4,coverClose:2,valveClose:2,vacuumReturn:16,mowerDock:4,sirenOff:2},Gt=(i,t)=>(Number(i.attributes.supported_features)&t)===t,bs="zone.home",ws=i=>i.entity_id===bs?"home":i.attributes.friendly_name===void 0?i.entity_id.split(".")[1].replace(/_/g," "):String(i.attributes.friendly_name??"");function vs(i,t){return[...Array.isArray(i.attributes.in_zones)?i.attributes.in_zones:[],...Object.keys(t).filter(s=>s.startsWith("zone."))].map(s=>t[s]).find(s=>s&&ws(s)===i.state)}var ks={climate:{attribute:"hvac_action",modes:{cooling:"cool",defrosting:"heat",drying:"dry",fan:"fan_only",heating:"heat",idle:"off",off:"off",preheating:"heat"},icons:{cooling:"mdi:snowflake",defrosting:"mdi:snowflake-melt",drying:"mdi:water-percent",fan:"mdi:fan",heating:"mdi:fire",idle:"mdi:clock-outline",preheating:"mdi:heat-wave"}},humidifier:{attribute:"action",modes:{drying:"on",humidifying:"on",idle:"off",off:"off"},icons:{drying:"mdi:arrow-down-bold",humidifying:"mdi:arrow-up-bold",idle:"mdi:clock-outline"}}};function Di(i,t){let e=k(i.entity_id);if(i.state==="unknown")return null;if(e==="person"||e==="device_tracker")return{icon:(i.state==="home"||i.state==="not_home"?void 0:vs(i,t))?.attributes.icon||(i.state==="not_home"?"mdi:home-export-outline":"mdi:home"),color:Ci(i)};let n=ks[e],s=n&&i.attributes[n.attribute];return!s||s==="off"?null:{attribute:n.attribute,icon:n.icons[s]||"mdi:circle-medium",color:Ci(i,n.modes[s])}}var De=new WeakMap;function xs(i,t){if(!De.has(i)){let e=new Map;for(let[n,s]of Object.entries(i))s?.device_id&&e.set(s.device_id,[...e.get(s.device_id)||[],n]);De.set(i,e)}return De.get(i).get(t)||[]}var Re=["sensor","binary_sensor"],$s=(i,t)=>xs(i.entities,t).filter(e=>i.states[e]?.attributes.device_class==="battery"&&Re.includes(k(e))).sort((e,n)=>Re.indexOf(k(e))-Re.indexOf(k(n)))[0];function Yt(i,t){let e=k(t.entity_id)==="person"?t.attributes.device_trackers:[t.entity_id];for(let n of Array.isArray(e)?e:[]){let s=i.entities?.[n]?.device_id,o=s&&$s(i,s);if(o)return o}}var mt=i=>String(i??"").replace(/<br\s*\/?>/gi,`
`).replace(/!\[[^[\]]*\]\([^()]*\)/g,"").replace(/\[([^[\]]*)\]\([^()]*\)/g,"$1").replace(/<\/?[a-z][^<>]*>/gi,"").replace(/(\*\*|__|~~|`)(.+?)\1/g,"$2").replace(/^ {0,3}(#{1,6} +|> ?|[-*+] +)/gm,"").replace(/\n{3,}/g,`

`).trim(),Ri=/^(https?:\/\/|\/(?!\/))/i;function Ii(i){let t=/\[[^[\]]*\]\(([^()\s]+)[^()]*\)/.exec(String(i??"").replace(/!\[[^[\]]*\]\([^()]*\)/g,""));return t&&Ri.test(t[1])?t[1]:null}function Pi(i){let t=/!\[[^[\]]*\]\(\s*([^()\s]*)[^()]*\)/.exec(String(i??""));return t&&Ri.test(t[1])?t[1]:null}var At=i=>({tap_action:i.startsWith("/")?{action:"navigate",navigation_path:i}:{action:"url",url_path:i}});var E=i=>i!=null&&typeof i=="object"&&!Array.isArray(i),L=i=>i==null||i===""||i===!1||typeof i=="object"&&Object.keys(i).length===0;var z=(...i)=>i.join("\0"),at=(i,t,e,n={})=>({label:t,action:{entity:i,tap_action:{action:"perform-action",perform_action:e,target:{entity_id:i},...n}}}),U=(i,t)=>{for(let e of t){let n=i?.[e];if(typeof n=="string"&&n||typeof n=="number")return String(n)}return""},zi=(i,t)=>t.split(".").reduce((e,n)=>e?.[n],i),Pe=["image","image_url","picture","thumbnail"];function Xt(i){return typeof i.entity_picture=="string"&&i.entity_picture?i.entity_picture:Pe.map(t=>i[t]).find(t=>typeof t=="string"&&/^(https?:\/\/|\/|data:image\/)/i.test(t))||null}var ji=["description","summary"],Bi=i=>E(i)&&U(i,["name","title"])!=="",Hi=i=>Object.keys(i).find(t=>Bi(i[t])&&[...ji,...Pe].some(e=>!L(i[t][e]))),Wi=i=>{let t=String(i).trim().toLowerCase();return["off","unavailable","unknown","idle","none",""].includes(t)||Number(t)===0},As=i=>{let t=String(i).toLowerCase();return t==="on"||t==="active"||Number(i)>0};function Li(i,t,e,n){let s=i.attributes,o=t.attribute||Hi(s),a=o?zi(s,o):void 0,r={kind:n,ts:S(i.last_changed,e.now),past:!0,once:!0};if(Bi(a)){let c=U(a,["name","title"]),l=U(a,ji);return[{...r,title:c,message:l||e.name(i,t.name),image:U(a,Pe),ack:z(c,l)}]}return n==="attribute"?!t.attribute||L(a)||typeof a=="object"?[]:[{...r,title:e.attr(i,o,a),message:e.name(i,t.name),ack:String(a)}]:Wi(i.state)?[]:[{...r,title:e.state(i),message:e.name(i,t.name),ack:String(i.state)}]}function Jt(i,t,e){return i>e.now?i-e.now>t?(e.wake(i-t),!1):!0:!1}function qi(i,t,e){let n=i.attributes;if(!n.message)return[];let s={kind:"calendar",title:n.message,message:e.clock.calendar(n.start_time,n.all_day,e.now),color:pt("calendar",null,"on",!0)};if(i.state==="on")return[{...s,ts:S(i.last_changed,e.now),past:!0,ack:z(n.message,n.start_time)}];let o=I(n.start_time,e.clock.server);return i.state!=="off"||!(t.lead>=0)||!Jt(o,t.lead,e)?[]:[{...s,...n.all_day?{message:""}:{},ts:o,day:!!n.all_day,ack:z(n.message,n.start_time,"ahead")}]}var Ss=12*36e5,Es=/^\d{4}-\d\d-\d\d$/;function Ts(i,t,e){let n=t.lead>=0?t.lead:Ss;if(k(i.entity_id)==="calendar")return qi(i,{...t,lead:n},e).map(l=>({...l,kind:"waste"}));let s=e.dayOf(e.now,e.clock.server),o=Object.keys(i.attributes).filter(l=>Es.test(l)&&C(Date.parse(l+"T12:00:00Z"),"UTC")>=s).sort()[0];if(!o)return[];let a=C(Date.parse(o+"T12:00:00Z"),"UTC"),r=Y(a,e.clock.server);if(a>s&&!Jt(r,n,e))return[];let c=i.attributes[o];return[{kind:"waste",title:typeof c=="string"&&c||e.name(i,t.name),message:"",ts:r,day:!0,expires:Y(a+1,e.clock.server),ack:z(o,c)}]}function Cs(i,t,e){if(i.state!=="on")return[];let{attributes:n,entity_id:s}=i,o=e.t,a=typeof n.update_percentage=="number"?Math.round(n.update_percentage):null,r=n.in_progress?[{label:a===null?o.installing:x(o.installing_pct,{p:a}),disabled:!0}]:null,c=e.admin&&Gt(i,J.updateInstall)?[at(s,o.install,"update.install")]:[];return[{kind:"update",title:(t.name?e.name(i,t.name):n.title||e.name(i).replace(/\s*update\s*$/i,"").trim())||o.update,message:n.latest_version?x(o.update_msg,{v:n.latest_version}):o.update_msg_plain,ts:S(i.last_changed,e.now),past:!0,actions:r||c,...e.admin&&!n.auto_update?{dismiss:{service:["update","skip",{entity_id:s}]}}:{ack:String(n.latest_version)}}]}var Ui={triggered:"crit",pending:"warn",arming:"warn"};function Ms(i,t,e){return Ui[i.state]?[{kind:"alarm",sev:Ui[i.state],title:e.name(i,t.name),message:e.state(i),ts:S(i.last_changed,e.now),past:!0}]:[]}function Os(i,t,e){return i.state!=="on"?[]:[{kind:"alert",sev:"warn",title:e.name(i,t.name),message:"",ts:S(i.last_changed,e.now),past:!0,ack:"on"}]}function Ns(i,t,e){let{attributes:n,entity_id:s}=i,o=e.t,a={kind:"timer",title:e.name(i,t.name)};if(i.state==="active"){let r=S(n.finishes_at),c=Number.isFinite(r)?x(o.ends_at,{t:e.clock.clockTime(r),s:e.state(i)}):e.state(i);return[{...a,message:c,ts:r,live:!0,clock:!0,ack:String(n.finishes_at),actions:[at(s,o.act_pause,"timer.pause"),at(s,o.act_cancel,"timer.cancel")]}]}return i.state!=="paused"?[]:[{...a,message:x(o.paused_left,{t:Ne(Si(n.remaining)),s:e.state(i)}),ts:S(i.last_changed,e.now),past:!0,ack:z("paused",n.remaining),actions:[at(s,o.act_resume,"timer.start"),at(s,o.act_cancel,"timer.cancel")]}]}var Ds={d:864e5,h:36e5,min:6e4,s:1e3,ms:1},Rs=i=>i.device_class==="timestamp"?void 0:Ds[i.unit_of_measurement];function Is(i,t,e){let n=Rs(i.attributes),s=n?S(i.last_changed)+Number(i.state)*n:I(i.state,e.clock.server),o=Math.round(s/6e4)*6e4;return Jt(o,t.lead>=0?t.lead:1/0,e)?[{kind:"countdown",title:e.name(i,t.name),message:n?e.clock.absolute(o):e.state(i),ts:o,live:!0,ack:""}]:[]}var Ps=12*36e5;function Ls(i,t,e){let n=I(i.state,e.clock.server);return Jt(n,t.lead>=0?t.lead:Ps,e)?[{kind:"next_alarm",title:t.name?e.name(i,t.name):e.t.next_alarm,message:e.clock.at(n,e.now),ts:n,ack:String(i.state)}]:[]}function Us(i,t){for(let e of t){let n=i.states[e],s=n?.attributes||{};if(e.startsWith("image.")&&s.access_token)return`/api/image_proxy/${e}?token=${encodeURIComponent(s.access_token)}&state=${encodeURIComponent(n.state)}`;if(s.entity_picture)return s.entity_picture}return null}function zs(i,t,e){let n=I(i.state,e.clock.server);if(!Number.isFinite(n))return[];let s=i.attributes.event_type,o=e.devicePictures(i.entity_id);return o.forEach(e.watch),[{kind:"event",title:e.name(i,t.name),message:s==null||s===""?"":e.attr(i,"event_type",s),ts:n,past:!0,expires:n+864e5,image:Xt(i.attributes)||Us(e.hass,o),ack:String(i.state)}]}function js(i,t,e){let n=i.entity_id,s=t.lead>=0?t.lead:0,o=e.dayOf(e.now),a=Gt(i,J.todoUpdate),r=l=>a?[at(n,e.t.act_done,"todo.update_item",{data:{item:l.uid,status:"completed"}})]:[],c=[];for(let l of e.todos(n)||[]){if(l?.status!=="needs_action"||!l.uid||typeof l.due!="string")continue;let h=!l.due.includes("T"),d=I(l.due,e.clock.server);if(Number.isFinite(d)){if(e.dayOf(d,h?e.clock.server:e.clock.zone)>o&&d-e.now>s){e.wake(d-s),e.wake(e.midnight);continue}c.push({key:`t:${n}:${l.uid}`,kind:"todo",title:String(l.summary||""),message:e.name(i,t.name),ts:d,day:h,ack:z(l.uid,l.due),tap:At("/todo?entity_id="+n),actions:r(l)})}}return c}var Fi={lock:{sev:{jammed:"warn"},label:"act_lock",action:"lock.lock",when:["unlocked","open","jammed"],assumed:!0},cover:{label:"act_close_cover",action:"cover.close_cover",feature:J.coverClose,when:["open","opening"],assumed:!0,confirm:!0},valve:{label:"act_close_valve",action:"valve.close_valve",feature:J.valveClose,when:["open","opening"],assumed:!0,confirm:!0},vacuum:{sev:{error:"warn"},label:"act_dock_vacuum",action:"vacuum.return_to_base",feature:J.vacuumReturn,when:["cleaning","error"]},lawn_mower:{sev:{error:"warn"},label:"act_dock_mower",action:"lawn_mower.dock",feature:J.mowerDock,when:["mowing","returning","error"]},siren:{sev:{on:"crit"},label:"act_off",action:"siren.turn_off",feature:J.sirenOff,when:["on"]}};function Bs(i,t,e){if(!X(i))return[];let{attributes:n,entity_id:s}=i,o=Fi[k(s)],a=o&&(o.when.includes(i.state)||o.assumed&&n.assumed_state===!0)&&(!o.feature||Gt(i,o.feature))&&!(k(s)==="lock"&&n.code_format);return[{kind:"device",sev:o?.sev?.[i.state],title:e.name(i,t.name),message:e.members(i)||e.state(i),ts:S(i.last_changed,e.now),past:!0,ack:String(i.state),actions:a?[at(s,e.t[o.label],o.action,o.confirm?{confirmation:!0}:{})]:[]}]}var Vi={extreme:"crit",severe:"crit",moderate:"warn"},Ki=i=>!!(U(i,["severity"])&&U(i,["headline","event"])),Hs=/^([a-z][a-z0-9]*)_(\d+)_(headline|name|title|event)$/,Gi=i=>{let t=new Map;for(let e of Object.keys(i)){let n=Hs.exec(e);if(!n||L(i[e]))continue;let s=a=>i[`${n[1]}_${n[2]}_${a}`];(n[3]==="headline"||n[3]==="event"||!L(s("level"))||!L(s("severity")))&&t.set(n[1]+n[2],{prefix:n[1],n:Number(n[2])})}return[...t.values()].sort((e,n)=>e.n-n.n)},Ie=(i,t,e)=>i.map(n=>I(t(n),e)).find(Number.isFinite);function Ws(i,t,e){let n=i.entity_id,s=new Set;return t.map(({prefix:o,n:a})=>{let r=_=>i.attributes[`${o}_${a}_${_}`],c={headline:r("headline"),name:r("name"),title:r("title"),event:r("event")},l=U(c,["headline","name","title","event"]),h=Number(r("level"))||0,d=mt(U({d:r("description")},["d"])),u=Ie(["start","onset"],r,e.clock.server),p=Ie(["end","expires"],r,e.clock.server),f=`w:${n}:${r("name")||l}:${r("start")||r("onset")||""}`;for(;s.has(f);)f+="+";return s.add(f),{key:f,kind:"warning",sev:h>=3||Vi[String(r("severity")).toLowerCase()]==="crit"?"crit":"warn",title:l,message:d||(h?x(e.t.level,{l:h}):e.name(i)),ts:u??S(i.last_changed,e.now),past:u===void 0,expires:p,ack:z(l,h,d)}})}function qs(i,t,e){let n=Gi(i.attributes);if(n.length)return Ws(i,n,e);if(i.state!=="on")return[];let s=Ki(i.attributes)?i.attributes:e.details(i),o=s||{},a=p=>o[p],r=e.clock.server,c=Ie(["start","onset","effective"],a,r),l=I(o.sent,r),h=I(o.expires,r),d=U(o,["headline","event"]),u=mt(U(o,["description"]));return[{kind:"warning",sev:Vi[String(o.severity).toLowerCase()],title:d||e.name(i,t.name),message:u,ts:c??(Number.isFinite(l)?l:S(i.last_changed,e.now)),past:c===void 0,expires:Number.isFinite(h)?h:void 0,waiting:s===void 0,ack:d?z(d,o.severity,u):String(i.attributes.id||"")}]}var Fs={smoke:"crit",gas:"crit",carbon_monoxide:"crit",moisture:"crit",safety:"crit",heat:"crit",problem:"warn",tamper:"warn",battery:"warn",sound:"warn"};function Vs(i,t,e){if(!(t.visibility?!["unavailable","unknown"].includes(i.state):t.type?!Wi(i.state):As(i.state)))return[];let s=i.attributes,o=k(i.entity_id)==="binary_sensor";return[{kind:"generic",sev:o&&i.state==="on"?Fs[s.device_class]:void 0,deviceClass:o&&typeof s.device_class=="string"&&!Array.isArray(s.entity_id)?s.device_class:void 0,title:e.name(i,t.name),message:e.members(i)||e.state(i),ts:S(i.last_changed,e.now),past:!0,ack:String(i.state)}]}var St=[{name:"warning",icon:"mdi:alert-circle",fits:(i,t)=>Gi(i.attributes).length>0||k(i.entity_id)==="binary_sensor"&&(Ki(i.attributes)||Ue(t,i.entity_id)),show:qs},{name:"waste",icon:"mdi:trash-can-outline",ahead:!0,fits:(i,t)=>Qt(t,i.entity_id)==="waste_collection_schedule",show:Ts},{name:"calendar",icon:"mdi:calendar-month",ahead:!0,fits:i=>k(i.entity_id)==="calendar",show:qi},{name:"update",icon:"mdi:rocket-launch",fits:i=>k(i.entity_id)==="update",show:Cs},{name:"alarm",icon:"mdi:shield-alert",fits:i=>k(i.entity_id)==="alarm_control_panel",show:Ms},{name:"alert",icon:"mdi:alert",fits:i=>k(i.entity_id)==="alert",show:Os},{name:"timer",icon:"mdi:timer-outline",fits:i=>k(i.entity_id)==="timer",show:Ns},{name:"attribute",icon:"mdi:card-text-outline",fits:i=>!!Hi(i.attributes),show:(i,t,e)=>Li(i,t,e,"attribute")},{name:"event",icon:"mdi:eye-check",fits:i=>k(i.entity_id)==="event",show:zs},{name:"device",icon:"mdi:devices",fits:i=>!!Fi[k(i.entity_id)],show:Bs},{name:"next_alarm",icon:"mdi:alarm",ahead:!0,fits:i=>i.attributes["Time in Milliseconds"]!=null&&i.attributes.device_class==="timestamp",show:Ls},{name:"countdown",icon:"mdi:timer-sand",ahead:!0,fits:i=>k(i.entity_id)==="sensor"&&i.attributes.device_class==="timestamp",show:Is},{name:"todo",icon:"mdi:clipboard-check-outline",ahead:!0,show:js},{name:"picture",icon:"mdi:image-outline",show:(i,t,e)=>Li(i,t,e,"picture")},{name:"generic",icon:"mdi:information-outline",fits:()=>!0,show:Vs}],Ks=Object.fromEntries(St.map(i=>[i.name,i])),Zt=St.map(i=>i.name),Yi=St.filter(i=>i.ahead).map(i=>i.name),D={...Object.fromEntries(St.map(i=>[i.name,i.icon])),system:"mdi:bell",repair:"mdi:wrench",group:"mdi:google-circles-communities",weather:"mdi:weather-partly-rainy"};function Le(i,t,e){return i.type?i.type:i.attribute?"attribute":t?St.find(n=>n.fits?.(t,e)).name:"generic"}var Qt=(i,t)=>i?.entities?.[t]?.platform||"",Ue=(i,t)=>!!i?.services?.[Qt(i,t)]?.get_details;function Xi(i,t,e){if(!t)return[];let n=Le(i,t,e.hass),s;try{s=Ks[n].show(t,i,e)}catch(l){return console.warn(`origami-notifications: ${t.entity_id} could not be shown`,l),[]}let o=t.entity_id,a=i.image&&(i.image.includes("/")?i.image:zi(t.attributes,i.image)),r=i.tap_action&&i.tap_action.action!=="none"?{entity:o,tap_action:i.tap_action}:void 0,c=(i.actions||[]).map(l=>({label:l.label,action:{entity:o,tap_action:l.tap_action}}));return s.map(l=>{let h=i.image?a:l.image||Xt(t.attributes);return{key:`${n}:${o}${i.attribute?":"+i.attribute:""}`,entity:o,...l,icon:i.icon||l.icon,color:i.color&&i.color!=="state"?Kt(i.color):l.color,image:typeof h=="string"&&h?h:null,backdrop:!!i.background,tap:i.tap_action?r:l.tap,inert:i.tap_action?.action==="none",actions:[...l.actions||[],...c],stateObj:l.kind==="todo"?void 0:t}})}var q="origami-notifications",ze=["daily","hourly","twice_daily"],Et={updates:!0,repairs:!0,hide_when_empty:!0,vertical:!1,rotate:8,slide:"up"},te=i=>typeof i=="string"&&/^\w+\.\w+$/.test(i),Ji={days:864e5,hours:36e5,minutes:6e4,seconds:1e3};function rt(i){let t=NaN;if(typeof i=="number")t=i*6e4;else if(typeof i=="string"){let e=/^(\d+):(\d+)(?::(\d+(?:\.\d+)?))?$/.exec(i.trim());e&&(t=e[1]*36e5+e[2]*6e4+(e[3]||0)*1e3)}else E(i)&&Object.keys(i).length&&Object.keys(i).every(e=>e in Ji)&&(t=Object.entries(i).reduce((e,[n,s])=>e+Number(s)*Ji[n],0));return t>=0&&Number.isFinite(t)?t:NaN}var Gs=i=>{throw new Error(`${q}: ${i}`)},v=(i,t)=>i||Gs(t),$=(i,t)=>i==null||t(i),Zi=i=>$(i,E);function Ys(i){let t=typeof i=="string"?{entity:i}:E(i)?{...i}:null;return v(t&&te(t.entity),"entities must contain entity ids, got "+JSON.stringify(i)),v($(t.type,e=>Zt.includes(e)),`unknown type '${t.type}'`),v($(t.attribute,e=>typeof e=="string"),"attribute must be the name of an attribute"),v($(t.image,e=>typeof e=="string"),"image must be an attribute path or URL"),v($(t.background,e=>typeof e=="boolean"),"background must be true or false"),v($(t.color,e=>typeof e=="string"),"color must be a theme color like green, or a CSS color"),v($(t.visibility,Array.isArray),`visibility of ${t.entity} must be a list of conditions`),v($(t.before,e=>rt(e)>=0),"before must be minutes or a duration like 1:30:00"),v(Zi(t.tap_action),"tap_action must be an action"),v($(t.actions,e=>Array.isArray(e)&&e.every(n=>E(n)&&typeof n.label=="string"&&E(n.tap_action))),"actions must be a list of buttons with a label and a tap_action"),{...t,lead:t.before==null?void 0:rt(t.before)}}function Xs(i){let t=typeof i=="string"?{entity:i}:E(i)?{...i}:null;v(t&&te(t.entity),"infos must contain entity ids, got "+JSON.stringify(i)),v($(t.visibility,Array.isArray),`visibility of ${t.entity} must be a list of conditions`),v($(t.forecast_type,e=>ze.includes(e)),"forecast_type must be daily, hourly or twice_daily");for(let e of["show_current","show_forecast","show_entity_picture","show_battery"])v($(t[e],n=>typeof n=="boolean"),e+" must be true or false");v($(t.forecast_slots,e=>Number.isInteger(e)&&e>0),"forecast_slots must be a whole number above 0");for(let e of["tap_action","hold_action","double_tap_action"])v(Zi(t[e]),e+" must be an action");return t}function Js(i){v($(i,E),"audience must map sources to only or except");for(let[t,e]of Object.entries(i||{})){let n=E(e)?["only","except"].filter(o=>o in e):[];v(n.length===1,`audience.${t} needs either only or except`);let s=e[n[0]];v(Array.isArray(s)&&s.every(o=>typeof o=="string"&&o.startsWith("person.")),`audience.${t}.${n[0]} must list person entities, e.g. person.anna`)}return i||{}}function ee(i){v($(i.entities,Array.isArray),"entities must be a list"),v($(i.infos,Array.isArray),"infos must be a list"),v($(i.weather,e=>typeof e=="string"&&e.startsWith("weather.")),"weather must be a weather entity, e.g. weather.home"),v($(i.label,e=>typeof e=="string"),"label must be a label ID"),v($(i.css,e=>typeof e=="string"),"css must be a string"),v($(i.rotate,e=>typeof e=="number"&&e>=0),"rotate must be the seconds between turns, or 0 to turn them off"),v($(i.slide,e=>e==="up"||e==="side"),"slide must be up or side");for(let e of["updates","repairs","hide_when_empty","vertical"])v($(i[e],n=>typeof n=="boolean"),e+" must be true or false");let t=[];for(let e of i.entities||[]){let n=Ys(e);t.some(s=>s.entity===n.entity)||t.push(n)}return{...Et,...i,entities:t,infos:(i.infos||[]).map(Xs),audience:Js(i.audience)}}var Qi=new Map;function tn(i,t,e){let n=t.entity_id,s=t.attributes.id||t.last_changed,o=Qi.get(n);if(o?.warning!==s){if(!Ue(i,n))return Object.keys(i.services||{}).length?null:void 0;o={warning:s,data:void 0,waiting:new Set},Qi.set(n,o);let a=r=>{o.data=E(r)?r:null,o.waiting.forEach(c=>c()),o.waiting.clear()};Promise.resolve().then(()=>i.callService(Qt(i,n),"get_details",{},{entity_id:n},!1,!0)).then(r=>a(r?.response?.[n]),()=>a(null))}return o.data===void 0&&o.waiting.add(e),o.data}var He="origami-notifications-ack",Zs=64,Qs=1e4,Z=null,je=new Map;function en(){if(!Z)try{let i=JSON.parse(localStorage.getItem(He)||"{}");Z=i&&typeof i=="object"&&!Array.isArray(i)?i:{}}catch{Z={}}return Z}function nn(){let i=new Set([...je.values()].flatMap(n=>[...n])),t=Object.keys(Z),e=[...t.filter(n=>!i.has(n)),...t.filter(n=>i.has(n))];for(let n of e.slice(0,Math.max(t.length-Zs,0)))delete Z[n];try{localStorage.setItem(He,JSON.stringify(Z))}catch{}}var Be=new Set,sn=i=>Be.forEach(t=>t!==i&&t());window.addEventListener("storage",i=>{i.key===He&&(Z=null,sn())});var ie=class{constructor(t){this.onChange=t,this.pending=new Map}connect(){this.connected=!0,Be.add(this.onChange)}disconnect(){this.connected=!1,Be.delete(this.onChange),je.delete(this)}apply(t,e,n,s){let o=en(),a=new Set(t.map(h=>h.key)),r=!1,c=h=>{o[h]!==void 0&&(delete o[h],r=!0)};for(let[h,d]of this.pending)!a.has(h)||d<=n?this.pending.delete(h):Number.isFinite(d)&&s(d);let l=[];for(let h of t){if(this.pending.has(h.key))continue;if(h.waiting){o[h.key]===void 0&&l.push({...h,ack:void 0});continue}if(h.dismiss||h.ack===void 0){l.push(h);continue}let d=h.once?h.ack:z(h.ack,h.ts);o[h.key]!==d&&(c(h.key),l.push({...h,signature:d}))}for(let h of e)a.has(h)||c(h);return this.connected&&je.set(this,a),r&&nn(),l}dismiss(t,e){let n=en(),s=!1;for(let o of t.flatMap(a=>a.members||[a]))if(o.signature)n[o.key]=o.signature,s=!0;else if(o.dismiss){let{key:a}=o;this.pending.set(a,1/0),e(o.dismiss).then(()=>{this.pending.get(a)===1/0&&(this.pending.set(a,Date.now()+Qs),this.onChange())},r=>{console.warn(`origami-notifications: Home Assistant kept ${a}`,r),this.pending.delete(a)&&this.onChange()})}s&&(nn(),sn(this.onChange)),this.onChange()}},ne=i=>!!(i.dismiss||i.signature||i.members?.every(t=>t.signature));var se=class{constructor(t,e){this.head=t,this.on=e,this.press=null,this.suppress=!1,this.tapWait=null,t.addEventListener("pointerdown",n=>this.down(n)),t.addEventListener("pointermove",n=>this.move(n)),t.addEventListener("pointerup",n=>this.up(n,!1)),t.addEventListener("pointercancel",n=>n!==this.ownCancel&&this.up(n,!0)),t.addEventListener("pointerleave",n=>!this.press?.drag&&this.up(n,!0)),t.parentElement.addEventListener("click",n=>this.click(n),!0),t.addEventListener("keydown",n=>this.key(n))}down(t){if(t.button>0||!t.isPrimary)return;this.suppress=!1;let e={id:t.pointerId,x:t.clientX,y:t.clientY,t:t.timeStamp,dx:0,drag:!1},n=this.on.holdAction();n&&(e.timer=setTimeout(()=>{this.suppress=!0,n()},500)),this.press=e}move(t){let e=this.press;if(!e||t.pointerId!==e.id)return;let n=t.clientX-e.x,s=t.clientY-e.y;if(!e.drag){if(Math.hypot(n,s)>10&&clearTimeout(e.timer),!this.on.canDrag()||Math.abs(n)<10||Math.abs(n)<Math.abs(s)*1.5)return;e.drag=!0,this.suppress=!0,this.head.setPointerCapture?.(e.id),this.ownCancel=new PointerEvent("pointercancel",{pointerId:t.pointerId,pointerType:t.pointerType,isPrimary:!0}),this.head.dispatchEvent(this.ownCancel)}e.dx=n,this.on.drag(n)}up(t,e){let n=this.press;if(!n||t.pointerId!==n.id||(this.press=null,clearTimeout(n.timer),!n.drag))return;let s=Math.abs(n.dx)/Math.max(t.timeStamp-n.t,1)>.5,o=!e&&(Math.abs(n.dx)>48||s);this.on.dragEnd(o?Math.sign(-n.dx)*(this.on.rtl()?-1:1):0)}click(t){if(this.head.contains(t.target)){if(this.suppress){this.suppress=!1,t.stopPropagation();return}this.activate()}}activate(){let t=this.on.doubleTapAction();if(!t)return this.on.tap();if(this.tapWait)return clearTimeout(this.tapWait),this.tapWait=null,t();this.tapWait=setTimeout(()=>{this.tapWait=null,this.on.tap()},250)}key(t){let e={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[t.key];e&&this.on.canDrag()?(t.preventDefault(),this.on.step(t.key.startsWith("ArrowL")||t.key.startsWith("ArrowR")?e*(this.on.rtl()?-1:1):e)):(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),this.activate())}reset(){this.press&&clearTimeout(this.press.timer),this.press=null,clearTimeout(this.tapWait),this.tapWait=null}};var on={daily:1,hourly:2,twice_daily:4},Tt={hourly:36e5,twice_daily:12*36e5,daily:24*36e5},Ct=(i,t)=>!!(on[t]&&Number(i?.attributes.supported_features)&on[t]),oe=i=>["hourly","twice_daily","daily"].find(t=>Ct(i,t))||null,ln=new Set(["rainy","pouring","lightning","lightning-rainy","snowy","snowy-rainy","hail"]),hn=(i,t)=>ln.has(i.condition)||Number(i.precipitation)>=(t==="in"?.01:.2)||Number(i.precipitation_probability)>=60;function an(i,t,e){let n=String(i||"");return n.startsWith("lightning")?"thunder":n==="hail"?"hail":n.startsWith("snowy")||t!=null&&t!==""&&Number(t)<=e?"snow":"rain"}var rn={rain:"mdi:weather-rainy",snow:"mdi:weather-snowy",thunder:"mdi:weather-lightning",hail:"mdi:weather-hail",frost:"mdi:snowflake-thermometer"},to={rain:"rainy",snow:"snowy",thunder:"lightning",hail:"hail",frost:"snowy"},cn=i=>pt("weather",null,to[i],!0);function dn(i,t,e,n){let s=i.entity_id,o=i.attributes,a=n.t,r=o.temperature_unit==="\xB0F",c=e==="hourly"||e==="twice_daily"?t.filter(p=>Date.parse(p.datetime)+Tt[e]>n.now):[],l=n.openWindows(),h=[],d=(p,f,_,w,m)=>h.push({key:`wx:${s}:wet`,kind:"weather",entity:s,icon:rn[p],color:cn(p),sev:l?"warn":void 0,title:f,message:_,ts:w,past:m,once:!m,ack:p+(l?" open":"")});if(ln.has(i.state)){let p=an(i.state,o.temperature,r?34:1);l&&d(p,a[`wx_${p}_now`],n.alikeTitle("window",l),S(i.last_changed,n.now),!0)}else{let p=c.find(f=>Date.parse(f.datetime)<n.now+6*36e5&&hn(f,o.precipitation_unit));if(p){let f=Math.max(Date.parse(p.datetime),n.now),_=an(p.condition,p.temperature,r?34:1),w=p.precipitation_probability==null?NaN:Number(p.precipitation_probability),m=l?n.alikeTitle("window",l):Number.isFinite(w)?x(a.wx_chance,{p:n.clock.percent(w)}):"";d(_,x(a[`wx_${_}_from`],{t:n.clock.hour(f)}),m,f,!1)}}let u=r?32:0;if(c.length&&o.temperature!=null&&Number(o.temperature)>u){let p=c.filter(_=>Date.parse(_.datetime)<n.now+18*36e5&&_.temperature!=null&&Number.isFinite(Number(_.temperature))),f=p.find(_=>Number(_.temperature)<u);if(f){let _=Math.max(Date.parse(f.datetime),n.now),w=Math.min(...p.map(m=>Number(m.temperature)));h.push({key:`wx:${s}:frost`,kind:"weather",entity:s,icon:rn.frost,color:cn("frost"),title:x(a.wx_frost_from,{t:n.clock.hour(_)}),message:x(a.wx_low,{v:n.attr(i,"temperature",w)}),ts:_,once:!0,ack:"frost"})}}return c.length&&n.wake(Math.floor(n.now/36e5)*36e5+36e5),h}var eo=[[5,"morning"],[12,"afternoon"],[17,"evening"],[22,"night"]],io=["lightning-rainy","lightning","hail","snowy-rainy","snowy","pouring","rainy"];function no(i,t){let e=i.filter(s=>hn(s,t));if(e.length)return io.find(s=>e.some(o=>o.condition===s))||"rainy";let n=new Map;for(let s of i)s.condition&&n.set(s.condition,(n.get(s.condition)||0)+1);return[...n].sort((s,o)=>o[1]-s[1])[0]?.[0]}function un(i,t,e,n){let s=n.t,o=n.clock.zone,a=n.dayOf(n.now),r=(h,d)=>st(`${ot(h)} ${String(d).padStart(2,"0")}:00:00`,o),c=ut(n.now,o).hour>=17,l=[];if(e==="daily"){let h=c?a+1:a;l.push({label:n.clock.slotLabel(r(h,12),"daily",n.now),start:Math.max(r(h,0),n.now),end:r(h+1,0)})}else{let h=[a,a+1].flatMap(p=>eo.map(([f,_])=>({name:_,day:p,start:r(p,f)})));h.forEach((p,f)=>p.end=h[f+1]?.start??r(a+2,5));let d=h.find(p=>p.start>n.now),u={morning:d.day===a?s.wx_this_morning:s.wx_tomorrow_morning,afternoon:s.wx_this_afternoon,evening:s.wx_this_evening,night:s.wx_tonight};c&&d.day>a||l.push({label:u[d.name],start:d.start,end:d.end,night:d.name==="night"}),c&&l.push({label:n.clock.slotLabel(r(a+1,12),"daily",n.now),start:r(a+1,5),end:r(a+1,22)}),n.wake(d.start)}return n.wake(r(a,17)),n.wake(n.midnight),l.map(h=>{let d=t.filter(y=>{let A=Date.parse(y?.datetime);return A<h.end&&A+Tt[e]>h.start});if(!d.length)return null;let u=d.flatMap(y=>[y.temperature,y.templow]).filter(y=>y!=null&&y!==""&&Number.isFinite(Number(y))).map(y=>Math.round(Number(y))),[p,f]=[Math.min(...u),Math.max(...u)],_=u.length?p===f?n.clock.number(f)+"\xB0":x(s.wx_range,{lo:n.clock.number(p),hi:n.clock.number(f)}):"",w=no(d,i.attributes.precipitation_unit),m={...i,state:w||"unknown"};return{label:h.label,condition:w,night:h.night,text:[w?n.state(m):"",_].filter(Boolean).join(" \xB7 ")}}).filter(Boolean)}var pn=i=>Object.keys(i).filter(t=>{let e=i[t]?.attributes;return e?.device_class==="window"&&!Array.isArray(e.entity_id)&&/^(binary_sensor|cover)\./.test(t)}),mn=i=>i&&(i.entity_id.startsWith("binary_sensor.")?i.state==="on":!["closed","unavailable","unknown"].includes(i.state));var so={sunny:"mdi:weather-night",partlycloudy:"mdi:weather-night-partly-cloudy"},oo=(i,t)=>i.entity.startsWith("weather.")&&i.show_forecast!==!1&&Ct(t,i.forecast_type);function fn(i,t,e,n,s){if(i.hide_when_empty!==!1)return i.infos;let o=new Set(i.infos.map(c=>c.entity)),a=[],r=i.weather&&e.states[i.weather];if(r&&!o.has(i.weather)&&n(i.weather)){let c=oe(r);a.push({entity:i.weather,state_content:["state","temperature"],...c?{forecast_type:c,outlook:!0}:{}})}for(let c of t){let l=e.states[c.entity];!c.entity.startsWith("calendar.")||o.has(c.entity)||s.has(c.entity)||!n(c.entity)||l?.state==="off"&&!L(l.attributes.message)&&a.push({entity:c.entity,name:c.name,icon:c.icon,color:c.color})}return[...i.infos,...a]}function We(i,t,e,n){return[].concat(t??"state").map(o=>{if(o==="state")return n.state(i);if(o==="name")return e;if(/^last[_-](changed|updated)$/.test(o))return n.clock.relative(S(i[o.replace("-","_")],n.now),n.now);let a=i.attributes[o];if(a==null)return"";let r=I(a,n.clock.server);return Number.isFinite(r)?n.clock.relative(r,n.now):n.attr(i,o,a)}).filter(Boolean).join(" \xB7 ")||n.state(i)}function ao(i,t,e,n){let s=[i.temperature,i.templow].filter(a=>a!=null&&a!==""&&Number.isFinite(Number(a))).map(a=>n.clock.number(Number(a))+"\xB0").join(" / ");return[e==="twice_daily"?i.is_daytime===!1?n.t.wx_night:n.t.wx_day:"",s,i.condition?n.state(t):""].filter(Boolean).join(" \xB7 ")}function ro(i,t,e){if(!oo(i,t))return null;let n=i.forecast_type,s=e.forecast(i.entity,n);if(!s)return[];if(i.outlook)return un(t,s,n,e);let o=e.dayOf(e.now),a=s.filter(r=>Number.isFinite(Date.parse(r?.datetime))).filter(r=>n==="daily"?e.dayOf(Date.parse(r.datetime))>=o:Date.parse(r.datetime)+Tt[n]>e.now).slice(0,i.forecast_slots||1);return a.length?(e.wake(e.midnight),n!=="daily"&&e.wake(Date.parse(a[0].datetime)+Tt[n]),a.map(r=>({label:e.clock.slotLabel(Date.parse(r.datetime),n,e.now),condition:r.condition,night:r.is_daytime===!1,text:ao(r,{...t,state:r.condition||"unknown"},n,e)}))):null}function _n(i,t){let e=[],n=new Set;for(let s of i){t.watch(s.entity);let o=t.hass.states[s.entity];if(!o||o.state==="unavailable"||o.state==="unknown"||!t.conditionsMet(s.visibility,s.entity))continue;let a="info:"+s.entity;for(;n.has(a);)a+="+";n.add(a);let r=s.color&&s.color!=="state",c=y=>r?X(y)?Kt(s.color):"var(--state-inactive-color)":$t(y),l=t.name(o,s.name),h=s.show_battery?Yt(t.hass,o):void 0;h&&t.watch(h);let d=h&&t.hass.states[h],u={kind:"info",info:s,entity:s.entity,row:a,name:l,icon:s.icon,image:s.show_entity_picture?Xt(o.attributes):null,battery:d&&!["unavailable","unknown"].includes(d.state)?d:void 0},p=ro(s,o,t),f=k(s.entity),_=f==="calendar"&&!L(o.attributes.message),w=E(s.name)||!L(s.name)?l:"",m={...u,key:a,stateObj:o,title:l,color:c(_?{...o,state:"on"}:o)};_&&Object.assign(m,w?{content:s.state_content??["message","start_time"]}:{title:o.attributes.message,content:s.state_content??["start_time"]}),!w&&f==="weather"&&(m.title=t.clock.nowLabel()),(!p||s.show_current!==!1)&&e.push(m),(p||[]).forEach((y,A)=>{let ct={...o,state:y.condition||"unknown"};e.push({...u,key:`${a}#${A}`,stateObj:ct,title:w||y.label,text:[w?y.label:"",y.text].filter(Boolean).join(" \xB7 "),icon:s.icon||y.night&&so[y.condition]||void 0,color:c(ct)})})}return e}var co=new Set(["state","numeric_state","screen","user","location","time","view_columns"]),gn={and:i=>i.every(Boolean),or:i=>i.some(Boolean),not:i=>!i.every(Boolean)},lo=["sun","mon","tue","wed","thu","fri","sat"],qe=i=>i==null?[]:Array.isArray(i)?i:[i],yn=i=>!(E(i)&&i.enabled===!1),bn=i=>{let[t,e,n]=String(i).split(":").map(s=>parseInt(s,10));return t*3600+e*60+(n||0)},Fe=i=>String(i).padStart(2,"0"),ho=(i,t,e)=>t>=864e5/1e3?Y(i+1,e):st(`${ot(i)}T${Fe(Math.floor(t/3600))}:${Fe(Math.floor(t/60)%60)}:${Fe(t%60)}`,e);function uo(i,t){let e=ut(t.now,t.zone),n=C(t.now,t.zone),s=e.hour*3600+e.minute*60+e.second,o=i.after?bn(i.after):null,a=i.before?bn(i.before):null;for(let r of[o,a==null?null:a+1])r!=null&&[n,n+1].forEach(c=>t.wake(ho(c,r,t.zone)));return t.wake(Y(n+1,t.zone)),i.weekdays?.length&&!i.weekdays.includes(lo[new Date(n*864e5).getUTCDay()])?!1:o!=null&&a!=null?a<o?s>=o||s<=a:s>=o&&s<=a:o!=null?s>=o:a==null||s<=a}function wn(i,t,e){let{hass:n}=e,s=!1,o=l=>(e.watch(l),n.states[l]),a=l=>te(l)&&n.states[l]?o(l).state:void 0,r=l=>{if(!E(l)||"enabled"in l&&typeof l.enabled!="boolean")return!1;let h=l.condition??"state";if(gn[h])return l.conditions==null||gn[h](qe(l.conditions).filter(yn).map(r));if("entity_id"in l||!co.has(h)){let _=e.server(l);return s||=_.failed,_.result}if(h==="screen")return!!l.media_query&&e.media(l.media_query);if(h==="user")return!!(n.user?.id&&l.users?.includes(n.user.id));if(h==="view_columns")return!0;if(h==="time")return uo(l,e);if(h==="location"){let _=Object.values(n.states).find(w=>w.entity_id.startsWith("person.")&&w.attributes.user_id===n.user?.id);return _&&e.watch(_.entity_id),!!(_&&l.locations?.includes(_.state))}let d=o(l.entity||t),u=d&&l.attribute?d.attributes[l.attribute]:d?.state;if(h==="numeric_state"){let _=Number(u),w=m=>Number(typeof m=="string"?a(m)??m:m);return!Number.isNaN(_)&&(l.above==null||!(w(l.above)>=_))&&(l.below==null||!(w(l.below)<=_))}let p=l.state??l.state_not;return p===void 0?!1:qe(p).flatMap(_=>a(_)!==void 0?[_,a(_)]:[_]).includes(String(u??"unknown"))===(l.state!=null)};return qe(i).filter(yn).map(r).every(Boolean)&&!s}var Ve=i=>i.length>4?`${i.slice(0,4).join(", ")} +${i.length-4}`:i.join(", "),vn=i=>i.kind==="generic"&&i.deviceClass&&!i.image&&!i.tap&&!i.actions.length;function po(i,t){let e=i.entities?.[t],n=e?.device_id&&i.devices?.[e.device_id];return i.areas?.[e?.area_id||n?.area_id]?.name||""}function kn(i,t){let e=new Map;for(let s of i.filter(vn))e.has(s.deviceClass)||e.set(s.deviceClass,[]),e.get(s.deviceClass).push(s);let n=[];for(let s of i){let o=vn(s)?e.get(s.deviceClass):null;!o||o.length<2?n.push(s):o[0]===s&&n.push(mo(s.deviceClass,o,t))}return n}function mo(i,t,e){let n=[...t].sort((o,a)=>a.ts-o.ts),s=[...new Set(n.map(o=>po(e.hass,o.entity)||o.title))];return{key:"group:"+i,kind:"group",sev:n[0].sev,title:e.alikeTitle(i,t.length),message:Ve(s),ts:n[0].ts,past:!0,icon:n[0].icon,stateObj:n[0].stateObj,members:n,actions:[]}}var xn={en:{idle_title:"All quiet",idle_msg:"No notifications",clear:"Clear all",dismiss:"Dismiss",install:"Install",installing:"Installing",installing_pct:"Installing ({p}%)",just_now:"just now",soon:"in a moment",count_one:"1 notification",count_other:"{n} notifications",event:"Event",notification:"Notification",update:"Update",update_msg:"Update {v} available",update_msg_plain:"Update available",level:"Level {l}",breaks_in:"Stops working in {v}",day_at:"{d} at {t}",date_at:"on {d} at {t}",on_date:"on {d}",paused_left:"Paused, {t} left",ends_at:"Ends at {t}",act_pause:"Pause",act_resume:"Resume",act_cancel:"Cancel",act_lock:"Lock",act_close_cover:"Close",act_close_valve:"Close",act_dock_vacuum:"Dock",act_dock_mower:"Dock",act_off:"Turn off",act_done:"Done",next_alarm:"Alarm",wx_rain_from:"Rain from {t}",wx_snow_from:"Snow from {t}",wx_thunder_from:"Thunderstorms from {t}",wx_hail_from:"Hail from {t}",wx_rain_now:"It is raining",wx_snow_now:"It is snowing",wx_thunder_now:"Thunderstorm",wx_hail_now:"Hail",wx_chance:"{p} chance",wx_frost_from:"Frost from {t}",wx_low:"Low of {v}",wx_day:"Day",wx_night:"Night",wx_this_morning:"This morning",wx_tomorrow_morning:"Tomorrow morning",wx_this_afternoon:"This afternoon",wx_this_evening:"This evening",wx_tonight:"Tonight",wx_range:"{lo} to {hi}\xB0"},de:{idle_title:"Alles ruhig",just_now:"gerade eben",soon:"gleich",count_one:"1 Benachrichtigung",count_other:"{n} Benachrichtigungen",event:"Termin",notification:"Benachrichtigung",update_msg:"Update {v} verf\xFCgbar",update_msg_plain:"Update verf\xFCgbar",level:"Stufe {l}",breaks_in:"Funktioniert ab {v} nicht mehr",day_at:"{d} um {t}",date_at:"am {d} um {t}",on_date:"am {d}",paused_left:"Pausiert, noch {t}",ends_at:"Endet um {t}",act_done:"Erledigt",next_alarm:"Wecker",wx_rain_from:"Regen ab {t}",wx_snow_from:"Schnee ab {t}",wx_thunder_from:"Gewitter ab {t}",wx_hail_from:"Hagel ab {t}",wx_rain_now:"Es regnet",wx_snow_now:"Es schneit",wx_thunder_now:"Gewitter",wx_hail_now:"Hagel",wx_chance:"{p} Wahrscheinlichkeit",wx_frost_from:"Frost ab {t}",wx_low:"Tiefstwert {v}",wx_this_morning:"Heute Vormittag",wx_tomorrow_morning:"Morgen fr\xFCh",wx_this_afternoon:"Heute Nachmittag",wx_this_evening:"Heute Abend",wx_tonight:"Heute Nacht",wx_range:"{lo} bis {hi}\xB0"}},fo={just_now:null,soon:null,day_at:"{d}, {t}",date_at:"{d}, {t}",on_date:"{d}",paused_left:"{s}, {t}",ends_at:"{s}, {t}"},_o={idle_msg:["ui.notification_drawer.empty"],clear:["ui.notification_drawer.dismiss_all"],dismiss:["ui.card.persistent_notification.dismiss"],install:["ui.dialogs.more_info_control.update.install"],installing:["ui.card.update.installing"],installing_pct:["ui.card.update.installing_with_progress",{progress:"{p}"}],update:["ui.dialogs.more_info_control.update.update"],act_pause:["ui.card.timer.actions.pause"],act_resume:["ui.card.timer.actions.start"],act_cancel:["ui.card.timer.actions.cancel"],act_lock:["ui.card.lock.lock"],act_close_cover:["ui.card.cover.close_cover"],act_close_valve:["ui.card.valve.close_valve"],act_dock_vacuum:["ui.card.vacuum.actions.return_to_base"],act_dock_mower:["ui.card.lawn_mower.actions.dock"],act_off:["ui.card.common.turn_off"],wx_day:["ui.card.weather.day"],wx_night:["ui.card.weather.night"]},go={rain:"rainy",snow:"snowy",thunder:"lightning",hail:"hail"},Ke=i=>String(i).split("-")[0],ae=i=>i?.locale?.language||i?.language||"en";function En(i,t){let e=xn[Ke(i)],n={...xn.en,...e||fo},s=(o,a)=>typeof t=="function"&&t(o,a)||"";for(let[o,[a,r]]of Object.entries(_o))n[o]=s(a,r)||n[o];if(!e){let o=s("ui.notification_drawer.title");o&&(n.count_one=n.count_other=o+" ({n})");for(let[a,r]of Object.entries(go)){let c=s("component.weather.entity_component._.state."+r);c&&Object.assign(n,{[`wx_${a}_now`]:c,[`wx_${a}_from`]:c+", {t}"})}}return n}var yo={en:{window:{one:"1 window open",other:"{n} windows open"},door:{other:"{n} doors open"},garage_door:{other:"{n} garage doors open"},opening:{other:"{n} sensors open"},battery:{other:"{n} batteries low"},moisture:{other:"{n} water alarms"},smoke:{other:"{n} smoke alarms"},gas:{other:"{n} gas alarms"},carbon_monoxide:{other:"{n} CO alarms"},heat:{other:"{n} heat alarms"},problem:{other:"{n} problems"},tamper:{other:"{n} tamper alerts"},safety:{other:"{n} safety alerts"},sound:{other:"{n} sounds detected"}},de:{window:{one:"1 Fenster offen",other:"{n} Fenster offen"},door:{other:"{n} T\xFCren offen"},garage_door:{other:"{n} Garagentore offen"},opening:{other:"{n} Sensoren offen"},battery:{other:"{n} Batterien schwach"},moisture:{other:"{n} Wassermelder ausgel\xF6st"},smoke:{other:"{n} Rauchmelder ausgel\xF6st"},gas:{other:"{n} Gasmelder ausgel\xF6st"},carbon_monoxide:{other:"{n} CO-Melder ausgel\xF6st"},heat:{other:"{n} Hitzemelder ausgel\xF6st"},problem:{other:"{n} Probleme"},tamper:{other:"{n} Sabotagealarme"},safety:{other:"{n} Sicherheitswarnungen"},sound:{other:"{n} Ger\xE4usche erkannt"}}};function Tn(i,t,e,n){let s=yo[Ke(i)]?.[t];return s?x(e===1&&s.one?s.one:s.other,{n:e}):`${typeof n=="function"&&n(`component.binary_sensor.entity_component.${t}.name`)||Ge(t)} (${e})`}function Ge(i){let t=String(i).replace(/[_-]+/g," ").trim();return t.charAt(0).toUpperCase()+t.slice(1)}var $n={en:{label:"Include entities by label",weather:"Weather",updates:"Pending updates",repairs:"Repairs",hide_when_empty:"Hide when there is nothing to show",infos:"Infos",info_options:"Info options",rotate:"Seconds between turns",slide:"Turn",slide_up:"Upwards",slide_side:"Sideways",options:"Entity options",type:"Kind",image:"Picture",background:"Picture as card background",before:"Show ahead of time",audience:"Who sees what",styling:"Styling",css:"CSS",visible:"Visible to",people:"People",system:"System notifications",everyone:"Everyone",only:"Only these people",except:"Everyone except these people",nobody:"Nobody",only_x:"Only {x}",except_x:"Everyone except {x}",type_auto:"Detect automatically",type_calendar:"Calendar event",type_update:"Update",type_alarm:"Alarm panel",type_alert:"Alert",type_timer:"Timer",type_countdown:"Countdown",type_next_alarm:"Next alarm",type_waste:"Waste collection",type_event:"Event",type_todo:"To-do list",type_device:"Device",type_warning:"Warnings",type_attribute:"Details from an attribute",type_picture:"State as title",type_generic:"Plain entity",entities:"Entities",name:"Name",icon:"Icon",attribute:"Attribute",tap_action:"Tap behavior",hold_action:"Hold behavior",double_tap_action:"Double tap behavior",color:"Color",state_content:"State content",time_format:"Time format",show_entity_picture:"Show entity picture",show_battery:"Show battery",visibility:"Visibility",content_layout:"Content layout",horizontal:"Horizontal",vertical:"Vertical",forecast:"Weather to show",show_both:"Current weather and forecast",show_current:"Only the current weather",show_forecast:"Only the forecast",forecast_type:"Forecast",forecast_slots:"Forecasts to show",daily:"Daily",hourly:"Hourly",twice_daily:"Twice daily"},de:{label:"Entit\xE4ten mit diesem Label einbeziehen",weather:"Wetter",updates:"Ausstehende Updates",repairs:"Reparaturen",hide_when_empty:"Ausblenden, wenn nichts anliegt",infos:"Infos",info_options:"Optionen je Info",rotate:"Sekunden bis zum Wechsel",slide:"Wechsel",slide_up:"Nach oben",slide_side:"Seitlich",options:"Optionen je Entit\xE4t",type:"Art",image:"Bild",background:"Bild als Kartenhintergrund",before:"Im Voraus zeigen",audience:"Wer sieht was",styling:"Gestaltung",css:"CSS",visible:"Sichtbar f\xFCr",people:"Personen",system:"Systembenachrichtigungen",everyone:"Alle",only:"Nur diese Personen",except:"Alle au\xDFer diesen Personen",nobody:"Niemand",only_x:"Nur {x}",except_x:"Alle au\xDFer {x}",type_auto:"Automatisch erkennen",type_calendar:"Kalendertermin",type_update:"Update",type_alarm:"Alarmanlage",type_alert:"Alarm (alert)",type_timer:"Timer",type_countdown:"Countdown",type_next_alarm:"N\xE4chster Wecker",type_waste:"M\xFCllabfuhr",type_event:"Ereignis",type_todo:"To-do-Liste",type_device:"Ger\xE4t",type_warning:"Warnungen",type_attribute:"Details aus einem Attribut",type_picture:"Zustand als Titel",type_generic:"Einfache Entit\xE4t",show_battery:"Batterie zeigen"}},An={entities:"ui.panel.lovelace.editor.card.generic.entities",name:"ui.panel.lovelace.editor.card.generic.name",icon:"ui.panel.lovelace.editor.card.generic.icon",attribute:"ui.panel.lovelace.editor.card.generic.attribute",tap_action:"ui.panel.lovelace.editor.card.generic.tap_action",hold_action:"ui.panel.lovelace.editor.card.generic.hold_action",double_tap_action:"ui.panel.lovelace.editor.card.generic.double_tap_action",color:"ui.panel.lovelace.editor.card.tile.color",state_content:"ui.panel.lovelace.editor.card.tile.state_content",time_format:"ui.panel.lovelace.editor.card.generic.time_format",show_entity_picture:"ui.panel.lovelace.editor.card.tile.show_entity_picture",visibility:"ui.panel.lovelace.editor.card.heading.entity_config.visibility",visibility_intro:"ui.panel.lovelace.editor.card.heading.entity_config.visibility_explanation",content_layout:"ui.panel.lovelace.editor.card.tile.content_layout",horizontal:"ui.panel.lovelace.editor.card.tile.content_layout_options.horizontal",vertical:"ui.panel.lovelace.editor.card.tile.content_layout_options.vertical",forecast:"ui.panel.lovelace.editor.card.weather-forecast.weather_to_show",show_both:"ui.panel.lovelace.editor.card.weather-forecast.show_both",show_current:"ui.panel.lovelace.editor.card.weather-forecast.show_only_current",show_forecast:"ui.panel.lovelace.editor.card.weather-forecast.show_only_forecast",forecast_type:"ui.panel.lovelace.editor.card.weather-forecast.forecast_type",forecast_slots:"ui.panel.lovelace.editor.card.weather-forecast.forecast_slots",daily:"ui.panel.lovelace.editor.card.weather-forecast.daily",hourly:"ui.panel.lovelace.editor.card.weather-forecast.hourly",twice_daily:"ui.panel.lovelace.editor.card.weather-forecast.twice_daily"},Sn={en:{label:"Every entity with this label is added and detected automatically.",weather:"Shows rain, snow and frost ahead.",visible:"Applies outside edit mode, like Home Assistant's own card visibility.",people:"Matches the user account linked to each person in Settings \u2192 People.",attribute:"An attribute that holds an object with a name or title, or a plain value. If empty, the card looks for an object with a description or a picture.",attribute_picture:"An attribute that holds an object with a name or title. The object is shown instead of the state.",image:"An attribute, a path into one like book.cover, or a URL. If empty, the card uses the picture of the shown object or of the entity.",background:"Blurred behind the card while this entity is on top.",before:"How long before it starts or is due.",infos:"Shown in turn after what needs attention.",rotate:"At 0 the card holds still.",css:"Goes into the card after its own styles, so you can change any part of it.",visibility_intro:"It shows while all of these conditions hold.",row_tap_action:"What a tap on its row in the list does. A tap on the closed card opens the list, or does this when it is the only entry.",show_battery:"The battery of its device. A person shows the battery of the phone that tracks them."},de:{label:"Jede Entit\xE4t mit diesem Label kommt dazu und wird automatisch erkannt.",weather:"Zeigt Regen, Schnee und Frost im Voraus.",visible:"Gilt au\xDFerhalb des Bearbeitungsmodus, wie die Sichtbarkeit von Home Assistant selbst.",people:"Verglichen wird das Benutzerkonto, das unter Einstellungen \u2192 Personen verkn\xFCpft ist.",attribute:"Ein Attribut, das ein Objekt mit name oder title enth\xE4lt, oder ein einfacher Wert. Bleibt es leer, sucht die Karte ein Objekt mit description oder Bild.",attribute_picture:"Ein Attribut, das ein Objekt mit name oder title enth\xE4lt. Das Objekt erscheint statt des Zustands.",image:"Ein Attribut, ein Pfad darin wie book.cover, oder eine URL. Bleibt es leer, nimmt die Karte das Bild des gezeigten Objekts oder der Entit\xE4t.",background:"Unscharf hinter der Karte, solange diese Entit\xE4t oben steht.",before:"Wie lange vor dem Beginn oder der F\xE4lligkeit.",infos:"Erscheinen im Wechsel nach dem, was anliegt.",rotate:"Bei 0 bleibt die Karte stehen.",css:"Kommt nach den Styles der Karte, so l\xE4sst sich jeder Teil \xE4ndern.",visibility_intro:"Es erscheint, solange alle diese Bedingungen erf\xFCllt sind.",row_tap_action:"Was ein Tippen auf seine Zeile in der Liste tut. Ein Tippen auf die geschlossene Karte \xF6ffnet die Liste, oder tut dies, wenn es der einzige Eintrag ist.",show_battery:"Die Batterie ihres Ger\xE4ts. Eine Person zeigt die Batterie des Handys, das sie ortet."}};function Cn(i,t){let e=Ke(i),n=s=>s&&typeof t=="function"&&t(s)||"";return{label:s=>n(An[s])||$n[e]?.[s]||$n.en[s]||s,helper:s=>s==="visibility_intro"&&n(An[s])||Sn[e]?.[s]||Sn.en[s]}}function Mn(i,t){return[...i.values()].map(e=>{let n=Ii(e.message);return{key:"s:"+e.notification_id,kind:"system",title:mt(e.title)||t.t.notification,message:mt(e.message),image:Pi(e.message),ts:S(e.created_at,t.now),past:!0,seq:e.seq,tap:n?At(n):void 0,dismiss:{service:["persistent_notification","dismiss",{notification_id:e.notification_id}]}}})}var bo={critical:"crit",error:"crit",warning:"warn"};function On(i,t){let e=(n,s)=>t.hass.localize?.(n,s)||"";return i.map(n=>{let s=n.translation_key||n.issue_id;return{key:`i:${n.domain}/${n.issue_id}`,kind:"repair",sev:bo[n.severity]||"warn",title:e(`component.${n.domain}.issues.${s}.title`,n.translation_placeholders||{})||Ge(s),message:n.breaks_in_ha_version?x(t.t.breaks_in,{v:n.breaks_in_ha_version}):e(`component.${n.issue_domain||n.domain}.title`),ts:S(n.created,t.now),past:!0,tap:At("/config/repairs"),dismiss:{ws:{type:"repairs/ignore_issue",domain:n.domain,issue_id:n.issue_id,ignore:!0}}}})}var wo=(i,t)=>!i||(i.only?i.only.includes(t):!i.except.includes(t)),Ye=(i,t)=>!i.past&&i.ts>t,Xe=i=>(t,e)=>typeof e=="string"&&e||i.formatEntityName?.(t,e||void 0)||t.attributes.friendly_name||t.entity_id,Mt=i=>({state:t=>i.formatEntityState?i.formatEntityState(t):String(t.state),attr:(t,e,n)=>!e.includes(".")&&i.formatEntityAttributeValue?.(t,e,n)||String(n)}),vo=i=>Array.isArray(i.attributes.entity_id)&&!i.entity_id.startsWith("sensor.")?i.attributes.entity_id.filter(t=>typeof t=="string"):[];function Dn(i){let{hass:t,config:e,now:n,data:s}=i,o=new Set,a=[],r=new Set,c=new Set,l=m=>i.preview||wo(e.audience[m],i.viewer),h={...i,t:i.texts,watch:m=>o.add(m),wake:m=>Number.isFinite(m)&&m>n&&a.push(m),midnight:Y(C(n,i.clock.zone)+1,i.clock.zone),dayOf:(m,y=i.clock.zone)=>C(m,y),name:Xe(t),...Mt(t),alikeTitle:(m,y)=>Tn(i.clock.lang,m,y,t.localize),members:m=>{let y=vo(m);return y.forEach(A=>o.add(A)),Ve(y.map(A=>t.states[A]).filter(A=>A&&X(A)).map(A=>h.name(A)))},conditionsMet:(m,y)=>wn(m,y,{hass:t,now:n,zone:i.clock.zone,watch:h.watch,wake:h.wake,media:i.media,server:i.serverCondition})},d=[];l("system")&&d.push(...Mn(s.notifications,h)),e.repairs&&i.admin&&l("repairs")&&d.push(...On(s.repairs,h));let u=[...i.sources];for(let m of i.updates)u.some(y=>y.entity===m)||u.push({entity:m});for(let m of u){let y=m.entity;if(o.add(y),!l(y)||y.startsWith("update.")&&!l("updates"))continue;let A=t.states[y];(!m.visibility||h.conditionsMet(m.visibility,y))&&d.push(...Xi(m,A,h)),A&&A.state!=="unavailable"&&A.state!=="unknown"&&c.add(y)}let p=e.weather&&t.states[e.weather];if(p&&l(e.weather)){o.add(e.weather);let m=oe(p),y=m&&s.forecast(e.weather,m);if(y){let A=()=>(i.windows.forEach(ct=>o.add(ct)),i.windows.filter(ct=>mn(t.states[ct])).length);d.push(...dn(p,y,m,{...h,openWindows:A})),r.add(`wx:${e.weather}:wet`).add(`wx:${e.weather}:frost`)}}let f=d.filter(m=>m.expires<=n?!1:(h.wake(m.expires),m.live&&h.wake(m.ts),!0));f.some(m=>m.day||m.kind==="calendar")&&h.wake(h.midnight);let _=new Set(f.map(m=>m.entity)),w=_n(fn(e,i.sources,t,l,_),{...h,forecast:s.forecast});return{entries:f,slides:w,watched:o,wakes:a,known:r,available:c,ctx:h}}var Nn=(i,t)=>Number.isFinite(i.ts)?i.past?t-i.ts:Math.abs(i.ts-t):1/0;function ko(i,t){return i.sort((e,n)=>(n.sev==="crit")-(e.sev==="crit")||Nn(e,t)-Nn(n,t)||(n.seq||0)-(e.seq||0)||(e.key<n.key?-1:e.key>n.key?1:0))}function xo(i,t){let e=1/0;for(let n=1;n<i.length;n++){let[s,o]=[i[n-1],i[n]];s.sev==="crit"!=(o.sev==="crit")||!Ye(o,t)||!(o.ts>s.ts)||(e=Math.min(e,Math.max((s.ts+o.ts)/2,t+1)))}return e}function Rn(i,t){let e=ko(kn(i,t),t.now);return t.wake(xo(e,t.now)),e}var In=(i,t)=>i.length?Math.min(Math.max(Math.min(...i)-t,0),864e5)+50:null;var $o={fast:150,normal:250,slow:350};function B(i,t){let e=getComputedStyle(i).getPropertyValue(`--ha-animation-duration-${t}`).trim(),n=parseFloat(e);return Number.isFinite(n)?e.endsWith("ms")?n:n*1e3:$o[t]}var Ao=i=>1-Math.exp(-8*i)*(Math.cos(6*i)+8/6*Math.sin(6*i)),Pn=`linear(${Array.from({length:33},(i,t)=>t===32?1:+Ao(t/32).toFixed(3)).join(", ")})`,M={standard:"cubic-bezier(0.4, 0, 0.2, 1)",out:"cubic-bezier(0.4, 0, 1, 1)",in:"cubic-bezier(0, 0, 0.2, 1)"},ft=class{constructor(t){this.onGone=t,this.rendered=[],this.ghosts=new Map,this.before=new Map}withLeaving(t,e){e||this.ghosts.clear();let n=new Set(t.map(o=>o.key));for(let o of this.ghosts.keys())n.has(o)&&this.ghosts.delete(o);let s=[...t];return this.rendered.forEach((o,a)=>{if(n.has(o.key))return;e&&!o.leaving&&!this.ghosts.has(o.key)&&this.ghosts.set(o.key,{...o,leaving:!0});let r=this.ghosts.get(o.key);if(!r)return;let c=s.findIndex(l=>l.key===this.rendered[a-1]?.key);s.splice(c<0?Math.min(a,s.length):c+1,0,r)}),this.rendered=s,s}measure(t){this.before=new Map([...t?.children||[]].map(e=>[e.dataset.key,{top:e.offsetTop,height:e.querySelector(".row")?.offsetHeight}]))}play(t,e){if(!t||!e)return;let n=B(t,"fast"),s=B(t,"normal"),o=getComputedStyle(t),a=o.direction==="rtl"?"-16px":"16px",r=`${-(parseFloat(o.rowGap)||0)}px`;for(let c of t.children){let l=c.dataset.key;if(c.dataset.leaving&&!this.ghosts.has(l)&&(c.getAnimations().forEach(h=>h.cancel()),delete c.dataset.leaving),this.ghosts.has(l)){if(c.dataset.leaving)continue;c.dataset.leaving="1",this.run(c,[{opacity:1,gridTemplateRows:"1fr",marginTop:"0px",transform:"none",easing:M.out},{opacity:0,gridTemplateRows:"1fr",marginTop:"0px",transform:`translateX(${a})`,offset:n/(n+s),easing:M.standard},{opacity:0,gridTemplateRows:"0fr",marginTop:r,transform:`translateX(${a})`}],n+s,()=>{this.ghosts.delete(l),this.onGone()})}else if(!this.before.has(l))this.run(c,[{opacity:0,gridTemplateRows:"0fr",marginTop:r,easing:M.standard},{opacity:0,gridTemplateRows:"1fr",marginTop:"0px",offset:s/(n+s),easing:M.in},{opacity:1,gridTemplateRows:"1fr",marginTop:"0px"}],n+s);else{let h=this.before.get(l),d=c.querySelector(".row");d.getAnimations().forEach(f=>f.cancel());let u=d.offsetHeight;Math.abs(h.height-u)>1&&this.run(c,[{height:`${h.height}px`,easing:M.standard},{height:`${u}px`}],s,null,d);let p=h.top-c.offsetTop;Math.abs(p)>1&&c.animate([{transform:`translateY(${p}px)`},{transform:"none"}],{duration:s,easing:M.standard})}}}run(t,e,n,s,o=t){t.classList.add("moving"),o.animate(e,{duration:n,fill:s?"forwards":"none"}).finished.then(()=>{t.classList.remove("moving"),s?.()},()=>o.getAnimations().length||t.classList.remove("moving"))}};var Ln=(i,t,e)=>{let n=new Map;for(let s=t;s<=e;s++)n.set(i[s],s);return n},Un=ht(class extends F{constructor(i){if(super(i),i.type!==Wt.CHILD)throw Error("repeat() can only be used in text expressions")}dt(i,t,e){let n;e===void 0?e=t:t!==void 0&&(n=t);let s=[],o=[],a=0;for(let r of i)s[a]=n?n(r,a):a,o[a]=e(r,a),a++;return{values:o,keys:s}}render(i,t,e){return this.dt(i,t,e).values}update(i,[t,e,n]){let s=$i(i),{values:o,keys:a}=this.dt(t,e,n);if(!Array.isArray(s))return this.ut=a,o;let r=this.ut??=[],c=[],l,h,d=0,u=s.length-1,p=0,f=o.length-1;for(;d<=u&&p<=f;)if(s[d]===null)d++;else if(s[u]===null)u--;else if(r[d]===a[p])c[p]=K(s[d],o[p]),d++,p++;else if(r[u]===a[f])c[f]=K(s[u],o[f]),u--,f--;else if(r[d]===a[f])c[f]=K(s[d],o[f]),dt(i,c[f+1],s[d]),d++,f--;else if(r[u]===a[p])c[p]=K(s[u],o[p]),dt(i,s[d],s[u]),u--,p++;else if(l===void 0&&(l=Ln(a,p,f),h=Ln(r,d,u)),l.has(r[d]))if(l.has(r[u])){let _=h.get(a[p]),w=_!==void 0?s[_]:null;if(w===null){let m=dt(i,s[d]);K(m,o[p]),c[p]=m}else c[p]=K(w,o[p]),dt(i,s[d],w),s[_]=null;p++}else Ft(s[u]),u--;else Ft(s[d]),d++;for(;p<=f;){let _=dt(i,c[f+1]);K(_,o[p]),c[p++]=_}for(;d<=u;){let _=s[d++];_!==null&&Ft(_)}return this.ut=a,qt(i,c),R}});var So={system:"var(--info-color)",repair:"var(--warning-color)"};function re(i){return i.sev==="crit"?"var(--error-color)":i.sev==="warn"?"var(--warning-color)":i.color||(i.stateObj?$t(i.stateObj):So[i.kind]||"var(--state-icon-color)")}function ce(i){return i.inert?null:i.tap||(i.entity?{entity:i.entity,tap_action:{action:"more-info"}}:null)}function Je(i,t){if(!t)return null;try{return i.hassUrl(t)}catch{return null}}var Eo=(i,t)=>i.icon||t.entities?.[i.stateObj?.entity_id]?.icon||i.stateObj?.attributes.icon||D[i.kind]||D.generic;function To(i,t){let e=Di(i,t.states);if(!e)return g;let n=e.attribute&&customElements.get("ha-attribute-icon")?b`<ha-attribute-icon .stateObj=${i} .attribute=${e.attribute}></ha-attribute-icon>`:b`<ha-icon .icon=${e.icon}></ha-icon>`;return b`<span class="tile-badge" style="--badge-color: ${e.color}" aria-hidden="true">${n}</span>`}function le(i,t){let e=Je(t,i.image);return b`${e?b`<img
        src=${e}
        alt=""
        decoding="async"
        draggable="false"
        referrerpolicy="no-referrer"
        @load=${n=>n.target.classList.add("ready")}
        @error=${n=>n.target.classList.remove("ready")}
      />`:g}${i.stateObj&&customElements.get("ha-state-icon")?b`<ha-state-icon .hass=${t} .stateObj=${i.stateObj} .icon=${i.icon}></ha-state-icon>`:b`<ha-icon .icon=${Eo(i,t)}></ha-icon>`}${i.stateObj?To(i.stateObj,t):g}`}function Hn(i,t){return b`<span class="battery" style="--battery-color: ${$t(i)}"
    >${customElements.get("ha-state-icon")?b`<ha-state-icon .hass=${t} .stateObj=${i}></ha-state-icon>`:g}${Mt(t).state(i)}</span
  >`}function zn(i,t){if(!Number.isFinite(i.ts))return b`<time class="time"></time>`;let e=t.clock.server,n=i.day?ot(C(i.ts,e)):new Date(i.ts).toISOString(),s=i.day?t.clock.absoluteDate(i.ts,e):t.clock.absolute(i.ts);return b`<time class="time" datetime=${n} title=${s}>${t.clock.entryTime(i,t.now)}</time>`}var jn=i=>i.scrollHeight>i.clientHeight+1||i.scrollWidth>i.clientWidth+1,Bn=(i,t)=>jn(i.querySelector(".message"))||!t&&jn(i.querySelector(".title")),Co=i=>{let t=i.getSelection?.()||document.getSelection();return!!(t&&!t.isCollapsed&&String(t).trim())},Mo=i=>t=>{t.key!=="Enter"&&t.key!==" "||(t.preventDefault(),t.stopPropagation(),i())};function Oo(i,t){let e=ce(i),n=()=>e&&t.run(e),s=a=>{let r=a.currentTarget;Co(r.getRootNode())||(r.classList.contains("open")||Bn(r,e)?t.toggle(i.key):n())},o=!!i.message||!Number.isFinite(i.ts);return b`<div class=${V({item:!0,leaving:!!i.leaving})} role="listitem" data-key=${i.key}><div class="clip">
    <div
      class="row ${V({warn:i.sev==="warn",crit:i.sev==="crit",link:!!e,open:t.opened.has(i.key)})}"
      data-kind=${i.kind}
      style="--tile-color: ${re(i)}"
      @click=${s}
      @pointerenter=${a=>a.currentTarget.classList.toggle("expandable",Bn(a.currentTarget,e))}
    >
      <div
        class="icon"
        role=${e?"button":g}
        tabindex=${e?"0":g}
        aria-label=${e?i.title:g}
        @click=${a=>e&&(a.stopPropagation(),n())}
        @keydown=${e?Mo(n):g}
      >
        ${le(i,t.hass)}
      </div>
      <div class="title">${i.title}</div>
      <div class="meta">
        ${o?zn(i,t):g}
        ${ne(i)?b`<button class="dismiss" type="button" aria-label=${t.texts.dismiss} title=${t.texts.dismiss} @click=${a=>(a.stopPropagation(),t.dismiss(i,a.detail===0))}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>`:g}
      </div>
      <div class="message">${i.message||(o?"":zn(i,t))}</div>
      ${i.actions?.length?b`<div class="actions">
            ${i.actions.map(a=>b`<button class="action" type="button" ?disabled=${a.disabled} @click=${r=>(r.stopPropagation(),t.run(a.action))}>${a.label}</button>`)}
          </div>`:g}
    </div>
  </div></div>`}function he(i,t,e){let n=[...i.querySelectorAll(".item:not(.leaving)")];(n[Math.min(t,n.length-1)]?.querySelector(".dismiss, .icon[role=button]")||e)?.focus({preventScroll:!0})}var de=(i,t)=>Un(i,e=>e.key,e=>Oo(e,t));var ue=(i,t)=>It(i.renderRoot,[...i.constructor.elementStyles,Rt(t)]),pe=P`
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
`,me=P`
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
`,fe=P`
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
`,Wn=P`
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
`;var No=i=>i.unsub.then(t=>t()).catch(()=>{}),_e=class{constructor(){this.subs=new Map}sync(t){for(let[e,n]of this.subs){let s=t.get(e);s&&!(n.failed&&n.retryOn!==s.retryOn)||(this.subs.delete(e),No(n))}for(let[e,{start:n,retryOn:s}]of t){if(this.subs.has(e))continue;let o={retryOn:s,failed:!1};o.unsub=Promise.resolve().then(n),o.unsub.catch(()=>o.failed=!0),this.subs.set(e,o)}}clear(){this.sync(new Map)}};var Qe=q+"-dialog",Do=300,Ro=2*6e4,Ot=1500,Io=2e3,qn=30,Po=1e4,Fn=16,Lo=["connection","user","locale","config","localize","entities","devices","areas","services","themes","formatEntityState","formatEntityName","formatEntityAttributeValue"],_t=(i,t,e)=>i.dispatchEvent(new CustomEvent(t,{bubbles:!0,composed:!0,detail:e})),Ze=new Set;for(let i of["ha-state-icon","state-display","ha-ripple","ha-attribute-icon"])customElements.get(i)||customElements.whenDefined(i).then(()=>Ze.forEach(t=>t.requestUpdate()));var ge=class extends O{static styles=[fe,me,pe,Wn];static properties={preview:{type:Boolean,reflect:!0}};constructor(){super(),this.connectedWhileHidden=!0,this.preview=!1,this._data={notifications:new Map,repairs:[],todos:new Map,forecasts:new Map,conditions:new Map},this._seq=0,this._subs=new _e,this._dismissals=new ie(()=>this._refresh()),this._onDetails=()=>this._refresh(),this._motion=new ft(()=>this.requestUpdate()),this._entries=[],this._slides=[],this._turnable=[],this._watched=[],this._wakes=[],this._opened=new Set,this._things=new Map,this._media=new Map,this._backdrops=[{},{}],this._open=!1,this._visible=!0,this._cycleKey=0,this._now=Date.now()}static getConfigElement(){return document.createElement(q+"-editor")}static getStubConfig(){return{}}setConfig(t){this._config=ee(t),this.classList.toggle("vertical",this._config.vertical),this.classList.toggle("bounded",typeof t.grid_options?.rows=="number"),this._derived=null,this._refresh(),this._cycle()}set hass(t){let e=this._hass;this._hass=t,(!e||Lo.some(n=>e[n]!==t[n])||this._watched.some(n=>e.states[n]!==t.states[n]))&&this._refresh()}get hass(){return this._hass}getCardSize(){return this._open?1+this.listed().length:this._config?.vertical?2:1}getGridOptions(){return{columns:12,rows:"auto",min_columns:this._config?.vertical?3:6}}connectedCallback(){super.connectedCallback(),Ze.add(this),clearTimeout(this._collapseTimer);let t=this.getRootNode().host?.localName;this.classList.toggle("docked",t==="hui-view-footer"),this._inPicker=t==="hui-card-picker",this._dismissals.connect(),this._onVisibility||=()=>{document.hidden||this._cycle(),this._onView(this._visible)},document.addEventListener("visibilitychange",this._onVisibility),this._resize||=new ResizeObserver(([n])=>this._onResize(n.contentRect.width)),this._view||=window.IntersectionObserver&&new IntersectionObserver(n=>this._onView(n.at(-1).isIntersecting),{threshold:.01}),this._view?.observe(this);let e=this.renderRoot?.querySelector("ha-card");e&&this._resize.observe(e),this._painted=!1,this._intro=!0,this._refresh(),this._cycle()}disconnectedCallback(){super.disconnectedCallback(),Ze.delete(this),this._subs.clear(),this._dismissals.disconnect(),this._gestures?.reset();for(let t of this._media.values())t.onchange=null;this._media.clear(),document.removeEventListener("visibilitychange",this._onVisibility),this._resize?.disconnect(),this._view?.disconnect(),[this._wakeTimer,this._clock,this._turnTimer,this._repairsTimer,this._holdTimer,this._showTimer].forEach(clearTimeout),cancelAnimationFrame(this._frameId),this._sizes?.disconnect(),this._collapseTimer=setTimeout(()=>this._setOpen(!1),150)}_derive(){let t=this._hass,e=this._config,n=[e,t.entities,t.devices,t.locale,t.localize,t.config,t.user];if(this._derived?.key.every((d,u)=>d===n[u]))return this._derived;let s=ae(t),o=En(s,t.localize),a=t.entities||{},r=new Set(e.entities.map(d=>d.entity)),c=e.label?Object.keys(a).filter(d=>!r.has(d)&&a[d]?.labels?.includes(e.label)):[],l=[...new Set(Object.values(e.audience).flatMap(d=>d.only||d.except))],h=new Map;for(let[d,u]of Object.entries(a))u?.device_id&&/^(image|camera)\./.test(d)&&h.set(u.device_id,[...h.get(u.device_id)||[],d].sort().reverse());return this._derived={key:n,lang:s,texts:o,clock:new Vt(t,s,o),sources:[...e.entities,...c.map(d=>({entity:d}))],people:l,viewer:l.find(d=>t.states[d]?.attributes.user_id===t.user?.id)||"",updates:e.updates?[...new Set([...Object.keys(t.states),...Object.keys(a)])].filter(d=>d.startsWith("update.")):[],windows:e.weather?pn(t.states):[],pictures:d=>h.get(a[d]?.device_id)||[]},this._derived}_refresh(){let t=this._hass;if(!t||!this._config)return;let e=this._derive(),n=this._data,s=Date.now(),o={todos:new Set,forecasts:new Map,conditions:new Map},a=Dn({hass:t,config:this._config,now:s,texts:e.texts,clock:e.clock,admin:!!t.user?.is_admin,viewer:e.viewer,preview:this.preview,sources:e.sources,updates:e.updates,windows:e.windows,devicePictures:e.pictures,details:u=>tn(t,u,this._onDetails),todos:u=>(o.todos.add(u),n.todos.get(u)),media:u=>this._matches(u),serverCondition:u=>{let p=JSON.stringify(u);return o.conditions.set(p,u),n.conditions.get(p)||{result:!1,failed:!1}},data:{notifications:n.notifications,repairs:n.repairs,forecast:(u,p)=>(o.forecasts.set(`${u}|${p}`,[u,p]),n.forecasts.get(`${u}|${p}`))}});this._sync(o);for(let u of a.entries)(u.kind==="attribute"||u.kind==="picture")&&this._things.set(u.key,u.entity);let r=new Set([...a.known,...[...this._things].filter(([,u])=>a.available.has(u)).map(([u])=>u)]),c=Rn(this._dismissals.apply(a.entries,r,s,a.ctx.wake),a.ctx),l=this._seen&&c.find(u=>!this._seen.has(u.key)&&Math.abs(s-u.ts)<Ro);l&&(this._say=[l.title,l.message].filter(Boolean).join(". ")),this._seen=new Set(c.map(u=>u.key)),this._entries=c,this._slides=a.slides;let h=new Set([...c.map(u=>u.key),...a.slides.map(u=>u.row)]);for(let u of this._opened)h.has(u)||this._opened.delete(u);this._watched=[...a.watched,...e.people],this._wakes=a.wakes,this._now=s,this._pick(l),clearTimeout(this._wakeTimer);let d=this.isConnected?In(this._wakes,s):null;d!==null&&(this._wakeTimer=setTimeout(()=>this._refresh(),d)),this._tick(),this.requestUpdate(),this._dialog?.requestUpdate()}_sync(t){let e=this._hass,n=e.connection,s=new Map,o=(a,r,c,l)=>s.set(a,{retryOn:l,start:()=>n.subscribeMessage(c,r)});if(n&&this.isConnected){o("notifications",{type:"persistent_notification/subscribe"},a=>this._onNotifications(a)),this._config.repairs&&e.user?.is_admin&&s.set("repairs",{start:()=>(this._fetchRepairs(),n.subscribeEvents(()=>{clearTimeout(this._repairsTimer),this._repairsTimer=setTimeout(()=>this._fetchRepairs(),500)},"repairs_issue_registry_updated"))});for(let a of t.todos)o("todo|"+a,{type:"todo/item/subscribe",entity_id:a},r=>this._store("todos",a,r.items||[]),e.states[a]);for(let[a,[r,c]]of t.forecasts)o("forecast|"+a,{type:"weather/subscribe_forecast",entity_id:r,forecast_type:c},l=>this._store("forecasts",a,l.forecast||[]),e.states[r]);for(let[a,r]of t.conditions)o("condition|"+a,{type:"subscribe_condition",condition:r},c=>this._store("conditions",a,{result:c.result===!0,failed:!!c.error}))}this._subs.sync(s);for(let a of["todos","forecasts","conditions"])for(let r of this._data[a].keys())t[a].has(r)||this._data[a].delete(r)}_store(t,e,n){this._data[t].set(e,n),this._refresh()}_onNotifications({type:t,notifications:e={}}){t==="current"&&(this._data.notifications=new Map);for(let[n,s]of Object.entries(e))t==="removed"?this._data.notifications.delete(n):this._data.notifications.set(n,{...s,seq:++this._seq});this._refresh()}async _fetchRepairs(){let t=this._hass;try{let{issues:e=[]}=await t.callWS({type:"repairs/list_issues"});if(this._data.repairs=e.filter(n=>!n.ignored),this._refresh(),!this._data.repairs.length)return;await t.loadBackendTranslation?.("issues",[...new Set(this._data.repairs.map(n=>n.domain))]),await t.loadBackendTranslation?.("title",[...new Set(this._data.repairs.map(n=>n.issue_domain||n.domain))])}catch{}}_matches(t){if(!this.isConnected)return window.matchMedia(t).matches;if(!this._media.has(t)){let e=window.matchMedia(t);e.onchange=()=>this._refresh(),this._media.set(t,e)}return this._media.get(t).matches}listed(){let t=new Map;for(let e of this._slides)t.has(e.row)||t.set(e.row,e);return[...this._entries,...[...t.values()].map(e=>this._infoRow(e))]}_formatters(){return{...Mt(this._hass),clock:this._derive().clock,now:this._now}}_withBattery(t,e){return e.battery?b`${t} · ${Hn(e.battery,this._hass)}`:t}_infoRow(t){let e=this._hass.states[t.entity],n=this._infoAction(t,"tap");return{key:t.row,kind:"info",title:t.title,message:this._withBattery(t.text??We(e,t.content??t.info.state_content,t.name,this._formatters()),t),icon:t.icon,image:t.image,stateObj:e,color:t.color,ts:NaN,tap:n,inert:!n,actions:[]}}_infoAction(t,e){let n=t.info,s={entity:t.entity,tap_action:n.tap_action||{action:"more-info"},hold_action:n.hold_action,double_tap_action:n.double_tap_action},o=s[e+"_action"];return o&&o.action!=="none"?{...s,gesture:e}:null}_run({gesture:t="tap",...e}){_t(this,"hass-action",{config:e,action:t})}dismiss(t){let e=this._hass;this._dismissals.dismiss(t,n=>n.service?e.callService(...n.service):e.callWS(n.ws))}_pick(t){let e=this._entries.filter(c=>c.sev==="crit"),n=e.length?e:[...this._entries,...this._slides],s=n[0]||null,o=!!(s&&s.kind!=="info"&&s.key!==this._topKey);this._topKey=s?.key,this._turnable=n;let a=n.find(c=>c.key===this._target?.key),r=t&&this._config.rotate?n.find(c=>c.key===t.key):null;r?(a=r,this._byHand=!1):(!a||o||!this._turned||!(this._config.rotate||this._byHand))&&(a=s),this._show(a,1,this._config.slide==="side")}_show(t,e,n,s=!1){if(this._target=t,clearTimeout(this._showTimer),t?.key===this._shown?.key){this._shown=t;return}let o=this._shownAt+Io-Date.now();if(this._turnable.some(l=>l.key===this._shown?.key)&&!s&&o>0){this._showTimer=setTimeout(()=>this._show(this._target,e,n,!0),o);return}let r=this._shown;this._shown=t,this._shownAt=Date.now(),this._cycle();let c=this.renderRoot?.querySelector(".slide:not(.leaving)");r&&c&&this._animate()&&!this._open?this._turn(r,c,e,n):c&&(c.style.transform=c.style.opacity="")}async _turn(t,e,n,s){let o=getComputedStyle(e),a={transform:o.transform,opacity:o.opacity,filter:o.filter},r=[...e.querySelectorAll(":scope > div")].map(p=>[p.hasAttribute("data-long"),p.getAttribute("style"),p.firstElementChild.getAttribute("style")]);e.style.transform=e.style.opacity="",this._turnAnims?.forEach(p=>p.cancel());let c=n*(s&&this._rtl()?-1:1),l=this._leaving={entry:t,side:s};await this.updateComplete,this.renderRoot.querySelectorAll(".slide.leaving > div").forEach((p,f)=>{let[_,w,m]=r[f]||[];p.toggleAttribute("data-long",!!_),p.setAttribute("style",w||""),p.firstElementChild.setAttribute("style",m||"")});let h={duration:B(this,"slow")*.8,easing:M.out,fill:"forwards"},[d,u]=s?["X",24]:["Y",12];this._turnAnims=[this.renderRoot.querySelector(".slide.leaving").animate([a,{transform:`translate${d}(${-c*u}px)`,opacity:0,filter:"blur(4px)"}],h),this.renderRoot.querySelector(".head .glyph.leaving").animate([{opacity:1},{opacity:0,transform:"scale(0.8)",filter:"blur(2px)"}],h),...this._enter(c,s,B(this,"slow")*.35)],await Promise.all(this._turnAnims.map(p=>p.finished)).catch(()=>{}),this._leaving===l&&(this._leaving=null,this.requestUpdate())}_enter(t,e,n=0){let[s,o]=e?["X",24]:["Y",12],a={duration:B(this,"slow")*2,delay:n,easing:Pn,fill:"backwards"};return[this.renderRoot.querySelector(".slide:not(.leaving)").animate([{transform:`translate${s}(${t*o}px)`,opacity:0,filter:"blur(4px)"},{transform:"none",opacity:1,filter:"none"}],a),this.renderRoot.querySelector(".head .glyph:not(.leaving)").animate([{opacity:0,transform:"scale(0.8)",filter:"blur(2px)"},{opacity:1,transform:"none",filter:"none"}],a)]}_step(t,e){let n=this._turnable;if(n.length<2)return;this._turned=!0,e!=="auto"&&(this._byHand=!0);let s=Math.max(0,n.findIndex(o=>o.key===this._shown?.key));this._show(n[(s+t+n.length)%n.length],t,e==="swipe"||this._config.slide==="side",!0),this._tick()}_cycle(){this._cycleKey++,this._cycleAt=Date.now(),this._turnAfter(this._config?.rotate*1e3),this.requestUpdate()}_turnAfter(t){clearTimeout(this._turnTimer),t>0&&this.isConnected&&(this._turnTimer=setTimeout(()=>this._autoTurn(),t-(Date.now()-this._cycleAt)))}_autoTurn(){let t=this._shown,e=this._visible&&!document.hidden;this._config.rotate>0&&e&&!this._open&&!this._dialog&&!this._gestures?.press&&this._step(1,"auto"),this._shown===t&&e&&this._cycle()}_scroll(){this._scrolled=this._cycleKey;let t=this._shown?.key,e=this._marquee,n=!!(e&&e.key===t&&!e.back&&e.end&&performance.now()>=e.end);this._sizes||=new ResizeObserver(()=>this._measure()),this._sizes.disconnect();let s=[...this.renderRoot.querySelectorAll(".head .slide:not(.leaving) > div")];for(let o of s)[o,o.firstElementChild].forEach(a=>this._sizes.observe(a));this._marquee={key:t,back:n,rtl:this._rtl(),start:performance.now(),end:0,lines:s.map(o=>({line:o,over:0}))},this._measure()}_measure(){let t=this._marquee,e=this.preview||this._matches("(prefers-reduced-motion: reduce)");for(let a of t.lines){let r=e?0:a.line.firstElementChild.offsetWidth-a.line.clientWidth;a.over=r>1?r:0,a.line.toggleAttribute("data-long",a.over>0)}let n=Math.max(0,...t.lines.map(a=>a.over)),s=n/qn*1e3;t.end=n?t.start+Ot+s:0;let o=Math.max(this._config.rotate*1e3,Math.min(n&&2*Ot+s,Po));this.renderRoot.querySelector(".head .cycle")?.style.setProperty("--origami-cycle",`${o}ms`),this._turnAfter(o),this._frame()}_frame(){cancelAnimationFrame(this._frameId),clearTimeout(this._holdTimer);let t=this._marquee,e=performance.now(),n=Math.max(0,e-t.start-Ot)*qn/1e3;for(let{line:s,over:o}of t.lines){let a=Math.min(n,o),r=t.back?a-o:-a;s.firstElementChild.style.transform=r?`translateX(${t.rtl?-r:r}px)`:"",s.style.setProperty("--fade-start",`${+Math.min(Fn,-r).toFixed(1)||0}px`),s.style.setProperty("--fade-end",`${+Math.min(Fn,o+r).toFixed(1)}px`)}!t.end||e>=t.end||(e<t.start+Ot?this._holdTimer=setTimeout(()=>this._frame(),t.start+Ot-e):this._frameId=requestAnimationFrame(()=>this._frame()))}_tick(){if(clearTimeout(this._clock),!this.isConnected||!this._visible||document.hidden)return;let t=Date.now(),e=this._open||!!this._dialog,n=this._shown?.kind!=="info"?this._shown:null,s=(e?this._entries:n?[n]:[]).find(a=>a.clock&&a.ts>t),o=0;s?o=(s.ts-t)%1e3||1e3:(e||this._entries.some(a=>Ye(a,t))||n&&this._headTime(n))&&(o=6e4-t%6e4),o&&(this._clock=setTimeout(()=>{this._now=Date.now(),this.requestUpdate(),this._dialog?.requestUpdate(),this._tick()},o))}_headTime(t){return!!(t.live||!t.message&&Number.isFinite(t.ts))}_onView(t){let e=t&&!this._visible;this._visible=t,this._now=Date.now(),e&&this._cycle(),this.requestUpdate(),this._tick()}_onResize(t){Math.round(t)!==this._width&&(this._width=Math.round(t),this._cycle());let e=t>0&&t<Do;e!==this.classList.contains("narrow")&&(this.classList.toggle("narrow",e),this.requestUpdate())}_rtl(){return getComputedStyle(this).direction==="rtl"}_animate(){return!!(this._painted&&!this.preview&&this.isConnected&&this.getClientRects().length)}_empty(){return!this._entries.length&&!this._slides.length&&this._config.hide_when_empty&&!this.preview&&!this._inPicker}_setOpen(t){t!==this._open&&(this._open=t,this._settled=!1,clearTimeout(this._settleTimer),t&&(this.classList.toggle("capped",getComputedStyle(this).getPropertyValue("--origami-max-height").trim()!==""),this._settleTimer=setTimeout(()=>{this._settled=!0,this.requestUpdate()},this._animate()?B(this,"normal"):0)),t||this._cycle(),this.requestUpdate(),this._tick())}_toggle(){if(!this.listed().length)return;if(!this._open&&this.classList.contains("narrow")&&!this.preview&&customElements.get("ha-adaptive-dialog")){_t(this,"show-dialog",{dialogTag:Qe,dialogImport:()=>Promise.resolve(),dialogParams:{card:this}});return}let t=!!this.renderRoot.activeElement;this._setOpen(!this._open),t&&this.updateComplete.then(()=>this.renderRoot.querySelector(this._open?".bar":".head").focus({preventScroll:!0}))}_tap(){let t=this.listed(),e=t.length===1&&ce(t[0]);e?this._run(e):this._toggle()}_tappable(t){let e=this._shown;return t.length>1||!!(t[0]&&ce(t[0]))||e?.kind==="info"&&["hold","double_tap"].some(n=>this._infoAction(e,n))}_gestureAction(t){let e=this._shown?.kind==="info"&&this._infoAction(this._shown,t);return e?()=>this._run(e):null}firstUpdated(){let t=this.renderRoot.querySelector(".head");this._resize.observe(this.renderRoot.querySelector("ha-card")),this._gestures=new se(t,{canDrag:()=>this._turnable.length>1&&!this._open,drag:e=>{let n=this.renderRoot.querySelector(".slide:not(.leaving)");n.style.transform=`translateX(${e*.6}px)`,n.style.opacity=String(Math.max(.2,1-Math.abs(e)/160))},dragEnd:e=>{if(e)return this._step(e,"swipe");let n=this.renderRoot.querySelector(".slide:not(.leaving)"),s={transform:n.style.transform||"none",opacity:n.style.opacity||"1"};n.style.transform=n.style.opacity="",n.animate([s,{transform:"none",opacity:1}],{duration:B(this,"normal"),easing:M.standard})},step:e=>this._step(e,"key"),tap:()=>this._tap(),holdAction:()=>this._gestureAction("hold"),doubleTapAction:()=>this._gestureAction("double_tap"),rtl:()=>this._rtl()})}willUpdate(t){t.has("preview")&&this._refresh(),this._updateBackdrop(this._shown?.backdrop?Je(this._hass,this._shown.image):null),this._listMotion=this._open&&this._animate(),this._listMotion&&this._motion.measure(this.renderRoot.querySelector(".list"))}updated(){!this._config||!this._hass||!this.isConnected||(this._motion.play(this.renderRoot.querySelector(".list"),this._listMotion),this._setHidden(this._empty()),this.classList.toggle("dark",!!this._hass.themes?.darkMode),this.classList.toggle("with-backdrop",this._backdrops.some(t=>t.on)),this._css!==this._config.css&&(this._css=this._config.css,ue(this,this._css||"")),this._refocus!=null&&this._focusRow(this._refocus),this._intro&&this._playIntro(),this._scrolled!==this._cycleKey&&this._scroll())}_playIntro(){this._intro=!1;let t=this._config.slide==="side";!this._introduced&&this._turnable.length>1&&!this.preview&&this.getClientRects().length&&(this._introduced=!0,this._enter(t&&this._rtl()?-1:1,t)),requestAnimationFrame(()=>this._painted=!0)}_setHidden(t){if(t===!!(this._hiding||this.hidden))return;this._hostAnim?.cancel();let e=getComputedStyle(this).height,n=!this.classList.contains("bounded"),[s,o]=[B(this,"fast"),B(this,"normal")];if(t){if(!this._animate())return this._gone();this._hiding=!0,this.classList.add("hiding");let c=[{opacity:1,height:e,easing:M.out},{opacity:0,height:e,offset:s/(s+o),easing:M.standard},{opacity:0,height:n?"0px":e}],l=this._hostAnim=this.animate(c,{duration:s+o,fill:"forwards"});l.finished.then(()=>this._hostAnim===l&&this._gone(),()=>{});return}if(this._hiding=!1,this.classList.remove("hiding"),!this.hidden||(this.hidden=!1,_t(this,"card-visibility-changed",{value:!0}),!this._animate()))return;let a=getComputedStyle(this).height,r=n?[{height:"0px",opacity:0,easing:M.standard},{height:a,opacity:0,offset:o/(s+o),easing:M.in},{height:a,opacity:1}]:[{opacity:0},{opacity:1}];this._hostAnim=this.animate(r,{duration:s+o})}_gone(){this._hostAnim?.cancel(),this._hostAnim=null,this._hiding=!1,this.classList.remove("hiding"),this.hidden=!0,_t(this,"card-visibility-changed",{value:!1}),this._setOpen(!1)}_focusRow(t){this._refocus=null,he(this.renderRoot,t,this.renderRoot.querySelector(this._open?".bar":".head"))}rowView(t){let e=this._derive();return{hass:this._hass,texts:e.texts,clock:e.clock,now:this._now,opened:this._opened,run:n=>this._run(n),toggle:n=>{this._opened.delete(n)||this._opened.add(n),this.requestUpdate(),this._dialog?.requestUpdate()},dismiss:(n,s)=>{let o=this.listed().findIndex(a=>a.key===n.key);this.dismiss([n]),s&&t(o)}}}setDialog(t){this._dialog=t,this._tick(),t||this._cycle()}get gone(){return this.hidden||!!this._hiding}get css(){return this._config.css||""}get texts(){return this._derive().texts}dismissible(){return this._entries.length>1?this._entries.filter(ne):[]}listTitle(){let t=this._entries.length,e=this._derive().texts;return t?x(t===1?e.count_one:e.count_other,{n:t}):e.idle_title}_secondary(t,e){if(!t)return e.idle_msg;if(t.kind!=="info")return this._headTime(t)?this._derive().clock.entryTime(t,this._now):t.message;if(t.text!=null)return this._withBattery(t.text,t);let n=t.content??t.info.state_content;return customElements.get("state-display")?this._withBattery(b`<state-display .hass=${this._hass} .stateObj=${t.stateObj} .content=${n} .timeFormat=${t.info.time_format} .name=${t.name}></state-display>`,t):this._withBattery(We(t.stateObj,n,t.name,this._formatters()),t)}_slideTemplate(t,e,n){let s=t&&t.kind!=="info"&&this._headTime(t),o=this._secondary(t,e),a=r=>xt(t?.key,b`<span>${r}</span>`);return b`
      <div class="slide ${n?"leaving":""}" aria-hidden=${n?"true":g}>
        <div class="title">${a(t?t.title:e.idle_title)}</div>
        ${o?b`<div class="secondary ${s?"time":""}" aria-live=${s&&!n?"off":g}>${a(o)}</div>`:g}
      </div>
    `}render(){if(!this._config||!this._hass)return g;let t=this._derive().texts,e=this._shown,n=this.listed(),s=this._tappable(n),o=n.length>1,a=this.classList.contains("narrow"),r=this._entries.length,c=this._leaving,l=this.dismissible();return b`
      <ha-card
        class=${V({open:this._open,crit:e?.sev==="crit",tappable:s,settled:this._open&&this._settled})}
        style="--tile-color: ${e?re(e):"var(--state-inactive-color)"}"
        @keydown=${h=>h.key==="Escape"&&this._open&&(h.stopPropagation(),this._toggle())}
      >
        <div class="backdrop" aria-hidden="true">
          ${this._backdrops.map(h=>h.url?b`<img class=${h.on?"on":""} src=${h.url} alt="" draggable="false" referrerpolicy="no-referrer" @load=${()=>this._reveal(h)} />`:g)}
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
            <div class=${V({icon:!0,idle:!e})}>
              ${this._config.rotate>0&&this._turnable.length>1?xt(this._cycleKey,b`<div class="cycle"><i></i><i></i></div>`):g}
              <div class="glyph">${le(e||{icon:"mdi:bell-outline"},this._hass)}</div>
              ${c?xt(c,b`<div class="glyph leaving" style="color: ${re(c.entry)}">${le(c.entry,this._hass)}</div>`):g}
              ${r>1?b`<div class="badge">${r>9?"9+":r}</div>`:g}
            </div>
            <div class=${V({texts:!0,up:!!(c&&!c.side),side:!!c?.side})}>
              ${this._slideTemplate(e,t)}
              ${c?xt(c,this._slideTemplate(c.entry,t,c)):g}
            </div>
            ${o?b`<ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>`:g}
          </div>
        </div>
        <div class="drawer">
          <div class="inner">
            <div class="bar" role="button" tabindex="0" aria-expanded="true" @click=${()=>this._toggle()} @keydown=${h=>(h.key==="Enter"||h.key===" ")&&(h.preventDefault(),this._toggle())}>
              <ha-ripple></ha-ripple>
              <span class="count">${this.listTitle()}</span>
              <ha-icon class="chevron" icon="mdi:chevron-up"></ha-icon>
            </div>
            <div class="list" role="list">${de(this._motion.withLeaving(n,this._listMotion),this.rowView(h=>this._refocus=h))}</div>
            <div class=${V({"foot-wrap":!0,shown:l.length>0})}>
              <div class="clip">
                <div class="foot">
                  <button class="clear" type="button" tabindex=${l.length?"0":"-1"} @click=${h=>(this.dismiss(l),h.detail===0&&(this._refocus=0))}>${t.clear}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="say" aria-live="polite">${this._say||""}</div>
      </ha-card>
    `}_updateBackdrop(t){if(t===this._backdropUrl)return;this._backdropUrl=t;let e=this._backdrops,n=e.find(s=>s.on);if(!t)e.forEach(s=>s.on=!1);else if(n?.url!==t){let s=n===e[0]?e[1]:e[0];s.url=t,s.loaded===t&&this._reveal(s)}}_reveal(t){t.loaded=t.url,t.url===this._backdropUrl&&(this._backdrops.forEach(e=>e.on=e===t),this.requestUpdate())}};var ye=class extends O{static styles=[fe,me,pe,P`
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
    `];constructor(){super(),this._motion=new ft(()=>this.requestUpdate())}showDialog({card:t}){this._card&&this._card!==t&&this._release(),this._card=t,t.setDialog(this),this.requestUpdate()}closeDialog(){let t=this.renderRoot?.querySelector("ha-adaptive-dialog");return t&&this._shown?t.open=!1:this._closed(),!0}_release(){this._card?._dialog===this&&this._card.setDialog(null)}_closed(){this._release(),this._card=null,this._shown=!1,this.requestUpdate(),_t(this,"dialog-closed",{dialog:this.localName})}willUpdate(){this._animate=this._shown&&!this._card?.preview,this._animate&&this._motion.measure(this.renderRoot.querySelector(".list"))}updated(){this._motion.play(this.renderRoot.querySelector(".list"),this._animate),this._card&&this._css!==this._card.css&&(this._css=this._card.css,ue(this,this._css)),this._refocus!=null&&he(this.renderRoot,this._refocus,null),this._refocus=null}render(){let t=this._card;if(!t)return g;let e=t.gone?[]:t.listed();e.length||queueMicrotask(()=>this._card===t&&this.closeDialog());let n=t.dismissible();return b`
      <ha-adaptive-dialog
        open
        flexcontent
        .hass=${t.hass}
        @opened=${s=>s.target===s.currentTarget&&(this._shown=!0,this.requestUpdate())}
        @closed=${s=>s.target===s.currentTarget&&this._closed()}
      >
        <span slot="headerTitle" class="heading">${t.listTitle()}</span>
        ${n.length?b`<ha-icon-button slot="headerActionItems" .label=${t.texts.clear} @click=${()=>t.dismiss(n)}>
              <ha-icon icon="mdi:notification-clear-all"></ha-icon>
            </ha-icon-button>`:g}
        <div class="list" role="list">${de(this._motion.withLeaving(e,this._animate),t.rowView(s=>this._refocus=s))}</div>
      </ha-adaptive-dialog>
    `}};var Uo=["entities","label","weather","infos","updates","repairs","hide_when_empty","vertical","rotate","slide","audience","css"],Kn=["type","attribute","name","icon","color","image","background","before","tap_action","visibility"],zo=["entity",...Kn,"actions"],jo=["entity","name","icon","color","show_entity_picture","show_battery","state_content","time_format","show_current","show_forecast","forecast_type","forecast_slots","tap_action","hold_action","double_tap_action","visibility"],Vn=["attribute","picture"],ti=i=>i==null||i===""||i===!1||Array.isArray(i)&&!i.length||E(i)&&!Object.keys(i).length,ei=(i,t)=>Object.fromEntries([...new Set([...t,...Object.keys(i)])].filter(e=>e in i).map(e=>[e,i[e]])),ii=i=>i?i.only?"only":"except":"everyone",Bo=i=>({days:Math.floor(i/864e5),hours:Math.floor(i%864e5/36e5),minutes:Math.floor(i%36e5/6e4),seconds:i%6e4/1e3}),be=i=>!i.forecast_type||i.show_forecast===!1?"show_current":i.show_current===!1?"show_forecast":"show_both",we=class extends O{static properties={hass:{attribute:!1},_config:{state:!0}};static styles=P`
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
  `;constructor(){super(),this._memos=new Map}setConfig(t){ee(t),this._config=t}get _t(){return Cn(ae(this.hass),this.hass?.localize)}_memo(t,e){let n=JSON.stringify(e),s=this._memos.get(t);return s?.json===n?s.value:(this._memos.set(t,{json:n,value:e}),e)}_name(t,e){let n=this.hass.states[t];return n?Xe(this.hass)(n,e):typeof e=="string"&&e||t}_entries(t=this._config){return(t.entities||[]).map(e=>typeof e=="string"?{entity:e}:e)}_infos(t=this._config){return(t.infos||[]).map(e=>typeof e=="string"?{entity:e}:{...e})}_sources(t=this._config){let e=this._t,n=[{key:"system",name:e.label("system"),icon:D.system}];t.updates!==!1&&n.push({key:"updates",name:e.label("updates"),icon:D.update}),t.repairs!==!1&&n.push({key:"repairs",name:e.label("repairs"),icon:D.repair}),t.weather&&n.push({key:t.weather,name:this._name(t.weather),icon:D.weather});let s=this.hass.entities||{},o=t.label?Object.keys(s).filter(a=>s[a]?.labels?.includes(t.label)).map(a=>({entity:a})):[];for(let a of[...this._entries(t),...o])n.some(r=>r.key===a.entity)||n.push({key:a.entity,name:a.name||this._name(a.entity),icon:a.icon||D[this._kind(a)]});return n}_kind(t){return Le(t,this.hass.states[t.entity],this.hass)}_summary(t){let e=this._t,n=ii(t);if(n==="everyone")return e.label("everyone");let s=t[n].map(o=>this._name(o)).join(", ");return s?x(e.label(n+"_x"),{x:s}):e.label(n==="only"?"nobody":"everyone")}_schema(t){let e=this._t,n=this._config.audience||{},s=(o,a=r=>e.label(r))=>o.map(r=>({value:r,label:a(r)}));return[{name:"entities",selector:{entity:{multiple:!0}}},{name:"label",selector:{label:{}}},{name:"weather",selector:{entity:{filter:{domain:"weather"}}}},{name:"infos",selector:{entity:{multiple:!0,reorder:!0}}},{name:"",type:"grid",schema:[{name:"updates",selector:{boolean:{}}},{name:"repairs",selector:{boolean:{}}}]},{name:"hide_when_empty",selector:{boolean:{}}},{name:"content_layout",selector:{select:{mode:"box",options:["horizontal","vertical"].map(o=>({value:o,label:e.label(o),image:{src:`/static/images/form/tile_content_layout_${o}.svg`,src_dark:`/static/images/form/tile_content_layout_${o}_dark.svg`,flip_rtl:!0}}))}}},{name:"",type:"grid",schema:[{name:"rotate",selector:{number:{min:0,max:60,step:1,mode:"box",unit_of_measurement:"s"}}},{name:"slide",selector:{select:{mode:"dropdown",options:s(["up","side"],o=>e.label("slide_"+o))}}}]},{name:"audience",type:"expandable",title:e.label("audience"),icon:"mdi:account-eye-outline",schema:t.map(o=>({name:o.key,type:"expandable",title:`${o.name} \xB7 ${this._summary(n[o.key])}`,icon:o.icon,schema:[{name:"visible",selector:{select:{mode:"list",options:s(["everyone","only","except"])}}},...ii(n[o.key])==="everyone"?[]:[{name:"people",selector:{entity:{multiple:!0,filter:{domain:"person"}}}}]]}))},{name:"styling",type:"expandable",flatten:!0,title:e.label("styling"),icon:"mdi:palette-outline",schema:[{name:"css",selector:{text:{multiline:!0}}}]}]}_data(t){let e=this._config,n=e.audience||{};return{...Et,...e,content_layout:e.vertical?"vertical":"horizontal",entities:this._entries().map(s=>s.entity),infos:this._infos().map(s=>s.entity),audience:Object.fromEntries(t.map(s=>[s.key,{visible:ii(n[s.key]),people:n[s.key]?.only||n[s.key]?.except||[]}]))}}_mergeEntities(t,e={}){let n=this._entries(),s=new Map(n.map(r=>[r.entity,r])),o=t.map((r,c)=>n[c]&&r!==n[c].entity?c:-1).filter(r=>r>=0),a=t.length===n.length&&o.length===1&&!s.has(t[o[0]])?o[0]:-1;return this._swapped=a<0?null:[n[a].entity,t[a]],t.map((r,c)=>{let l=s.get(r)||(c===a?n[c]:{}),h={...l,entity:r},d=e[r]||{};for(let u of Kn){if(!(u in d))continue;let p=d[u];u==="before"&&rt(p)===rt(l.before)||(ti(p)||u==="type"&&p==="auto"||u==="color"&&p==="state"||u==="before"&&!rt(p)?delete h[u]:h[u]=p)}return h.type&&!Vn.includes(h.type)&&delete h.attribute,Object.keys(h).length===1?r:ei(h,zo)})}_onChange(t){t.stopPropagation();let{content_layout:e,...n}=t.detail.value;e&&(n.vertical=e==="vertical");let s=this._sources().map(r=>r.key);this._swapped=null,Array.isArray(n.entities)&&(n.entities=this._mergeEntities(n.entities)),Array.isArray(n.infos)&&(n.infos=this._mergeInfos(n.infos));let o={...this._config.audience};for(let[r,c]of Object.entries(n.audience||{}))c.visible==="only"||c.visible==="except"?o[r]={[c.visible]:c.people||[]}:delete o[r];for(let[r,c]of[this._swapped||[],[this._config.weather,n.weather]])r&&c&&o[r]&&!o[c]&&(o[c]=o[r]);let a=new Set(this._sources({...this._config,...n}).map(r=>r.key));for(let r of s)!a.has(r)&&r!=="updates"&&!r.startsWith("update.")&&delete o[r];n.audience=o,this._write(n)}_write(t){let e={...this._config,...t},n={type:this._config.type};for(let[s,o]of Object.entries(ei(e,Uo)))s==="type"||ti(o)&&o!==!1||s in Et&&o===Et[s]||(n[s]=o);this._config=n,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:n},bubbles:!0,composed:!0}))}_mergeInfos(t){let e=this._infos(),n=new Set,s=o=>o>=0&&!n.has(o)?(n.add(o),e[o]):null;return t.map((o,a)=>{let r=o.startsWith("person.")?{show_entity_picture:!0}:{},c=s(e.findIndex((l,h)=>l.entity===o&&!n.has(h)))||e.length===t.length&&!t.includes(e[a].entity)&&s(a)||r;return this._infoEntry({...c,entity:o})})}_infoEntry(t){let e={};for(let[n,s]of Object.entries(ei(t,jo)))(n==="show_current"||n==="show_forecast"?s===!1:!ti(s)&&!(n==="color"&&s==="state"))&&(e[n]=s);return Object.keys(e).length===1?e.entity:e}_forecastTypes(t){if(!t.entity.startsWith("weather."))return[];let e=this.hass.states[t.entity];return ze.filter(n=>Ct(e,n)||t.forecast_type===n)}_infoSchema(t){let e=this._t,n=this.hass.states[t.entity],s=t.entity.split(".")[0],o=[].concat(t.state_content??"state").some(u=>/^last[_-](changed|updated|triggered)$/.test(u)||s==="sun"&&u.startsWith("next_")||s==="calendar"&&u.endsWith("_time")||u==="state"&&!!n&&(n.attributes.device_class==="timestamp"||Oi(s))),a={entity_id:"entity"},r=this._forecastTypes(t),c=be(t),l=u=>({select:{mode:"dropdown",options:u.map(p=>({value:p,label:e.label(p)}))}}),h=[{name:"state_content",selector:{ui_state_content:{}},context:{filter_entity:"entity"}},...o?[{name:"time_format",selector:{ui_time_format:{}}}]:[]],d=[{name:"forecast",selector:l(["show_both","show_current","show_forecast"])},...c==="show_current"?[]:[{name:"forecast_type",selector:l(r)},{name:"forecast_slots",selector:{number:{min:1,max:12,mode:"box"}}}],...c==="show_forecast"?[]:h];return[{name:"name",selector:{entity_name:{}},context:{entity:"entity"}},{name:"",type:"grid",schema:[{name:"icon",selector:{icon:{}},context:{icon_entity:"entity"}},{name:"color",selector:{ui_color:{default_color:"state",include_state:!0}}}]},...r.length?d:h,{name:"show_entity_picture",selector:{boolean:{}}},...t.show_battery||n&&Yt(this.hass,n)?[{name:"show_battery",selector:{boolean:{}}}]:[],{name:"tap_action",selector:{ui_action:{default_action:"more-info"}},context:a},{name:"",type:"optional_actions",flatten:!0,schema:["hold_action","double_tap_action"].map(u=>({name:u,selector:{ui_action:{default_action:"none"}},context:a}))}]}_onInfo(t,e,n){t.stopPropagation();let s=this._infos(),{forecast:o,...a}=n,r={...s[e],...a,entity:s[e].entity},c="forecast"in n?o||"show_current":null;if(c&&c!==be(s[e])&&(Object.assign(r,{show_current:c==="show_forecast"?!1:void 0,show_forecast:void 0}),r.forecast_type=c==="show_current"?void 0:r.forecast_type||this._forecastTypes(r)[0]),!r.forecast_type)for(let l of["forecast_slots","show_current","show_forecast"])delete r[l];s[e]=r,this._write({infos:s.map(l=>this._infoEntry(l))})}_entitySchema(t){let e=this._t,n=this._kind(t);return[{name:"type",selector:{select:{mode:"dropdown",options:(o=>o.map(a=>({value:a,label:e.label("type_"+a)})))(["auto",...Zt])}}},...!t.type||Vn.includes(t.type)?[{name:"attribute",helper:t.type==="picture"?"attribute_picture":"attribute",selector:{attribute:{entity_id:t.entity}}}]:[],{name:"",type:"grid",schema:[{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{placeholder:D[n]}}}]},{name:"color",selector:{ui_color:{default_color:"state",include_state:!0}}},{name:"image",selector:{text:{}}},{name:"background",selector:{boolean:{}}},...Yi.includes(n)?[{name:"before",selector:{duration:{enable_day:!0}}}]:[],{name:"tap_action",helper:"row_tap_action",selector:{ui_action:{default_action:"more-info"}}}]}_onEntity(t,e,n){t.stopPropagation();let s=this._entries().map(o=>o.entity);this._write({entities:this._mergeEntities(s,{[s[e]]:n})})}_entityPanel(t,e){let n=this._t,s={...t,type:t.type||"auto",color:t.color||"state",background:!!t.background,before:t.before==null?void 0:Bo(rt(t.before))},o=Array.isArray(t.visibility)?t.visibility:[];return b`<ha-expansion-panel outlined .header=${t.name||this._name(t.entity)} .secondary=${n.label("type_"+this._kind(t))}>
      <ha-icon slot="leading-icon" .icon=${t.icon||D[this._kind(t)]}></ha-icon>
      <div class="content">
        <ha-form
          .hass=${this.hass}
          .data=${this._memo("entity-data-"+e,s)}
          .schema=${this._memo("entity-schema-"+e,this._entitySchema(t))}
          .computeLabel=${a=>n.label(a.name)}
          .computeHelper=${a=>n.helper(a.helper||a.name)}
          @value-changed=${a=>this._onEntity(a,e,a.detail.value)}
        ></ha-form>
        <ha-expansion-panel outlined .header=${n.label("visibility")}>
          <ha-icon slot="leading-icon" icon="mdi:eye"></ha-icon>
          <div class="content">
            <p class="intro">${n.helper("visibility_intro")}</p>
            <ha-card-conditions-editor
              .hass=${this.hass}
              .conditions=${this._memo("entity-conditions-"+e,o)}
              @value-changed=${a=>this._onEntity(a,e,{visibility:a.detail.value})}
            ></ha-card-conditions-editor>
          </div>
        </ha-expansion-panel>
      </div>
    </ha-expansion-panel>`}_infoPanel(t,e){let n=this._t,s=this.hass.states[t.entity],o=this._forecastTypes(t),a=o.length?{...t,forecast:be(t)}:t,r=Array.isArray(t.visibility)?t.visibility:[];return b`<ha-expansion-panel outlined .header=${this._name(t.entity,t.name)} .secondary=${o.length&&be(t)!=="show_current"?n.label(t.forecast_type):""}>
      ${s&&customElements.get("ha-state-icon")?b`<ha-state-icon slot="leading-icon" .hass=${this.hass} .stateObj=${s} .icon=${t.icon}></ha-state-icon>`:b`<ha-icon slot="leading-icon" .icon=${t.icon||D.generic}></ha-icon>`}
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
    </ha-expansion-panel>`}render(){if(!this._config||!this.hass)return g;let t=this._t,e=this._sources(),n=this._entries(),s=this._infos();return b`
      <ha-form
        .hass=${this.hass}
        .data=${this._memo("data",this._data(e))}
        .schema=${this._memo("schema",this._schema(e))}
        .computeLabel=${o=>t.label(o.name)}
        .computeHelper=${o=>t.helper(o.helper||o.name)}
        @value-changed=${this._onChange}
      ></ha-form>
      ${n.length?b`<ha-expansion-panel class="entities" outlined .header=${t.label("options")}>
            <ha-icon slot="leading-icon" icon="mdi:tune-variant"></ha-icon>
            <div class="content">${n.map((o,a)=>this._entityPanel(o,a))}</div>
          </ha-expansion-panel>`:g}
      ${s.length?b`<ha-expansion-panel class="infos" outlined .header=${t.label("info_options")}>
            <ha-icon slot="leading-icon" icon="mdi:information-outline"></ha-icon>
            <div class="content">${s.map((o,a)=>this._infoPanel(o,a))}</div>
          </ha-expansion-panel>`:g}
    `}};var ni=(i,t)=>customElements.get(i)||customElements.define(i,t);ni(q,ge);ni(q+"-editor",we);ni(Qe,ye);window.customCards||=[];window.customCards.some(i=>i.type===q)||(window.customCards.push({type:q,name:"Origami Notifications",description:"System notifications, repairs, updates, warnings and any entity you add.",preview:!0,documentationURL:"https://github.com/hazymorning/origami_notifications"}),console.info(`%c Origami Notifications %c v${si} `,"font-weight: bold","opacity: 0.7"));
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
