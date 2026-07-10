import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BoardPanel } from './BoardPanel'
import { DetailsPanel } from './DetailsPanel'
import {
  boardReset,
  entityDeleted,
  goalAdded,
  goalMoved,
  goalMovedToEnd,
  goalUpdated,
  releaseAdded,
  releaseUpdated,
  selectBoard,
  selectColumns,
  selectReleases,
  selectSteps,
  stepAdded,
  stepMoved,
  stepUpdated,
  storyAdded,
  storyMoved,
  storyUpdated,
} from '../store/boardSlice'
import {
  dragEnded,
  dragStarted,
  selectDragState,
  selectSelection,
  selectionCleared,
  selectionDraftPatched,
  selectionSet,
  selectionSynced,
} from '../store/uiSlice'
import { getEntity, goalPalette, PLANNED_RELEASE_ID } from '../model/board'

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
  const dispatch = useDispatch()
  const board = useSelector(selectBoard)
  const columns = useSelector(selectColumns)
  const steps = useSelector(selectSteps)
  const releases = useSelector(selectReleases)
  const selection = useSelector(selectSelection)
  const dragState = useSelector(selectDragState)
  useEffect(() => {
    if (!selection || selection.mode !== 'edit') return

    const liveEntity = getEntity(board, selection.type, selection.id)
    if (!liveEntity) {
      dispatch(selectionCleared())
      return
    }

    dispatch(selectionSynced(liveEntity))
  }, [board, dispatch, selection?.id, selection?.mode, selection?.type])

  function submitSelection(event) {
    event.preventDefault()
    if (!selection) return

    const draft = normalizeDraft(selection.type, selection.draft)
    if (!draft) return

    if (selection.mode === 'create') {
      if (selection.type === 'goal') dispatch(goalAdded(draft))
      if (selection.type === 'step') dispatch(stepAdded(draft))
      if (selection.type === 'story') dispatch(storyAdded(draft))
      if (selection.type === 'release') dispatch(releaseAdded(draft))
      dispatch(selectionCleared())
      return
    }

    if (selection.type === 'goal') dispatch(goalUpdated({ id: selection.id, draft }))
    if (selection.type === 'step') dispatch(stepUpdated({ id: selection.id, draft }))
    if (selection.type === 'story') dispatch(storyUpdated({ id: selection.id, draft }))
    if (selection.type === 'release') dispatch(releaseUpdated({ id: selection.id, draft }))
    dispatch(selectionCleared())
  }

  function handleDelete(type, id) {
    dispatch(entityDeleted({ type, id }))
    if (selection?.type === type && selection?.id === id) {
      dispatch(selectionCleared())
    }
  }

  const actions = {
    resetBoard: () => {
      dispatch(boardReset())
      dispatch(selectionCleared())
      dispatch(dragEnded())
    },
    openGoalCreate: () =>
      dispatch(selectionSet(createSelection('create', 'goal', { name: '', color: goalPalette[board.goals.length % goalPalette.length] }))),
    openGoalEdit: (goal) => dispatch(selectionSet(createSelection('edit', 'goal', { ...goal }, { id: goal.id }))),
    deleteGoal: (id) => handleDelete('goal', id),
    openStepCreate: (goalId) => dispatch(selectionSet(createSelection('create', 'step', { name: '', goalId }))),
    openStepEdit: (goalId, step) => dispatch(selectionSet(createSelection('edit', 'step', { ...step, goalId }, { id: step.id }))),
    deleteStep: (id) => handleDelete('step', id),
    openReleaseCreate: () => dispatch(selectionSet(createSelection('create', 'release', { name: '', dueDate: '' }))),
    openReleaseEdit: (release) => dispatch(selectionSet(createSelection('edit', 'release', { ...release }, { id: release.id }))),
    deleteRelease: (id) => handleDelete('release', id),
    openStoryCreate: (releaseId, stepId) =>
      dispatch(selectionSet(createSelection('create', 'story', { name: '', stepId, releaseId, priority: 'medium' }))),
    openStoryEdit: (story) => {
      const entity = getEntity(board, 'story', story.id)
      if (!entity) return
      dispatch(selectionSet(createSelection('edit', 'story', { ...entity }, { id: entity.id })))
    },
    deleteStory: (id) => handleDelete('story', id),
    startDrag: (type, id) => dispatch(dragStarted({ type, id })),
    endDrag: () => dispatch(dragEnded()),
    dropGoal: (targetGoalId) => {
      if (!dragState || dragState.type !== 'goal') return
      dispatch(goalMoved({ movingId: dragState.id, targetGoalId }))
      dispatch(dragEnded())
    },
    dropGoalToEnd: () => {
      if (!dragState || dragState.type !== 'goal') return
      dispatch(goalMovedToEnd({ movingId: dragState.id }))
      dispatch(dragEnded())
    },
    dropStep: (target) => {
      if (!dragState || dragState.type !== 'step') return
      dispatch(stepMoved({ movingId: dragState.id, target }))
      dispatch(dragEnded())
    },
    dropStory: (target) => {
      if (!dragState || dragState.type !== 'story') return
      dispatch(storyMoved({ movingId: dragState.id, target }))
      dispatch(dragEnded())
    },
  }

  return (
    <div className={`app-shell ${selection ? 'has-sidebar' : ''}`}>
      <BoardPanel board={board} columns={columns} selection={selection} actions={actions} />
      <DetailsPanel
        selection={selection}
        goals={board.goals}
        steps={steps}
        releases={releases}
        onChange={(patch) => dispatch(selectionDraftPatched(patch))}
        onSubmit={submitSelection}
        onCancel={() => dispatch(selectionCleared())}
        onDelete={() => selection && handleDelete(selection.type, selection.id)}
      />
    </div>
  )
}
