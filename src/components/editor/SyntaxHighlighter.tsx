import { useMemo } from "react";

interface SyntaxHighlighterProps {
  code: string;
}

interface Token {
  type: "keyword" | "function" | "string" | "number" | "comment" | "markup" | "math" | "text" | "heading";
  value: string;
}

const tokenize = (code: string): Token[][] => {
  const lines = code.split("\n");
  
  return lines.map(line => {
    const tokens: Token[] = [];
    let remaining = line;
    let pos = 0;

    while (remaining.length > 0) {
      let matched = false;

      // Comments (// ...)
      if (remaining.startsWith("//")) {
        tokens.push({ type: "comment", value: remaining });
        break;
      }

      // Headings (= or ==)
      const headingMatch = remaining.match(/^(=+)\s*(.*)/);
      if (headingMatch && pos === 0) {
        tokens.push({ type: "heading", value: headingMatch[0] });
        break;
      }

      // Math mode ($...$)
      const mathMatch = remaining.match(/^\$[^$]*\$/);
      if (mathMatch) {
        tokens.push({ type: "math", value: mathMatch[0] });
        remaining = remaining.slice(mathMatch[0].length);
        pos += mathMatch[0].length;
        matched = true;
        continue;
      }

      // Keywords (#set, #let, #show, #import, #include, etc.)
      const keywordMatch = remaining.match(/^#(set|let|show|import|include|if|else|for|while|break|continue|return|none|auto|true|false)\b/);
      if (keywordMatch) {
        tokens.push({ type: "keyword", value: keywordMatch[0] });
        remaining = remaining.slice(keywordMatch[0].length);
        pos += keywordMatch[0].length;
        matched = true;
        continue;
      }

      // Functions (#function-name or function())
      const funcHashMatch = remaining.match(/^#[a-zA-Z_][a-zA-Z0-9_-]*/);
      if (funcHashMatch) {
        tokens.push({ type: "function", value: funcHashMatch[0] });
        remaining = remaining.slice(funcHashMatch[0].length);
        pos += funcHashMatch[0].length;
        matched = true;
        continue;
      }

      // Built-in functions
      const builtinMatch = remaining.match(/^(page|text|par|figure|table|image|box|block|grid|stack|align|h|v|rect|circle|line|path|polygon|place|move|scale|rotate|link|ref|cite|footnote|heading|outline|list|enum|terms|raw|code|emph|strong|underline|strike|overline|highlight|smallcaps|sub|super|lorem)\s*\(/);
      if (builtinMatch) {
        const funcName = builtinMatch[0].slice(0, -1); // Remove the opening paren
        tokens.push({ type: "function", value: funcName });
        tokens.push({ type: "text", value: "(" });
        remaining = remaining.slice(builtinMatch[0].length);
        pos += builtinMatch[0].length;
        matched = true;
        continue;
      }

      // Strings ("..." or '...')
      const stringMatch = remaining.match(/^"[^"]*"|^'[^']*'/);
      if (stringMatch) {
        tokens.push({ type: "string", value: stringMatch[0] });
        remaining = remaining.slice(stringMatch[0].length);
        pos += stringMatch[0].length;
        matched = true;
        continue;
      }

      // Numbers
      const numberMatch = remaining.match(/^-?\d+(\.\d+)?(em|pt|cm|mm|in|%)?/);
      if (numberMatch) {
        tokens.push({ type: "number", value: numberMatch[0] });
        remaining = remaining.slice(numberMatch[0].length);
        pos += numberMatch[0].length;
        matched = true;
        continue;
      }

      // Markup (*bold*, _italic_, etc.)
      const boldMatch = remaining.match(/^\*[^*]+\*/);
      if (boldMatch) {
        tokens.push({ type: "markup", value: boldMatch[0] });
        remaining = remaining.slice(boldMatch[0].length);
        pos += boldMatch[0].length;
        matched = true;
        continue;
      }

      const italicMatch = remaining.match(/^_[^_]+_/);
      if (italicMatch) {
        tokens.push({ type: "markup", value: italicMatch[0] });
        remaining = remaining.slice(italicMatch[0].length);
        pos += italicMatch[0].length;
        matched = true;
        continue;
      }

      // Default: plain text (one character at a time for efficiency, group consecutive)
      if (!matched) {
        const lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === "text") {
          lastToken.value += remaining[0];
        } else {
          tokens.push({ type: "text", value: remaining[0] });
        }
        remaining = remaining.slice(1);
        pos += 1;
      }
    }

    return tokens;
  });
};

const getTokenClass = (type: Token["type"]): string => {
  switch (type) {
    case "keyword":
      return "syntax-keyword";
    case "function":
      return "syntax-function";
    case "string":
      return "syntax-string";
    case "number":
      return "syntax-number";
    case "comment":
      return "syntax-comment";
    case "markup":
      return "syntax-markup";
    case "math":
      return "syntax-math";
    case "heading":
      return "text-primary font-semibold";
    default:
      return "text-foreground/90";
  }
};

const SyntaxHighlighter = ({ code }: SyntaxHighlighterProps) => {
  const tokenizedLines = useMemo(() => tokenize(code), [code]);

  return (
    <div className="font-mono text-sm leading-6">
      {tokenizedLines.map((lineTokens, lineIndex) => (
        <div key={lineIndex} className="min-h-[1.5rem]">
          {lineTokens.length === 0 ? (
            <span>&nbsp;</span>
          ) : (
            lineTokens.map((token, tokenIndex) => (
              <span key={tokenIndex} className={getTokenClass(token.type)}>
                {token.value}
              </span>
            ))
          )}
        </div>
      ))}
    </div>
  );
};

export default SyntaxHighlighter;
