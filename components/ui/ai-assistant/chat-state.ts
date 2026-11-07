import {
  lastAssistantMessageIsCompleteWithApprovalResponses,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai'
import type { AssistantUIMessage } from './types'

/** Parts after the last step marker: the step the model is waiting on. */
function lastStepHasClientTool(message: AssistantUIMessage | undefined) {
  if (!message || message.role !== 'assistant') return false
  const lastStepStart = message.parts.findLastIndex(
    (part) => part.type === 'step-start'
  )
  return message.parts
    .slice(lastStepStart + 1)
    .some((part) => part.type === 'tool-show_on_page')
}

/**
 * Send the chat back to the server when the visitor answered a confirm card,
 * or when the browser finished a client tool (show_on_page). Server tools that
 * finish inside one stream never trigger a second request.
 */
export function shouldResend({ messages }: { messages: AssistantUIMessage[] }) {
  if (lastAssistantMessageIsCompleteWithApprovalResponses({ messages })) {
    return true
  }
  return (
    lastStepHasClientTool(messages.at(-1)) &&
    lastAssistantMessageIsCompleteWithToolCalls({ messages })
  )
}

export function hasPendingConfirmation(messages: AssistantUIMessage[]) {
  const last = messages.at(-1)
  if (!last || last.role !== 'assistant') return false
  return last.parts.some(
    (part) =>
      (part.type === 'tool-book_call' || part.type === 'tool-message_edward') &&
      part.state === 'approval-requested' &&
      !part.approval.isAutomatic
  )
}
