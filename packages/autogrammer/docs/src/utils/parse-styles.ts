export const parseStyles = (styles: string): CSSStyleSheet => {
  const sheet = new CSSStyleSheet();
  sheet.replace(styles);
  return sheet;
};
