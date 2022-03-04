import {AppStateType, InferActionsTypes} from "../store";
import {ThunkAction} from "redux-thunk";

export type ModeType = 'SINGLE' | 'MULTIPLAYER' | null;
export type FieldSizeType = 8 | 10 | null;
export type DifficultyType = 'EASY' | 'NORMAL' | 'HARD' | 'VERY_HARD' | null;
export type IsStartedType = boolean;
export type ShipsLocationsType = {
	[key: string]: number
};
export type ShipsType = {
	[key: number]: ShipType
};
type ShipsParamsType = {
	locations: ShipsLocationsType,
	ships: ShipsType
};
export type PlayerType = {
	id: number,
	shipsParams: ShipsParamsType
};
export type ShipType = {
	size: number,
	hits: Array<number>
};

export const gameActions = {
	setMode: (mode: ModeType) => ({ type: 'SET_MODE', mode } as const),
	setFieldSize: (fieldSize: FieldSizeType) => ({ type: 'SET_FIELD_SIZE', fieldSize } as const),
	setDifficulty: (difficulty: DifficultyType) => ({ type: 'SET_DIFFICULTY', difficulty } as const),
	back: () => ({ type: 'BACK' } as const),
	setPlayerShips: () => ({ type: 'SET_PLAYER_SHIPS' } as const)
};

const getPossibleShips = (fieldSize: FieldSizeType): Array<number> => {
	if (fieldSize === 8) return [ 3, 2, 2, 2, 1, 1, 1 ];
	if (fieldSize === 10) return [ 4, 3, 3, 2, 2, 2, 1, 1, 1, 1 ];
	return [];
};

const getPossibleLocations = (fieldSize: FieldSizeType): Array<string> => {
	const locations: Array<string> = [];
	if (!fieldSize) return locations;
	for (let i = 0; i < fieldSize ** 2; i++) {
		const index = i < 10 ? '0' + i : i.toString();
		locations.push(index);
	}
	return locations;
};

type GameActionType = InferActionsTypes<typeof gameActions>;
export type GameThunkType = ThunkAction<Promise<void>, AppStateType, unknown, GameActionType>;

export type GameStateType = {
	mode: ModeType,
	fieldSize: FieldSizeType,
	difficulty: DifficultyType,
	isStarted: IsStartedType,
	player?: PlayerType,
	bot?: PlayerType
};


const defaultState = {
	mode: null as ModeType,
	fieldSize: null as FieldSizeType,
	difficulty: null as DifficultyType,
	isStarted: false as IsStartedType
};


export const gameReducer = (state = defaultState, action: GameActionType): GameStateType => {
	const { mode, difficulty, isStarted, fieldSize } = state;
	switch (action.type) {
		case 'SET_MODE':
			return { ...state, mode: action.mode };
		case 'SET_FIELD_SIZE':
			return { ...state, fieldSize: action.fieldSize };
		case 'SET_DIFFICULTY':
			return { ...state, difficulty: action.difficulty };
		case 'BACK':
			const [ propToChange, defaultValue ] = (() => {
				if (isStarted) return [ 'isStarted', false ];
				if (fieldSize) return [ 'fieldSize', null ];
				if (difficulty) return [ 'difficulty', null ];
				if (mode) return [ 'mode', null ];
				return [ null, null ];
			})();
			if (!propToChange) return state;
			return { ...state, [propToChange]: defaultValue };
		case 'SET_PLAYER_SHIPS':
			const shipsParams = createShips(fieldSize);
			console.log('shipsParams', shipsParams);
			return { ...state, player: { id: 1, shipsParams }};
		default:
			return state;
	}
}

const createShips = (fieldSize: FieldSizeType): ShipsParamsType => {
	const shipsParams: ShipsParamsType = {
		locations: {},
		ships: {}
	};
	if (!fieldSize) return shipsParams;
	const possibleLocations = getPossibleLocations(fieldSize);
	const possibleShips = getPossibleShips(fieldSize);
	possibleShips.forEach((possibleShip, i) => {
		const shipLocations: Array<string> | null = createShip(possibleShip, possibleLocations, fieldSize);
		// if (!shipLocations) console.log('oooops')
		// if (!shipLocations) return createShips(fieldSize);
		// const ship: ShipType = {
		// 	hits: [],
		// 	size: possibleShip
		// };
		//
		// shipLocations.forEach(shipLocation => {
		// 	shipsParams.locations[shipLocation] = i;
		// });
		//
		// shipsParams.ships[i] = ship;
	});
	return shipsParams;
};

