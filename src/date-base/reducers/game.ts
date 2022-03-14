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
	shipsParams: ShipsParamsType,
	shoots?: {
		[key: string]: number | null
	}
};

export type ShipType = {
	size: number,
	hits: Array<string>
};

export const gameActions = {
	setMode: (mode: ModeType) => ({ type: 'SET_MODE', mode } as const),
	setFieldSize: (fieldSize: FieldSizeType) => ({ type: 'SET_FIELD_SIZE', fieldSize } as const),
	setDifficulty: (difficulty: DifficultyType) => ({ type: 'SET_DIFFICULTY', difficulty } as const),
	back: () => ({ type: 'BACK' } as const),
	setPlayerShips: () => ({ type: 'SET_PLAYER_SHIPS' } as const),
	setBotShips: () => ({ type: 'SET_BOT_SHIPS' } as const),
	startGame: () => ({ type: 'START_GAME' } as const),
	shootToBot: (field: string) => ({ type: 'SHOOT_TO_BOT', field } as const),
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

export const gameReducer = (state: GameStateType = defaultState, action: GameActionType): GameStateType => {
	const { mode, difficulty, isStarted, fieldSize, bot, player } = state;
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
			return { ...state, player: { shipsParams: createShips(fieldSize) }  };
		case 'SET_BOT_SHIPS':
			return { ...state, bot: { shipsParams: createShips(fieldSize) } };
		case 'START_GAME':
			return { ...state, isStarted: true, bot: { shipsParams: createShips(fieldSize) } };
		case 'SHOOT_TO_BOT':
			if (!player || !bot) return state;
			const tempPlayer: PlayerType = JSON.parse(JSON.stringify(player));
			const tempBot: PlayerType = JSON.parse(JSON.stringify(bot));
			const field = action.field;
			const botShips = tempBot.shipsParams.locations;
			if (!tempPlayer.shoots || !tempPlayer.hasOwnProperty('shoots')) tempPlayer.shoots = {};
			if (tempPlayer.shoots.hasOwnProperty(field)) return state;
			const ship = botShips[field] !== undefined ? botShips[field] : null;
			tempPlayer.shoots[field] = ship;
			if (ship !== null) {
				const shipInShips = tempBot.shipsParams.ships[ship];
				const hits = shipInShips.hits;
				hits.push(field);
				if (hits.length === shipInShips.size) {
					const isVertical = (() => {
						if (shipInShips.size === 1) return false;
						const firstLocation = +hits[0];
						const secondLocation = +hits[1];
						return (secondLocation - firstLocation) % 10 === 0;
					})();
					const borders = getBorders(hits, isVertical);
					borders.forEach(border => {
						if (!tempPlayer.shoots || !tempPlayer.hasOwnProperty('shoots')) tempPlayer.shoots = {};
						tempPlayer.shoots[border] = null;
					});
				}
			}
			return { ...state, player: tempPlayer, bot: tempBot };
		default:
			return state;
	}
}

