
export enum GestureState {
  IDLE = 'IDLE',
  OPEN_PALM = 'OPEN_PALM',
  CLENCHED_FIST = 'CLENCHED_FIST',
  FINGERS = 'FINGERS'
}

export interface HandData {
  gesture: GestureState;
  fingerCount: number;
  x: number;
  y: number;
}
