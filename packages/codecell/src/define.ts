type ElementWithMetadata = CustomElementConstructor & {
  metadata: { version: string; tag: string; }
};
export function define(element: ElementWithMetadata) {
  const { tag } = element.metadata;
  if (!customElements.get(tag)) {
    customElements.define(tag, element);
  }
}

