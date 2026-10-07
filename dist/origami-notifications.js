var ti="1.3.1";var Ct=globalThis,Ot=Ct.ShadowRoot&&(Ct.ShadyCSS===void 0||Ct.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,be=Symbol(),ei=new WeakMap,ft=class{constructor(t,e,n){if(this._$cssResult$=!0,n!==be)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(Ot&&t===void 0){let n=e!==void 0&&e.length===1;n&&(t=ei.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&ei.set(e,t))}return t}toString(){return this.cssText}},Nt=i=>new ft(typeof i=="string"?i:i+"",void 0,be),I=(i,...t)=>{let e=i.length===1?i[0]:t.reduce((n,s,o)=>n+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[o+1],i[0]);return new ft(e,i,be)},Mt=(i,t)=>{if(Ot)i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let n=document.createElement("style"),s=Ct.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=e.cssText,i.appendChild(n)}},we=Ot?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(let n of t.cssRules)e+=n.cssText;return Nt(e)})(i):i;var{is:zn,defineProperty:Bn,getOwnPropertyDescriptor:Hn,getOwnPropertyNames:Wn,getOwnPropertySymbols:qn,getPrototypeOf:Fn}=Object,Dt=globalThis,ii=Dt.trustedTypes,Vn=ii?ii.emptyScript:"",Kn=Dt.reactiveElementPolyfillSupport,_t=(i,t)=>i,ve={toAttribute(i,t){switch(t){case Boolean:i=i?Vn:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},si=(i,t)=>!zn(i,t),ni={attribute:!0,type:String,converter:ve,reflect:!1,useDefault:!1,hasChanged:si};Symbol.metadata??=Symbol("metadata"),Dt.litPropertyMetadata??=new WeakMap;var H=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=ni){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let n=Symbol(),s=this.getPropertyDescriptor(t,n,e);s!==void 0&&Bn(this.prototype,t,s)}}static getPropertyDescriptor(t,e,n){let{get:s,set:o}=Hn(this.prototype,t)??{get(){return this[e]},set(r){this[e]=r}};return{get:s,set(r){let a=s?.call(this);o?.call(this,r),this.requestUpdate(t,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ni}static _$Ei(){if(this.hasOwnProperty(_t("elementProperties")))return;let t=Fn(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(_t("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_t("properties"))){let e=this.properties,n=[...Wn(e),...qn(e)];for(let s of n)this.createProperty(s,e[s])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[n,s]of e)this.elementProperties.set(n,s)}this._$Eh=new Map;for(let[e,n]of this.elementProperties){let s=this._$Eu(e,n);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let s of n)e.unshift(we(s))}else t!==void 0&&e.push(we(t));return e}static _$Eu(t,e){let n=e.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let n of e.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Mt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,n){this._$AK(t,n)}_$ET(t,e){let n=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,n);if(s!==void 0&&n.reflect===!0){let o=(n.converter?.toAttribute!==void 0?n.converter:ve).toAttribute(e,n.type);this._$Em=t,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){let n=this.constructor,s=n._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let o=n.getPropertyOptions(s),r=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:ve;this._$Em=s;let a=r.fromAttribute(e,o.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(t,e,n,s=!1,o){if(t!==void 0){let r=this.constructor;if(s===!1&&(o=this[t]),n??=r.getPropertyOptions(t),!((n.hasChanged??si)(o,e)||n.useDefault&&n.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,n))))return;this.C(t,e,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:n,reflect:s,wrapped:o},r){n&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),o!==!0||r!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[s,o]of n){let{wrapped:r}=o,a=this[s];r!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,o,a)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(e)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};H.elementStyles=[],H.shadowRootOptions={mode:"open"},H[_t("elementProperties")]=new Map,H[_t("finalized")]=new Map,Kn?.({ReactiveElement:H}),(Dt.reactiveElementVersions??=[]).push("2.1.2");var $e=globalThis,oi=i=>i,Rt=$e.trustedTypes,ri=Rt?Rt.createPolicy("lit-html",{createHTML:i=>i}):void 0,xe="$lit$",W=`lit$${Math.random().toFixed(9).slice(2)}$`,Ae="?"+W,Gn=`<${Ae}>`,tt=document,yt=()=>tt.createComment(""),bt=i=>i===null||typeof i!="object"&&typeof i!="function",Se=Array.isArray,ui=i=>Se(i)||typeof i?.[Symbol.iterator]=="function",ke=`[ 	
\f\r]`,gt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ai=/-->/g,ci=/>/g,Z=RegExp(`>|${ke}(?:([^\\s"'>=/]+)(${ke}*=${ke}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),li=/'/g,di=/"/g,pi=/^(?:script|style|textarea|title)$/i,Ee=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),w=Ee(1),Eo=Ee(2),To=Ee(3),R=Symbol.for("lit-noChange"),g=Symbol.for("lit-nothing"),hi=new WeakMap,Q=tt.createTreeWalker(tt,129);function mi(i,t){if(!Se(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return ri!==void 0?ri.createHTML(t):t}var fi=(i,t)=>{let e=i.length-1,n=[],s,o=t===2?"<svg>":t===3?"<math>":"",r=gt;for(let a=0;a<e;a++){let c=i[a],l,h,d=-1,p=0;for(;p<c.length&&(r.lastIndex=p,h=r.exec(c),h!==null);)p=r.lastIndex,r===gt?h[1]==="!--"?r=ai:h[1]!==void 0?r=ci:h[2]!==void 0?(pi.test(h[2])&&(s=RegExp("</"+h[2],"g")),r=Z):h[3]!==void 0&&(r=Z):r===Z?h[0]===">"?(r=s??gt,d=-1):h[1]===void 0?d=-2:(d=r.lastIndex-h[2].length,l=h[1],r=h[3]===void 0?Z:h[3]==='"'?di:li):r===di||r===li?r=Z:r===ai||r===ci?r=gt:(r=Z,s=void 0);let u=r===Z&&i[a+1].startsWith("/>")?" ":"";o+=r===gt?c+Gn:d>=0?(n.push(l),c.slice(0,d)+xe+c.slice(d)+W+u):c+W+(d===-2?a:u)}return[mi(i,o+(i[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},wt=class i{constructor({strings:t,_$litType$:e},n){let s;this.parts=[];let o=0,r=0,a=t.length-1,c=this.parts,[l,h]=fi(t,e);if(this.el=i.createElement(l,n),Q.currentNode=this.el.content,e===2||e===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(s=Q.nextNode())!==null&&c.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(let d of s.getAttributeNames())if(d.endsWith(xe)){let p=h[r++],u=s.getAttribute(d).split(W),f=/([.?@])?(.*)/.exec(p);c.push({type:1,index:o,name:f[2],strings:u,ctor:f[1]==="."?It:f[1]==="?"?Ut:f[1]==="@"?Lt:it}),s.removeAttribute(d)}else d.startsWith(W)&&(c.push({type:6,index:o}),s.removeAttribute(d));if(pi.test(s.tagName)){let d=s.textContent.split(W),p=d.length-1;if(p>0){s.textContent=Rt?Rt.emptyScript:"";for(let u=0;u<p;u++)s.append(d[u],yt()),Q.nextNode(),c.push({type:2,index:++o});s.append(d[p],yt())}}}else if(s.nodeType===8)if(s.data===Ae)c.push({type:2,index:o});else{let d=-1;for(;(d=s.data.indexOf(W,d+1))!==-1;)c.push({type:7,index:o}),d+=W.length-1}o++}}static createElement(t,e){let n=tt.createElement("template");return n.innerHTML=t,n}};function et(i,t,e=i,n){if(t===R)return t;let s=n!==void 0?e._$Co?.[n]:e._$Cl,o=bt(t)?void 0:t._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(i),s._$AT(i,e,n)),n!==void 0?(e._$Co??=[])[n]=s:e._$Cl=s),s!==void 0&&(t=et(i,s._$AS(i,t.values),s,n)),t}var Pt=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:n}=this._$AD,s=(t?.creationScope??tt).importNode(e,!0);Q.currentNode=s;let o=Q.nextNode(),r=0,a=0,c=n[0];for(;c!==void 0;){if(r===c.index){let l;c.type===2?l=new ct(o,o.nextSibling,this,t):c.type===1?l=new c.ctor(o,c.name,c.strings,this,t):c.type===6&&(l=new jt(o,this,t)),this._$AV.push(l),c=n[++a]}r!==c?.index&&(o=Q.nextNode(),r++)}return Q.currentNode=tt,s}p(t){let e=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,e),e+=n.strings.length-2):n._$AI(t[e])),e++}},ct=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,n,s){this.type=2,this._$AH=g,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=n,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=et(this,t,e),bt(t)?t===g||t==null||t===""?(this._$AH!==g&&this._$AR(),this._$AH=g):t!==this._$AH&&t!==R&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):ui(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==g&&bt(this._$AH)?this._$AA.nextSibling.data=t:this.T(tt.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:n}=t,s=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=wt.createElement(mi(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===s)this._$AH.p(e);else{let o=new Pt(s,this),r=o.u(this.options);o.p(e),this.T(r),this._$AH=o}}_$AC(t){let e=hi.get(t.strings);return e===void 0&&hi.set(t.strings,e=new wt(t)),e}k(t){Se(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,n,s=0;for(let o of t)s===e.length?e.push(n=new i(this.O(yt()),this.O(yt()),this,this.options)):n=e[s],n._$AI(o),s++;s<e.length&&(this._$AR(n&&n._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let n=oi(t).nextSibling;oi(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},it=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,n,s,o){this.type=1,this._$AH=g,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=g}_$AI(t,e=this,n,s){let o=this.strings,r=!1;if(o===void 0)t=et(this,t,e,0),r=!bt(t)||t!==this._$AH&&t!==R,r&&(this._$AH=t);else{let a=t,c,l;for(t=o[0],c=0;c<o.length-1;c++)l=et(this,a[n+c],e,c),l===R&&(l=this._$AH[c]),r||=!bt(l)||l!==this._$AH[c],l===g?t=g:t!==g&&(t+=(l??"")+o[c+1]),this._$AH[c]=l}r&&!s&&this.j(t)}j(t){t===g?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},It=class extends it{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===g?void 0:t}},Ut=class extends it{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==g)}},Lt=class extends it{constructor(t,e,n,s,o){super(t,e,n,s,o),this.type=5}_$AI(t,e=this){if((t=et(this,t,e,0)??g)===R)return;let n=this._$AH,s=t===g&&n!==g||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,o=t!==g&&(n===g||s);s&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},jt=class{constructor(t,e,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){et(this,t)}},_i={M:xe,P:W,A:Ae,C:1,L:fi,R:Pt,D:ui,V:et,I:ct,H:it,N:Ut,U:Lt,B:It,F:jt},Yn=$e.litHtmlPolyfillSupport;Yn?.(wt,ct),($e.litHtmlVersions??=[]).push("3.3.3");var gi=(i,t,e)=>{let n=e?.renderBefore??t,s=n._$litPart$;if(s===void 0){let o=e?.renderBefore??null;n._$litPart$=s=new ct(t.insertBefore(yt(),o),o,void 0,e??{})}return s._$AI(i),s};var Te=globalThis,O=class extends H{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=gi(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return R}};O._$litElement$=!0,O.finalized=!0,Te.litElementHydrateSupport?.({LitElement:O});var Xn=Te.litElementPolyfillSupport;Xn?.({LitElement:O});(Te.litElementVersions??=[]).push("4.2.2");var zt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},lt=i=>(...t)=>({_$litDirective$:i,values:t}),F=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,n){this._$Ct=t,this._$AM=e,this._$Ci=n}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var V=lt(class extends F{constructor(i){if(super(i),i.type!==zt.ATTRIBUTE||i.name!=="class"||i.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(i){return" "+Object.keys(i).filter(t=>i[t]).join(" ")+" "}update(i,[t]){if(this.st===void 0){this.st=new Set,i.strings!==void 0&&(this.nt=new Set(i.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in t)t[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(t)}let e=i.element.classList;for(let n of this.st)n in t||(e.remove(n),this.st.delete(n));for(let n in t){let s=!!t[n];s===this.st.has(n)||this.nt?.has(n)||(s?(e.add(n),this.st.add(n)):(e.remove(n),this.st.delete(n)))}return R}});var{I:Jn}=_i,yi=i=>i;var bi=()=>document.createComment(""),dt=(i,t,e)=>{let n=i._$AA.parentNode,s=t===void 0?i._$AB:t._$AA;if(e===void 0){let o=n.insertBefore(bi(),s),r=n.insertBefore(bi(),s);e=new Jn(o,r,i,i.options)}else{let o=e._$AB.nextSibling,r=e._$AM,a=r!==i;if(a){let c;e._$AQ?.(i),e._$AM=i,e._$AP!==void 0&&(c=i._$AU)!==r._$AU&&e._$AP(c)}if(o!==s||a){let c=e._$AA;for(;c!==o;){let l=yi(c).nextSibling;yi(n).insertBefore(c,s),c=l}}}return e},K=(i,t,e=i)=>(i._$AI(t,e),i),Zn={},Bt=(i,t=Zn)=>i._$AH=t,wi=i=>i._$AH,Ht=i=>{i._$AR(),i._$AA.remove()};var vt=lt(class extends F{constructor(){super(...arguments),this.key=g}render(i,t){return this.key=i,t}update(i,[t,e]){return t!==this.key&&(Bt(i),this.key=t),e}});var Ce=new Map;function G(i,t){let e=i+JSON.stringify(t);if(!Ce.has(e)){let n;try{n=new Intl.DateTimeFormat(i,t)}catch{n=new Intl.DateTimeFormat(void 0,{...t,timeZone:void 0})}Ce.set(e,n)}return Ce.get(e)}function vi(i,t){try{return new Intl.NumberFormat(i,t)}catch{return new Intl.NumberFormat(void 0,t)}}var k=(i,t)=>i.replace(/\{(\w+)\}/g,(e,n)=>t[n]??"");function ht(i,t){let e=G("en-US",{hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric",timeZone:t}).formatToParts(i);return Object.fromEntries(e.map(({type:n,value:s})=>[n,Number(s)]))}var Qn=/^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d):(\d\d)(?::(\d\d)(\.\d+)?)?)?$/;function nt(i,t){let e=Qn.exec(i);if(!e)return Date.parse(i);let n=Date.UTC(+e[1],e[2]-1,+e[3],+(e[4]||0),+(e[5]||0),+(e[6]||0)),s=o=>{let r=ht(o,t);return Date.UTC(r.year,r.month-1,r.day,r.hour,r.minute,r.second)-o};return n-s(n-s(n))+(e[7]?Math.round(parseFloat(e[7])*1e3):0)}var P=(i,t)=>typeof i=="string"&&/^\d{4}-\d\d-\d\d/.test(i)?nt(i,t):NaN,x=(i,t=NaN)=>{let e=i?Date.parse(i):NaN;return Number.isNaN(e)?t:e};function C(i,t){let e=ht(i,t);return Date.UTC(e.year,e.month-1,e.day)/864e5}var st=i=>new Date(i*864e5).toISOString().slice(0,10),Y=(i,t)=>nt(st(i),t);function Oe(i){let t=i>0?Math.ceil(i/1e3):0,e=Math.floor(t/3600),n=Math.floor(t%3600/60),s=String(t%60).padStart(2,"0");return e?`${e}:${String(n).padStart(2,"0")}:${s}`:`${n}:${s}`}function ki(i){let t=/^(\d+):(\d\d):(\d\d)$/.exec(String(i??"").trim());return t?(+t[1]*3600+ +t[2]*60+ +t[3])*1e3:NaN}var ts={comma_decimal:"en-US",decimal_comma:"de",space_comma:"fr",quote_decimal:"de-CH",none:"en-US"};function es(){return G(void 0,{hour:"numeric"}).resolvedOptions().hour12}var Wt=class{constructor(t,e,n){let s=t?.locale||{};this.lang=e,this.t=n,this.server=t?.config?.time_zone||void 0,this.zone=s.time_zone==="server"?this.server:void 0;let o={12:!0,24:!1,system:es()}[s.time_format];this.time={timeZone:this.zone,...o===void 0?{}:{hour12:o}},this.numbers=vi(s.number_format==="system"?void 0:ts[s.number_format]||e,{maximumFractionDigits:1,useGrouping:s.number_format!=="none"}),this.percents=vi(e,{style:"percent",maximumFractionDigits:0});try{this.rel=new Intl.RelativeTimeFormat(e,{numeric:"auto",style:"short"})}catch{this.rel=new Intl.RelativeTimeFormat("en",{numeric:"auto",style:"short"})}}relative(t,e){let n=Math.round((t-e)/1e3),s=Math.round(n/60),o=Math.round(n/3600);return Math.abs(n)<60?(n>0?this.t.soon:this.t.just_now)||this.rel.format(0,"second"):Math.abs(s)<60?this.rel.format(s,"minute"):Math.abs(o)<24?this.rel.format(o,"hour"):this.rel.format(Math.round(n/86400),"day")}entryTime(t,e){if(!Number.isFinite(t.ts))return"";if(t.clock)return Oe(t.ts-e);if(t.day){let{near:n,text:s}=this.day(t.ts,this.server,e);return n?s:k(this.t.on_date,{d:s})}return this.relative(t.past?Math.min(t.ts,e):t.ts,e)}absolute(t){return G(this.lang,{dateStyle:"medium",timeStyle:"short",...this.time}).format(t)}absoluteDate(t,e){return G(this.lang,{dateStyle:"medium",timeZone:e}).format(t)}clockTime(t){return G(this.lang,{hour:"numeric",minute:"2-digit",...this.time}).format(t)}hour(t){let e=G(this.lang,{hour:"numeric",...this.time});return e.formatToParts(t).every(n=>n.type==="hour")?this.clockTime(t):e.format(t).replace(/^0(?=\d\D)/,"")}day(t,e,n){let s=C(t,e)-C(n,this.zone);return Math.abs(s)<=1?{near:!0,text:this.rel.format(s,"day")}:{near:!1,text:G(this.lang,{day:"2-digit",month:"2-digit",timeZone:e}).format(t)}}at(t,e){let{near:n,text:s}=this.day(t,this.zone,e);return k(n?this.t.day_at:this.t.date_at,{d:s,t:this.clockTime(t)})}calendar(t,e,n){let s=t?nt(t,this.server):NaN;if(Number.isNaN(s))return this.t.event;if(!e)return this.at(s,n);let{near:o,text:r}=this.day(s,this.server,n);return o?r:k(this.t.on_date,{d:r})}slotLabel(t,e,n){let s=C(t,this.zone)-C(n,this.zone),o=Math.abs(s)<=1?this.rel.format(s,"day"):G(this.lang,{weekday:"long",timeZone:this.zone}).format(t),r=e!=="hourly"?o:s===0?this.clockTime(t):k(this.t.day_at,{d:o,t:this.clockTime(t)});return r.charAt(0).toLocaleUpperCase(this.lang)+r.slice(1)}number(t){return this.numbers.format(t)}percent(t){return this.percents.format(t/100)}};var S=i=>i.split(".")[0],Ai=new Set(["ai_task","button","conversation","event","image","infrared","input_button","notify","radio_frequency","scene","stt","tag","tts","wake_word","datetime"]),is={alarm_control_panel:["disarmed"],alert:["idle"],cover:["closed"],device_tracker:["not_home"],lawn_mower:["docked","paused","idle"],lock:["locked"],media_player:["standby"],person:["not_home"],vacuum:["idle","docked","paused"],valve:["closed"]},$i={camera:["streaming","recording"],group:["on","home","open","locked","problem"],plant:["problem"],timer:["active"]},Si=i=>Ai.has(i);function ot(i,t=i.state){let e=S(i.entity_id);return Ai.has(e)?t!=="unavailable":t==="unavailable"||t==="unknown"||t==="off"&&e!=="alert"?!1:$i[e]?$i[e].includes(t):!(is[e]||[]).includes(t)}var ns=new Set(["alarm_control_panel","alert","automation","binary_sensor","calendar","camera","climate","cover","device_tracker","fan","group","humidifier","input_boolean","lawn_mower","light","lock","media_player","person","plant","remote","schedule","script","siren","sun","switch","timer","update","vacuum","valve","water_heater","weather"]),ss=i=>i.reduceRight((t,e)=>`var(${e}${t?", "+t:""})`,""),xi=i=>String(i).toLowerCase().replace(/[^a-z0-9]+/g,"_");function kt(i,t,e,n){let s=n?"active":"inactive";return ss([...t?[`--state-${i}-${t}-${xi(e)}-color`]:[],`--state-${i}-${xi(e)}-color`,`--state-${i}-${s}-color`,`--state-${s}-color`])}var os=i=>{let t=new Set((i.attributes.entity_id||[]).map(e=>S(String(e))));return t.size===1?[...t][0]:void 0};function qt(i){let{state:t,attributes:e}=i;if(t==="unavailable")return"var(--state-unavailable-color)";let n=S(i.entity_id),s=ot(i);if(n==="sensor"&&e.device_class==="battery"&&t!==""&&!isNaN(Number(t))){let r=Number(t);return`var(--state-sensor-battery-${r>=70?"high":r>=30?"medium":"low"}-color)`}let o=n==="group"?os(i):n;return ns.has(o)&&n!=="person"&&n!=="device_tracker"?kt(o,e.device_class,t,s):s?"var(--state-icon-color)":"var(--state-inactive-color)"}var rs=new Set(["primary","accent","red","pink","purple","deep-purple","indigo","blue","light-blue","cyan","teal","green","light-green","lime","yellow","amber","orange","deep-orange","brown","light-grey","grey","dark-grey","blue-grey","black","white","primary-text","secondary-text","disabled"]),Ft=i=>rs.has(i)?`var(--${i}-color)`:i,X={updateInstall:1,todoUpdate:4,coverClose:2,valveClose:2,vacuumReturn:16,mowerDock:4,sirenOff:2},Vt=(i,t)=>(Number(i.attributes.supported_features)&t)===t;var ut=i=>String(i??"").replace(/<br\s*\/?>/gi,`
`).replace(/!\[[^\]]*\]\([^)]*\)/g,"").replace(/\[([^\]]*)\]\([^)]*\)/g,"$1").replace(/<\/?[a-z][^>]*>/gi,"").replace(/(\*\*|__|~~|`)(.+?)\1/g,"$2").replace(/^ {0,3}(#{1,6} +|> ?|[-*+] +)/gm,"").replace(/\n{3,}/g,`

`).trim(),Ei=/^(https?:\/\/|\/(?!\/))/i;function Ti(i){let t=/\[[^\]]*\]\(([^)\s]+)[^)]*\)/.exec(String(i??"").replace(/!\[[^\]]*\]\([^)]*\)/g,""));return t&&Ei.test(t[1])?t[1]:null}function Ci(i){let t=/!\[[^\]]*\]\(\s*([^)\s]*)[^)]*\)/.exec(String(i??""));return t&&Ei.test(t[1])?t[1]:null}var $t=i=>({tap_action:i.startsWith("/")?{action:"navigate",navigation_path:i}:{action:"url",url_path:i}});var A=i=>i!=null&&typeof i=="object"&&!Array.isArray(i),U=i=>i==null||i===""||i===!1||typeof i=="object"&&Object.keys(i).length===0;var j=(...i)=>i.join("\0"),rt=(i,t,e,n={})=>({label:t,action:{entity:i,tap_action:{action:"perform-action",perform_action:e,target:{entity_id:i},...n}}}),L=(i,t)=>{for(let e of t){let n=i?.[e];if(typeof n=="string"&&n||typeof n=="number")return String(n)}return""},Mi=(i,t)=>t.split(".").reduce((e,n)=>e?.[n],i),Me=["image","image_url","picture","thumbnail"];function Kt(i){return typeof i.entity_picture=="string"&&i.entity_picture?i.entity_picture:Me.map(t=>i[t]).find(t=>typeof t=="string"&&/^(https?:\/\/|\/|data:image\/)/i.test(t))||null}var Di=["description","summary"],Ri=i=>A(i)&&L(i,["name","title"])!=="",Pi=i=>Object.keys(i).find(t=>Ri(i[t])&&[...Di,...Me].some(e=>!U(i[t][e]))),Ii=i=>{let t=String(i).trim().toLowerCase();return["off","unavailable","unknown","idle","none",""].includes(t)||Number(t)===0},as=i=>{let t=String(i).toLowerCase();return t==="on"||t==="active"||Number(i)>0};function Oi(i,t,e,n){let s=i.attributes,o=t.attribute||Pi(s),r=o?Mi(s,o):void 0,a={kind:n,ts:x(i.last_changed,e.now),past:!0,once:!0};if(Ri(r)){let c=L(r,["name","title"]),l=L(r,Di);return[{...a,title:c,message:l||e.name(i,t.name),image:L(r,Me),ack:j(c,l)}]}return n==="attribute"?!t.attribute||U(r)||typeof r=="object"?[]:[{...a,title:e.attr(i,o,r),message:e.name(i,t.name),ack:String(r)}]:Ii(i.state)?[]:[{...a,title:e.state(i),message:e.name(i,t.name),ack:String(i.state)}]}function Gt(i,t,e){return i>e.now?i-e.now>t?(e.wake(i-t),!1):!0:!1}function Ui(i,t,e){let n=i.attributes;if(!n.message)return[];let s={kind:"calendar",title:n.message,message:e.clock.calendar(n.start_time,n.all_day,e.now),color:kt("calendar",null,"on",!0)};if(i.state==="on")return[{...s,ts:x(i.last_changed,e.now),past:!0,ack:j(n.message,n.start_time)}];let o=P(n.start_time,e.clock.server);return i.state!=="off"||!(t.lead>=0)||!Gt(o,t.lead,e)?[]:[{...s,...n.all_day?{message:""}:{},ts:o,day:!!n.all_day,ack:j(n.message,n.start_time,"ahead")}]}var cs=12*36e5,ls=/^\d{4}-\d\d-\d\d$/;function ds(i,t,e){let n=t.lead>=0?t.lead:cs;if(S(i.entity_id)==="calendar")return Ui(i,{...t,lead:n},e).map(l=>({...l,kind:"waste"}));let s=e.dayOf(e.now,e.clock.server),o=Object.keys(i.attributes).filter(l=>ls.test(l)&&C(Date.parse(l+"T12:00:00Z"),"UTC")>=s).sort()[0];if(!o)return[];let r=C(Date.parse(o+"T12:00:00Z"),"UTC"),a=Y(r,e.clock.server);if(r>s&&!Gt(a,n,e))return[];let c=i.attributes[o];return[{kind:"waste",title:typeof c=="string"&&c||e.name(i,t.name),message:"",ts:a,day:!0,expires:Y(r+1,e.clock.server),ack:j(o,c)}]}function hs(i,t,e){if(i.state!=="on")return[];let{attributes:n,entity_id:s}=i,o=e.t,r=typeof n.update_percentage=="number"?Math.round(n.update_percentage):null,a=n.in_progress?[{label:r===null?o.installing:k(o.installing_pct,{p:r}),disabled:!0}]:null,c=e.admin&&Vt(i,X.updateInstall)?[rt(s,o.install,"update.install")]:[];return[{kind:"update",title:(t.name?e.name(i,t.name):n.title||e.name(i).replace(/\s*update\s*$/i,"").trim())||o.update,message:n.latest_version?k(o.update_msg,{v:n.latest_version}):o.update_msg_plain,ts:x(i.last_changed,e.now),past:!0,actions:a||c,...e.admin&&!n.auto_update?{dismiss:{service:["update","skip",{entity_id:s}]}}:{ack:String(n.latest_version)}}]}var Ni={triggered:"crit",pending:"warn",arming:"warn"};function us(i,t,e){return Ni[i.state]?[{kind:"alarm",sev:Ni[i.state],title:e.name(i,t.name),message:e.state(i),ts:x(i.last_changed,e.now),past:!0}]:[]}function ps(i,t,e){return i.state!=="on"?[]:[{kind:"alert",sev:"warn",title:e.name(i,t.name),message:"",ts:x(i.last_changed,e.now),past:!0,ack:"on"}]}function ms(i,t,e){let{attributes:n,entity_id:s}=i,o=e.t,r={kind:"timer",title:e.name(i,t.name)};if(i.state==="active"){let a=x(n.finishes_at),c=Number.isFinite(a)?k(o.ends_at,{t:e.clock.clockTime(a),s:e.state(i)}):e.state(i);return[{...r,message:c,ts:a,live:!0,clock:!0,ack:String(n.finishes_at),actions:[rt(s,o.act_pause,"timer.pause"),rt(s,o.act_cancel,"timer.cancel")]}]}return i.state!=="paused"?[]:[{...r,message:k(o.paused_left,{t:Oe(ki(n.remaining)),s:e.state(i)}),ts:x(i.last_changed,e.now),past:!0,ack:j("paused",n.remaining),actions:[rt(s,o.act_resume,"timer.start"),rt(s,o.act_cancel,"timer.cancel")]}]}var fs={d:864e5,h:36e5,min:6e4,s:1e3,ms:1},_s=i=>i.device_class==="timestamp"?void 0:fs[i.unit_of_measurement];function gs(i,t,e){let n=_s(i.attributes),s=n?x(i.last_changed)+Number(i.state)*n:P(i.state,e.clock.server),o=Math.round(s/6e4)*6e4;return Gt(o,t.lead>=0?t.lead:1/0,e)?[{kind:"countdown",title:e.name(i,t.name),message:n?e.clock.absolute(o):e.state(i),ts:o,live:!0,ack:""}]:[]}var ys=12*36e5;function bs(i,t,e){let n=P(i.state,e.clock.server);return Gt(n,t.lead>=0?t.lead:ys,e)?[{kind:"next_alarm",title:t.name?e.name(i,t.name):e.t.next_alarm,message:e.clock.at(n,e.now),ts:n,ack:String(i.state)}]:[]}function ws(i,t){for(let e of t){let n=i.states[e],s=n?.attributes||{};if(e.startsWith("image.")&&s.access_token)return`/api/image_proxy/${e}?token=${encodeURIComponent(s.access_token)}&state=${encodeURIComponent(n.state)}`;if(s.entity_picture)return s.entity_picture}return null}function vs(i,t,e){let n=P(i.state,e.clock.server);if(!Number.isFinite(n))return[];let s=i.attributes.event_type,o=e.devicePictures(i.entity_id);return o.forEach(e.watch),[{kind:"event",title:e.name(i,t.name),message:s==null||s===""?"":e.attr(i,"event_type",s),ts:n,past:!0,expires:n+864e5,image:Kt(i.attributes)||ws(e.hass,o),ack:String(i.state)}]}function ks(i,t,e){let n=i.entity_id,s=t.lead>=0?t.lead:0,o=e.dayOf(e.now),r=Vt(i,X.todoUpdate),a=l=>r?[rt(n,e.t.act_done,"todo.update_item",{data:{item:l.uid,status:"completed"}})]:[],c=[];for(let l of e.todos(n)||[]){if(l?.status!=="needs_action"||!l.uid||typeof l.due!="string")continue;let h=!l.due.includes("T"),d=P(l.due,e.clock.server);if(Number.isFinite(d)){if(e.dayOf(d,h?e.clock.server:e.clock.zone)>o&&d-e.now>s){e.wake(d-s),e.wake(e.midnight);continue}c.push({key:`t:${n}:${l.uid}`,kind:"todo",title:String(l.summary||""),message:e.name(i,t.name),ts:d,day:h,ack:j(l.uid,l.due),tap:$t("/todo?entity_id="+n),actions:a(l)})}}return c}var Li={lock:{sev:{jammed:"warn"},label:"act_lock",action:"lock.lock",when:["unlocked","open","jammed"],assumed:!0},cover:{label:"act_close_cover",action:"cover.close_cover",feature:X.coverClose,when:["open","opening"],assumed:!0,confirm:!0},valve:{label:"act_close_valve",action:"valve.close_valve",feature:X.valveClose,when:["open","opening"],assumed:!0,confirm:!0},vacuum:{sev:{error:"warn"},label:"act_dock_vacuum",action:"vacuum.return_to_base",feature:X.vacuumReturn,when:["cleaning","error"]},lawn_mower:{sev:{error:"warn"},label:"act_dock_mower",action:"lawn_mower.dock",feature:X.mowerDock,when:["mowing","returning","error"]},siren:{sev:{on:"crit"},label:"act_off",action:"siren.turn_off",feature:X.sirenOff,when:["on"]}};function $s(i,t,e){if(!ot(i))return[];let{attributes:n,entity_id:s}=i,o=Li[S(s)],r=o&&(o.when.includes(i.state)||o.assumed&&n.assumed_state===!0)&&(!o.feature||Vt(i,o.feature))&&!(S(s)==="lock"&&n.code_format);return[{kind:"device",sev:o?.sev?.[i.state],title:e.name(i,t.name),message:e.members(i)||e.state(i),ts:x(i.last_changed,e.now),past:!0,ack:String(i.state),actions:r?[rt(s,e.t[o.label],o.action,o.confirm?{confirmation:!0}:{})]:[]}]}var ji={extreme:"crit",severe:"crit",moderate:"warn"},zi=i=>!!(L(i,["severity"])&&L(i,["headline","event"])),xs=/^([a-z][a-z0-9]*)_(\d+)_(headline|name|title|event)$/,Bi=i=>{let t=new Map;for(let e of Object.keys(i)){let n=xs.exec(e);if(!n||U(i[e]))continue;let s=r=>i[`${n[1]}_${n[2]}_${r}`];(n[3]==="headline"||n[3]==="event"||!U(s("level"))||!U(s("severity")))&&t.set(n[1]+n[2],{prefix:n[1],n:Number(n[2])})}return[...t.values()].sort((e,n)=>e.n-n.n)},Ne=(i,t,e)=>i.map(n=>P(t(n),e)).find(Number.isFinite);function As(i,t,e){let n=i.entity_id,s=new Set;return t.map(({prefix:o,n:r})=>{let a=_=>i.attributes[`${o}_${r}_${_}`],c={headline:a("headline"),name:a("name"),title:a("title"),event:a("event")},l=L(c,["headline","name","title","event"]),h=Number(a("level"))||0,d=ut(L({d:a("description")},["d"])),p=Ne(["start","onset"],a,e.clock.server),u=Ne(["end","expires"],a,e.clock.server),f=`w:${n}:${a("name")||l}:${a("start")||a("onset")||""}`;for(;s.has(f);)f+="+";return s.add(f),{key:f,kind:"warning",sev:h>=3||ji[String(a("severity")).toLowerCase()]==="crit"?"crit":"warn",title:l,message:d||(h?k(e.t.level,{l:h}):e.name(i)),ts:p??x(i.last_changed,e.now),past:p===void 0,expires:u,ack:j(l,h,d)}})}function Ss(i,t,e){let n=Bi(i.attributes);if(n.length)return As(i,n,e);if(i.state!=="on")return[];let s=zi(i.attributes)?i.attributes:e.details(i),o=s||{},r=u=>o[u],a=e.clock.server,c=Ne(["start","onset","effective"],r,a),l=P(o.sent,a),h=P(o.expires,a),d=L(o,["headline","event"]),p=ut(L(o,["description"]));return[{kind:"warning",sev:ji[String(o.severity).toLowerCase()],title:d||e.name(i,t.name),message:p,ts:c??(Number.isFinite(l)?l:x(i.last_changed,e.now)),past:c===void 0,expires:Number.isFinite(h)?h:void 0,waiting:s===void 0,ack:d?j(d,o.severity,p):String(i.attributes.id||"")}]}var Es={smoke:"crit",gas:"crit",carbon_monoxide:"crit",moisture:"crit",safety:"crit",heat:"crit",problem:"warn",tamper:"warn",battery:"warn",sound:"warn"};function Ts(i,t,e){if(!(t.visibility?!["unavailable","unknown"].includes(i.state):t.type?!Ii(i.state):as(i.state)))return[];let s=i.attributes,o=S(i.entity_id)==="binary_sensor";return[{kind:"generic",sev:o&&i.state==="on"?Es[s.device_class]:void 0,deviceClass:o&&typeof s.device_class=="string"&&!Array.isArray(s.entity_id)?s.device_class:void 0,title:e.name(i,t.name),message:e.members(i)||e.state(i),ts:x(i.last_changed,e.now),past:!0,ack:String(i.state)}]}var xt=[{name:"warning",icon:"mdi:alert-circle",fits:(i,t)=>Bi(i.attributes).length>0||S(i.entity_id)==="binary_sensor"&&(zi(i.attributes)||Re(t,i.entity_id)),show:Ss},{name:"waste",icon:"mdi:trash-can-outline",ahead:!0,fits:(i,t)=>Xt(t,i.entity_id)==="waste_collection_schedule",show:ds},{name:"calendar",icon:"mdi:calendar-month",ahead:!0,fits:i=>S(i.entity_id)==="calendar",show:Ui},{name:"update",icon:"mdi:rocket-launch",fits:i=>S(i.entity_id)==="update",show:hs},{name:"alarm",icon:"mdi:shield-alert",fits:i=>S(i.entity_id)==="alarm_control_panel",show:us},{name:"alert",icon:"mdi:alert",fits:i=>S(i.entity_id)==="alert",show:ps},{name:"timer",icon:"mdi:timer-outline",fits:i=>S(i.entity_id)==="timer",show:ms},{name:"attribute",icon:"mdi:card-text-outline",fits:i=>!!Pi(i.attributes),show:(i,t,e)=>Oi(i,t,e,"attribute")},{name:"event",icon:"mdi:eye-check",fits:i=>S(i.entity_id)==="event",show:vs},{name:"device",icon:"mdi:devices",fits:i=>!!Li[S(i.entity_id)],show:$s},{name:"next_alarm",icon:"mdi:alarm",ahead:!0,fits:i=>i.attributes["Time in Milliseconds"]!=null&&i.attributes.device_class==="timestamp",show:bs},{name:"countdown",icon:"mdi:timer-sand",ahead:!0,fits:i=>S(i.entity_id)==="sensor"&&i.attributes.device_class==="timestamp",show:gs},{name:"todo",icon:"mdi:clipboard-check-outline",ahead:!0,show:ks},{name:"picture",icon:"mdi:image-outline",show:(i,t,e)=>Oi(i,t,e,"picture")},{name:"generic",icon:"mdi:information-outline",fits:()=>!0,show:Ts}],Cs=Object.fromEntries(xt.map(i=>[i.name,i])),Yt=xt.map(i=>i.name),Hi=xt.filter(i=>i.ahead).map(i=>i.name),M={...Object.fromEntries(xt.map(i=>[i.name,i.icon])),system:"mdi:bell",repair:"mdi:wrench",group:"mdi:google-circles-communities",weather:"mdi:weather-partly-rainy"};function De(i,t,e){return i.type?i.type:i.attribute?"attribute":t?xt.find(n=>n.fits?.(t,e)).name:"generic"}var Xt=(i,t)=>i?.entities?.[t]?.platform||"",Re=(i,t)=>!!i?.services?.[Xt(i,t)]?.get_details;function Wi(i,t,e){if(!t)return[];let n=De(i,t,e.hass),s;try{s=Cs[n].show(t,i,e)}catch(l){return console.warn(`origami-notifications: ${t.entity_id} could not be shown`,l),[]}let o=t.entity_id,r=i.image&&(i.image.includes("/")?i.image:Mi(t.attributes,i.image)),a=i.tap_action&&i.tap_action.action!=="none"?{entity:o,tap_action:i.tap_action}:void 0,c=(i.actions||[]).map(l=>({label:l.label,action:{entity:o,tap_action:l.tap_action}}));return s.map(l=>{let h=i.image?r:l.image||Kt(t.attributes);return{key:`${n}:${o}${i.attribute?":"+i.attribute:""}`,entity:o,...l,icon:i.icon||l.icon,color:i.color&&i.color!=="state"?Ft(i.color):l.color,image:typeof h=="string"&&h?h:null,backdrop:!!i.background,tap:i.tap_action?a:l.tap,inert:i.tap_action?.action==="none",actions:[...l.actions||[],...c],stateObj:l.kind==="todo"?void 0:t}})}var q="origami-notifications",Pe=["daily","hourly","twice_daily"],At={updates:!0,repairs:!0,hide_when_empty:!0,vertical:!1,rotate:8,slide:"up"},Jt=i=>typeof i=="string"&&/^\w+\.\w+$/.test(i),qi={days:864e5,hours:36e5,minutes:6e4,seconds:1e3};function at(i){let t=NaN;if(typeof i=="number")t=i*6e4;else if(typeof i=="string"){let e=/^(\d+):(\d+)(?::(\d+(?:\.\d+)?))?$/.exec(i.trim());e&&(t=e[1]*36e5+e[2]*6e4+(e[3]||0)*1e3)}else A(i)&&Object.keys(i).length&&Object.keys(i).every(e=>e in qi)&&(t=Object.entries(i).reduce((e,[n,s])=>e+Number(s)*qi[n],0));return t>=0&&Number.isFinite(t)?t:NaN}var Os=i=>{throw new Error(`${q}: ${i}`)},v=(i,t)=>i||Os(t),$=(i,t)=>i==null||t(i),Fi=i=>$(i,A);function Ns(i){let t=typeof i=="string"?{entity:i}:A(i)?{...i}:null;return v(t&&Jt(t.entity),"entities must contain entity ids, got "+JSON.stringify(i)),v($(t.type,e=>Yt.includes(e)),`unknown type '${t.type}'`),v($(t.attribute,e=>typeof e=="string"),"attribute must be the name of an attribute"),v($(t.image,e=>typeof e=="string"),"image must be an attribute path or URL"),v($(t.background,e=>typeof e=="boolean"),"background must be true or false"),v($(t.color,e=>typeof e=="string"),"color must be a theme color like green, or a CSS color"),v($(t.visibility,Array.isArray),`visibility of ${t.entity} must be a list of conditions`),v($(t.before,e=>at(e)>=0),"before must be minutes or a duration like 1:30:00"),v(Fi(t.tap_action),"tap_action must be an action"),v($(t.actions,e=>Array.isArray(e)&&e.every(n=>A(n)&&typeof n.label=="string"&&A(n.tap_action))),"actions must be a list of buttons with a label and a tap_action"),{...t,lead:t.before==null?void 0:at(t.before)}}function Ms(i){let t=typeof i=="string"?{entity:i}:A(i)?{...i}:null;v(t&&Jt(t.entity),"infos must contain entity ids, got "+JSON.stringify(i)),v($(t.visibility,Array.isArray),`visibility of ${t.entity} must be a list of conditions`),v($(t.forecast_type,e=>Pe.includes(e)),"forecast_type must be daily, hourly or twice_daily");for(let e of["show_current","show_forecast","show_entity_picture"])v($(t[e],n=>typeof n=="boolean"),e+" must be true or false");v($(t.forecast_slots,e=>Number.isInteger(e)&&e>0),"forecast_slots must be a whole number above 0");for(let e of["tap_action","hold_action","double_tap_action"])v(Fi(t[e]),e+" must be an action");return t}function Ds(i){v($(i,A),"audience must map sources to only or except");for(let[t,e]of Object.entries(i||{})){let n=A(e)?["only","except"].filter(o=>o in e):[];v(n.length===1,`audience.${t} needs either only or except`);let s=e[n[0]];v(Array.isArray(s)&&s.every(o=>typeof o=="string"&&o.startsWith("person.")),`audience.${t}.${n[0]} must list person entities, e.g. person.anna`)}return i||{}}function Zt(i){v($(i.entities,Array.isArray),"entities must be a list"),v($(i.infos,Array.isArray),"infos must be a list"),v($(i.weather,e=>typeof e=="string"&&e.startsWith("weather.")),"weather must be a weather entity, e.g. weather.home"),v($(i.label,e=>typeof e=="string"),"label must be a label ID"),v($(i.css,e=>typeof e=="string"),"css must be a string"),v($(i.rotate,e=>typeof e=="number"&&e>=0),"rotate must be the seconds between turns, or 0 to turn them off"),v($(i.slide,e=>e==="up"||e==="side"),"slide must be up or side");for(let e of["updates","repairs","hide_when_empty","vertical"])v($(i[e],n=>typeof n=="boolean"),e+" must be true or false");let t=[];for(let e of i.entities||[]){let n=Ns(e);t.some(s=>s.entity===n.entity)||t.push(n)}return{...At,...i,entities:t,infos:(i.infos||[]).map(Ms),audience:Ds(i.audience)}}var Vi=new Map;function Ki(i,t,e){let n=t.entity_id,s=t.attributes.id||t.last_changed,o=Vi.get(n);if(o?.warning!==s){if(!Re(i,n))return Object.keys(i.services||{}).length?null:void 0;o={warning:s,data:void 0,waiting:new Set},Vi.set(n,o);let r=a=>{o.data=A(a)?a:null,o.waiting.forEach(c=>c()),o.waiting.clear()};Promise.resolve().then(()=>i.callService(Xt(i,n),"get_details",{},{entity_id:n},!1,!0)).then(a=>r(a?.response?.[n]),()=>r(null))}return o.data===void 0&&o.waiting.add(e),o.data}var Le="origami-notifications-ack",Rs=64,Ps=1e4,J=null,Ie=new Map;function Gi(){if(!J)try{let i=JSON.parse(localStorage.getItem(Le)||"{}");J=i&&typeof i=="object"&&!Array.isArray(i)?i:{}}catch{J={}}return J}function Yi(){let i=new Set([...Ie.values()].flatMap(n=>[...n])),t=Object.keys(J),e=[...t.filter(n=>!i.has(n)),...t.filter(n=>i.has(n))];for(let n of e.slice(0,Math.max(t.length-Rs,0)))delete J[n];try{localStorage.setItem(Le,JSON.stringify(J))}catch{}}var Ue=new Set,Xi=i=>Ue.forEach(t=>t!==i&&t());window.addEventListener("storage",i=>{i.key===Le&&(J=null,Xi())});var Qt=class{constructor(t){this.onChange=t,this.pending=new Map}connect(){Ue.add(this.onChange)}disconnect(){Ue.delete(this.onChange),Ie.delete(this)}apply(t,e,n,s){let o=Gi(),r=new Set(t.map(h=>h.key)),a=!1,c=h=>{o[h]!==void 0&&(delete o[h],a=!0)};for(let[h,d]of this.pending)!r.has(h)||d<=n?this.pending.delete(h):Number.isFinite(d)&&s(d);let l=[];for(let h of t){if(this.pending.has(h.key))continue;if(h.waiting){o[h.key]===void 0&&l.push({...h,ack:void 0});continue}if(h.dismiss||h.ack===void 0){l.push(h);continue}let d=h.once?h.ack:j(h.ack,h.ts);o[h.key]!==d&&(c(h.key),l.push({...h,signature:d}))}for(let h of e)r.has(h)||c(h);return Ie.set(this,r),a&&Yi(),l}dismiss(t,e){let n=Gi(),s=!1;for(let o of t.flatMap(r=>r.members||[r]))if(o.signature)n[o.key]=o.signature,s=!0;else if(o.dismiss){let{key:r}=o;this.pending.set(r,1/0),e(o.dismiss).then(()=>{this.pending.get(r)===1/0&&(this.pending.set(r,Date.now()+Ps),this.onChange())},a=>{console.warn(`origami-notifications: Home Assistant kept ${r}`,a),this.pending.delete(r)&&this.onChange()})}s&&(Yi(),Xi(this.onChange)),this.onChange()}},te=i=>!!(i.dismiss||i.signature||i.members?.every(t=>t.signature));var ee=class{constructor(t,e){this.head=t,this.on=e,this.press=null,this.suppress=!1,this.tapWait=null,t.addEventListener("pointerdown",n=>this.down(n)),t.addEventListener("pointermove",n=>this.move(n)),t.addEventListener("pointerup",n=>this.up(n,!1)),t.addEventListener("pointercancel",n=>n!==this.ownCancel&&this.up(n,!0)),t.addEventListener("pointerleave",n=>!this.press?.drag&&this.up(n,!0)),t.parentElement.addEventListener("click",n=>this.click(n),!0),t.addEventListener("keydown",n=>this.key(n))}down(t){if(t.button>0||!t.isPrimary)return;this.suppress=!1;let e={id:t.pointerId,x:t.clientX,y:t.clientY,t:t.timeStamp,dx:0,drag:!1},n=this.on.holdAction();n&&(e.timer=setTimeout(()=>{this.suppress=!0,n()},500)),this.press=e}move(t){let e=this.press;if(!e||t.pointerId!==e.id)return;let n=t.clientX-e.x,s=t.clientY-e.y;if(!e.drag){if(Math.hypot(n,s)>10&&clearTimeout(e.timer),!this.on.canDrag()||Math.abs(n)<10||Math.abs(n)<Math.abs(s)*1.5)return;e.drag=!0,this.suppress=!0,this.head.setPointerCapture?.(e.id),this.ownCancel=new PointerEvent("pointercancel",{pointerId:t.pointerId,pointerType:t.pointerType,isPrimary:!0}),this.head.dispatchEvent(this.ownCancel)}e.dx=n,this.on.drag(n)}up(t,e){let n=this.press;if(!n||t.pointerId!==n.id||(this.press=null,clearTimeout(n.timer),!n.drag))return;let s=Math.abs(n.dx)/Math.max(t.timeStamp-n.t,1)>.5,o=!e&&(Math.abs(n.dx)>48||s);this.on.dragEnd(o?Math.sign(-n.dx)*(this.on.rtl()?-1:1):0)}click(t){if(this.head.contains(t.target)){if(this.suppress){this.suppress=!1,t.stopPropagation();return}this.activate()}}activate(){let t=this.on.doubleTapAction();if(!t)return this.on.tap();if(this.tapWait)return clearTimeout(this.tapWait),this.tapWait=null,t();this.tapWait=setTimeout(()=>{this.tapWait=null,this.on.tap()},250)}key(t){let e={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[t.key];e&&this.on.canDrag()?(t.preventDefault(),this.on.step(t.key.startsWith("ArrowL")||t.key.startsWith("ArrowR")?e*(this.on.rtl()?-1:1):e)):(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),this.activate())}reset(){this.press&&clearTimeout(this.press.timer),this.press=null,clearTimeout(this.tapWait),this.tapWait=null}};var Ji={daily:1,hourly:2,twice_daily:4},St={hourly:36e5,twice_daily:12*36e5,daily:24*36e5},Et=(i,t)=>!!(Ji[t]&&Number(i?.attributes.supported_features)&Ji[t]),ie=i=>["hourly","twice_daily","daily"].find(t=>Et(i,t))||null,en=new Set(["rainy","pouring","lightning","lightning-rainy","snowy","snowy-rainy","hail"]),nn=(i,t)=>en.has(i.condition)||Number(i.precipitation)>=(t==="in"?.01:.2)||Number(i.precipitation_probability)>=60;function Zi(i,t,e){let n=String(i||"");return n.startsWith("lightning")?"thunder":n==="hail"?"hail":n.startsWith("snowy")||t!=null&&t!==""&&Number(t)<=e?"snow":"rain"}var Qi={rain:"mdi:weather-rainy",snow:"mdi:weather-snowy",thunder:"mdi:weather-lightning",hail:"mdi:weather-hail",frost:"mdi:snowflake-thermometer"},Is={rain:"rainy",snow:"snowy",thunder:"lightning",hail:"hail",frost:"snowy"},tn=i=>kt("weather",null,Is[i],!0);function sn(i,t,e,n){let s=i.entity_id,o=i.attributes,r=n.t,a=o.temperature_unit==="\xB0F",c=e==="hourly"||e==="twice_daily"?t.filter(u=>Date.parse(u.datetime)+St[e]>n.now):[],l=n.openWindows(),h=[],d=(u,f,_,y,m)=>h.push({key:`wx:${s}:wet`,kind:"weather",entity:s,icon:Qi[u],color:tn(u),sev:l?"warn":void 0,title:f,message:_,ts:y,past:m,once:!m,ack:u+(l?" open":"")});if(en.has(i.state)){let u=Zi(i.state,o.temperature,a?34:1);l&&d(u,r[`wx_${u}_now`],n.alikeTitle("window",l),x(i.last_changed,n.now),!0)}else{let u=c.find(f=>Date.parse(f.datetime)<n.now+6*36e5&&nn(f,o.precipitation_unit));if(u){let f=Math.max(Date.parse(u.datetime),n.now),_=Zi(u.condition,u.temperature,a?34:1),y=u.precipitation_probability==null?NaN:Number(u.precipitation_probability),m=l?n.alikeTitle("window",l):Number.isFinite(y)?k(r.wx_chance,{p:n.clock.percent(y)}):"";d(_,k(r[`wx_${_}_from`],{t:n.clock.hour(f)}),m,f,!1)}}let p=a?32:0;if(c.length&&o.temperature!=null&&Number(o.temperature)>p){let u=c.filter(_=>Date.parse(_.datetime)<n.now+18*36e5&&_.temperature!=null&&Number.isFinite(Number(_.temperature))),f=u.find(_=>Number(_.temperature)<p);if(f){let _=Math.max(Date.parse(f.datetime),n.now),y=Math.min(...u.map(m=>Number(m.temperature)));h.push({key:`wx:${s}:frost`,kind:"weather",entity:s,icon:Qi.frost,color:tn("frost"),title:k(r.wx_frost_from,{t:n.clock.hour(_)}),message:k(r.wx_low,{v:n.attr(i,"temperature",y)}),ts:_,once:!0,ack:"frost"})}}return c.length&&n.wake(Math.floor(n.now/36e5)*36e5+36e5),h}var Us=[[5,"morning"],[12,"afternoon"],[17,"evening"],[22,"night"]],Ls=["lightning-rainy","lightning","hail","snowy-rainy","snowy","pouring","rainy"];function js(i,t){let e=i.filter(s=>nn(s,t));if(e.length)return Ls.find(s=>e.some(o=>o.condition===s))||"rainy";let n=new Map;for(let s of i)s.condition&&n.set(s.condition,(n.get(s.condition)||0)+1);return[...n].sort((s,o)=>o[1]-s[1])[0]?.[0]}function on(i,t,e,n){let s=n.t,o=n.clock.zone,r=n.dayOf(n.now),a=(h,d)=>nt(`${st(h)} ${String(d).padStart(2,"0")}:00:00`,o),c=ht(n.now,o).hour>=17,l=[];if(e==="daily"){let h=c?r+1:r;l.push({label:n.clock.slotLabel(a(h,12),"daily",n.now),start:Math.max(a(h,0),n.now),end:a(h+1,0)})}else{let h=[r,r+1].flatMap(u=>Us.map(([f,_])=>({name:_,day:u,start:a(u,f)})));h.forEach((u,f)=>u.end=h[f+1]?.start??a(r+2,5));let d=h.find(u=>u.start>n.now),p={morning:d.day===r?s.wx_this_morning:s.wx_tomorrow_morning,afternoon:s.wx_this_afternoon,evening:s.wx_this_evening,night:s.wx_tonight};c&&d.day>r||l.push({label:p[d.name],start:d.start,end:d.end,night:d.name==="night"}),c&&l.push({label:n.clock.slotLabel(a(r+1,12),"daily",n.now),start:a(r+1,5),end:a(r+1,22)}),n.wake(d.start)}return n.wake(a(r,17)),n.wake(n.midnight),l.map(h=>{let d=t.filter(b=>{let E=Date.parse(b?.datetime);return E<h.end&&E+St[e]>h.start});if(!d.length)return null;let p=d.flatMap(b=>[b.temperature,b.templow]).filter(b=>b!=null&&b!==""&&Number.isFinite(Number(b))).map(b=>Math.round(Number(b))),[u,f]=[Math.min(...p),Math.max(...p)],_=p.length?u===f?n.clock.number(f)+"\xB0":k(s.wx_range,{lo:n.clock.number(u),hi:n.clock.number(f)}):"",y=js(d,i.attributes.precipitation_unit),m={...i,state:y||"unknown"};return{label:h.label,condition:y,night:h.night,text:[y?n.state(m):"",_].filter(Boolean).join(" \xB7 ")}}).filter(Boolean)}var rn=i=>Object.keys(i).filter(t=>{let e=i[t]?.attributes;return e?.device_class==="window"&&!Array.isArray(e.entity_id)&&/^(binary_sensor|cover)\./.test(t)}),an=i=>i&&(i.entity_id.startsWith("binary_sensor.")?i.state==="on":!["closed","unavailable","unknown"].includes(i.state));var zs={sunny:"mdi:weather-night",partlycloudy:"mdi:weather-night-partly-cloudy"},Bs=(i,t)=>i.entity.startsWith("weather.")&&i.show_forecast!==!1&&Et(t,i.forecast_type);function cn(i,t,e,n,s){if(i.hide_when_empty!==!1)return i.infos;let o=new Set(i.infos.map(c=>c.entity)),r=[],a=i.weather&&e.states[i.weather];if(a&&!o.has(i.weather)&&n(i.weather)){let c=ie(a);r.push({entity:i.weather,state_content:["state","temperature"],...c?{forecast_type:c,outlook:!0}:{}})}for(let c of t){let l=e.states[c.entity];!c.entity.startsWith("calendar.")||o.has(c.entity)||s.has(c.entity)||!n(c.entity)||l?.state==="off"&&!U(l.attributes.message)&&r.push({entity:c.entity,name:c.name,icon:c.icon,color:c.color})}return[...i.infos,...r]}function je(i,t,e,n){return[].concat(t??"state").map(o=>{if(o==="state")return n.state(i);if(o==="name")return e;if(/^last[_-](changed|updated)$/.test(o))return n.clock.relative(x(i[o.replace("-","_")],n.now),n.now);let r=i.attributes[o];if(r==null)return"";let a=P(r,n.clock.server);return Number.isFinite(a)?n.clock.relative(a,n.now):n.attr(i,o,r)}).filter(Boolean).join(" \xB7 ")||n.state(i)}function Hs(i,t,e,n){let s=[i.temperature,i.templow].filter(r=>r!=null&&r!==""&&Number.isFinite(Number(r))).map(r=>n.clock.number(Number(r))+"\xB0").join(" / ");return[e==="twice_daily"?i.is_daytime===!1?n.t.wx_night:n.t.wx_day:"",s,i.condition?n.state(t):""].filter(Boolean).join(" \xB7 ")}function Ws(i,t,e){if(!Bs(i,t))return null;let n=i.forecast_type,s=e.forecast(i.entity,n);if(!s)return[];if(i.outlook)return on(t,s,n,e);let o=e.dayOf(e.now),r=s.filter(a=>Number.isFinite(Date.parse(a?.datetime))).filter(a=>n==="daily"?e.dayOf(Date.parse(a.datetime))>=o:Date.parse(a.datetime)+St[n]>e.now).slice(0,i.forecast_slots||1);return r.length?(e.wake(e.midnight),n!=="daily"&&e.wake(Date.parse(r[0].datetime)+St[n]),r.map(a=>({label:e.clock.slotLabel(Date.parse(a.datetime),n,e.now),condition:a.condition,night:a.is_daytime===!1,text:Hs(a,{...t,state:a.condition||"unknown"},n,e)}))):null}function ln(i,t){let e=[],n=new Set;for(let s of i){t.watch(s.entity);let o=t.hass.states[s.entity];if(!o||o.state==="unavailable"||o.state==="unknown"||!t.conditionsMet(s.visibility,s.entity))continue;let r="info:"+s.entity;for(;n.has(r);)r+="+";n.add(r);let a=s.color&&s.color!=="state",c=y=>a?ot(y)?Ft(s.color):"var(--state-inactive-color)":qt(y),l=t.name(o,s.name),h={kind:"info",info:s,entity:s.entity,row:r,name:l,icon:s.icon,image:s.show_entity_picture?Kt(o.attributes):null},d=Ws(s,o,t),u=S(s.entity)==="calendar"&&!U(o.attributes.message),f=A(s.name)||!U(s.name)?l:"",_={...h,key:r,stateObj:o,title:l,color:c(u?{...o,state:"on"}:o)};u&&Object.assign(_,f?{content:s.state_content??["message","start_time"]}:{title:o.attributes.message,content:s.state_content??["start_time"]}),(!d||s.show_current!==!1)&&e.push(_),(d||[]).forEach((y,m)=>{let b={...o,state:y.condition||"unknown"};e.push({...h,key:`${r}#${m}`,stateObj:b,title:f||y.label,text:[f?y.label:"",y.text].filter(Boolean).join(" \xB7 "),icon:s.icon||y.night&&zs[y.condition]||void 0,color:c(b)})})}return e}var qs=new Set(["state","numeric_state","screen","user","location","time","view_columns"]),dn={and:i=>i.every(Boolean),or:i=>i.some(Boolean),not:i=>!i.every(Boolean)},Fs=["sun","mon","tue","wed","thu","fri","sat"],ze=i=>i==null?[]:Array.isArray(i)?i:[i],hn=i=>!(A(i)&&i.enabled===!1),un=i=>{let[t,e,n]=String(i).split(":").map(s=>parseInt(s,10));return t*3600+e*60+(n||0)},Be=i=>String(i).padStart(2,"0"),Vs=(i,t,e)=>t>=864e5/1e3?Y(i+1,e):nt(`${st(i)}T${Be(Math.floor(t/3600))}:${Be(Math.floor(t/60)%60)}:${Be(t%60)}`,e);function Ks(i,t){let e=ht(t.now,t.zone),n=C(t.now,t.zone),s=e.hour*3600+e.minute*60+e.second,o=i.after?un(i.after):null,r=i.before?un(i.before):null;for(let a of[o,r==null?null:r+1])a!=null&&[n,n+1].forEach(c=>t.wake(Vs(c,a,t.zone)));return t.wake(Y(n+1,t.zone)),i.weekdays?.length&&!i.weekdays.includes(Fs[new Date(n*864e5).getUTCDay()])?!1:o!=null&&r!=null?r<o?s>=o||s<=r:s>=o&&s<=r:o!=null?s>=o:r==null||s<=r}function pn(i,t,e){let{hass:n}=e,s=!1,o=l=>(e.watch(l),n.states[l]),r=l=>Jt(l)&&n.states[l]?o(l).state:void 0,a=l=>{if(!A(l)||"enabled"in l&&typeof l.enabled!="boolean")return!1;let h=l.condition??"state";if(dn[h])return l.conditions==null||dn[h](ze(l.conditions).filter(hn).map(a));if("entity_id"in l||!qs.has(h)){let _=e.server(l);return s||=_.failed,_.result}if(h==="screen")return!!l.media_query&&e.media(l.media_query);if(h==="user")return!!(n.user?.id&&l.users?.includes(n.user.id));if(h==="view_columns")return!0;if(h==="time")return Ks(l,e);if(h==="location"){let _=Object.values(n.states).find(y=>y.entity_id.startsWith("person.")&&y.attributes.user_id===n.user?.id);return _&&e.watch(_.entity_id),!!(_&&l.locations?.includes(_.state))}let d=o(l.entity||t),p=d&&l.attribute?d.attributes[l.attribute]:d?.state;if(h==="numeric_state"){let _=Number(p),y=m=>Number(typeof m=="string"?r(m)??m:m);return!Number.isNaN(_)&&(l.above==null||!(y(l.above)>=_))&&(l.below==null||!(y(l.below)<=_))}let u=l.state??l.state_not;return u===void 0?!1:ze(u).flatMap(_=>r(_)!==void 0?[_,r(_)]:[_]).includes(String(p??"unknown"))===(l.state!=null)};return ze(i).filter(hn).map(a).every(Boolean)&&!s}var He=i=>i.length>4?`${i.slice(0,4).join(", ")} +${i.length-4}`:i.join(", "),mn=i=>i.kind==="generic"&&i.deviceClass&&!i.image&&!i.tap&&!i.actions.length;function Gs(i,t){let e=i.entities?.[t],n=e?.device_id&&i.devices?.[e.device_id];return i.areas?.[e?.area_id||n?.area_id]?.name||""}function fn(i,t){let e=new Map;for(let s of i.filter(mn))e.has(s.deviceClass)||e.set(s.deviceClass,[]),e.get(s.deviceClass).push(s);let n=[];for(let s of i){let o=mn(s)?e.get(s.deviceClass):null;!o||o.length<2?n.push(s):o[0]===s&&n.push(Ys(s.deviceClass,o,t))}return n}function Ys(i,t,e){let n=[...t].sort((o,r)=>r.ts-o.ts),s=[...new Set(n.map(o=>Gs(e.hass,o.entity)||o.title))];return{key:"group:"+i,kind:"group",sev:n[0].sev,title:e.alikeTitle(i,t.length),message:He(s),ts:n[0].ts,past:!0,icon:n[0].icon,stateObj:n[0].stateObj,members:n,actions:[]}}var _n={en:{idle_title:"All quiet",idle_msg:"No notifications",clear:"Clear all",dismiss:"Dismiss",install:"Install",installing:"Installing",installing_pct:"Installing ({p}%)",just_now:"just now",soon:"in a moment",count_one:"1 notification",count_other:"{n} notifications",event:"Event",notification:"Notification",update:"Update",update_msg:"Update {v} available",update_msg_plain:"Update available",level:"Level {l}",breaks_in:"Stops working in {v}",day_at:"{d} at {t}",date_at:"on {d} at {t}",on_date:"on {d}",paused_left:"Paused, {t} left",ends_at:"Ends at {t}",act_pause:"Pause",act_resume:"Resume",act_cancel:"Cancel",act_lock:"Lock",act_close_cover:"Close",act_close_valve:"Close",act_dock_vacuum:"Dock",act_dock_mower:"Dock",act_off:"Turn off",act_done:"Done",next_alarm:"Alarm",wx_rain_from:"Rain from {t}",wx_snow_from:"Snow from {t}",wx_thunder_from:"Thunderstorms from {t}",wx_hail_from:"Hail from {t}",wx_rain_now:"It is raining",wx_snow_now:"It is snowing",wx_thunder_now:"Thunderstorm",wx_hail_now:"Hail",wx_chance:"{p} chance",wx_frost_from:"Frost from {t}",wx_low:"Low of {v}",wx_day:"Day",wx_night:"Night",wx_this_morning:"This morning",wx_tomorrow_morning:"Tomorrow morning",wx_this_afternoon:"This afternoon",wx_this_evening:"This evening",wx_tonight:"Tonight",wx_range:"{lo} to {hi}\xB0"},de:{idle_title:"Alles ruhig",just_now:"gerade eben",soon:"gleich",count_one:"1 Benachrichtigung",count_other:"{n} Benachrichtigungen",event:"Termin",notification:"Benachrichtigung",update_msg:"Update {v} verf\xFCgbar",update_msg_plain:"Update verf\xFCgbar",level:"Stufe {l}",breaks_in:"Funktioniert ab {v} nicht mehr",day_at:"{d} um {t}",date_at:"am {d} um {t}",on_date:"am {d}",paused_left:"Pausiert, noch {t}",ends_at:"Endet um {t}",act_done:"Erledigt",next_alarm:"Wecker",wx_rain_from:"Regen ab {t}",wx_snow_from:"Schnee ab {t}",wx_thunder_from:"Gewitter ab {t}",wx_hail_from:"Hagel ab {t}",wx_rain_now:"Es regnet",wx_snow_now:"Es schneit",wx_thunder_now:"Gewitter",wx_hail_now:"Hagel",wx_chance:"{p} Wahrscheinlichkeit",wx_frost_from:"Frost ab {t}",wx_low:"Tiefstwert {v}",wx_this_morning:"Heute Vormittag",wx_tomorrow_morning:"Morgen fr\xFCh",wx_this_afternoon:"Heute Nachmittag",wx_this_evening:"Heute Abend",wx_tonight:"Heute Nacht",wx_range:"{lo} bis {hi}\xB0"}},Xs={just_now:null,soon:null,day_at:"{d}, {t}",date_at:"{d}, {t}",on_date:"{d}",paused_left:"{s}, {t}",ends_at:"{s}, {t}"},Js={idle_msg:["ui.notification_drawer.empty"],clear:["ui.notification_drawer.dismiss_all"],dismiss:["ui.card.persistent_notification.dismiss"],install:["ui.dialogs.more_info_control.update.install"],installing:["ui.card.update.installing"],installing_pct:["ui.card.update.installing_with_progress",{progress:"{p}"}],update:["ui.dialogs.more_info_control.update.update"],act_pause:["ui.card.timer.actions.pause"],act_resume:["ui.card.timer.actions.start"],act_cancel:["ui.card.timer.actions.cancel"],act_lock:["ui.card.lock.lock"],act_close_cover:["ui.card.cover.close_cover"],act_close_valve:["ui.card.valve.close_valve"],act_dock_vacuum:["ui.card.vacuum.actions.return_to_base"],act_dock_mower:["ui.card.lawn_mower.actions.dock"],act_off:["ui.card.common.turn_off"],wx_day:["ui.card.weather.day"],wx_night:["ui.card.weather.night"]},Zs={rain:"rainy",snow:"snowy",thunder:"lightning",hail:"hail"},We=i=>String(i).split("-")[0],ne=i=>i?.locale?.language||i?.language||"en";function wn(i,t){let e=_n[We(i)],n={..._n.en,...e||Xs},s=(o,r)=>typeof t=="function"&&t(o,r)||"";for(let[o,[r,a]]of Object.entries(Js))n[o]=s(r,a)||n[o];if(!e){let o=s("ui.notification_drawer.title");o&&(n.count_one=n.count_other=o+" ({n})");for(let[r,a]of Object.entries(Zs)){let c=s("component.weather.entity_component._.state."+a);c&&Object.assign(n,{[`wx_${r}_now`]:c,[`wx_${r}_from`]:c+", {t}"})}}return n}var Qs={en:{window:{one:"1 window open",other:"{n} windows open"},door:{other:"{n} doors open"},garage_door:{other:"{n} garage doors open"},opening:{other:"{n} sensors open"},battery:{other:"{n} batteries low"},moisture:{other:"{n} water alarms"},smoke:{other:"{n} smoke alarms"},gas:{other:"{n} gas alarms"},carbon_monoxide:{other:"{n} CO alarms"},heat:{other:"{n} heat alarms"},problem:{other:"{n} problems"},tamper:{other:"{n} tamper alerts"},safety:{other:"{n} safety alerts"},sound:{other:"{n} sounds detected"}},de:{window:{one:"1 Fenster offen",other:"{n} Fenster offen"},door:{other:"{n} T\xFCren offen"},garage_door:{other:"{n} Garagentore offen"},opening:{other:"{n} Sensoren offen"},battery:{other:"{n} Batterien schwach"},moisture:{other:"{n} Wassermelder ausgel\xF6st"},smoke:{other:"{n} Rauchmelder ausgel\xF6st"},gas:{other:"{n} Gasmelder ausgel\xF6st"},carbon_monoxide:{other:"{n} CO-Melder ausgel\xF6st"},heat:{other:"{n} Hitzemelder ausgel\xF6st"},problem:{other:"{n} Probleme"},tamper:{other:"{n} Sabotagealarme"},safety:{other:"{n} Sicherheitswarnungen"},sound:{other:"{n} Ger\xE4usche erkannt"}}};function vn(i,t,e,n){let s=Qs[We(i)]?.[t];return s?k(e===1&&s.one?s.one:s.other,{n:e}):`${typeof n=="function"&&n(`component.binary_sensor.entity_component.${t}.name`)||qe(t)} (${e})`}function qe(i){let t=String(i).replace(/[_-]+/g," ").trim();return t.charAt(0).toUpperCase()+t.slice(1)}var gn={en:{label:"Include entities by label",weather:"Weather",updates:"Pending updates",repairs:"Repairs",hide_when_empty:"Hide when there is nothing to show",infos:"Infos",info_options:"Info options",rotate:"Seconds between turns",slide:"Turn",slide_up:"Upwards",slide_side:"Sideways",options:"Entity options",type:"Kind",image:"Picture",background:"Picture as card background",before:"Show ahead of time",audience:"Who sees what",styling:"Styling",css:"CSS",visible:"Visible to",people:"People",system:"System notifications",everyone:"Everyone",only:"Only these people",except:"Everyone except these people",nobody:"Nobody",only_x:"Only {x}",except_x:"Everyone except {x}",type_auto:"Detect automatically",type_calendar:"Calendar event",type_update:"Update",type_alarm:"Alarm panel",type_alert:"Alert",type_timer:"Timer",type_countdown:"Countdown",type_next_alarm:"Next alarm",type_waste:"Waste collection",type_event:"Event",type_todo:"To-do list",type_device:"Device",type_warning:"Warnings",type_attribute:"Details from an attribute",type_picture:"State as title",type_generic:"Plain entity",entities:"Entities",name:"Name",icon:"Icon",attribute:"Attribute",tap_action:"Tap behavior",hold_action:"Hold behavior",double_tap_action:"Double tap behavior",color:"Color",state_content:"State content",time_format:"Time format",show_entity_picture:"Show entity picture",visibility:"Visibility",content_layout:"Content layout",horizontal:"Horizontal",vertical:"Vertical",forecast:"Weather to show",show_both:"Current weather and forecast",show_current:"Only the current weather",show_forecast:"Only the forecast",forecast_type:"Forecast",forecast_slots:"Forecasts to show",daily:"Daily",hourly:"Hourly",twice_daily:"Twice daily"},de:{label:"Entit\xE4ten mit diesem Label einbeziehen",weather:"Wetter",updates:"Ausstehende Updates",repairs:"Reparaturen",hide_when_empty:"Ausblenden, wenn nichts anliegt",infos:"Infos",info_options:"Optionen je Info",rotate:"Sekunden bis zum Wechsel",slide:"Wechsel",slide_up:"Nach oben",slide_side:"Seitlich",options:"Optionen je Entit\xE4t",type:"Art",image:"Bild",background:"Bild als Kartenhintergrund",before:"Im Voraus zeigen",audience:"Wer sieht was",styling:"Gestaltung",css:"CSS",visible:"Sichtbar f\xFCr",people:"Personen",system:"Systembenachrichtigungen",everyone:"Alle",only:"Nur diese Personen",except:"Alle au\xDFer diesen Personen",nobody:"Niemand",only_x:"Nur {x}",except_x:"Alle au\xDFer {x}",type_auto:"Automatisch erkennen",type_calendar:"Kalendertermin",type_update:"Update",type_alarm:"Alarmanlage",type_alert:"Alarm (alert)",type_timer:"Timer",type_countdown:"Countdown",type_next_alarm:"N\xE4chster Wecker",type_waste:"M\xFCllabfuhr",type_event:"Ereignis",type_todo:"To-do-Liste",type_device:"Ger\xE4t",type_warning:"Warnungen",type_attribute:"Details aus einem Attribut",type_picture:"Zustand als Titel",type_generic:"Einfache Entit\xE4t"}},yn={entities:"ui.panel.lovelace.editor.card.generic.entities",name:"ui.panel.lovelace.editor.card.generic.name",icon:"ui.panel.lovelace.editor.card.generic.icon",attribute:"ui.panel.lovelace.editor.card.generic.attribute",tap_action:"ui.panel.lovelace.editor.card.generic.tap_action",hold_action:"ui.panel.lovelace.editor.card.generic.hold_action",double_tap_action:"ui.panel.lovelace.editor.card.generic.double_tap_action",color:"ui.panel.lovelace.editor.card.tile.color",state_content:"ui.panel.lovelace.editor.card.tile.state_content",time_format:"ui.panel.lovelace.editor.card.generic.time_format",show_entity_picture:"ui.panel.lovelace.editor.card.tile.show_entity_picture",visibility:"ui.panel.lovelace.editor.card.heading.entity_config.visibility",visibility_intro:"ui.panel.lovelace.editor.card.heading.entity_config.visibility_explanation",content_layout:"ui.panel.lovelace.editor.card.tile.content_layout",horizontal:"ui.panel.lovelace.editor.card.tile.content_layout_options.horizontal",vertical:"ui.panel.lovelace.editor.card.tile.content_layout_options.vertical",forecast:"ui.panel.lovelace.editor.card.weather-forecast.weather_to_show",show_both:"ui.panel.lovelace.editor.card.weather-forecast.show_both",show_current:"ui.panel.lovelace.editor.card.weather-forecast.show_only_current",show_forecast:"ui.panel.lovelace.editor.card.weather-forecast.show_only_forecast",forecast_type:"ui.panel.lovelace.editor.card.weather-forecast.forecast_type",forecast_slots:"ui.panel.lovelace.editor.card.weather-forecast.forecast_slots",daily:"ui.panel.lovelace.editor.card.weather-forecast.daily",hourly:"ui.panel.lovelace.editor.card.weather-forecast.hourly",twice_daily:"ui.panel.lovelace.editor.card.weather-forecast.twice_daily"},bn={en:{label:"Every entity with this label is added and detected automatically.",weather:"Shows rain, snow and frost ahead.",visible:"Applies outside edit mode, like Home Assistant's own card visibility.",people:"Matches the user account linked to each person in Settings \u2192 People.",attribute:"An attribute that holds an object with a name or title, or a plain value. If empty, the card looks for an object with a description or a picture.",attribute_picture:"An attribute that holds an object with a name or title. The object is shown instead of the state.",image:"An attribute, a path into one like book.cover, or a URL. If empty, the card uses the picture of the shown object or of the entity.",background:"Blurred behind the card while this entity is on top.",before:"How long before it starts or is due.",infos:"Shown in turn after what needs attention.",rotate:"At 0 the card holds still.",css:"Goes into the card after its own styles, so you can change any part of it.",visibility_intro:"It shows while all of these conditions hold.",row_tap_action:"What a tap on its row in the list does. A tap on the closed card opens the list, or does this when it is the only entry."},de:{label:"Jede Entit\xE4t mit diesem Label kommt dazu und wird automatisch erkannt.",weather:"Zeigt Regen, Schnee und Frost im Voraus.",visible:"Gilt au\xDFerhalb des Bearbeitungsmodus, wie die Sichtbarkeit von Home Assistant selbst.",people:"Verglichen wird das Benutzerkonto, das unter Einstellungen \u2192 Personen verkn\xFCpft ist.",attribute:"Ein Attribut, das ein Objekt mit name oder title enth\xE4lt, oder ein einfacher Wert. Bleibt es leer, sucht die Karte ein Objekt mit description oder Bild.",attribute_picture:"Ein Attribut, das ein Objekt mit name oder title enth\xE4lt. Das Objekt erscheint statt des Zustands.",image:"Ein Attribut, ein Pfad darin wie book.cover, oder eine URL. Bleibt es leer, nimmt die Karte das Bild des gezeigten Objekts oder der Entit\xE4t.",background:"Unscharf hinter der Karte, solange diese Entit\xE4t oben steht.",before:"Wie lange vor dem Beginn oder der F\xE4lligkeit.",infos:"Erscheinen im Wechsel nach dem, was anliegt.",rotate:"Bei 0 bleibt die Karte stehen.",css:"Kommt nach den Styles der Karte, so l\xE4sst sich jeder Teil \xE4ndern.",visibility_intro:"Es erscheint, solange alle diese Bedingungen erf\xFCllt sind.",row_tap_action:"Was ein Tippen auf seine Zeile in der Liste tut. Ein Tippen auf die geschlossene Karte \xF6ffnet die Liste, oder tut dies, wenn es der einzige Eintrag ist."}};function kn(i,t){let e=We(i),n=s=>s&&typeof t=="function"&&t(s)||"";return{label:s=>n(yn[s])||gn[e]?.[s]||gn.en[s]||s,helper:s=>s==="visibility_intro"&&n(yn[s])||bn[e]?.[s]||bn.en[s]}}function $n(i,t){return[...i.values()].map(e=>{let n=Ti(e.message);return{key:"s:"+e.notification_id,kind:"system",title:ut(e.title)||t.t.notification,message:ut(e.message),image:Ci(e.message),ts:x(e.created_at,t.now),past:!0,seq:e.seq,tap:n?$t(n):void 0,dismiss:{service:["persistent_notification","dismiss",{notification_id:e.notification_id}]}}})}var to={critical:"crit",error:"crit",warning:"warn"};function xn(i,t){let e=(n,s)=>t.hass.localize?.(n,s)||"";return i.map(n=>{let s=n.translation_key||n.issue_id;return{key:`i:${n.domain}/${n.issue_id}`,kind:"repair",sev:to[n.severity]||"warn",title:e(`component.${n.domain}.issues.${s}.title`,n.translation_placeholders||{})||qe(s),message:n.breaks_in_ha_version?k(t.t.breaks_in,{v:n.breaks_in_ha_version}):e(`component.${n.issue_domain||n.domain}.title`),ts:x(n.created,t.now),past:!0,tap:$t("/config/repairs"),dismiss:{ws:{type:"repairs/ignore_issue",domain:n.domain,issue_id:n.issue_id,ignore:!0}}}})}var eo=(i,t)=>!i||(i.only?i.only.includes(t):!i.except.includes(t)),Fe=(i,t)=>!i.past&&i.ts>t,Ve=i=>(t,e)=>typeof e=="string"&&e||i.formatEntityName?.(t,e||void 0)||t.attributes.friendly_name||t.entity_id,Ke=i=>({state:t=>i.formatEntityState?i.formatEntityState(t):String(t.state),attr:(t,e,n)=>!e.includes(".")&&i.formatEntityAttributeValue?.(t,e,n)||String(n)}),io=i=>Array.isArray(i.attributes.entity_id)&&!i.entity_id.startsWith("sensor.")?i.attributes.entity_id.filter(t=>typeof t=="string"):[];function Sn(i){let{hass:t,config:e,now:n,data:s}=i,o=new Set,r=[],a=new Set,c=new Set,l=m=>i.preview||eo(e.audience[m],i.viewer),h={...i,t:i.texts,watch:m=>o.add(m),wake:m=>Number.isFinite(m)&&m>n&&r.push(m),midnight:Y(C(n,i.clock.zone)+1,i.clock.zone),dayOf:(m,b=i.clock.zone)=>C(m,b),name:Ve(t),...Ke(t),alikeTitle:(m,b)=>vn(i.clock.lang,m,b,t.localize),members:m=>{let b=io(m);return b.forEach(E=>o.add(E)),He(b.map(E=>t.states[E]).filter(E=>E&&ot(E)).map(E=>h.name(E)))},conditionsMet:(m,b)=>pn(m,b,{hass:t,now:n,zone:i.clock.zone,watch:h.watch,wake:h.wake,media:i.media,server:i.serverCondition})},d=[];l("system")&&d.push(...$n(s.notifications,h)),e.repairs&&i.admin&&l("repairs")&&d.push(...xn(s.repairs,h));let p=[...i.sources];for(let m of i.updates)p.some(b=>b.entity===m)||p.push({entity:m});for(let m of p){let b=m.entity;if(o.add(b),!l(b)||b.startsWith("update.")&&!l("updates"))continue;let E=t.states[b];(!m.visibility||h.conditionsMet(m.visibility,b))&&d.push(...Wi(m,E,h)),E&&E.state!=="unavailable"&&E.state!=="unknown"&&c.add(b)}let u=e.weather&&t.states[e.weather];if(u&&l(e.weather)){o.add(e.weather);let m=ie(u),b=m&&s.forecast(e.weather,m);if(b){let E=()=>(i.windows.forEach(ye=>o.add(ye)),i.windows.filter(ye=>an(t.states[ye])).length);d.push(...sn(u,b,m,{...h,openWindows:E})),a.add(`wx:${e.weather}:wet`).add(`wx:${e.weather}:frost`)}}let f=d.filter(m=>m.expires<=n?!1:(h.wake(m.expires),m.live&&h.wake(m.ts),!0));f.some(m=>m.day||m.kind==="calendar")&&h.wake(h.midnight);let _=new Set(f.map(m=>m.entity)),y=ln(cn(e,i.sources,t,l,_),{...h,forecast:s.forecast});return{entries:f,slides:y,watched:o,wakes:r,known:a,available:c,ctx:h}}var An=(i,t)=>Number.isFinite(i.ts)?i.past?t-i.ts:Math.abs(i.ts-t):1/0;function no(i,t){return i.sort((e,n)=>(n.sev==="crit")-(e.sev==="crit")||An(e,t)-An(n,t)||(n.seq||0)-(e.seq||0)||(e.key<n.key?-1:e.key>n.key?1:0))}function so(i,t){let e=1/0;for(let n=1;n<i.length;n++){let[s,o]=[i[n-1],i[n]];s.sev==="crit"!=(o.sev==="crit")||!Fe(o,t)||!(o.ts>s.ts)||(e=Math.min(e,Math.max((s.ts+o.ts)/2,t+1)))}return e}function En(i,t){let e=no(fn(i,t),t.now);return t.wake(so(e,t.now)),e}var Tn=(i,t)=>i.length?Math.min(Math.max(Math.min(...i)-t,0),864e5)+50:null;var oo={fast:150,normal:250,slow:350};function B(i,t){let e=getComputedStyle(i).getPropertyValue(`--ha-animation-duration-${t}`).trim(),n=parseFloat(e);return Number.isFinite(n)?e.endsWith("ms")?n:n*1e3:oo[t]}var ro=i=>1-Math.exp(-8*i)*(Math.cos(6*i)+8/6*Math.sin(6*i)),Cn=`linear(${Array.from({length:33},(i,t)=>t===32?1:+ro(t/32).toFixed(3)).join(", ")})`,D={standard:"cubic-bezier(0.4, 0, 0.2, 1)",out:"cubic-bezier(0.4, 0, 1, 1)",in:"cubic-bezier(0, 0, 0.2, 1)"},pt=class{constructor(t){this.onGone=t,this.rendered=[],this.ghosts=new Map,this.before=new Map}withLeaving(t,e){e||this.ghosts.clear();let n=new Set(t.map(o=>o.key));for(let o of this.ghosts.keys())n.has(o)&&this.ghosts.delete(o);let s=[...t];return this.rendered.forEach((o,r)=>{if(n.has(o.key))return;e&&!o.leaving&&!this.ghosts.has(o.key)&&this.ghosts.set(o.key,{...o,leaving:!0});let a=this.ghosts.get(o.key);if(!a)return;let c=s.findIndex(l=>l.key===this.rendered[r-1]?.key);s.splice(c<0?Math.min(r,s.length):c+1,0,a)}),this.rendered=s,s}measure(t){this.before=new Map([...t?.children||[]].map(e=>[e.dataset.key,e.offsetTop]))}play(t,e){if(!t||!e)return;let n=B(t,"fast"),s=B(t,"normal"),o=getComputedStyle(t),r=o.direction==="rtl"?"-16px":"16px",a=`${-(parseFloat(o.rowGap)||0)}px`;for(let c of t.children){let l=c.dataset.key;if(c.dataset.leaving&&!this.ghosts.has(l)&&(c.getAnimations().forEach(h=>h.cancel()),delete c.dataset.leaving),this.ghosts.has(l)){if(c.dataset.leaving)continue;c.dataset.leaving="1",this.run(c,[{opacity:1,gridTemplateRows:"1fr",marginTop:"0px",transform:"none",easing:D.out},{opacity:0,gridTemplateRows:"1fr",marginTop:"0px",transform:`translateX(${r})`,offset:n/(n+s),easing:D.standard},{opacity:0,gridTemplateRows:"0fr",marginTop:a,transform:`translateX(${r})`}],n+s,()=>{this.ghosts.delete(l),this.onGone()})}else if(!this.before.has(l))this.run(c,[{opacity:0,gridTemplateRows:"0fr",marginTop:a,easing:D.standard},{opacity:0,gridTemplateRows:"1fr",marginTop:"0px",offset:s/(n+s),easing:D.in},{opacity:1,gridTemplateRows:"1fr",marginTop:"0px"}],n+s);else{let h=this.before.get(l)-c.offsetTop;Math.abs(h)>1&&c.animate([{transform:`translateY(${h}px)`},{transform:"none"}],{duration:s,easing:D.standard})}}}run(t,e,n,s){t.classList.add("moving"),t.animate(e,{duration:n,fill:s?"forwards":"none"}).finished.then(()=>{t.classList.remove("moving"),s?.()},()=>{})}};var On=(i,t,e)=>{let n=new Map;for(let s=t;s<=e;s++)n.set(i[s],s);return n},Nn=lt(class extends F{constructor(i){if(super(i),i.type!==zt.CHILD)throw Error("repeat() can only be used in text expressions")}dt(i,t,e){let n;e===void 0?e=t:t!==void 0&&(n=t);let s=[],o=[],r=0;for(let a of i)s[r]=n?n(a,r):r,o[r]=e(a,r),r++;return{values:o,keys:s}}render(i,t,e){return this.dt(i,t,e).values}update(i,[t,e,n]){let s=wi(i),{values:o,keys:r}=this.dt(t,e,n);if(!Array.isArray(s))return this.ut=r,o;let a=this.ut??=[],c=[],l,h,d=0,p=s.length-1,u=0,f=o.length-1;for(;d<=p&&u<=f;)if(s[d]===null)d++;else if(s[p]===null)p--;else if(a[d]===r[u])c[u]=K(s[d],o[u]),d++,u++;else if(a[p]===r[f])c[f]=K(s[p],o[f]),p--,f--;else if(a[d]===r[f])c[f]=K(s[d],o[f]),dt(i,c[f+1],s[d]),d++,f--;else if(a[p]===r[u])c[u]=K(s[p],o[u]),dt(i,s[d],s[p]),p--,u++;else if(l===void 0&&(l=On(r,u,f),h=On(a,d,p)),l.has(a[d]))if(l.has(a[p])){let _=h.get(r[u]),y=_!==void 0?s[_]:null;if(y===null){let m=dt(i,s[d]);K(m,o[u]),c[u]=m}else c[u]=K(y,o[u]),dt(i,s[d],y),s[_]=null;u++}else Ht(s[p]),p--;else Ht(s[d]),d++;for(;u<=f;){let _=dt(i,c[f+1]);K(_,o[u]),c[u++]=_}for(;d<=p;){let _=s[d++];_!==null&&Ht(_)}return this.ut=r,Bt(i,c),R}});var ao={system:"var(--info-color)",repair:"var(--warning-color)"};function se(i){return i.sev==="crit"?"var(--error-color)":i.sev==="warn"?"var(--warning-color)":i.color||(i.stateObj?qt(i.stateObj):ao[i.kind]||"var(--state-icon-color)")}function oe(i){return i.inert?null:i.tap||(i.entity?{entity:i.entity,tap_action:{action:"more-info"}}:null)}function Ge(i,t){if(!t)return null;try{return i.hassUrl(t)}catch{return null}}var co=(i,t)=>i.icon||t.entities?.[i.stateObj?.entity_id]?.icon||i.stateObj?.attributes.icon||M[i.kind]||M.generic;function re(i,t){let e=Ge(t,i.image);return w`${e?w`<img
        src=${e}
        alt=""
        decoding="async"
        draggable="false"
        referrerpolicy="no-referrer"
        @load=${n=>n.target.classList.add("ready")}
        @error=${n=>n.target.classList.remove("ready")}
      />`:g}${i.stateObj&&customElements.get("ha-state-icon")?w`<ha-state-icon .hass=${t} .stateObj=${i.stateObj} .icon=${i.icon}></ha-state-icon>`:w`<ha-icon .icon=${co(i,t)}></ha-icon>`}`}function Mn(i,t){if(!Number.isFinite(i.ts))return w`<time class="time"></time>`;let e=t.clock.server,n=i.day?st(C(i.ts,e)):new Date(i.ts).toISOString(),s=i.day?t.clock.absoluteDate(i.ts,e):t.clock.absolute(i.ts);return w`<time class="time" datetime=${n} title=${s}>${t.clock.entryTime(i,t.now)}</time>`}var Dn=i=>[".message",".title"].some(t=>{let e=i.querySelector(t);return e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1}),lo=i=>{let t=i.getSelection?.()||document.getSelection();return!!(t&&!t.isCollapsed&&String(t).trim())},ho=i=>t=>{t.key!=="Enter"&&t.key!==" "||(t.preventDefault(),t.stopPropagation(),i())};function uo(i,t){let e=oe(i),n=()=>e&&t.run(e),s=r=>{let a=r.currentTarget;lo(a.getRootNode())||(a.classList.contains("open")||Dn(a)?t.toggle(i.key):n())},o=!!i.message||!Number.isFinite(i.ts);return w`<div class=${V({item:!0,leaving:!!i.leaving})} role="listitem" data-key=${i.key}><div class="clip">
    <div
      class="row ${V({warn:i.sev==="warn",crit:i.sev==="crit",link:!!e,open:t.opened.has(i.key)})}"
      data-kind=${i.kind}
      style="--tile-color: ${se(i)}"
      @click=${s}
      @pointerenter=${r=>r.currentTarget.classList.toggle("expandable",Dn(r.currentTarget))}
    >
      <div
        class="icon"
        role=${e?"button":g}
        tabindex=${e?"0":g}
        aria-label=${e?i.title:g}
        @click=${r=>e&&(r.stopPropagation(),n())}
        @keydown=${e?ho(n):g}
      >
        ${re(i,t.hass)}
      </div>
      <div class="title">${i.title}</div>
      <div class="meta">
        ${o?Mn(i,t):g}
        ${te(i)?w`<button class="dismiss" type="button" aria-label=${t.texts.dismiss} title=${t.texts.dismiss} @click=${r=>(r.stopPropagation(),t.dismiss(i,r.detail===0))}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>`:g}
      </div>
      <div class="message">${i.message||(o?"":Mn(i,t))}</div>
      ${i.actions?.length?w`<div class="actions">
            ${i.actions.map(r=>w`<button class="action" type="button" ?disabled=${r.disabled} @click=${a=>(a.stopPropagation(),t.run(r.action))}>${r.label}</button>`)}
          </div>`:g}
    </div>
  </div></div>`}function ae(i,t,e){let n=[...i.querySelectorAll(".item:not(.leaving)")];(n[Math.min(t,n.length-1)]?.querySelector(".dismiss, .icon[role=button]")||e)?.focus({preventScroll:!0})}var ce=(i,t)=>Nn(i,e=>e.key,e=>uo(e,t));var le=(i,t)=>Mt(i.renderRoot,[...i.constructor.elementStyles,Nt(t)]),de=I`
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
  .item.moving > .clip {
    overflow: hidden;
  }
  .row {
    position: relative;
    display: grid;
    grid-template-columns: var(--origami-tile) minmax(0, 1fr) auto;
    grid-template-areas: "icon title meta" "icon message message" ". actions actions";
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
  .action {
    height: 32px;
    padding: 0 12px;
    background: var(--ha-color-fill-primary-normal-resting, color-mix(in srgb, var(--primary-color) 14%, transparent));
    color: var(--ha-color-on-primary-normal, var(--primary-color));
    border-radius: var(--ha-border-radius-pill, 9999px);
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
`,he=I`
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
`,ue=I`
  :host {
    --origami-pad: 10px;
    --origami-gap: 10px;
    --origami-radius: var(--ha-border-radius-md, 8px);
    --origami-tile: 36px;
    --origami-icon: 24px;
    --origami-card-bg: var(--ha-card-background, var(--card-background-color, #fff));
    --origami-row-bg: transparent;
    --origami-hover: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
    --origami-focus: var(--ha-color-focus, var(--primary-color));
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`,Rn=I`
  :host {
    --origami-bg-auto: 0.22;
    display: grid;
    -webkit-tap-highlight-color: transparent;
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
    min-height: var(--row-height, 56px);
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
`;var po=i=>i.unsub.then(t=>t()).catch(()=>{}),pe=class{constructor(){this.subs=new Map}sync(t){for(let[e,n]of this.subs){let s=t.get(e);s&&!(n.failed&&n.retryOn!==s.retryOn)||(this.subs.delete(e),po(n))}for(let[e,{start:n,retryOn:s}]of t){if(this.subs.has(e))continue;let o={retryOn:s,failed:!1};o.unsub=Promise.resolve().then(n),o.unsub.catch(()=>o.failed=!0),this.subs.set(e,o)}}clear(){this.sync(new Map)}};var Ye=q+"-dialog",mo=300,fo=2*6e4,Tt=1500,_o=2e3,Pn=30,In=16,go=["connection","user","locale","config","localize","entities","devices","areas","services","themes","formatEntityState","formatEntityName","formatEntityAttributeValue"],mt=(i,t,e)=>i.dispatchEvent(new CustomEvent(t,{bubbles:!0,composed:!0,detail:e})),me=class extends O{static styles=[ue,he,de,Rn];static properties={preview:{type:Boolean,reflect:!0}};constructor(){super(),this.connectedWhileHidden=!0,this.preview=!1,this._data={notifications:new Map,repairs:[],todos:new Map,forecasts:new Map,conditions:new Map},this._seq=0,this._subs=new pe,this._dismissals=new Qt(()=>this._refresh()),this._onDetails=()=>this._refresh(),this._motion=new pt(()=>this.requestUpdate()),this._entries=[],this._slides=[],this._turnable=[],this._watched=[],this._wakes=[],this._opened=new Set,this._things=new Map,this._media=new Map,this._backdrops=[{},{}],this._open=!1,this._visible=!0,this._cycleKey=0,this._now=Date.now();for(let t of["ha-state-icon","state-display","ha-ripple"])customElements.get(t)||customElements.whenDefined(t).then(()=>this.requestUpdate())}static getConfigElement(){return document.createElement(q+"-editor")}static getStubConfig(){return{}}setConfig(t){this._config=Zt(t),this.classList.toggle("vertical",this._config.vertical),this.classList.toggle("bounded",typeof t.grid_options?.rows=="number"),this._derived=null,this._refresh(),this._cycle()}set hass(t){let e=this._hass;this._hass=t,(!e||go.some(n=>e[n]!==t[n])||this._watched.some(n=>e.states[n]!==t.states[n]))&&this._refresh()}get hass(){return this._hass}getCardSize(){return this._open?1+this.listed().length:this._config?.vertical?2:1}getGridOptions(){return{columns:12,rows:"auto",min_columns:this._config?.vertical?3:6}}connectedCallback(){super.connectedCallback(),clearTimeout(this._collapseTimer);let t=this.getRootNode().host?.localName;this.classList.toggle("docked",t==="hui-view-footer"),this._inPicker=t==="hui-card-picker",this._dismissals.connect(),this._onVisibility||=()=>{document.hidden||this._cycle(),this._onView(this._visible)},document.addEventListener("visibilitychange",this._onVisibility),this._resize||=new ResizeObserver(([n])=>this._onResize(n.contentRect.width)),this._view||=window.IntersectionObserver&&new IntersectionObserver(n=>this._onView(n.at(-1).isIntersecting),{threshold:.01}),this._view?.observe(this);let e=this.renderRoot?.querySelector("ha-card");e&&this._resize.observe(e),this._painted=!1,this._intro=!0,this._refresh(),this._cycle()}disconnectedCallback(){super.disconnectedCallback(),this._subs.clear(),this._dismissals.disconnect(),this._gestures?.reset();for(let t of this._media.values())t.onchange=null;this._media.clear(),document.removeEventListener("visibilitychange",this._onVisibility),this._resize?.disconnect(),this._view?.disconnect(),[this._wakeTimer,this._clock,this._turnTimer,this._repairsTimer,this._holdTimer,this._showTimer].forEach(clearTimeout),cancelAnimationFrame(this._frameId),this._sizes?.disconnect(),this._collapseTimer=setTimeout(()=>this._setOpen(!1),150)}_derive(){let t=this._hass,e=this._config,n=[e,t.entities,t.devices,t.locale,t.localize,t.config,t.user];if(this._derived?.key.every((d,p)=>d===n[p]))return this._derived;let s=ne(t),o=wn(s,t.localize),r=t.entities||{},a=new Set(e.entities.map(d=>d.entity)),c=e.label?Object.keys(r).filter(d=>!a.has(d)&&r[d]?.labels?.includes(e.label)):[],l=[...new Set(Object.values(e.audience).flatMap(d=>d.only||d.except))],h=new Map;for(let[d,p]of Object.entries(r))p?.device_id&&/^(image|camera)\./.test(d)&&h.set(p.device_id,[...h.get(p.device_id)||[],d].sort().reverse());return this._derived={key:n,lang:s,texts:o,clock:new Wt(t,s,o),sources:[...e.entities,...c.map(d=>({entity:d}))],people:l,viewer:l.find(d=>t.states[d]?.attributes.user_id===t.user?.id)||"",updates:e.updates?[...new Set([...Object.keys(t.states),...Object.keys(r)])].filter(d=>d.startsWith("update.")):[],windows:e.weather?rn(t.states):[],pictures:d=>h.get(r[d]?.device_id)||[]},this._derived}_refresh(){let t=this._hass;if(!t||!this._config)return;let e=this._derive(),n=this._data,s=Date.now(),o={todos:new Set,forecasts:new Map,conditions:new Map},r=Sn({hass:t,config:this._config,now:s,texts:e.texts,clock:e.clock,admin:!!t.user?.is_admin,viewer:e.viewer,preview:this.preview,sources:e.sources,updates:e.updates,windows:e.windows,devicePictures:e.pictures,details:d=>Ki(t,d,this._onDetails),todos:d=>(o.todos.add(d),n.todos.get(d)),media:d=>this._matches(d),serverCondition:d=>{let p=JSON.stringify(d);return o.conditions.set(p,d),n.conditions.get(p)||{result:!1,failed:!1}},data:{notifications:n.notifications,repairs:n.repairs,forecast:(d,p)=>(o.forecasts.set(`${d}|${p}`,[d,p]),n.forecasts.get(`${d}|${p}`))}});this._sync(o);for(let d of r.entries)(d.kind==="attribute"||d.kind==="picture")&&this._things.set(d.key,d.entity);let a=new Set([...r.known,...[...this._things].filter(([,d])=>r.available.has(d)).map(([d])=>d)]),c=En(this._dismissals.apply(r.entries,a,s,r.ctx.wake),r.ctx),l=this._seen&&c.find(d=>!this._seen.has(d.key)&&Math.abs(s-d.ts)<fo);l&&(this._say=[l.title,l.message].filter(Boolean).join(". ")),this._seen=new Set(c.map(d=>d.key)),this._entries=c,this._slides=r.slides,this._watched=[...r.watched,...e.people],this._wakes=r.wakes,this._now=s,this._pick(l),clearTimeout(this._wakeTimer);let h=this.isConnected?Tn(this._wakes,s):null;h!==null&&(this._wakeTimer=setTimeout(()=>this._refresh(),h)),this._tick(),this.requestUpdate(),this._dialog?.requestUpdate()}_sync(t){let e=this._hass,n=e.connection,s=new Map,o=(r,a,c,l)=>s.set(r,{retryOn:l,start:()=>n.subscribeMessage(c,a)});if(n&&this.isConnected){o("notifications",{type:"persistent_notification/subscribe"},r=>this._onNotifications(r)),this._config.repairs&&e.user?.is_admin&&s.set("repairs",{start:()=>(this._fetchRepairs(),n.subscribeEvents(()=>{clearTimeout(this._repairsTimer),this._repairsTimer=setTimeout(()=>this._fetchRepairs(),500)},"repairs_issue_registry_updated"))});for(let r of t.todos)o("todo|"+r,{type:"todo/item/subscribe",entity_id:r},a=>this._store("todos",r,a.items||[]),e.states[r]);for(let[r,[a,c]]of t.forecasts)o("forecast|"+r,{type:"weather/subscribe_forecast",entity_id:a,forecast_type:c},l=>this._store("forecasts",r,l.forecast||[]),e.states[a]);for(let[r,a]of t.conditions)o("condition|"+r,{type:"subscribe_condition",condition:a},c=>this._store("conditions",r,{result:c.result===!0,failed:!!c.error}))}this._subs.sync(s)}_store(t,e,n){this._data[t].set(e,n),this._refresh()}_onNotifications({type:t,notifications:e={}}){t==="current"&&(this._data.notifications=new Map);for(let[n,s]of Object.entries(e))t==="removed"?this._data.notifications.delete(n):this._data.notifications.set(n,{...s,seq:++this._seq});this._refresh()}async _fetchRepairs(){let t=this._hass;try{let{issues:e=[]}=await t.callWS({type:"repairs/list_issues"});if(this._data.repairs=e.filter(n=>!n.ignored),this._refresh(),!this._data.repairs.length)return;await t.loadBackendTranslation?.("issues",[...new Set(this._data.repairs.map(n=>n.domain))]),await t.loadBackendTranslation?.("title",[...new Set(this._data.repairs.map(n=>n.issue_domain||n.domain))])}catch{}}_matches(t){if(!this._media.has(t)){let e=window.matchMedia(t);e.onchange=()=>this._refresh(),this._media.set(t,e)}return this._media.get(t).matches}listed(){let t=new Map;for(let e of this._slides)t.has(e.row)||t.set(e.row,e);return[...this._entries,...[...t.values()].map(e=>this._infoRow(e))]}_formatters(){return{...Ke(this._hass),clock:this._derive().clock,now:this._now}}_infoRow(t){let e=this._hass.states[t.entity],n=this._infoAction(t,"tap");return{key:t.row,kind:"info",title:t.title,message:t.text??je(e,t.content??t.info.state_content,t.name,this._formatters()),icon:t.icon,image:t.image,stateObj:e,color:t.color,ts:NaN,tap:n,inert:!n,actions:[]}}_infoAction(t,e){let n=t.info,s={entity:t.entity,tap_action:n.tap_action||{action:"more-info"},hold_action:n.hold_action,double_tap_action:n.double_tap_action},o=s[e+"_action"];return o&&o.action!=="none"?{...s,gesture:e}:null}_run({gesture:t="tap",...e}){mt(this,"hass-action",{config:e,action:t})}dismiss(t){let e=this._hass;this._dismissals.dismiss(t,n=>n.service?e.callService(...n.service):e.callWS(n.ws))}_pick(t){let e=this._entries.filter(c=>c.sev==="crit"),n=e.length?e:[...this._entries,...this._slides],s=n[0]||null,o=!!(s&&s.kind!=="info"&&s.key!==this._topKey);this._topKey=s?.key,this._turnable=n;let r=n.find(c=>c.key===this._target?.key),a=t&&this._config.rotate?n.find(c=>c.key===t.key):null;a?(r=a,this._byHand=!1):(!r||o||!this._turned||!(this._config.rotate||this._byHand))&&(r=s),this._show(r,1,this._config.slide==="side")}_show(t,e,n,s=!1){if(this._target=t,clearTimeout(this._showTimer),t?.key===this._shown?.key){this._shown=t;return}let o=this._shownAt+_o-Date.now();if(this._turnable.some(l=>l.key===this._shown?.key)&&!s&&o>0){this._showTimer=setTimeout(()=>this._show(this._target,e,n,!0),o);return}let a=this._shown;this._shown=t,this._shownAt=Date.now(),this._cycle();let c=this.renderRoot?.querySelector(".slide:not(.leaving)");a&&c&&this._animate()&&!this._open?this._turn(a,c,e,n):c&&(c.style.transform=c.style.opacity="")}async _turn(t,e,n,s){let o=getComputedStyle(e),r={transform:o.transform,opacity:o.opacity,filter:o.filter},a=[...e.querySelectorAll(":scope > div")].map(u=>[u.hasAttribute("data-long"),u.getAttribute("style"),u.firstElementChild.getAttribute("style")]);e.style.transform=e.style.opacity="",this._turnAnims?.forEach(u=>u.cancel());let c=n*(s&&this._rtl()?-1:1),l=this._leaving={entry:t,side:s};await this.updateComplete,this.renderRoot.querySelectorAll(".slide.leaving > div").forEach((u,f)=>{let[_,y,m]=a[f]||[];u.toggleAttribute("data-long",!!_),u.setAttribute("style",y||""),u.firstElementChild.setAttribute("style",m||"")});let h={duration:B(this,"slow")*.8,easing:D.out,fill:"forwards"},[d,p]=s?["X",24]:["Y",12];this._turnAnims=[this.renderRoot.querySelector(".slide.leaving").animate([r,{transform:`translate${d}(${-c*p}px)`,opacity:0,filter:"blur(4px)"}],h),this.renderRoot.querySelector(".head .glyph.leaving").animate([{opacity:1},{opacity:0,transform:"scale(0.8)",filter:"blur(2px)"}],h),...this._enter(c,s,B(this,"slow")*.35)],await Promise.all(this._turnAnims.map(u=>u.finished)).catch(()=>{}),this._leaving===l&&(this._leaving=null,this.requestUpdate())}_enter(t,e,n=0){let[s,o]=e?["X",24]:["Y",12],r={duration:B(this,"slow")*2,delay:n,easing:Cn,fill:"backwards"};return[this.renderRoot.querySelector(".slide:not(.leaving)").animate([{transform:`translate${s}(${t*o}px)`,opacity:0,filter:"blur(4px)"},{transform:"none",opacity:1,filter:"none"}],r),this.renderRoot.querySelector(".head .glyph:not(.leaving)").animate([{opacity:0,transform:"scale(0.8)",filter:"blur(2px)"},{opacity:1,transform:"none",filter:"none"}],r)]}_step(t,e){let n=this._turnable;if(n.length<2)return;this._turned=!0,e!=="auto"&&(this._byHand=!0);let s=Math.max(0,n.findIndex(o=>o.key===this._shown?.key));this._show(n[(s+t+n.length)%n.length],t,e==="swipe"||this._config.slide==="side",!0),this._tick()}_cycle(){this._cycleKey++,this._cycleAt=Date.now(),this._turnAfter(this._config?.rotate*1e3),this.requestUpdate()}_turnAfter(t){clearTimeout(this._turnTimer),t>0&&this.isConnected&&(this._turnTimer=setTimeout(()=>this._autoTurn(),t-(Date.now()-this._cycleAt)))}_autoTurn(){let t=this._shown;this._config.rotate>0&&this._visible&&!document.hidden&&!this._open&&!this._dialog&&!this._gestures?.press&&this._step(1,"auto"),this._shown===t&&this._cycle()}_scroll(){this._scrolled=this._cycleKey;let t=this._shown?.key,e=this._marquee,n=!!(e&&e.key===t&&!e.back&&e.end&&performance.now()>=e.end);this._sizes||=new ResizeObserver(()=>this._measure()),this._sizes.disconnect();let s=[...this.renderRoot.querySelectorAll(".head .slide:not(.leaving) > div")];for(let o of s)[o,o.firstElementChild].forEach(r=>this._sizes.observe(r));this._marquee={key:t,back:n,rtl:this._rtl(),start:performance.now(),end:0,lines:s.map(o=>({line:o,over:0}))},this._measure()}_measure(){let t=this._marquee,e=this.preview||this._matches("(prefers-reduced-motion: reduce)");for(let r of t.lines){let a=e?0:r.line.firstElementChild.offsetWidth-r.line.clientWidth;r.over=a>1?a:0,r.line.toggleAttribute("data-long",r.over>0)}let n=Math.max(0,...t.lines.map(r=>r.over)),s=n/Pn*1e3;t.end=n?t.start+Tt+s:0;let o=Math.max(this._config.rotate*1e3,n&&2*Tt+s);this.renderRoot.querySelector(".head .cycle")?.style.setProperty("--origami-cycle",`${o}ms`),this._turnAfter(o),this._frame()}_frame(){cancelAnimationFrame(this._frameId),clearTimeout(this._holdTimer);let t=this._marquee,e=performance.now(),n=Math.max(0,e-t.start-Tt)*Pn/1e3;for(let{line:s,over:o}of t.lines){let r=Math.min(n,o),a=t.back?r-o:-r;s.firstElementChild.style.transform=a?`translateX(${t.rtl?-a:a}px)`:"",s.style.setProperty("--fade-start",`${+Math.min(In,-a).toFixed(1)||0}px`),s.style.setProperty("--fade-end",`${+Math.min(In,o+a).toFixed(1)}px`)}!t.end||e>=t.end||(e<t.start+Tt?this._holdTimer=setTimeout(()=>this._frame(),t.start+Tt-e):this._frameId=requestAnimationFrame(()=>this._frame()))}_tick(){if(clearTimeout(this._clock),!this.isConnected||!this._visible||document.hidden)return;let t=Date.now(),e=this._open||!!this._dialog,n=this._shown?.kind!=="info"?this._shown:null,s=(e?this._entries:n?[n]:[]).find(r=>r.clock&&r.ts>t),o=0;s?o=(s.ts-t)%1e3||1e3:(e||this._entries.some(r=>Fe(r,t))||n&&this._headTime(n))&&(o=6e4-t%6e4),o&&(this._clock=setTimeout(()=>{this._now=Date.now(),this.requestUpdate(),this._dialog?.requestUpdate(),this._tick()},o))}_headTime(t){return!!(t.live||!t.message&&Number.isFinite(t.ts))}_onView(t){this._visible=t,this._now=Date.now(),this.requestUpdate(),this._tick()}_onResize(t){Math.round(t)!==this._width&&(this._width=Math.round(t),this._cycle());let e=t>0&&t<mo;e!==this.classList.contains("narrow")&&(this.classList.toggle("narrow",e),this.requestUpdate())}_rtl(){return getComputedStyle(this).direction==="rtl"}_animate(){return!!(this._painted&&!this.preview&&this.isConnected&&this.getClientRects().length)}_empty(){return!this._entries.length&&!this._slides.length&&this._config.hide_when_empty&&!this.preview&&!this._inPicker}_setOpen(t){t!==this._open&&(this._open=t,this._settled=!1,clearTimeout(this._settleTimer),t&&(this.classList.toggle("capped",getComputedStyle(this).getPropertyValue("--origami-max-height").trim()!==""),this._settleTimer=setTimeout(()=>{this._settled=!0,this.requestUpdate()},this._animate()?B(this,"normal"):0)),t||this._cycle(),this.requestUpdate(),this._tick())}_toggle(){if(!this.listed().length)return;if(!this._open&&this.classList.contains("narrow")&&!this.preview&&customElements.get("ha-adaptive-dialog")){mt(this,"show-dialog",{dialogTag:Ye,dialogImport:()=>Promise.resolve(),dialogParams:{card:this}});return}let t=!!this.renderRoot.activeElement;this._setOpen(!this._open),t&&this.updateComplete.then(()=>this.renderRoot.querySelector(this._open?".bar":".head").focus({preventScroll:!0}))}_tap(){let t=this.listed(),e=t.length===1&&oe(t[0]);e?this._run(e):this._toggle()}_tappable(t){let e=this._shown;return t.length>1||!!(t[0]&&oe(t[0]))||e?.kind==="info"&&["hold","double_tap"].some(n=>this._infoAction(e,n))}_gestureAction(t){let e=this._shown?.kind==="info"&&this._infoAction(this._shown,t);return e?()=>this._run(e):null}firstUpdated(){let t=this.renderRoot.querySelector(".head");this._resize.observe(this.renderRoot.querySelector("ha-card")),this._gestures=new ee(t,{canDrag:()=>this._turnable.length>1&&!this._open,drag:e=>{let n=this.renderRoot.querySelector(".slide:not(.leaving)");n.style.transform=`translateX(${e*.6}px)`,n.style.opacity=String(Math.max(.2,1-Math.abs(e)/160))},dragEnd:e=>{if(e)return this._step(e,"swipe");let n=this.renderRoot.querySelector(".slide:not(.leaving)"),s={transform:n.style.transform||"none",opacity:n.style.opacity||"1"};n.style.transform=n.style.opacity="",n.animate([s,{transform:"none",opacity:1}],{duration:B(this,"normal"),easing:D.standard})},step:e=>this._step(e,"key"),tap:()=>this._tap(),holdAction:()=>this._gestureAction("hold"),doubleTapAction:()=>this._gestureAction("double_tap"),rtl:()=>this._rtl()})}willUpdate(t){t.has("preview")&&this._refresh(),this._updateBackdrop(this._shown?.backdrop?Ge(this._hass,this._shown.image):null),this._listMotion=this._open&&this._animate(),this._listMotion&&this._motion.measure(this.renderRoot.querySelector(".list"))}updated(){!this._config||!this._hass||(this._motion.play(this.renderRoot.querySelector(".list"),this._listMotion),this._setHidden(this._empty()),this.classList.toggle("dark",!!this._hass.themes?.darkMode),this.classList.toggle("with-backdrop",this._backdrops.some(t=>t.on)),this._css!==this._config.css&&(this._css=this._config.css,le(this,this._css||"")),this._refocus!=null&&this._focusRow(this._refocus),this._intro&&this._playIntro(),this._scrolled!==this._cycleKey&&this._scroll())}_playIntro(){this._intro=!1;let t=this._config.slide==="side";!this._introduced&&this._turnable.length>1&&!this.preview&&this.getClientRects().length&&(this._introduced=!0,this._enter(t&&this._rtl()?-1:1,t)),requestAnimationFrame(()=>this._painted=!0)}_setHidden(t){if(t===!!(this._hiding||this.hidden))return;this._hostAnim?.cancel();let e=getComputedStyle(this).height,n=!this.classList.contains("bounded"),[s,o]=[B(this,"fast"),B(this,"normal")];if(t){if(!this._animate())return this._gone();this._hiding=!0,this.classList.add("hiding");let c=[{opacity:1,height:e,easing:D.out},{opacity:0,height:e,offset:s/(s+o),easing:D.standard},{opacity:0,height:n?"0px":e}],l=this._hostAnim=this.animate(c,{duration:s+o,fill:"forwards"});l.finished.then(()=>this._hostAnim===l&&this._gone(),()=>{});return}if(this._hiding=!1,this.classList.remove("hiding"),!this.hidden||(this.hidden=!1,mt(this,"card-visibility-changed",{value:!0}),!this._animate()))return;let r=getComputedStyle(this).height,a=n?[{height:"0px",opacity:0,easing:D.standard},{height:r,opacity:0,offset:o/(s+o),easing:D.in},{height:r,opacity:1}]:[{opacity:0},{opacity:1}];this._hostAnim=this.animate(a,{duration:s+o})}_gone(){this._hostAnim?.cancel(),this._hostAnim=null,this._hiding=!1,this.classList.remove("hiding"),this.hidden=!0,mt(this,"card-visibility-changed",{value:!1}),this._setOpen(!1)}_focusRow(t){this._refocus=null,ae(this.renderRoot,t,this.renderRoot.querySelector(this._open?".bar":".head"))}rowView(t){let e=this._derive();return{hass:this._hass,texts:e.texts,clock:e.clock,now:this._now,opened:this._opened,run:n=>this._run(n),toggle:n=>{this._opened.delete(n)||this._opened.add(n),this.requestUpdate(),this._dialog?.requestUpdate()},dismiss:(n,s)=>{let o=this.listed().findIndex(r=>r.key===n.key);this.dismiss([n]),s&&t(o)}}}setDialog(t){this._dialog=t,this._tick(),t||this._cycle()}get gone(){return this.hidden||!!this._hiding}get css(){return this._config.css||""}get texts(){return this._derive().texts}dismissible(){return this._entries.length>1?this._entries.filter(te):[]}listTitle(){let t=this._entries.length,e=this._derive().texts;return t?k(t===1?e.count_one:e.count_other,{n:t}):e.idle_title}_secondary(t,e){if(!t)return e.idle_msg;if(t.kind!=="info")return this._headTime(t)?this._derive().clock.entryTime(t,this._now):t.message;if(t.text!=null)return t.text;let n=t.content??t.info.state_content;return customElements.get("state-display")?w`<state-display .hass=${this._hass} .stateObj=${t.stateObj} .content=${n} .timeFormat=${t.info.time_format} .name=${t.name}></state-display>`:je(t.stateObj,n,t.name,this._formatters())}_slideTemplate(t,e,n){let s=t&&t.kind!=="info"&&this._headTime(t),o=this._secondary(t,e),r=a=>vt(t?.key,w`<span>${a}</span>`);return w`
      <div class="slide ${n?"leaving":""}" aria-hidden=${n?"true":g}>
        <div class="title">${r(t?t.title:e.idle_title)}</div>
        ${o?w`<div class="secondary ${s?"time":""}" aria-live=${s&&!n?"off":g}>${r(o)}</div>`:g}
      </div>
    `}render(){if(!this._config||!this._hass)return g;let t=this._derive().texts,e=this._shown,n=this.listed(),s=this._tappable(n),o=n.length>1,r=this.classList.contains("narrow"),a=this._entries.length,c=this._leaving,l=this.dismissible();return w`
      <ha-card
        class=${V({open:this._open,crit:e?.sev==="crit",tappable:s,settled:this._open&&this._settled})}
        style="--tile-color: ${e?se(e):"var(--state-inactive-color)"}"
        @keydown=${h=>h.key==="Escape"&&this._open&&(h.stopPropagation(),this._toggle())}
      >
        <div class="backdrop" aria-hidden="true">
          ${this._backdrops.map(h=>h.url?w`<img class=${h.on?"on":""} src=${h.url} alt="" draggable="false" referrerpolicy="no-referrer" @load=${()=>this._reveal(h)} />`:g)}
        </div>
        <div class="pulse"></div>
        <div class="head-wrap">
          <div
            class="head"
            role="button"
            tabindex="0"
            aria-disabled=${String(!s)}
            aria-expanded=${o&&!r?String(this._open):g}
            aria-haspopup=${o&&r?"dialog":g}
          >
            <ha-ripple></ha-ripple>
            <div class=${V({icon:!0,idle:!e})}>
              ${this._config.rotate>0&&this._turnable.length>1?vt(this._cycleKey,w`<div class="cycle"><i></i><i></i></div>`):g}
              <div class="glyph">${re(e||{icon:"mdi:bell-outline"},this._hass)}</div>
              ${c?vt(c,w`<div class="glyph leaving" style="color: ${se(c.entry)}">${re(c.entry,this._hass)}</div>`):g}
              ${a>1?w`<div class="badge">${a>9?"9+":a}</div>`:g}
            </div>
            <div class=${V({texts:!0,up:!!(c&&!c.side),side:!!c?.side})}>
              ${this._slideTemplate(e,t)}
              ${c?vt(c,this._slideTemplate(c.entry,t,c)):g}
            </div>
            ${o?w`<ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>`:g}
          </div>
        </div>
        <div class="drawer">
          <div class="inner">
            <div class="bar" role="button" tabindex="0" aria-expanded="true" @click=${()=>this._toggle()} @keydown=${h=>(h.key==="Enter"||h.key===" ")&&(h.preventDefault(),this._toggle())}>
              <ha-ripple></ha-ripple>
              <span class="count">${this.listTitle()}</span>
              <ha-icon class="chevron" icon="mdi:chevron-up"></ha-icon>
            </div>
            <div class="list" role="list">${ce(this._motion.withLeaving(n,this._listMotion),this.rowView(h=>this._refocus=h))}</div>
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
    `}_updateBackdrop(t){if(t===this._backdropUrl)return;this._backdropUrl=t;let e=this._backdrops,n=e.find(s=>s.on);if(!t)e.forEach(s=>s.on=!1);else if(n?.url!==t){let s=n===e[0]?e[1]:e[0];s.url=t,s.loaded===t&&this._reveal(s)}}_reveal(t){t.loaded=t.url,t.url===this._backdropUrl&&(this._backdrops.forEach(e=>e.on=e===t),this.requestUpdate())}};var fe=class extends O{static styles=[ue,he,de,I`
      :host {
        font-family: var(--ha-font-family-body);
        -webkit-font-smoothing: var(--ha-font-smoothing);
        -moz-osx-font-smoothing: var(--ha-moz-osx-font-smoothing);
      }
      ha-adaptive-dialog {
        --dialog-content-padding: 0;
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
    `];constructor(){super(),this._motion=new pt(()=>this.requestUpdate())}showDialog({card:t}){this._card&&this._card!==t&&this._release(),this._card=t,t.setDialog(this),this.requestUpdate()}closeDialog(){let t=this.renderRoot?.querySelector("ha-adaptive-dialog");return t&&this._shown?t.open=!1:this._closed(),!0}_release(){this._card?._dialog===this&&this._card.setDialog(null)}_closed(){this._release(),this._card=null,this._shown=!1,this.requestUpdate(),mt(this,"dialog-closed",{dialog:this.localName})}willUpdate(){this._animate=this._shown&&!this._card?.preview,this._animate&&this._motion.measure(this.renderRoot.querySelector(".list"))}updated(){this._motion.play(this.renderRoot.querySelector(".list"),this._animate),this._card&&this._css!==this._card.css&&(this._css=this._card.css,le(this,this._css)),this._refocus!=null&&ae(this.renderRoot,this._refocus,null),this._refocus=null}render(){let t=this._card;if(!t)return g;let e=t.gone?[]:t.listed();e.length||queueMicrotask(()=>this._card===t&&this.closeDialog());let n=t.dismissible();return w`
      <ha-adaptive-dialog
        open
        flexcontent
        .hass=${t.hass}
        header-title=${t.listTitle()}
        @opened=${s=>s.target===s.currentTarget&&(this._shown=!0,this.requestUpdate())}
        @closed=${s=>s.target===s.currentTarget&&this._closed()}
      >
        ${n.length?w`<ha-icon-button slot="headerActionItems" .label=${t.texts.clear} @click=${()=>t.dismiss(n)}>
              <ha-icon icon="mdi:notification-clear-all"></ha-icon>
            </ha-icon-button>`:g}
        <div class="list" role="list">${ce(this._motion.withLeaving(e,this._animate),t.rowView(s=>this._refocus=s))}</div>
      </ha-adaptive-dialog>
    `}};var yo=["entities","label","weather","infos","updates","repairs","hide_when_empty","vertical","rotate","slide","audience","css"],Ln=["type","attribute","name","icon","color","image","background","before","tap_action","visibility"],bo=["entity",...Ln,"actions"],wo=["entity","name","icon","color","show_entity_picture","state_content","time_format","show_current","show_forecast","forecast_type","forecast_slots","tap_action","hold_action","double_tap_action","visibility"],Un=["attribute","picture"],Xe=i=>i==null||i===""||i===!1||Array.isArray(i)&&!i.length||A(i)&&!Object.keys(i).length,Je=(i,t)=>Object.fromEntries([...new Set([...t,...Object.keys(i)])].filter(e=>e in i).map(e=>[e,i[e]])),Ze=i=>i?i.only?"only":"except":"everyone",vo=i=>({days:Math.floor(i/864e5),hours:Math.floor(i%864e5/36e5),minutes:Math.floor(i%36e5/6e4),seconds:i%6e4/1e3}),_e=i=>!i.forecast_type||i.show_forecast===!1?"show_current":i.show_current===!1?"show_forecast":"show_both",ge=class extends O{static properties={hass:{attribute:!1},_config:{state:!0}};static styles=I`
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
  `;constructor(){super(),this._memos=new Map}setConfig(t){Zt(t),this._config=t}get _t(){return kn(ne(this.hass),this.hass?.localize)}_memo(t,e){let n=JSON.stringify(e),s=this._memos.get(t);return s?.json===n?s.value:(this._memos.set(t,{json:n,value:e}),e)}_name(t,e){let n=this.hass.states[t];return n?Ve(this.hass)(n,e):typeof e=="string"&&e||t}_entries(t=this._config){return(t.entities||[]).map(e=>typeof e=="string"?{entity:e}:e)}_infos(t=this._config){return(t.infos||[]).map(e=>typeof e=="string"?{entity:e}:{...e})}_sources(t=this._config){let e=this._t,n=[{key:"system",name:e.label("system"),icon:M.system}];t.updates!==!1&&n.push({key:"updates",name:e.label("updates"),icon:M.update}),t.repairs!==!1&&n.push({key:"repairs",name:e.label("repairs"),icon:M.repair}),t.weather&&n.push({key:t.weather,name:this._name(t.weather),icon:M.weather});let s=this.hass.entities||{},o=t.label?Object.keys(s).filter(r=>s[r]?.labels?.includes(t.label)).map(r=>({entity:r})):[];for(let r of[...this._entries(t),...o])n.some(a=>a.key===r.entity)||n.push({key:r.entity,name:r.name||this._name(r.entity),icon:r.icon||M[this._kind(r)]});return n}_kind(t){return De(t,this.hass.states[t.entity],this.hass)}_summary(t){let e=this._t,n=Ze(t);if(n==="everyone")return e.label("everyone");let s=t[n].map(o=>this._name(o)).join(", ");return s?k(e.label(n+"_x"),{x:s}):e.label(n==="only"?"nobody":"everyone")}_schema(t){let e=this._t,n=this._config.audience||{},s=(o,r=a=>e.label(a))=>o.map(a=>({value:a,label:r(a)}));return[{name:"entities",selector:{entity:{multiple:!0}}},{name:"label",selector:{label:{}}},{name:"weather",selector:{entity:{filter:{domain:"weather"}}}},{name:"infos",selector:{entity:{multiple:!0,reorder:!0}}},{name:"",type:"grid",schema:[{name:"updates",selector:{boolean:{}}},{name:"repairs",selector:{boolean:{}}}]},{name:"hide_when_empty",selector:{boolean:{}}},{name:"content_layout",selector:{select:{mode:"box",options:["horizontal","vertical"].map(o=>({value:o,label:e.label(o),image:{src:`/static/images/form/tile_content_layout_${o}.svg`,src_dark:`/static/images/form/tile_content_layout_${o}_dark.svg`,flip_rtl:!0}}))}}},{name:"",type:"grid",schema:[{name:"rotate",selector:{number:{min:0,max:60,step:1,mode:"box",unit_of_measurement:"s"}}},{name:"slide",selector:{select:{mode:"dropdown",options:s(["up","side"],o=>e.label("slide_"+o))}}}]},{name:"audience",type:"expandable",title:e.label("audience"),icon:"mdi:account-eye-outline",schema:t.map(o=>({name:o.key,type:"expandable",title:`${o.name} \xB7 ${this._summary(n[o.key])}`,icon:o.icon,schema:[{name:"visible",selector:{select:{mode:"list",options:s(["everyone","only","except"])}}},...Ze(n[o.key])==="everyone"?[]:[{name:"people",selector:{entity:{multiple:!0,filter:{domain:"person"}}}}]]}))},{name:"styling",type:"expandable",flatten:!0,title:e.label("styling"),icon:"mdi:palette-outline",schema:[{name:"css",selector:{text:{multiline:!0}}}]}]}_data(t){let e=this._config,n=e.audience||{};return{...At,...e,content_layout:e.vertical?"vertical":"horizontal",entities:this._entries().map(s=>s.entity),infos:this._infos().map(s=>s.entity),audience:Object.fromEntries(t.map(s=>[s.key,{visible:Ze(n[s.key]),people:n[s.key]?.only||n[s.key]?.except||[]}]))}}_mergeEntities(t,e={}){let n=this._entries(),s=new Map(n.map(a=>[a.entity,a])),o=t.map((a,c)=>n[c]&&a!==n[c].entity?c:-1).filter(a=>a>=0),r=t.length===n.length&&o.length===1&&!s.has(t[o[0]])?o[0]:-1;return this._swapped=r<0?null:[n[r].entity,t[r]],t.map((a,c)=>{let l=s.get(a)||(c===r?n[c]:{}),h={...l,entity:a},d=e[a]||{};for(let p of Ln){if(!(p in d))continue;let u=d[p];p==="before"&&at(u)===at(l.before)||(Xe(u)||p==="type"&&u==="auto"||p==="color"&&u==="state"||p==="before"&&!at(u)?delete h[p]:h[p]=u)}return h.type&&!Un.includes(h.type)&&delete h.attribute,Object.keys(h).length===1?a:Je(h,bo)})}_onChange(t){t.stopPropagation();let{content_layout:e,...n}=t.detail.value;e&&(n.vertical=e==="vertical");let s=this._sources().map(a=>a.key);this._swapped=null,Array.isArray(n.entities)&&(n.entities=this._mergeEntities(n.entities)),Array.isArray(n.infos)&&(n.infos=this._mergeInfos(n.infos));let o={...this._config.audience};for(let[a,c]of Object.entries(n.audience||{}))c.visible==="only"||c.visible==="except"?o[a]={[c.visible]:c.people||[]}:delete o[a];for(let[a,c]of[this._swapped||[],[this._config.weather,n.weather]])a&&c&&o[a]&&!o[c]&&(o[c]=o[a]);let r=new Set(this._sources({...this._config,...n}).map(a=>a.key));for(let a of s)!r.has(a)&&a!=="updates"&&!a.startsWith("update.")&&delete o[a];n.audience=o,this._write(n)}_write(t){let e={...this._config,...t},n={type:this._config.type};for(let[s,o]of Object.entries(Je(e,yo)))s==="type"||Xe(o)&&o!==!1||s in At&&o===At[s]||(n[s]=o);this._config=n,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:n},bubbles:!0,composed:!0}))}_mergeInfos(t){let e=this._infos(),n=new Set,s=o=>o>=0&&!n.has(o)?(n.add(o),e[o]):null;return t.map((o,r)=>{let a=s(e.findIndex((c,l)=>c.entity===o&&!n.has(l)))||e.length===t.length&&!t.includes(e[r].entity)&&s(r)||{};return this._infoEntry({...a,entity:o})})}_infoEntry(t){let e={};for(let[n,s]of Object.entries(Je(t,wo)))(n==="show_current"||n==="show_forecast"?s===!1:!Xe(s)&&!(n==="color"&&s==="state"))&&(e[n]=s);return Object.keys(e).length===1?e.entity:e}_forecastTypes(t){if(!t.entity.startsWith("weather."))return[];let e=this.hass.states[t.entity];return Pe.filter(n=>Et(e,n)||t.forecast_type===n)}_infoSchema(t){let e=this._t,n=this.hass.states[t.entity],s=t.entity.split(".")[0],o=[].concat(t.state_content??"state").some(p=>/^last[_-](changed|updated|triggered)$/.test(p)||s==="sun"&&p.startsWith("next_")||s==="calendar"&&p.endsWith("_time")||p==="state"&&!!n&&(n.attributes.device_class==="timestamp"||Si(s))),r={entity_id:"entity"},a=this._forecastTypes(t),c=_e(t),l=p=>({select:{mode:"dropdown",options:p.map(u=>({value:u,label:e.label(u)}))}}),h=[{name:"state_content",selector:{ui_state_content:{}},context:{filter_entity:"entity"}},...o?[{name:"time_format",selector:{ui_time_format:{}}}]:[]],d=[{name:"forecast",selector:l(["show_both","show_current","show_forecast"])},...c==="show_current"?[]:[{name:"forecast_type",selector:l(a)},{name:"forecast_slots",selector:{number:{min:1,max:12,mode:"box"}}}],...c==="show_forecast"?[]:h];return[{name:"name",selector:{entity_name:{}},context:{entity:"entity"}},{name:"",type:"grid",schema:[{name:"icon",selector:{icon:{}},context:{icon_entity:"entity"}},{name:"color",selector:{ui_color:{default_color:"state",include_state:!0}}}]},...a.length?d:h,{name:"show_entity_picture",selector:{boolean:{}}},{name:"tap_action",selector:{ui_action:{default_action:"more-info"}},context:r},{name:"",type:"optional_actions",flatten:!0,schema:["hold_action","double_tap_action"].map(p=>({name:p,selector:{ui_action:{default_action:"none"}},context:r}))}]}_onInfo(t,e,n){t.stopPropagation();let s=this._infos(),{forecast:o,...r}=n,a={...s[e],...r,entity:s[e].entity},c="forecast"in n?o||"show_current":null;if(c&&c!==_e(s[e])&&(Object.assign(a,{show_current:c==="show_forecast"?!1:void 0,show_forecast:void 0}),a.forecast_type=c==="show_current"?void 0:a.forecast_type||this._forecastTypes(a)[0]),!a.forecast_type)for(let l of["forecast_slots","show_current","show_forecast"])delete a[l];s[e]=a,this._write({infos:s.map(l=>this._infoEntry(l))})}_entitySchema(t){let e=this._t,n=this._kind(t);return[{name:"type",selector:{select:{mode:"dropdown",options:(o=>o.map(r=>({value:r,label:e.label("type_"+r)})))(["auto",...Yt])}}},...!t.type||Un.includes(t.type)?[{name:"attribute",helper:t.type==="picture"?"attribute_picture":"attribute",selector:{attribute:{entity_id:t.entity}}}]:[],{name:"",type:"grid",schema:[{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{placeholder:M[n]}}}]},{name:"color",selector:{ui_color:{default_color:"state",include_state:!0}}},{name:"image",selector:{text:{}}},{name:"background",selector:{boolean:{}}},...Hi.includes(n)?[{name:"before",selector:{duration:{enable_day:!0}}}]:[],{name:"tap_action",helper:"row_tap_action",selector:{ui_action:{default_action:"more-info"}}}]}_onEntity(t,e,n){t.stopPropagation();let s=this._entries().map(o=>o.entity);this._write({entities:this._mergeEntities(s,{[s[e]]:n})})}_entityPanel(t,e){let n=this._t,s={...t,type:t.type||"auto",color:t.color||"state",background:!!t.background,before:t.before==null?void 0:vo(at(t.before))},o=Array.isArray(t.visibility)?t.visibility:[];return w`<ha-expansion-panel outlined .header=${t.name||this._name(t.entity)} .secondary=${n.label("type_"+this._kind(t))}>
      <ha-icon slot="leading-icon" .icon=${t.icon||M[this._kind(t)]}></ha-icon>
      <div class="content">
        <ha-form
          .hass=${this.hass}
          .data=${this._memo("entity-data-"+e,s)}
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
              .conditions=${this._memo("entity-conditions-"+e,o)}
              @value-changed=${r=>this._onEntity(r,e,{visibility:r.detail.value})}
            ></ha-card-conditions-editor>
          </div>
        </ha-expansion-panel>
      </div>
    </ha-expansion-panel>`}_infoPanel(t,e){let n=this._t,s=this.hass.states[t.entity],o=this._forecastTypes(t),r=o.length?{...t,forecast:_e(t)}:t,a=Array.isArray(t.visibility)?t.visibility:[];return w`<ha-expansion-panel outlined .header=${this._name(t.entity,t.name)} .secondary=${o.length&&_e(t)!=="show_current"?n.label(t.forecast_type):""}>
      ${s&&customElements.get("ha-state-icon")?w`<ha-state-icon slot="leading-icon" .hass=${this.hass} .stateObj=${s} .icon=${t.icon}></ha-state-icon>`:w`<ha-icon slot="leading-icon" .icon=${t.icon||M.generic}></ha-icon>`}
      <div class="content">
        <ha-form
          .hass=${this.hass}
          .data=${this._memo("info-data-"+e,r)}
          .schema=${this._memo("info-schema-"+e,this._infoSchema(t))}
          .computeLabel=${c=>n.label(c.name)}
          @value-changed=${c=>this._onInfo(c,e,c.detail.value)}
        ></ha-form>
        <ha-expansion-panel outlined .header=${n.label("visibility")}>
          <ha-icon slot="leading-icon" icon="mdi:eye"></ha-icon>
          <div class="content">
            <p class="intro">${n.helper("visibility_intro")}</p>
            <ha-card-conditions-editor
              .hass=${this.hass}
              .conditions=${this._memo("conditions-"+e,a)}
              @value-changed=${c=>this._onInfo(c,e,{visibility:c.detail.value?.length?c.detail.value:void 0})}
            ></ha-card-conditions-editor>
          </div>
        </ha-expansion-panel>
      </div>
    </ha-expansion-panel>`}render(){if(!this._config||!this.hass)return g;let t=this._t,e=this._sources(),n=this._entries(),s=this._infos();return w`
      <ha-form
        .hass=${this.hass}
        .data=${this._memo("data",this._data(e))}
        .schema=${this._memo("schema",this._schema(e))}
        .computeLabel=${o=>t.label(o.name)}
        .computeHelper=${o=>t.helper(o.helper||o.name)}
        @value-changed=${this._onChange}
      ></ha-form>
      ${n.length?w`<ha-expansion-panel class="entities" outlined .header=${t.label("options")}>
            <ha-icon slot="leading-icon" icon="mdi:tune-variant"></ha-icon>
            <div class="content">${n.map((o,r)=>this._entityPanel(o,r))}</div>
          </ha-expansion-panel>`:g}
      ${s.length?w`<ha-expansion-panel class="infos" outlined .header=${t.label("info_options")}>
            <ha-icon slot="leading-icon" icon="mdi:information-outline"></ha-icon>
            <div class="content">${s.map((o,r)=>this._infoPanel(o,r))}</div>
          </ha-expansion-panel>`:g}
    `}};var Qe=(i,t)=>customElements.get(i)||customElements.define(i,t);Qe(q,me);Qe(q+"-editor",ge);Qe(Ye,fe);window.customCards||=[];window.customCards.some(i=>i.type===q)||(window.customCards.push({type:q,name:"Origami Notifications",description:"System notifications, repairs, updates, warnings and any entity you add.",preview:!0,documentationURL:"https://github.com/hazymorning/origami_notifications"}),console.info(`%c Origami Notifications %c v${ti} `,"font-weight: bold","opacity: 0.7"));
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
