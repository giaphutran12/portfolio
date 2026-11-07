import { tool } from 'ai'
import { z } from 'zod'
import { PAGE_TARGETS, PROJECT_SLUGS } from '@/lib/assistant/project-slugs'

/**
 * Client tool: it has no `execute`, so the browser runs it. The chat UI scrolls
 * to the section (or opens the project dialog) and reports back with
 * `addToolOutput`, which lets the model carry on.
 *
 * One object with two nullable fields instead of a union: OpenAI strict tool
 * schemas need a top-level object with every key required.
 */
export const showOnPageInputSchema = z.object({
  target: z
    .enum(PAGE_TARGETS)
    .nullable()
    .describe('Section to scroll to. Null when opening a project.'),
  project: z
    .enum(PROJECT_SLUGS)
    .nullable()
    .describe('Project slug whose detail dialog to open. Null for a section.'),
})

export type ShowOnPageInput = z.infer<typeof showOnPageInputSchema>

/** What the browser reports back through `addToolOutput`. */
export const showOnPageOutputSchema = z.object({
  shown: z.boolean(),
  detail: z.string(),
})

export type ShowOnPageOutput = z.infer<typeof showOnPageOutputSchema>

export const showOnPageTool = tool({
  description:
    "Move the visitor's page: scroll to a section (about, projects, experience, contact) or open one project's detail dialog. Use it when showing is better than telling: the visitor asks to see a project or a section, or after you recommend a project. Set exactly one of target or project and the other to null. Say one short line about what you are showing; do not repeat the project's description.",
  inputSchema: showOnPageInputSchema,
  outputSchema: showOnPageOutputSchema,
})
