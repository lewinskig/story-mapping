import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BoardPanel } from '../../features/story-map-board/ui/BoardPanel'
import { DetailsPanel } from '../../features/story-map-details/ui/DetailsPanel'
import { getStoryMapEntity } from '../../entities/story-map/domain/services/entityLookup'
import { goalPalette, PLANNED_RELEASE_ID } from '../../entities/story-map/domain/constants'
import {
  selectStoryMap,
  selectStoryMapColumns,
  selectStoryMapReleases,
  selectStoryMapSteps,
} from '../../entities/story-map/domain/selectors/storyMapSelectors'
import {
  goalAdded,
  goalDeleted,
  goalMoved,
  goalMovedToEnd,
  goalUpdated,
  releaseAdded,
  releaseDeleted,
  releaseUpdated,
  stepAdded,
  stepDeleted,
  stepMoved,
  stepUpdated,
  storyAdded,
  storyDeleted,
  storyMoved,
  storyUpdated,
  storyMapReset,
} from '../../entities/story-map/application/storyMapSlice'
import {
  dragEnded,
  dragStarted,
  selectDragState,
  selectSelection,
  selectionCleared,
  selectionDraftPatched,
  selectionSet,
  selectionSynced,
} from '../../entities/story-map/application/storyMapUiSlice'

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
  const storyMap = useSelector(selectStoryMap)
  const columns = useSelector(selectStoryMapColumns)
  const steps = useSelector(selectStoryMapSteps)
  const releases = useSelector(selectStoryMapReleases)
  const selection = useSelector(selectSelection)
  const dragState = useSelector(selectDragState)

  useEffect(() => {
    if (!selection || selection.mode !== 'edit') return

    const liveEntity = getStoryMapEntity(storyMap, selection.type, selection.id)
    if (!liveEntity) {
      dispatch(selectionCleared())
      return
    }

    dispatch(selectionSynced(liveEntity))
  }, [dispatch, selection?.id, selection?.mode, selection?.type, storyMap])

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

  function openGoalCreate() {
    dispatch(selectionSet(createSelection('create', 'goal', { name: '', color: goalPalette[storyMap.goals.length % goalPalette.length] })))
  }

  function openGoalEdit(goal) {
    dispatch(selectionSet(createSelection('edit', 'goal', { ...goal }, { id: goal.id })))
  }

  function openStepCreate(goalId) {
    dispatch(selectionSet(createSelection('create', 'step', { name: '', goalId })))
  }

  function openStepEdit(goalId, step) {
    dispatch(selectionSet(createSelection('edit', 'step', { ...step, goalId }, { id: step.id })))
  }

  function openReleaseCreate() {
    dispatch(selectionSet(createSelection('create', 'release', { name: '', dueDate: '' })))
  }

  function openReleaseEdit(release) {
    dispatch(selectionSet(createSelection('edit', 'release', { ...release }, { id: release.id })))
  }

  function openStoryCreate(releaseId, stepId) {
    dispatch(selectionSet(createSelection('create', 'story', { name: '', stepId, releaseId, priority: 'medium' })))
  }

  function openStoryEdit(story) {
    const entity = getStoryMapEntity(storyMap, 'story', story.id)
    if (!entity) return
    dispatch(selectionSet(createSelection('edit', 'story', { ...entity }, { id: entity.id })))
  }

  function deleteGoal(id) {
    dispatch(goalDeleted({ id }))
    if (selection?.type === 'goal' && selection?.id === id) dispatch(selectionCleared())
  }

  function deleteStep(id) {
    dispatch(stepDeleted({ id }))
    if (selection?.type === 'step' && selection?.id === id) dispatch(selectionCleared())
  }

  function deleteStory(id) {
    dispatch(storyDeleted({ id }))
    if (selection?.type === 'story' && selection?.id === id) dispatch(selectionCleared())
  }

  function deleteRelease(id) {
    dispatch(releaseDeleted({ id }))
    if (selection?.type === 'release' && selection?.id === id) dispatch(selectionCleared())
  }

  const actions = {
    resetBoard: () => {
      dispatch(storyMapReset())
      dispatch(selectionCleared())
      dispatch(dragEnded())
    },
    openGoalCreate,
    openGoalEdit,
    deleteGoal,
    openStepCreate,
    openStepEdit,
    deleteStep,
    openReleaseCreate,
    openReleaseEdit,
    deleteRelease,
    openStoryCreate,
    openStoryEdit,
    deleteStory,
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
      <BoardPanel storyMap={storyMap} columns={columns} selection={selection} actions={actions} />
      <DetailsPanel
        selection={selection}
        goals={storyMap.goals}
        steps={steps}
        releases={releases}
        onChange={(patch) => dispatch(selectionDraftPatched(patch))}
        onSubmit={submitSelection}
        onCancel={() => dispatch(selectionCleared())}
        onDelete={() => selection && actions[`delete${selection.type.charAt(0).toUpperCase()}${selection.type.slice(1)}`]?.(selection.id)}
      />
    </div>
  )
}
