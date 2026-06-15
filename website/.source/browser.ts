// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"architecture.mdx": () => import("../content/docs/architecture.mdx?collection=docs"), "branches.mdx": () => import("../content/docs/branches.mdx?collection=docs"), "cherry-picking.mdx": () => import("../content/docs/cherry-picking.mdx?collection=docs"), "getting-started.mdx": () => import("../content/docs/getting-started.mdx?collection=docs"), "github.mdx": () => import("../content/docs/github.mdx?collection=docs"), "merge.mdx": () => import("../content/docs/merge.mdx?collection=docs"), "networking.mdx": () => import("../content/docs/networking.mdx?collection=docs"), "repository.mdx": () => import("../content/docs/repository.mdx?collection=docs"), "staging.mdx": () => import("../content/docs/staging.mdx?collection=docs"), "visual-rebase.mdx": () => import("../content/docs/visual-rebase.mdx?collection=docs"), }),
};
export default browserCollections;