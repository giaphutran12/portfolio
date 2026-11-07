/**
 * Every server tool returns one of these two shapes. `message_for_model` is a
 * plain sentence the model can paraphrase to the visitor; it never carries
 * secrets, URLs of private pages or raw upstream bodies.
 */

export type ToolResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message_for_model: string }

export function ok<T>(data: T): ToolResult<T> {
  return { ok: true, data }
}

export function fail(
  code: string,
  messageForModel: string
): { ok: false; code: string; message_for_model: string } {
  return { ok: false, code, message_for_model: messageForModel }
}

/** What each tool needs from the request that started the turn. */
export interface ToolContext {
  /** Caller IP, used only to key the in-memory action limiter. */
  ip: string
}
