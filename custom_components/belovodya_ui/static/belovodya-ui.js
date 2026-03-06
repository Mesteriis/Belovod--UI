/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const N = globalThis, D = N.ShadowRoot && (N.ShadyCSS === void 0 || N.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, V = Symbol(), Q = /* @__PURE__ */ new WeakMap();
let lt = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== V) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (D && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = Q.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Q.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const T = (s) => new lt(typeof s == "string" ? s : s + "", void 0, V), yt = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((i, o, r) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + s[r + 1], s[0]);
  return new lt(e, s, V);
}, $t = (s, t) => {
  if (D) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), o = N.litNonce;
    o !== void 0 && i.setAttribute("nonce", o), i.textContent = e.cssText, s.appendChild(i);
  }
}, G = D ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return T(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ft, defineProperty: _t, getOwnPropertyDescriptor: bt, getOwnPropertyNames: mt, getOwnPropertySymbols: gt, getPrototypeOf: At } = Object, H = globalThis, K = H.trustedTypes, wt = K ? K.emptyScript : "", Et = H.reactiveElementPolyfillSupport, S = (s, t) => s, B = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? wt : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, ht = (s, t) => !ft(s, t), Z = { attribute: !0, type: String, converter: B, reflect: !1, useDefault: !1, hasChanged: ht };
Symbol.metadata ??= Symbol("metadata"), H.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let m = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Z) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), o = this.getPropertyDescriptor(t, i, e);
      o !== void 0 && _t(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: o, set: r } = bt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(a) {
      this[e] = a;
    } };
    return { get: o, set(a) {
      const d = o?.call(this);
      r?.call(this, a), this.requestUpdate(t, d, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Z;
  }
  static _$Ei() {
    if (this.hasOwnProperty(S("elementProperties"))) return;
    const t = At(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(S("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(S("properties"))) {
      const e = this.properties, i = [...mt(e), ...gt(e)];
      for (const o of i) this.createProperty(o, e[o]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, o] of e) this.elementProperties.set(i, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const o = this._$Eu(e, i);
      o !== void 0 && this._$Eh.set(o, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const o of i) e.unshift(G(o));
    } else t !== void 0 && e.push(G(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
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
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return $t(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    const i = this.constructor.elementProperties.get(t), o = this.constructor._$Eu(t, i);
    if (o !== void 0 && i.reflect === !0) {
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : B).toAttribute(e, i.type);
      this._$Em = t, r == null ? this.removeAttribute(o) : this.setAttribute(o, r), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const i = this.constructor, o = i._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const r = i.getPropertyOptions(o), a = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : B;
      this._$Em = o;
      const d = a.fromAttribute(e, r.type);
      this[o] = d ?? this._$Ej?.get(o) ?? d, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, o = !1, r) {
    if (t !== void 0) {
      const a = this.constructor;
      if (o === !1 && (r = this[t]), i ??= a.getPropertyOptions(t), !((i.hasChanged ?? ht)(r, e) || i.useDefault && i.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: o, wrapped: r }, a) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, a ?? e ?? this[t]), r !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), o === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
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
        for (const [o, r] of this._$Ep) this[o] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [o, r] of i) {
        const { wrapped: a } = r, d = this[o];
        a !== !0 || this._$AL.has(o) || d === void 0 || this.C(o, void 0, r, d);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
m.elementStyles = [], m.shadowRootOptions = { mode: "open" }, m[S("elementProperties")] = /* @__PURE__ */ new Map(), m[S("finalized")] = /* @__PURE__ */ new Map(), Et?.({ ReactiveElement: m }), (H.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const j = globalThis, J = (s) => s, R = j.trustedTypes, Y = R ? R.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, dt = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, ct = "?" + y, St = `<${ct}>`, b = document, C = () => b.createComment(""), P = (s) => s === null || typeof s != "object" && typeof s != "function", I = Array.isArray, xt = (s) => I(s) || typeof s?.[Symbol.iterator] == "function", z = `[ 	
\f\r]`, w = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, X = /-->/g, tt = />/g, $ = RegExp(`>|${z}(?:([^\\s"'>=/]+)(${z}*=${z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), et = /'/g, st = /"/g, ut = /^(?:script|style|textarea|title)$/i, Ct = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), E = Ct(1), g = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), it = /* @__PURE__ */ new WeakMap(), _ = b.createTreeWalker(b, 129);
function pt(s, t) {
  if (!I(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Y !== void 0 ? Y.createHTML(t) : t;
}
const Pt = (s, t) => {
  const e = s.length - 1, i = [];
  let o, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = w;
  for (let d = 0; d < e; d++) {
    const n = s[d];
    let c, u, l = -1, p = 0;
    for (; p < n.length && (a.lastIndex = p, u = a.exec(n), u !== null); ) p = a.lastIndex, a === w ? u[1] === "!--" ? a = X : u[1] !== void 0 ? a = tt : u[2] !== void 0 ? (ut.test(u[2]) && (o = RegExp("</" + u[2], "g")), a = $) : u[3] !== void 0 && (a = $) : a === $ ? u[0] === ">" ? (a = o ?? w, l = -1) : u[1] === void 0 ? l = -2 : (l = a.lastIndex - u[2].length, c = u[1], a = u[3] === void 0 ? $ : u[3] === '"' ? st : et) : a === st || a === et ? a = $ : a === X || a === tt ? a = w : (a = $, o = void 0);
    const v = a === $ && s[d + 1].startsWith("/>") ? " " : "";
    r += a === w ? n + St : l >= 0 ? (i.push(c), n.slice(0, l) + dt + n.slice(l) + y + v) : n + y + (l === -2 ? d : v);
  }
  return [pt(s, r + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class k {
  constructor({ strings: t, _$litType$: e }, i) {
    let o;
    this.parts = [];
    let r = 0, a = 0;
    const d = t.length - 1, n = this.parts, [c, u] = Pt(t, e);
    if (this.el = k.createElement(c, i), _.currentNode = this.el.content, e === 2 || e === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (o = _.nextNode()) !== null && n.length < d; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const l of o.getAttributeNames()) if (l.endsWith(dt)) {
          const p = u[a++], v = o.getAttribute(l).split(y), U = /([.?@])?(.*)/.exec(p);
          n.push({ type: 1, index: r, name: U[2], strings: v, ctor: U[1] === "." ? Ot : U[1] === "?" ? Ut : U[1] === "@" ? Nt : L }), o.removeAttribute(l);
        } else l.startsWith(y) && (n.push({ type: 6, index: r }), o.removeAttribute(l));
        if (ut.test(o.tagName)) {
          const l = o.textContent.split(y), p = l.length - 1;
          if (p > 0) {
            o.textContent = R ? R.emptyScript : "";
            for (let v = 0; v < p; v++) o.append(l[v], C()), _.nextNode(), n.push({ type: 2, index: ++r });
            o.append(l[p], C());
          }
        }
      } else if (o.nodeType === 8) if (o.data === ct) n.push({ type: 2, index: r });
      else {
        let l = -1;
        for (; (l = o.data.indexOf(y, l + 1)) !== -1; ) n.push({ type: 7, index: r }), l += y.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const i = b.createElement("template");
    return i.innerHTML = t, i;
  }
}
function A(s, t, e = s, i) {
  if (t === g) return t;
  let o = i !== void 0 ? e._$Co?.[i] : e._$Cl;
  const r = P(t) ? void 0 : t._$litDirective$;
  return o?.constructor !== r && (o?._$AO?.(!1), r === void 0 ? o = void 0 : (o = new r(s), o._$AT(s, e, i)), i !== void 0 ? (e._$Co ??= [])[i] = o : e._$Cl = o), o !== void 0 && (t = A(s, o._$AS(s, t.values), o, i)), t;
}
class kt {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: i } = this._$AD, o = (t?.creationScope ?? b).importNode(e, !0);
    _.currentNode = o;
    let r = _.nextNode(), a = 0, d = 0, n = i[0];
    for (; n !== void 0; ) {
      if (a === n.index) {
        let c;
        n.type === 2 ? c = new O(r, r.nextSibling, this, t) : n.type === 1 ? c = new n.ctor(r, n.name, n.strings, this, t) : n.type === 6 && (c = new Tt(r, this, t)), this._$AV.push(c), n = i[++d];
      }
      a !== n?.index && (r = _.nextNode(), a++);
    }
    return _.currentNode = b, o;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class O {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, i, o) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = o, this._$Cv = o?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = A(this, t, e), P(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== g && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : xt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && P(this._$AH) ? this._$AA.nextSibling.data = t : this.T(b.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: i } = t, o = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = k.createElement(pt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === o) this._$AH.p(e);
    else {
      const r = new kt(o, this), a = r.u(this.options);
      r.p(e), this.T(a), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = it.get(t.strings);
    return e === void 0 && it.set(t.strings, e = new k(t)), e;
  }
  k(t) {
    I(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, o = 0;
    for (const r of t) o === e.length ? e.push(i = new O(this.O(C()), this.O(C()), this, this.options)) : i = e[o], i._$AI(r), o++;
    o < e.length && (this._$AR(i && i._$AB.nextSibling, o), e.length = o);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const i = J(t).nextSibling;
      J(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class L {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, o, r) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = e, this._$AM = o, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = h;
  }
  _$AI(t, e = this, i, o) {
    const r = this.strings;
    let a = !1;
    if (r === void 0) t = A(this, t, e, 0), a = !P(t) || t !== this._$AH && t !== g, a && (this._$AH = t);
    else {
      const d = t;
      let n, c;
      for (t = r[0], n = 0; n < r.length - 1; n++) c = A(this, d[i + n], e, n), c === g && (c = this._$AH[n]), a ||= !P(c) || c !== this._$AH[n], c === h ? t = h : t !== h && (t += (c ?? "") + r[n + 1]), this._$AH[n] = c;
    }
    a && !o && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Ot extends L {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class Ut extends L {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class Nt extends L {
  constructor(t, e, i, o, r) {
    super(t, e, i, o, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = A(this, t, e, 0) ?? h) === g) return;
    const i = this._$AH, o = t === h && i !== h || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== h && (i === h || o);
    o && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Tt {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    A(this, t);
  }
}
const Mt = j.litHtmlPolyfillSupport;
Mt?.(k, O), (j.litHtmlVersions ??= []).push("3.3.2");
const Rt = (s, t, e) => {
  const i = e?.renderBefore ?? t;
  let o = i._$litPart$;
  if (o === void 0) {
    const r = e?.renderBefore ?? null;
    i._$litPart$ = o = new O(t.insertBefore(C(), r), r, void 0, e ?? {});
  }
  return o._$AI(s), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const F = globalThis;
class x extends m {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Rt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return g;
  }
}
x._$litElement$ = !0, x.finalized = !0, F.litElementHydrateSupport?.({ LitElement: x });
const Ht = F.litElementPolyfillSupport;
Ht?.({ LitElement: x });
(F.litElementVersions ??= []).push("4.2.2");
const Lt = ":host{--belovodya-fade-duration: .22s}@keyframes belovodya-fade-up{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.sidebar,.navbar,.main{animation:belovodya-fade-up var(--belovodya-fade-duration) ease}", zt = ":host{height:100vh;width:100vw;display:grid;grid-template-columns:var(--belovodya-sidebar-width) minmax(0,1fr);grid-template-rows:var(--belovodya-navbar-height) minmax(0,1fr)}.sidebar{grid-column:1;grid-row:1 / span 2;min-width:0}.navbar{grid-column:2;grid-row:1;min-width:0}.main{grid-column:2;grid-row:2;min-width:0;min-height:0;overflow-y:auto;padding:18px 20px 24px}.belovodya-status{margin:0 0 18px;padding:14px 18px;border-radius:18px;background:var(--belovodya-surface);border:1px solid var(--belovodya-border);box-shadow:var(--belovodya-shadow)}.belovodya-status--error{color:var(--belovodya-danger)}.belovodya-layout-grid{display:grid;grid-template-columns:repeat(var(--belovodya-grid-columns, 12),minmax(0,1fr));gap:var(--belovodya-grid-gap, var(--belovodya-gap));align-items:start}.belovodya-layout-stack{display:flex;flex-direction:var(--belovodya-stack-direction, column);gap:var(--belovodya-stack-gap, var(--belovodya-gap))}.belovodya-layout-overlay{position:relative;min-height:320px}.belovodya-layout-overlay>*{position:absolute;inset:0}.belovodya-layout-floating{position:relative;z-index:2}.belovodya-empty-state{padding:28px;border-radius:20px;background:var(--belovodya-surface);border:1px solid var(--belovodya-border)}@media(max-width:1100px){:host{grid-template-columns:minmax(240px,34vw) minmax(0,1fr)}}@media(max-width:900px){:host{grid-template-columns:1fr;grid-template-rows:auto auto minmax(0,1fr)}.sidebar{grid-column:1;grid-row:1}.navbar{grid-column:1;grid-row:2}.main{grid-column:1;grid-row:3}}", Bt = ':host{--belovodya-sidebar-width: 20vw ;--belovodya-navbar-height: calc(100vh / 12);--belovodya-gap: 18px;--belovodya-radius: 24px;--belovodya-bg: #061018;--belovodya-surface: rgba(11, 25, 36, .84);--belovodya-surface-strong: rgba(7, 18, 28, .96);--belovodya-panel: linear-gradient(180deg, rgba(9, 24, 36, .98), rgba(7, 18, 28, .96));--belovodya-card-bg: rgba(10, 26, 37, .82);--belovodya-border: rgba(123, 165, 184, .2);--belovodya-accent: #69c4b8;--belovodya-accent-strong: #a7e4b5;--belovodya-text: #edf7f7;--belovodya-text-muted: #9ab5bb;--belovodya-danger: #ff6f61;--belovodya-shadow: 0 28px 60px rgba(0, 7, 12, .46);--belovodya-font: "Manrope", "IBM Plex Sans", "Avenir Next", sans-serif;color:var(--belovodya-text);background:radial-gradient(circle at 15% 20%,rgba(105,196,184,.22),transparent 28%),radial-gradient(circle at 85% 10%,rgba(167,228,181,.14),transparent 22%),linear-gradient(180deg,#051018,#091822);font-family:var(--belovodya-font)}:host,:host *{box-sizing:border-box}', Dt = (s) => s.split("/").map((t) => t.trim()).filter(Boolean), ot = (s, t) => {
  const e = Dt(s.path || ""), i = t.default_dashboard;
  return e[0] === "dashboard" ? {
    dashboardPath: e[1] ?? i,
    viewPath: e[2] === "view" ? e.slice(3).join("/") || null : e.slice(2).join("/") || null
  } : e[0] === "view" ? {
    dashboardPath: i,
    viewPath: e.slice(1).join("/") || null
  } : {
    dashboardPath: i,
    viewPath: e.join("/") || null
  };
}, Vt = (s, t, e) => {
  const i = t ? t.split("/").filter(Boolean).map((o) => encodeURIComponent(o)).join("/") : "";
  return e ? i ? `/${s}/dashboard/${encodeURIComponent(e)}/view/${i}` : `/${s}/dashboard/${encodeURIComponent(e)}` : i ? `/${s}/view/${i}` : `/${s}`;
}, jt = (s, t) => s ? t ? `/${s}/${t}` : `/${s}` : t ? `/lovelace/${t}` : "/lovelace", rt = (s, t = {}) => {
  const e = t.replace ?? !1;
  e ? window.history.replaceState(window.history.state, "", s) : window.history.pushState(window.history.state, "", s);
  const i = new Event("location-changed", {
    bubbles: !0,
    cancelable: !1,
    composed: !0
  });
  i.detail = { replace: e }, window.dispatchEvent(i);
}, It = "var(--belovodya-gap)", M = (s, t, e = "vertical") => ({
  id: s,
  kind: "stack",
  direction: e,
  gap: It,
  children: t
}), vt = (s, t) => ({
  id: s,
  kind: "overlay",
  children: t
}), Ft = (s, t, e) => ({
  id: s,
  kind: "floating",
  child: t,
  position: e
}), Wt = "var(--belovodya-gap)", at = (s, t) => {
  if (typeof s == "number" && Number.isFinite(s))
    return s;
  if (typeof s == "string") {
    const e = Number.parseInt(s, 10);
    if (Number.isFinite(e))
      return e;
  }
  return t;
}, W = (s) => {
  const t = s.view_layout;
  return t && typeof t == "object" && !Array.isArray(t) ? t : {};
}, q = (s, t, e = 12) => ({
  id: s,
  kind: "grid",
  columns: e,
  gap: Wt,
  children: t
}), qt = (s, t, e) => {
  const i = W(t);
  return i.layout === "overlay" ? vt(`${s}-overlay`, [e]) : i.layout === "floating" ? Ft(`${s}-floating`, e, {
    top: i.top,
    right: i.right,
    bottom: i.bottom,
    left: i.left
  }) : e;
}, Qt = (s, t) => {
  const e = W(t), i = {
    id: s,
    kind: "card",
    config: t,
    columnSpan: Math.max(1, at(e.columnspan, 3)),
    rowSpan: Math.max(1, at(e.rowspan, 1)),
    minHeight: typeof e.min_height == "string" ? e.min_height : void 0
  };
  return qt(s, t, i);
}, Gt = "lovelace/config", Kt = (s) => "views" in s && Array.isArray(s.views), Zt = (s, t) => s.path?.trim() || `view-${t + 1}`, Jt = (s, t) => s.title?.trim() || `View ${t + 1}`, Yt = (s, t) => {
  const e = W(s);
  if (s.type === "grid" && Array.isArray(s.cards)) {
    const i = f(s.cards, `${t}-grid`);
    return q(t, i, typeof e.columns == "number" ? e.columns : 2);
  }
  return s.type === "horizontal-stack" && Array.isArray(s.cards) ? M(
    t,
    f(s.cards, `${t}-horizontal-stack`),
    "horizontal"
  ) : s.type === "vertical-stack" && Array.isArray(s.cards) ? M(
    t,
    f(s.cards, `${t}-vertical-stack`),
    "vertical"
  ) : e.layout === "stack" && Array.isArray(s.cards) ? M(
    t,
    f(s.cards, `${t}-stack`),
    e.direction ?? "vertical"
  ) : e.layout === "overlay" && Array.isArray(s.cards) ? vt(t, f(s.cards, `${t}-overlay`)) : Qt(t, s);
}, f = (s, t) => s.map((e, i) => Yt(e, `${t}-card-${i}`)), Xt = (s, t) => {
  const e = s.map(
    (i, o) => M(
      `${t}-section-${o}`,
      f(i.cards ?? [], `${t}-section-${o}`),
      "vertical"
    )
  );
  return q(`${t}-sections`, e, Math.min(3, Math.max(e.length, 1)));
}, te = (s, t) => {
  const e = Zt(s, t), i = Jt(s, t), o = Array.isArray(s.sections) && s.sections.length > 0 ? Xt(s.sections, `view-${e}`) : q(`view-${e}`, f(s.cards ?? [], `view-${e}`));
  return {
    key: e,
    title: i,
    layout: o,
    raw: s
  };
}, ee = async (s, t) => {
  const e = await s.callWS({
    type: Gt,
    url_path: t,
    force: !1
  });
  if (!Kt(e))
    throw new Error("Belovodya UI requires a Lovelace dashboard config with resolved views");
  return e;
}, se = (s, t) => ({
  dashboardPath: t,
  raw: s,
  views: s.views.map((e, i) => te(e, i))
}), ie = (s, t) => t ? s.views.find((e) => e.key === t) ?? s.views[0] : s.views[0], oe = (s, t) => {
  const e = ["Belovodya"];
  return s.dashboardPath && e.push(s.dashboardPath), t && e.push(t.title), e;
}, re = (s) => {
  if (!(s.show_in_sidebar === !1 || s.url_path === "notfound"))
    return {
      path: `/${s.url_path}`,
      title: s.title || s.url_path,
      icon: s.icon || "mdi:view-dashboard-outline"
    };
}, nt = (s) => Object.values(s.panels).filter((t) => !t.require_admin || s.user?.is_admin).map(re).filter((t) => t !== void 0), ae = () => {
  const s = document.body.style.overflow, t = document.documentElement.style.overflow;
  return document.body.style.overflow = "hidden", document.documentElement.style.overflow = "hidden", () => {
    document.body.style.overflow = s, document.documentElement.style.overflow = t;
  };
};
class ne extends x {
  static properties = {
    hass: { attribute: !1 },
    narrow: { type: Boolean },
    panel: { attribute: !1 },
    route: { attribute: !1 },
    _activeView: { state: !0 },
    _dashboard: { state: !0 },
    _error: { state: !0 },
    _loading: { state: !0 },
    _navigation: { state: !0 },
    _searchQuery: { state: !0 }
  };
  static styles = yt`
    ${T(Bt)}
    ${T(zt)}
    ${T(Lt)}
  `;
  hass;
  narrow = !1;
  panel;
  route;
  _activeView;
  _dashboard;
  _dashboardPath = null;
  _error;
  _loading = !1;
  _navigation = Object.freeze([]);
  _searchQuery = "";
  _restoreScroll;
  _loadTask;
  connectedCallback() {
    super.connectedCallback(), this._restoreScroll = ae();
  }
  disconnectedCallback() {
    this._restoreScroll?.(), super.disconnectedCallback();
  }
  updated(t) {
    if (t.has("hass") && this.hass && (this._navigation = nt(this.hass)), (t.has("hass") || t.has("panel")) && this.hass && this.panel) {
      this._initializeDashboard();
      return;
    }
    t.has("route") && this._dashboard && this.panel && this._syncRoute(this._dashboard, this.panel.config);
  }
  render() {
    const t = window.location.pathname, e = this._dashboard && this._activeView ? oe(this._dashboard, this._activeView) : Object.freeze(["Belovodya"]);
    return E`
      <belovodya-sidebar
        class="sidebar"
        .items=${this._navigation}
        .activePath=${t}
      ></belovodya-sidebar>

      <belovodya-navbar
        class="navbar"
        .breadcrumbs=${e}
        .viewTitle=${this._activeView?.title ?? "Belovodya UI Engine"}
        .searchQuery=${this._searchQuery}
        @belovodya-search=${this._handleSearch}
        @belovodya-refresh=${this._handleRefresh}
        @belovodya-open-original=${this._handleOpenOriginal}
      ></belovodya-navbar>

      <main class="main" data-belovodya-scroll-root>
        ${this._error ? E`<section class="belovodya-status belovodya-status--error">${this._error}</section>` : h}

        ${this._loading ? E`<section class="belovodya-status belovodya-status--loading">Loading Belovodya dashboard…</section>` : h}

        ${!this._loading && this._activeView ? E`
              <belovodya-layout
                .hass=${this.hass}
                .layout=${this._activeView.layout}
                .searchQuery=${this._searchQuery}
              ></belovodya-layout>
            ` : h}

        ${!this._loading && !this._activeView && !this._error ? E`<section class="belovodya-status">No Lovelace view is available.</section>` : h}
      </main>
    `;
  }
  async _initializeDashboard(t = !1) {
    if (!this.hass || !this.panel)
      return;
    if (this._loadTask && !t)
      return this._loadTask;
    const e = this.panel.config, i = ot(this.route ?? { path: "" }, e);
    if (!t && this._dashboard && this._dashboardPath === i.dashboardPath) {
      this._syncRoute(this._dashboard, e);
      return;
    }
    return this._loadTask = (async () => {
      this._loading = !0, this._error = void 0;
      try {
        const o = await ee(this.hass, i.dashboardPath), r = se(o, i.dashboardPath);
        this._dashboard = r, this._dashboardPath = i.dashboardPath, this._navigation = nt(this.hass), this._syncRoute(r, e);
      } catch (o) {
        this._error = o instanceof Error ? o.message : "Unable to load Lovelace dashboard", this._activeView = void 0;
      } finally {
        this._loading = !1, this._loadTask = void 0;
      }
    })(), this._loadTask;
  }
  _syncRoute(t, e) {
    const i = ot(this.route ?? { path: "" }, e);
    if (i.dashboardPath !== this._dashboardPath) {
      this._initializeDashboard(!0);
      return;
    }
    const o = ie(t, i.viewPath);
    this._activeView = o, o && i.viewPath !== o.key && rt(
      Vt(e.panel_url_path, o.key, i.dashboardPath),
      { replace: !0 }
    );
  }
  _handleSearch(t) {
    this._searchQuery = t.detail;
  }
  _handleRefresh() {
    this._initializeDashboard(!0);
  }
  _handleOpenOriginal() {
    rt(jt(this._dashboardPath, this._activeView?.key ?? null));
  }
}
customElements.get("belovodya-app") || customElements.define("belovodya-app", ne);
