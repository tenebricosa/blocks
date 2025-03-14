import {
  createCdnUrl,
  createCdnUrlModifiers,
  createOriginalUrl,
  extractOperations,
  extractUuid,
} from '../../../utils/cdn-utils.js';
import { TRANSPARENT_PIXEL_SRC } from '../../../utils/transparentPixelSrc.js';
import { ShadowWrapper } from '../../ShadowWrapper/ShadowWrapper.js';
import { classNames } from './lib/classNames.js';
import { debounce } from './lib/debounce.js';
import { operationsToTransformations, transformationsToOperations } from './lib/transformationUtils.js';
import { initState } from './state.js';
import { TEMPLATE } from './template.js';
import { TabId } from './toolbar-constants.js';

export class CloudEditor extends ShadowWrapper {
  pauseRender = true;

  get ctxName() {
    return this.autoCtxName;
  }

  init$ = {
    ...this.init$,
    ...initState(this),
  };

  /** @private */
  _debouncedShowLoader = debounce(this._showLoader.bind(this), 300);

  _showLoader(show) {
    this.$.showLoader = show;
  }

  /**
   * To proper work, we need non-zero size the element. So, we'll wait for it.
   *
   * @private
   * @returns {Promise<void>}
   */
  _waitForSize() {
    const TIMEOUT = 3000;
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('[cloud-image-editor] timeout waiting for non-zero container size'));
      }, TIMEOUT);
      const resizeObserver = new ResizeObserver(([element]) => {
        if (element.contentRect.width > 0 && element.contentRect.height > 0) {
          resolve();
          clearTimeout(timeoutId);
          resizeObserver.disconnect();
        }
      });
      resizeObserver.observe(this);
    });
  }

  cssInit$ = {
    ...this.cssInit$,
    '--cfg-cdn-cname': 'https://ucarecdn.com',
  };

  shadowReadyCallback() {
    if (this.renderShadow) {
      this.initEditor();
    }
  }

  initCallback() {
    super.initCallback();

    this.$['*faderEl'] = this.ref['fader-el'];
    this.$['*cropperEl'] = this.ref['cropper-el'];
    this.$['*imgContainerEl'] = this.ref['img-container-el'];

    if (!this.renderShadow) {
      this.initEditor();
    }
  }

  async initEditor() {
    try {
      await this._waitForSize();
    } catch (err) {
      if (this.isConnected) {
        console.error(err.message);
      }
      return;
    }

    this.ref['img-el'].addEventListener('load', (e) => {
      this._imgLoading = false;
      this._debouncedShowLoader(false);

      if (this.$.src !== TRANSPARENT_PIXEL_SRC) {
        this.$['*networkProblems'] = false;
      }
    });

    this.ref['img-el'].addEventListener('error', (e) => {
      this._imgLoading = false;
      this._debouncedShowLoader(false);

      this.$['*networkProblems'] = true;
    });

    this.sub('src', (src) => {
      let el = this.ref['img-el'];
      if (el.src !== src) {
        this._imgLoading = true;
        el.src = src || TRANSPARENT_PIXEL_SRC;
      }
    });

    this.sub('*tabId', (tabId) => {
      this.ref['img-el'].className = classNames('image', {
        image_hidden_to_cropper: tabId === TabId.CROP,
        image_hidden_effects: tabId !== TabId.CROP,
      });
    });

    if (this.$.cdnUrl) {
      let uuid = extractUuid(this.$.cdnUrl);
      this.$['*originalUrl'] = createOriginalUrl(this.$.cdnUrl, uuid);
      let operations = extractOperations(this.$.cdnUrl);
      let transformations = operationsToTransformations(operations);
      this.$['*editorTransformations'] = transformations;
    } else if (this.$.uuid) {
      this.$['*originalUrl'] = createOriginalUrl(this.localCtx.read('--cfg-cdn-cname'), this.$.uuid);
    } else {
      throw new Error('No UUID nor CDN URL provided');
    }

    this.classList.add('editor_ON');

    this.sub('*networkProblems', (networkProblems) => {
      this.$['presence.networkProblems'] = networkProblems;
      this.$['presence.modalCaption'] = !networkProblems;
    });

    this.sub(
      '*editorTransformations',
      (transformations) => {
        let originalUrl = this.$['*originalUrl'];
        let cdnUrlModifiers = createCdnUrlModifiers(transformationsToOperations(transformations));
        let cdnUrl = createCdnUrl(originalUrl, createCdnUrlModifiers(cdnUrlModifiers, 'preview'));

        /** @type {import('./types.js').ApplyResult} */
        let eventData = {
          originalUrl,
          cdnUrlModifiers,
          cdnUrl,
          transformations,
        };
        this.dispatchEvent(
          new CustomEvent('change', {
            detail: eventData,
            bubbles: true,
            composed: true,
          })
        );
      },
      false
    );

    try {
      fetch(createCdnUrl(this.$['*originalUrl'], createCdnUrlModifiers('json')))
        .then((response) => response.json())
        .then(({ width, height }) => {
          this.$['*imageSize'] = { width, height };
        });
    } catch (err) {
      if (err) {
        console.error('Failed to load image info', err);
      }
    }
  }
}

CloudEditor.template = TEMPLATE;
CloudEditor.bindAttributes({
  uuid: 'uuid',
  'cdn-url': 'cdnUrl',
});
