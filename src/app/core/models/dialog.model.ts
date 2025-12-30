export type DialogType =
  | 'info'
  | 'warning'
  | 'error'
  | 'powerup';

export interface DialogIntent {
  type: DialogType;
  message: string;
  durationMs?: number;
}
