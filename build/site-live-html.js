function D(c) {
  let t = (e) => {
    for (let s in e) e[s]?.constructor === Object && (e[s] = t(e[s]));
    return { ...e };
  };
  return t(c);
}
var a = class {
  constructor(t) {
    (this.uid = Symbol()),
      (this.name = t.name || null),
      t.schema.constructor === Object
        ? (this.store = D(t.schema))
        : ((this._storeIsProxy = !0), (this.store = t.schema)),
      (this.callbackMap = Object.create(null));
  }
  static warn(t, e) {
    console.warn(`State: cannot ${t}. Prop name: ` + e);
  }
  read(t) {
    return !this._storeIsProxy && !this.store.hasOwnProperty(t) ? (a.warn('read', t), null) : this.store[t];
  }
  has(t) {
    return this._storeIsProxy ? this.store[t] !== void 0 : this.store.hasOwnProperty(t);
  }
  add(t, e, s = !0) {
    (!s && Object.keys(this.store).includes(t)) ||
      ((this.store[t] = e),
      this.callbackMap[t] &&
        this.callbackMap[t].forEach((i) => {
          i(this.store[t]);
        }));
  }
  pub(t, e) {
    if (!this._storeIsProxy && !this.store.hasOwnProperty(t)) {
      a.warn('publish', t);
      return;
    }
    this.add(t, e);
  }
  multiPub(t) {
    for (let e in t) this.pub(e, t[e]);
  }
  notify(t) {
    this.callbackMap[t] &&
      this.callbackMap[t].forEach((e) => {
        e(this.store[t]);
      });
  }
  sub(t, e, s = !0) {
    return !this._storeIsProxy && !this.store.hasOwnProperty(t)
      ? (a.warn('subscribe', t), null)
      : (this.callbackMap[t] || (this.callbackMap[t] = new Set()),
        this.callbackMap[t].add(e),
        s && e(this.store[t]),
        {
          remove: () => {
            this.callbackMap[t].delete(e), this.callbackMap[t].size || delete this.callbackMap[t];
          },
          callback: e,
        });
  }
  remove() {
    delete a.globalStore[this.uid];
  }
  static registerLocalCtx(t) {
    let e = new a({ schema: t });
    return (a.globalStore[e.uid] = e), e;
  }
  static registerNamedCtx(t, e) {
    let s = a.globalStore[t];
    return (
      s
        ? console.warn('State: context name "' + t + '" already in use')
        : ((s = new a({ name: t, schema: e })), (a.globalStore[t] = s)),
      s
    );
  }
  static clearNamedCtx(t) {
    delete a.globalStore[t];
  }
  static getNamedCtx(t, e = !0) {
    return a.globalStore[t] || (e && console.warn('State: wrong context name - "' + t + '"'), null);
  }
};
a.globalStore = Object.create(null);
var n = Object.freeze({
    BIND_ATTR: 'set',
    ATTR_BIND_PRFX: '@',
    EXT_DATA_CTX_PRFX: '*',
    NAMED_DATA_CTX_SPLTR: '/',
    CTX_NAME_ATTR: 'ctx-name',
    CSS_CTX_PROP: '--ctx-name',
    EL_REF_ATTR: 'ref',
    AUTO_TAG_PRFX: 'sym',
  }),
  x = '1234567890QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm',
  X = x.length - 1,
  A = class {
    static generate(t = 'XXXXXXXXX-XXX') {
      let e = '';
      for (let s = 0; s < t.length; s++) e += t[s] === '-' ? t[s] : x.charAt(Math.random() * X);
      return e;
    }
  };
