import { useEffect, useRef, useState } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { FiX, FiCopy, FiPlay, FiLoader } from 'react-icons/fi';
import { executeCode, supportsExecution } from '../services/codeExecutor';

const languageMap = {
  javascript: javascript,
  cpp: cpp,
  java: java,
  python: python,
};

function CodeCell({ cell, onUpdate, onDelete, onCopy }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const language = languageMap[cell.language] || javascript;
    
    const state = EditorState.create({
      doc: cell.content || '',
      extensions: [
        language(),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            onUpdate(newContent);
          }
        }),
        EditorView.theme({
          '&': {
            fontSize: '14px',
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
          },
          '.cm-content': {
            padding: '12px',
            minHeight: '100px',
          },
          '.cm-scroller': {
            overflow: 'auto',
            maxHeight: '400px',
          },
          '.cm-editor': {
            height: 'auto',
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [cell.language]);

  // Update content when cell.content changes externally
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== cell.content) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: cell.content || '',
        },
      });
    }
  }, [cell.content]);

  const handleCopy = () => {
    if (cell.content) {
      navigator.clipboard.writeText(cell.content);
      onCopy && onCopy();
    }
  };

  const handleRun = async () => {
    if (!cell.content || !cell.content.trim()) {
      setOutput({
        success: false,
        output: 'Không có code để chạy',
      });
      setShowOutput(true);
      return;
    }

    setIsRunning(true);
    setShowOutput(true);
    setOutput(null);

    try {
      const result = await executeCode(cell.content, cell.language || 'javascript');
      setOutput(result);
    } catch (error) {
      setOutput({
        success: false,
        output: `Error: ${error.message}`,
        error: error.message,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const canExecute = supportsExecution(cell.language || 'javascript');

  return (
    <div className="relative group bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400 uppercase">
            {cell.language || 'javascript'}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canExecute && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="p-1.5 rounded hover:bg-green-600 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Run code"
            >
              {isRunning ? (
                <FiLoader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FiPlay className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Copy code"
          >
            <FiCopy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-600 text-gray-400 hover:text-white transition-colors"
            title="Delete cell"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Editor */}
      <div ref={editorRef} />
      
      {/* Output Area */}
      {showOutput && output && (
        <div className={`border-t border-gray-700 ${
          output.success ? 'bg-[#1e1e1e]' : 'bg-[#2d1b1b]'
        }`}>
          <div className="px-3 py-2 border-b border-gray-700 bg-[#252526]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">
                {output.success ? 'Output' : 'Error'}
              </span>
              <button
                onClick={() => setShowOutput(false)}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Hide
              </button>
            </div>
          </div>
          <div className="p-4">
            <pre className={`text-sm font-mono whitespace-pre-wrap ${
              output.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {output.output || 'No output'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodeCell;

