/**
 * Global Zustand store – thin re-export.
 * Implementation is split into slices under ./store/ (auth, trips, trip-detail, ui).
 */
export { useStore, profileToUser } from './store/index';
export type { AppState, CreateTripData, CreateActivityData } from './store/index';
