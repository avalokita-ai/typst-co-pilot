import { useState, useCallback } from "react";

interface Tab {
  id: string;
  name: string;
  content: string;
  active: boolean;
}

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

export function useDocuments() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "1", name: "document.typ", content: defaultCode, active: true },
  ]);

  const activeTab = tabs.find(t => t.active);
  const activeContent = activeTab?.content || "";

  const setActiveTab = useCallback((id: string) => {
    setTabs(prev => prev.map(tab => ({ ...tab, active: tab.id === id })));
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      if (prev.length <= 1) return prev;
      const newTabs = prev.filter(tab => tab.id !== id);
      if (prev.find(t => t.id === id)?.active && newTabs.length > 0) {
        newTabs[0].active = true;
      }
      return newTabs;
    });
  }, []);

  const createTab = useCallback((name: string = "untitled.typ", content: string = defaultCode) => {
    const newId = String(Date.now());
    setTabs(prev => [
      ...prev.map(t => ({ ...t, active: false })),
      { id: newId, name, content, active: true }
    ]);
    return newId;
  }, []);

  const updateContent = useCallback((content: string) => {
    setTabs(prev => prev.map(tab => 
      tab.active ? { ...tab, content } : tab
    ));
  }, []);

  const updateTabContent = useCallback((id: string, content: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === id ? { ...tab, content } : tab
    ));
  }, []);

  return {
    tabs,
    activeTab,
    activeContent,
    setActiveTab,
    closeTab,
    createTab,
    updateContent,
    updateTabContent,
  };
}
