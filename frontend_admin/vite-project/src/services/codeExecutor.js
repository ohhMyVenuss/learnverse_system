// Code execution service for different languages

let pyodideInstance = null;

// Initialize Pyodide for Python execution
async function initPyodide() {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  try {
    // Load Pyodide from CDN
    const pyodideModule = await import('pyodide');
    pyodideInstance = await pyodideModule.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
    });
    return pyodideInstance;
  } catch (error) {
    console.error('Failed to load Pyodide:', error);
    throw new Error('Không thể tải Python runtime. Vui lòng kiểm tra kết nối internet.');
  }
}

// Execute JavaScript code
function executeJavaScript(code) {
  return new Promise((resolve) => {
    try {
      // Capture console.log output
      const logs = [];
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      // Override console methods
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      console.error = (...args) => {
        logs.push('ERROR: ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      console.warn = (...args) => {
        logs.push('WARN: ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      try {
        // Execute code in a sandboxed environment
        // Use Function constructor for better sandboxing
        const func = new Function(code);
        const returnValue = func();
        
        // Restore console
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;

        resolve({
          success: true,
          output: logs.length > 0 ? logs.join('\n') : (returnValue !== undefined ? String(returnValue) : ''),
          returnValue: returnValue !== undefined ? String(returnValue) : null,
        });
      } catch (error) {
        // Restore console
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
        
        resolve({
          success: false,
          output: `Error: ${error.message}`,
          error: error.message,
        });
      }
    } catch (error) {
      resolve({
        success: false,
        output: `Error: ${error.message}`,
        error: error.message,
      });
    }
  });
}

// Execute Python code using Pyodide
async function executePython(code) {
  try {
    const pyodide = await initPyodide();
    
    // Capture stdout
    pyodide.runPython(`
      import sys
      from io import StringIO
      sys.stdout = StringIO()
      sys.stderr = StringIO()
    `);

    try {
      pyodide.runPython(code);
      const stdout = pyodide.runPython('sys.stdout.getvalue()');
      const stderr = pyodide.runPython('sys.stderr.getvalue()');
      
      const output = stderr ? `Error: ${stderr}` : stdout || '';
      
      return {
        success: !stderr,
        output: output,
      };
    } catch (error) {
      return {
        success: false,
        output: `Error: ${error.message}`,
        error: error.message,
      };
    }
  } catch (error) {
    return {
      success: false,
      output: `Error: ${error.message}`,
      error: error.message,
    };
  }
}

// Execute code based on language
export async function executeCode(code, language) {
  switch (language) {
    case 'javascript':
      return executeJavaScript(code);
    
    case 'python':
      return executePython(code);
    
    case 'java':
    case 'cpp':
      return {
        success: false,
        output: `Ngôn ngữ ${language.toUpperCase()} cần được compile và chạy trên server. Tính năng này đang được phát triển.\n\nBạn có thể:\n- Sử dụng JavaScript hoặc Python để test code\n- Hoặc sử dụng online compiler như repl.it, ideone.com`,
      };
    
    default:
      return {
        success: false,
        output: `Ngôn ngữ ${language} chưa được hỗ trợ execution.`,
      };
  }
}

// Check if language supports execution
export function supportsExecution(language) {
  return ['javascript', 'python'].includes(language);
}

