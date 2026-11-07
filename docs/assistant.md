# Site assistant

The dog in the corner is an agent, not a chatbot. It answers questions about Edward from a fixed knowledge base, and it can act on the page: show a section or project, offer real call times, book a call, and send Edward a message. Anything that reaches a real person needs the visitor's explicit Confirm.

## How a turn works

1. The browser (`components/ui/ai-assistant/index.tsx`) sends the chat to `POST /api/chat` as AI SDK UI messages (`useChat` + `DefaultChatTransport`). It sends at most the last 36 messages.
2. `app/api/chat/route.ts` rate-limits by IP, validates the body, then calls `streamText` with:
   - the fixed instructions (`lib/assistant/instructions.ts`) with the whole knowledge base inside, no retrieval step;
   - the four tools (`lib/assistant/tools/`);
   - `stopWhen: isStepCount(5)`, `maxOutputTokens: 600`, and a `prepareStep` that turns tools off on the last step so the model has to answer in words.
3. The date (America/Vancouver) is added by `prepareStep` as the last system message of every step. It is not in the fixed prompt, so the provider's prompt cache keeps hitting the instructions. It is not appended to `messages` up front on purpose: a system message after the visitor's approval answer hides the approval and the SDK refuses to run the tool (test: `app/api/chat/route.test.ts`, "asks for approval before sending a message").
4. The answer streams back as a UI message stream. The chat renders text, slot chips, confirm cards and one-line receipts. It never renders raw tool JSON or model reasoning.

Without `OPENAI_API_KEY` the route answers with one fixed line that points to the contact section (`NOT_CONFIGURED_REPLY` in `lib/assistant/config.ts`). There is no keyword fallback.

## Knowledge

`lib/assistant/knowledge.ts` exports `EDWARD_KNOWLEDGE` (markdown with `##` sections) and `KNOWLEDGE_VERSION`. Edit it there. The prompt says every fact about Edward must come from it, and that the assistant must say it does not know rather than invent. Bump `PROMPT_VERSION` in `instructions.ts` on any change to the instructions text (the version is in every log line and is the OpenAI prompt cache key).

## Tools

| Tool | Where it runs | What it does |
|------|---------------|--------------|
| `show_on_page` | Browser (no `execute`) | Scrolls to `about`, `projects`, `experience` or `contact`, or opens a project's detail dialog. Uses the page's Lenis instance, falls back to `scrollIntoView`. A project is opened by pressing its card (`[data-project-id]`). Slugs come from `lib/assistant/project-slugs.ts`, which a test keeps in sync with `getDefaultProjects()`. |
| `get_open_slots` | Server | GETs the booking page as JSON and returns the next 12 slots plus the page's title, duration and time zone. Shown as chips in the visitor's local time. |
| `book_call` | Server, needs approval | Checks the start is still offered, then POSTs `${BOOKING_PAGE_URL}/reservations` with `request_key` = the tool call id (safe to retry). The reservation's manage token and URL are never read, returned or logged; the guest gets them in the calendar invite. |
| `message_edward` | Server, needs approval | Sends an email through Resend's REST API with the visitor as `reply_to`. |

Server tools return `{ ok: true, data }` or `{ ok: false, code, message_for_model }`. The UI never shows `message_for_model`; it maps `code` to its own neutral line.

Refusals the model can explain: `slot_taken` (409), `slot_unavailable`, `guest_limit` (429), `page_closed` (410), `calendar_unavailable`, `not_configured`, `rate_limited`, `send_failed`, `invalid_input`.

## Approval flow

`book_call` and `message_edward` are listed in `toolApproval` (`lib/assistant/tools/index.ts`). In AI SDK v7 this is a `streamText` option; the old per-tool `needsApproval` is deprecated.

