import {AppStateType, InferActionsTypes} from "../store";
import {ThunkAction} from "redux-thunk";

export type ModeType = 'SINGLE' | 'MULTIPLAYER' | null;
export type FieldSizeType = 8 | 10 | null;
export type DifficultyType = 'EASY' | 'NORMAL' | 'HARD' | 'VERY_HARD' | null;


export const gameActions = {
	setMode: (mode: ModeType) => ({ type: 'SET_MODE', mode } as const),
	setFieldSize: (fieldSize: FieldSizeType) => ({ type: 'SET_FIELD_SIZE', fieldSize } as const),
	setDifficulty: (difficulty: DifficultyType) => ({ type: 'SET_DIFFICULTY', difficulty } as const),
	back: () => ({ type: 'BACK' } as const),
};

type GameActionType = InferActionsTypes<typeof gameActions>;
export type GameThunkType = ThunkAction<Promise<void>, AppStateType, unknown, GameActionType>;

const defaultState = {
	mode: null as ModeType,
	fieldSize: null as FieldSizeType,
	difficulty: null as DifficultyType,
	isStarted: false
};

export type GameStateType = typeof defaultState;



export const gameReducer = (state = defaultState, action: GameActionType): GameStateType => {
	switch (action.type) {
		case 'SET_MODE':
			return { ...state, mode: action.mode };
		case 'SET_FIELD_SIZE':
			return { ...state, fieldSize: action.fieldSize };
		case 'SET_DIFFICULTY':
			return { ...state, difficulty: action.difficulty };
		case 'BACK':
			const { mode, difficulty, isStarted, fieldSize } = state;
			const [ propToChange, defaultValue ] = (() => {
				if (isStarted) return [ 'isStarted', false ];
				if (fieldSize) return [ 'fieldSize', null ];
				if (difficulty) return [ 'difficulty', null ];
				if (mode) return [ 'mode', null ];
				return [ null, null ];
			})();
			if (!propToChange) return state;
			return { ...state, [propToChange]: defaultValue };
		default:
			return state;
	}
}