let count = 0;

process.nextTick(() => {
  count++;
  setImmediate(() => {
    process.nextTick(() => {
      count++;
    });
  });
});

// await new Promise((resolve) => resolve());
await new Promise((resolve) => setImmediate(resolve));

console.log('-----', count);