1. The model calls the tool. A policy function checks the input with strict schemas (real email, name length, message up to 2000 characters, note up to 1000). Bad input is denied automatically (`isAutomatic: true`) and the model is told to ask the visitor to fix it. No card is drawn.
2. Good input becomes `approval-requested`. The stream ends and the chat draws a card with exactly what will be sent, with Confirm and Cancel. The text box is disabled until the card is answered.
3. Confirm or Cancel calls `addToolApprovalResponse`. `sendAutomaticallyWhen` sends the chat back, the server runs the tool (or reports it was declined), and the model writes one confirming sentence.
4. Set `ASSISTANT_APPROVAL_SECRET` to have the SDK sign approval requests, so a hand-built request cannot fake a Confirm. It must be the same on every instance. Without it the flow still works, and a caller who skips the card is still bound by the limits below.

Model-facing schemas are plain strings on purpose: OpenAI strict tool schemas can reject the regex lookaheads zod emits for `z.email()` and the length keywords, so those checks run in the policy function and again inside `execute`.

## Environment

All server-only. Names are in `.env.example`.

| Variable | Needed for | Default |
|----------|------------|---------|
| `OPENAI_API_KEY` | Any answer | none: fixed contact-section line |
| `ASSISTANT_MODEL` | Chat model | `gpt-6-luna` |
| `ASSISTANT_APPROVAL_SECRET` | Signing approvals (optional) | unsigned |
| `BOOKING_PAGE_URL` | `get_open_slots`, `book_call` | tools say booking is not set up |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` | `message_edward` | tool says use the contact section's email |
| `CONTACT_TO_EMAIL` | Recipient | `giaphutran012@gmail.com` |

`BOOKING_PAGE_URL` is a private URL: the token in it is the credential. It is read at call time, sent to nobody but the calendar, and never logged.

## Limits

- Chat: `rateLimiters.standard`, 20 requests a minute per IP.
- Actions: `book_call` and `message_edward` share 3 executions an hour per IP (`ACTION_LIMIT` in `lib/assistant/limits.ts`).
- Request: at most 40 messages, text parts up to 4000 characters, only text, step and tool parts (no files), no client system messages.

Both limiters are the in-memory limiter in `lib/utils/rate-limit.ts`, so they are per server instance. On serverless a determined caller can spread across instances. Move to Upstash or KV if abuse shows up.

## Logging

One line per decision: `[ASSISTANT] v=<PROMPT_VERSION> event=<name> k=v`. Values are ids, counts, milliseconds and closed labels. A value that is not a plain label is printed as `redacted`, so message text, names, emails and URLs cannot reach a log by mistake (`lib/assistant/log.ts`).

| Event | Fields |
|-------|--------|
| `turn_start` | `model`, `history` |
| `turn_done` | `steps`, `tools`, `ms`, `finish` (or `reason=not_configured`) |
| `turn_error` | `reason`, `ms` |
| `request_refused` | `reason` (`invalid_json`, `invalid_body`) |
| `rate_limited` | `scope` (`chat`, `action`), `retry_in_s` |
| `slots_fetched` | `count`, `ms` |
| `slots_refused` | `reason`, `status`, `ms` |
| `booking_created` | `status`, `ms` |
| `booking_refused` | `reason` (`slot_taken`, `guest_limit`, `page_closed`, `slot_not_offered`, `not_configured`, `invalid_input`, `timeout`, `unreachable`, `upstream_<status>`) |
| `message_sent` | `id` (Resend id), `ms` |
| `message_refused` | `reason` |

## Chat storage

Messages are saved in `localStorage` under `edward-portfolio-agent-v1` once a reply settles. The old `edward-portfolio-chat` key is deleted on first load. Turns whose tool call never finished (closed tab, dropped connection, an unanswered card) are dropped on load so they cannot poison the next request.

## Tests

`bun test app/api/chat lib/assistant components/ui/ai-assistant`. The route tests use `MockLanguageModelV4` from `ai/test`; tool tests mock `fetch`. Nothing in the suite calls OpenAI, the calendar or Resend.