const createShip = (shipSize: number, possibleLocations: Array<string>, fieldSize: FieldSizeType) => {
	if (!fieldSize || !shipSize || !possibleLocations) return null;
	const { ver, hor } = getLocationsMap(possibleLocations);
	type UpdatedVerType = {
		[key:string]: Array<Array<number>> | null
	}
	const updatedVer: UpdatedVerType = {};
	const updatedHor: UpdatedVerType = {};
	for (const [ key, value ] of Object.entries(ver)) {
		updatedVer[key] = getVariantsToPlaceShip(shipSize, value);
	}
	for (const [ key, value ] of Object.entries(hor)) {
		updatedHor[key] = getVariantsToPlaceShip(shipSize, value);
	}
	debugger
	return null;
	// let possibleDirections = getPossibleDirections(fieldSize, shipSize);
	// if (!possibleDirections) {
	// 	let tryCounter = 0;
	// 	while (tryCounter < 10) {
	// 		possibleDirections = getPossibleDirections(fieldSize, shipSize);
	// 		if (!possibleDirections) tryCounter++;
	// 		if (tryCounter > 10) return null;
	// 		if (possibleDirections) break;
	// 	}
	// }
	// if (!possibleDirections) return null;
	// const { generateDirections, row, col } = possibleDirections;
	//
	// const directionNumber = Math.floor(Math.random() * generateDirections.length);
	// const direction = generateDirections[directionNumber];
	// let generatedLocations = generateLocations(direction, row, col, shipSize, possibleLocations);
	// if (!generatedLocations) {
	// 	generateDirections.splice(directionNumber, 1);
	// 	if (!generateDirections.length) return null;
	// 	let tryCounter = 0;
	// 	while (tryCounter < 10) {
	// 		const directionNumber = Math.floor(Math.random() * generateDirections.length);
	// 		const direction = generateDirections[directionNumber];
	// 		generatedLocations = generateLocations(direction, row, col, shipSize, possibleLocations);
	// 		if (!generatedLocations) {
	// 			generateDirections.splice(directionNumber, 1);
	// 			tryCounter++;
	// 		}
	// 		if (generatedLocations) break;
	// 	}
	// }
	// if (!generatedLocations) return null;
	//
	// const { shipLocations, locationsToDelete } = generatedLocations;
	//
	// locationsToDelete.forEach(locationToDelete => {
	// 	const index = possibleLocations.findIndex(possibleLocation => possibleLocation === locationToDelete);
	// 	if (index !== -1) possibleLocations.splice(index, 1);
	// });
	//
	// return shipLocations;
};

type PossibleDirectionsType = {
	generateDirections: Array<string>,
	row: number,
	col: number
}

const getPossibleDirections = (fieldSize: FieldSizeType, shipSize: number): PossibleDirectionsType | null => {
	if (!fieldSize || !shipSize) return null;

	const row = Math.floor(Math.random() * fieldSize);
	const col = Math.floor(Math.random() * fieldSize);

	const generateDirections = [];
	const canGenerateUp = row - shipSize >= 0;
	const canGenerateLeft = col - shipSize >= 0;
	const canGenerateRight = col + shipSize < fieldSize;
	const canGenerateDown = row + shipSize < fieldSize;

	if (canGenerateUp) generateDirections.push('up');
	if (canGenerateRight) generateDirections.push('right');
	if (canGenerateDown) generateDirections.push('down');
	if (canGenerateLeft) generateDirections.push('left');
	return { generateDirections, row, col };
};

type LocationsMapType = {
	[key:number]: Array<number>
};

const getLocationsMap = (possibleLocations: Array<string>): { hor: LocationsMapType, ver: LocationsMapType } => {
	const hor: LocationsMapType = {};
	const ver: LocationsMapType = {};
	possibleLocations.forEach(possibleLocation => {
		const firstNumber = +possibleLocation[0];
		const secondNumber = +possibleLocation[1];
		if (!hor.hasOwnProperty(firstNumber)) hor[firstNumber] = [];
		if (!ver.hasOwnProperty(secondNumber)) ver[secondNumber] = [];
		hor[firstNumber].push(secondNumber);
		ver[secondNumber].push(firstNumber);
	});
	return { hor, ver };
};

const getVariantsToPlaceShip = (shipSize: number, locationsMap: Array<number>): Array<Array<number>> | null => {
	const variants: Array<Array<number>> = [];
	let temp: Array<number> = [];
	let prevValue: number = 0;
	locationsMap.forEach((locationMap, i) => {
		const isLast = i - 1 === locationsMap.length;
		prevValue = i;
		temp = [locationMap];
		if (isLast || shipSize === 1) {
			if (temp.length === shipSize) variants.push(temp);
		}
		else {
			for (let j = i + 1; j < locationsMap.length; j++) {
				const value = locationsMap[j];
				if (value - prevValue > 1) {
					temp = [];
				}
				else {
					temp.push(value);
					if (temp.length === shipSize) {
						variants.push(temp);
						break;
					}
				}
				prevValue = value;
			}
		}

	});
	return variants;
};

