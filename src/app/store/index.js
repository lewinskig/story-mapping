import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from './rootReducer'
import { saveStoryMapState } from '../../entities/story-map/infrastructure/persistence/boardStorage'

export const store = configureStore({
  reducer: rootReducer,
})

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    saveStoryMapState(store.getState().storyMap.board)
  })
}
