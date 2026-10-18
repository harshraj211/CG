import type { TestCase } from "@/types";
export interface ExecutionResult {
  passed: number;
  total: number;
  results: {
    passed: boolean;
    input?: unknown;
    expected?: unknown;
    actual?: unknown;
    error?: string;
    hidden?: boolean;
  }[];
  error?: string;
}
export async function executeCode(
  code: string,
  language: string,
  tests: TestCase[],
): Promise<ExecutionResult> {
  if (["Java", "C++"].includes(language))
    return {
      passed: 0,
      total: tests.length,
      results: [],
      error: `${language} is an editor-only language in this version. Use Python or JavaScript to run real tests. A sandbox provider can be attached to executeCode() later.`,
    };
  return new Promise((resolve) => {
    const worker = new Worker("/workers/runner.js");
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({
        passed: 0,
        total: tests.length,
        results: [],
        error:
          "Execution timed out (30 seconds). Check loop bounds, or try again after the Python runtime has loaded.",
      });
    }, 30000);
    worker.onmessage = (e: MessageEvent<ExecutionResult>) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(e.data);
    };
    worker.onerror = () => {
      clearTimeout(timer);
      worker.terminate();
      resolve({
        passed: 0,
        total: tests.length,
        results: [],
        error:
          "The execution worker failed to load. Check your connection; Python needs the Pyodide runtime.",
      });
    };
    worker.postMessage({ code, language, tests });
  });
}
