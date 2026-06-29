/**
 * Zustand store root.
 *
 * Each feature slice is defined in its own file and re-exported here.
 * The auth slice is added in M2 (Authentication milestone).
 *
 * Pattern: use slices, not a single monolithic store.
 * Each slice: create<SliceState>()(devtools(persist(...), { name: 'ebfms-slice-name' }))
 */
export {};
