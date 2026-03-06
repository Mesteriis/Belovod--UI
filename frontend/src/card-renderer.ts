import { LitElement, css, html, nothing, type PropertyValues, unsafeCSS } from "lit";

import cardsCss from "../css/cards.css?inline";
import type {
  CardHelpers,
  HomeAssistant,
  LovelaceCardConfig,
  LovelaceCardElement,
} from "./types";

const RELEVANT_ENTITY_KEYS = new Set(["entity", "camera_image"]);
const BATCH_QUEUE: Array<() => void> = [];
let batchHandle = 0;

const enqueueMutation = (job: () => void): void => {
  BATCH_QUEUE.push(job);
  if (batchHandle !== 0) {
    return;
  }

  batchHandle = window.requestAnimationFrame(() => {
    batchHandle = 0;
    const jobs = BATCH_QUEUE.splice(0, BATCH_QUEUE.length);
    for (const queuedJob of jobs) {
      queuedJob();
    }
  });
};

const extractEntityIds = (config: unknown): readonly string[] => {
  const entities = new Set<string>();

  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item);
      }
      return;
    }

    if (!value || typeof value !== "object") {
      return;
    }

    for (const [key, nestedValue] of Object.entries(value)) {
      if (RELEVANT_ENTITY_KEYS.has(key) && typeof nestedValue === "string") {
        entities.add(nestedValue);
        continue;
      }

      if (key === "entities" && Array.isArray(nestedValue)) {
        for (const entity of nestedValue) {
          if (typeof entity === "string") {
            entities.add(entity);
          } else {
            visit(entity);
          }
        }
        continue;
      }

      visit(nestedValue);
    }
  };

  visit(config);
  return Object.freeze([...entities]);
};

const shouldApplyHassUpdate = (
  nextHass: HomeAssistant,
  previousHass: HomeAssistant | undefined,
  entities: readonly string[],
): boolean => {
  if (!previousHass) {
    return true;
  }

  if (
    nextHass.language !== previousHass.language ||
    nextHass.selectedTheme !== previousHass.selectedTheme ||
    nextHass.themes !== previousHass.themes
  ) {
    return true;
  }

  if (entities.length === 0) {
    return true;
  }

  return entities.some((entityId) => nextHass.states[entityId] !== previousHass.states[entityId]);
};

const waitForCardHelpers = async (): Promise<CardHelpers> => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (typeof window.loadCardHelpers === "function") {
      return window.loadCardHelpers();
    }

    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }

  throw new Error(
    "Home Assistant card helpers are unavailable. Open a Lovelace dashboard once and retry.",
  );
};

let helpersPromise: Promise<CardHelpers> | undefined;

const loadCardHelpers = (): Promise<CardHelpers> => {
  if (!helpersPromise) {
    helpersPromise = waitForCardHelpers();
  }

  return helpersPromise;
};

class BelovodyaCardHost extends LitElement {
  static properties = {
    hass: { attribute: false },
    config: { attribute: false },
    visible: { type: Boolean },
    _error: { state: true },
  } as const;

  static styles = css`
    ${unsafeCSS(cardsCss)}
  `;

  public hass?: HomeAssistant;
  public config?: LovelaceCardConfig;
  public visible = false;

  private _card?: LovelaceCardElement;
  private _error?: string;
  private _mount?: HTMLDivElement | null;
  private _observer?: IntersectionObserver;
  private _entities: readonly string[] = Object.freeze([]);

  protected override render() {
    return html`
      <div class="belovodya-card-shell">
        ${this._error
          ? html`<div class="belovodya-card-error" role="alert">${this._error}</div>`
          : nothing}
        <div class="belovodya-card-mount"></div>
      </div>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._observeVisibility();
  }

  disconnectedCallback(): void {
    this._observer?.disconnect();
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    this._mount = this.renderRoot.querySelector<HTMLDivElement>(".belovodya-card-mount");
    if (this.visible) {
      void this._ensureCard();
    }
  }

  protected override shouldUpdate(changedProperties: PropertyValues): boolean {
    return (
      changedProperties.has("config") ||
      changedProperties.has("visible") ||
      changedProperties.has("_error")
    );
  }

  protected override updated(changedProperties: PropertyValues): void {
    if (changedProperties.has("config")) {
      this._entities = extractEntityIds(this.config);
      this._teardownCard();
      if (this.visible) {
        void this._ensureCard();
      }
    }

    if (changedProperties.has("visible") && this.visible) {
      void this._ensureCard();
    }

    if (changedProperties.has("hass") && this.hass && this._card) {
      const previousHass = changedProperties.get("hass") as HomeAssistant | undefined;
      if (shouldApplyHassUpdate(this.hass, previousHass, this._entities)) {
        this._card.hass = this.hass;
      }
    }
  }

  private _observeVisibility(): void {
    if (this.visible || this._observer) {
      return;
    }

    this._observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return;
      }

      this.visible = true;
      this._observer?.disconnect();
      this._observer = undefined;
    }, {
      rootMargin: "240px 0px",
      threshold: 0.01,
    });
    this._observer.observe(this);
  }

  private _teardownCard(): void {
    this._card = undefined;
    if (this._mount) {
      this._mount.replaceChildren();
    }
  }

  private async _ensureCard(): Promise<void> {
    if (!this.visible || !this.config || !this._mount || this._card) {
      return;
    }

    try {
      const helpers = await loadCardHelpers();
      const card = helpers.createCardElement(this.config);
      enqueueMutation(() => {
        if (!this._mount) {
          return;
        }

        this._card = card;
        if (this.hass) {
          card.hass = this.hass;
        }
        this._mount.replaceChildren(card);
      });
      this._error = undefined;
    } catch (error: unknown) {
      this._error = error instanceof Error ? error.message : "Failed to render Lovelace card";
    }
  }
}

if (!customElements.get("belovodya-card-host")) {
  customElements.define("belovodya-card-host", BelovodyaCardHost);
}
