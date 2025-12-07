import { useState } from "react";
import EditorToolbar from "./EditorToolbar";
import CodeEditor from "./CodeEditor";

interface EditorPanelProps {
  onCodeChange?: (code: string) => void;
}

const EditorPanel = ({ onCodeChange }: EditorPanelProps) => {
  const [tabs, setTabs] = useState([
    { id: "1", name: "document.typ", active: true },
  ]);

  const handleTabClick = (id: string) => {
    setTabs(tabs.map(tab => ({ ...tab, active: tab.id === id })));
  };

  const handleTabClose = (id: string) => {
    if (tabs.length > 1) {
      const newTabs = tabs.filter(tab => tab.id !== id);
      if (tabs.find(t => t.id === id)?.active && newTabs.length > 0) {
        newTabs[0].active = true;
      }
      setTabs(newTabs);
    }
  };

  const handleNewTab = () => {
    const newId = String(Date.now());
    setTabs([
      ...tabs.map(t => ({ ...t, active: false })),
      { id: newId, name: "untitled.typ", active: true }
    ]);
  };

  return (
    <div className="flex flex-col h-full panel-editor">
      <EditorToolbar
        tabs={tabs}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
      />
      <div className="flex-1 overflow-auto">
        <CodeEditor onChange={onCodeChange} />
      </div>
    </div>
  );
};

export default EditorPanel;
