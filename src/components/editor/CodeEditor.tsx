import { useState, useCallback } from "react";

const defaultCode = `#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 3cm),
)

#set text(
  font: "New Computer Modern",
  size: 11pt,
)

#align(center)[
  #text(size: 24pt, weight: "bold")[
    Document Title
  ]
  
  #v(0.5em)
  
  #text(size: 12pt, fill: gray)[
    Author Name • December 2024
  ]
]

#v(2em)

= Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

== Background

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

#figure(
  rect(width: 100%, height: 4cm, fill: luma(240))[
    #align(center + horizon)[
      _Figure placeholder_
    ]
  ],
  caption: [A sample figure],
)

== Methodology

Duis aute irure dolor in reprehenderit in voluptate velit esse.

$ E = m c^2 $

#table(
  columns: 3,
  [*Item*], [*Value*], [*Unit*],
  [Alpha], [1.234], [m/s],
  [Beta], [5.678], [kg],
  [Gamma], [9.012], [J],
)
`;

interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const CodeEditor = ({ value, onChange }: CodeEditorProps) => {
  const [code, setCode] = useState(value || defaultCode);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCode(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const lines = code.split("\n");

  return (
    <div className="flex h-full font-mono text-sm">
      {/* Line Numbers */}
      <div className="flex-shrink-0 py-4 px-3 text-right text-muted-foreground select-none border-r border-border bg-surface-editor/50">
        {lines.map((_, index) => (
          <div key={index} className="leading-6 text-xs">
            {index + 1}
          </div>
        ))}
      </div>

      {/* Code Area */}
      <div className="flex-1 relative">
        <textarea
          value={code}
          onChange={handleChange}
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
