export function runTests(code, tests) {
  return new Promise((resolve) => {
    const workerSource = `
      self.onmessage = (event) => {
        const { code, tests } = event.data;
        let solve;
        try {
          solve = new Function(code + "\\nreturn typeof solve === 'function' ? solve : null;")();
        } catch (error) {
          self.postMessage({ error: "Could not read your code: " + error.message, results: [] });
          return;
        }
        if (typeof solve !== "function") {
          self.postMessage({ error: "Add a function named solve. The tests call solve(...).", results: [] });
          return;
        }
        const results = [];
        for (const test of tests) {
          const started = Date.now();
          try {
            const value = solve(...test.args);
            results.push({
              pass: JSON.stringify(value) === JSON.stringify(test.expected),
              value,
              ms: Date.now() - started,
            });
          } catch (error) {
            results.push({ pass: false, error: error.message, ms: Date.now() - started });
          }
        }
        self.postMessage({ results });
      };
    `;

    const worker = new Worker(URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" })));
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({ error: "Time limit exceeded. The code took too long, often because of a loop that never ends.", results: [] });
    }, 2000);

    worker.onmessage = (event) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(event.data);
    };
    worker.onerror = () => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ error: "The code stopped because of a runtime error.", results: [] });
    };
    worker.postMessage({ code, tests });
  });
}
