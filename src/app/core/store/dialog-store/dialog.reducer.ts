// import {createReducer, on} from '@ngrx/store';
// import {DialogState} from './dialog.state';
// import * as DialogActions from './dialog.actions.ts';
//
// export const initialDialogState: DialogState = {
//   dialogText: null,
//   notification: null,
// }
//
// export const dialogReducer= createReducer(
//   initialDialogState,
//   on(DialogActions.showDialog, (state, { text }) => ({ ...state, dialogText: text })),
//   on(DialogActions.clearDialog, (state) => ({ ...state, dialogText: null })),
//   on(DialogActions.showNotifications, (state, { text }) => ({ ...state, notification: state.notification })),
//   on(DialogActions.clearNotifications, (state) => ({ ...state, notification: null})),
// );
