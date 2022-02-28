import { applyMiddleware, combineReducers, createStore } from "redux";
import thunkMiddleware from 'redux-thunk'
import {gameReducer} from './reducers/game';

const allReduces = combineReducers(
	{
		gameReducer
	}
);

type AllReducersType = typeof allReduces;
export type AppStateType = ReturnType<AllReducersType>;

type PropertiesTypes<T> = T extends {[key: string]: infer U} ? U : never;
export type InferActionsTypes<T extends {[key: string]: (...args: any[]) => any}> = ReturnType<PropertiesTypes<T>>;

export const store = createStore(allReduces, applyMiddleware(thunkMiddleware));

declare global {
	interface Window {
		store: typeof store;
	}
}


window.store = store;