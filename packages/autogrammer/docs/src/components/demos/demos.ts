import {
  LitElement,
  css,
  html
} from 'lit';
import { property } from 'lit/decorators.js';

export const TAG_NAME = 'autogrammer-demos';

export class AutogrammerDemos extends LitElement {
  // Define scoped styles right with your component, in plain CSS
  static styles = css`
    #root {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
  `;

  static readonly metadata = {
    version: '0.1.0',
    tag: TAG_NAME,
  };

  @property({ type: String })
  title: string = '';

  protected render() {
    return html`
      <div id="root">
      <slot></slot>
      </div>
      `;

  }
}

