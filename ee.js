const EventEmitter = require('events')

const myEE = new EventEmitter();
myEE.on('foo', (...args) => console.log(args));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');