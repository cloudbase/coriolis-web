window.scroll = jest.fn()

const originalErr = console.error.bind(console.error)
// @TODO fix components which throw these warnings
console.error = (...args) => !args[0].toString().includes('Unknown event handler property') && originalErr(...args)