const getPossibleShips = (fieldSize: FieldSizeType): Array<number> | null => {
	if (fieldSize === 8) return [ 3, 2, 2, 2, 1, 1, 1 ];
	if (fieldSize === 10) return [ 4, 3, 3, 2, 2, 2, 1, 1, 1, 1 ];
	return null;
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

const createShips = (fieldSize: FieldSizeType): ShipsParamsType => {
	const shipsParams: ShipsParamsType = {
		locations: {},
		ships: {}
	};
	if (!fieldSize) return shipsParams;
	const possibleLocations = getPossibleLocations(fieldSize);
	const possibleShips = getPossibleShips(fieldSize);
	if (!possibleShips) return shipsParams;
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
	return shipsParams;
};

const createShip = (shipSize: number, possibleLocations: Array<string>, fieldSize: FieldSizeType) => {
	if (!fieldSize || !shipSize || !possibleLocations) return null;
	const { colLoc, rowLoc } = getLocationsMap(possibleLocations);

	const updatedColLoc: VariantsToPlaceShipsType = getVariantsToPlaceShip(colLoc, shipSize);
	const updatedRowLoc: VariantsToPlaceShipsType = getVariantsToPlaceShip(rowLoc, shipSize);
	if (!updatedColLoc && !updatedRowLoc) return null;
	const colLocKeys = Object.keys(updatedColLoc);
	const rowLocKeys = Object.keys(updatedRowLoc);

	const row = Math.floor(Math.random() * rowLocKeys.length);
	const col = Math.floor(Math.random() * colLocKeys.length);
	const rowKey = rowLocKeys[row];
	const colKey = colLocKeys[col];
	const colVariants = updatedColLoc[colKey];
	const rowVariants = updatedRowLoc[rowKey];
	const randomColVariantIndex = Math.floor(Math.random() * colVariants.length);
	const randomRowVariantIndex = Math.floor(Math.random() * rowVariants.length);
	const isVertical = Math.random() >= .5;
	const locationToPlace = (() => {
		if (isVertical) {
			const variants = colVariants[randomColVariantIndex];
			return variants.map(variant => `${ variant }${ colKey }`);
		}
		const variants = rowVariants[randomRowVariantIndex];
		return variants.map(variant => `${ rowKey }${ variant }`);
	})();

	const borders: Array<string> = getBorders(locationToPlace, isVertical);

	const locationsToDelete = [ ...borders, ...locationToPlace ];
	locationsToDelete.forEach(locationToDelete => {
		const index = possibleLocations.findIndex(possibleLocation => possibleLocation === locationToDelete);
		if (index !== -1) possibleLocations.splice(index, 1);
	});
	return locationToPlace;
};

const getBorders = (locationToPlace: Array<string>, isVertical: boolean) => {
	const borders: Array<string> = [];
	locationToPlace.forEach((locationCoordination, i) => {
		const rowNumber = +locationCoordination[0];
		const colNumber = +locationCoordination[1];

		const isFirst = i === 0;
		const isLast = i === locationToPlace.length - 1;

		const colNumberLeft = colNumber - 1;
		const colNumberRight = colNumber + 1;
		const rowNumberTop = rowNumber - 1;
		const rowNumberBottom = rowNumber + 1;
		const isValid = (row: number, col: number) => {
			if (row < 0 || row >= 10) return false;
			if (col < 0 || col >= 10) return false;
			return true;
		};
		if (isVertical) {
			if (isFirst) {
				const value = rowNumberTop;
				isValid(value, colNumber) && borders.push(`${ value }${ colNumber }`);
				isValid(value, colNumberLeft) && borders.push(`${ value }${ colNumberLeft }`);
				isValid(value, colNumberRight) && borders.push(`${ value }${ colNumberRight }`);
			}

			if (isLast) {
				const value = rowNumberBottom;
				isValid(value, colNumber) && borders.push(`${ value }${ colNumber }`);
				isValid(value, colNumberLeft) && borders.push(`${ value }${ colNumberLeft }`);
				isValid(value, colNumberRight) && borders.push(`${ value }${ colNumberRight }`);
			}

			const borderLeft = `${ rowNumber }${ colNumberLeft }`;
			const borderRight = `${ rowNumber }${ colNumberRight }`;
			isValid(rowNumber, colNumberLeft) && borders.push(borderLeft);
			isValid(rowNumber, colNumberRight) && borders.push(borderRight);

		}
		else {
			if (isFirst) {
				const value = colNumberLeft;
				isValid(rowNumber, value) && borders.push(`${ rowNumber }${ value }`);
				isValid(rowNumberTop, value) && borders.push(`${ rowNumberTop }${ value }`);
				isValid(rowNumberBottom, value) && borders.push(`${ rowNumberBottom }${ value }`);
			}
			if (isLast) {
				const value = colNumberRight;
				isValid(rowNumber, value) && borders.push(`${ rowNumber }${ value }`);
				isValid(rowNumberTop, value) && borders.push(`${ rowNumberTop }${ value }`);
				isValid(rowNumberBottom, value) && borders.push(`${ rowNumberBottom }${ value }`);
			}
			const borderTop = `${ rowNumberTop }${ colNumber }`;
			const borderBottom = `${ rowNumberBottom }${ colNumber }`;
			isValid(rowNumberTop, colNumber) && borders.push(borderTop);
			isValid(rowNumberBottom, colNumber) && borders.push(borderBottom);
		}
	});
	return borders;
};

type LocationsMapType = {
	[key:number]: Array<number>
};

const getLocationsMap = (possibleLocations: Array<string>): { rowLoc: LocationsMapType, colLoc: LocationsMapType } => {
	const rowLoc: LocationsMapType = {};
	const colLoc: LocationsMapType = {};
	possibleLocations.forEach(possibleLocation => {
		const rowNumber = +possibleLocation[0];
		const colNumber = +possibleLocation[1];
		if (!rowLoc.hasOwnProperty(rowNumber)) rowLoc[rowNumber] = [];
		if (!colLoc.hasOwnProperty(colNumber)) colLoc[colNumber] = [];
		rowLoc[rowNumber].push(colNumber);
		colLoc[colNumber].push(rowNumber);
	});
	return { rowLoc, colLoc };
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