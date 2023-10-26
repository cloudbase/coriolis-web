import "jest-canvas-mock";

window.scroll = jest.fn();
const originalWarn = console.warn.bind(console.warn);
console.warn = (...args) =>
  !args[0].toString().includes("observer class") && originalWarn(...args);

const originalErr = console.error.bind(console.error);
console.error = (...args) =>
  // @TODO fix components which throw these warnings
  !args[0].toString().includes("Unknown event handler property") &&
  originalErr(...args);
