import docsearch from '@docsearch/js';



import {
  LitElement,
  PropertyValueMap,
  css,
  html
} from 'lit';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
// import { styleMap } from 'lit/directives/style-map.js';
import {
  query,
  state,
} from 'lit/decorators.js';

export const TAG_NAME = 'doc-search';

export class DocSearch extends LitElement {
  static styles = css`
  `;

  static readonly metadata = {
    version: '0.1.0',
    tag: TAG_NAME,
  };

  ref: Ref<HTMLDivElement> = createRef();

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    setTimeout(() => {

      console.log(this.ref)
      docsearch({
        container: '#docsearch',
        appId: 'LQ7FIB4N3D',
        indexName: 'autogrammer',
        apiKey: 'eb51b2e714c17a48ecb3fbf2cc18841b',
      });
    }, 1000)
  }

  protected render() {
    return html`
    <div
      id="docsearch"
      ${ref(this.ref)}
    `;
  }
}
