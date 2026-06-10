import { X, HelpCircle, DownloadCloud, Tags, GitMerge, FileText } from "lucide-react";

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="absolute inset-0 bg-carbon/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-canvas border-2 border-chrome-indigo shadow-[8px_8px_0px_rgba(61,79,151,1)] w-full max-w-2xl flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="bg-chrome-indigo text-white px-3 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            <HelpCircle className="w-4 h-4" />
            HOW TO USE GIT DESKTOP
          </div>
          <button onClick={onClose} className="hover:bg-primary p-0.5 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 bg-platinum flex flex-col gap-4 overflow-y-auto">
          
          <p className="text-sm text-ink-soft">
            Welcome to the ultimate tactile Git client. Here is a quick guide to mastering your repository workflows.
          </p>

          <div className="flex flex-col gap-3 mt-2">
            
            {/* Local Status */}
            <div className="bg-white border-l-4 border-systems-teal p-3 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-ink mb-1">
                <FileText className="w-4 h-4 text-systems-teal" />
                Local Status & Committing
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Click the <strong>LOCAL STATUS</strong> tab to see your working tree. Use the <span className="font-mono bg-platinum px-1">+</span> to stage files and <span className="font-mono bg-platinum px-1">-</span> to unstage them. 
                Type a message in the bottom box and hit <strong>COMMIT</strong> to permanently save the snapshot.
              </p>
            </div>

            {/* Stashing */}
            <div className="bg-white border-l-4 border-nav-gold p-3 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-ink mb-1">
                <DownloadCloud className="w-4 h-4 text-nav-gold" />
                Stashing Work
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Need to quickly switch branches but have messy uncommitted code? Click <strong>STASH</strong> (next to commit). It squirrels away your files into a temporary stash. Later, click the Cloud icon in the STASHES panel to <strong>Apply</strong> it back!
              </p>
            </div>

            {/* Branching & Merging */}
            <div className="bg-white border-l-4 border-primary p-3 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-ink mb-1">
                <GitMerge className="w-4 h-4 text-primary" />
                Merging & Conflicts
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Use the top header to switch branches. To pull another branch into your current one, click the <strong>MERGE</strong> button next to it. 
                If the timelines collide, a massive yellow <strong>MERGE IN PROGRESS</strong> banner will appear. 
                Files with conflicts will get a red <span className="font-bold text-primary">!</span> badge. Open them in VS Code, fix the code, <strong>Stage (+)</strong> the files here, and hit <strong>Commit</strong> to finish the merge!
              </p>
            </div>

            {/* Tags */}
            <div className="bg-white border-l-4 border-chrome-indigo p-3 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-ink mb-1">
                <Tags className="w-4 h-4 text-chrome-indigo" />
                Tags
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Want to mark v1.0? Click the Tag dropdown in the top header and select <strong>+ Create New Tag</strong>. You can instantly switch your working directory to any tag by selecting it.
              </p>
            </div>

          </div>

          <div className="flex justify-end mt-4 shrink-0">
            <button 
              onClick={onClose}
              className="px-6 py-2 text-xs font-bold bg-systems-teal text-white border-2 border-carbon beveled-chip shadow-[2px_2px_0px_rgba(33,36,46,1)] active:translate-y-px active:shadow-none"
            >
              GOT IT
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
