"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { StagingAnimation } from "@/components/animations/StagingAnimation";
import { MergeAnimation } from "@/components/animations/MergeAnimation";
import { StashAnimation } from "@/components/animations/StashAnimation";
import { VisualRebaseAnimation } from "@/components/animations/VisualRebaseAnimation";

const cardVariants: Variants = {
    offscreen: {
        y: 300,
        opacity: 0,
        rotate: 0,
    },
    onscreen: (i: number) => ({
        y: 0,
        opacity: 1,
        rotate: i % 2 === 0 ? -1 : 1, // Slight alternating rotation for playfulness
        transition: {
            type: "spring",
            bounce: 0.3,
            duration: 0.8,
        },
    }),
};

const workflows = [
  {
    id: 1,
    title: "Commit only what matters.",
    desc: "Stop committing `console.log`s. TyeGit gives you an embedded God-Mode editor. Open the diff, click the arrows to selectively stage specific hunks, and build perfectly clean commits.",
    path: "Edit file → Open diff → Stage hunk → Commit → Push",
    linkText: "Read the Staging Guide →",
    linkUrl: "/docs/staging",
    Animation: StagingAnimation,
    reverse: false,
    color: "bg-surface"
  },
  {
    id: 2,
    title: "Keep experiments separate.",
    desc: "Branching shouldn't be scary. Create branches instantly, work in isolation, and when you are ready, use our robust 3-way merge engine to combine work safely.",
    path: "Create branch → Work → Merge → Resolve conflicts → Finish",
    linkText: "Read the Merge Guide →",
    linkUrl: "/docs/merge",
    Animation: MergeAnimation,
    reverse: true,
    color: "bg-muted-beige"
  },
  {
    id: 3,
    title: "Save work without committing.",
    desc: "Need to pivot tasks suddenly? Don't make a messy \"WIP\" commit. Stash your changes instantly, switch branches, and pop your stash back out when you return.",
    path: "Edit → Stash → Switch branch → Apply stash",
    linkText: "",
    linkUrl: "",
    Animation: StashAnimation,
    reverse: false,
    color: "bg-cream"
  },
  {
    id: 4,
    title: "Safely rewrite history.",
    desc: "Interactive rebasing is traditionally terrifying. With Visual Rebase, simply drag and drop commits to reorder them. We dry-run the changes in memory instantly, guaranteeing zero conflicts before you even apply.",
    path: "Visual Rebase → Drag Commit → Auto-Validate → Apply",
    linkText: "Explore Visual Rebase →",
    linkUrl: "/docs/visual-rebase",
    Animation: VisualRebaseAnimation,
    reverse: true,
    color: "bg-surface"
  }
];

export function WorkflowShowcase() {
    return (
        <div className="w-full flex flex-col items-center pb-24" style={{ paddingTop: "20px" }}>
            {workflows.map((wf, i) => {
                const Anim = wf.Animation;
                return (
                    <motion.div
                        key={wf.id}
                        custom={i}
                        initial="offscreen"
                        whileInView="onscreen"
                        viewport={{ amount: 0.4 }}
                        variants={cardVariants}
                        style={{
                            marginBottom: i === workflows.length - 1 ? 0 : "-80px", // Negative margin for overlap
                            position: "relative",
                            zIndex: i, // Stack on top of each other
                            transformOrigin: "center center",
                        }}
                        className={`w-full max-w-5xl ${wf.color} rounded-[2rem] p-8 md:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-warm-gray flex flex-col md:flex-row${wf.reverse ? '-reverse' : ''} gap-12 items-center`}
                    >
                        <div className="md:w-1/2 space-y-6">
                            <div className="text-vintage-red font-bold text-sm tracking-widest uppercase">
                                Workflow {wf.id}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-charcoal tracking-tight">
                                {wf.title}
                            </h2>
                            <p className="text-lg text-charcoal/80">
                                {wf.desc}
                            </p>
                            <div className="font-mono text-sm bg-white/50 p-4 rounded-md border border-warm-gray text-charcoal/60">
                                {wf.path}
                            </div>
                            {wf.linkText && wf.linkUrl && (
                                <Link href={wf.linkUrl} className="inline-block mt-4 text-vintage-red font-bold hover:underline">
                                    {wf.linkText}
                                </Link>
                            )}
                        </div>
                        <div className="md:w-1/2 w-full bg-charcoal rounded-xl aspect-video border-4 border-charcoal/10 relative shadow-2xl flex items-center justify-center text-cream overflow-hidden">
                            <Anim />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
