import EditorToolbar from "./EditorToolbar";
import CodeEditor from "./CodeEditor";

interface Tab {
  id: string;
  name: string;
  content: string;
  active: boolean;
}

interface EditorPanelProps {
  tabs: Tab[];
  activeContent: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
  onContentChange: (content: string) => void;
}

const EditorPanel = ({ 
  tabs, 
  activeContent, 
  onTabClick, 
  onTabClose, 
  onNewTab, 
  onContentChange 
}: EditorPanelProps) => {
  return (
    <div className="flex flex-col h-full panel-editor">
      <EditorToolbar
        tabs={tabs}
        onTabClick={onTabClick}
        onTabClose={onTabClose}
        onNewTab={onNewTab}
      />
      <div className="flex-1 overflow-auto">
        <CodeEditor value={activeContent} onChange={onContentChange} />
      </div>
    </div>
  );
};

export default EditorPanel;