const generateLocations = (direction: string, row: number, col: number, shipSize: number, possibleLocations: Array<string>): { shipLocations: Array<string>, locationsToDelete: Array<string> } | null => {
	const shipLocations: Array<string> = [];
	const locationsToDelete: Array<string> = [];
	let upBorder, downBorder, leftBorder, rightBorder, upLeftBorder, upRightBorder, downLeftBorder, downRightBorder;
	console.group();
	console.log('direction', direction);
	console.log('row', row);
	console.log('col', col);
	console.log('shipSize', shipSize);
	console.log('possibleLocations', possibleLocations);
	console.groupEnd();
	switch (direction) {
		case 'up':
			upBorder = (row - shipSize).toString() + col.toString();
			upLeftBorder = (row - shipSize).toString() + (col - 1).toString();
			upRightBorder = (row - shipSize).toString() + (col + 1).toString();

			downBorder = (row + 1).toString() + col.toString();
			downLeftBorder = (row + 1).toString() + (col - 1).toString();
			downRightBorder = (row + 1).toString() + (col + 1).toString();

			locationsToDelete.push(upBorder, upLeftBorder, upRightBorder, downBorder, downLeftBorder, downRightBorder);
			for (let i = 0; i < shipSize; i++) {
				const location = (row - i).toString() + col.toString();
				console.log('(possibleLocations.indexOf(location) === -1', possibleLocations.indexOf(location) === -1)
				if (possibleLocations.indexOf(location) === -1) return null;
				leftBorder = (row - i).toString() + (col - 1).toString();
				rightBorder = (row - i).toString() + (col + 1).toString();

				shipLocations.push(location);
				locationsToDelete.push(location, leftBorder, rightBorder);
			}
			break;
		case 'right':
			leftBorder = row.toString() + (col - 1).toString();
			upLeftBorder = (row + 1).toString() + (col - 1).toString();
			downLeftBorder = (row - 1).toString() + (col - 1).toString();

			rightBorder = row.toString() + (col + shipSize).toString();
			upRightBorder = (row + 1).toString() + (col + shipSize).toString();
			downRightBorder = (row - 1).toString() + (col + shipSize).toString();

			locationsToDelete.push(leftBorder, upLeftBorder, downLeftBorder, rightBorder, upRightBorder, downRightBorder);
			for (let i = 0; i < shipSize; i++) {
				const location = row.toString() + (col + i).toString();
				console.log('(possibleLocations.indexOf(location) === -1', possibleLocations.indexOf(location) === -1)
				if (possibleLocations.indexOf(location) === -1) return null;
				upBorder = (row + 1).toString() + (col + i).toString();
				downBorder = (row - 1).toString() + (col + i).toString();

				shipLocations.push(location);
				locationsToDelete.push(location, upBorder, downBorder);
			}
			break;
		case 'down':
			upBorder = (row - 1).toString() + col.toString();
			upLeftBorder = (row - 1).toString() + (col - 1).toString();
			upRightBorder = (row - 1).toString() + (col + 1).toString();

			downBorder = (row + shipSize).toString() + col.toString();
			downLeftBorder = (row + shipSize).toString() + (col - 1).toString();
			downRightBorder = (row + shipSize).toString() + (col + 1).toString();

			locationsToDelete.push(upBorder, upLeftBorder, upRightBorder, downBorder, downLeftBorder, downRightBorder);
			for (let i = 0; i < shipSize; i++) {
				const location = (row + i).toString() + col.toString();
				console.log('(possibleLocations.indexOf(location) === -1', possibleLocations.indexOf(location) === -1)
				if (possibleLocations.indexOf(location) === -1) return null;
				leftBorder = (row + i).toString() + (col - 1).toString();
				rightBorder = (row + i).toString() + (col + 1).toString();

				shipLocations.push(location);
				locationsToDelete.push(location, leftBorder, rightBorder);
			}
			break;
		case 'left':
			leftBorder = row.toString() + (col - shipSize).toString();
			upLeftBorder = (row + 1).toString() + (col - shipSize).toString();
			downLeftBorder = (row - 1).toString() + (col - shipSize).toString();

			rightBorder = row.toString() + (col + 1).toString();
			upRightBorder = (row + 1).toString() + (col + 1).toString();
			downRightBorder = (row - 1).toString() + (col + 1).toString();

			locationsToDelete.push(leftBorder, upLeftBorder, downLeftBorder, rightBorder, upRightBorder, downRightBorder);
			for (let i = 0; i < shipSize; i++) {
				const location = row.toString() + (col - i).toString();
				console.log('(possibleLocations.indexOf(location) === -1', possibleLocations.indexOf(location) === -1)
				if (possibleLocations.indexOf(location) === -1) return null;
				upBorder = (row + 1).toString() + (col - i).toString();
				downBorder = (row - 1).toString() + (col - i).toString();

				shipLocations.push(location);
				locationsToDelete.push(location, upBorder, downBorder);
			}
			break;
		default: return null;
	}
	if (!shipLocations.length || !locationsToDelete.length) return null;
	return { shipLocations, locationsToDelete };
}