function O(c, t) {
  if (t.renderShadow) return;
  let e = [...c.querySelectorAll('slot')];
  if (t.__initChildren.length && e.length) {
    let s = {};
    e.forEach((i) => {
      let r = i.getAttribute('name');
      r
        ? (s[r] = { slot: i, fr: document.createDocumentFragment() })
        : (s.__default__ = { slot: i, fr: document.createDocumentFragment() });
    }),
      t.__initChildren.forEach((i) => {
        let r = i.getAttribute?.('slot');
        r ? s[r].fr.appendChild(i) : s.__default__ && s.__default__.fr.appendChild(i);
      }),
      Object.values(s).forEach((i) => {
        i.slot.parentNode.insertBefore(i.fr, i.slot), i.slot.remove();
      });
  } else t.innerHTML = '';
}
function I(c, t) {
  [...c.querySelectorAll(`[${n.EL_REF_ATTR}]`)].forEach((e) => {
    let s = e.getAttribute(n.EL_REF_ATTR);
    (t.ref[s] = e), e.removeAttribute(n.EL_REF_ATTR);
  });
}
function $(c, t) {
  [...c.querySelectorAll(`[${n.BIND_ATTR}]`)].forEach((e) => {
    e
      .getAttribute(n.BIND_ATTR)
      .split(';')
      .forEach((r) => {
        if (!r) return;
        let o = r.split(':').map((d) => d.trim()),
          l = o[0],
          w;
        l.indexOf(n.ATTR_BIND_PRFX) === 0 && ((w = !0), (l = l.replace(n.ATTR_BIND_PRFX, '')));
        let p = o[1].split(',').map((d) => d.trim()),
          C,
          f,
          T,
          g;
        if (l.includes('.')) {
          C = !0;
          let d = l.split('.');
          (g = () => {
            (f = e),
              d.forEach((u, M) => {
                M < d.length - 1 ? (f = f[u]) : (T = u);
              });
          }),
            g();
        }
        for (let d of p)
          t.sub(d, (u) => {
            w
              ? u?.constructor === Boolean
                ? u
                  ? e.setAttribute(l, '')
                  : e.removeAttribute(l)
                : e.setAttribute(l, u)
              : C
              ? f
                ? (f[T] = u)
                : window.setTimeout(() => {
                    g(), (f[T] = u);
                  })
              : (e[l] = u);
          });
      }),
      e.removeAttribute(n.BIND_ATTR);
  });
}
var L = [O, I, $],
  E = 0,
  h = class extends HTMLElement {
    render(t, e = this.renderShadow) {
      let s;
      if (t || this.constructor.template) {
        for (
          this.constructor.template &&
          !this.constructor.__tpl &&
          ((this.constructor.__tpl = document.createElement('template')),
          (this.constructor.__tpl.innerHTML = this.constructor.template));
          this.firstChild;

        )
          this.firstChild.remove();
        if (t?.constructor === DocumentFragment) s = t;
        else if (t?.constructor === String) {
          let i = document.createElement('template');
          (i.innerHTML = t), (s = i.content.cloneNode(!0));
        } else this.constructor.__tpl && (s = this.constructor.__tpl.content.cloneNode(!0));
        for (let i of this.tplProcessors) i(s, this);
      }
      e
        ? (this.shadowRoot || this.attachShadow({ mode: 'open' }), s && this.shadowRoot.appendChild(s))
        : s && this.appendChild(s);
    }
    addTemplateProcessor(t) {
      this.tplProcessors.add(t);
    }
    constructor() {
      super();
      (this.init$ = Object.create(null)),
        (this.tplProcessors = new Set()),
        (this.ref = Object.create(null)),
        (this.allSubs = new Set()),
        (this.pauseRender = !1),
        (this.renderShadow = !1),
        (this.readyToDestroy = !0);
    }
    get autoCtxName() {
      return (
        this.__autoCtxName ||
          ((this.__autoCtxName = A.generate()), this.style.setProperty(n.CSS_CTX_PROP, `'${this.__autoCtxName}'`)),
        this.__autoCtxName
      );
    }
    get cssCtxName() {
      return this.getCssData(n.CSS_CTX_PROP, !0);
    }
    get ctxName() {
      return this.getAttribute(n.CTX_NAME_ATTR)?.trim() || this.cssCtxName || this.autoCtxName;
    }
    get localCtx() {
      return this.__localCtx || (this.__localCtx = a.registerLocalCtx({})), this.__localCtx;
    }
    get nodeCtx() {
      return a.getNamedCtx(this.ctxName, !1) || a.registerNamedCtx(this.ctxName, {});
    }
    static __parseProp(t, e) {
      let s, i;
      if (t.startsWith(n.EXT_DATA_CTX_PRFX)) (s = e.nodeCtx), (i = t.replace(n.EXT_DATA_CTX_PRFX, ''));
      else if (t.includes(n.NAMED_DATA_CTX_SPLTR)) {
        let r = t.split(n.NAMED_DATA_CTX_SPLTR);
        (s = a.getNamedCtx(r[0])), (i = r[1]);
      } else (s = e.localCtx), (i = t);
      return { ctx: s, name: i };
    }
    sub(t, e) {
      let s = h.__parseProp(t, this);
      this.allSubs.add(s.ctx.sub(s.name, e));
    }
    notify(t) {
      let e = h.__parseProp(t, this);
      e.ctx.notify(e.name);
    }
    has(t) {
      let e = h.__parseProp(t, this);
      return e.ctx.has(e.name);
    }
    add(t, e) {
      let s = h.__parseProp(t, this);
      s.ctx.add(s.name, e, !1);
    }
    add$(t) {
      for (let e in t) this.add(e, t[e]);
    }
    get $() {
      if (!this.__stateProxy) {
        let t = Object.create(null);
        this.__stateProxy = new Proxy(t, {
          set: (e, s, i) => {
            let r = h.__parseProp(s, this);
            return r.ctx.pub(r.name, i), !0;
          },
          get: (e, s) => {
            let i = h.__parseProp(s, this);
            return i.ctx.read(i.name);
          },
        });
      }
      return this.__stateProxy;
    }
    set$(t) {
      for (let e in t) this.$[e] = t[e];
    }
    initCallback() {}
    __initDataCtx() {
      typeof this.init$ == 'function' && (this.init$ = this.init$());
      let t = this.constructor.__attrDesc;
      if (t) for (let e of Object.values(t)) Object.keys(this.init$).includes(e) || (this.init$[e] = '');
      for (let e in this.init$)
        if (e.startsWith(n.EXT_DATA_CTX_PRFX)) this.nodeCtx.add(e.replace(n.EXT_DATA_CTX_PRFX, ''), this.init$[e]);
        else if (e.includes(n.NAMED_DATA_CTX_SPLTR)) {
          let s = e.split(n.NAMED_DATA_CTX_SPLTR),
            i = s[0].trim(),
            r = s[1].trim();
          if (i && r) {
            let o = a.getNamedCtx(i, !1);
            o || (o = a.registerNamedCtx(i, {})), o.add(r, this.init$[e]);
          }
        } else this.localCtx.add(e, this.init$[e]);
      this.__dataCtxInitialized = !0;
    }
    connectedCallback() {
      if ((this.__disconnectTimeout && window.clearTimeout(this.__disconnectTimeout), !this.connectedOnce)) {
        let t = this.getAttribute(n.CTX_NAME_ATTR)?.trim();
        t && this.style.setProperty(n.CSS_CTX_PROP, `'${t}'`),
          this.__initDataCtx(),
          (this.__initChildren = [...this.childNodes]);
        for (let e of L) this.addTemplateProcessor(e);
        this.pauseRender || this.render(), this.initCallback?.();
      }
      this.connectedOnce = !0;
    }
    destroyCallback() {}
    disconnectedCallback() {
      this.dropCssDataCache(),
        !!this.readyToDestroy &&
          (this.__disconnectTimeout && window.clearTimeout(this.__disconnectTimeout),
          (this.__disconnectTimeout = window.setTimeout(() => {
            this.destroyCallback();
            for (let t of this.allSubs) t.remove(), this.allSubs.delete(t);
            for (let t of this.tplProcessors) this.tplProcessors.delete(t);
          }, 100)));
    }
    static reg(t, e = !1) {
      if ((t || (E++, (t = `${n.AUTO_TAG_PRFX}-${E}`)), (this.__tag = t), window.customElements.get(t))) {
        console.warn(`${t} - is already in "customElements" registry`);
        return;
      }
      window.customElements.define(t, e ? class extends this {} : this);
    }
    static get is() {
      return this.__tag || this.reg(), this.__tag;
    }
    static bindAttributes(t) {
      (this.observedAttributes = Object.keys(t)), (this.__attrDesc = t);
    }
    attributeChangedCallback(t, e, s) {
      if (e === s) return;
      let i = this.constructor.__attrDesc[t];
      i ? (this.__dataCtxInitialized ? (this.$[i] = s) : (this.init$[i] = s)) : (this[t] = s);
    }
    getCssData(t, e = !1) {
      if (
        (this.__cssDataCache || (this.__cssDataCache = Object.create(null)),
        !Object.keys(this.__cssDataCache).includes(t))
      ) {
        this.__computedStyle || (this.__computedStyle = window.getComputedStyle(this));
        let s = this.__computedStyle.getPropertyValue(t).trim();
        s.startsWith("'") && s.endsWith("'") && (s = s.replace(/\'/g, '"'));
        try {
          this.__cssDataCache[t] = JSON.parse(s);
        } catch (i) {
          !e && console.warn(`CSS Data error: ${t}`), (this.__cssDataCache[t] = null);
        }
      }
      return this.__cssDataCache[t];
    }
    dropCssDataCache() {
      (this.__cssDataCache = null), (this.__computedStyle = null);
    }
    defineAccessor(t, e, s) {
      let i = '__' + t;
      (this[i] = this[t]),
        Object.defineProperty(this, t, {
          set: (r) => {
            (this[i] = r),
              s
                ? window.setTimeout(() => {
                    e?.(r);
                  })
                : e?.(r);
          },
          get: () => this[i],
        }),
        (this[t] = this[i]);
    }
  };
var m = class {
  static _print(t) {
    console.warn(t);
  }
  static setDefaultTitle(t) {
    this.defaultTitle = t;
  }
  static setRoutingMap(t) {
    Object.assign(this.appMap, t);
    for (let e in this.appMap)
      !this.defaultRoute && this.appMap[e].default === !0
        ? (this.defaultRoute = e)
        : !this.errorRoute && this.appMap[e].error === !0 && (this.errorRoute = e);
  }
  static set routingEventName(t) {
    this.__routingEventName = t;
  }
  static get routingEventName() {
    return this.__routingEventName || 'sym-on-route';
  }
  static readAddressBar() {
    let t = { route: null, options: {} };
    return (
      window.location.search.split(this.separator).forEach((s) => {
        if (s.includes('?')) t.route = s.replace('?', '');
        else if (s.includes('=')) {
          let i = s.split('=');
          t.options[i[0]] = decodeURI(i[1]);
        } else t.options[s] = !0;
      }),
      t
    );
  }
  static notify() {
    let t = this.readAddressBar(),
      e = this.appMap[t.route];
    if ((e && e.title && (document.title = e.title), t.route === null && this.defaultRoute)) {
      this.applyRoute(this.defaultRoute);
      return;
    } else if (!e && this.errorRoute) {
      this.applyRoute(this.errorRoute);
      return;
    } else if (!e && this.defaultRoute) {
      this.applyRoute(this.defaultRoute);
      return;
    } else if (!e) {
      this._print(`Route "${t.route}" not found...`);
      return;
    }
    let s = new CustomEvent(m.routingEventName, {
      detail: { route: t.route, options: Object.assign(e || {}, t.options) },
    });
    window.dispatchEvent(s);
  }
  static reflect(t, e = {}) {
    let s = this.appMap[t];
    if (!s) {
      this._print('Wrong route: ' + t);
      return;
    }
    let i = '?' + t;
    for (let o in e) e[o] === !0 ? (i += this.separator + o) : (i += this.separator + o + `=${e[o]}`);
    let r = s.title || this.defaultTitle || '';
    window.history.pushState(null, r, i), (document.title = r);
  }
  static applyRoute(t, e = {}) {
    this.reflect(t, e), this.notify();
  }
  static setSeparator(t) {
    this._separator = t;
  }
  static get separator() {
    return this._separator || '&';
  }
  static createRouterData(t, e) {
    this.setRoutingMap(e);
    let s = a.registerNamedCtx(t, { route: null, options: null, title: null });
    return (
      window.addEventListener(this.routingEventName, (i) => {
        s.multiPub({
          route: i.detail.route,
          options: i.detail.options,
          title: i.detail.options?.title || this.defaultTitle || '',
        });
      }),
      m.notify(),
      s
    );
  }
};
m.appMap = Object.create(null);
window.onpopstate = () => {
  m.notify();
};
var S = 'idb-store-ready',
  j = 'symbiote-db',
  k = 'symbiote-idb-update_',
  P = class {
    _notifyWhenReady(t = null) {
      window.dispatchEvent(new CustomEvent(S, { detail: { dbName: this.name, storeName: this.storeName, event: t } }));
    }
    get _updEventName() {
      return k + this.name;
    }
    _getUpdateEvent(t) {
      return new CustomEvent(this._updEventName, { detail: { key: this.name, newValue: t } });
    }
    _notifySubscribers(t) {
      window.localStorage.removeItem(this.name),
        window.localStorage.setItem(this.name, t),
        window.dispatchEvent(this._getUpdateEvent(t));
    }
    constructor(t, e) {
      (this.name = t),
        (this.storeName = e),
        (this.version = 1),
        (this.request = window.indexedDB.open(this.name, this.version)),
        (this.request.onupgradeneeded = (s) => {
          (this.db = s.target.result),
            (this.objStore = this.db.createObjectStore(e, { keyPath: '_key' })),
            (this.objStore.transaction.oncomplete = (i) => {
              this._notifyWhenReady(i);
            });
        }),
        (this.request.onsuccess = (s) => {
          (this.db = s.target.result), this._notifyWhenReady(s);
        }),
        (this.request.onerror = (s) => {
          console.error(s);
        }),
        (this._subscribtionsMap = {}),
        (this._updateHandler = (s) => {
          s.key === this.name &&
            this._subscribtionsMap[s.newValue] &&
            this._subscribtionsMap[s.newValue].forEach(async (r) => {
              r(await this.read(s.newValue));
            });
        }),
        (this._localUpdateHanler = (s) => {
          this._updateHandler(s.detail);
        }),
        window.addEventListener('storage', this._updateHandler),
        window.addEventListener(this._updEventName, this._localUpdateHanler);
    }
    read(t) {
      let s = this.db.transaction(this.storeName, 'readwrite').objectStore(this.storeName).get(t);
      return new Promise((i, r) => {
        (s.onsuccess = (o) => {
          o.target.result?._value ? i(o.target.result._value) : (i(null), console.warn(`IDB: cannot read "${t}"`));
        }),
          (s.onerror = (o) => {
            r(o);
          });
      });
    }
    write(t, e, s = !1) {
      let i = { _key: t, _value: e },
        o = this.db.transaction(this.storeName, 'readwrite').objectStore(this.storeName).put(i);
      return new Promise((l, w) => {
        (o.onsuccess = (p) => {
          s || this._notifySubscribers(t), l(p.target.result);
        }),
          (o.onerror = (p) => {
            w(p);
          });
      });
    }
    delete(t, e = !1) {
      let i = this.db.transaction(this.storeName, 'readwrite').objectStore(this.storeName).delete(t);
      return new Promise((r, o) => {
        (i.onsuccess = (l) => {
          e || this._notifySubscribers(t), r(l);
        }),
          (i.onerror = (l) => {
            o(l);
          });
      });
    }
    getAll() {
      let e = this.db.transaction(this.storeName, 'readwrite').objectStore(this.storeName).getAll();
      return new Promise((s, i) => {
        (e.onsuccess = (r) => {
          let o = r.target.result;
          s(o.map((l) => l._value));
        }),
          (e.onerror = (r) => {
            i(r);
          });
      });
    }
    subscribe(t, e) {
      this._subscribtionsMap[t] || (this._subscribtionsMap[t] = new Set());
      let s = this._subscribtionsMap[t];
      return (
        s.add(e),
        {
          remove: () => {
            s.delete(e), s.size || delete this._subscribtionsMap[t];
          },
        }
      );
    }
    stop() {
      window.removeEventListener('storage', this._updateHandler), (this.__subscribtionsMap = null), y.clear(this.name);
    }
  },
  y = class {
    static get readyEventName() {
      return S;
    }
    static open(t = j, e = 'store') {
      let s = `${t}/${e}`;
      return this._reg[s] || (this._reg[s] = new P(t, e)), this._reg[s];
    }
    static clear(t) {
      window.indexedDB.deleteDatabase(t);
      for (let e in this._reg) e.split('/')[0] === t && delete this._reg[e];
    }
  };
y._reg = Object.create(null);
var v =
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title></head><body> CONTENT </body></html>`.trim(),
  _ = class {
    static getPosition(t) {
      let e = window.getSelection(),
        s = -1,
        i;
      if (e.focusNode && _._isChildOf(e.focusNode, t)) {
        for (i = e.focusNode, s = e.focusOffset; i && i !== t; )
          if (i.previousSibling) (i = i.previousSibling), (s += i.textContent.length);
          else if (((i = i.parentNode), i === null)) break;
      }
      return s;
    }
    static setPosition(t, e) {
      if (t >= 0) {
        let s = window.getSelection(),
          i = _._createRange(e, { count: t });
        i && (i.collapse(!1), s.removeAllRanges(), s.addRange(i));
      }
    }
    static _createRange(t, e, s) {
      if ((s || ((s = document.createRange()), s.selectNode(t), s.setStart(t, 0)), e.count === 0)) s.setEnd(t, e.count);
      else if (t && e.count > 0)
        if (t.nodeType === Node.TEXT_NODE)
          t.textContent.length < e.count ? (e.count -= t.textContent.length) : (s.setEnd(t, e.count), (e.count = 0));
        else
          for (let i = 0; i < t.childNodes.length && ((s = _._createRange(t.childNodes[i], e, s)), e.count !== 0); i++);
      return s;
    }
    static _isChildOf(t, e) {
      for (; t !== null; ) {
        if (t === e) return !0;
        t = t.parentNode;
      }
      return !1;
    }
  },
  b = class extends h {
    hl() {
      let t = _.getPosition(this.ref.editor);
      this.ref.editor.textContent = this.ref.editor.textContent;
      let e = this.ref.editor.innerHTML;
      (e = e
        .replace(/&lt;/g, '<span -tag-arr->&lt;</span>')
        .replace(/&gt;/g, '<span -tag-arr->&gt;</span>')
        .split('="')
        .map((s) => s.replace('"', '</span>"'))
        .join('="<span -attr->')
        .replace(/"/g, '<span -quote->"</span>')
        .replace(/=/g, '<span -equal->=</span>')
        .split('<span -tag-arr->&lt;</span>/')
        .join('<span -tag-arr->&lt;/</span>')),
        (this.ref.editor.innerHTML = e),
        _.setPosition(t, this.ref.editor);
    }
    sync() {
      this.hl(),
        this._updTimeout && window.clearTimeout(this._updTimeout),
        (this._updTimeout = window.setTimeout(() => {
          if (((this.ref.vp.srcdoc = this.ref.editor.textContent), this.hasAttribute('console-output'))) {
            let t = this.ref.vp.contentWindow;
            this.ref.vp.onload = () => {
              console.dirxml(t.document.body);
            };
          }
        }, 300));
    }
    init$ = {
      src: '',
      code: v,
      spellcheck: !1,
      onInput: () => {
        this.sync();
      },
      onKeydown: (t) => {
        t.keyCode === 13
          ? (t.preventDefault(), document.execCommand('insertHTML', !1, ` `))
          : t.keyCode === 9 && (t.preventDefault(), document.execCommand('insertHTML', !1, '&nbsp;&nbsp;'));
      },
      onPaste: (t) => {
        t.preventDefault();
        let e = t.clipboardData.getData('text/plain');
        document.execCommand('insertText', !1, e);
      },
    };
    initCallback() {
      this.sub('src', (t) => {
        t
          ? window.fetch(t).then(async (e) => {
              let s = await e.text();
              (this.$.code = s), this.sync();
            })
          : (this.$.code = v);
      });
    }
  };
b.bindAttributes({ src: 'src' });
b.template = `<div ref="editor" contenteditable="true" set="textContent:code; oninput:onInput; onpaste:onPaste; onkeydown:onKeydown; spellcheck:spellcheck"></div><iframe ref="vp"></iframe>`;
var R = 'live-html';
b.reg(R);
var N = document.location.search.replace('?', '');
N &&
  (window.onload = () => {
    document.querySelector(R).setAttribute('src', N);
  });
