const className = (classNameStartsWith: string, useContains?: boolean) =>
  `[class${useContains ? "*" : "^"}=${classNameStartsWith}]`;

export default {
  select: (name: string, parent?: Element) =>
    (parent || document).querySelector<HTMLElement>(className(name)),
  selectInput: (name: string, parent?: Element) =>
    (parent || document).querySelector<HTMLInputElement>(className(name)),
  selectContains: (name: string, parent?: Element) =>
    (parent || document).querySelector<HTMLElement>(className(name, true)),
  selectAll: (name: string, parent?: Element) =>
    (parent || document).querySelectorAll<HTMLElement>(className(name)),
  rgbToHex: (rgb: string) => {
    const componentToHex = (c: number) => {
      const hex = c.toString(16).toUpperCase();
      return hex.length === 1 ? `0${hex}` : hex;
    };
    const matches = /rgb\((\d+), (\d+), (\d+)\)/.exec(rgb);
    if (matches) {
      const transform = (match: string) => componentToHex(parseInt(match, 10));
      return `#${transform(matches[1])}${transform(matches[2])}${transform(
        matches[3]
      )}`;
    }
    return rgb;
  },
};
