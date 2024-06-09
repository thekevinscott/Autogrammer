import {
  LitElement,
  css,
  html
} from 'lit';
import { property } from 'lit/decorators.js';
export const TAG_NAME = 'autogrammer-demo';

export class AutogrammerDemo extends LitElement {
  static styles = css`
      a {
      display: block;
      background: rgba(0,0,0,0.1);
      padding: 20px 40px;
      cursor: pointer;
      border: 2px solid rgba(0,0,0,0.2);
      border-radius: 8px;
      font-size: 1.4rem;
        text-decoration: none;
        color: black;

  color: black;
  border-color: var(--color-button-border-active);
  background-color: var(--color-button-background-hover);

    &:hover {
  color: black;
  border-color: var(--color-button-border-active);
  background-color: var(--color-button-background-active);
    }

    &.active {
  color: black;
  border-color: var(--color-button-border-active);
  background-color: var(--color-button-background-active);
    }
    }
  `;

  static readonly metadata = {
    version: '0.1.0',
    tag: TAG_NAME,
  };

  @property({ type: String })
  title: string = '';

  @property({ type: String })
  link: string = '';

  protected render() {
    return html`
      <a role="button" href="${this.link}">${this.title}
      <slot>
      </slot>
      </a>
      `;

  }
}

