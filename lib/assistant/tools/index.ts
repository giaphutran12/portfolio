import {
  approvalForBookCall,
  createBookCallTool,
} from '@/lib/assistant/tools/book-call'
import { getOpenSlotsTool } from '@/lib/assistant/tools/get-open-slots'
import {
  approvalForMessageEdward,
  createMessageEdwardTool,
} from '@/lib/assistant/tools/message-edward'
import { showOnPageTool } from '@/lib/assistant/tools/show-on-page'
import type { ToolContext } from '@/lib/assistant/tools/types'

/** The full tool set for one request. Only the two action tools need the caller. */
export function createAssistantTools(ctx: ToolContext) {
  return {
    show_on_page: showOnPageTool,
    get_open_slots: getOpenSlotsTool,
    book_call: createBookCallTool(ctx),
    message_edward: createMessageEdwardTool(ctx),
  }
}

export type AssistantTools = ReturnType<typeof createAssistantTools>

/** Tools that act on the world: each needs the visitor's explicit Confirm. */
export const ASSISTANT_TOOL_APPROVAL = {
  book_call: (input: unknown) => approvalForBookCall(input),
  message_edward: (input: unknown) => approvalForMessageEdward(input),
}

export const ACTION_TOOL_NAMES = ['book_call', 'message_edward'] as const
