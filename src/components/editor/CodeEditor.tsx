import { useState, useCallback, useEffect, useRef } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const CodeEditor = ({ value, onChange }: CodeEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      
      // Restore cursor position after React re-renders
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  }, [value, onChange]);

  const lines = value.split("\n");

  return (
    <div className="flex h-full font-mono text-sm relative">
      {/* Line Numbers */}
      <div 
        ref={lineNumbersRef}
        className="flex-shrink-0 py-4 px-3 text-right text-muted-foreground select-none border-r border-border bg-surface-editor/50 overflow-hidden"
        style={{ minWidth: "3rem" }}
      >
        {lines.map((_, index) => (
          <div key={index} className="leading-6 text-xs">
            {index + 1}
          </div>
        ))}
      </div>

      {/* Code Area */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full p-4 bg-transparent resize-none outline-none leading-6 text-foreground/90"
          spellCheck={false}
          style={{ 
            fontFamily: "'JetBrains Mono', monospace",
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
