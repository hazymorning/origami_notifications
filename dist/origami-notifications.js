var Ye="1.1.2";var xt=globalThis,$t=xt.ShadowRoot&&(xt.ShadyCSS===void 0||xt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,he=Symbol(),Xe=new WeakMap,lt=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==he)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if($t&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=Xe.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&Xe.set(e,t))}return t}toString(){return this.cssText}},St=i=>new lt(typeof i=="string"?i:i+"",void 0,he),R=(i,...t)=>{let e=i.length===1?i[0]:t.reduce((s,n,o)=>s+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+i[o+1],i[0]);return new lt(e,i,he)},At=(i,t)=>{if($t)i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),n=xt.litNonce;n!==void 0&&s.setAttribute("nonce",n),s.textContent=e.cssText,i.appendChild(s)}},ue=$t?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return St(e)})(i):i;var{is:Ds,defineProperty:Ps,getOwnPropertyDescriptor:Is,getOwnPropertyNames:Us,getOwnPropertySymbols:Ls,getPrototypeOf:js}=Object,Et=globalThis,Je=Et.trustedTypes,zs=Je?Je.emptyScript:"",Bs=Et.reactiveElementPolyfillSupport,dt=(i,t)=>i,pe={toAttribute(i,t){switch(t){case Boolean:i=i?zs:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},Qe=(i,t)=>!Ds(i,t),Ze={attribute:!0,type:String,converter:pe,reflect:!1,useDefault:!1,hasChanged:Qe};Symbol.metadata??=Symbol("metadata"),Et.litPropertyMetadata??=new WeakMap;var L=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=Ze){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),n=this.getPropertyDescriptor(t,s,e);n!==void 0&&Ps(this.prototype,t,n)}}static getPropertyDescriptor(t,e,s){let{get:n,set:o}=Is(this.prototype,t)??{get(){return this[e]},set(r){this[e]=r}};return{get:n,set(r){let c=n?.call(this);o?.call(this,r),this.requestUpdate(t,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Ze}static _$Ei(){if(this.hasOwnProperty(dt("elementProperties")))return;let t=js(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(dt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(dt("properties"))){let e=this.properties,s=[...Us(e),...Ls(e)];for(let n of s)this.createProperty(n,e[n])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,n]of e)this.elementProperties.set(s,n)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let n=this._$Eu(e,s);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let n of s)e.unshift(ue(n))}else t!==void 0&&e.push(ue(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return At(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),n=this.constructor._$Eu(t,s);if(n!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:pe).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(n):this.setAttribute(n,o),this._$Em=null}}_$AK(t,e){let s=this.constructor,n=s._$Eh.get(t);if(n!==void 0&&this._$Em!==n){let o=s.getPropertyOptions(n),r=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:pe;this._$Em=n;let c=r.fromAttribute(e,o.type);this[n]=c??this._$Ej?.get(n)??c,this._$Em=null}}requestUpdate(t,e,s,n=!1,o){if(t!==void 0){let r=this.constructor;if(n===!1&&(o=this[t]),s??=r.getPropertyOptions(t),!((s.hasChanged??Qe)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:n,wrapped:o},r){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),o!==!0||r!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),n===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[n,o]of this._$Ep)this[n]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[n,o]of s){let{wrapped:r}=o,c=this[n];r!==!0||this._$AL.has(n)||c===void 0||this.C(n,void 0,o,c)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};L.elementStyles=[],L.shadowRootOptions={mode:"open"},L[dt("elementProperties")]=new Map,L[dt("finalized")]=new Map,Bs?.({ReactiveElement:L}),(Et.reactiveElementVersions??=[]).push("2.1.2");var fe=globalThis,ti=i=>i,Tt=fe.trustedTypes,ei=Tt?Tt.createPolicy("lit-html",{createHTML:i=>i}):void 0,_e="$lit$",j=`lit$${Math.random().toFixed(9).slice(2)}$`,ge="?"+j,Hs=`<${ge}>`,J=document,ut=()=>J.createComment(""),pt=i=>i===null||typeof i!="object"&&typeof i!="function",ye=Array.isArray,ai=i=>ye(i)||typeof i?.[Symbol.iterator]=="function",me=`[ 	
\f\r]`,ht=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ii=/-->/g,si=/>/g,Y=RegExp(`>|${me}(?:([^\\s"'>=/]+)(${me}*=${me}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ni=/'/g,oi=/"/g,ci=/^(?:script|style|textarea|title)$/i,be=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),b=be(1),_o=be(2),go=be(3),N=Symbol.for("lit-noChange"),_=Symbol.for("lit-nothing"),ri=new WeakMap,X=J.createTreeWalker(J,129);function li(i,t){if(!ye(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return ei!==void 0?ei.createHTML(t):t}var di=(i,t)=>{let e=i.length-1,s=[],n,o=t===2?"<svg>":t===3?"<math>":"",r=ht;for(let c=0;c<e;c++){let a=i[c],l,h,d=-1,p=0;for(;p<a.length&&(r.lastIndex=p,h=r.exec(a),h!==null);)p=r.lastIndex,r===ht?h[1]==="!--"?r=ii:h[1]!==void 0?r=si:h[2]!==void 0?(ci.test(h[2])&&(n=RegExp("</"+h[2],"g")),r=Y):h[3]!==void 0&&(r=Y):r===Y?h[0]===">"?(r=n??ht,d=-1):h[1]===void 0?d=-2:(d=r.lastIndex-h[2].length,l=h[1],r=h[3]===void 0?Y:h[3]==='"'?oi:ni):r===oi||r===ni?r=Y:r===ii||r===si?r=ht:(r=Y,n=void 0);let u=r===Y&&i[c+1].startsWith("/>")?" ":"";o+=r===ht?a+Hs:d>=0?(s.push(l),a.slice(0,d)+_e+a.slice(d)+j+u):a+j+(d===-2?c:u)}return[li(i,o+(i[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},mt=class i{constructor({strings:t,_$litType$:e},s){let n;this.parts=[];let o=0,r=0,c=t.length-1,a=this.parts,[l,h]=di(t,e);if(this.el=i.createElement(l,s),X.currentNode=this.el.content,e===2||e===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(n=X.nextNode())!==null&&a.length<c;){if(n.nodeType===1){if(n.hasAttributes())for(let d of n.getAttributeNames())if(d.endsWith(_e)){let p=h[r++],u=n.getAttribute(d).split(j),g=/([.?@])?(.*)/.exec(p);a.push({type:1,index:o,name:g[2],strings:u,ctor:g[1]==="."?Ot:g[1]==="?"?Nt:g[1]==="@"?Mt:Q}),n.removeAttribute(d)}else d.startsWith(j)&&(a.push({type:6,index:o}),n.removeAttribute(d));if(ci.test(n.tagName)){let d=n.textContent.split(j),p=d.length-1;if(p>0){n.textContent=Tt?Tt.emptyScript:"";for(let u=0;u<p;u++)n.append(d[u],ut()),X.nextNode(),a.push({type:2,index:++o});n.append(d[p],ut())}}}else if(n.nodeType===8)if(n.data===ge)a.push({type:2,index:o});else{let d=-1;for(;(d=n.data.indexOf(j,d+1))!==-1;)a.push({type:7,index:o}),d+=j.length-1}o++}}static createElement(t,e){let s=J.createElement("template");return s.innerHTML=t,s}};function Z(i,t,e=i,s){if(t===N)return t;let n=s!==void 0?e._$Co?.[s]:e._$Cl,o=pt(t)?void 0:t._$litDirective$;return n?.constructor!==o&&(n?._$AO?.(!1),o===void 0?n=void 0:(n=new o(i),n._$AT(i,e,s)),s!==void 0?(e._$Co??=[])[s]=n:e._$Cl=n),n!==void 0&&(t=Z(i,n._$AS(i,t.values),n,s)),t}var Ct=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,n=(t?.creationScope??J).importNode(e,!0);X.currentNode=n;let o=X.nextNode(),r=0,c=0,a=s[0];for(;a!==void 0;){if(r===a.index){let l;a.type===2?l=new st(o,o.nextSibling,this,t):a.type===1?l=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(l=new Rt(o,this,t)),this._$AV.push(l),a=s[++c]}r!==a?.index&&(o=X.nextNode(),r++)}return X.currentNode=J,n}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},st=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,n){this.type=2,this._$AH=_,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Z(this,t,e),pt(t)?t===_||t==null||t===""?(this._$AH!==_&&this._$AR(),this._$AH=_):t!==this._$AH&&t!==N&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):ai(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==_&&pt(this._$AH)?this._$AA.nextSibling.data=t:this.T(J.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,n=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=mt.createElement(li(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===n)this._$AH.p(e);else{let o=new Ct(n,this),r=o.u(this.options);o.p(e),this.T(r),this._$AH=o}}_$AC(t){let e=ri.get(t.strings);return e===void 0&&ri.set(t.strings,e=new mt(t)),e}k(t){ye(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,n=0;for(let o of t)n===e.length?e.push(s=new i(this.O(ut()),this.O(ut()),this,this.options)):s=e[n],s._$AI(o),n++;n<e.length&&(this._$AR(s&&s._$AB.nextSibling,n),e.length=n)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=ti(t).nextSibling;ti(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},Q=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,n,o){this.type=1,this._$AH=_,this._$AN=void 0,this.element=t,this.name=e,this._$AM=n,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=_}_$AI(t,e=this,s,n){let o=this.strings,r=!1;if(o===void 0)t=Z(this,t,e,0),r=!pt(t)||t!==this._$AH&&t!==N,r&&(this._$AH=t);else{let c=t,a,l;for(t=o[0],a=0;a<o.length-1;a++)l=Z(this,c[s+a],e,a),l===N&&(l=this._$AH[a]),r||=!pt(l)||l!==this._$AH[a],l===_?t=_:t!==_&&(t+=(l??"")+o[a+1]),this._$AH[a]=l}r&&!n&&this.j(t)}j(t){t===_?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Ot=class extends Q{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===_?void 0:t}},Nt=class extends Q{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==_)}},Mt=class extends Q{constructor(t,e,s,n,o){super(t,e,s,n,o),this.type=5}_$AI(t,e=this){if((t=Z(this,t,e,0)??_)===N)return;let s=this._$AH,n=t===_&&s!==_||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==_&&(s===_||n);n&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Rt=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){Z(this,t)}},hi={M:_e,P:j,A:ge,C:1,L:di,R:Ct,D:ai,V:Z,I:st,H:Q,N:Nt,U:Mt,B:Ot,F:Rt},Ws=fe.litHtmlPolyfillSupport;Ws?.(mt,st),(fe.litHtmlVersions??=[]).push("3.3.3");var ui=(i,t,e)=>{let s=e?.renderBefore??t,n=s._$litPart$;if(n===void 0){let o=e?.renderBefore??null;s._$litPart$=n=new st(t.insertBefore(ut(),o),o,void 0,e??{})}return n._$AI(i),n};var we=globalThis,E=class extends L{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=ui(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return N}};E._$litElement$=!0,E.finalized=!0,we.litElementHydrateSupport?.({LitElement:E});var qs=we.litElementPolyfillSupport;qs?.({LitElement:E});(we.litElementVersions??=[]).push("4.2.2");var Dt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},nt=i=>(...t)=>({_$litDirective$:i,values:t}),H=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var W=nt(class extends H{constructor(i){if(super(i),i.type!==Dt.ATTRIBUTE||i.name!=="class"||i.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(i){return" "+Object.keys(i).filter(t=>i[t]).join(" ")+" "}update(i,[t]){if(this.st===void 0){this.st=new Set,i.strings!==void 0&&(this.nt=new Set(i.strings.join(" ").split(/\s/).filter(s=>s!=="")));for(let s in t)t[s]&&!this.nt?.has(s)&&this.st.add(s);return this.render(t)}let e=i.element.classList;for(let s of this.st)s in t||(e.remove(s),this.st.delete(s));for(let s in t){let n=!!t[s];n===this.st.has(s)||this.nt?.has(s)||(n?(e.add(s),this.st.add(s)):(e.remove(s),this.st.delete(s)))}return N}});var{I:Fs}=hi,pi=i=>i;var mi=()=>document.createComment(""),ot=(i,t,e)=>{let s=i._$AA.parentNode,n=t===void 0?i._$AB:t._$AA;if(e===void 0){let o=s.insertBefore(mi(),n),r=s.insertBefore(mi(),n);e=new Fs(o,r,i,i.options)}else{let o=e._$AB.nextSibling,r=e._$AM,c=r!==i;if(c){let a;e._$AQ?.(i),e._$AM=i,e._$AP!==void 0&&(a=i._$AU)!==r._$AU&&e._$AP(a)}if(o!==n||c){let a=e._$AA;for(;a!==o;){let l=pi(a).nextSibling;pi(s).insertBefore(a,n),a=l}}}return e},q=(i,t,e=i)=>(i._$AI(t,e),i),Vs={},Pt=(i,t=Vs)=>i._$AH=t,fi=i=>i._$AH,It=i=>{i._$AR(),i._$AA.remove()};var ft=nt(class extends H{constructor(){super(...arguments),this.key=_}render(i,t){return this.key=i,t}update(i,[t,e]){return t!==this.key&&(Pt(i),this.key=t),e}});var ve=new Map;function F(i,t){let e=i+JSON.stringify(t);if(!ve.has(e)){let s;try{s=new Intl.DateTimeFormat(i,t)}catch{s=new Intl.DateTimeFormat(void 0,{...t,timeZone:void 0})}ve.set(e,s)}return ve.get(e)}function _i(i,t){try{return new Intl.NumberFormat(i,t)}catch{return new Intl.NumberFormat(void 0,t)}}var v=(i,t)=>i.replace(/\{(\w+)\}/g,(e,s)=>t[s]??"");function Lt(i,t){let e=F("en-US",{hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric",timeZone:t}).formatToParts(i);return Object.fromEntries(e.map(({type:s,value:n})=>[s,Number(n)]))}var Ks=/^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d):(\d\d)(?::(\d\d)(\.\d+)?)?)?$/;function _t(i,t){let e=Ks.exec(i);if(!e)return Date.parse(i);let s=Date.UTC(+e[1],e[2]-1,+e[3],+(e[4]||0),+(e[5]||0),+(e[6]||0)),n=o=>{let r=Lt(o,t);return Date.UTC(r.year,r.month-1,r.day,r.hour,r.minute,r.second)-o};return s-n(s-n(s))+(e[7]?Math.round(parseFloat(e[7])*1e3):0)}var D=(i,t)=>typeof i=="string"&&/^\d{4}-\d\d-\d\d/.test(i)?_t(i,t):NaN,k=(i,t=NaN)=>{let e=i?Date.parse(i):NaN;return Number.isNaN(e)?t:e};function M(i,t){let e=Lt(i,t);return Date.UTC(e.year,e.month-1,e.day)/864e5}var gt=i=>new Date(i*864e5).toISOString().slice(0,10),yt=(i,t)=>_t(gt(i),t);function ke(i){let t=i>0?Math.ceil(i/1e3):0,e=Math.floor(t/3600),s=Math.floor(t%3600/60),n=String(t%60).padStart(2,"0");return e?`${e}:${String(s).padStart(2,"0")}:${n}`:`${s}:${n}`}function gi(i){let t=/^(\d+):(\d\d):(\d\d)$/.exec(String(i??"").trim());return t?(+t[1]*3600+ +t[2]*60+ +t[3])*1e3:NaN}var Gs={comma_decimal:"en-US",decimal_comma:"de",space_comma:"fr",quote_decimal:"de-CH",none:"en-US"};function Ys(){return F(void 0,{hour:"numeric"}).resolvedOptions().hour12}var Ut=class{constructor(t,e,s){let n=t?.locale||{};this.lang=e,this.t=s,this.server=t?.config?.time_zone||void 0,this.zone=n.time_zone==="server"?this.server:void 0;let o={12:!0,24:!1,system:Ys()}[n.time_format];this.time={timeZone:this.zone,...o===void 0?{}:{hour12:o}},this.numbers=_i(n.number_format==="system"?void 0:Gs[n.number_format]||e,{maximumFractionDigits:1,useGrouping:n.number_format!=="none"}),this.percents=_i(e,{style:"percent",maximumFractionDigits:0});try{this.rel=new Intl.RelativeTimeFormat(e,{numeric:"auto",style:"short"})}catch{this.rel=new Intl.RelativeTimeFormat("en",{numeric:"auto",style:"short"})}}relative(t,e){let s=Math.round((t-e)/1e3),n=Math.round(s/60),o=Math.round(s/3600);return Math.abs(s)<60?(s>0?this.t.soon:this.t.just_now)||this.rel.format(0,"second"):Math.abs(n)<60?this.rel.format(n,"minute"):Math.abs(o)<24?this.rel.format(o,"hour"):this.rel.format(Math.round(s/86400),"day")}entryTime(t,e){if(!Number.isFinite(t.ts))return"";if(t.clock)return ke(t.ts-e);if(t.day){let{near:s,text:n}=this.day(t.ts,this.server,e);return s?n:v(this.t.on_date,{d:n})}return this.relative(t.past?Math.min(t.ts,e):t.ts,e)}absolute(t){return F(this.lang,{dateStyle:"medium",timeStyle:"short",...this.time}).format(t)}absoluteDate(t,e){return F(this.lang,{dateStyle:"medium",timeZone:e}).format(t)}clockTime(t){return F(this.lang,{hour:"numeric",minute:"2-digit",...this.time}).format(t)}hour(t){return F(this.lang,{hour:"numeric",...this.time}).format(t).replace(/^0(?=\d\D)/,"")}day(t,e,s){let n=M(t,e)-M(s,this.zone);return Math.abs(n)<=1?{near:!0,text:this.rel.format(n,"day")}:{near:!1,text:F(this.lang,{day:"2-digit",month:"2-digit",timeZone:e}).format(t)}}calendar(t,e,s){let n=t?_t(t,this.server):NaN;if(Number.isNaN(n))return this.t.event;let{near:o,text:r}=this.day(n,e?this.server:this.zone,s);return e?o?r:v(this.t.on_date,{d:r}):v(o?this.t.day_at:this.t.date_at,{d:r,t:this.clockTime(n)})}slotLabel(t,e,s){let n=M(t,this.zone)-M(s,this.zone),o=Math.abs(n)<=1?this.rel.format(n,"day"):F(this.lang,{weekday:"long",timeZone:this.zone}).format(t),r=e!=="hourly"?o:n===0?this.clockTime(t):v(this.t.day_at,{d:o,t:this.clockTime(t)});return r.charAt(0).toLocaleUpperCase(this.lang)+r.slice(1)}number(t){return this.numbers.format(t)}percent(t){return this.percents.format(t/100)}};var z="origami-notifications",xe=["calendar","update","alarm","alert","timer","countdown","event","todo","device","warning","attribute","picture","generic"],$e=["daily","hourly","twice_daily"],bt={updates:!0,repairs:!0,hide_when_empty:!0,vertical:!1,rotate:8,slide:"up"},$=i=>i!=null&&typeof i=="object"&&!Array.isArray(i),jt=i=>typeof i=="string"&&/^\w+\.\w+$/.test(i),yi={days:864e5,hours:36e5,minutes:6e4,seconds:1e3};function tt(i){let t=NaN;if(typeof i=="number")t=i*6e4;else if(typeof i=="string"){let e=/^(\d+):(\d+)(?::(\d+(?:\.\d+)?))?$/.exec(i.trim());e&&(t=e[1]*36e5+e[2]*6e4+(e[3]||0)*1e3)}else $(i)&&Object.keys(i).length&&Object.keys(i).every(e=>e in yi)&&(t=Object.entries(i).reduce((e,[s,n])=>e+Number(n)*yi[s],0));return t>=0&&Number.isFinite(t)?t:NaN}var Xs=i=>{throw new Error(`${z}: ${i}`)},w=(i,t)=>i||Xs(t),x=(i,t)=>i==null||t(i),bi=i=>x(i,$);function Js(i){let t=typeof i=="string"?{entity:i}:$(i)?{...i}:null;return w(t&&jt(t.entity),"entities must contain entity ids, got "+JSON.stringify(i)),w(x(t.type,e=>xe.includes(e)),`unknown type '${t.type}'`),w(x(t.attribute,e=>typeof e=="string"),"attribute must be the name of an attribute"),w(x(t.image,e=>typeof e=="string"),"image must be an attribute path or URL"),w(x(t.background,e=>typeof e=="boolean"),"background must be true or false"),w(x(t.before,e=>tt(e)>=0),"before must be minutes or a duration like 1:30:00"),w(bi(t.tap_action),"tap_action must be an action"),w(x(t.actions,e=>Array.isArray(e)&&e.every(s=>$(s)&&typeof s.label=="string"&&$(s.tap_action))),"actions must be a list of buttons with a label and a tap_action"),{...t,lead:t.before==null?void 0:tt(t.before)}}function Zs(i){let t=typeof i=="string"?{entity:i}:$(i)?{...i}:null;w(t&&jt(t.entity),"infos must contain entity ids, got "+JSON.stringify(i)),w(x(t.visibility,Array.isArray),`visibility of ${t.entity} must be a list of conditions`),w(x(t.forecast_type,e=>$e.includes(e)),"forecast_type must be daily, hourly or twice_daily");for(let e of["show_current","show_forecast","show_entity_picture"])w(x(t[e],s=>typeof s=="boolean"),e+" must be true or false");w(x(t.forecast_slots,e=>Number.isInteger(e)&&e>0),"forecast_slots must be a whole number above 0");for(let e of["tap_action","hold_action","double_tap_action"])w(bi(t[e]),e+" must be an action");return t}function Qs(i){w(x(i,$),"audience must map sources to only or except");for(let[t,e]of Object.entries(i||{})){let s=$(e)?["only","except"].filter(o=>o in e):[];w(s.length===1,`audience.${t} needs either only or except`);let n=e[s[0]];w(Array.isArray(n)&&n.every(o=>typeof o=="string"&&o.startsWith("person.")),`audience.${t}.${s[0]} must list person entities, e.g. person.anna`)}return i||{}}function zt(i){w(x(i.entities,Array.isArray),"entities must be a list"),w(x(i.infos,Array.isArray),"infos must be a list"),w(x(i.weather,e=>typeof e=="string"&&e.startsWith("weather.")),"weather must be a weather entity, e.g. weather.home"),w(x(i.label,e=>typeof e=="string"),"label must be a label ID"),w(x(i.css,e=>typeof e=="string"),"css must be a string"),w(x(i.rotate,e=>typeof e=="number"&&e>=0),"rotate must be the seconds between turns, or 0 to turn them off"),w(x(i.slide,e=>e==="up"||e==="side"),"slide must be up or side");for(let e of["updates","repairs","hide_when_empty","vertical"])w(x(i[e],s=>typeof s=="boolean"),e+" must be true or false");let t=[];for(let e of i.entities||[]){let s=Js(e);t.some(n=>n.entity===s.entity)||t.push(s)}return{...bt,...i,entities:t,infos:(i.infos||[]).map(Zs),audience:Qs(i.audience)}}var V=i=>i.split(".")[0],ki=new Set(["ai_task","button","conversation","event","image","infrared","input_button","notify","radio_frequency","scene","stt","tag","tts","wake_word","datetime"]),tn={alarm_control_panel:["disarmed"],alert:["idle"],cover:["closed"],device_tracker:["not_home"],lawn_mower:["docked","paused","idle"],lock:["locked"],media_player:["standby"],person:["not_home"],vacuum:["idle","docked","paused"],valve:["closed"]},wi={camera:["streaming","recording"],group:["on","home","open","locked","problem"],plant:["problem"],timer:["active"]},xi=i=>ki.has(i);function et(i,t=i.state){let e=V(i.entity_id);return ki.has(e)?t!=="unavailable":t==="unavailable"||t==="unknown"||t==="off"&&e!=="alert"?!1:wi[e]?wi[e].includes(t):!(tn[e]||[]).includes(t)}var en=new Set(["alarm_control_panel","alert","automation","binary_sensor","calendar","camera","climate","cover","device_tracker","fan","group","humidifier","input_boolean","lawn_mower","light","lock","media_player","person","plant","remote","schedule","script","siren","sun","switch","timer","update","vacuum","valve","water_heater","weather"]),sn=i=>i.reduceRight((t,e)=>`var(${e}${t?", "+t:""})`,""),vi=i=>String(i).toLowerCase().replace(/[^a-z0-9]+/g,"_");function Se(i,t,e,s){let n=s?"active":"inactive";return sn([...t?[`--state-${i}-${t}-${vi(e)}-color`]:[],`--state-${i}-${vi(e)}-color`,`--state-${i}-${n}-color`,`--state-${n}-color`])}var nn=i=>{let t=new Set((i.attributes.entity_id||[]).map(e=>V(String(e))));return t.size===1?[...t][0]:void 0};function Bt(i){let{state:t,attributes:e}=i;if(t==="unavailable")return"var(--state-unavailable-color)";let s=V(i.entity_id),n=et(i);if(s==="sensor"&&e.device_class==="battery"&&t!==""&&!isNaN(Number(t))){let r=Number(t);return`var(--state-sensor-battery-${r>=70?"high":r>=30?"medium":"low"}-color)`}let o=s==="group"?nn(i):s;return en.has(o)&&s!=="person"&&s!=="device_tracker"?Se(o,e.device_class,t,n):n?"var(--state-icon-color)":"var(--state-inactive-color)"}var on=new Set(["primary","accent","red","pink","purple","deep-purple","indigo","blue","light-blue","cyan","teal","green","light-green","lime","yellow","amber","orange","deep-orange","brown","light-grey","grey","dark-grey","blue-grey","black","white","primary-text","secondary-text","disabled"]),$i=i=>on.has(i)?`var(--${i}-color)`:i,K={updateInstall:1,todoUpdate:4,coverClose:2,valveClose:2,vacuumReturn:16,mowerDock:4,sirenOff:2},Ht=(i,t)=>(Number(i.attributes.supported_features)&t)===t;var rt=i=>String(i??"").replace(/<br\s*\/?>/gi,`
`).replace(/!\[[^\]]*\]\([^)]*\)/g,"").replace(/\[([^\]]*)\]\([^)]*\)/g,"$1").replace(/<\/?[a-z][^>]*>/gi,"").replace(/(\*\*|__|~~|`)(.+?)\1/g,"$2").replace(/^ {0,3}(#{1,6} +|> ?|[-*+] +)/gm,"").replace(/\n{3,}/g,`

`).trim(),Si=/^(https?:\/\/|\/(?!\/))/i;function Ai(i){let t=/\[[^\]]*\]\(([^)\s]+)[^)]*\)/.exec(String(i??"").replace(/!\[[^\]]*\]\([^)]*\)/g,""));return t&&Si.test(t[1])?t[1]:null}function Ei(i){let t=/!\[[^\]]*\]\(\s*([^)\s]*)[^)]*\)/.exec(String(i??""));return t&&Si.test(t[1])?t[1]:null}var wt=i=>({tap_action:i.startsWith("/")?{action:"navigate",navigation_path:i}:{action:"url",url_path:i}});var B=(...i)=>i.join("\0"),it=(i,t,e,s={})=>({label:t,action:{entity:i,tap_action:{action:"perform-action",perform_action:e,target:{entity_id:i},...s}}}),I=(i,t)=>{for(let e of t){let s=i?.[e];if(typeof s=="string"&&s||typeof s=="number")return String(s)}return""},vt=i=>i==null||i===""||i===!1||typeof i=="object"&&Object.keys(i).length===0,Ni=(i,t)=>t.split(".").reduce((e,s)=>e?.[s],i),Ee=["image","image_url","picture","thumbnail"];function Wt(i){return typeof i.entity_picture=="string"&&i.entity_picture?i.entity_picture:Ee.map(t=>i[t]).find(t=>typeof t=="string"&&/^(https?:\/\/|\/|data:image\/)/i.test(t))||null}var Mi=["description","summary"],Ri=i=>$(i)&&I(i,["name","title"])!=="",Di=i=>Object.keys(i).find(t=>Ri(i[t])&&[...Mi,...Ee].some(e=>!vt(i[t][e]))),Pi=i=>{let t=String(i).trim().toLowerCase();return["off","unavailable","unknown","idle","none",""].includes(t)||Number(t)===0},rn=i=>{let t=String(i).toLowerCase();return t==="on"||t==="active"||Number(i)>0};function Ti(i,t,e,s){let n=i.attributes,o=t.attribute||Di(n),r=o?Ni(n,o):void 0,c={kind:s,ts:k(i.last_changed,e.now),past:!0,once:!0};if(Ri(r)){let a=I(r,["name","title"]),l=I(r,Mi);return[{...c,title:a,message:l||e.name(i,t.name),image:I(r,Ee),ack:B(a,l)}]}return s==="attribute"?!t.attribute||vt(r)||typeof r=="object"?[]:[{...c,title:e.attr(i,o,r),message:e.name(i,t.name),ack:String(r)}]:Pi(i.state)?[]:[{...c,title:e.state(i),message:e.name(i,t.name),ack:String(i.state)}]}function an(i,t,e){let s=i.attributes;if(!s.message)return[];let n={kind:"calendar",title:s.message,message:e.clock.calendar(s.start_time,s.all_day,e.now)};if(i.state==="on")return[{...n,ts:k(i.last_changed,e.now),past:!0,ack:B(s.message,s.start_time)}];let o=D(s.start_time,e.clock.server);return i.state!=="off"||!(t.lead>=0)||!(o>e.now)?[]:o-e.now>t.lead?(e.wake(o-t.lead),[]):[{...n,ts:o,day:!!s.all_day,ack:B(s.message,s.start_time,"ahead")}]}function cn(i,t,e){if(i.state!=="on")return[];let{attributes:s,entity_id:n}=i,o=e.t,r=typeof s.update_percentage=="number"?Math.round(s.update_percentage):null,c=s.in_progress?[{label:r===null?o.installing:v(o.installing_pct,{p:r}),disabled:!0}]:null,a=e.admin&&Ht(i,K.updateInstall)?[it(n,o.install,"update.install")]:[];return[{kind:"update",title:(t.name?e.name(i,t.name):s.title||e.name(i).replace(/\s*update\s*$/i,"").trim())||o.update,message:s.latest_version?v(o.update_msg,{v:s.latest_version}):o.update_msg_plain,ts:k(i.last_changed,e.now),past:!0,actions:c||a,...e.admin&&!s.auto_update?{dismiss:{service:["update","skip",{entity_id:n}]}}:{ack:String(s.latest_version)}}]}var Ci={triggered:"crit",pending:"warn",arming:"warn"};function ln(i,t,e){return Ci[i.state]?[{kind:"alarm",sev:Ci[i.state],title:e.name(i,t.name),message:e.state(i),ts:k(i.last_changed,e.now),past:!0}]:[]}function dn(i,t,e){return i.state!=="on"?[]:[{kind:"alert",sev:"warn",title:e.name(i,t.name),message:"",ts:k(i.last_changed,e.now),past:!0,ack:"on"}]}function hn(i,t,e){let{attributes:s,entity_id:n}=i,o=e.t,r={kind:"timer",title:e.name(i,t.name)};return i.state==="active"?[{...r,message:e.state(i),ts:k(s.finishes_at),live:!0,clock:!0,ack:String(s.finishes_at),actions:[it(n,o.act_pause,"timer.pause"),it(n,o.act_cancel,"timer.cancel")]}]:i.state!=="paused"?[]:[{...r,message:v(o.paused_left,{t:ke(gi(s.remaining)),s:e.state(i)}),ts:k(i.last_changed,e.now),past:!0,ack:B("paused",s.remaining),actions:[it(n,o.act_resume,"timer.start"),it(n,o.act_cancel,"timer.cancel")]}]}var un={d:864e5,h:36e5,min:6e4,s:1e3,ms:1},pn=i=>i.device_class==="timestamp"?void 0:un[i.unit_of_measurement];function mn(i,t,e){let s=pn(i.attributes),n=s?k(i.last_changed)+Number(i.state)*s:D(i.state,e.clock.server),o=Math.round(n/6e4)*6e4;return o>e.now?[{kind:"countdown",title:e.name(i,t.name),message:s?e.clock.absolute(o):e.state(i),ts:o,live:!0,ack:""}]:[]}function fn(i,t){for(let e of t){let s=i.states[e],n=s?.attributes||{};if(e.startsWith("image.")&&n.access_token)return`/api/image_proxy/${e}?token=${encodeURIComponent(n.access_token)}&state=${encodeURIComponent(s.state)}`;if(n.entity_picture)return n.entity_picture}return null}function _n(i,t,e){let s=D(i.state,e.clock.server);if(!Number.isFinite(s))return[];let n=i.attributes.event_type,o=e.devicePictures(i.entity_id);return o.forEach(e.watch),[{kind:"event",title:e.name(i,t.name),message:n==null||n===""?"":e.attr(i,"event_type",n),ts:s,past:!0,expires:s+864e5,image:Wt(i.attributes)||fn(e.hass,o),ack:String(i.state)}]}function gn(i,t,e){let s=i.entity_id,n=t.lead>=0?t.lead:0,o=e.dayOf(e.now),r=Ht(i,K.todoUpdate),c=l=>r?[it(s,e.t.act_done,"todo.update_item",{data:{item:l.uid,status:"completed"}})]:[],a=[];for(let l of e.todos(s)||[]){if(l?.status!=="needs_action"||!l.uid||typeof l.due!="string")continue;let h=!l.due.includes("T"),d=D(l.due,e.clock.server);if(Number.isFinite(d)){if(e.dayOf(d,h?e.clock.server:e.clock.zone)>o&&d-e.now>n){e.wake(d-n),e.wake(e.midnight);continue}a.push({key:`t:${s}:${l.uid}`,kind:"todo",title:String(l.summary||""),message:e.name(i,t.name),ts:d,day:h,ack:B(l.uid,l.due),tap:wt("/todo?entity_id="+s),actions:c(l)})}}return a}var Ii={lock:{sev:{jammed:"warn"},label:"act_lock",action:"lock.lock",when:["unlocked","open","jammed"],assumed:!0},cover:{label:"act_close_cover",action:"cover.close_cover",feature:K.coverClose,when:["open","opening"],assumed:!0,confirm:!0},valve:{label:"act_close_valve",action:"valve.close_valve",feature:K.valveClose,when:["open","opening"],assumed:!0,confirm:!0},vacuum:{sev:{error:"warn"},label:"act_dock_vacuum",action:"vacuum.return_to_base",feature:K.vacuumReturn,when:["cleaning","error"]},lawn_mower:{sev:{error:"warn"},label:"act_dock_mower",action:"lawn_mower.dock",feature:K.mowerDock,when:["mowing","returning","error"]},siren:{sev:{on:"crit"},label:"act_off",action:"siren.turn_off",feature:K.sirenOff,when:["on"]}};function yn(i,t,e){if(!et(i))return[];let{attributes:s,entity_id:n}=i,o=Ii[V(n)],r=o&&(o.when.includes(i.state)||o.assumed&&s.assumed_state===!0)&&(!o.feature||Ht(i,o.feature))&&!(V(n)==="lock"&&s.code_format);return[{kind:"device",sev:o?.sev?.[i.state],title:e.name(i,t.name),message:e.members(i)||e.state(i),ts:k(i.last_changed,e.now),past:!0,ack:String(i.state),actions:r?[it(n,e.t[o.label],o.action,o.confirm?{confirmation:!0}:{})]:[]}]}var Ui={extreme:"crit",severe:"crit",moderate:"warn"},Li=i=>!!(I(i,["severity"])&&I(i,["headline","event"])),bn=/^([a-z][a-z0-9]*)_(\d+)_(headline|name|title|event)$/,ji=i=>{let t=new Map;for(let e of Object.keys(i)){let s=bn.exec(e);if(!s||vt(i[e]))continue;let n=r=>i[`${s[1]}_${s[2]}_${r}`];(s[3]==="headline"||s[3]==="event"||!vt(n("level"))||!vt(n("severity")))&&t.set(s[1]+s[2],{prefix:s[1],n:Number(s[2])})}return[...t.values()].sort((e,s)=>e.n-s.n)},Ae=(i,t,e)=>i.map(s=>D(t(s),e)).find(Number.isFinite);function wn(i,t,e){let s=i.entity_id,n=new Set;return t.map(({prefix:o,n:r})=>{let c=f=>i.attributes[`${o}_${r}_${f}`],a={headline:c("headline"),name:c("name"),title:c("title"),event:c("event")},l=I(a,["headline","name","title","event"]),h=Number(c("level"))||0,d=rt(I({d:c("description")},["d"])),p=Ae(["start","onset"],c,e.clock.server),u=Ae(["end","expires"],c,e.clock.server),g=`w:${s}:${c("name")||l}:${c("start")||c("onset")||""}`;for(;n.has(g);)g+="+";return n.add(g),{key:g,kind:"warning",sev:h>=3||Ui[String(c("severity")).toLowerCase()]==="crit"?"crit":"warn",title:l,message:d||(h?v(e.t.level,{l:h}):e.name(i)),ts:p??k(i.last_changed,e.now),past:p===void 0,expires:u,ack:B(l,h,d)}})}function vn(i,t,e){let s=ji(i.attributes);if(s.length)return wn(i,s,e);if(i.state!=="on")return[];let n=Li(i.attributes)?i.attributes:e.details(i),o=n||{},r=u=>o[u],c=e.clock.server,a=Ae(["start","onset","effective"],r,c),l=D(o.sent,c),h=D(o.expires,c),d=I(o,["headline","event"]),p=rt(I(o,["description"]));return[{kind:"warning",sev:Ui[String(o.severity).toLowerCase()],title:d||e.name(i,t.name),message:p,ts:a??(Number.isFinite(l)?l:k(i.last_changed,e.now)),past:a===void 0,expires:Number.isFinite(h)?h:void 0,waiting:n===void 0,ack:d?B(d,o.severity,p):String(i.attributes.id||"")}]}var kn={smoke:"crit",gas:"crit",carbon_monoxide:"crit",moisture:"crit",safety:"crit",heat:"crit",problem:"warn",tamper:"warn",battery:"warn",sound:"warn"};function xn(i,t,e){if(t.type?Pi(i.state):!rn(i.state))return[];let s=i.attributes,n=V(i.entity_id)==="binary_sensor";return[{kind:"generic",sev:n&&i.state==="on"?kn[s.device_class]:void 0,deviceClass:n&&typeof s.device_class=="string"&&!Array.isArray(s.entity_id)?s.device_class:void 0,title:e.name(i,t.name),message:e.members(i)||e.state(i),ts:k(i.last_changed,e.now),past:!0,ack:String(i.state)}]}var $n={calendar:an,update:cn,alarm:ln,alert:dn,timer:hn,countdown:mn,event:_n,todo:gn,device:yn,warning:vn,attribute:(i,t,e)=>Ti(i,t,e,"attribute"),picture:(i,t,e)=>Ti(i,t,e,"picture"),generic:xn},Oi={calendar:"calendar",update:"update",alarm_control_panel:"alarm",alert:"alert",timer:"timer"};function Te(i,t,e){if(i.type)return i.type;if(i.attribute)return"attribute";if(!t)return"generic";let s=V(t.entity_id),n=t.attributes;return ji(n).length?"warning":Oi[s]?Oi[s]:Di(n)?"attribute":s==="event"?"event":Ii[s]?"device":s==="binary_sensor"&&(Li(n)||Oe(e,t.entity_id))?"warning":s==="sensor"&&n.device_class==="timestamp"?"countdown":"generic"}var Ce=(i,t)=>i?.entities?.[t]?.platform||"",Oe=(i,t)=>!!i?.services?.[Ce(i,t)]?.get_details,C={system:"mdi:bell",update:"mdi:rocket-launch",repair:"mdi:wrench",alarm:"mdi:shield-alert",alert:"mdi:alert",calendar:"mdi:calendar-month",timer:"mdi:timer-outline",countdown:"mdi:timer-sand",event:"mdi:eye-check",todo:"mdi:clipboard-check-outline",device:"mdi:devices",warning:"mdi:alert-circle",group:"mdi:google-circles-communities",weather:"mdi:weather-partly-rainy",attribute:"mdi:card-text-outline",picture:"mdi:image-outline",generic:"mdi:information-outline"};function zi(i,t,e){if(!t)return[];let s=Te(i,t,e.hass),n;try{n=$n[s](t,i,e)}catch(l){return console.warn(`origami-notifications: ${t.entity_id} could not be shown`,l),[]}let o=t.entity_id,r=i.image&&(i.image.includes("/")?i.image:Ni(t.attributes,i.image)),c=i.tap_action&&i.tap_action.action!=="none"?{entity:o,tap_action:i.tap_action}:void 0,a=(i.actions||[]).map(l=>({label:l.label,action:{entity:o,tap_action:l.tap_action}}));return n.map(l=>{let h=i.image?r:l.image||Wt(t.attributes);return{key:`${s}:${o}${i.attribute?":"+i.attribute:""}`,entity:o,...l,icon:i.icon||l.icon,image:typeof h=="string"&&h?h:null,backdrop:!!i.background,tap:i.tap_action?c:l.tap,inert:i.tap_action?.action==="none",actions:[...l.actions||[],...a],stateObj:l.kind==="todo"?void 0:t}})}var Bi=new Map;function Hi(i,t,e){let s=t.entity_id,n=t.attributes.id||t.last_changed,o=Bi.get(s);if(o?.warning!==n){if(!Oe(i,s))return Object.keys(i.services||{}).length?null:void 0;o={warning:n,data:void 0,waiting:new Set},Bi.set(s,o);let r=c=>{o.data=$(c)?c:null,o.waiting.forEach(a=>a()),o.waiting.clear()};Promise.resolve().then(()=>i.callService(Ce(i,s),"get_details",{},{entity_id:s},!1,!0)).then(c=>r(c?.response?.[s]),()=>r(null))}return o.data===void 0&&o.waiting.add(e),o.data}var Re="origami-notifications-ack",Sn=64,An=1e4,G=null,Ne=new Map;function Wi(){if(!G)try{let i=JSON.parse(localStorage.getItem(Re)||"{}");G=i&&typeof i=="object"&&!Array.isArray(i)?i:{}}catch{G={}}return G}function qi(){let i=new Set([...Ne.values()].flatMap(s=>[...s])),t=Object.keys(G),e=[...t.filter(s=>!i.has(s)),...t.filter(s=>i.has(s))];for(let s of e.slice(0,Math.max(t.length-Sn,0)))delete G[s];try{localStorage.setItem(Re,JSON.stringify(G))}catch{}}var Me=new Set,Fi=i=>Me.forEach(t=>t!==i&&t());window.addEventListener("storage",i=>{i.key===Re&&(G=null,Fi())});var qt=class{constructor(t){this.onChange=t,this.pending=new Map}connect(){Me.add(this.onChange)}disconnect(){Me.delete(this.onChange),Ne.delete(this)}apply(t,e,s,n){let o=Wi(),r=new Set(t.map(h=>h.key)),c=!1,a=h=>{o[h]!==void 0&&(delete o[h],c=!0)};for(let[h,d]of this.pending)!r.has(h)||d<=s?this.pending.delete(h):Number.isFinite(d)&&n(d);let l=[];for(let h of t){if(this.pending.has(h.key))continue;if(h.waiting){o[h.key]===void 0&&l.push({...h,ack:void 0});continue}if(h.dismiss||h.ack===void 0){l.push(h);continue}let d=h.once?h.ack:B(h.ack,h.ts);o[h.key]!==d&&(a(h.key),l.push({...h,signature:d}))}for(let h of e)r.has(h)||a(h);return Ne.set(this,r),c&&qi(),l}dismiss(t,e){let s=Wi(),n=!1;for(let o of t.flatMap(r=>r.members||[r]))if(o.signature)s[o.key]=o.signature,n=!0;else if(o.dismiss){let{key:r}=o;this.pending.set(r,1/0),e(o.dismiss).then(()=>{this.pending.get(r)===1/0&&(this.pending.set(r,Date.now()+An),this.onChange())},c=>{console.warn(`origami-notifications: Home Assistant kept ${r}`,c),this.pending.delete(r)&&this.onChange()})}n&&(qi(),Fi(this.onChange)),this.onChange()}},Ft=i=>!!(i.dismiss||i.signature||i.members?.every(t=>t.signature));var Vt=class{constructor(t,e){this.head=t,this.on=e,this.press=null,this.suppress=!1,this.tapWait=null,t.addEventListener("pointerdown",s=>this.down(s)),t.addEventListener("pointermove",s=>this.move(s)),t.addEventListener("pointerup",s=>this.up(s,!1)),t.addEventListener("pointercancel",s=>s!==this.ownCancel&&this.up(s,!0)),t.addEventListener("pointerleave",s=>!this.press?.drag&&this.up(s,!0)),t.parentElement.addEventListener("click",s=>this.click(s),!0),t.addEventListener("keydown",s=>this.key(s))}down(t){if(t.button>0||!t.isPrimary)return;this.suppress=!1;let e={id:t.pointerId,x:t.clientX,y:t.clientY,t:t.timeStamp,dx:0,drag:!1},s=this.on.holdAction();s&&(e.timer=setTimeout(()=>{this.suppress=!0,s()},500)),this.press=e}move(t){let e=this.press;if(!e||t.pointerId!==e.id)return;let s=t.clientX-e.x,n=t.clientY-e.y;if(!e.drag){if(Math.hypot(s,n)>10&&clearTimeout(e.timer),!this.on.canDrag()||Math.abs(s)<10||Math.abs(s)<Math.abs(n)*1.5)return;e.drag=!0,this.suppress=!0,this.head.setPointerCapture?.(e.id),this.ownCancel=new PointerEvent("pointercancel",{pointerId:t.pointerId,pointerType:t.pointerType,isPrimary:!0}),this.head.dispatchEvent(this.ownCancel)}e.dx=s,this.on.drag(s)}up(t,e){let s=this.press;if(!s||t.pointerId!==s.id||(this.press=null,clearTimeout(s.timer),!s.drag))return;let n=Math.abs(s.dx)/Math.max(t.timeStamp-s.t,1)>.5,o=!e&&(Math.abs(s.dx)>48||n);this.on.dragEnd(o?Math.sign(-s.dx)*(this.on.rtl()?-1:1):0)}click(t){if(this.head.contains(t.target)){if(this.suppress){this.suppress=!1,t.stopPropagation();return}this.activate()}}activate(){let t=this.on.doubleTapAction();if(!t)return this.on.tap();if(this.tapWait)return clearTimeout(this.tapWait),this.tapWait=null,t();this.tapWait=setTimeout(()=>{this.tapWait=null,this.on.tap()},250)}key(t){let e={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[t.key];e&&this.on.canDrag()?(t.preventDefault(),this.on.step(t.key.startsWith("ArrowL")||t.key.startsWith("ArrowR")?e*(this.on.rtl()?-1:1):e)):(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),this.activate())}reset(){this.press&&clearTimeout(this.press.timer),this.press=null,clearTimeout(this.tapWait),this.tapWait=null}};var Vi={daily:1,hourly:2,twice_daily:4},Kt={hourly:36e5,twice_daily:12*36e5,daily:24*36e5},kt=(i,t)=>!!(Vi[t]&&Number(i?.attributes.supported_features)&Vi[t]),Gt=i=>["hourly","twice_daily","daily"].find(t=>kt(i,t))||null,Xi=new Set(["rainy","pouring","lightning","lightning-rainy","snowy","snowy-rainy","hail"]),En=(i,t)=>Xi.has(i.condition)||Number(i.precipitation)>=(t==="in"?.01:.2)||Number(i.precipitation_probability)>=60;function Ki(i,t,e){let s=String(i||"");return s.startsWith("lightning")?"thunder":s==="hail"?"hail":s.startsWith("snowy")||t!=null&&t!==""&&Number(t)<=e?"snow":"rain"}var Gi={rain:"mdi:weather-rainy",snow:"mdi:weather-snowy",thunder:"mdi:weather-lightning",hail:"mdi:weather-hail",frost:"mdi:snowflake-thermometer"},Tn={rain:"rainy",snow:"snowy",thunder:"lightning",hail:"hail",frost:"snowy"},Yi=i=>Se("weather",null,Tn[i],!0);function Ji(i,t,e,s){let n=i.entity_id,o=i.attributes,r=s.t,c=o.temperature_unit==="\xB0F",a=e==="hourly"||e==="twice_daily"?t.filter(u=>Date.parse(u.datetime)+Kt[e]>s.now):[],l=s.openWindows(),h=[],d=(u,g,f,m,y)=>h.push({key:`wx:${n}:wet`,kind:"weather",entity:n,icon:Gi[u],color:Yi(u),sev:l?"warn":void 0,title:g,message:f,ts:m,past:y,once:!y,ack:u+(l?" open":"")});if(Xi.has(i.state)){let u=Ki(i.state,o.temperature,c?34:1);l&&d(u,r[`wx_${u}_now`],s.alikeTitle("window",l),k(i.last_changed,s.now),!0)}else{let u=a.find(g=>Date.parse(g.datetime)<s.now+6*36e5&&En(g,o.precipitation_unit));if(u){let g=Math.max(Date.parse(u.datetime),s.now),f=Ki(u.condition,u.temperature,c?34:1),m=u.precipitation_probability==null?NaN:Number(u.precipitation_probability),y=l?s.alikeTitle("window",l):Number.isFinite(m)?v(r.wx_chance,{p:s.clock.percent(m)}):"";d(f,v(r[`wx_${f}_from`],{t:s.clock.hour(g)}),y,g,!1)}}let p=c?32:0;if(a.length&&o.temperature!=null&&Number(o.temperature)>p){let u=a.filter(f=>Date.parse(f.datetime)<s.now+18*36e5&&f.temperature!=null&&Number.isFinite(Number(f.temperature))),g=u.find(f=>Number(f.temperature)<p);if(g){let f=Math.max(Date.parse(g.datetime),s.now),m=Math.min(...u.map(y=>Number(y.temperature)));h.push({key:`wx:${n}:frost`,kind:"weather",entity:n,icon:Gi.frost,color:Yi("frost"),title:v(r.wx_frost_from,{t:s.clock.hour(f)}),message:v(r.wx_low,{v:s.attr(i,"temperature",m)}),ts:f,once:!0,ack:"frost"})}}return a.length&&s.wake(Math.floor(s.now/36e5)*36e5+36e5),h}var Zi=i=>Object.keys(i).filter(t=>{let e=i[t]?.attributes;return e?.device_class==="window"&&!Array.isArray(e.entity_id)&&/^(binary_sensor|cover)\./.test(t)}),Qi=i=>i&&(i.entity_id.startsWith("binary_sensor.")?i.state==="on":!["closed","unavailable","unknown"].includes(i.state));var Cn={sunny:"mdi:weather-night",partlycloudy:"mdi:weather-night-partly-cloudy"},ts=i=>i==null||i==="",On=(i,t)=>i.entity.startsWith("weather.")&&i.show_forecast!==!1&&kt(t,i.forecast_type);function es(i,t,e,s){if(i.hide_when_empty!==!1)return i.infos;let n=new Set(i.infos.map(c=>c.entity)),o=[],r=i.weather&&e.states[i.weather];if(r&&!n.has(i.weather)&&s(i.weather)){let c=Gt(r);o.push({entity:i.weather,state_content:["state","temperature"],...c?{forecast_type:c,forecast_slots:3,ahead:!0}:{}})}for(let c of t){let a=e.states[c.entity];!c.entity.startsWith("calendar.")||n.has(c.entity)||!s(c.entity)||a?.state==="off"&&!ts(a.attributes.message)&&o.push({entity:c.entity,name:c.name,state_content:["message","start_time"]})}return[...i.infos,...o]}function De(i,t,e,s){return[].concat(t??"state").map(o=>{if(o==="state")return s.state(i);if(o==="name")return e;if(/^last[_-](changed|updated)$/.test(o))return s.clock.relative(k(i[o.replace("-","_")],s.now),s.now);let r=i.attributes[o];if(r==null)return"";let c=D(r,s.clock.server);return Number.isFinite(c)?s.clock.relative(c,s.now):s.attr(i,o,r)}).filter(Boolean).join(" \xB7 ")||s.state(i)}function Nn(i,t,e,s){let n=[i.temperature,i.templow].filter(r=>r!=null&&r!==""&&Number.isFinite(Number(r))).map(r=>s.clock.number(Number(r))+"\xB0").join(" / ");return[e==="twice_daily"?i.is_daytime===!1?s.t.wx_night:s.t.wx_day:"",n,i.condition?s.state(t):""].filter(Boolean).join(" \xB7 ")}function Mn(i,t,e){if(!On(i,t))return null;let s=i.forecast_type,n=e.forecast(i.entity,s);if(!n)return[];let o=e.dayOf(e.now),r=n.filter(c=>Number.isFinite(Date.parse(c?.datetime))).filter(c=>s==="daily"?e.dayOf(Date.parse(c.datetime))>=o+(i.ahead?1:0):Date.parse(c.datetime)+(i.ahead?0:Kt[s])>e.now).slice(0,i.forecast_slots||1);return r.length?(e.wake(e.midnight),s!=="daily"&&e.wake(Date.parse(r[0].datetime)+Kt[s]),r):null}function is(i,t){let e=[],s=new Set;for(let n of i){t.watch(n.entity);let o=t.hass.states[n.entity];if(!o||o.state==="unavailable"||o.state==="unknown"||!t.conditionsMet(n.visibility,n.entity))continue;let r="info:"+n.entity;for(;s.has(r);)r+="+";s.add(r);let c=n.color&&n.color!=="state",a=u=>c?et(u)?$i(n.color):"var(--state-inactive-color)":Bt(u),l=t.name(o,n.name),h={kind:"info",info:n,entity:n.entity,row:r,name:l,icon:n.icon,image:n.show_entity_picture?Wt(o.attributes):null},d=Mn(n,o,t);(!d||n.show_current!==!1)&&e.push({...h,key:r,stateObj:o,title:l,color:a(o)});let p=$(n.name)||!ts(n.name)?l:"";(d||[]).forEach((u,g)=>{let f={...o,state:u.condition||"unknown"},m=t.clock.slotLabel(Date.parse(u.datetime),n.forecast_type,t.now);e.push({...h,key:`${r}#${g}`,stateObj:f,title:p||m,text:[p?m:"",Nn(u,f,n.forecast_type,t)].filter(Boolean).join(" \xB7 "),icon:n.icon||u.is_daytime===!1&&Cn[u.condition]||void 0,color:a(f)})})}return e}var Rn=new Set(["state","numeric_state","screen","user","location","time","view_columns"]),ss={and:i=>i.every(Boolean),or:i=>i.some(Boolean),not:i=>!i.every(Boolean)},Dn=["sun","mon","tue","wed","thu","fri","sat"],Pe=i=>i==null?[]:Array.isArray(i)?i:[i],ns=i=>!($(i)&&i.enabled===!1),os=i=>{let[t,e,s]=String(i).split(":").map(n=>parseInt(n,10));return t*3600+e*60+(s||0)},Ie=i=>String(i).padStart(2,"0"),Pn=(i,t,e)=>t>=864e5/1e3?yt(i+1,e):_t(`${gt(i)}T${Ie(Math.floor(t/3600))}:${Ie(Math.floor(t/60)%60)}:${Ie(t%60)}`,e);function In(i,t){let e=Lt(t.now,t.zone),s=M(t.now,t.zone),n=e.hour*3600+e.minute*60+e.second,o=i.after?os(i.after):null,r=i.before?os(i.before):null;for(let c of[o,r==null?null:r+1])c!=null&&[s,s+1].forEach(a=>t.wake(Pn(a,c,t.zone)));return t.wake(yt(s+1,t.zone)),i.weekdays?.length&&!i.weekdays.includes(Dn[new Date(s*864e5).getUTCDay()])?!1:o!=null&&r!=null?r<o?n>=o||n<=r:n>=o&&n<=r:o!=null?n>=o:r==null||n<=r}function rs(i,t,e){let{hass:s}=e,n=!1,o=l=>(e.watch(l),s.states[l]),r=l=>jt(l)&&s.states[l]?o(l).state:void 0,c=l=>{if(!$(l)||"enabled"in l&&typeof l.enabled!="boolean")return!1;let h=l.condition??"state";if(ss[h])return l.conditions==null||ss[h](Pe(l.conditions).filter(ns).map(c));if("entity_id"in l||!Rn.has(h)){let f=e.server(l);return n||=f.failed,f.result}if(h==="screen")return!!l.media_query&&e.media(l.media_query);if(h==="user")return!!(s.user?.id&&l.users?.includes(s.user.id));if(h==="view_columns")return!0;if(h==="time")return In(l,e);if(h==="location"){let f=Object.values(s.states).find(m=>m.entity_id.startsWith("person.")&&m.attributes.user_id===s.user?.id);return f&&e.watch(f.entity_id),!!(f&&l.locations?.includes(f.state))}let d=o(l.entity||t),p=d&&l.attribute?d.attributes[l.attribute]:d?.state;if(h==="numeric_state"){let f=Number(p),m=y=>Number(typeof y=="string"?r(y)??y:y);return!Number.isNaN(f)&&(l.above==null||!(m(l.above)>=f))&&(l.below==null||!(m(l.below)<=f))}let u=l.state??l.state_not;return u===void 0?!1:Pe(u).flatMap(f=>r(f)!==void 0?[f,r(f)]:[f]).includes(String(p??"unknown"))===(l.state!=null)};return Pe(i).filter(ns).map(c).every(Boolean)&&!n}var Ue=i=>i.length>4?`${i.slice(0,4).join(", ")} +${i.length-4}`:i.join(", "),as=i=>i.kind==="generic"&&i.deviceClass&&!i.image&&!i.tap&&!i.actions.length;function Un(i,t){let e=i.entities?.[t],s=e?.device_id&&i.devices?.[e.device_id];return i.areas?.[e?.area_id||s?.area_id]?.name||""}function cs(i,t){let e=new Map;for(let n of i.filter(as))e.has(n.deviceClass)||e.set(n.deviceClass,[]),e.get(n.deviceClass).push(n);let s=[];for(let n of i){let o=as(n)?e.get(n.deviceClass):null;!o||o.length<2?s.push(n):o[0]===n&&s.push(Ln(n.deviceClass,o,t))}return s}function Ln(i,t,e){let s=[...t].sort((o,r)=>r.ts-o.ts),n=[...new Set(s.map(o=>Un(e.hass,o.entity)||o.title))];return{key:"group:"+i,kind:"group",sev:s[0].sev,title:e.alikeTitle(i,t.length),message:Ue(n),ts:s[0].ts,past:!0,icon:s[0].icon,stateObj:s[0].stateObj,members:s,actions:[]}}var ls={en:{idle_title:"All quiet",idle_msg:"No notifications",clear:"Clear all",dismiss:"Dismiss",install:"Install",installing:"Installing",installing_pct:"Installing ({p}%)",just_now:"just now",soon:"in a moment",count_one:"1 notification",count_other:"{n} notifications",event:"Event",notification:"Notification",update:"Update",update_msg:"Update {v} available",update_msg_plain:"Update available",level:"Level {l}",breaks_in:"Stops working in {v}",day_at:"{d} at {t}",date_at:"on {d} at {t}",on_date:"on {d}",paused_left:"Paused, {t} left",act_pause:"Pause",act_resume:"Resume",act_cancel:"Cancel",act_lock:"Lock",act_close_cover:"Close",act_close_valve:"Close",act_dock_vacuum:"Dock",act_dock_mower:"Dock",act_off:"Turn off",act_done:"Done",wx_rain_from:"Rain from {t}",wx_snow_from:"Snow from {t}",wx_thunder_from:"Thunderstorms from {t}",wx_hail_from:"Hail from {t}",wx_rain_now:"It is raining",wx_snow_now:"It is snowing",wx_thunder_now:"Thunderstorm",wx_hail_now:"Hail",wx_chance:"{p} chance",wx_frost_from:"Frost from {t}",wx_low:"Low of {v}",wx_day:"Day",wx_night:"Night"},de:{idle_title:"Alles ruhig",just_now:"gerade eben",soon:"gleich",count_one:"1 Benachrichtigung",count_other:"{n} Benachrichtigungen",event:"Termin",notification:"Benachrichtigung",update_msg:"Update {v} verf\xFCgbar",update_msg_plain:"Update verf\xFCgbar",level:"Stufe {l}",breaks_in:"Funktioniert ab {v} nicht mehr",day_at:"{d} um {t}",date_at:"am {d} um {t}",on_date:"am {d}",paused_left:"Pausiert, noch {t}",act_done:"Erledigt",wx_rain_from:"Regen ab {t}",wx_snow_from:"Schnee ab {t}",wx_thunder_from:"Gewitter ab {t}",wx_hail_from:"Hagel ab {t}",wx_rain_now:"Es regnet",wx_snow_now:"Es schneit",wx_thunder_now:"Gewitter",wx_hail_now:"Hagel",wx_chance:"{p} Wahrscheinlichkeit",wx_frost_from:"Frost ab {t}",wx_low:"Tiefstwert {v}"}},jn={just_now:null,soon:null,day_at:"{d}, {t}",date_at:"{d}, {t}",on_date:"{d}",paused_left:"{s}, {t}"},zn={idle_msg:["ui.notification_drawer.empty"],clear:["ui.notification_drawer.dismiss_all"],dismiss:["ui.card.persistent_notification.dismiss"],install:["ui.dialogs.more_info_control.update.install"],installing:["ui.card.update.installing"],installing_pct:["ui.card.update.installing_with_progress",{progress:"{p}"}],update:["ui.dialogs.more_info_control.update.update"],act_pause:["ui.card.timer.actions.pause"],act_resume:["ui.card.timer.actions.start"],act_cancel:["ui.card.timer.actions.cancel"],act_lock:["ui.card.lock.lock"],act_close_cover:["ui.card.cover.close_cover"],act_close_valve:["ui.card.valve.close_valve"],act_dock_vacuum:["ui.card.vacuum.actions.return_to_base"],act_dock_mower:["ui.card.lawn_mower.actions.dock"],act_off:["ui.card.common.turn_off"],wx_day:["ui.card.weather.day"],wx_night:["ui.card.weather.night"]},Bn={rain:"rainy",snow:"snowy",thunder:"lightning",hail:"hail"},Le=i=>String(i).split("-")[0],Yt=i=>i?.locale?.language||i?.language||"en";function ps(i,t){let e=ls[Le(i)],s={...ls.en,...e||jn},n=(o,r)=>typeof t=="function"&&t(o,r)||"";for(let[o,[r,c]]of Object.entries(zn))s[o]=n(r,c)||s[o];if(!e){let o=n("ui.notification_drawer.title");o&&(s.count_one=s.count_other=o+" ({n})");for(let[r,c]of Object.entries(Bn)){let a=n("component.weather.entity_component._.state."+c);a&&Object.assign(s,{[`wx_${r}_now`]:a,[`wx_${r}_from`]:a+", {t}"})}}return s}var Hn={en:{window:{one:"1 window open",other:"{n} windows open"},door:{other:"{n} doors open"},garage_door:{other:"{n} garage doors open"},opening:{other:"{n} sensors open"},battery:{other:"{n} batteries low"},moisture:{other:"{n} water alarms"},smoke:{other:"{n} smoke alarms"},gas:{other:"{n} gas alarms"},carbon_monoxide:{other:"{n} CO alarms"},heat:{other:"{n} heat alarms"},problem:{other:"{n} problems"},tamper:{other:"{n} tamper alerts"},safety:{other:"{n} safety alerts"},sound:{other:"{n} sounds detected"}},de:{window:{one:"1 Fenster offen",other:"{n} Fenster offen"},door:{other:"{n} T\xFCren offen"},garage_door:{other:"{n} Garagentore offen"},opening:{other:"{n} Sensoren offen"},battery:{other:"{n} Batterien schwach"},moisture:{other:"{n} Wassermelder ausgel\xF6st"},smoke:{other:"{n} Rauchmelder ausgel\xF6st"},gas:{other:"{n} Gasmelder ausgel\xF6st"},carbon_monoxide:{other:"{n} CO-Melder ausgel\xF6st"},heat:{other:"{n} Hitzemelder ausgel\xF6st"},problem:{other:"{n} Probleme"},tamper:{other:"{n} Sabotagealarme"},safety:{other:"{n} Sicherheitswarnungen"},sound:{other:"{n} Ger\xE4usche erkannt"}}};function ms(i,t,e,s){let n=Hn[Le(i)]?.[t];return n?v(e===1&&n.one?n.one:n.other,{n:e}):`${typeof s=="function"&&s(`component.binary_sensor.entity_component.${t}.name`)||je(t)} (${e})`}function je(i){let t=String(i).replace(/[_-]+/g," ").trim();return t.charAt(0).toUpperCase()+t.slice(1)}var ds={en:{label:"Include entities by label",weather:"Weather",updates:"Pending updates",repairs:"Repairs",hide_when_empty:"Hide when there is nothing to show",infos:"Infos",info_options:"Info options",rotate:"Seconds between turns",slide:"Turn",slide_up:"Upwards",slide_side:"Sideways",options:"Entity options",type:"Kind",image:"Picture",background:"Picture as card background",before:"Show ahead of time",audience:"Who sees what",styling:"Styling",css:"CSS",visible:"Visible to",people:"People",system:"System notifications",everyone:"Everyone",only:"Only these people",except:"Everyone except these people",nobody:"Nobody",only_x:"Only {x}",except_x:"Everyone except {x}",type_auto:"Detect automatically",type_calendar:"Calendar event",type_update:"Update",type_alarm:"Alarm panel",type_alert:"Alert",type_timer:"Timer",type_countdown:"Countdown",type_event:"Event",type_todo:"To-do list",type_device:"Device",type_warning:"Warnings",type_attribute:"Details from an attribute",type_picture:"State as title",type_generic:"Plain entity",entities:"Entities",name:"Name",icon:"Icon",attribute:"Attribute",tap_action:"Tap behavior",hold_action:"Hold behavior",double_tap_action:"Double tap behavior",color:"Color",state_content:"State content",time_format:"Time format",show_entity_picture:"Show entity picture",visibility:"Visibility",content_layout:"Content layout",horizontal:"Horizontal",vertical:"Vertical",forecast:"Weather to show",show_both:"Current weather and forecast",show_current:"Only the current weather",show_forecast:"Only the forecast",forecast_type:"Forecast",forecast_slots:"Forecasts to show",daily:"Daily",hourly:"Hourly",twice_daily:"Twice daily"},de:{label:"Entit\xE4ten mit diesem Label einbeziehen",weather:"Wetter",updates:"Ausstehende Updates",repairs:"Reparaturen",hide_when_empty:"Ausblenden, wenn nichts anliegt",infos:"Infos",info_options:"Optionen je Info",rotate:"Sekunden bis zum Wechsel",slide:"Wechsel",slide_up:"Nach oben",slide_side:"Seitlich",options:"Optionen je Entit\xE4t",type:"Art",image:"Bild",background:"Bild als Kartenhintergrund",before:"Im Voraus zeigen",audience:"Wer sieht was",styling:"Gestaltung",css:"CSS",visible:"Sichtbar f\xFCr",people:"Personen",system:"Systembenachrichtigungen",everyone:"Alle",only:"Nur diese Personen",except:"Alle au\xDFer diesen Personen",nobody:"Niemand",only_x:"Nur {x}",except_x:"Alle au\xDFer {x}",type_auto:"Automatisch erkennen",type_calendar:"Kalendertermin",type_update:"Update",type_alarm:"Alarmanlage",type_alert:"Alarm (alert)",type_timer:"Timer",type_countdown:"Countdown",type_event:"Ereignis",type_todo:"To-do-Liste",type_device:"Ger\xE4t",type_warning:"Warnungen",type_attribute:"Details aus einem Attribut",type_picture:"Zustand als Titel",type_generic:"Einfache Entit\xE4t"}},hs={entities:"ui.panel.lovelace.editor.card.generic.entities",name:"ui.panel.lovelace.editor.card.generic.name",icon:"ui.panel.lovelace.editor.card.generic.icon",attribute:"ui.panel.lovelace.editor.card.generic.attribute",tap_action:"ui.panel.lovelace.editor.card.generic.tap_action",hold_action:"ui.panel.lovelace.editor.card.generic.hold_action",double_tap_action:"ui.panel.lovelace.editor.card.generic.double_tap_action",color:"ui.panel.lovelace.editor.card.tile.color",state_content:"ui.panel.lovelace.editor.card.tile.state_content",time_format:"ui.panel.lovelace.editor.card.generic.time_format",show_entity_picture:"ui.panel.lovelace.editor.card.tile.show_entity_picture",visibility:"ui.panel.lovelace.editor.card.heading.entity_config.visibility",visibility_intro:"ui.panel.lovelace.editor.card.heading.entity_config.visibility_explanation",content_layout:"ui.panel.lovelace.editor.card.tile.content_layout",horizontal:"ui.panel.lovelace.editor.card.tile.content_layout_options.horizontal",vertical:"ui.panel.lovelace.editor.card.tile.content_layout_options.vertical",forecast:"ui.panel.lovelace.editor.card.weather-forecast.weather_to_show",show_both:"ui.panel.lovelace.editor.card.weather-forecast.show_both",show_current:"ui.panel.lovelace.editor.card.weather-forecast.show_only_current",show_forecast:"ui.panel.lovelace.editor.card.weather-forecast.show_only_forecast",forecast_type:"ui.panel.lovelace.editor.card.weather-forecast.forecast_type",forecast_slots:"ui.panel.lovelace.editor.card.weather-forecast.forecast_slots",daily:"ui.panel.lovelace.editor.card.weather-forecast.daily",hourly:"ui.panel.lovelace.editor.card.weather-forecast.hourly",twice_daily:"ui.panel.lovelace.editor.card.weather-forecast.twice_daily"},us={en:{label:"Every entity with this label is added and detected automatically.",weather:"Shows rain, snow and frost ahead.",visible:"Applies outside edit mode, like Home Assistant's own card visibility.",people:"Matches the user account linked to each person in Settings \u2192 People.",attribute:"An attribute that holds an object with a name or title, or a plain value. If empty, the card looks for an object with a description or a picture.",attribute_picture:"An attribute that holds an object with a name or title. The object is shown instead of the state.",image:"An attribute, a path into one like book.cover, or a URL. If empty, the card uses the picture of the shown object or of the entity.",background:"Blurred behind the card while this entity is on top.",before:"How long before it starts or is due.",infos:"Shown in turn after what needs attention.",rotate:"At 0 the card holds still.",css:"Goes into the card after its own styles, so you can change any part of it.",visibility_intro:"The info shows while all of these conditions hold."},de:{label:"Jede Entit\xE4t mit diesem Label kommt dazu und wird automatisch erkannt.",weather:"Zeigt Regen, Schnee und Frost im Voraus.",visible:"Gilt au\xDFerhalb des Bearbeitungsmodus, wie die Sichtbarkeit von Home Assistant selbst.",people:"Verglichen wird das Benutzerkonto, das unter Einstellungen \u2192 Personen verkn\xFCpft ist.",attribute:"Ein Attribut, das ein Objekt mit name oder title enth\xE4lt, oder ein einfacher Wert. Bleibt es leer, sucht die Karte ein Objekt mit description oder Bild.",attribute_picture:"Ein Attribut, das ein Objekt mit name oder title enth\xE4lt. Das Objekt erscheint statt des Zustands.",image:"Ein Attribut, ein Pfad darin wie book.cover, oder eine URL. Bleibt es leer, nimmt die Karte das Bild des gezeigten Objekts oder der Entit\xE4t.",background:"Unscharf hinter der Karte, solange diese Entit\xE4t oben steht.",before:"Wie lange vor dem Beginn oder der F\xE4lligkeit.",infos:"Erscheinen im Wechsel nach dem, was anliegt.",rotate:"Bei 0 bleibt die Karte stehen.",css:"Kommt nach den Styles der Karte, so l\xE4sst sich jeder Teil \xE4ndern.",visibility_intro:"Die Info erscheint, solange alle diese Bedingungen erf\xFCllt sind."}};function fs(i,t){let e=Le(i),s=n=>n&&typeof t=="function"&&t(n)||"";return{label:n=>s(hs[n])||ds[e]?.[n]||ds.en[n]||n,helper:n=>n==="visibility_intro"&&s(hs[n])||us[e]?.[n]||us.en[n]}}function _s(i,t){return[...i.values()].map(e=>{let s=Ai(e.message);return{key:"s:"+e.notification_id,kind:"system",title:rt(e.title)||t.t.notification,message:rt(e.message),image:Ei(e.message),ts:k(e.created_at,t.now),past:!0,seq:e.seq,tap:s?wt(s):void 0,dismiss:{service:["persistent_notification","dismiss",{notification_id:e.notification_id}]}}})}var Wn={critical:"crit",error:"crit",warning:"warn"};function gs(i,t){let e=(s,n)=>t.hass.localize?.(s,n)||"";return i.map(s=>{let n=s.translation_key||s.issue_id;return{key:`i:${s.domain}/${s.issue_id}`,kind:"repair",sev:Wn[s.severity]||"warn",title:e(`component.${s.domain}.issues.${n}.title`,s.translation_placeholders||{})||je(n),message:s.breaks_in_ha_version?v(t.t.breaks_in,{v:s.breaks_in_ha_version}):e(`component.${s.issue_domain||s.domain}.title`),ts:k(s.created,t.now),past:!0,tap:wt("/config/repairs"),dismiss:{ws:{type:"repairs/ignore_issue",domain:s.domain,issue_id:s.issue_id,ignore:!0}}}})}var qn=(i,t)=>!i||(i.only?i.only.includes(t):!i.except.includes(t)),ze=(i,t)=>!i.past&&i.ts>t,Be=i=>(t,e)=>typeof e=="string"&&e||i.formatEntityName?.(t,e||void 0)||t.attributes.friendly_name||t.entity_id,He=i=>({state:t=>i.formatEntityState?i.formatEntityState(t):String(t.state),attr:(t,e,s)=>!e.includes(".")&&i.formatEntityAttributeValue?.(t,e,s)||String(s)}),Fn=i=>Array.isArray(i.attributes.entity_id)&&!i.entity_id.startsWith("sensor.")?i.attributes.entity_id.filter(t=>typeof t=="string"):[];function bs(i){let{hass:t,config:e,now:s,data:n}=i,o=new Set,r=[],c=new Set,a=new Set,l=m=>i.preview||qn(e.audience[m],i.viewer),h={...i,t:i.texts,watch:m=>o.add(m),wake:m=>Number.isFinite(m)&&m>s&&r.push(m),midnight:yt(M(s,i.clock.zone)+1,i.clock.zone),dayOf:(m,y=i.clock.zone)=>M(m,y),name:Be(t),...He(t),alikeTitle:(m,y)=>ms(i.clock.lang,m,y,t.localize),members:m=>{let y=Fn(m);return y.forEach(S=>o.add(S)),Ue(y.map(S=>t.states[S]).filter(S=>S&&et(S)).map(S=>h.name(S)))},conditionsMet:(m,y)=>rs(m,y,{hass:t,now:s,zone:i.clock.zone,watch:h.watch,wake:h.wake,media:i.media,server:i.serverCondition})},d=[];l("system")&&d.push(..._s(n.notifications,h)),e.repairs&&i.admin&&l("repairs")&&d.push(...gs(n.repairs,h));let p=[...i.sources];for(let m of i.updates)p.some(y=>y.entity===m)||p.push({entity:m});for(let m of p){let y=m.entity;if(o.add(y),!l(y)||y.startsWith("update.")&&!l("updates"))continue;let S=t.states[y];d.push(...zi(m,S,h)),S&&S.state!=="unavailable"&&S.state!=="unknown"&&a.add(y)}let u=e.weather&&t.states[e.weather];if(u&&l(e.weather)){o.add(e.weather);let m=Gt(u),y=m&&n.forecast(e.weather,m);if(y){let S=()=>(i.windows.forEach(de=>o.add(de)),i.windows.filter(de=>Qi(t.states[de])).length);d.push(...Ji(u,y,m,{...h,openWindows:S})),c.add(`wx:${e.weather}:wet`).add(`wx:${e.weather}:frost`)}}let g=d.filter(m=>m.expires<=s?!1:(h.wake(m.expires),m.live&&h.wake(m.ts),!0));g.some(m=>m.day||m.kind==="calendar")&&h.wake(h.midnight);let f=is(es(e,i.sources,t,l),{...h,forecast:n.forecast});return{entries:g,slides:f,watched:o,wakes:r,known:c,available:a,ctx:h}}var ys=(i,t)=>Number.isFinite(i.ts)?i.past?t-i.ts:Math.abs(i.ts-t):1/0;function Vn(i,t){return i.sort((e,s)=>(s.sev==="crit")-(e.sev==="crit")||ys(e,t)-ys(s,t)||(s.seq||0)-(e.seq||0)||(e.key<s.key?-1:e.key>s.key?1:0))}function Kn(i,t){let e=1/0;for(let s=1;s<i.length;s++){let[n,o]=[i[s-1],i[s]];n.sev==="crit"!=(o.sev==="crit")||!ze(o,t)||!(o.ts>n.ts)||(e=Math.min(e,Math.max((n.ts+o.ts)/2,t+1)))}return e}function ws(i,t){let e=Vn(cs(i,t),t.now);return t.wake(Kn(e,t.now)),e}var vs=(i,t)=>i.length?Math.min(Math.max(Math.min(...i)-t,0),864e5)+50:null;var Gn={fast:150,normal:250,slow:350};function U(i,t){let e=getComputedStyle(i).getPropertyValue(`--ha-animation-duration-${t}`).trim(),s=parseFloat(e);return Number.isFinite(s)?e.endsWith("ms")?s:s*1e3:Gn[t]}var Yn=i=>1-Math.exp(-8*i)*(Math.cos(6*i)+8/6*Math.sin(6*i)),ks=`linear(${Array.from({length:33},(i,t)=>t===32?1:+Yn(t/32).toFixed(3)).join(", ")})`,O={standard:"cubic-bezier(0.4, 0, 0.2, 1)",out:"cubic-bezier(0.4, 0, 1, 1)",in:"cubic-bezier(0, 0, 0.2, 1)"},at=class{constructor(t){this.onGone=t,this.rendered=[],this.ghosts=new Map,this.before=new Map}withLeaving(t,e){e||this.ghosts.clear();let s=new Set(t.map(o=>o.key));for(let o of this.ghosts.keys())s.has(o)&&this.ghosts.delete(o);let n=[...t];return this.rendered.forEach((o,r)=>{if(s.has(o.key))return;e&&!o.leaving&&!this.ghosts.has(o.key)&&this.ghosts.set(o.key,{...o,leaving:!0});let c=this.ghosts.get(o.key);if(!c)return;let a=n.findIndex(l=>l.key===this.rendered[r-1]?.key);n.splice(a<0?Math.min(r,n.length):a+1,0,c)}),this.rendered=n,n}measure(t){this.before=new Map([...t?.children||[]].map(e=>[e.dataset.key,e.offsetTop]))}play(t,e){if(!t||!e)return;let s=U(t,"fast"),n=U(t,"normal"),o=getComputedStyle(t).direction==="rtl"?"-16px":"16px";for(let r of t.children){let c=r.dataset.key;if(r.dataset.leaving&&!this.ghosts.has(c)&&(r.getAnimations().forEach(a=>a.cancel()),delete r.dataset.leaving),this.ghosts.has(c)){if(r.dataset.leaving)continue;r.dataset.leaving="1",this.run(r,[{opacity:1,gridTemplateRows:"1fr",transform:"none",easing:O.out},{opacity:0,gridTemplateRows:"1fr",transform:`translateX(${o})`,offset:s/(s+n),easing:O.standard},{opacity:0,gridTemplateRows:"0fr",transform:`translateX(${o})`}],s+n,()=>{this.ghosts.delete(c),this.onGone()})}else if(!this.before.has(c))this.run(r,[{opacity:0,gridTemplateRows:"0fr",easing:O.standard},{opacity:0,gridTemplateRows:"1fr",offset:n/(s+n),easing:O.in},{opacity:1,gridTemplateRows:"1fr"}],s+n);else{let a=this.before.get(c)-r.offsetTop;Math.abs(a)>1&&r.animate([{transform:`translateY(${a}px)`},{transform:"none"}],{duration:n,easing:O.standard})}}}run(t,e,s,n){t.classList.add("moving"),t.animate(e,{duration:s,fill:n?"forwards":"none"}).finished.then(()=>{t.classList.remove("moving"),n?.()},()=>{})}};var xs=(i,t,e)=>{let s=new Map;for(let n=t;n<=e;n++)s.set(i[n],n);return s},$s=nt(class extends H{constructor(i){if(super(i),i.type!==Dt.CHILD)throw Error("repeat() can only be used in text expressions")}dt(i,t,e){let s;e===void 0?e=t:t!==void 0&&(s=t);let n=[],o=[],r=0;for(let c of i)n[r]=s?s(c,r):r,o[r]=e(c,r),r++;return{values:o,keys:n}}render(i,t,e){return this.dt(i,t,e).values}update(i,[t,e,s]){let n=fi(i),{values:o,keys:r}=this.dt(t,e,s);if(!Array.isArray(n))return this.ut=r,o;let c=this.ut??=[],a=[],l,h,d=0,p=n.length-1,u=0,g=o.length-1;for(;d<=p&&u<=g;)if(n[d]===null)d++;else if(n[p]===null)p--;else if(c[d]===r[u])a[u]=q(n[d],o[u]),d++,u++;else if(c[p]===r[g])a[g]=q(n[p],o[g]),p--,g--;else if(c[d]===r[g])a[g]=q(n[d],o[g]),ot(i,a[g+1],n[d]),d++,g--;else if(c[p]===r[u])a[u]=q(n[p],o[u]),ot(i,n[d],n[p]),p--,u++;else if(l===void 0&&(l=xs(r,u,g),h=xs(c,d,p)),l.has(c[d]))if(l.has(c[p])){let f=h.get(r[u]),m=f!==void 0?n[f]:null;if(m===null){let y=ot(i,n[d]);q(y,o[u]),a[u]=y}else a[u]=q(m,o[u]),ot(i,n[d],m),n[f]=null;u++}else It(n[p]),p--;else It(n[d]),d++;for(;u<=g;){let f=ot(i,a[g+1]);q(f,o[u]),a[u++]=f}for(;d<=p;){let f=n[d++];f!==null&&It(f)}return this.ut=r,Pt(i,a),N}});var Xn={system:"var(--info-color)",repair:"var(--warning-color)"};function Xt(i){return i.sev==="crit"?"var(--error-color)":i.sev==="warn"?"var(--warning-color)":i.color||(i.stateObj?Bt(i.stateObj):Xn[i.kind]||"var(--state-icon-color)")}function Jt(i){return i.inert?null:i.tap||(i.entity?{entity:i.entity,tap_action:{action:"more-info"}}:null)}function We(i,t){if(!t)return null;try{return i.hassUrl(t)}catch{return null}}var Jn=(i,t)=>i.icon||t.entities?.[i.stateObj?.entity_id]?.icon||i.stateObj?.attributes.icon||C[i.kind]||C.generic;function Zt(i,t){let e=We(t,i.image);return b`${e?b`<img
        src=${e}
        alt=""
        decoding="async"
        draggable="false"
        referrerpolicy="no-referrer"
        @load=${s=>s.target.classList.add("ready")}
        @error=${s=>s.target.classList.remove("ready")}
      />`:_}${i.stateObj&&customElements.get("ha-state-icon")?b`<ha-state-icon .hass=${t} .stateObj=${i.stateObj} .icon=${i.icon}></ha-state-icon>`:b`<ha-icon .icon=${Jn(i,t)}></ha-icon>`}`}function Ss(i,t){if(!Number.isFinite(i.ts))return b`<time class="time"></time>`;let e=t.clock.server,s=i.day?gt(M(i.ts,e)):new Date(i.ts).toISOString(),n=i.day?t.clock.absoluteDate(i.ts,e):t.clock.absolute(i.ts);return b`<time class="time" datetime=${s} title=${n}>${t.clock.entryTime(i,t.now)}</time>`}var As=i=>[".message",".title"].some(t=>{let e=i.querySelector(t);return e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1}),Zn=i=>{let t=i.getSelection?.()||document.getSelection();return!!(t&&!t.isCollapsed&&String(t).trim())},Qn=i=>t=>{t.key!=="Enter"&&t.key!==" "||(t.preventDefault(),t.stopPropagation(),i())};function to(i,t){let e=Jt(i),s=()=>e&&t.run(e),n=r=>{let c=r.currentTarget;Zn(c.getRootNode())||(c.classList.contains("open")||As(c)?t.toggle(i.key):s())},o=!!i.message||!Number.isFinite(i.ts);return b`<div class=${W({item:!0,leaving:!!i.leaving})} role="listitem" data-key=${i.key}><div class="clip">
    <div
      class="row ${W({warn:i.sev==="warn",crit:i.sev==="crit",link:!!e,open:t.opened.has(i.key)})}"
      data-kind=${i.kind}
      style="--tile-color: ${Xt(i)}"
      @click=${n}
      @pointerenter=${r=>r.currentTarget.classList.toggle("expandable",As(r.currentTarget))}
    >
      <div
        class="icon"
        role=${e?"button":_}
        tabindex=${e?"0":_}
        aria-label=${e?i.title:_}
        @click=${r=>e&&(r.stopPropagation(),s())}
        @keydown=${e?Qn(s):_}
      >
        ${Zt(i,t.hass)}
      </div>
      <div class="title">${i.title}</div>
      <div class="meta">
        ${o?Ss(i,t):_}
        ${Ft(i)?b`<button class="dismiss" type="button" aria-label=${t.texts.dismiss} title=${t.texts.dismiss} @click=${r=>(r.stopPropagation(),t.dismiss(i,r.detail===0))}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>`:_}
      </div>
      <div class="message">${i.message||(o?"":Ss(i,t))}</div>
      ${i.actions?.length?b`<div class="actions">
            ${i.actions.map(r=>b`<button class="action" type="button" ?disabled=${r.disabled} @click=${c=>(c.stopPropagation(),t.run(r.action))}>${r.label}</button>`)}
          </div>`:_}
    </div>
  </div></div>`}function Qt(i,t,e){let s=[...i.querySelectorAll(".item:not(.leaving)")];(s[Math.min(t,s.length-1)]?.querySelector(".dismiss, .icon[role=button]")||e)?.focus({preventScroll:!0})}var te=(i,t)=>$s(i,e=>e.key,e=>to(e,t));var ee=(i,t)=>At(i.renderRoot,[...i.constructor.elementStyles,St(t)]),ie=R`
  .list {
    display: flex;
    flex-direction: column;
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
  .item + .item .row {
    margin-top: 2px;
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
`,se=R`
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
`,ne=R`
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
`,Es=R`
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
  .head [data-long] {
    text-overflow: clip;
    mask: linear-gradient(to right, transparent, #000 16px, #000 calc(100% - 16px), transparent) -16px 0 / calc(100% + 16px) 100% no-repeat;
  }
  .head :is([data-long], .leaving div) > span {
    display: inline-block;
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
`;var eo=i=>i.unsub.then(t=>t()).catch(()=>{}),oe=class{constructor(){this.subs=new Map}sync(t){for(let[e,s]of this.subs){let n=t.get(e);n&&!(s.failed&&s.retryOn!==n.retryOn)||(this.subs.delete(e),eo(s))}for(let[e,{start:s,retryOn:n}]of t){if(this.subs.has(e))continue;let o={retryOn:n,failed:!1};o.unsub=Promise.resolve().then(s),o.unsub.catch(()=>o.failed=!0),this.subs.set(e,o)}}clear(){this.sync(new Map)}};var qe=z+"-dialog",io=300,so=2*6e4,Ts=1500,Cs=30,Os=16,no=["connection","user","locale","config","localize","entities","devices","areas","services","themes","formatEntityState","formatEntityName","formatEntityAttributeValue"],ct=(i,t,e)=>i.dispatchEvent(new CustomEvent(t,{bubbles:!0,composed:!0,detail:e})),re=class extends E{static styles=[ne,se,ie,Es];static properties={preview:{type:Boolean,reflect:!0}};constructor(){super(),this.connectedWhileHidden=!0,this.preview=!1,this._data={notifications:new Map,repairs:[],todos:new Map,forecasts:new Map,conditions:new Map},this._seq=0,this._subs=new oe,this._dismissals=new qt(()=>this._refresh()),this._onDetails=()=>this._refresh(),this._motion=new at(()=>this.requestUpdate()),this._entries=[],this._slides=[],this._turnable=[],this._watched=[],this._wakes=[],this._opened=new Set,this._things=new Map,this._media=new Map,this._backdrops=[{},{}],this._open=!1,this._visible=!0,this._cycleKey=0,this._now=Date.now();for(let t of["ha-state-icon","state-display","ha-ripple"])customElements.get(t)||customElements.whenDefined(t).then(()=>this.requestUpdate())}static getConfigElement(){return document.createElement(z+"-editor")}static getStubConfig(){return{}}setConfig(t){this._config=zt(t),this.classList.toggle("vertical",this._config.vertical),this.classList.toggle("bounded",typeof t.grid_options?.rows=="number"),this._derived=null,this._refresh(),this._cycle()}set hass(t){let e=this._hass;this._hass=t,(!e||no.some(s=>e[s]!==t[s])||this._watched.some(s=>e.states[s]!==t.states[s]))&&this._refresh()}get hass(){return this._hass}getCardSize(){return this._open?1+this.listed().length:this._config?.vertical?2:1}getGridOptions(){return{columns:12,rows:"auto",min_columns:this._config?.vertical?3:6}}connectedCallback(){super.connectedCallback(),clearTimeout(this._collapseTimer);let t=this.getRootNode().host?.localName;this.classList.toggle("docked",t==="hui-view-footer"),this._inPicker=t==="hui-card-picker",this._dismissals.connect(),this._onVisibility||=()=>this._onView(this._visible),document.addEventListener("visibilitychange",this._onVisibility),this._resize||=new ResizeObserver(([s])=>this._onResize(s.contentRect.width)),this._view||=window.IntersectionObserver&&new IntersectionObserver(s=>this._onView(s.at(-1).isIntersecting),{threshold:.01}),this._view?.observe(this);let e=this.renderRoot?.querySelector("ha-card");e&&this._resize.observe(e),this._painted=!1,this._intro=!0,this._refresh(),this._cycle()}disconnectedCallback(){super.disconnectedCallback(),this._subs.clear(),this._dismissals.disconnect(),this._gestures?.reset();for(let t of this._media.values())t.onchange=null;this._media.clear(),document.removeEventListener("visibilitychange",this._onVisibility),this._resize?.disconnect(),this._view?.disconnect(),[this._wakeTimer,this._clock,this._turnTimer,this._repairsTimer].forEach(clearTimeout),this._collapseTimer=setTimeout(()=>this._setOpen(!1),150)}_derive(){let t=this._hass,e=this._config,s=[e,t.entities,t.devices,t.locale,t.localize,t.config,t.user];if(this._derived?.key.every((d,p)=>d===s[p]))return this._derived;let n=Yt(t),o=ps(n,t.localize),r=t.entities||{},c=new Set(e.entities.map(d=>d.entity)),a=e.label?Object.keys(r).filter(d=>!c.has(d)&&r[d]?.labels?.includes(e.label)):[],l=[...new Set(Object.values(e.audience).flatMap(d=>d.only||d.except))],h=new Map;for(let[d,p]of Object.entries(r))p?.device_id&&/^(image|camera)\./.test(d)&&h.set(p.device_id,[...h.get(p.device_id)||[],d].sort().reverse());return this._derived={key:s,lang:n,texts:o,clock:new Ut(t,n,o),sources:[...e.entities,...a.map(d=>({entity:d}))],people:l,viewer:l.find(d=>t.states[d]?.attributes.user_id===t.user?.id)||"",updates:e.updates?[...new Set([...Object.keys(t.states),...Object.keys(r)])].filter(d=>d.startsWith("update.")):[],windows:e.weather?Zi(t.states):[],pictures:d=>h.get(r[d]?.device_id)||[]},this._derived}_refresh(){let t=this._hass;if(!t||!this._config)return;let e=this._derive(),s=this._data,n=Date.now(),o={todos:new Set,forecasts:new Map,conditions:new Map},r=bs({hass:t,config:this._config,now:n,texts:e.texts,clock:e.clock,admin:!!t.user?.is_admin,viewer:e.viewer,preview:this.preview,sources:e.sources,updates:e.updates,windows:e.windows,devicePictures:e.pictures,details:d=>Hi(t,d,this._onDetails),todos:d=>(o.todos.add(d),s.todos.get(d)),media:d=>this._matches(d),serverCondition:d=>{let p=JSON.stringify(d);return o.conditions.set(p,d),s.conditions.get(p)||{result:!1,failed:!1}},data:{notifications:s.notifications,repairs:s.repairs,forecast:(d,p)=>(o.forecasts.set(`${d}|${p}`,[d,p]),s.forecasts.get(`${d}|${p}`))}});this._sync(o);for(let d of r.entries)(d.kind==="attribute"||d.kind==="picture")&&this._things.set(d.key,d.entity);let c=new Set([...r.known,...[...this._things].filter(([,d])=>r.available.has(d)).map(([d])=>d)]),a=ws(this._dismissals.apply(r.entries,c,n,r.ctx.wake),r.ctx),l=this._seen&&a.find(d=>!this._seen.has(d.key)&&Math.abs(n-d.ts)<so);l&&(this._say=[l.title,l.message].filter(Boolean).join(". ")),this._seen=new Set(a.map(d=>d.key)),this._entries=a,this._slides=r.slides,this._watched=[...r.watched,...e.people],this._wakes=r.wakes,this._now=n,this._pick(l),clearTimeout(this._wakeTimer);let h=this.isConnected?vs(this._wakes,n):null;h!==null&&(this._wakeTimer=setTimeout(()=>this._refresh(),h)),this._tick(),this.requestUpdate(),this._dialog?.requestUpdate()}_sync(t){let e=this._hass,s=e.connection,n=new Map,o=(r,c,a,l)=>n.set(r,{retryOn:l,start:()=>s.subscribeMessage(a,c)});if(s&&this.isConnected){o("notifications",{type:"persistent_notification/subscribe"},r=>this._onNotifications(r)),this._config.repairs&&e.user?.is_admin&&n.set("repairs",{start:()=>(this._fetchRepairs(),s.subscribeEvents(()=>{clearTimeout(this._repairsTimer),this._repairsTimer=setTimeout(()=>this._fetchRepairs(),500)},"repairs_issue_registry_updated"))});for(let r of t.todos)o("todo|"+r,{type:"todo/item/subscribe",entity_id:r},c=>this._store("todos",r,c.items||[]),e.states[r]);for(let[r,[c,a]]of t.forecasts)o("forecast|"+r,{type:"weather/subscribe_forecast",entity_id:c,forecast_type:a},l=>this._store("forecasts",r,l.forecast||[]),e.states[c]);for(let[r,c]of t.conditions)o("condition|"+r,{type:"subscribe_condition",condition:c},a=>this._store("conditions",r,{result:a.result===!0,failed:!!a.error}))}this._subs.sync(n)}_store(t,e,s){this._data[t].set(e,s),this._refresh()}_onNotifications({type:t,notifications:e={}}){t==="current"&&(this._data.notifications=new Map);for(let[s,n]of Object.entries(e))t==="removed"?this._data.notifications.delete(s):this._data.notifications.set(s,{...n,seq:++this._seq});this._refresh()}async _fetchRepairs(){let t=this._hass;try{let{issues:e=[]}=await t.callWS({type:"repairs/list_issues"});if(this._data.repairs=e.filter(s=>!s.ignored),this._refresh(),!this._data.repairs.length)return;await t.loadBackendTranslation?.("issues",[...new Set(this._data.repairs.map(s=>s.domain))]),await t.loadBackendTranslation?.("title",[...new Set(this._data.repairs.map(s=>s.issue_domain||s.domain))])}catch{}}_matches(t){if(!this._media.has(t)){let e=window.matchMedia(t);e.onchange=()=>this._refresh(),this._media.set(t,e)}return this._media.get(t).matches}listed(){let t=new Map;for(let e of this._slides)t.has(e.row)||t.set(e.row,e);return[...this._entries,...[...t.values()].map(e=>this._infoRow(e))]}_formatters(){return{...He(this._hass),clock:this._derive().clock,now:this._now}}_infoRow(t){let e=this._hass.states[t.entity],s=this._infoAction(t,"tap");return{key:t.row,kind:"info",title:t.name,message:De(e,t.info.state_content,t.name,this._formatters()),icon:t.icon,image:t.image,stateObj:e,color:t.color,ts:NaN,tap:s,inert:!s,actions:[]}}_infoAction(t,e){let s=t.info,n={entity:t.entity,tap_action:s.tap_action||{action:"more-info"},hold_action:s.hold_action,double_tap_action:s.double_tap_action},o=n[e+"_action"];return o&&o.action!=="none"?{...n,gesture:e}:null}_run({gesture:t="tap",...e}){ct(this,"hass-action",{config:e,action:t})}dismiss(t){let e=this._hass;this._dismissals.dismiss(t,s=>s.service?e.callService(...s.service):e.callWS(s.ws))}_pick(t){let e=this._entries.filter(a=>a.sev==="crit"),s=e.length?e:[...this._entries,...this._slides],n=s[0]||null,o=!!(n&&n.kind!=="info"&&n.key!==this._topKey);this._topKey=n?.key,this._turnable=s;let r=s.find(a=>a.key===this._shown?.key),c=t&&this._config.rotate?s.find(a=>a.key===t.key):null;c?(r=c,this._byHand=!1):(!r||o||!this._turned||!(this._config.rotate||this._byHand))&&(r=n),this._show(r,1,this._config.slide==="side")}_show(t,e,s){let n=this._shown;if(this._shown=t,t?.key===n?.key)return;this._cycle();let o=this.renderRoot?.querySelector(".slide:not(.leaving)");n&&o&&this._animate()&&!this._open?this._turn(n,o,e,s):o&&(o.style.transform=o.style.opacity="")}async _turn(t,e,s,n){let o=getComputedStyle(e),r={transform:o.transform,opacity:o.opacity,filter:o.filter},c=[...e.querySelectorAll(":scope > div")].map(u=>({long:u.hasAttribute("data-long"),mask:getComputedStyle(u).maskPosition,shift:getComputedStyle(u.firstElementChild).transform}));e.style.transform=e.style.opacity="",this._turnAnims?.forEach(u=>u.cancel());let a=s*(n&&this._rtl()?-1:1),l=this._leaving={entry:t,side:n};await this.updateComplete,this.renderRoot.querySelectorAll(".slide.leaving > div").forEach((u,g)=>{let f=c[g]||{};u.toggleAttribute("data-long",!!f.long),u.style.maskPosition=f.mask||"",u.firstElementChild.style.transform=f.shift||""});let h={duration:U(this,"slow")*.8,easing:O.out,fill:"forwards"},[d,p]=n?["X",24]:["Y",12];this._turnAnims=[this.renderRoot.querySelector(".slide.leaving").animate([r,{transform:`translate${d}(${-a*p}px)`,opacity:0,filter:"blur(4px)"}],h),this.renderRoot.querySelector(".head .glyph.leaving").animate([{opacity:1},{opacity:0,transform:"scale(0.8)",filter:"blur(2px)"}],h),...this._enter(a,n,U(this,"slow")*.35)],await Promise.all(this._turnAnims.map(u=>u.finished)).catch(()=>{}),this._leaving===l&&(this._leaving=null,this.requestUpdate())}_enter(t,e,s=0){let[n,o]=e?["X",24]:["Y",12],r={duration:U(this,"slow")*2,delay:s,easing:ks,fill:"backwards"};return[this.renderRoot.querySelector(".slide:not(.leaving)").animate([{transform:`translate${n}(${t*o}px)`,opacity:0,filter:"blur(4px)"},{transform:"none",opacity:1,filter:"none"}],r),this.renderRoot.querySelector(".head .glyph:not(.leaving)").animate([{opacity:0,transform:"scale(0.8)",filter:"blur(2px)"},{opacity:1,transform:"none",filter:"none"}],r)]}_step(t,e){let s=this._turnable;if(s.length<2)return;this._turned=!0,e!=="auto"&&(this._byHand=!0);let n=Math.max(0,s.findIndex(o=>o.key===this._shown?.key));this._show(s[(n+t+s.length)%s.length],t,e==="swipe"||this._config.slide==="side"),this._tick()}_cycle(){this._cycleKey++,this._cycleAt=Date.now(),this._turnAfter(this._config?.rotate*1e3),this.requestUpdate()}_turnAfter(t){clearTimeout(this._turnTimer),t>0&&this.isConnected&&(this._turnTimer=setTimeout(()=>this._autoTurn(),t-(Date.now()-this._cycleAt)))}_autoTurn(){let t=this._shown;this._config.rotate>0&&this._visible&&!document.hidden&&!this._open&&!this._dialog&&!this._gestures?.press&&this._step(1,"auto"),this._shown===t&&this._cycle()}_scroll(){this._scrolled=this._cycleKey;let t=this._shown?.key,e=this._scrollLast,s=!!(e&&e.key===t&&!e.back&&e.anim?.playState==="finished");this._scrollAnims?.forEach(a=>a.cancel()),this._scrollAnims=[];let n=this.preview||this._matches("(prefers-reduced-motion: reduce)"),o=this._rtl(),r=0;for(let a of this.renderRoot.querySelectorAll(".head .slide:not(.leaving) > div")){let l=n?0:a.scrollWidth-a.clientWidth;if(a.toggleAttribute("data-long",l>1),l<=1)continue;r=Math.max(r,l);let h={delay:Ts,duration:l/Cs*1e3,easing:"ease-in-out",fill:"both",direction:s?"reverse":"normal"},d=o?["0 0",`${-Os}px 0`]:[`${-Os}px 0`,"0 0"];this._scrollAnims.push(a.firstElementChild.animate([{transform:"none"},{transform:`translateX(${o?l:-l}px)`}],h),a.animate(d.map(p=>({maskPosition:p})),h))}this._scrollLast={key:t,back:s,anim:this._scrollAnims[0]};let c=Math.max(this._config.rotate*1e3,r&&2*Ts+r/Cs*1e3);this.renderRoot.querySelector(".head .cycle")?.style.setProperty("--origami-cycle",`${c}ms`),c>this._config.rotate*1e3&&this._turnAfter(c)}_tick(){if(clearTimeout(this._clock),!this.isConnected||!this._visible||document.hidden)return;let t=Date.now(),e=this._open||!!this._dialog,s=this._shown?.kind!=="info"?this._shown:null,n=(e?this._entries:s?[s]:[]).find(r=>r.clock&&r.ts>t),o=0;n?o=(n.ts-t)%1e3||1e3:(e||this._entries.some(r=>ze(r,t))||s&&this._headTime(s))&&(o=6e4-t%6e4),o&&(this._clock=setTimeout(()=>{this._now=Date.now(),this.requestUpdate(),this._dialog?.requestUpdate(),this._tick()},o))}_headTime(t){return!!(t.live||!t.message&&Number.isFinite(t.ts))}_onView(t){this._visible=t,this._now=Date.now(),this.requestUpdate(),this._tick()}_onResize(t){Math.round(t)!==this._width&&(this._width=Math.round(t),this._cycle());let e=t>0&&t<io;e!==this.classList.contains("narrow")&&(this.classList.toggle("narrow",e),this.requestUpdate())}_rtl(){return getComputedStyle(this).direction==="rtl"}_animate(){return!!(this._painted&&!this.preview&&this.isConnected&&this.getClientRects().length)}_empty(){return!this._entries.length&&!this._slides.length&&this._config.hide_when_empty&&!this.preview&&!this._inPicker}_setOpen(t){t!==this._open&&(this._open=t,this._settled=!1,clearTimeout(this._settleTimer),t&&(this.classList.toggle("capped",getComputedStyle(this).getPropertyValue("--origami-max-height").trim()!==""),this._settleTimer=setTimeout(()=>{this._settled=!0,this.requestUpdate()},this._animate()?U(this,"normal"):0)),t||this._cycle(),this.requestUpdate(),this._tick())}_toggle(){if(!this.listed().length)return;if(!this._open&&this.classList.contains("narrow")&&!this.preview&&customElements.get("ha-adaptive-dialog")){ct(this,"show-dialog",{dialogTag:qe,dialogImport:()=>Promise.resolve(),dialogParams:{card:this}});return}let t=!!this.renderRoot.activeElement;this._setOpen(!this._open),t&&this.updateComplete.then(()=>this.renderRoot.querySelector(this._open?".bar":".head").focus({preventScroll:!0}))}_tap(){let t=this.listed(),e=t.length===1&&Jt(t[0]);e?this._run(e):this._toggle()}_tappable(t){let e=this._shown;return t.length>1||!!(t[0]&&Jt(t[0]))||e?.kind==="info"&&["hold","double_tap"].some(s=>this._infoAction(e,s))}_gestureAction(t){let e=this._shown?.kind==="info"&&this._infoAction(this._shown,t);return e?()=>this._run(e):null}firstUpdated(){let t=this.renderRoot.querySelector(".head");this._resize.observe(this.renderRoot.querySelector("ha-card")),this._gestures=new Vt(t,{canDrag:()=>this._turnable.length>1&&!this._open,drag:e=>{let s=this.renderRoot.querySelector(".slide:not(.leaving)");s.style.transform=`translateX(${e*.6}px)`,s.style.opacity=String(Math.max(.2,1-Math.abs(e)/160))},dragEnd:e=>{if(e)return this._step(e,"swipe");let s=this.renderRoot.querySelector(".slide:not(.leaving)"),n={transform:s.style.transform||"none",opacity:s.style.opacity||"1"};s.style.transform=s.style.opacity="",s.animate([n,{transform:"none",opacity:1}],{duration:U(this,"normal"),easing:O.standard})},step:e=>this._step(e,"key"),tap:()=>this._tap(),holdAction:()=>this._gestureAction("hold"),doubleTapAction:()=>this._gestureAction("double_tap"),rtl:()=>this._rtl()})}willUpdate(t){t.has("preview")&&this._refresh(),this._updateBackdrop(this._shown?.backdrop?We(this._hass,this._shown.image):null),this._listMotion=this._open&&this._animate(),this._listMotion&&this._motion.measure(this.renderRoot.querySelector(".list"))}updated(){!this._config||!this._hass||(this._motion.play(this.renderRoot.querySelector(".list"),this._listMotion),this._setHidden(this._empty()),this.classList.toggle("dark",!!this._hass.themes?.darkMode),this.classList.toggle("with-backdrop",this._backdrops.some(t=>t.on)),this._css!==this._config.css&&(this._css=this._config.css,ee(this,this._css||"")),this._refocus!=null&&this._focusRow(this._refocus),this._intro&&this._playIntro(),this._scrolled!==this._cycleKey&&this._scroll())}_playIntro(){this._intro=!1;let t=this._config.slide==="side";this._turnable.length>1&&!this.preview&&this.getClientRects().length&&this._enter(t&&this._rtl()?-1:1,t),requestAnimationFrame(()=>this._painted=!0)}_setHidden(t){if(t===!!(this._hiding||this.hidden))return;this._hostAnim?.cancel();let e=getComputedStyle(this).height,s=!this.classList.contains("bounded"),[n,o]=[U(this,"fast"),U(this,"normal")];if(t){if(!this._animate())return this._gone();this._hiding=!0,this.classList.add("hiding");let a=[{opacity:1,height:e,easing:O.out},{opacity:0,height:e,offset:n/(n+o),easing:O.standard},{opacity:0,height:s?"0px":e}],l=this._hostAnim=this.animate(a,{duration:n+o,fill:"forwards"});l.finished.then(()=>this._hostAnim===l&&this._gone(),()=>{});return}if(this._hiding=!1,this.classList.remove("hiding"),!this.hidden||(this.hidden=!1,ct(this,"card-visibility-changed",{value:!0}),!this._animate()))return;let r=getComputedStyle(this).height,c=s?[{height:"0px",opacity:0,easing:O.standard},{height:r,opacity:0,offset:o/(n+o),easing:O.in},{height:r,opacity:1}]:[{opacity:0},{opacity:1}];this._hostAnim=this.animate(c,{duration:n+o})}_gone(){this._hostAnim?.cancel(),this._hostAnim=null,this._hiding=!1,this.classList.remove("hiding"),this.hidden=!0,ct(this,"card-visibility-changed",{value:!1}),this._setOpen(!1)}_focusRow(t){this._refocus=null,Qt(this.renderRoot,t,this.renderRoot.querySelector(this._open?".bar":".head"))}rowView(t){let e=this._derive();return{hass:this._hass,texts:e.texts,clock:e.clock,now:this._now,opened:this._opened,run:s=>this._run(s),toggle:s=>{this._opened.delete(s)||this._opened.add(s),this.requestUpdate(),this._dialog?.requestUpdate()},dismiss:(s,n)=>{let o=this.listed().findIndex(r=>r.key===s.key);this.dismiss([s]),n&&t(o)}}}setDialog(t){this._dialog=t,this._tick(),t||this._cycle()}get gone(){return this.hidden||!!this._hiding}get css(){return this._config.css||""}get texts(){return this._derive().texts}dismissible(){return this._entries.length>1?this._entries.filter(Ft):[]}listTitle(){let t=this._entries.length,e=this._derive().texts;return t?v(t===1?e.count_one:e.count_other,{n:t}):e.idle_title}_secondary(t,e){return t?t.kind!=="info"?this._headTime(t)?this._derive().clock.entryTime(t,this._now):t.message:t.text!=null?t.text:customElements.get("state-display")?b`<state-display .hass=${this._hass} .stateObj=${t.stateObj} .content=${t.info.state_content} .timeFormat=${t.info.time_format} .name=${t.title}></state-display>`:De(t.stateObj,t.info.state_content,t.title,this._formatters()):e.idle_msg}_slideTemplate(t,e,s){let n=t&&t.kind!=="info"&&this._headTime(t),o=this._secondary(t,e),r=c=>ft(t?.key,b`<span>${c}</span>`);return b`
      <div class="slide ${s?"leaving":""}" aria-hidden=${s?"true":_}>
        <div class="title">${r(t?t.title:e.idle_title)}</div>
        ${o?b`<div class="secondary ${n?"time":""}" aria-live=${n&&!s?"off":_}>${r(o)}</div>`:_}
      </div>
    `}render(){if(!this._config||!this._hass)return _;let t=this._derive().texts,e=this._shown,s=this.listed(),n=this._tappable(s),o=s.length>1,r=this.classList.contains("narrow"),c=this._entries.length,a=this._leaving,l=this.dismissible();return b`
      <ha-card
        class=${W({open:this._open,crit:e?.sev==="crit",tappable:n,settled:this._open&&this._settled})}
        style="--tile-color: ${e?Xt(e):"var(--state-inactive-color)"}"
        @keydown=${h=>h.key==="Escape"&&this._open&&(h.stopPropagation(),this._toggle())}
      >
        <div class="backdrop" aria-hidden="true">
          ${this._backdrops.map(h=>h.url?b`<img class=${h.on?"on":""} src=${h.url} alt="" draggable="false" referrerpolicy="no-referrer" @load=${()=>this._reveal(h)} />`:_)}
        </div>
        <div class="pulse"></div>
        <div class="head-wrap">
          <div
            class="head"
            role="button"
            tabindex="0"
            aria-disabled=${String(!n)}
            aria-expanded=${o&&!r?String(this._open):_}
            aria-haspopup=${o&&r?"dialog":_}
          >
            <ha-ripple></ha-ripple>
            <div class=${W({icon:!0,idle:!e})}>
              ${this._config.rotate>0&&this._turnable.length>1?ft(this._cycleKey,b`<div class="cycle"><i></i><i></i></div>`):_}
              <div class="glyph">${Zt(e||{icon:"mdi:bell-outline"},this._hass)}</div>
              ${a?ft(a,b`<div class="glyph leaving" style="color: ${Xt(a.entry)}">${Zt(a.entry,this._hass)}</div>`):_}
              ${c>1?b`<div class="badge">${c>9?"9+":c}</div>`:_}
            </div>
            <div class=${W({texts:!0,up:!!(a&&!a.side),side:!!a?.side})}>
              ${this._slideTemplate(e,t)}
              ${a?ft(a,this._slideTemplate(a.entry,t,a)):_}
            </div>
            ${o?b`<ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>`:_}
          </div>
        </div>
        <div class="drawer">
          <div class="inner">
            <div class="bar" role="button" tabindex="0" aria-expanded="true" @click=${()=>this._toggle()} @keydown=${h=>(h.key==="Enter"||h.key===" ")&&(h.preventDefault(),this._toggle())}>
              <ha-ripple></ha-ripple>
              <span class="count">${this.listTitle()}</span>
              <ha-icon class="chevron" icon="mdi:chevron-up"></ha-icon>
            </div>
            <div class="list" role="list">${te(this._motion.withLeaving(s,this._listMotion),this.rowView(h=>this._refocus=h))}</div>
            <div class=${W({"foot-wrap":!0,shown:l.length>0})}>
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
    `}_updateBackdrop(t){if(t===this._backdropUrl)return;this._backdropUrl=t;let e=this._backdrops,s=e.find(n=>n.on);if(!t)e.forEach(n=>n.on=!1);else if(s?.url!==t){let n=s===e[0]?e[1]:e[0];n.url=t,n.loaded===t&&this._reveal(n)}}_reveal(t){t.loaded=t.url,t.url===this._backdropUrl&&(this._backdrops.forEach(e=>e.on=e===t),this.requestUpdate())}};var ae=class extends E{static styles=[ne,se,ie,R`
      :host {
        font-family: var(--ha-font-family-body);
        -webkit-font-smoothing: var(--ha-font-smoothing);
        -moz-osx-font-smoothing: var(--ha-moz-osx-font-smoothing);
      }
      ha-adaptive-dialog {
        --dialog-content-padding: 0;
      }
      .list {
        padding: 0 12px 12px;
      }
      /* As a bottom sheet the list keeps the sides of a sections view, see ha-adaptive-dialog.ts and hui-sections-view.ts. */
      @media (max-width: 870px), (max-height: 500px) {
        .list {
          padding-inline: var(--ha-view-sections-column-gap, 32px);
        }
      }
      @media (max-width: 600px) {
        .list {
          padding-inline: var(--ha-view-sections-narrow-column-gap, 8px);
        }
      }
    `];constructor(){super(),this._motion=new at(()=>this.requestUpdate())}showDialog({card:t}){this._card&&this._card!==t&&this._release(),this._card=t,t.setDialog(this),this.requestUpdate()}closeDialog(){let t=this.renderRoot?.querySelector("ha-adaptive-dialog");return t&&this._shown?t.open=!1:this._closed(),!0}_release(){this._card?._dialog===this&&this._card.setDialog(null)}_closed(){this._release(),this._card=null,this._shown=!1,this.requestUpdate(),ct(this,"dialog-closed",{dialog:this.localName})}willUpdate(){this._animate=this._shown&&!this._card?.preview,this._animate&&this._motion.measure(this.renderRoot.querySelector(".list"))}updated(){this._motion.play(this.renderRoot.querySelector(".list"),this._animate),this._card&&this._css!==this._card.css&&(this._css=this._card.css,ee(this,this._css)),this._refocus!=null&&Qt(this.renderRoot,this._refocus,null),this._refocus=null}render(){let t=this._card;if(!t)return _;let e=t.gone?[]:t.listed();e.length||queueMicrotask(()=>this._card===t&&this.closeDialog());let s=t.dismissible();return b`
      <ha-adaptive-dialog
        open
        flexcontent
        .hass=${t.hass}
        header-title=${t.listTitle()}
        @opened=${n=>n.target===n.currentTarget&&(this._shown=!0,this.requestUpdate())}
        @closed=${n=>n.target===n.currentTarget&&this._closed()}
      >
        ${s.length?b`<ha-icon-button slot="headerActionItems" .label=${t.texts.clear} @click=${()=>t.dismiss(s)}>
              <ha-icon icon="mdi:notification-clear-all"></ha-icon>
            </ha-icon-button>`:_}
        <div class="list" role="list">${te(this._motion.withLeaving(e,this._animate),t.rowView(n=>this._refocus=n))}</div>
      </ha-adaptive-dialog>
    `}};var oo=["entities","label","weather","infos","updates","repairs","hide_when_empty","vertical","rotate","slide","audience","css"],Ms=["type","attribute","name","icon","image","background","before","tap_action"],ro=["entity",...Ms,"actions"],ao=["entity","name","icon","color","show_entity_picture","state_content","time_format","show_current","show_forecast","forecast_type","forecast_slots","tap_action","hold_action","double_tap_action","visibility"],Ns=["attribute","picture"],co=["calendar","todo"],Fe=i=>i==null||i===""||i===!1||Array.isArray(i)&&!i.length||$(i)&&!Object.keys(i).length,Ve=(i,t)=>Object.fromEntries([...new Set([...t,...Object.keys(i)])].filter(e=>e in i).map(e=>[e,i[e]])),Ke=i=>i?i.only?"only":"except":"everyone",lo=i=>({days:Math.floor(i/864e5),hours:Math.floor(i%864e5/36e5),minutes:Math.floor(i%36e5/6e4),seconds:i%6e4/1e3}),ce=i=>!i.forecast_type||i.show_forecast===!1?"show_current":i.show_current===!1?"show_forecast":"show_both",le=class extends E{static properties={hass:{attribute:!1},_config:{state:!0}};static styles=R`
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
  `;constructor(){super(),this._memos=new Map}setConfig(t){zt(t),this._config=t}get _t(){return fs(Yt(this.hass),this.hass?.localize)}_memo(t,e){let s=JSON.stringify(e),n=this._memos.get(t);return n?.json===s?n.value:(this._memos.set(t,{json:s,value:e}),e)}_name(t,e){let s=this.hass.states[t];return s?Be(this.hass)(s,e):typeof e=="string"&&e||t}_entries(t=this._config){return(t.entities||[]).map(e=>typeof e=="string"?{entity:e}:e)}_infos(t=this._config){return(t.infos||[]).map(e=>typeof e=="string"?{entity:e}:{...e})}_sources(t=this._config){let e=this._t,s=[{key:"system",name:e.label("system"),icon:C.system}];t.updates!==!1&&s.push({key:"updates",name:e.label("updates"),icon:C.update}),t.repairs!==!1&&s.push({key:"repairs",name:e.label("repairs"),icon:C.repair}),t.weather&&s.push({key:t.weather,name:this._name(t.weather),icon:C.weather});let n=this.hass.entities||{},o=t.label?Object.keys(n).filter(r=>n[r]?.labels?.includes(t.label)).map(r=>({entity:r})):[];for(let r of[...this._entries(t),...o])s.some(c=>c.key===r.entity)||s.push({key:r.entity,name:r.name||this._name(r.entity),icon:r.icon||C[this._kind(r)]});return s}_kind(t){return Te(t,this.hass.states[t.entity],this.hass)}_summary(t){let e=this._t,s=Ke(t);if(s==="everyone")return e.label("everyone");let n=t[s].map(o=>this._name(o)).join(", ");return n?v(e.label(s+"_x"),{x:n}):e.label(s==="only"?"nobody":"everyone")}_schema(t){let e=this._t,s=this._config.audience||{},n=this._entries(),o=(r,c=a=>e.label(a))=>r.map(a=>({value:a,label:c(a)}));return[{name:"entities",selector:{entity:{multiple:!0}}},{name:"label",selector:{label:{}}},{name:"weather",selector:{entity:{filter:{domain:"weather"}}}},{name:"infos",selector:{entity:{multiple:!0,reorder:!0}}},{name:"",type:"grid",schema:[{name:"updates",selector:{boolean:{}}},{name:"repairs",selector:{boolean:{}}}]},{name:"hide_when_empty",selector:{boolean:{}}},{name:"content_layout",selector:{select:{mode:"box",options:["horizontal","vertical"].map(r=>({value:r,label:e.label(r),image:{src:`/static/images/form/tile_content_layout_${r}.svg`,src_dark:`/static/images/form/tile_content_layout_${r}_dark.svg`,flip_rtl:!0}}))}}},{name:"",type:"grid",schema:[{name:"rotate",selector:{number:{min:0,max:60,step:1,mode:"box",unit_of_measurement:"s"}}},{name:"slide",selector:{select:{mode:"dropdown",options:o(["up","side"],r=>e.label("slide_"+r))}}}]},...n.length?[{name:"options",type:"expandable",title:e.label("options"),icon:"mdi:tune-variant",schema:n.map(r=>{let c=this._kind(r);return{name:r.entity,type:"expandable",title:r.name||this._name(r.entity),icon:r.icon||C[c],schema:[{name:"type",selector:{select:{mode:"dropdown",options:o(["auto",...xe],a=>e.label("type_"+a))}}},...!r.type||Ns.includes(r.type)?[{name:"attribute",helper:r.type==="picture"?"attribute_picture":"attribute",selector:{attribute:{entity_id:r.entity}}}]:[],{name:"",type:"grid",schema:[{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{placeholder:C[c]}}}]},{name:"image",selector:{text:{}}},{name:"background",selector:{boolean:{}}},...co.includes(c)?[{name:"before",selector:{duration:{enable_day:!0}}}]:[],{name:"tap_action",selector:{ui_action:{default_action:"more-info"}}}]}})}]:[],{name:"audience",type:"expandable",title:e.label("audience"),icon:"mdi:account-eye-outline",schema:t.map(r=>({name:r.key,type:"expandable",title:`${r.name} \xB7 ${this._summary(s[r.key])}`,icon:r.icon,schema:[{name:"visible",selector:{select:{mode:"list",options:o(["everyone","only","except"])}}},...Ke(s[r.key])==="everyone"?[]:[{name:"people",selector:{entity:{multiple:!0,filter:{domain:"person"}}}}]]}))},{name:"styling",type:"expandable",flatten:!0,title:e.label("styling"),icon:"mdi:palette-outline",schema:[{name:"css",selector:{text:{multiline:!0}}}]}]}_data(t){let e=this._config,s=e.audience||{};return{...bt,...e,content_layout:e.vertical?"vertical":"horizontal",entities:this._entries().map(n=>n.entity),infos:this._infos().map(n=>n.entity),options:Object.fromEntries(this._entries().map(n=>[n.entity,{...n,type:n.type||"auto",background:!!n.background,before:n.before==null?void 0:lo(tt(n.before))}])),audience:Object.fromEntries(t.map(n=>[n.key,{visible:Ke(s[n.key]),people:s[n.key]?.only||s[n.key]?.except||[]}]))}}_mergeEntities(t,e={}){let s=this._entries(),n=new Map(s.map(c=>[c.entity,c])),o=t.map((c,a)=>s[a]&&c!==s[a].entity?a:-1).filter(c=>c>=0),r=t.length===s.length&&o.length===1&&!n.has(t[o[0]])?o[0]:-1;return this._swapped=r<0?null:[s[r].entity,t[r]],t.map((c,a)=>{let l=n.get(c)||(a===r?s[a]:{}),h={...l,entity:c},d=e[c]||{};for(let p of Ms){if(!(p in d))continue;let u=d[p];p==="before"&&tt(u)===tt(l.before)||(Fe(u)||p==="type"&&u==="auto"||p==="before"&&!tt(u)?delete h[p]:h[p]=u)}return h.type&&!Ns.includes(h.type)&&delete h.attribute,Object.keys(h).length===1?c:Ve(h,ro)})}_onChange(t){t.stopPropagation();let{content_layout:e,options:s,...n}=t.detail.value;e&&(n.vertical=e==="vertical");let o=this._sources().map(a=>a.key);this._swapped=null,Array.isArray(n.entities)&&(n.entities=this._mergeEntities(n.entities,s)),Array.isArray(n.infos)&&(n.infos=this._mergeInfos(n.infos));let r={...this._config.audience};for(let[a,l]of Object.entries(n.audience||{}))l.visible==="only"||l.visible==="except"?r[a]={[l.visible]:l.people||[]}:delete r[a];for(let[a,l]of[this._swapped||[],[this._config.weather,n.weather]])a&&l&&r[a]&&!r[l]&&(r[l]=r[a]);let c=new Set(this._sources({...this._config,...n}).map(a=>a.key));for(let a of o)!c.has(a)&&a!=="updates"&&!a.startsWith("update.")&&delete r[a];n.audience=r,this._write(n)}_write(t){let e={...this._config,...t},s={type:this._config.type};for(let[n,o]of Object.entries(Ve(e,oo)))n==="type"||Fe(o)&&o!==!1||n in bt&&o===bt[n]||(s[n]=o);this._config=s,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0}))}_mergeInfos(t){let e=this._infos(),s=new Set,n=o=>o>=0&&!s.has(o)?(s.add(o),e[o]):null;return t.map((o,r)=>{let c=n(e.findIndex((a,l)=>a.entity===o&&!s.has(l)))||e.length===t.length&&!t.includes(e[r].entity)&&n(r)||{};return this._infoEntry({...c,entity:o})})}_infoEntry(t){let e={};for(let[s,n]of Object.entries(Ve(t,ao)))(s==="show_current"||s==="show_forecast"?n===!1:!Fe(n)&&!(s==="color"&&n==="state"))&&(e[s]=n);return Object.keys(e).length===1?e.entity:e}_forecastTypes(t){if(!t.entity.startsWith("weather."))return[];let e=this.hass.states[t.entity];return $e.filter(s=>kt(e,s)||t.forecast_type===s)}_infoSchema(t){let e=this._t,s=this.hass.states[t.entity],n=t.entity.split(".")[0],o=[].concat(t.state_content??"state").some(p=>/^last[_-](changed|updated|triggered)$/.test(p)||n==="sun"&&p.startsWith("next_")||n==="calendar"&&p.endsWith("_time")||p==="state"&&!!s&&(s.attributes.device_class==="timestamp"||xi(n))),r={entity_id:"entity"},c=this._forecastTypes(t),a=ce(t),l=p=>({select:{mode:"dropdown",options:p.map(u=>({value:u,label:e.label(u)}))}}),h=[{name:"state_content",selector:{ui_state_content:{}},context:{filter_entity:"entity"}},...o?[{name:"time_format",selector:{ui_time_format:{}}}]:[]],d=[{name:"forecast",selector:l(["show_both","show_current","show_forecast"])},...a==="show_current"?[]:[{name:"forecast_type",selector:l(c)},{name:"forecast_slots",selector:{number:{min:1,max:12,mode:"box"}}}],...a==="show_forecast"?[]:h];return[{name:"name",selector:{entity_name:{}},context:{entity:"entity"}},{name:"",type:"grid",schema:[{name:"icon",selector:{icon:{}},context:{icon_entity:"entity"}},{name:"color",selector:{ui_color:{default_color:"state",include_state:!0}}}]},...c.length?d:h,{name:"show_entity_picture",selector:{boolean:{}}},{name:"tap_action",selector:{ui_action:{default_action:"more-info"}},context:r},{name:"",type:"optional_actions",flatten:!0,schema:["hold_action","double_tap_action"].map(p=>({name:p,selector:{ui_action:{default_action:"none"}},context:r}))}]}_onInfo(t,e,s){t.stopPropagation();let n=this._infos(),{forecast:o,...r}=s,c={...n[e],...r,entity:n[e].entity},a="forecast"in s?o||"show_current":null;if(a&&a!==ce(n[e])&&(Object.assign(c,{show_current:a==="show_forecast"?!1:void 0,show_forecast:void 0}),c.forecast_type=a==="show_current"?void 0:c.forecast_type||this._forecastTypes(c)[0]),!c.forecast_type)for(let l of["forecast_slots","show_current","show_forecast"])delete c[l];n[e]=c,this._write({infos:n.map(l=>this._infoEntry(l))})}_infoPanel(t,e){let s=this._t,n=this.hass.states[t.entity],o=this._forecastTypes(t),r=o.length?{...t,forecast:ce(t)}:t,c=Array.isArray(t.visibility)?t.visibility:[];return b`<ha-expansion-panel outlined .header=${this._name(t.entity,t.name)} .secondary=${o.length&&ce(t)!=="show_current"?s.label(t.forecast_type):""}>
      ${n&&customElements.get("ha-state-icon")?b`<ha-state-icon slot="leading-icon" .hass=${this.hass} .stateObj=${n} .icon=${t.icon}></ha-state-icon>`:b`<ha-icon slot="leading-icon" .icon=${t.icon||C.generic}></ha-icon>`}
      <div class="content">
        <ha-form
          .hass=${this.hass}
          .data=${this._memo("info-data-"+e,r)}
          .schema=${this._memo("info-schema-"+e,this._infoSchema(t))}
          .computeLabel=${a=>s.label(a.name)}
          @value-changed=${a=>this._onInfo(a,e,a.detail.value)}
        ></ha-form>
        <ha-expansion-panel outlined .header=${s.label("visibility")}>
          <ha-icon slot="leading-icon" icon="mdi:eye"></ha-icon>
          <div class="content">
            <p class="intro">${s.helper("visibility_intro")}</p>
            <ha-card-conditions-editor
              .hass=${this.hass}
              .conditions=${this._memo("conditions-"+e,c)}
              @value-changed=${a=>this._onInfo(a,e,{visibility:a.detail.value?.length?a.detail.value:void 0})}
            ></ha-card-conditions-editor>
          </div>
        </ha-expansion-panel>
      </div>
    </ha-expansion-panel>`}render(){if(!this._config||!this.hass)return _;let t=this._t,e=this._sources(),s=this._infos();return b`
      <ha-form
        .hass=${this.hass}
        .data=${this._memo("data",this._data(e))}
        .schema=${this._memo("schema",this._schema(e))}
        .computeLabel=${n=>t.label(n.name)}
        .computeHelper=${n=>t.helper(n.helper||n.name)}
        @value-changed=${this._onChange}
      ></ha-form>
      ${s.length?b`<ha-expansion-panel class="infos" outlined .header=${t.label("info_options")}>
            <ha-icon slot="leading-icon" icon="mdi:information-outline"></ha-icon>
            <div class="content">${s.map((n,o)=>this._infoPanel(n,o))}</div>
          </ha-expansion-panel>`:_}
    `}};var Ge=(i,t)=>customElements.get(i)||customElements.define(i,t);Ge(z,re);Ge(z+"-editor",le);Ge(qe,ae);window.customCards||=[];window.customCards.some(i=>i.type===z)||(window.customCards.push({type:z,name:"Origami Notifications",description:"System notifications, repairs, updates, warnings and any entity you add.",preview:!0,documentationURL:"https://github.com/hazymorning/origami_notifications"}),console.info(`%c Origami Notifications %c v${Ye} `,"font-weight: bold","opacity: 0.7"));
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
