import { STORAGE_KEY } from '../../domain/constants'
import { defaultStoryMap } from '../../domain/seed/defaultStoryMap'

export function loadStoryMapState() {
  const saved = window.localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return defaultStoryMap
  }

  try {
    const parsed = JSON.parse(saved)
    return isValidStoryMap(parsed) ? parsed : defaultStoryMap
  } catch {
    return defaultStoryMap
  }
}

export function saveStoryMapState(storyMap) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storyMap))
}

function isValidStoryMap(value) {
  return Boolean(value && Array.isArray(value.goals) && Array.isArray(value.releases))
}
