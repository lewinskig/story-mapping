import { useEffect, useMemo, useState } from 'react'
import { BoardPanel } from './BoardPanel'
import { DetailsPanel } from './DetailsPanel'
import {
  addGoal,
  addRelease,
  addStep,
  addStory,
  deleteEntity,
  getAllSteps,
  getColumns,
  getEntity,
  goalPalette,
  loadBoard,
  moveGoal,
  moveGoalToEnd,
  moveStep,
  moveStory,
  PLANNED_RELEASE_ID,
  seedBoard,
  STORAGE_KEY,
  updateGoal,
  updateRelease,
  updateStep,
  updateStory,
} from '../model/board'

function createSelection(mode, type, draft, meta = {}) {
  return { mode, type, draft, ...meta }
}

function normalizeDraft(type, draft) {
  const name = draft.name.trim()
  if (!name) return null

  if (type === 'goal') return { name, color: draft.color || 'sky' }
  if (type === 'step') return { name, goalId: draft.goalId }
  if (type === 'story') {
    return {
      name,
      stepId: draft.stepId,
      releaseId: draft.releaseId || PLANNED_RELEASE_ID,
      priority: draft.priority || 'medium',
    }
  }
  if (type === 'release') return { name, dueDate: draft.dueDate || '' }

  return null
}

export function StoryMapPage() {
  const [board, setBoard] = useState(loadBoard)
  const [selection, setSelection] = useState(null)
  const [dragState, setDragState] = useState(null)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
  }, [board])

  useEffect(() => {
    if (!selection || selection.mode !== 'edit') return

    const entity = getEntity(board, selection.type, selection.id)
    if (!entity) {
      setSelection(null)
      return
    }

    setSelection((current) => {
      if (!current || current.mode !== 'edit') return current
      return { ...current, draft: { ...entity } }
    })
  }, [board, selection?.id, selection?.mode, selection?.type])

  const columns = useMemo(() => getColumns(board.goals), [board.goals])
  const steps = useMemo(() => getAllSteps(board.goals), [board.goals])

  function resetBoard() {
    setBoard(seedBoard)
    setSelection(null)
    setDragState(null)
  }

  function submitSelection(event) {
    event.preventDefault()
    if (!selection) return

    const draft = normalizeDraft(selection.type, selection.draft)
    if (!draft) return

    if (selection.mode === 'create') {
      if (selection.type === 'goal') setBoard((current) => addGoal(current, draft))
      if (selection.type === 'step') setBoard((current) => addStep(current, draft))
      if (selection.type === 'story') setBoard((current) => addStory(current, draft))
      if (selection.type === 'release') setBoard((current) => addRelease(current, draft))
      setSelection(null)
      return
    }

    if (selection.type === 'goal') setBoard((current) => updateGoal(current, selection.id, draft))
    if (selection.type === 'step') setBoard((current) => updateStep(current, selection.id, draft))
    if (selection.type === 'story') setBoard((current) => updateStory(current, selection.id, draft))
    if (selection.type === 'release') setBoard((current) => updateRelease(current, selection.id, draft))

    setSelection(null)
  }

  function handleDelete(type, id) {
    setBoard((current) => deleteEntity(current, type, id))
    setSelection((current) => (current?.type === type && current?.id === id ? null : current))
  }

  function openGoalCreate() {
    setSelection(createSelection('create', 'goal', { name: '', color: goalPalette[board.goals.length % goalPalette.length] }))
  }

  function openGoalEdit(goal) {
    setSelection(createSelection('edit', 'goal', { ...goal }, { id: goal.id }))
  }

  function openStepCreate(goalId) {
    setSelection(createSelection('create', 'step', { name: '', goalId }))
  }

  function openStepEdit(goalId, step) {
    setSelection(createSelection('edit', 'step', { ...step, goalId }, { id: step.id }))
  }

  function openReleaseCreate() {
    setSelection(createSelection('create', 'release', { name: '', dueDate: '' }))
  }

  function openReleaseEdit(release) {
    setSelection(createSelection('edit', 'release', { ...release }, { id: release.id }))
  }

  function openStoryCreate(releaseId, stepId) {
    setSelection(createSelection('create', 'story', { name: '', stepId, releaseId, priority: 'medium' }))
  }

  function openStoryEdit(story) {
    const entity = getEntity(board, 'story', story.id)
    if (!entity) return
    setSelection(createSelection('edit', 'story', { ...entity }, { id: entity.id }))
  }

  function startDrag(type, id) {
    setDragState({ type, id })
  }

  function endDrag() {
    setDragState(null)
  }

  function dropGoal(targetGoalId) {
    if (!dragState || dragState.type !== 'goal') return
    setBoard((current) => moveGoal(current, dragState.id, targetGoalId))
    setDragState(null)
  }

  function dropGoalToEnd() {
    if (!dragState || dragState.type !== 'goal') return
    setBoard((current) => moveGoalToEnd(current, dragState.id))
    setDragState(null)
  }

  function dropStep(target) {
    if (!dragState || dragState.type !== 'step') return
    setBoard((current) => moveStep(current, dragState.id, target))
    setDragState(null)
  }

  function dropStory(target) {
    if (!dragState || dragState.type !== 'story') return
    setBoard((current) => moveStory(current, dragState.id, target))
    setDragState(null)
  }

  const actions = {
    resetBoard,
    openGoalCreate,
    openGoalEdit,
    deleteGoal: (id) => handleDelete('goal', id),
    openStepCreate,
    openStepEdit,
    deleteStep: (id) => handleDelete('step', id),
    openReleaseCreate,
    openReleaseEdit,
    deleteRelease: (id) => handleDelete('release', id),
    openStoryCreate,
    openStoryEdit,
    deleteStory: (id) => handleDelete('story', id),
    startDrag,
    endDrag,
    dropGoal,
    dropGoalToEnd,
    dropStep,
    dropStory,
  }

  return (
    <div className={`app-shell ${selection ? 'has-sidebar' : ''}`}>
      <BoardPanel board={board} columns={columns} selection={selection} actions={actions} />
      <DetailsPanel
        selection={selection}
        goals={board.goals}
        steps={steps}
        releases={board.releases}
        onChange={(patch) =>
          setSelection((current) => (current ? { ...current, draft: { ...current.draft, ...patch } } : current))
        }
        onSubmit={submitSelection}
        onCancel={() => setSelection(null)}
        onDelete={() => selection && handleDelete(selection.type, selection.id)}
      />
    </div>
  )
}
