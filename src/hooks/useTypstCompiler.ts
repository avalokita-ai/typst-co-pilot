import { useState, useEffect, useCallback, useRef } from "react";

interface CompileResult {
  success: boolean;
  svg?: string;
  error?: string;
}

// Simple Typst to HTML/SVG renderer (mock for now - real compilation would need WASM)
const renderTypstToHtml = (code: string): CompileResult => {
  try {
    let html = "";
    const lines = code.split("\n");
    
    let pageSettings = {
      fontSize: "12pt",
      fontFamily: "serif",
      margin: "2.5cm",
    };

    let inMathMode = false;
    let mathContent = "";

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Parse #set directives
      const setMatch = line.match(/^#set\s+(\w+)\(([^)]*)\)/);
      if (setMatch) {
        const [, element, params] = setMatch;
        if (element === "text") {
          const sizeMatch = params.match(/size:\s*([^,)]+)/);
          if (sizeMatch) pageSettings.fontSize = sizeMatch[1].trim();
          const fontMatch = params.match(/font:\s*"([^"]+)"/);
          if (fontMatch) pageSettings.fontFamily = fontMatch[1];
        }
        continue;
      }

      // Skip other # directives for display
      if (line.startsWith("#import") || line.startsWith("#let") || line.startsWith("#show")) {
        continue;
      }

      // Empty line = paragraph break
      if (line.trim() === "") {
        html += '<div class="mb-4"></div>';
        continue;
      }

      // Headings
      const headingMatch = line.match(/^(=+)\s*(.*)/);
      if (headingMatch) {
        const level = Math.min(headingMatch[1].length, 6);
        const text = headingMatch[2];
        const sizes = ["text-3xl", "text-2xl", "text-xl", "text-lg", "text-base", "text-sm"];
        html += `<h${level} class="${sizes[level - 1]} font-bold mb-3 mt-4">${escapeHtml(text)}</h${level}>`;
        continue;
      }

      // Process inline formatting
      line = processInlineFormatting(line);
      html += `<p class="mb-2 leading-relaxed">${line}</p>`;
    }

    const svg = `
      <div style="font-family: ${pageSettings.fontFamily}, serif; font-size: ${pageSettings.fontSize}; padding: 2rem; min-height: 100%;">
        ${html}
      </div>
    `;

    return { success: true, svg };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const processInlineFormatting = (text: string): string => {
  // Bold *text*
  text = text.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
  // Italic _text_
  text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
  // Inline code `text`
  text = text.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>');
  // Math $...$
  text = text.replace(/\$([^$]+)\$/g, '<span class="font-mono italic">$1</span>');
  // Links
  text = text.replace(/#link\("([^"]+)"\)\[([^\]]+)\]/g, '<a href="$1" class="text-blue-600 underline">$2</a>');
  
  return text;
};

export const useTypstCompiler = (code: string) => {
  const [compiled, setCompiled] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const compile = useCallback((sourceCode: string) => {
    setIsCompiling(true);
    
    // Debounce compilation
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const result = renderTypstToHtml(sourceCode);
      
      if (result.success && result.svg) {
        setCompiled(result.svg);
        setError(null);
      } else {
        setError(result.error || "Compilation failed");
      }
      
      setIsCompiling(false);
    }, 300);
  }, []);

  useEffect(() => {
    compile(code);
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [code, compile]);

  return { compiled, error, isCompiling };
};
