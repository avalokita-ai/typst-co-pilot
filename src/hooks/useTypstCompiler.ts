import { useState, useEffect, useCallback, useRef } from "react";

// Global reference to the typst instance loaded from CDN
declare global {
  interface Window {
    $typst: any;
  }
}

let scriptLoaded = false;
let scriptLoading: Promise<void> | null = null;

const loadTypstFromCDN = (): Promise<void> => {
  if (scriptLoaded && window.$typst) {
    return Promise.resolve();
  }

  if (scriptLoading) {
    return scriptLoading;
  }

  scriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst.ts@0.6.1-rc5/dist/esm/contrib/all-in-one-lite.bundle.mjs";
    
    script.onload = () => {
      scriptLoaded = true;
      // Give time for the module to initialize
      setTimeout(() => {
        if (window.$typst) {
          // Configure WASM modules
          window.$typst.setCompilerInitOptions({
            getModule: () =>
              'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler@0.6.1-rc5/pkg/typst_ts_web_compiler_bg.wasm',
          });
          window.$typst.setRendererInitOptions({
            getModule: () =>
              'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer@0.6.1-rc5/pkg/typst_ts_renderer_bg.wasm',
          });
          resolve();
        } else {
          reject(new Error("Failed to initialize Typst"));
        }
      }, 100);
    };
    
    script.onerror = () => reject(new Error("Failed to load Typst from CDN"));
    document.head.appendChild(script);
  });

  return scriptLoading;
};

export const useTypstCompiler = (code: string) => {
  const [compiled, setCompiled] = useState<string>("");
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const compile = useCallback(async (sourceCode: string) => {
    if (!sourceCode.trim()) {
      setCompiled("");
      setError(null);
      setPdfData(null);
      setPageCount(1);
      return;
    }

    setIsCompiling(true);
    setError(null);

    try {
      await loadTypstFromCDN();
      
      if (!window.$typst) {
        throw new Error("Typst compiler not available");
      }

      // Compile to SVG for preview
      const svgResult = await window.$typst.svg({
        mainContent: sourceCode,
      });

      // Count pages by looking for SVG elements
      const pageMatches = svgResult.match(/<svg[^>]*>/g);
      const pages = pageMatches ? pageMatches.length : 1;
      
      setCompiled(svgResult);
      setPageCount(Math.max(1, pages));
      setError(null);
    } catch (err: unknown) {
      console.error("Typst compilation error:", err);
      const message = err instanceof Error ? err.message : "Compilation failed";
      setError(message);
    } finally {
      setIsCompiling(false);
    }
  }, []);

  // Compile PDF on demand
  const compilePdf = useCallback(async (): Promise<Uint8Array | null> => {
    if (!code.trim()) return null;

    try {
      await loadTypstFromCDN();
      
      if (!window.$typst) {
        throw new Error("Typst compiler not available");
      }

      const pdf = await window.$typst.pdf({
        mainContent: code,
      });

      if (pdf) {
        setPdfData(pdf);
        return pdf;
      }
      return null;
    } catch (err: unknown) {
      console.error("PDF compilation error:", err);
      const message = err instanceof Error ? err.message : "PDF compilation failed";
      setError(message);
      return null;
    }
  }, [code]);

  useEffect(() => {
    // Debounce compilation
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      compile(code);
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [code, compile]);

  return { 
    compiled, 
    error, 
    isCompiling, 
    pageCount,
    pdfData,
    compilePdf 
  };
};
