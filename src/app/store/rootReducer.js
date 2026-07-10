import { combineReducers } from '@reduxjs/toolkit'
import storyMapReducer from '../../entities/story-map/application/storyMapSlice'
import storyMapUiReducer from '../../entities/story-map/application/storyMapUiSlice'

export const rootReducer = combineReducers({
  storyMap: storyMapReducer,
  storyMapUi: storyMapUiReducer,
})
