interface BranchModalProps {
  newBranchName: string;
  setNewBranchName: (name: string) => void;
  onCancel: () => void;
  onCreate: () => void;
}

export default function BranchModal({ newBranchName, setNewBranchName, onCancel, onCreate }: BranchModalProps) {
  return (
    <div className="fixed inset-0 bg-carbon/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-platinum border-2 border-chrome-indigo shadow-[4px_4px_0px_rgba(61,79,151,1)] p-6 max-w-sm w-full">
        <h2 className="text-lg font-black text-ink mb-4">CREATE NEW BRANCH</h2>
        <input 
          type="text"
          className="w-full text-xs p-2 border border-chrome-indigo focus:outline-none focus:border-nav-gold mb-4"
          placeholder="feature/my-new-branch"
          value={newBranchName}
          onChange={e => setNewBranchName(e.target.value.replace(/\s+/g, '-'))}
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-ink hover:bg-canvas">CANCEL</button>
          <button onClick={onCreate} disabled={!newBranchName} className="bg-signal text-white px-4 py-2 text-xs font-bold beveled-chip disabled:opacity-50">CREATE & CHECKOUT</button>
        </div>
      </div>
    </div>
  );
}
