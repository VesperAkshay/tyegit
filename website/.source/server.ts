// @ts-nocheck
import { default as __fd_glob_7 } from "../content/docs/meta.json?collection=meta"
import * as __fd_glob_6 from "../content/docs/staging.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/repository.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/networking.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/merge.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/getting-started.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/branches.mdx?collection=docs"
import * as __fd_glob_0 from "../content/docs/architecture.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.doc("docs", "content/docs", {"architecture.mdx": __fd_glob_0, "branches.mdx": __fd_glob_1, "getting-started.mdx": __fd_glob_2, "merge.mdx": __fd_glob_3, "networking.mdx": __fd_glob_4, "repository.mdx": __fd_glob_5, "staging.mdx": __fd_glob_6, });

export const meta = await create.meta("meta", "content/docs", {"meta.json": __fd_glob_7, });