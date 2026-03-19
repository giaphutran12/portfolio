'use client'

import { useSyncExternalStore } from 'react'

const PROJECT_DETAIL_DIALOG_OPEN_EVENT = 'project-detail-dialog-open-change'
const PROJECT_DETAIL_DIALOG_OPEN_DATA_KEY = 'projectDetailDialogOpen'

function subscribeToProjectDetailDialogOpen(callback: () => void) {
  window.addEventListener(PROJECT_DETAIL_DIALOG_OPEN_EVENT, callback)

  return () => {
    window.removeEventListener(PROJECT_DETAIL_DIALOG_OPEN_EVENT, callback)
  }
}

function getProjectDetailDialogOpenSnapshot() {
  return document.body.dataset[PROJECT_DETAIL_DIALOG_OPEN_DATA_KEY] === 'true'
}

function getProjectDetailDialogOpenServerSnapshot() {
  return false
}

export function useProjectDetailDialogOpen() {
  return useSyncExternalStore(
    subscribeToProjectDetailDialogOpen,
    getProjectDetailDialogOpenSnapshot,
    getProjectDetailDialogOpenServerSnapshot
  )
}

export function setProjectDetailDialogOpen(nextOpen: boolean) {
  const nextValue = nextOpen ? 'true' : 'false'
  const currentValue =
    document.body.dataset[PROJECT_DETAIL_DIALOG_OPEN_DATA_KEY]

  if (currentValue === nextValue) {
    return
  }

  document.body.dataset[PROJECT_DETAIL_DIALOG_OPEN_DATA_KEY] = nextValue
  window.dispatchEvent(new Event(PROJECT_DETAIL_DIALOG_OPEN_EVENT))
}
