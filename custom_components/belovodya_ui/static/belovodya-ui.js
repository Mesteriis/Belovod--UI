/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Y = globalThis, _t = Y.ShadowRoot && (Y.ShadyCSS === void 0 || Y.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, bt = Symbol(), St = /* @__PURE__ */ new WeakMap();
let Qt = class {
  constructor(t, i, a) {
    if (this._$cssResult$ = !0, a !== bt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (_t && t === void 0) {
      const a = i !== void 0 && i.length === 1;
      a && (t = St.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), a && St.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const g = (e) => new Qt(typeof e == "string" ? e : e + "", void 0, bt), J = (e, ...t) => {
  const i = e.length === 1 ? e[0] : t.reduce((a, o, s) => a + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + e[s + 1], e[0]);
  return new Qt(i, e, bt);
}, Se = (e, t) => {
  if (_t) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const a = document.createElement("style"), o = Y.litNonce;
    o !== void 0 && a.setAttribute("nonce", o), a.textContent = i.cssText, e.appendChild(a);
  }
}, At = _t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const a of t.cssRules) i += a.cssText;
  return g(i);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ae, defineProperty: Ee, getOwnPropertyDescriptor: ke, getOwnPropertyNames: Le, getOwnPropertySymbols: Te, getPrototypeOf: Me } = Object, Q = globalThis, Et = Q.trustedTypes, Oe = Et ? Et.emptyScript : "", Ne = Q.reactiveElementPolyfillSupport, V = (e, t) => e, lt = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Oe : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let i = e;
  switch (t) {
    case Boolean:
      i = e !== null;
      break;
    case Number:
      i = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(e);
      } catch {
        i = null;
      }
  }
  return i;
} }, Xt = (e, t) => !Ae(e, t), kt = { attribute: !0, type: String, converter: lt, reflect: !1, useDefault: !1, hasChanged: Xt };
Symbol.metadata ??= Symbol("metadata"), Q.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let M = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = kt) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const a = Symbol(), o = this.getPropertyDescriptor(t, a, i);
      o !== void 0 && Ee(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, i, a) {
    const { get: o, set: s } = ke(this.prototype, t) ?? { get() {
      return this[i];
    }, set(r) {
      this[i] = r;
    } };
    return { get: o, set(r) {
      const n = o?.call(this);
      s?.call(this, r), this.requestUpdate(t, n, a);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? kt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(V("elementProperties"))) return;
    const t = Me(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(V("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(V("properties"))) {
      const i = this.properties, a = [...Le(i), ...Te(i)];
      for (const o of a) this.createProperty(o, i[o]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const i = litPropertyMetadata.get(t);
      if (i !== void 0) for (const [a, o] of i) this.elementProperties.set(a, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, a] of this.elementProperties) {
      const o = this._$Eu(i, a);
      o !== void 0 && this._$Eh.set(o, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const i = [];
    if (Array.isArray(t)) {
      const a = new Set(t.flat(1 / 0).reverse());
      for (const o of a) i.unshift(At(o));
    } else t !== void 0 && i.push(At(t));
    return i;
  }
  static _$Eu(t, i) {
    const a = i.attribute;
    return a === !1 ? void 0 : typeof a == "string" ? a : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const a of i.keys()) this.hasOwnProperty(a) && (t.set(a, this[a]), delete this[a]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Se(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, i, a) {
    this._$AK(t, a);
  }
  _$ET(t, i) {
    const a = this.constructor.elementProperties.get(t), o = this.constructor._$Eu(t, a);
    if (o !== void 0 && a.reflect === !0) {
      const s = (a.converter?.toAttribute !== void 0 ? a.converter : lt).toAttribute(i, a.type);
      this._$Em = t, s == null ? this.removeAttribute(o) : this.setAttribute(o, s), this._$Em = null;
    }
  }
  _$AK(t, i) {
    const a = this.constructor, o = a._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const s = a.getPropertyOptions(o), r = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : lt;
      this._$Em = o;
      const n = r.fromAttribute(i, s.type);
      this[o] = n ?? this._$Ej?.get(o) ?? n, this._$Em = null;
    }
  }
  requestUpdate(t, i, a, o = !1, s) {
    if (t !== void 0) {
      const r = this.constructor;
      if (o === !1 && (s = this[t]), a ??= r.getPropertyOptions(t), !((a.hasChanged ?? Xt)(s, i) || a.useDefault && a.reflect && s === this._$Ej?.get(t) && !this.hasAttribute(r._$Eu(t, a)))) return;
      this.C(t, i, a);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: a, reflect: o, wrapped: s }, r) {
    a && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, r ?? i ?? this[t]), s !== !0 || r !== void 0) || (this._$AL.has(t) || (this.hasUpdated || a || (i = void 0), this._$AL.set(t, i)), o === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [o, s] of this._$Ep) this[o] = s;
        this._$Ep = void 0;
      }
      const a = this.constructor.elementProperties;
      if (a.size > 0) for (const [o, s] of a) {
        const { wrapped: r } = s, n = this[o];
        r !== !0 || this._$AL.has(o) || n === void 0 || this.C(o, void 0, s, n);
      }
    }
    let t = !1;
    const i = this._$AL;
    try {
      t = this.shouldUpdate(i), t ? (this.willUpdate(i), this._$EO?.forEach((a) => a.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (a) {
      throw t = !1, this._$EM(), a;
    }
    t && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((i) => i.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((i) => this._$ET(i, this[i])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
M.elementStyles = [], M.shadowRootOptions = { mode: "open" }, M[V("elementProperties")] = /* @__PURE__ */ new Map(), M[V("finalized")] = /* @__PURE__ */ new Map(), Ne?.({ ReactiveElement: M }), (Q.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const gt = globalThis, Lt = (e) => e, Z = gt.trustedTypes, Tt = Z ? Z.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, te = "$lit$", $ = `lit$${Math.random().toFixed(9).slice(2)}$`, ee = "?" + $, Re = `<${ee}>`, T = document, B = () => T.createComment(""), j = (e) => e === null || typeof e != "object" && typeof e != "function", vt = Array.isArray, Ie = (e) => vt(e) || typeof e?.[Symbol.iterator] == "function", et = `[ 	
\f\r]`, P = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Mt = /-->/g, Ot = />/g, A = RegExp(`>|${et}(?:([^\\s"'>=/]+)(${et}*=${et}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Nt = /'/g, Rt = /"/g, ie = /^(?:script|style|textarea|title)$/i, Pe = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), l = Pe(1), S = Symbol.for("lit-noChange"), _ = Symbol.for("lit-nothing"), It = /* @__PURE__ */ new WeakMap(), L = T.createTreeWalker(T, 129);
function ae(e, t) {
  if (!vt(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Tt !== void 0 ? Tt.createHTML(t) : t;
}
const He = (e, t) => {
  const i = e.length - 1, a = [];
  let o, s = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", r = P;
  for (let n = 0; n < i; n++) {
    const d = e[n];
    let u, f, c = -1, h = 0;
    for (; h < d.length && (r.lastIndex = h, f = r.exec(d), f !== null); ) h = r.lastIndex, r === P ? f[1] === "!--" ? r = Mt : f[1] !== void 0 ? r = Ot : f[2] !== void 0 ? (ie.test(f[2]) && (o = RegExp("</" + f[2], "g")), r = A) : f[3] !== void 0 && (r = A) : r === A ? f[0] === ">" ? (r = o ?? P, c = -1) : f[1] === void 0 ? c = -2 : (c = r.lastIndex - f[2].length, u = f[1], r = f[3] === void 0 ? A : f[3] === '"' ? Rt : Nt) : r === Rt || r === Nt ? r = A : r === Mt || r === Ot ? r = P : (r = A, o = void 0);
    const p = r === A && e[n + 1].startsWith("/>") ? " " : "";
    s += r === P ? d + Re : c >= 0 ? (a.push(u), d.slice(0, c) + te + d.slice(c) + $ + p) : d + $ + (c === -2 ? n : p);
  }
  return [ae(e, s + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), a];
};
class D {
  constructor({ strings: t, _$litType$: i }, a) {
    let o;
    this.parts = [];
    let s = 0, r = 0;
    const n = t.length - 1, d = this.parts, [u, f] = He(t, i);
    if (this.el = D.createElement(u, a), L.currentNode = this.el.content, i === 2 || i === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (o = L.nextNode()) !== null && d.length < n; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const c of o.getAttributeNames()) if (c.endsWith(te)) {
          const h = f[r++], p = o.getAttribute(c).split($), b = /([.?@])?(.*)/.exec(h);
          d.push({ type: 1, index: s, name: b[2], strings: p, ctor: b[1] === "." ? Ue : b[1] === "?" ? Ve : b[1] === "@" ? Be : X }), o.removeAttribute(c);
        } else c.startsWith($) && (d.push({ type: 6, index: s }), o.removeAttribute(c));
        if (ie.test(o.tagName)) {
          const c = o.textContent.split($), h = c.length - 1;
          if (h > 0) {
            o.textContent = Z ? Z.emptyScript : "";
            for (let p = 0; p < h; p++) o.append(c[p], B()), L.nextNode(), d.push({ type: 2, index: ++s });
            o.append(c[h], B());
          }
        }
      } else if (o.nodeType === 8) if (o.data === ee) d.push({ type: 2, index: s });
      else {
        let c = -1;
        for (; (c = o.data.indexOf($, c + 1)) !== -1; ) d.push({ type: 7, index: s }), c += $.length - 1;
      }
      s++;
    }
  }
  static createElement(t, i) {
    const a = T.createElement("template");
    return a.innerHTML = t, a;
  }
}
function R(e, t, i = e, a) {
  if (t === S) return t;
  let o = a !== void 0 ? i._$Co?.[a] : i._$Cl;
  const s = j(t) ? void 0 : t._$litDirective$;
  return o?.constructor !== s && (o?._$AO?.(!1), s === void 0 ? o = void 0 : (o = new s(e), o._$AT(e, i, a)), a !== void 0 ? (i._$Co ??= [])[a] = o : i._$Cl = o), o !== void 0 && (t = R(e, o._$AS(e, t.values), o, a)), t;
}
class ze {
  constructor(t, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: i }, parts: a } = this._$AD, o = (t?.creationScope ?? T).importNode(i, !0);
    L.currentNode = o;
    let s = L.nextNode(), r = 0, n = 0, d = a[0];
    for (; d !== void 0; ) {
      if (r === d.index) {
        let u;
        d.type === 2 ? u = new I(s, s.nextSibling, this, t) : d.type === 1 ? u = new d.ctor(s, d.name, d.strings, this, t) : d.type === 6 && (u = new je(s, this, t)), this._$AV.push(u), d = a[++n];
      }
      r !== d?.index && (s = L.nextNode(), r++);
    }
    return L.currentNode = T, o;
  }
  p(t) {
    let i = 0;
    for (const a of this._$AV) a !== void 0 && (a.strings !== void 0 ? (a._$AI(t, a, i), i += a.strings.length - 2) : a._$AI(t[i])), i++;
  }
}
class I {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, i, a, o) {
    this.type = 2, this._$AH = _, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = a, this.options = o, this._$Cv = o?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && t?.nodeType === 11 && (t = i.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, i = this) {
    t = R(this, t, i), j(t) ? t === _ || t == null || t === "" ? (this._$AH !== _ && this._$AR(), this._$AH = _) : t !== this._$AH && t !== S && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ie(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== _ && j(this._$AH) ? this._$AA.nextSibling.data = t : this.T(T.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: i, _$litType$: a } = t, o = typeof a == "number" ? this._$AC(t) : (a.el === void 0 && (a.el = D.createElement(ae(a.h, a.h[0]), this.options)), a);
    if (this._$AH?._$AD === o) this._$AH.p(i);
    else {
      const s = new ze(o, this), r = s.u(this.options);
      s.p(i), this.T(r), this._$AH = s;
    }
  }
  _$AC(t) {
    let i = It.get(t.strings);
    return i === void 0 && It.set(t.strings, i = new D(t)), i;
  }
  k(t) {
    vt(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let a, o = 0;
    for (const s of t) o === i.length ? i.push(a = new I(this.O(B()), this.O(B()), this, this.options)) : a = i[o], a._$AI(s), o++;
    o < i.length && (this._$AR(a && a._$AB.nextSibling, o), i.length = o);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); t !== this._$AB; ) {
      const a = Lt(t).nextSibling;
      Lt(t).remove(), t = a;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class X {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, a, o, s) {
    this.type = 1, this._$AH = _, this._$AN = void 0, this.element = t, this.name = i, this._$AM = o, this.options = s, a.length > 2 || a[0] !== "" || a[1] !== "" ? (this._$AH = Array(a.length - 1).fill(new String()), this.strings = a) : this._$AH = _;
  }
  _$AI(t, i = this, a, o) {
    const s = this.strings;
    let r = !1;
    if (s === void 0) t = R(this, t, i, 0), r = !j(t) || t !== this._$AH && t !== S, r && (this._$AH = t);
    else {
      const n = t;
      let d, u;
      for (t = s[0], d = 0; d < s.length - 1; d++) u = R(this, n[a + d], i, d), u === S && (u = this._$AH[d]), r ||= !j(u) || u !== this._$AH[d], u === _ ? t = _ : t !== _ && (t += (u ?? "") + s[d + 1]), this._$AH[d] = u;
    }
    r && !o && this.j(t);
  }
  j(t) {
    t === _ ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Ue extends X {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === _ ? void 0 : t;
  }
}
class Ve extends X {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== _);
  }
}
class Be extends X {
  constructor(t, i, a, o, s) {
    super(t, i, a, o, s), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = R(this, t, i, 0) ?? _) === S) return;
    const a = this._$AH, o = t === _ && a !== _ || t.capture !== a.capture || t.once !== a.once || t.passive !== a.passive, s = t !== _ && (a === _ || o);
    o && this.element.removeEventListener(this.name, this, a), s && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class je {
  constructor(t, i, a) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = a;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    R(this, t);
  }
}
const De = { I }, qe = gt.litHtmlPolyfillSupport;
qe?.(D, I), (gt.litHtmlVersions ??= []).push("3.3.2");
const Fe = (e, t, i) => {
  const a = i?.renderBefore ?? t;
  let o = a._$litPart$;
  if (o === void 0) {
    const s = i?.renderBefore ?? null;
    a._$litPart$ = o = new I(t.insertBefore(B(), s), s, void 0, i ?? {});
  }
  return o._$AI(e), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const yt = globalThis;
let x = class extends M {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Fe(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return S;
  }
};
x._$litElement$ = !0, x.finalized = !0, yt.litElementHydrateSupport?.({ LitElement: x });
const Ge = yt.litElementPolyfillSupport;
Ge?.({ LitElement: x });
(yt.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const oe = { ATTRIBUTE: 1, CHILD: 2 }, se = (e) => (...t) => ({ _$litDirective$: e, values: t });
let re = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, i, a) {
    this._$Ct = t, this._$AM = i, this._$Ci = a;
  }
  _$AS(t, i) {
    return this.update(t, i);
  }
  update(t, i) {
    return this.render(...i);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { I: We } = De, Pt = (e) => e, Ht = () => document.createComment(""), H = (e, t, i) => {
  const a = e._$AA.parentNode, o = t === void 0 ? e._$AB : t._$AA;
  if (i === void 0) {
    const s = a.insertBefore(Ht(), o), r = a.insertBefore(Ht(), o);
    i = new We(s, r, e, e.options);
  } else {
    const s = i._$AB.nextSibling, r = i._$AM, n = r !== e;
    if (n) {
      let d;
      i._$AQ?.(e), i._$AM = e, i._$AP !== void 0 && (d = e._$AU) !== r._$AU && i._$AP(d);
    }
    if (s !== o || n) {
      let d = i._$AA;
      for (; d !== s; ) {
        const u = Pt(d).nextSibling;
        Pt(a).insertBefore(d, o), d = u;
      }
    }
  }
  return i;
}, E = (e, t, i = e) => (e._$AI(t, i), e), Ye = {}, Ke = (e, t = Ye) => e._$AH = t, Ze = (e) => e._$AH, it = (e) => {
  e._$AR(), e._$AA.remove();
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const zt = (e, t, i) => {
  const a = /* @__PURE__ */ new Map();
  for (let o = t; o <= i; o++) a.set(e[o], o);
  return a;
}, N = se(class extends re {
  constructor(e) {
    if (super(e), e.type !== oe.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(e, t, i) {
    let a;
    i === void 0 ? i = t : t !== void 0 && (a = t);
    const o = [], s = [];
    let r = 0;
    for (const n of e) o[r] = a ? a(n, r) : r, s[r] = i(n, r), r++;
    return { values: s, keys: o };
  }
  render(e, t, i) {
    return this.dt(e, t, i).values;
  }
  update(e, [t, i, a]) {
    const o = Ze(e), { values: s, keys: r } = this.dt(t, i, a);
    if (!Array.isArray(o)) return this.ut = r, s;
    const n = this.ut ??= [], d = [];
    let u, f, c = 0, h = o.length - 1, p = 0, b = s.length - 1;
    for (; c <= h && p <= b; ) if (o[c] === null) c++;
    else if (o[h] === null) h--;
    else if (n[c] === r[p]) d[p] = E(o[c], s[p]), c++, p++;
    else if (n[h] === r[b]) d[b] = E(o[h], s[b]), h--, b--;
    else if (n[c] === r[b]) d[b] = E(o[c], s[b]), H(e, d[b + 1], o[c]), c++, b--;
    else if (n[h] === r[p]) d[p] = E(o[h], s[p]), H(e, o[c], o[h]), h--, p++;
    else if (u === void 0 && (u = zt(r, p, b), f = zt(n, c, h)), u.has(n[c])) if (u.has(n[h])) {
      const y = f.get(r[p]), tt = y !== void 0 ? o[y] : null;
      if (tt === null) {
        const Ct = H(e, o[c]);
        E(Ct, s[p]), d[p] = Ct;
      } else d[p] = E(tt, s[p]), H(e, o[c], tt), o[y] = null;
      p++;
    } else it(o[h]), h--;
    else it(o[c]), c++;
    for (; p <= b; ) {
      const y = H(e, d[b + 1]);
      E(y, s[p]), d[p++] = y;
    }
    for (; c <= h; ) {
      const y = o[c++];
      y !== null && it(y);
    }
    return this.ut = r, Ke(e, d), S;
  }
}), Je = ":host{--belovodya-fade-duration: .22s}@keyframes belovodya-fade-up{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.sidebar,.navbar,.main{animation:belovodya-fade-up var(--belovodya-fade-duration) ease}", ne = ':host{position:relative;display:grid;grid-template-columns:var(--belovodya-sidebar-width) minmax(0,1fr);grid-template-rows:minmax(0,1fr);gap:14px;padding:calc(var(--belovodya-shell-inset-top) + var(--desktop-drag-strip, 0px)) var(--belovodya-shell-inset-inline) var(--belovodya-shell-inset-bottom)}.sidebar,.main{position:relative;z-index:1;min-width:0;min-height:0}.sidebar{grid-column:1;grid-row:1}.main{grid-column:2;grid-row:1;display:grid;grid-template-rows:52px minmax(0,1fr);gap:10px;overflow:hidden;isolation:isolate}.navbar{grid-row:1}.dashboard-stage{position:relative;grid-row:2;min-height:0;padding:14px;border:1px solid rgba(89,144,166,.18);border-radius:var(--belovodya-radius);background:linear-gradient(162deg,#08131f94,#0917246b);box-shadow:0 18px 42px #0000002e,inset 0 1px #ffffff08;overflow:auto}.dashboard-stage:before{content:"";position:absolute;inset:0;background-image:url(/belovodya_ui_static/img/emblem-mark.png);background-repeat:no-repeat;background-position:center 52%;background-size:min(42%,360px) auto;opacity:.05;mix-blend-mode:screen;pointer-events:none}.dashboard-stage>*{position:relative;z-index:1}.dashboard-warning,.dashboard-state,.belovodya-empty-state{display:grid;gap:10px;align-content:start;max-width:min(760px,100%);padding:18px;border-radius:calc(var(--belovodya-radius) - 4px);border:1px solid rgba(87,133,163,.18);background:linear-gradient(162deg,#08131f9e,#09172470);color:#c4d6e2e6}.dashboard-warning__title,.dashboard-state__title{font-family:var(--belovodya-display-font);font-size:1.2rem;color:#dcf0fff5}.dashboard-warning__copy,.dashboard-state{line-height:1.6}.dashboard-state--error{border-color:#ff6f6152}.dashboard-edit-banner{display:grid;gap:4px;margin-bottom:12px;padding:12px 14px;border-radius:16px;border:1px solid rgba(112,242,221,.24);background:linear-gradient(145deg,#10363b52,#0a182485)}.dashboard-edit-banner__title{font-size:.76rem;letter-spacing:.18em;text-transform:uppercase;color:#72e8d7c2}.dashboard-edit-banner__copy{color:#c4d6e2e0;line-height:1.55}.belovodya-layout-grid{display:grid;grid-template-columns:repeat(var(--belovodya-grid-columns, 4),minmax(0,1fr));gap:var(--belovodya-grid-gap, var(--belovodya-gap));align-content:start}.belovodya-layout-stack{display:grid;gap:var(--belovodya-stack-gap, var(--belovodya-gap));grid-auto-rows:minmax(0,auto)}.belovodya-layout-stack--horizontal{grid-auto-flow:column;grid-auto-columns:minmax(0,1fr)}.belovodya-layout-overlay{position:relative;display:grid}.belovodya-layout-overlay>*{grid-column:1;grid-row:1}.belovodya-layout-floating{position:absolute;z-index:3}@media(max-width:1200px){:host{grid-template-columns:var(--belovodya-sidebar-width) minmax(0,1fr)}.belovodya-layout-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:900px){:host{grid-template-columns:1fr}.sidebar{display:none}.main{grid-column:1}.belovodya-layout-grid{grid-template-columns:1fr}}', Qe = ".navbar{display:flex;align-items:center;justify-content:space-between;gap:12px;height:100%;min-height:0}.navbar__title-pill{display:inline-flex;align-items:center;gap:12px;min-width:0;padding:0 18px;min-height:100%;border:1px solid rgba(76,226,204,.3);border-radius:var(--belovodya-radius);background:linear-gradient(158deg,#0e2c3a6b,#09172557);box-shadow:inset 0 1px #ffffff0a,0 18px 36px #0000002e}.navbar__title-icon,.navbar__layout-select-icon{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;color:#80ecdcbd}.navbar__title-icon svg,.navbar__layout-select-icon svg{width:18px;height:18px;stroke:currentColor;stroke-width:1.4}.navbar__title-text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--belovodya-display-font);font-size:1.1rem;font-weight:600;color:#deeef8f5}.navbar__actions{display:inline-flex;align-items:center;gap:12px;flex-shrink:0}.navbar__layout-select-shell,.navbar__action{display:inline-flex;align-items:center;justify-content:center;min-height:52px;border-radius:16px;border:1px solid rgba(120,183,218,.24);background:linear-gradient(150deg,#1025399e,#0a1a2a70);color:#dff1fff0;transition:border-color .17s ease,background .17s ease,transform .17s ease,color .17s ease}.navbar__layout-select-shell{gap:8px;padding:0 12px 0 14px}.navbar__layout-select-shell:hover,.navbar__action:hover{border-color:#a2d8f661;background:linear-gradient(150deg,#143149b3,#0e23378f);transform:translateY(-1px)}.navbar__layout-select{min-width:118px;border:0;outline:none;background:transparent;color:inherit;font:inherit;cursor:pointer}.navbar__layout-select option{color:#101c26}.navbar__action{width:52px;cursor:pointer}.navbar__action--ghost{color:#b5d2e6db}.navbar__action--active{border-color:#70f2dd85;background:linear-gradient(150deg,#15454fc7,#0d223599)}.navbar__action-icon{display:inline-flex;width:18px;height:18px}.navbar__action-icon svg{width:18px;height:18px;stroke:currentColor;stroke-width:1.6}@media(max-width:900px){.navbar{gap:8px}.navbar__title-pill{padding:0 14px}.navbar__layout-select-shell,.navbar__action{min-height:46px;border-radius:14px}.navbar__action{width:46px}}", Xe = ".notifications-backdrop{position:absolute;inset:0;z-index:18;background:linear-gradient(90deg,#02070e14,#02070e7a);backdrop-filter:blur(10px);opacity:0;pointer-events:none;transition:opacity .18s ease}.notifications-backdrop--open{opacity:1;pointer-events:auto}.notifications-drawer{position:absolute;top:0;right:0;bottom:0;z-index:19;width:min(420px,calc(100vw - 24px));min-width:300px;display:grid;grid-template-rows:auto minmax(0,1fr);border:1px solid rgba(104,170,194,.24);border-radius:24px 0 0 24px;background:linear-gradient(170deg,#061019f5,#040b12f0);box-shadow:0 34px 80px #00000061,inset 0 1px #ffffff0a;overflow:hidden;transform:translate(calc(100% + 24px));opacity:0;pointer-events:none;transition:transform .22s ease,opacity .22s ease}.notifications-drawer--open{transform:translate(0);opacity:1;pointer-events:auto}.notifications-drawer__header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:18px 18px 14px;border-bottom:1px solid rgba(104,170,194,.18);background:linear-gradient(180deg,#0b1e2dad,#0b1e2d3d)}.notifications-drawer__eyebrow{margin:0 0 6px;color:#7de2d4b8;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase}.notifications-drawer__title{margin:0;font-family:var(--belovodya-display-font);font-size:1.35rem;color:#e3eff8f7}.notifications-drawer__meta{margin:8px 0 0;color:#a9c5d6cc;font-size:.86rem}.notifications-drawer__header-actions{display:inline-flex;align-items:center;gap:8px;flex-shrink:0}.notifications-drawer__button{display:inline-flex;align-items:center;justify-content:center;min-width:42px;min-height:42px;padding:0 14px;border-radius:14px;border:1px solid rgba(120,183,218,.24);background:linear-gradient(150deg,#1025399e,#0a1a2a70);color:#dff1fff0;font:inherit;cursor:pointer;transition:border-color .17s ease,background .17s ease,transform .17s ease}.notifications-drawer__button:hover{border-color:#a2d8f661;background:linear-gradient(150deg,#143149b3,#0e23378f);transform:translateY(-1px)}.notifications-drawer__button--ghost{color:#b5d2e6d6}.notifications-drawer__body{min-height:0;overflow-y:auto;display:grid;align-content:start;gap:16px;padding:18px}.notifications-drawer__state{padding:18px;border:1px dashed rgba(120,183,218,.22);border-radius:calc(var(--belovodya-radius) - 4px);color:#b4ceddd6;line-height:1.6;background:#0a18265c}.notifications-drawer__empty{min-height:100%;display:grid;align-content:center;justify-items:start;gap:12px;padding:22px;border:1px dashed rgba(120,183,218,.18);border-radius:calc(var(--belovodya-radius) - 4px);background:radial-gradient(circle at top right,rgba(45,212,191,.12),transparent 28%),#0a182652}.notifications-drawer__empty-icon{display:inline-flex;align-items:center;justify-content:center;width:54px;height:54px;border-radius:16px;border:1px solid rgba(109,170,192,.24);background:linear-gradient(150deg,#1025399e,#0a1a2a70);color:#76ebdcdb}.notifications-drawer__empty-icon svg{width:22px;height:22px;stroke:currentColor;stroke-width:1.6}.notifications-drawer__empty-title{color:#e4eff7fa;font-family:var(--belovodya-display-font);font-size:1.1rem}.notifications-drawer__empty-copy{max-width:28ch;color:#bbd0ded1;line-height:1.6}.notifications-section{display:grid;gap:10px}.notifications-section__head{display:flex;align-items:center;justify-content:space-between;gap:8px}.notifications-section__title{margin:0;color:#daeaf4f0;font-size:.84rem;letter-spacing:.12em;text-transform:uppercase}.notifications-section__count{border-radius:999px;padding:2px 8px;border:1px solid rgba(95,200,198,.28);background:#0e31375c;color:#d5fbf6f0;font-size:.74rem}.notifications-list{display:grid;gap:10px}.notifications-item{display:grid;gap:10px;padding:14px;border:1px solid rgba(112,175,198,.2);border-radius:calc(var(--belovodya-radius) - 4px);background:linear-gradient(158deg,#0c1b29b8,#08131e85)}.notifications-item__head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.notifications-item__title{margin:0;color:#e4eff7fa;font-size:.98rem;font-weight:600}.notifications-item__severity{flex-shrink:0;border-radius:999px;padding:2px 8px;border:1px solid rgba(111,176,198,.26);background:#ffffff0a;color:#bed6e4e0;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase}.notifications-item__severity[data-severity=error],.notifications-item__severity[data-severity=critical]{border-color:#ff707057;color:#ffb9b9f5;background:#520c0c52}.notifications-item__severity[data-severity=warning]{border-color:#ffc97357;color:#ffdcaaf5;background:#5834044d}.notifications-item__body{margin:0;color:#c2d4e0e0;white-space:pre-wrap;line-height:1.6}.notifications-item__actions{display:flex;align-items:center;gap:8px}.notifications-item__link{display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:0 12px;border-radius:12px;border:1px solid rgba(120,183,218,.24);background:linear-gradient(150deg,#1025399e,#0a1a2a70);color:#dff1fff0;text-decoration:none;cursor:pointer}@media(max-width:900px){.notifications-drawer{width:min(100%,100vw - 24px);min-width:0;border-radius:0}}", ti = (e) => e.split("/").map((t) => t.trim()).filter(Boolean), ei = (e) => e === "/belovodya" || e.startsWith("/belovodya/"), Ut = (e, t) => {
  const i = ti(e.path || ""), a = t.default_dashboard;
  return i[0] === "dashboard" ? {
    dashboardPath: i[1] ?? a,
    viewPath: i[2] === "view" ? i.slice(3).join("/") || null : i.slice(2).join("/") || null
  } : i[0] === "view" ? {
    dashboardPath: a,
    viewPath: i.slice(1).join("/") || null
  } : {
    dashboardPath: a,
    viewPath: i.join("/") || null
  };
}, ii = (e, t) => e ? t ? `/${e}/${t}` : `/${e}` : t ? `/lovelace/${t}` : "/lovelace", ai = (e, t = {}) => {
  const i = t.replace ?? !1;
  i ? window.history.replaceState(window.history.state, "", e) : window.history.pushState(window.history.state, "", e);
  const a = new Event("location-changed", {
    bubbles: !0,
    cancelable: !1,
    composed: !0
  });
  a.detail = { replace: i }, window.dispatchEvent(a);
}, z = (e, t = {}) => {
  if (ei(e)) {
    ai(e, t);
    return;
  }
  if (t.replace ?? !1) {
    window.location.replace(e);
    return;
  }
  window.location.assign(e);
};
let w = null;
const de = () => {
  const e = document.querySelector("home-assistant")?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot, t = e?.querySelector("ha-sidebar"), i = e?.querySelector("partial-panel-resolver"), a = i?.querySelector("ha-panel-custom");
  return !(t instanceof HTMLElement) || !(i instanceof HTMLElement) || !(a instanceof HTMLElement) ? null : {
    panelResolver: i,
    panelShell: a,
    sidebar: t
  };
}, at = (e, t) => {
  if (t === null || t === "") {
    e.removeAttribute("style");
    return;
  }
  e.setAttribute("style", t);
}, Vt = () => {
  const e = de();
  return e ? (w || (w = {
    panelResolverStyle: e.panelResolver.getAttribute("style"),
    panelShellStyle: e.panelShell.getAttribute("style"),
    sidebarStyle: e.sidebar.getAttribute("style")
  }), e.sidebar.style.display = "none", e.panelResolver.style.position = "fixed", e.panelResolver.style.inset = "0", e.panelResolver.style.transform = "none", e.panelResolver.style.width = "100vw", e.panelResolver.style.height = "100dvh", e.panelResolver.style.maxWidth = "100vw", e.panelResolver.style.display = "block", e.panelResolver.style.zIndex = "10", e.panelShell.style.position = "fixed", e.panelShell.style.inset = "0", e.panelShell.style.width = "100vw", e.panelShell.style.height = "100dvh", e.panelShell.style.display = "block", !0) : !1;
}, oi = () => {
  const e = de();
  if (!e || !w) {
    w = null;
    return;
  }
  at(e.sidebar, w.sidebarStyle), at(e.panelResolver, w.panelResolverStyle), at(e.panelShell, w.panelShellStyle), w = null;
}, si = "var(--belovodya-gap)", K = (e, t, i = "vertical") => ({
  id: e,
  kind: "stack",
  direction: i,
  gap: si,
  children: t
}), le = (e, t) => ({
  id: e,
  kind: "overlay",
  children: t
}), ri = (e, t, i) => ({
  id: e,
  kind: "floating",
  child: t,
  position: i
}), ni = "var(--belovodya-gap)", Bt = (e, t) => {
  if (typeof e == "number" && Number.isFinite(e))
    return e;
  if (typeof e == "string") {
    const i = Number.parseInt(e, 10);
    if (Number.isFinite(i))
      return i;
  }
  return t;
}, mt = (e) => {
  const t = e.view_layout;
  return t && typeof t == "object" && !Array.isArray(t) ? t : {};
}, wt = (e, t, i = 12) => ({
  id: e,
  kind: "grid",
  columns: i,
  gap: ni,
  children: t
}), di = (e, t, i) => {
  const a = mt(t);
  return a.layout === "overlay" ? le(`${e}-overlay`, [i]) : a.layout === "floating" ? ri(`${e}-floating`, i, {
    top: a.top,
    right: a.right,
    bottom: a.bottom,
    left: a.left
  }) : i;
}, li = (e, t, i) => {
  const a = mt(t), o = {
    id: e,
    kind: "card",
    config: t,
    path: i,
    columnSpan: Math.max(1, Bt(a.columnspan, 3)),
    rowSpan: Math.max(1, Bt(a.rowspan, 1)),
    minHeight: typeof a.min_height == "string" ? a.min_height : void 0
  };
  return di(e, t, o);
}, ci = "lovelace/config", hi = (e) => "views" in e && Array.isArray(e.views), ui = (e, t) => e.path?.trim() || `view-${t + 1}`, pi = (e, t) => e.title?.trim() || `View ${t + 1}`, fi = (e, t, i) => {
  const a = mt(e);
  if (e.type === "grid" && Array.isArray(e.cards)) {
    const o = k(e.cards, `${t}-grid`, [...i, "cards"]);
    return wt(t, o, typeof a.columns == "number" ? a.columns : 2);
  }
  return e.type === "horizontal-stack" && Array.isArray(e.cards) ? K(
    t,
    k(e.cards, `${t}-horizontal-stack`, [...i, "cards"]),
    "horizontal"
  ) : e.type === "vertical-stack" && Array.isArray(e.cards) ? K(
    t,
    k(e.cards, `${t}-vertical-stack`, [...i, "cards"]),
    "vertical"
  ) : a.layout === "stack" && Array.isArray(e.cards) ? K(
    t,
    k(e.cards, `${t}-stack`, [...i, "cards"]),
    a.direction ?? "vertical"
  ) : a.layout === "overlay" && Array.isArray(e.cards) ? le(t, k(e.cards, `${t}-overlay`, [...i, "cards"])) : li(t, e, i);
}, k = (e, t, i) => e.map((a, o) => fi(a, `${t}-card-${o}`, [...i, o])), _i = (e, t) => {
  const i = e.map(
    (a, o) => K(
      `${t}-section-${o}`,
      k(a.cards ?? [], `${t}-section-${o}`, ["sections", o, "cards"]),
      "vertical"
    )
  );
  return wt(`${t}-sections`, i, Math.min(3, Math.max(i.length, 1)));
}, bi = (e, t) => {
  const i = ui(e, t), a = pi(e, t), o = Array.isArray(e.sections) && e.sections.length > 0 ? _i(e.sections, `view-${i}`) : wt(`view-${i}`, k(e.cards ?? [], `view-${i}`, ["cards"]));
  return {
    key: i,
    index: t,
    title: a,
    layout: o,
    raw: e
  };
}, gi = async (e, t) => {
  const i = await e.callWS({
    type: ci,
    url_path: t,
    force: !1
  });
  if (!hi(i))
    throw new Error("Belovodya UI requires a Lovelace dashboard config with resolved views");
  return i;
}, jt = (e, t) => ({
  dashboardPath: t,
  raw: e,
  views: e.views.map((i, a) => bi(i, a))
}), ot = (e, t) => t ? e.views.find((i) => i.key === t) ?? e.views[0] : e.views[0], vi = (e) => e.url_path.startsWith("/") ? e.url_path : `/${e.url_path}`, yi = (e) => {
  if (!(e.show_in_sidebar === !1 || e.url_path === "notfound"))
    return {
      id: `panel-${e.url_path}`,
      path: vi(e),
      title: e.title?.trim() || e.url_path,
      icon: e.icon?.trim() || "mdi:view-dashboard-outline",
      section: "main",
      actionKind: "path",
      nativeClass: null
    };
}, mi = (e) => Object.values(e.panels).filter((t) => !t.require_admin || e.user?.is_admin).map(yi).filter((t) => t !== void 0), Dt = (e, t) => e.length === t.length && e.every((i, a) => {
  const o = t[a];
  return o !== void 0 && i.path === o.path && i.title === o.title && i.icon === o.icon;
}), wi = "home-assistant", $i = "home-assistant-main", xi = "ha-sidebar", qt = Object.freeze({
  configuration: "mdi:cog",
  notifications: "mdi:bell-badge-outline",
  user: "mdi:account-circle-outline"
}), Ft = Object.freeze({
  "/config": "mdi:cog",
  "/profile": "mdi:account-circle-outline"
}), Ci = /* @__PURE__ */ new Set(["configuration", "notifications", "user"]), Si = Object.freeze([
  {
    id: "utility-configuration",
    path: "/config",
    title: "Настройки",
    icon: "mdi:cog",
    section: "utility",
    actionKind: "path",
    nativeClass: "configuration"
  },
  {
    id: "utility-notifications",
    path: null,
    title: "Уведомления",
    icon: "mdi:bell-badge-outline",
    section: "utility",
    actionKind: "native-click",
    nativeClass: "notifications"
  },
  {
    id: "utility-user",
    path: "/profile",
    title: "Профиль",
    icon: "mdi:account-circle-outline",
    section: "utility",
    actionKind: "path",
    nativeClass: "user"
  }
]), ce = (e, t) => String(e ?? "").trim() || t, he = (e) => {
  const t = String(e ?? "").trim();
  if (!t)
    return null;
  try {
    const i = new URL(t, window.location.origin);
    return `${i.pathname}${i.search}${i.hash}`;
  } catch {
    return t.startsWith("/") ? t : `/${t}`;
  }
}, Ai = (e, t, i) => {
  const a = e?.querySelector("ha-icon, ha-svg-icon");
  return a?.icon ? a.icon : i && i in qt ? qt[i] : t && t in Ft ? Ft[t] : "mdi:view-dashboard-outline";
}, Ei = () => document.querySelector(wi)?.shadowRoot ?? null, ki = () => (Ei()?.querySelector($i)?.shadowRoot ?? null)?.querySelector(xi) ?? null, Li = () => {
  const t = ki()?.shadowRoot?.querySelectorAll("ha-md-list") ?? [];
  return Array.from(t);
}, Ti = (e) => {
  const t = e?.shadowRoot?.querySelector("slot");
  return t instanceof HTMLSlotElement ? t.assignedElements({ flatten: !0 }).filter((i) => i instanceof HTMLElement) : Object.freeze([]);
}, ue = (e) => {
  const t = e.href ?? e.getAttribute("href");
  return t || (e.shadowRoot?.querySelector("a[href]")?.href ?? null);
}, $t = (e) => Array.from(e.classList).map((i) => i.trim()).filter(Boolean)[0] ?? null, Gt = (e, t, i) => {
  const a = ce(e.textContent, `item-${i + 1}`), o = he(ue(e)), s = $t(e);
  return {
    id: `${t}-${o ?? s ?? a}-${i}`,
    path: o,
    title: a,
    icon: Ai(e, o, s),
    section: t,
    actionKind: o ? "path" : "native-click",
    nativeClass: s
  };
}, Wt = (e) => {
  const t = $t(e);
  return t ? Ci.has(t) : !1;
}, pe = () => {
  const e = Li().map((a) => Ti(a)), t = e.find((a) => a.some((o) => Wt(o))) ?? Object.freeze([]);
  return { mainElements: e.find(
    (a) => a !== t && a.some((o) => !Wt(o))
  ) ?? Object.freeze([]), utilityElements: t };
}, Mi = (e) => mi(e).filter((t) => t.path !== "/config" && t.path !== "/profile").map((t, i) => ({
  ...t,
  id: `main-${t.path}-${i}`,
  section: "main",
  actionKind: "path",
  nativeClass: null
})), st = (e) => {
  const { mainElements: t, utilityElements: i } = pe(), a = t.map((s, r) => Gt(s, "main", r)).filter((s) => s !== void 0), o = i.map((s, r) => Gt(s, "utility", r)).filter((s) => s !== void 0);
  return {
    main: a.length > 0 ? a : Mi(e),
    utility: o.length > 0 ? o : Si
  };
}, Yt = (e, t) => Dt(e.main, t.main) && Dt(e.utility, t.utility), Kt = (e) => {
  const { utilityElements: t } = pe(), a = t.find((o) => {
    const s = he(ue(o)), r = $t(o), n = ce(o.textContent, "");
    return e.nativeClass && r === e.nativeClass || e.path && s === e.path || n === e.title;
  });
  return a ? (a.click(), !0) : !1;
}, Oi = '.sidebar{position:relative;height:100%;min-height:0;border:1px solid rgba(76,226,204,.24);border-radius:var(--belovodya-radius);overflow:hidden;background:linear-gradient(178deg,#060e16f7,#050b13f2);box-shadow:0 30px 62px #02070e9e,inset 0 1px #ffffff0d}.sidebar:before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 18% 18%,rgba(76,226,204,.08),transparent 28%),radial-gradient(circle at 74% 82%,rgba(117,173,220,.08),transparent 24%),linear-gradient(180deg,#ffffff05,#fff0)}.sidebar__content{position:relative;z-index:1;display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:14px;height:100%;min-height:0;padding:16px;overflow:hidden}.sidebar__content>*:not(.sidebar-particles){position:relative;z-index:1}.sidebar-particles{position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.9}.sidebar-particles__canvas{display:block;width:100%;height:100%}.sidebar__brand{display:flex;align-items:center;gap:12px;min-width:0;width:100%;padding:16px 14px;border:1px solid rgba(120,183,218,.14);border-radius:calc(var(--belovodya-radius) - 2px);background:linear-gradient(150deg,#1025392e,#0a1a2a14);color:inherit;text-align:left;font:inherit;cursor:pointer;appearance:none;transition:border-color .17s ease,background .17s ease,transform .17s ease}.sidebar__brand:hover{border-color:#a2d8f652;background:linear-gradient(150deg,#14314942,#0e233729);transform:translateY(-1px)}.sidebar__brand-mark{width:42px;height:42px;object-fit:contain;border-radius:12px;flex:0 0 auto}.sidebar__brand-copy{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 auto}.sidebar__brand-title{margin:0;font-family:var(--belovodya-display-font);font-size:1.25rem;font-weight:700;letter-spacing:.04em;color:#dcf0fff2}.sidebar__brand-subtitle{margin:0;font-size:.7rem;letter-spacing:.06em;color:#a0c8e6b3;text-transform:uppercase}.sidebar__utility{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 12px;border-radius:12px;border:1px solid rgba(120,183,218,.24);background:linear-gradient(150deg,#1025399e,#0a1a2a70);color:#bce1f7eb;cursor:pointer;transition:border-color .17s ease,background .17s ease,color .17s ease,transform .17s ease}.sidebar__utility:hover,.sidebar__node:hover{border-color:#a2d8f661;background:linear-gradient(150deg,#143149b3,#0e23378f);color:#ddf1fff7;transform:translateY(-1px)}.sidebar__nav-card{display:grid;grid-template-rows:minmax(0,1fr);gap:0;min-height:0;padding:11px;border:1px solid rgba(109,170,192,.24);border-radius:var(--belovodya-radius);background:linear-gradient(164deg,#081621b8,#060e17a8);box-shadow:inset 0 1px #ffffff0a,0 14px 32px #010a124d;overflow:hidden}.sidebar__nav{min-height:0;overflow-y:auto;display:grid;align-content:start;gap:6px;padding-right:2px;scrollbar-width:none;-ms-overflow-style:none}.sidebar__nav::-webkit-scrollbar{width:0;height:0;display:none}.sidebar__node{display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:center;gap:8px;min-height:40px;padding:9px 10px;border-radius:14px;border:1px solid transparent;background:#0915223d;color:#e3eef7f0;text-decoration:none;transition:border-color .16s ease,transform .16s ease,background .16s ease}.sidebar__node--active{border-color:#6ef3dd99;background:linear-gradient(145deg,#14555657,#0b1a26bf)}.sidebar__node-icon,.sidebar__utility-icon{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;color:#449dc2f5;flex:0 0 auto}.sidebar__node-icon ha-icon,.sidebar__utility-icon ha-icon{--mdc-icon-size: 16px}.sidebar__node-text,.sidebar__utility-text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.86rem;font-weight:500}.sidebar__node-meta{font-size:.7rem;color:#5a7d93f5;border:1px solid rgba(103,141,159,.3);border-radius:999px;padding:1px 6px;background:#e8eef414}.sidebar__empty{color:#9eb6c9eb;font-size:.8rem;padding:8px 2px 0}.sidebar__status{display:grid;gap:0;padding:8px;border-radius:var(--belovodya-radius);border:1px solid rgba(120,183,218,.18);background:linear-gradient(146deg,#0f223366,#0a18284d)}.sidebar__status-actions{display:grid;grid-template-columns:1fr;gap:8px}.sidebar__utility{gap:8px;width:100%;justify-content:flex-start}.sidebar--collapsed .sidebar__brand{justify-content:center;padding-inline:8px}.sidebar--collapsed .sidebar__brand-copy,.sidebar--collapsed .sidebar__node-text,.sidebar--collapsed .sidebar__node-meta,.sidebar--collapsed .sidebar__utility-text{display:none}.sidebar--collapsed .sidebar__nav-card,.sidebar--collapsed .sidebar__status{padding-inline:8px}.sidebar--collapsed .sidebar__node{grid-template-columns:1fr;justify-items:center;padding:10px 0}.sidebar--collapsed .sidebar__status-actions{grid-template-columns:1fr}.sidebar--collapsed .sidebar__utility{justify-content:center;padding:0}@media(max-width:900px){.sidebar__status-actions{grid-template-columns:1fr}}', Ni = '@font-face{font-family:Space Grotesk;font-style:normal;font-weight:300 700;font-display:swap;src:url(/belovodya_ui_static/fonts/space-grotesk-latin.woff2) format("woff2")}@font-face{font-family:Cinzel;font-style:normal;font-weight:600 700;font-display:swap;src:url(/belovodya_ui_static/fonts/cinzel-latin.woff2) format("woff2")}:host{--belovodya-sidebar-width: 256px;--belovodya-shell-inset-top: 18px;--belovodya-shell-inset-bottom: 16px;--belovodya-shell-inset-inline: clamp(10px, 1.8vw, 22px);--belovodya-gap: 14px;--belovodya-radius: 18px;--belovodya-bg: #06121a;--belovodya-bg-soft: #0a1a24;--belovodya-surface: rgba(8, 20, 31, .76);--belovodya-surface-strong: rgba(10, 24, 36, .9);--belovodya-panel: linear-gradient(180deg, rgba(6, 14, 22, .97), rgba(5, 11, 19, .95));--belovodya-card-bg: rgba(10, 24, 36, .74);--belovodya-border: rgba(132, 170, 188, .22);--belovodya-accent: #2dd4bf;--belovodya-accent-soft: #6ef2dc;--belovodya-text: #e7eff6;--belovodya-text-muted: #9db3c5;--belovodya-danger: #ff6f61;--belovodya-shadow: 0 28px 60px rgba(0, 0, 0, .48);--belovodya-font: "Space Grotesk", "Segoe UI", sans-serif;--belovodya-display-font: "Cinzel", "Space Grotesk", serif;position:fixed;inset:0;z-index:2147483600;inline-size:100vw;block-size:100dvh;min-inline-size:0;min-block-size:0;overflow:hidden;color:var(--belovodya-text);font-family:var(--belovodya-font);background-color:var(--belovodya-bg);background-image:radial-gradient(circle at 62% -4%,rgba(46,157,168,.14),transparent 30%),radial-gradient(circle at 18% 10%,rgba(26,140,131,.22),transparent 38%),radial-gradient(circle at 82% 84%,rgba(18,96,98,.2),transparent 42%),linear-gradient(168deg,#02060d,#05131c 40%,#062118 74%,#030c14)}:host:before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(180deg,#02060a70,#02080e0f 44%,#02070c80),radial-gradient(circle at 50% -8%,rgba(127,229,216,.08),transparent 38%)}:host:after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(circle at 8% 18%,rgba(83,236,215,.08),transparent 36%),radial-gradient(circle at 92% 82%,rgba(85,172,224,.08),transparent 34%),repeating-linear-gradient(0deg,#d5f0ff04 0 1px,#02070d00 1px 4px);opacity:.84;mix-blend-mode:screen}:host,:host *{box-sizing:border-box}:host([sidebar-collapsed]){--belovodya-sidebar-width: 96px}', Ri = "persistent_notification/get", Ii = "repairs/list_issues", C = (e, t = "") => String(e ?? "").trim() || t, fe = (e) => String(e ?? "").trim() || null, Pi = (e) => {
  const t = e.translation_placeholders?.title;
  if (typeof t == "string" && t.trim())
    return t.trim();
  const i = C(e.translation_key, "");
  return i ? i.split("_").map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(" ") : `${C(e.domain, "system")}:${C(e.issue_id, "issue")}`;
}, Hi = (e) => {
  const t = [
    e.breaks_in_ha_version ? `Требует внимания до версии HA ${e.breaks_in_ha_version}.` : "",
    e.learn_more_url ? `Подробнее: ${e.learn_more_url}` : ""
  ].filter(Boolean);
  return t.length > 0 ? t.join(`
`) : "Home Assistant сообщил о проблеме, которую стоит проверить в разделе Repairs.";
}, zi = (e, t) => ({
  actionPath: "/config/repairs",
  body: Hi(e),
  category: "issue",
  id: `${C(e.domain, "issue")}:${C(e.issue_id, String(t + 1))}`,
  severity: fe(e.severity),
  title: Pi(e)
}), Ui = (e, t) => ({
  actionPath: null,
  body: C(e.message, "Пустое уведомление."),
  category: "notification",
  id: C(e.notification_id, `notification-${t + 1}`),
  severity: fe(e.status),
  title: C(e.title, `Уведомление ${t + 1}`)
}), Vi = () => ({
  fetchedAt: 0,
  issues: Object.freeze([]),
  notifications: Object.freeze([])
}), Bi = async (e) => {
  const [t, i] = await Promise.all([
    e.callWS({ type: Ri }),
    e.callWS({ type: Ii })
  ]);
  return {
    fetchedAt: Date.now(),
    issues: (i.issues ?? []).map(zi),
    notifications: (t ?? []).map(Ui)
  };
}, ji = "sidebar-particles__canvas", m = Object.freeze({
  density: 8e-5,
  minCount: 26,
  maxCount: 88,
  maxDistance: 120,
  speed: 0.12,
  color: "109, 246, 226",
  lineColor: "45, 212, 191"
}), ct = /* @__PURE__ */ new WeakMap(), ht = (e, t, i) => Math.min(Math.max(e, t), i), Di = (e, t) => ({
  x: Math.random() * e,
  y: Math.random() * t,
  vx: (Math.random() - 0.5) * m.speed,
  vy: (Math.random() - 0.5) * m.speed,
  size: 1.4 + Math.random() * 2.2,
  alpha: 0.14 + Math.random() * 0.28
}), _e = (e, t, i) => {
  const a = window.devicePixelRatio || 1, o = Math.max(1, Math.floor(e.clientWidth)), s = Math.max(1, Math.floor(e.clientHeight));
  return t.style.width = "100%", t.style.height = "100%", t.width = Math.max(1, Math.floor(o * a)), t.height = Math.max(1, Math.floor(s * a)), i.setTransform(a, 0, 0, a, 0, 0), { width: o, height: s };
}, be = (e, t, i) => {
  const a = ht(
    Math.round(t * i * m.density),
    m.minCount,
    m.maxCount
  );
  if (e.length > a) {
    e.splice(a);
    return;
  }
  for (; e.length < a; )
    e.push(Di(t, i));
}, ge = (e, t) => {
  const { canvas: i, context: a, particles: o } = t, { width: s, height: r } = _e(e, i, a);
  be(o, s, r), a.clearRect(0, 0, s, r);
  for (const n of o)
    n.x += n.vx, n.y += n.vy, (n.x <= 0 || n.x >= s) && (n.vx *= -1, n.x = ht(n.x, 0, s)), (n.y <= 0 || n.y >= r) && (n.vy *= -1, n.y = ht(n.y, 0, r)), a.beginPath(), a.fillStyle = `rgba(${m.color}, ${n.alpha})`, a.arc(n.x, n.y, n.size, 0, Math.PI * 2), a.fill();
  for (let n = 0; n < o.length; n += 1) {
    const d = o[n];
    for (let u = n + 1; u < o.length; u += 1) {
      const f = o[u], c = d.x - f.x, h = d.y - f.y, p = Math.hypot(c, h);
      if (p > m.maxDistance)
        continue;
      const b = (1 - p / m.maxDistance) * 0.22;
      a.beginPath(), a.strokeStyle = `rgba(${m.lineColor}, ${b.toFixed(3)})`, a.lineWidth = 1, a.moveTo(d.x, d.y), a.lineTo(f.x, f.y), a.stroke();
    }
  }
  t.animationFrameId = window.requestAnimationFrame(() => ge(e, t));
}, ve = (e) => {
  if (!e)
    return;
  const t = ct.get(e);
  t && (window.cancelAnimationFrame(t.animationFrameId), t.observer.disconnect(), ct.delete(e)), e.innerHTML = "", delete e.dataset.particlesReady;
}, Zt = async (e) => {
  if (!e || e.dataset.particlesReady === "1")
    return;
  ve(e);
  const t = document.createElement("canvas");
  t.className = ji, t.setAttribute("aria-hidden", "true"), t.style.position = "absolute", t.style.inset = "0", t.style.display = "block", e.append(t);
  const i = t.getContext("2d");
  if (!i)
    return;
  const a = {
    animationFrameId: 0,
    canvas: t,
    context: i,
    observer: new ResizeObserver(() => {
      const { width: o, height: s } = _e(e, t, i);
      be(a.particles, o, s);
    }),
    particles: []
  };
  a.observer.observe(e), ct.set(e, a), e.dataset.particlesReady = "1", ge(e, a);
}, qi = "lovelace/resources", Jt = /* @__PURE__ */ new Map();
let rt, F;
const Fi = (e) => new URL(e, window.location.origin).toString(), Gi = (e) => new Promise((t, i) => {
  if (document.head.querySelector(`link[href="${e}"]`)) {
    t();
    return;
  }
  const o = document.createElement("link");
  o.rel = "stylesheet", o.href = e, o.addEventListener("load", () => t(), { once: !0 }), o.addEventListener("error", () => i(new Error(`Failed to load resource: ${e}`)), { once: !0 }), document.head.append(o);
}), Wi = (e, t) => new Promise((i, a) => {
  const o = `script[src="${e}"]`;
  if (document.head.querySelector(o)) {
    i();
    return;
  }
  const r = document.createElement("script");
  r.src = e, r.async = !0, t === "module" && (r.type = "module"), r.addEventListener("load", () => i(), { once: !0 }), r.addEventListener("error", () => a(new Error(`Failed to load resource: ${e}`)), { once: !0 }), document.head.append(r);
}), Yi = (e) => {
  const t = Fi(e.url), i = Jt.get(t);
  if (i)
    return i;
  const a = (() => {
    switch (e.type) {
      case "css":
        return Gi(t);
      case "js":
      case "module":
        return Wi(t, e.type);
      default:
        return Promise.resolve();
    }
  })();
  return Jt.set(t, a), a;
}, ut = async (e) => {
  rt || (rt = e.callWS({ type: qi }).then((t) => Promise.all(t.map((i) => Yi(i))).then(() => {
  }))), await rt;
}, Ki = async () => {
  for (let e = 0; e < 40; e += 1) {
    if (typeof window.loadCardHelpers == "function")
      return window.loadCardHelpers();
    await new Promise((t) => window.setTimeout(t, 50));
  }
  throw new Error(
    "Lovelace runtime is unavailable. Open any native dashboard once to warm Home Assistant card helpers."
  );
}, ye = async (e) => (e && await ut(e), F || (F = Ki().catch((t) => {
  throw F = void 0, t;
})), F), me = Object.freeze([
  {
    value: "native",
    label: "Native",
    description: "Повторяет исходную структуру Lovelace."
  },
  {
    value: "dense",
    label: "Dense",
    description: "Уплотняет сетку и уменьшает вертикальные зазоры."
  },
  {
    value: "focus",
    label: "Focus",
    description: "Делает крупнее карточки и снижает число колонок."
  },
  {
    value: "stack",
    label: "Stack",
    description: "Собирает главный контент в один вертикальный поток."
  }
]), we = (e, t) => t === "dense" ? {
  ...e,
  columnSpan: Math.max(1, Math.min(e.columnSpan, 2)),
  minHeight: e.minHeight ?? "180px"
} : t === "focus" ? {
  ...e,
  columnSpan: Math.max(2, e.columnSpan),
  minHeight: e.minHeight ?? "280px"
} : t === "stack" ? {
  ...e,
  columnSpan: 1,
  rowSpan: 1,
  minHeight: e.minHeight ?? "240px"
} : { ...e }, pt = (e) => {
  switch (e.kind) {
    case "grid":
    case "stack":
    case "overlay":
      return e.children.flatMap((t) => pt(t));
    case "floating":
      return pt(e.child);
    case "card":
      return [we(e, "stack")];
    default:
      return [];
  }
}, Zi = (e, t) => {
  const i = e.children.map((a) => q(a, t));
  return t === "dense" ? {
    ...e,
    columns: Math.max(e.columns, 4),
    gap: "12px",
    children: i
  } : t === "focus" ? {
    ...e,
    columns: Math.min(e.columns, 2),
    gap: "18px",
    children: i
  } : t === "stack" ? {
    ...e,
    columns: 1,
    gap: "14px",
    children: i
  } : {
    ...e,
    children: i
  };
}, Ji = (e, t) => ({
  ...e,
  direction: t === "stack" ? "vertical" : e.direction,
  gap: t === "dense" ? "12px" : e.gap,
  children: e.children.map((i) => q(i, t))
}), Qi = (e, t) => ({
  ...e,
  children: e.children.map((i) => q(i, t))
}), Xi = (e, t) => ({
  ...e,
  child: q(e.child, t)
}), q = (e, t) => {
  if (t === "stack")
    return {
      id: `${e.id}-stacked`,
      kind: "stack",
      direction: "vertical",
      gap: "14px",
      children: pt(e)
    };
  switch (e.kind) {
    case "grid":
      return Zi(e, t);
    case "stack":
      return Ji(e, t);
    case "overlay":
      return Qi(e, t);
    case "floating":
      return Xi(e, t);
    case "card":
      return we(e, t);
    default:
      return e;
  }
};
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $e = "important", ta = " !" + $e, G = se(class extends re {
  constructor(e) {
    if (super(e), e.type !== oe.ATTRIBUTE || e.name !== "style" || e.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(e) {
    return Object.keys(e).reduce((t, i) => {
      const a = e[i];
      return a == null ? t : t + `${i = i.includes("-") ? i : i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${a};`;
    }, "");
  }
  update(e, [t]) {
    const { style: i } = e.element;
    if (this.ft === void 0) return this.ft = new Set(Object.keys(t)), this.render(t);
    for (const a of this.ft) t[a] == null && (this.ft.delete(a), a.includes("-") ? i.removeProperty(a) : i[a] = null);
    for (const a in t) {
      const o = t[a];
      if (o != null) {
        this.ft.add(a);
        const s = typeof o == "string" && o.endsWith(ta);
        a.includes("-") || s ? i.setProperty(a, s ? o.slice(0, -11) : o, s ? $e : "") : i[a] = o;
      }
    }
    return S;
  }
}), xt = ":host{display:block}.belovodya-layout-card{position:relative;display:block;grid-column:span var(--belovodya-card-column-span, 3);grid-row:span var(--belovodya-card-row-span, 1);min-height:var(--belovodya-card-min-height, 220px)}.belovodya-layout-card--editable{padding-top:34px}.belovodya-card-shell{height:100%;min-height:inherit;padding:2px;border-radius:22px;background:linear-gradient(180deg,#7ba5b824,#0610180a)}.belovodya-card-mount,.belovodya-card-mount>*{display:block;height:100%}.belovodya-card-mount>*{min-height:inherit}.belovodya-card-error{display:grid;place-items:center;min-height:inherit;padding:22px;border-radius:20px;background:#121a21eb;border:1px dashed rgba(255,111,97,.5);color:var(--belovodya-danger);text-align:center}.belovodya-card-edit-chip{position:absolute;top:0;right:10px;display:inline-flex;align-items:center;gap:6px;min-height:30px;padding:0 10px;border-radius:999px;border:1px solid rgba(112,242,221,.38);background:linear-gradient(146deg,#10363be0,#0a1824eb);color:#e4f1f7f5;font:inherit;font-size:.78rem;cursor:pointer;box-shadow:0 10px 24px #0000003d}.belovodya-card-edit-chip svg{width:14px;height:14px;stroke:currentColor;stroke-width:1.5}", ea = /* @__PURE__ */ new Set(["entity", "camera_image"]), nt = [];
let dt = 0;
const ia = (e) => {
  nt.push(e), dt === 0 && (dt = window.requestAnimationFrame(() => {
    dt = 0;
    const t = nt.splice(0, nt.length);
    for (const i of t)
      i();
  }));
}, aa = (e) => {
  const t = /* @__PURE__ */ new Set(), i = (a) => {
    if (Array.isArray(a)) {
      for (const o of a)
        i(o);
      return;
    }
    if (!(!a || typeof a != "object"))
      for (const [o, s] of Object.entries(a)) {
        if (ea.has(o) && typeof s == "string") {
          t.add(s);
          continue;
        }
        if (o === "entities" && Array.isArray(s)) {
          for (const r of s)
            typeof r == "string" ? t.add(r) : i(r);
          continue;
        }
        i(s);
      }
  };
  return i(e), Object.freeze([...t]);
}, oa = (e, t, i) => !t || e.language !== t.language || e.selectedTheme !== t.selectedTheme || e.themes !== t.themes || i.length === 0 ? !0 : i.some((a) => e.states[a] !== t.states[a]);
class sa extends x {
  static properties = {
    hass: { attribute: !1 },
    config: { attribute: !1 },
    visible: { type: Boolean },
    _error: { state: !0 }
  };
  static styles = J`
    ${g(xt)}
  `;
  _card;
  _error;
  _mount;
  _observer;
  _entities = Object.freeze([]);
  constructor() {
    super(), this.visible = !1;
  }
  render() {
    return l`
      <div class="belovodya-card-shell">
        ${this._error ? l`<div class="belovodya-card-error" role="alert">${this._error}</div>` : _}
        <div class="belovodya-card-mount"></div>
      </div>
    `;
  }
  connectedCallback() {
    super.connectedCallback(), this._observeVisibility();
  }
  disconnectedCallback() {
    this._observer?.disconnect(), super.disconnectedCallback();
  }
  firstUpdated() {
    this._mount = this.renderRoot.querySelector(".belovodya-card-mount"), this.visible && this._ensureCard();
  }
  shouldUpdate(t) {
    return t.has("config") || t.has("visible") || t.has("_error");
  }
  updated(t) {
    if (t.has("config") && (this._entities = aa(this.config), this._teardownCard(), this.visible && this._ensureCard()), t.has("visible") && this.visible && this._ensureCard(), t.has("hass") && this.hass && this._card) {
      const i = t.get("hass");
      oa(this.hass, i, this._entities) && (this._card.hass = this.hass);
    }
  }
  _observeVisibility() {
    this.visible || this._observer || (this._observer = new IntersectionObserver((t) => {
      t.some((i) => i.isIntersecting) && (this.visible = !0, this._observer?.disconnect(), this._observer = void 0);
    }, {
      rootMargin: "240px 0px",
      threshold: 0.01
    }), this._observer.observe(this));
  }
  _teardownCard() {
    this._card = void 0, this._mount && this._mount.replaceChildren();
  }
  async _ensureCard() {
    if (!(!this.visible || !this.config || !this._mount || this._card))
      try {
        const i = (await ye(this.hass)).createCardElement(this.config);
        ia(() => {
          this._mount && (this._card = i, this.hass && (i.hass = this.hass), this._mount.replaceChildren(i));
        }), this._error = void 0;
      } catch (t) {
        this._error = t instanceof Error ? t.message : "Failed to render Lovelace card";
      }
  }
}
customElements.get("belovodya-card-host") || customElements.define("belovodya-card-host", sa);
const ra = (e, t) => t ? JSON.stringify({
  entity: e.entity,
  title: e.title,
  heading: e.heading,
  name: e.name,
  type: e.type
}).toLowerCase().includes(t.toLowerCase()) : !0;
class na extends x {
  static properties = {
    hass: { attribute: !1 },
    layout: { attribute: !1 },
    editable: { type: Boolean, reflect: !0 },
    searchQuery: { type: String }
  };
  static styles = J`
    ${g(ne)}
    ${g(xt)}
  `;
  constructor() {
    super(), this.editable = !1, this.searchQuery = "";
  }
  render() {
    return this.layout ? l`${this._renderNode(this.layout)}` : l`<div class="belovodya-empty-state">No layout is available for this dashboard.</div>`;
  }
  _renderNode(t) {
    switch (t.kind) {
      case "grid":
        return this._renderGrid(t);
      case "stack":
        return this._renderStack(t);
      case "overlay":
        return this._renderOverlay(t);
      case "floating":
        return this._renderFloating(t);
      case "card":
        return this._renderCard(t);
      default:
        return l`${_}`;
    }
  }
  _renderGrid(t) {
    return l`
      <section
        class="belovodya-layout-grid"
        style=${G({
      "--belovodya-grid-columns": String(t.columns),
      "--belovodya-grid-gap": t.gap
    })}
      >
        ${N(t.children, (i) => i.id, (i) => this._renderNode(i))}
      </section>
    `;
  }
  _renderStack(t) {
    return l`
      <section
        class=${`belovodya-layout-stack belovodya-layout-stack--${t.direction}`}
        style=${G({
      "--belovodya-stack-gap": t.gap,
      "--belovodya-stack-direction": t.direction
    })}
      >
        ${N(t.children, (i) => i.id, (i) => this._renderNode(i))}
      </section>
    `;
  }
  _renderOverlay(t) {
    return l`
      <section class="belovodya-layout-overlay">
        ${N(t.children, (i) => i.id, (i) => this._renderNode(i))}
      </section>
    `;
  }
  _renderFloating(t) {
    return l`
      <section
        class="belovodya-layout-floating"
        style=${G({
      top: t.position.top ?? "auto",
      right: t.position.right ?? "auto",
      bottom: t.position.bottom ?? "auto",
      left: t.position.left ?? "auto"
    })}
      >
        ${this._renderNode(t.child)}
      </section>
    `;
  }
  _renderCard(t) {
    return ra(t.config, this.searchQuery) ? l`
      <div
        class=${`belovodya-layout-card${this.editable ? " belovodya-layout-card--editable" : ""}`}
        style=${G({
      "--belovodya-card-column-span": String(t.columnSpan),
      "--belovodya-card-row-span": String(t.rowSpan),
      "--belovodya-card-min-height": t.minHeight ?? "220px"
    })}
      >
        <belovodya-card-host
          .config=${t.config}
          .hass=${this.hass}
          .visible=${!0}
        ></belovodya-card-host>
        ${this.editable ? l`
              <button
                class="belovodya-card-edit-chip"
                type="button"
                title="Редактировать карточку"
                @click=${(i) => this._requestEdit(i, t)}
              >
                ${this._renderEditIcon()} Редактировать
              </button>
            ` : null}
      </div>
    ` : l`${_}`;
  }
  _requestEdit(t, i) {
    t.preventDefault(), t.stopPropagation(), this.dispatchEvent(new CustomEvent("belovodya-edit-card", {
      bubbles: !0,
      composed: !0,
      detail: { node: i }
    }));
  }
  _renderEditIcon() {
    return l`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.25 13.95V15.75H6.05L14.44 7.36L12.64 5.56L4.25 13.95Z"></path>
        <path d="M15.23 6.57L13.43 4.77L14.33 3.87C14.73 3.48 15.36 3.48 15.76 3.87L16.13 4.24C16.52 4.64 16.52 5.27 16.13 5.67L15.23 6.57Z"></path>
      </svg>
    `;
  }
}
customElements.get("belovodya-layout") || customElements.define("belovodya-layout", na);
const da = ".belovodya-editor-backdrop{position:fixed;inset:0;z-index:2147483640;background:#01080f9e;backdrop-filter:blur(6px)}.belovodya-editor{position:fixed;inset:24px 24px 24px 280px;z-index:2147483641;display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:14px;padding:18px;border-radius:24px;border:1px solid rgba(130,184,217,.2);background:linear-gradient(180deg,#08121cf5,#070f18fa);box-shadow:0 36px 84px #0000007a;overflow:hidden}.belovodya-editor__header,.belovodya-editor__footer{display:flex;align-items:center;justify-content:space-between;gap:12px}.belovodya-editor__eyebrow{margin:0 0 6px;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;color:#76e8d7bd}.belovodya-editor__title{margin:0;font-family:var(--belovodya-display-font);font-size:1.6rem;color:#e2f0faf5}.belovodya-editor__meta{margin:6px 0 0;color:#9ebacdd6;font-size:.88rem}.belovodya-editor__header-actions,.belovodya-editor__footer-actions,.belovodya-editor__tabs{display:inline-flex;align-items:center;gap:8px}.belovodya-editor__body{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);gap:16px;min-height:0}.belovodya-editor__pane,.belovodya-editor__preview{min-height:0;border-radius:20px;border:1px solid rgba(100,145,170,.22);background:linear-gradient(166deg,#0a1926d1,#060f18b8);overflow:hidden}.belovodya-editor__pane{display:grid;grid-template-rows:auto minmax(0,1fr)}.belovodya-editor__tabs{padding:14px;border-bottom:1px solid rgba(100,145,170,.16)}.belovodya-editor__tab,.belovodya-editor__button,.belovodya-editor__icon-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;padding:0 14px;border-radius:14px;border:1px solid rgba(120,183,218,.24);background:linear-gradient(150deg,#1025399e,#0a1a2a70);color:#dff1fff0;cursor:pointer;transition:border-color .16s ease,background .16s ease,transform .16s ease}.belovodya-editor__tab--active,.belovodya-editor__button--primary{border-color:#70f2dd85;background:linear-gradient(150deg,#15454fc7,#0d223599)}.belovodya-editor__icon-button{width:42px;padding:0}.belovodya-editor__button[disabled],.belovodya-editor__icon-button[disabled],.belovodya-editor__tab[disabled]{opacity:.48;cursor:default;transform:none}.belovodya-editor__content,.belovodya-editor__preview-body{min-height:0;overflow:auto;padding:14px}.belovodya-editor__content>*{width:100%}.belovodya-editor__state{display:grid;place-items:center;min-height:100%;padding:28px;text-align:center;color:#b4c9d8d6;line-height:1.6}.belovodya-editor__layout-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.belovodya-editor__field{display:grid;gap:6px}.belovodya-editor__field--full{grid-column:1 / -1}.belovodya-editor__field label{font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:#8dacc2c2}.belovodya-editor__field input,.belovodya-editor__field select,.belovodya-editor__textarea{width:100%;min-height:42px;padding:0 12px;border-radius:12px;border:1px solid rgba(108,156,187,.24);background:#08131dc7;color:#e4eff8f5;font:inherit}.belovodya-editor__preview-shell{max-width:520px;margin:0 auto}.belovodya-editor__error{color:#ff978a}@media(max-width:1100px){.belovodya-editor{inset:18px}.belovodya-editor__body{grid-template-columns:1fr}}", U = (e) => typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e)), la = (e) => String(
  e.title ?? e.name ?? e.heading ?? e.entity ?? e.type ?? "card"
), ca = (e) => e.view_layout && typeof e.view_layout == "object" && !Array.isArray(e.view_layout) ? { ...e.view_layout } : {};
class ha extends x {
  static properties = {
    open: { type: Boolean, reflect: !0 },
    hass: { attribute: !1 },
    lovelaceConfig: { attribute: !1 },
    cardConfig: { attribute: !1 },
    cardLabel: { type: String },
    saveHandler: { attribute: !1 },
    _activeTab: { state: !0 },
    _guiAvailable: { state: !0 },
    _guiError: { state: !0 },
    _loadingGui: { state: !0 },
    _saveError: { state: !0 },
    _saving: { state: !0 },
    _workingConfig: { state: !0 },
    _yamlValid: { state: !0 }
  };
  static styles = J`
    ${g(da)}
    ${g(xt)}
  `;
  _editorEl;
  _editorType;
  _editorLoadToken = 0;
  constructor() {
    super(), this.open = !1, this.cardLabel = "", this._activeTab = "config", this._guiAvailable = !0, this._guiError = null, this._loadingGui = !1, this._saveError = null, this._saving = !1, this._yamlValid = !0;
  }
  willUpdate(t) {
    (t.has("open") && this.open || t.has("cardConfig")) && this._resetDraft();
  }
  updated(t) {
    if (!this.open) {
      this._disposeEditor();
      return;
    }
    this._activeTab === "config" && (!this._loadingGui && this._editorEl && this._mountGuiEditor(), (t.has("open") || t.has("hass") || t.has("lovelaceConfig") || t.has("cardConfig") || t.has("_workingConfig")) && this._ensureGuiEditor());
  }
  disconnectedCallback() {
    this._disposeEditor(), super.disconnectedCallback();
  }
  render() {
    if (!this.open || !this._workingConfig)
      return _;
    const t = this.cardLabel || la(this._workingConfig), i = this._guiError ?? (this._guiAvailable ? null : "У этой карточки нет визуального редактора. Доступен YAML и Layout.");
    return l`
      <div class="belovodya-editor-backdrop" @click=${this._handleBackdropClick}></div>
      <section class="belovodya-editor" role="dialog" aria-modal="true" aria-label="Редактирование карточки">
        <header class="belovodya-editor__header">
          <div>
            <p class="belovodya-editor__eyebrow">Card Editor</p>
            <h2 class="belovodya-editor__title">${t}</h2>
            <p class="belovodya-editor__meta">Стандартный GUI editor HA используется, когда карточка его предоставляет. Иначе остаётся YAML.</p>
          </div>
          <div class="belovodya-editor__header-actions">
            <button class="belovodya-editor__icon-button" type="button" title="Закрыть" @click=${this._requestClose}>
              ${this._renderCloseIcon()}
            </button>
          </div>
        </header>

        <div class="belovodya-editor__body">
          <section class="belovodya-editor__pane">
            <div class="belovodya-editor__tabs">
              <button
                class=${`belovodya-editor__tab${this._activeTab === "config" ? " belovodya-editor__tab--active" : ""}`}
                type="button"
                @click=${() => this._setTab("config")}
              >
                Config
              </button>
              <button
                class=${`belovodya-editor__tab${this._activeTab === "layout" ? " belovodya-editor__tab--active" : ""}`}
                type="button"
                @click=${() => this._setTab("layout")}
              >
                Layout
              </button>
              <button
                class=${`belovodya-editor__tab${this._activeTab === "yaml" ? " belovodya-editor__tab--active" : ""}`}
                type="button"
                @click=${() => this._setTab("yaml")}
              >
                YAML
              </button>
            </div>

            <div class="belovodya-editor__content">
              ${this._activeTab === "config" ? this._loadingGui ? l`<div class="belovodya-editor__state">Загружаю GUI editor Home Assistant...</div>` : i ? l`<div class="belovodya-editor__state">${i}</div>` : l`<div id="gui-slot"></div>` : _}

              ${this._activeTab === "yaml" ? l`
                    <ha-yaml-editor
                      .hass=${this.hass}
                      .value=${this._workingConfig}
                      .autoUpdate=${!0}
                      .inDialog=${!0}
                      .disableFullscreen=${!0}
                      @value-changed=${this._handleYamlChanged}
                    ></ha-yaml-editor>
                  ` : _}

              ${this._activeTab === "layout" ? l`
                    <div class="belovodya-editor__layout-form">
                      <div class="belovodya-editor__field">
                        <label for="layout-mode">Layout mode</label>
                        <select id="layout-mode" @change=${this._handleLayoutModeChanged}>
                          ${["", "stack", "overlay", "floating"].map((a) => l`
                            <option value=${a} ?selected=${String(this._workingConfig?.view_layout?.layout ?? "") === a}>
                              ${a || "default"}
                            </option>
                          `)}
                        </select>
                      </div>
                      <div class="belovodya-editor__field">
                        <label for="direction">Direction</label>
                        <select id="direction" @change=${(a) => this._updateLayoutField("direction", a.currentTarget.value || void 0)}>
                          ${["", "vertical", "horizontal"].map((a) => l`
                            <option value=${a} ?selected=${String(this._workingConfig?.view_layout?.direction ?? "") === a}>
                              ${a || "default"}
                            </option>
                          `)}
                        </select>
                      </div>
                      <div class="belovodya-editor__field">
                        <label for="columnspan">Column span</label>
                        <input id="columnspan" type="number" min="1" .value=${String(this._workingConfig?.view_layout?.columnspan ?? "")} @input=${(a) => this._updateLayoutField("columnspan", this._readNumberInput(a))} />
                      </div>
                      <div class="belovodya-editor__field">
                        <label for="rowspan">Row span</label>
                        <input id="rowspan" type="number" min="1" .value=${String(this._workingConfig?.view_layout?.rowspan ?? "")} @input=${(a) => this._updateLayoutField("rowspan", this._readNumberInput(a))} />
                      </div>
                      <div class="belovodya-editor__field belovodya-editor__field--full">
                        <label for="min-height">Minimum height</label>
                        <input id="min-height" type="text" .value=${String(this._workingConfig?.view_layout?.min_height ?? "")} @input=${(a) => this._updateLayoutField("min_height", this._readTextInput(a))} />
                      </div>
                      <div class="belovodya-editor__field">
                        <label for="pos-top">Top</label>
                        <input id="pos-top" type="text" .value=${String(this._workingConfig?.view_layout?.top ?? "")} @input=${(a) => this._updateLayoutField("top", this._readTextInput(a))} />
                      </div>
                      <div class="belovodya-editor__field">
                        <label for="pos-right">Right</label>
                        <input id="pos-right" type="text" .value=${String(this._workingConfig?.view_layout?.right ?? "")} @input=${(a) => this._updateLayoutField("right", this._readTextInput(a))} />
                      </div>
                      <div class="belovodya-editor__field">
                        <label for="pos-bottom">Bottom</label>
                        <input id="pos-bottom" type="text" .value=${String(this._workingConfig?.view_layout?.bottom ?? "")} @input=${(a) => this._updateLayoutField("bottom", this._readTextInput(a))} />
                      </div>
                      <div class="belovodya-editor__field">
                        <label for="pos-left">Left</label>
                        <input id="pos-left" type="text" .value=${String(this._workingConfig?.view_layout?.left ?? "")} @input=${(a) => this._updateLayoutField("left", this._readTextInput(a))} />
                      </div>
                    </div>
                  ` : _}
            </div>
          </section>

          <aside class="belovodya-editor__preview">
            <div class="belovodya-editor__content">
              <div class="belovodya-editor__preview-shell">
                <belovodya-card-host
                  .hass=${this.hass}
                  .config=${this._workingConfig}
                  .visible=${!0}
                ></belovodya-card-host>
              </div>
            </div>
          </aside>
        </div>

        <footer class="belovodya-editor__footer">
          <div class="belovodya-editor__error">${this._saveError ?? ""}</div>
          <div class="belovodya-editor__footer-actions">
            <button class="belovodya-editor__button" type="button" @click=${this._requestClose}>Отмена</button>
            <button
              class="belovodya-editor__button belovodya-editor__button--primary"
              type="button"
              ?disabled=${this._saving || !this._yamlValid || !this._workingConfig}
              @click=${this._handleSave}
            >
              ${this._saving ? "Сохраняю..." : "Сохранить"}
            </button>
          </div>
        </footer>
      </section>
    `;
  }
  _resetDraft() {
    if (!this.cardConfig) {
      this._workingConfig = void 0;
      return;
    }
    this._workingConfig = U(this.cardConfig), this._activeTab = "config", this._guiAvailable = !0, this._guiError = null, this._saveError = null, this._yamlValid = !0, this._disposeEditor();
  }
  _disposeEditor() {
    this._editorEl && this._editorEl.removeEventListener("config-changed", this._handleGuiConfigChanged), this._editorEl = void 0, this._editorType = void 0, this.renderRoot.querySelector("#gui-slot")?.replaceChildren();
  }
  _mountGuiEditor() {
    const t = this.renderRoot.querySelector("#gui-slot");
    !(t instanceof HTMLElement) || !this._editorEl || t.firstElementChild !== this._editorEl && t.replaceChildren(this._editorEl);
  }
  async _ensureGuiEditor() {
    if (!this.open || !this.hass || !this._workingConfig)
      return;
    const t = this._workingConfig.type;
    if (!t) {
      this._guiAvailable = !1, this._guiError = "В конфигурации карточки отсутствует type.";
      return;
    }
    if (this._editorEl && this._editorType === t) {
      this._syncEditorState();
      return;
    }
    this._loadingGui = !0, this._guiError = null;
    const i = ++this._editorLoadToken;
    try {
      const s = (await ye(this.hass)).createCardElement(this._workingConfig).constructor;
      if (typeof s.getConfigElement != "function") {
        this._guiAvailable = !1, this._guiError = null, this._disposeEditor();
        return;
      }
      const r = await Promise.resolve(s.getConfigElement());
      if (i !== this._editorLoadToken)
        return;
      this._disposeEditor(), this._editorEl = r, this._editorType = t, this._editorEl.addEventListener("config-changed", this._handleGuiConfigChanged), this._guiAvailable = !0, this._guiError = null, this._syncEditorState();
    } catch (a) {
      if (i !== this._editorLoadToken)
        return;
      this._guiAvailable = !1, this._guiError = a instanceof Error ? a.message : "Не удалось открыть editor Home Assistant.", this._disposeEditor();
    } finally {
      i === this._editorLoadToken && (this._loadingGui = !1);
    }
  }
  _syncEditorState() {
    !this._editorEl || !this.hass || !this._workingConfig || (this._editorEl.hass = this.hass, this.lovelaceConfig && "lovelace" in this._editorEl && (this._editorEl.lovelace = this.lovelaceConfig), this._editorEl.setConfig(U(this._workingConfig)));
  }
  _handleGuiConfigChanged = (t) => {
    const i = t;
    i.detail?.config && (this._workingConfig = U(i.detail.config), this._saveError = null);
  };
  _handleYamlChanged = (t) => {
    const i = t;
    this._yamlValid = i.detail.isValid ?? !0, !(!i.detail.value || typeof i.detail.value != "object") && (this._workingConfig = U(i.detail.value), this._saveError = null);
  };
  _handleBackdropClick = () => {
    this._requestClose();
  };
  _requestClose = () => {
    this.dispatchEvent(new CustomEvent("belovodya-editor-close", {
      bubbles: !0,
      composed: !0
    }));
  };
  _setTab(t) {
    this._activeTab = t, t === "config" && this._ensureGuiEditor();
  }
  _handleLayoutModeChanged(t) {
    const i = t.currentTarget.value;
    this._updateLayoutField("layout", i || void 0);
  }
  _updateLayoutField(t, i) {
    if (!this._workingConfig)
      return;
    const a = ca(this._workingConfig);
    i == null || i === "" ? delete a[t] : a[t] = i;
    const o = {
      ...this._workingConfig
    };
    Object.keys(a).length === 0 ? delete o.view_layout : o.view_layout = a, this._workingConfig = o, this._saveError = null;
  }
  _readTextInput(t) {
    return t.currentTarget.value.trim() || void 0;
  }
  _readNumberInput(t) {
    const i = t.currentTarget.value.trim();
    if (!i)
      return;
    const a = Number.parseInt(i, 10);
    return Number.isFinite(a) ? a : void 0;
  }
  async _handleSave() {
    if (!(!this.saveHandler || !this._workingConfig || this._saving || !this._yamlValid)) {
      this._saving = !0, this._saveError = null;
      try {
        await this.saveHandler(U(this._workingConfig)), this._saving = !1, this._requestClose();
      } catch (t) {
        this._saving = !1, this._saveError = t instanceof Error ? t.message : "Не удалось сохранить карточку.";
      }
    }
  }
  _renderCloseIcon() {
    return l`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 5L15 15"></path>
        <path d="M15 5L5 15"></path>
      </svg>
    `;
  }
}
customElements.get("belovodya-card-editor-dialog") || customElements.define("belovodya-card-editor-dialog", ha);
const ua = 3e4, xe = "belovodya-ui:sidebar-collapsed", Ce = "belovodya-ui:layout-variant", pa = Object.freeze({
  default_dashboard: null,
  engine_version: "dev",
  panel_url_path: "belovodya",
  sidebar_title: "Belovodya",
  sidebar_icon: "mdi:view-dashboard-outline",
  require_admin: !1
}), fa = Object.freeze({
  main: Object.freeze([]),
  utility: Object.freeze([])
}), v = (e, t) => {
  console.info(`[Belovodya UI] ${e}`, t);
}, W = (e) => Math.round(e * 100) / 100, O = (e) => {
  if (!(e instanceof HTMLElement))
    return null;
  const t = e.getBoundingClientRect();
  return {
    width: W(t.width),
    height: W(t.height),
    top: W(t.top),
    left: W(t.left),
    clientWidth: e.clientWidth,
    clientHeight: e.clientHeight,
    scrollWidth: e.scrollWidth,
    scrollHeight: e.scrollHeight
  };
}, _a = (e) => {
  if (!(e instanceof HTMLElement))
    return null;
  const t = window.getComputedStyle(e);
  return {
    tag: e.tagName.toLowerCase(),
    id: e.id || null,
    className: e.className || null,
    rect: O(e),
    display: t.display,
    position: t.position,
    overflow: t.overflow,
    padding: `${t.paddingTop} ${t.paddingRight} ${t.paddingBottom} ${t.paddingLeft}`,
    margin: `${t.marginTop} ${t.marginRight} ${t.marginBottom} ${t.marginLeft}`
  };
}, ba = (e, t = 5) => {
  const i = [];
  let a = e;
  for (let o = 0; o < t && a; o += 1) {
    const s = _a(a);
    s && i.push(s), a = a.parentElement;
  }
  return i;
}, ga = () => {
  const e = document.body.style.overflow, t = document.documentElement.style.overflow;
  return document.body.style.overflow = "hidden", document.documentElement.style.overflow = "hidden", () => {
    document.body.style.overflow = e, document.documentElement.style.overflow = t;
  };
}, va = () => {
  try {
    return window.localStorage.getItem(xe) === "1";
  } catch {
    return !1;
  }
}, ya = (e) => {
  try {
    window.localStorage.setItem(xe, e ? "1" : "0");
  } catch {
  }
}, ma = () => {
  try {
    const e = window.localStorage.getItem(Ce);
    return me.some((t) => t.value === e) ? e : "native";
  } catch {
    return "native";
  }
}, wa = (e) => {
  try {
    window.localStorage.setItem(Ce, e);
  } catch {
  }
}, $a = (e) => typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e)), xa = (e, t, i, a) => {
  const o = $a(e), r = (o.views ?? [])[t];
  if (!r)
    throw new Error("Belovodya UI could not resolve the target Lovelace view.");
  let n = r;
  for (let u = 0; u < i.length - 1; u += 1) {
    const f = i[u];
    if (n = n[f], !n)
      throw new Error("Belovodya UI failed to resolve nested card path.");
  }
  const d = i[i.length - 1];
  return n[d] = a, o;
}, Ca = (e) => String(
  e.title ?? e.name ?? e.heading ?? e.entity ?? e.type ?? "card"
), ft = (e) => {
  if (!e)
    return !1;
  switch (e.kind) {
    case "card":
      return String(e.config.type ?? "").startsWith("custom:");
    case "grid":
    case "stack":
    case "overlay":
      return e.children.some((t) => ft(t));
    case "floating":
      return ft(e.child);
    default:
      return !1;
  }
};
class Sa extends x {
  static properties = {
    hass: { attribute: !1 },
    narrow: { type: Boolean },
    panel: { attribute: !1 },
    route: { attribute: !1 },
    sidebarCollapsed: { type: Boolean, reflect: !0, attribute: "sidebar-collapsed" },
    _activeView: { state: !0 },
    _dashboard: { state: !0 },
    _dashboardError: { state: !0 },
    _dashboardLoading: { state: !0 },
    _editMode: { state: !0 },
    _editorCard: { state: !0 },
    _layoutVariant: { state: !0 },
    _notificationsError: { state: !0 },
    _notificationsLoading: { state: !0 },
    _notificationsOpen: { state: !0 },
    _notificationsSnapshot: { state: !0 },
    _sidebarSnapshot: { state: !0 }
  };
  static styles = J`
    ${g(Ni)}
    ${g(ne)}
    ${g(Oi)}
    ${g(Qe)}
    ${g(Xe)}
    ${g(Je)}
  `;
  _dashboardLoadToken = 0;
  _restoreScroll;
  _resizeObserver;
  _sidebarBootstrapTimers = [];
  constructor() {
    super(), this.narrow = !1, this.sidebarCollapsed = va(), this._dashboardError = null, this._dashboardLoading = !1, this._editMode = !1, this._layoutVariant = ma(), this._notificationsError = null, this._notificationsLoading = !1, this._notificationsOpen = !1, this._notificationsSnapshot = Vi(), this._sidebarSnapshot = fa;
  }
  connectedCallback() {
    super.connectedCallback(), this._restoreScroll = ga(), window.addEventListener("keydown", this._handleWindowKeydown), window.requestAnimationFrame(() => {
      Vt();
    });
  }
  disconnectedCallback() {
    this._resizeObserver?.disconnect(), this._clearSidebarBootstrapTimers(), window.removeEventListener("keydown", this._handleWindowKeydown), oi(), this._restoreScroll?.(), ve(this.renderRoot.querySelector(".sidebar-particles")), super.disconnectedCallback();
  }
  willUpdate(t) {
    if (t.has("sidebarCollapsed") && ya(this.sidebarCollapsed), t.has("_layoutVariant") && wa(this._layoutVariant), this.hass) {
      const i = st(this.hass);
      (t.has("hass") || !Yt(this._sidebarSnapshot, i)) && this._syncSidebarSnapshot(i);
    }
  }
  firstUpdated() {
    const t = [
      this,
      this.renderRoot.querySelector(".sidebar"),
      this.renderRoot.querySelector(".navbar"),
      this.renderRoot.querySelector(".main"),
      this.renderRoot.querySelector(".dashboard-stage")
    ], i = () => {
      v("shell metrics", {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        host: O(this),
        sidebar: O(this.renderRoot.querySelector(".sidebar")),
        navbar: O(this.renderRoot.querySelector(".navbar")),
        main: O(this.renderRoot.querySelector(".main")),
        canvas: O(this.renderRoot.querySelector(".dashboard-stage")),
        hostChain: ba(this)
      });
    };
    this._resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(i);
    });
    for (const a of t)
      a instanceof Element && this._resizeObserver.observe(a);
    this.hass && (this._syncSidebarSnapshot(st(this.hass)), ut(this.hass), this._syncDashboard()), Vt(), Zt(this.renderRoot.querySelector(".sidebar-particles")), this._scheduleSidebarBootstrapRefresh(), window.requestAnimationFrame(i);
  }
  updated(t) {
    t.has("route") && v("route state", {
      route: this.route,
      location: window.location.pathname
    }), (t.has("hass") || t.has("route") || t.has("panel")) && this._syncDashboard(), t.has("sidebarCollapsed") && Zt(this.renderRoot.querySelector(".sidebar-particles"));
  }
  render() {
    const t = window.location.pathname, i = this._sidebarSnapshot.main, a = this._sidebarSnapshot.utility, o = this._prioritizeActiveNavigation(t, i), s = this._resolveActiveItem(t, i), r = this._notificationsSnapshot.notifications.length + this._notificationsSnapshot.issues.length, n = this._activeView?.title ?? s?.title ?? "Belovodya", d = typeof window.loadCardHelpers != "function", u = this._activeView ? q(this._activeView.layout, this._layoutVariant) : void 0, f = ft(this._activeView?.layout), c = this._layoutVariant === "native" || f;
    return l`
      <aside class=${`sidebar${this.sidebarCollapsed ? " sidebar--collapsed" : ""}`}>
        <div class="sidebar__content">
          <div class="sidebar-particles" aria-hidden="true"></div>

          <button
            class="sidebar__brand"
            type="button"
            title=${this.sidebarCollapsed ? "Развернуть панель" : "Скрыть панель"}
            aria-label=${this.sidebarCollapsed ? "Развернуть панель" : "Скрыть панель"}
            @click=${this._toggleSidebarCollapsed}
          >
            <img
              class="sidebar__brand-mark"
              src="/belovodya_ui_static/img/emblem-mark.png"
              alt=""
              aria-hidden="true"
            />
            <div class="sidebar__brand-copy">
              <div class="sidebar__brand-title">Око</div>
              <div class="sidebar__brand-subtitle">Your Infrastructure in Sight</div>
            </div>
          </button>

          <section class="sidebar__nav-card" aria-label="Home Assistant navigation launcher">
            <nav class="sidebar__nav">
              ${o.length > 0 ? N(
      o,
      (h) => h.id,
      (h) => l`
                      <a
                        class=${`sidebar__node${this._isActivePath(h.path, t) ? " sidebar__node--active" : ""}`}
                        href=${h.path ?? "#"}
                        title=${h.title}
                        @click=${(p) => this._handleNavigationClick(p, h)}
                      >
                        <span class="sidebar__node-icon" aria-hidden="true">
                          <ha-icon .icon=${h.icon}></ha-icon>
                        </span>
                        <span class="sidebar__node-text">${h.title}</span>
                        ${this._isActivePath(h.path, t) ? l`<span class="sidebar__node-meta">active</span>` : null}
                      </a>
                    `
    ) : l`<div class="sidebar__empty">Панели Home Assistant пока не обнаружены.</div>`}
            </nav>
          </section>

          <section class="sidebar__status" aria-label="System actions">
            <div class="sidebar__status-actions">
              ${N(
      a,
      (h) => h.id,
      (h) => l`
                  <button
                    class="sidebar__utility"
                    type="button"
                    title=${h.title}
                    aria-pressed=${h.nativeClass === "notifications" ? String(this._notificationsOpen) : "false"}
                    @click=${() => this._handleUtilityAction(h)}
                  >
                    <span class="sidebar__utility-icon" aria-hidden="true">
                      <ha-icon .icon=${h.icon}></ha-icon>
                    </span>
                    <span class="sidebar__utility-text">${h.title}</span>
                    ${h.nativeClass === "notifications" && r > 0 && !this.sidebarCollapsed ? l`<span class="sidebar__node-meta">${r}</span>` : null}
                  </button>
                `
    )}
            </div>
          </section>
        </div>
      </aside>

      <main class="main" data-belovodya-scroll-root>
        <header class="navbar">
          <div class="navbar__title-pill" aria-label="Current section">
            <span class="navbar__title-icon" aria-hidden="true">${this._renderGridIcon()}</span>
            <span class="navbar__title-text">${n}</span>
          </div>

          <div class="navbar__actions" aria-label="Belovodya dashboard actions">
            <label class="navbar__layout-select-shell">
              <span class="navbar__layout-select-icon" aria-hidden="true">${this._renderLayoutIcon()}</span>
              <select class="navbar__layout-select" .value=${this._layoutVariant} @change=${this._handleLayoutVariantChange}>
                ${me.map((h) => l`
                  <option value=${h.value}>${h.label}</option>
                `)}
              </select>
            </label>

            <button
              class=${`navbar__action${this._editMode ? " navbar__action--active" : ""}`}
              type="button"
              title=${this._editMode ? "Выключить режим редактирования" : "Включить режим редактирования"}
              @click=${this._toggleEditMode}
            >
              <span class="navbar__action-icon" aria-hidden="true">${this._renderEditIcon()}</span>
            </button>

            <button
              class="navbar__action navbar__action--ghost"
              type="button"
              title="Открыть исходный Lovelace dashboard"
              @click=${this._handleOpenOriginalDashboard}
            >
              <span class="navbar__action-icon" aria-hidden="true">${this._renderHomeIcon()}</span>
            </button>
          </div>
        </header>

        <section class="dashboard-stage" aria-label="Belovodya dashboard canvas">
          ${d ? l`
                <div class="dashboard-warning">
                  <div class="dashboard-warning__title">Lovelace runtime ещё не прогрет</div>
                  <div class="dashboard-warning__copy">
                    Стандартные HA card helpers загружаются лениво. Открой исходный dashboard один раз, затем вернись в Belovodya.
                  </div>
                  <button class="launcher-panel__button" type="button" @click=${this._handleOpenOriginalDashboard}>
                    Открыть исходный dashboard
                  </button>
                </div>
              ` : null}

          ${f && this._layoutVariant !== "native" ? l`
                <div class="dashboard-warning">
                  <div class="dashboard-warning__title">Layout variant временно отключён</div>
                  <div class="dashboard-warning__copy">
                    В этой view есть custom cards. Для совместимости Belovodya использует нативный Lovelace renderer вместо ручной пересборки layout.
                  </div>
                </div>
              ` : null}

          ${this._dashboardLoading ? l`<div class="dashboard-state">Читаю Lovelace dashboard config...</div>` : this._dashboardError ? l`
                  <div class="dashboard-state dashboard-state--error">
                    <div class="dashboard-state__title">Не удалось загрузить dashboard</div>
                    <div>${this._dashboardError}</div>
                  </div>
                ` : this._activeView && (u || c) ? l`
                    ${this._editMode && !c ? l`
                          <div class="dashboard-edit-banner">
                            <div class="dashboard-edit-banner__title">Edit mode</div>
                            <div class="dashboard-edit-banner__copy">
                              Выбери карточку в main area. Откроется editor с GUI, если его предоставляет стандартная или кастомная карточка.
                            </div>
                          </div>
                        ` : null}
                    ${c ? l`
                          <belovodya-native-view
                            .hass=${this.hass}
                            .config=${this._dashboard?.raw}
                            .dashboardPath=${this._dashboard?.dashboardPath ?? null}
                            .viewIndex=${this._activeView.index}
                            .narrow=${this.narrow}
                          ></belovodya-native-view>
                        ` : l`
                          <belovodya-layout
                            .hass=${this.hass}
                            .layout=${u}
                            .editable=${this._editMode}
                            @belovodya-edit-card=${this._handleEditCardRequest}
                          ></belovodya-layout>
                        `}
                  ` : l`
                    <div class="dashboard-state">
                      <div class="dashboard-state__title">В dashboard нет доступных views</div>
                      <div>Belovodya не получил ни одной Lovelace view для рендера.</div>
                    </div>
                  `}
        </section>
      </main>

      <div
        class=${`notifications-backdrop${this._notificationsOpen ? " notifications-backdrop--open" : ""}`}
        @click=${this._closeNotificationsDrawer}
      ></div>

      <aside
        class=${`notifications-drawer${this._notificationsOpen ? " notifications-drawer--open" : ""}`}
        aria-hidden=${String(!this._notificationsOpen)}
      >
        <header class="notifications-drawer__header">
          <div>
            <p class="notifications-drawer__eyebrow">Системные уведомления</p>
            <h2 class="notifications-drawer__title">Уведомления</h2>
            <p class="notifications-drawer__meta">
              ${this._notificationsLoading ? "Загружаю уведомления Home Assistant..." : `${this._notificationsSnapshot.issues.length} repairs · ${this._notificationsSnapshot.notifications.length} persistent`}
            </p>
          </div>
          <div class="notifications-drawer__header-actions">
            <button
              class="notifications-drawer__button notifications-drawer__button--ghost"
              type="button"
              title="Обновить"
              @click=${this._refreshNotificationsClick}
            >
              Обновить
            </button>
            <button
              class="notifications-drawer__button"
              type="button"
              title="Закрыть"
              @click=${this._closeNotificationsDrawer}
            >
              Закрыть
            </button>
          </div>
        </header>

        <div class="notifications-drawer__body">
          ${this._notificationsLoading ? l`<div class="notifications-drawer__state">Получаю системные уведомления из Home Assistant.</div>` : this._notificationsError ? l`<div class="notifications-drawer__state">${this._notificationsError}</div>` : this._notificationsSnapshot.issues.length === 0 && this._notificationsSnapshot.notifications.length === 0 ? l`
                    <div class="notifications-drawer__empty">
                      <div class="notifications-drawer__empty-icon" aria-hidden="true">${this._renderBellIcon()}</div>
                      <div class="notifications-drawer__empty-title">Нет уведомлений</div>
                      <div class="notifications-drawer__empty-copy">
                        В Home Assistant сейчас нет активных persistent notifications и repairs issues.
                      </div>
                    </div>
                  ` : l`
                    ${this._notificationsSnapshot.issues.length > 0 ? this._renderNotificationsSection("Repairs", this._notificationsSnapshot.issues) : null}
                    ${this._notificationsSnapshot.notifications.length > 0 ? this._renderNotificationsSection("Persistent", this._notificationsSnapshot.notifications) : null}
                  `}
        </div>
      </aside>

      <belovodya-card-editor-dialog
        .open=${!!this._editorCard}
        .hass=${this.hass}
        .lovelaceConfig=${this._dashboard?.raw}
        .cardConfig=${this._editorCard?.config}
        .cardLabel=${this._editorCard ? Ca(this._editorCard.config) : ""}
        .saveHandler=${this._saveEditedCard}
        @belovodya-editor-close=${this._handleEditorClose}
      ></belovodya-card-editor-dialog>
    `;
  }
  _renderNotificationsSection(t, i) {
    return l`
      <section class="notifications-section">
        <div class="notifications-section__head">
          <h3 class="notifications-section__title">${t}</h3>
          <span class="notifications-section__count">${i.length}</span>
        </div>
        <div class="notifications-list">
          ${N(
      i,
      (a) => a.id,
      (a) => l`
              <article class="notifications-item">
                <div class="notifications-item__head">
                  <h4 class="notifications-item__title">${a.title}</h4>
                  ${a.severity ? l`<span class="notifications-item__severity" data-severity=${a.severity.toLowerCase()}>
                        ${a.severity}
                      </span>` : null}
                </div>
                <p class="notifications-item__body">${a.body}</p>
                ${a.actionPath ? l`
                      <div class="notifications-item__actions">
                        <a
                          class="notifications-item__link"
                          href=${a.actionPath}
                          @click=${(o) => this._handleNotificationNavigate(o, a.actionPath)}
                        >
                          Открыть
                        </a>
                      </div>
                    ` : null}
              </article>
            `
    )}
        </div>
      </section>
    `;
  }
  async _syncDashboard() {
    if (!this.hass)
      return;
    const t = this._resolveRouteState();
    if (!(!this._dashboard || this._dashboard.dashboardPath !== t.dashboardPath)) {
      const o = this._dashboard;
      o && (this._activeView = ot(o, t.viewPath));
      return;
    }
    const a = ++this._dashboardLoadToken;
    this._dashboardLoading = !0, this._dashboardError = null;
    try {
      await ut(this.hass);
      const o = await gi(this.hass, t.dashboardPath);
      if (a !== this._dashboardLoadToken)
        return;
      const s = jt(o, t.dashboardPath);
      this._dashboard = s, this._activeView = ot(s, t.viewPath), v("dashboard loaded", {
        dashboardPath: t.dashboardPath,
        views: s.views.map((r) => ({ key: r.key, title: r.title }))
      });
    } catch (o) {
      if (a !== this._dashboardLoadToken)
        return;
      this._dashboardError = o instanceof Error ? o.message : "Не удалось получить Lovelace config.", this._dashboard = void 0, this._activeView = void 0, v("dashboard error", o);
    } finally {
      a === this._dashboardLoadToken && (this._dashboardLoading = !1);
    }
  }
  _syncSidebarSnapshot(t) {
    v("navigation source", {
      panels: this.hass ? Object.values(this.hass.panels).map((i) => ({
        url_path: i.url_path,
        title: i.title,
        icon: i.icon,
        show_in_sidebar: i.show_in_sidebar,
        require_admin: i.require_admin
      })) : [],
      extracted: t
    }), !Yt(this._sidebarSnapshot, t) && (this._sidebarSnapshot = t);
  }
  _refreshSidebarSnapshot = () => {
    this.hass && this._syncSidebarSnapshot(st(this.hass));
  };
  _resolveDefaultDashboardPath() {
    const t = this._panelConfig.default_dashboard;
    if (t)
      return t;
    if (!this.hass)
      return null;
    const i = Object.values(this.hass.panels), a = i.find(
      (o) => o.component_name === "lovelace" && o.url_path !== "belovodya" && o.url_path !== "lovelace"
    );
    return a ? a.url_path : i.find((o) => o.component_name === "lovelace" && o.url_path !== "belovodya")?.url_path ?? null;
  }
  _resolveRouteState() {
    const t = Ut(this.route ?? { path: "" }, this._panelConfig);
    return {
      ...t,
      dashboardPath: t.dashboardPath ?? this._resolveDefaultDashboardPath()
    };
  }
  _clearSidebarBootstrapTimers() {
    for (const t of this._sidebarBootstrapTimers)
      window.clearTimeout(t);
    this._sidebarBootstrapTimers = [];
  }
  _scheduleSidebarBootstrapRefresh() {
    this._clearSidebarBootstrapTimers();
    for (const t of [0, 120, 360, 1e3]) {
      const i = window.setTimeout(() => {
        this._refreshSidebarSnapshot();
      }, t);
      this._sidebarBootstrapTimers.push(i);
    }
  }
  _resolveActiveItem(t, i) {
    return i.find((a) => this._isActivePath(a.path, t));
  }
  _prioritizeActiveNavigation(t, i) {
    const a = i.findIndex((s) => this._isActivePath(s.path, t));
    if (a <= 0)
      return i;
    const o = i[a];
    return o ? [
      o,
      ...i.slice(0, a),
      ...i.slice(a + 1)
    ] : i;
  }
  _isActivePath(t, i) {
    return t ? i === t || i.startsWith(`${t}/`) : !1;
  }
  _handleNavigationClick(t, i) {
    if (t.preventDefault(), this._notificationsOpen = !1, v("navigation click", { item: i }), i.actionKind === "native-click") {
      !Kt(i) && i.path && z(i.path);
      return;
    }
    i.path && z(i.path);
  }
  _handleUtilityAction(t) {
    if (v("utility click", { item: t }), t.nativeClass === "notifications") {
      this._toggleNotificationsDrawer();
      return;
    }
    if (t.actionKind === "native-click" && Kt(t)) {
      this._notificationsOpen = !1;
      return;
    }
    t.path && (this._notificationsOpen = !1, z(t.path));
  }
  _toggleSidebarCollapsed = () => {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  };
  _toggleEditMode = () => {
    this._editMode = !this._editMode, this._editMode || (this._editorCard = void 0);
  };
  _handleLayoutVariantChange = (t) => {
    const i = t.currentTarget.value;
    this._layoutVariant = i;
  };
  _handleWindowKeydown = (t) => {
    if (t.key === "Escape" && this._notificationsOpen) {
      this._notificationsOpen = !1;
      return;
    }
    t.key === "Escape" && this._editorCard && (this._editorCard = void 0);
  };
  _closeNotificationsDrawer = () => {
    this._notificationsOpen = !1;
  };
  _refreshNotificationsClick = () => {
    this._loadNotifications(!0);
  };
  async _toggleNotificationsDrawer() {
    if (this._notificationsOpen) {
      this._notificationsOpen = !1;
      return;
    }
    this._notificationsOpen = !0, await this._loadNotifications(!1);
  }
  async _loadNotifications(t) {
    if (!this.hass || this._notificationsLoading)
      return;
    const i = Date.now() - this._notificationsSnapshot.fetchedAt;
    if (!(!t && this._notificationsSnapshot.fetchedAt > 0 && i < ua)) {
      this._notificationsLoading = !0, this._notificationsError = null;
      try {
        this._notificationsSnapshot = await Bi(this.hass), v("notifications snapshot", this._notificationsSnapshot);
      } catch (a) {
        this._notificationsError = "Не удалось получить уведомления Home Assistant.", v("notifications error", a);
      } finally {
        this._notificationsLoading = !1;
      }
    }
  }
  _handleNotificationNavigate(t, i) {
    t.preventDefault(), this._notificationsOpen = !1, z(i);
  }
  _handleOpenOriginalDashboard = () => {
    const t = this._resolveRouteState(), i = ii(t.dashboardPath, this._activeView?.key ?? t.viewPath);
    this._notificationsOpen = !1, z(i);
  };
  _handleEditCardRequest = (t) => {
    if (!this._editMode)
      return;
    const i = t;
    this._editorCard = i.detail.node, this._notificationsOpen = !1, v("edit card request", {
      path: i.detail.node.path,
      type: i.detail.node.config.type
    });
  };
  _handleEditorClose = () => {
    this._editorCard = void 0;
  };
  _saveEditedCard = async (t) => {
    if (!this.hass || !this._dashboard || !this._activeView || !this._editorCard)
      throw new Error("Belovodya UI lost the current editor context.");
    const i = xa(
      this._dashboard.raw,
      this._activeView.index,
      this._editorCard.path,
      t
    );
    await this.hass.callWS({
      type: "lovelace/config/save",
      url_path: this._dashboard.dashboardPath,
      config: i
    });
    const a = jt(i, this._dashboard.dashboardPath), o = Ut(this.route ?? { path: "" }, this._panelConfig);
    this._dashboard = a, this._activeView = ot(a, o.viewPath), this._editorCard = void 0, v("card saved", {
      dashboardPath: this._dashboard.dashboardPath,
      view: this._activeView?.key,
      cardType: t.type
    });
  };
  get _panelConfig() {
    return this.panel?.config ?? pa;
  }
  _renderGridIcon() {
    return l`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="5" height="5" rx="1.2"></rect>
        <rect x="12" y="3" width="5" height="5" rx="1.2"></rect>
        <rect x="3" y="12" width="5" height="5" rx="1.2"></rect>
        <rect x="12" y="12" width="5" height="5" rx="1.2"></rect>
      </svg>
    `;
  }
  _renderHomeIcon() {
    return l`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.25 9.25L10 4.5L15.75 9.25V15.25C15.75 15.66 15.41 16 15 16H11.75V11.75H8.25V16H5C4.59 16 4.25 15.66 4.25 15.25V9.25Z"></path>
      </svg>
    `;
  }
  _renderBellIcon() {
    return l`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 16.25C10.83 16.25 11.5 15.58 11.5 14.75H8.5C8.5 15.58 9.17 16.25 10 16.25Z"></path>
        <path d="M14.25 13.5H5.75L6.56 12.15C6.88 11.61 7.05 11 7.05 10.37V8.75C7.05 7.12 8.37 5.8 10 5.8C11.63 5.8 12.95 7.12 12.95 8.75V10.37C12.95 11 13.12 11.61 13.44 12.15L14.25 13.5Z"></path>
        <path d="M8.25 4.9C8.25 3.93 9.03 3.15 10 3.15C10.97 3.15 11.75 3.93 11.75 4.9"></path>
      </svg>
    `;
  }
  _renderEditIcon() {
    return l`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.25 13.95V15.75H6.05L14.44 7.36L12.64 5.56L4.25 13.95Z"></path>
        <path d="M15.23 6.57L13.43 4.77L14.33 3.87C14.73 3.48 15.36 3.48 15.76 3.87L16.13 4.24C16.52 4.64 16.52 5.27 16.13 5.67L15.23 6.57Z"></path>
      </svg>
    `;
  }
  _renderLayoutIcon() {
    return l`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 4.5H16.5V7.5H3.5V4.5Z"></path>
        <path d="M3.5 9.25H9.5V15.5H3.5V9.25Z"></path>
        <path d="M10.75 9.25H16.5V12H10.75V9.25Z"></path>
        <path d="M10.75 13.25H16.5V15.5H10.75V13.25Z"></path>
      </svg>
    `;
  }
}
customElements.get("belovodya-app") || customElements.define("belovodya-app", Sa);
