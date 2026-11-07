import type { InferUITools, UIDataTypes, UIMessage } from 'ai'
import type { AssistantTools } from '@/lib/assistant/tools'

/** The chat message type: UI messages whose tool parts know our four tools. */
export type AssistantUIMessage = UIMessage<
  unknown,
  UIDataTypes,
  InferUITools<AssistantTools>
>

export type AssistantMessagePart = AssistantUIMessage['parts'][number]
