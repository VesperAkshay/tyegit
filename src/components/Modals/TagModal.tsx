interface TagModalProps {
  newTagName: string;
  setNewTagName: (name: string) => void;
  tagMessage: string;
  setTagMessage: (msg: string) => void;
  onCancel: () => void;
  onCreate: () => void;
}

export default function TagModal({ newTagName, setNewTagName, tagMessage, setTagMessage, onCancel, onCreate }: TagModalProps) {
  return (
    <div className="fixed inset-0 bg-carbon/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-platinum border-2 border-chrome-indigo shadow-[4px_4px_0px_rgba(61,79,151,1)] p-6 max-w-sm w-full">
        <h2 className="text-lg font-black text-ink mb-4">CREATE NEW TAG</h2>
        <div className="mb-4">
          <label className="ui-label text-ink block mb-1">TAG NAME</label>
          <input 
            type="text"
            className="w-full text-xs p-2 border border-chrome-indigo focus:outline-none focus:border-nav-gold"
            placeholder="v1.0.0"
            value={newTagName}
            onChange={e => setNewTagName(e.target.value.replace(/\s+/g, '-'))}
          />
        </div>
        <div className="mb-4">
          <label className="ui-label text-ink block mb-1">MESSAGE (OPTIONAL)</label>
          <input 
            type="text"
            className="w-full text-xs p-2 border border-chrome-indigo focus:outline-none focus:border-nav-gold"
            placeholder="Release version 1.0.0"
            value={tagMessage}
            onChange={e => setTagMessage(e.target.value)}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-ink hover:bg-canvas">CANCEL</button>
          <button onClick={onCreate} disabled={!newTagName} className="bg-systems-teal text-white px-4 py-2 text-xs font-bold beveled-chip disabled:opacity-50">CREATE TAG</button>
        </div>
      </div>
    </div>
  );
}
