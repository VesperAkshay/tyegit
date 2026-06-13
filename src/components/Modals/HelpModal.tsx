import { X, HelpCircle, DownloadCloud, Tags, GitMerge, FileText, Globe } from "lucide-react";

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
            <br/><br/>
            <strong>Pro Tip:</strong> Press <span className="font-mono bg-chrome-indigo text-white px-1.5 py-0.5 rounded">Ctrl+K</span> (or <span className="font-mono bg-chrome-indigo text-white px-1.5 py-0.5 rounded">Cmd+K</span> on Mac) anywhere in the app to open the <strong>Quick Repository Switcher</strong>!
          </p>

          <div className="flex flex-col gap-3 mt-2">
            
            <div className="bg-white border-l-4 border-systems-teal p-3 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-ink mb-1">
                <FileText className="w-4 h-4 text-systems-teal" />
                1. Local Status & Commits
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                The <strong>LOCAL STATUS</strong> tab shows your working tree. Use the <span className="font-mono bg-platinum px-1">+</span> to stage files and <span className="font-mono bg-platinum px-1">-</span> to unstage them. 
                You can also <strong>Discard</strong> changes or add untracked files to <strong>.gitignore</strong>.
                Write a message in the bottom box and hit <strong>COMMIT</strong> to save the snapshot. Check <strong>AMEND</strong> to modify the previous commit!
              </p>
            </div>

            <div className="bg-white border-l-4 border-nav-gold p-3 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-ink mb-1">
                <DownloadCloud className="w-4 h-4 text-nav-gold" />
                2. Stashing Work
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Need to quickly switch branches but have uncommitted code? Click <strong>STASH</strong> (next to commit). It squirrels away your files safely. Click the Cloud icon in the STASHES panel to <strong>Apply</strong>, <strong>Pop</strong>, or <strong>Drop</strong> your saved work!
              </p>
            </div>

            <div className="bg-white border-l-4 border-primary p-3 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-ink mb-1">
                <GitMerge className="w-4 h-4 text-primary" />
                3. Merging & Conflicts
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Use the top header to switch branches. To pull another branch into your current one, click the <strong>MERGE</strong> button. 
                If timelines collide, a massive yellow <strong>MERGE IN PROGRESS</strong> banner will appear. 
                Conflicted files will get a red <span className="font-bold text-primary">!</span> badge. Open them in your editor, fix the code, <strong>Stage (+)</strong> them, and hit <strong>COMMIT</strong> to finish the merge! You can also <strong>ABORT MERGE</strong> if needed.
              </p>
            </div>

            <div className="bg-white border-l-4 border-chrome-indigo p-3 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-ink mb-1">
                <Tags className="w-4 h-4 text-chrome-indigo" />
                4. Tags & History
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Mark releases using the Tag dropdown (<strong>+ Create Tag</strong>). You can checkout any tag by selecting it. 
                Switch to the <strong>COMMIT HISTORY</strong> tab to search through your entire timeline and click on any commit to view an inline diff of the changes!
              </p>
            </div>

            <div className="bg-white border-l-4 border-carbon p-3 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-ink mb-1">
                <DownloadCloud className="w-4 h-4 text-carbon" />
                5. Network Sync
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Use <strong>FETCH</strong>, <strong>PULL</strong>, and <strong>PUSH</strong> in the top right to sync with remote repositories. The app will securely ask for your Personal Access Token when needed.
              </p>
            </div>

            <div className="bg-white border-l-4 border-systems-green p-3 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-ink mb-1">
                <Globe className="w-4 h-4 text-systems-green" />
                6. GitHub Integration
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Click the new <strong>GITHUB</strong> tab to instantly view all open Pull Requests and Issues for the current repository. If you initialize a new local repository, you can use this tab to instantly <strong>Publish</strong> it to your GitHub account! Your commit history also natively displays author avatars and GitHub Actions CI/CD statuses.
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
