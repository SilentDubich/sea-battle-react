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
const allLoc: Array<string> = [];
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
		if (!shipLocations) return createShips(fieldSize);
		const ship: ShipType = {
			hits: [],
			size: possibleShip
		};

		shipLocations.forEach(shipLocation => {
			shipsParams.locations[shipLocation] = i;
		});

		shipsParams.ships[i] = ship;
	});
	// @ts-ignore
	console.log('allLoc', allLoc.sort((a, b) => b - a))
	return shipsParams;
};


const createShip = (shipSize: number, possibleLocations: Array<string>, fieldSize: FieldSizeType) => {
	if (!fieldSize || !shipSize || !possibleLocations) return null;
	const { ver, hor } = getLocationsMap(possibleLocations);
	const updatedVer: VariantsToPlaceShipsType = getVariantsToPlaceShip(ver, shipSize);
	const updatedHor: VariantsToPlaceShipsType = getVariantsToPlaceShip(hor, shipSize);
	if (!updatedVer && !updatedHor) return null;
	const verKeys = Object.keys(updatedVer);
	const horKeys = Object.keys(updatedHor);

	const row = Math.floor(Math.random() * horKeys.length);
	const col = Math.floor(Math.random() * verKeys.length);
	const verticalVariants = updatedVer[verKeys[col]];
	const horizontalVariants = updatedHor[horKeys[row]];
	const randomVerticalVariantIndex = Math.floor(Math.random() * verticalVariants.length);
	const randomHorizontalVariantIndex = Math.floor(Math.random() * horizontalVariants.length);
	const isVertical = Math.random() >= .5;
	const locationToPlace = (() => {
		if (isVertical) {
			const variants = verticalVariants[randomVerticalVariantIndex];
			return variants.map(variant => `${ variant }${ col }`);
		}
		const variants = horizontalVariants[randomHorizontalVariantIndex];
		return variants.map(variant => `${ row }${ variant }`);
	})();

	const borders: Array<string> = [];
	locationToPlace.forEach((locationCoordination, i) => {
		const firstNumber = +locationCoordination[0];
		const secondNumber = +locationCoordination[1];
		const isFirst = i === 0;
		const isLast = i === locationToPlace.length - 1;
		const secondNumberLeft = secondNumber - 1;
		const secondNumberRight = secondNumber + 1;
		const firstNumberTop = firstNumber - 1;
		const firstNumberBottom = firstNumber + 1;
		const isValid = (first: number, second: number) => {
			if (first < 0 || first >= 10) return false;
			if (second < 0 || second >= 10) return false;
			return true;
		};
		if (isVertical) {
			if (isFirst || isLast) {
				const value = isFirst ? firstNumberTop : firstNumberBottom;
				isValid(value, secondNumber) && borders.push(`${ value }${ secondNumber }`);
				isValid(value, secondNumberLeft) && borders.push(`${ value }${ secondNumberLeft }`);
				isValid(value, secondNumberRight) && borders.push(`${ value }${ secondNumberRight }`);
			}

			const borderLeft = `${ firstNumber }${ secondNumberLeft }`;
			const borderRight = `${ firstNumber }${ secondNumberRight }`;
			isValid(firstNumber, secondNumberLeft) && borders.push(borderLeft);
			isValid(firstNumber, secondNumberRight) && borders.push(borderRight);

		}
		else {
			if (isFirst || isLast) {
				const value = isFirst ? secondNumberLeft : secondNumberRight;
				isValid(firstNumber, value) && borders.push(`${ firstNumber }${ value }`);
				isValid(firstNumberTop, value) && borders.push(`${ firstNumberTop }${ value }`);
				isValid(firstNumberBottom, value) && borders.push(`${ firstNumberBottom }${ value }`);
			}
			const borderTop = `${ firstNumberTop }${ secondNumber }`;
			const borderBottom = `${ firstNumberBottom }${ secondNumber }`;
			isValid(firstNumberTop, secondNumberLeft) && borders.push(borderTop);
			isValid(firstNumberBottom, secondNumberRight) && borders.push(borderBottom);

		}
	});
	const locationsToDelete = [ ...borders, ...locationToPlace ];
	console.group();
	console.log('locationsToDelete', locationsToDelete);
	console.log('borders', borders);
	console.log('locationToPlace', locationToPlace);
	console.log('isVertical', isVertical);
	console.log('possibleLocations', [ ...possibleLocations ]);

	locationsToDelete.forEach(locationToDelete => {
		const index = possibleLocations.findIndex(possibleLocation => possibleLocation === locationToDelete);
		if (index !== -1) possibleLocations.splice(index, 1);
	});
	console.log('possibleLocations', possibleLocations);
	console.groupEnd();
	allLoc.push(...locationToPlace);
	return locationToPlace;
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

const getPossibleLocationsToPlaceShip = (shipSize: number, locationsMap: Array<number>): Array<Array<number>> | null => {
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

type VariantsToPlaceShipsType = {
	[key:string]: Array<Array<number>>
};

const getVariantsToPlaceShip = (locations: LocationsMapType, shipSize: number): VariantsToPlaceShipsType => {
	const variantsToPlaceShips: VariantsToPlaceShipsType = {};
	for (const [ key, value ] of Object.entries(locations)) {
		const variantsToPlace = getPossibleLocationsToPlaceShip(shipSize, value);
		if (variantsToPlace && variantsToPlace.length) variantsToPlaceShips[key] = variantsToPlace;
	}
	return variantsToPlaceShips;
};