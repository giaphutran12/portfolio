'use client'

import type { ReactNode } from 'react'
import s from './ai-assistant.module.css'
import { formatSlotTime } from './slot-format'
import type { AssistantMessagePart } from './types'

type ToolPart = Extract<AssistantMessagePart, { type: `tool-${string}` }>

interface ToolPartViewProps {
  part: ToolPart
  /** Answers a confirm card. */
  onApproval: (approvalId: string, approved: boolean) => void
  /** A tapped slot chip: the ISO start of the chosen time. */
  onPickSlot: (startIso: string) => void
  /** True while a reply is streaming, so chips and cards can't be double-fired. */
  busy: boolean
}

const BOOKING_REFUSALS: Record<string, string> = {
  slot_taken: 'That time was just taken. Pick another one.',
  slot_unavailable: 'That time is not open any more. Pick another one.',
  guest_limit: 'That email already has the maximum number of bookings.',
  page_closed: "Edward's calendar is closed right now.",
  rate_limited: 'Too many requests from here. Try again later.',
}

const MESSAGE_REFUSALS: Record<string, string> = {
  not_configured:
    'Messages are not set up. Use the email in the contact section instead.',
  rate_limited: 'Too many requests from here. Try again later.',
}

function StatusLine({ children }: { children: ReactNode }) {
  return <p className={s.toolLine}>{children}</p>
}

function ReceiptLine({ children }: { children: ReactNode }) {
  return <p className={s.receipt}>{children}</p>
}

interface ApprovalCardProps {
  title: string
  rows: { label: string; value: string }[]
  body?: string
  confirmLabel: string
  disabled: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ApprovalCard({
  title,
  rows,
  body,
  confirmLabel,
  disabled,
  onConfirm,
  onCancel,
}: ApprovalCardProps) {
  return (
    <section className={s.approvalCard} aria-label={title}>
      <h4 className={s.approvalTitle}>{title}</h4>
      <dl className={s.approvalRows}>
        {rows.map((row) => (
          <div key={row.label} className={s.approvalRow}>
            <dt className={s.approvalLabel}>{row.label}</dt>
            <dd className={s.approvalValue}>{row.value}</dd>
          </div>
        ))}
      </dl>
      {body ? <p className={s.approvalMessage}>{body}</p> : null}
      <div className={s.approvalActions}>
        <button
          type="button"
          className={s.approvalConfirm}
          onClick={onConfirm}
          disabled={disabled}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          className={s.approvalCancel}
          onClick={onCancel}
          disabled={disabled}
        >
          Cancel
        </button>
      </div>
    </section>
  )
}

export function ToolPartView({
  part,
  onApproval,
  onPickSlot,
  busy,
}: ToolPartViewProps) {
  switch (part.type) {
    case 'tool-show_on_page': {
      if (part.state === 'output-available') {
        return <ReceiptLine>{part.output.detail}</ReceiptLine>
      }
      if (part.state === 'output-error') {
        return <StatusLine>Couldn&apos;t move the page.</StatusLine>
      }
      return <StatusLine>Showing that on the page…</StatusLine>
    }

    case 'tool-get_open_slots': {
      if (part.state === 'output-available') {
        if (!part.output.ok) {
          return (
            <StatusLine>Couldn&apos;t reach Edward&apos;s calendar.</StatusLine>
          )
        }
        const { slots } = part.output.data
        if (slots.length === 0) {
          return <StatusLine>No open times right now.</StatusLine>
        }
        return (
          <ul className={s.slotChips} aria-label="Open times">
            {slots.map((slot) => (
              <li key={slot.start}>
                <button
                  type="button"
                  className={s.slotChip}
                  disabled={busy}
                  onClick={() => onPickSlot(slot.start)}
                >
                  {formatSlotTime(slot.start)}
                </button>
              </li>
            ))}
          </ul>
        )
      }
      if (part.state === 'output-error') {
        return (
          <StatusLine>Couldn&apos;t reach Edward&apos;s calendar.</StatusLine>
        )
      }
      return <StatusLine>Checking Edward&apos;s calendar…</StatusLine>
    }

    case 'tool-book_call': {
      if (part.state === 'approval-requested') {
        if (part.approval.isAutomatic) {
          return <StatusLine>Checking the details…</StatusLine>
        }
        const input = part.input
        return (
          <ApprovalCard
            title="Book a call with Edward"
            rows={[
              { label: 'When', value: formatSlotTime(input.start) },
              { label: 'Name', value: input.guest_name },
              { label: 'Email', value: input.guest_email },
              ...(input.note ? [{ label: 'Note', value: input.note }] : []),
            ]}
            confirmLabel="Confirm booking"
            disabled={busy}
            onConfirm={() => onApproval(part.approval.id, true)}
            onCancel={() => onApproval(part.approval.id, false)}
          />
        )
      }
      if (part.state === 'approval-responded') {
        return (
          <StatusLine>
            {part.approval.approved
              ? 'Booking…'
              : 'Cancelled. Nothing was booked.'}
          </StatusLine>
        )
      }
      if (part.state === 'output-available') {
        if (part.output.ok) {
          return (
            <ReceiptLine>
              Booked {formatSlotTime(part.output.data.start)}. A calendar invite
              is on its way to your inbox.
            </ReceiptLine>
          )
        }
        return (
          <StatusLine>
            {BOOKING_REFUSALS[part.output.code] ??
              "Couldn't book that. Nothing was booked."}
          </StatusLine>
        )
      }
      if (part.state === 'output-denied') {
        return (
          <StatusLine>
            {part.approval.isAutomatic
              ? "Those details didn't look right. Nothing was booked."
              : 'Cancelled. Nothing was booked.'}
          </StatusLine>
        )
      }
      if (part.state === 'output-error') {
        return (
          <StatusLine>Something went wrong. Nothing was booked.</StatusLine>
        )
      }
      return <StatusLine>Preparing the booking…</StatusLine>
    }

    case 'tool-message_edward': {
      if (part.state === 'approval-requested') {
        if (part.approval.isAutomatic) {
          return <StatusLine>Checking the details…</StatusLine>
        }
        const input = part.input
        return (
          <ApprovalCard
            title="Send this message to Edward"
            rows={[
              { label: 'From', value: input.visitor_name },
              { label: 'Reply to', value: input.visitor_email },
            ]}
            body={input.message}
            confirmLabel="Send message"
            disabled={busy}
            onConfirm={() => onApproval(part.approval.id, true)}
            onCancel={() => onApproval(part.approval.id, false)}
          />
        )
      }
      if (part.state === 'approval-responded') {
        return (
          <StatusLine>
            {part.approval.approved
              ? 'Sending…'
              : 'Cancelled. Nothing was sent.'}
          </StatusLine>
        )
      }
      if (part.state === 'output-available') {
        if (part.output.ok) {
          return <ReceiptLine>Message sent to Edward.</ReceiptLine>
        }
        return (
          <StatusLine>
            {MESSAGE_REFUSALS[part.output.code] ??
              "Couldn't send that. Use the email in the contact section instead."}
          </StatusLine>
        )
      }
      if (part.state === 'output-denied') {
        return (
          <StatusLine>
            {part.approval.isAutomatic
              ? "Those details didn't look right. Nothing was sent."
              : 'Cancelled. Nothing was sent.'}
          </StatusLine>
        )
      }
      if (part.state === 'output-error') {
        return <StatusLine>Something went wrong. Nothing was sent.</StatusLine>
      }
      return <StatusLine>Preparing the message…</StatusLine>
    }

    default:
      return null
  }
}
