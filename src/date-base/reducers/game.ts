import {AppStateType, InferActionsTypes, store} from "../store";
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

export type ShipSizeType = 1 | 2 | 3 | 4;

export type ShipType = {
	size: ShipSizeType,
	hits: Array<string>
};

export type PlayerType = {
	shipsParams: ShipsParamsType,
	shoots?: {
		[key: string]: number | null
	}
};

type BattleDataType = {
	shoots?: {
		[key: string]: number | null
	},
	firstHitNotSunkShip?: string | null,
	lastShootCoord?: string | null,
	possibleShoots?: Array<string>
}

export type BotType = {
	shipsParams: ShipsParamsType,
	battleData?: BattleDataType
};

enum ProbabilitiesEnum {
	'EASY' = 0,
	'NORMAL' = 0.2,
	'HARD' = 0.5,
	'VERY_HARD' = 0.8
}

export const gameActions = {
	setMode: (mode: ModeType) => ({ type: 'SET_MODE', mode } as const),
	setFieldSize: (fieldSize: FieldSizeType) => ({ type: 'SET_FIELD_SIZE', fieldSize } as const),
	setDifficulty: (difficulty: DifficultyType) => ({ type: 'SET_DIFFICULTY', difficulty } as const),
	back: () => ({ type: 'BACK' } as const),
	setPlayerShips: () => ({ type: 'SET_PLAYER_SHIPS' } as const),
	setShipLocation: (locations: Array<string>, shipId: number) => ({ type: 'SET_SHIP_LOCATION', shipId, locations } as const),
	setBotShips: () => ({ type: 'SET_BOT_SHIPS' } as const),
	startGame: () => ({ type: 'START_GAME' } as const),
	isBlockShoot: (value: boolean) => ({ type: 'IS_BLOCK_SHOOT', value } as const),
	updatePlayer: (player: PlayerType | BotType, playerType: 'player' | 'bot') => ({ type: 'UPDATE_PLAYER', player, playerType } as const)
};

type GameActionType = InferActionsTypes<typeof gameActions>;

export type GameThunkType = ThunkAction<Promise<void>, AppStateType, unknown, GameActionType>;

export type GameStateType = {
	mode: ModeType,
	fieldSize: FieldSizeType,
	difficulty: DifficultyType,
	isStarted: IsStartedType,
	player?: PlayerType,
	bot?: BotType,
	isBlockShoot: boolean
};

const defaultState = {
	mode: null as ModeType,
	fieldSize: null as FieldSizeType,
	difficulty: null as DifficultyType,
	isStarted: false as IsStartedType,
	isBlockShoot: false as boolean
};

export const playerShootThunk = (field: string): GameThunkType => {
	return async (dispatch) => {
		dispatch(gameActions.isBlockShoot(true));
		const state: AppStateType = store.getState();
		const { gameReducer } = state;
		const { player, bot, fieldSize, difficulty } = gameReducer;
		if (!player || !bot) return;
		const tempPlayer: PlayerType = JSON.parse(JSON.stringify(player));
		const tempBot: BotType = JSON.parse(JSON.stringify(bot));
		const botShips = tempBot.shipsParams.locations;
		if (!tempPlayer.shoots || !tempPlayer.hasOwnProperty('shoots')) tempPlayer.shoots = {};
		if (tempPlayer.shoots.hasOwnProperty(field)) return;
		const ship = botShips[field] !== undefined ? botShips[field] : null;
		tempPlayer.shoots[field] = ship;
		if (ship !== null) {
			hitShip(tempBot, tempPlayer, field, ship);
			dispatch(gameActions.updatePlayer(tempPlayer, 'player'));
		}
		else {
			if (!tempBot.hasOwnProperty('battleData') || !tempBot.battleData) tempBot.battleData = {};
			if (!tempBot.battleData.hasOwnProperty('possibleShoots')) tempBot.battleData.possibleShoots = getPossibleLocations(fieldSize);
			if (!tempBot.battleData.hasOwnProperty('shoots')) tempBot.battleData.shoots = {};
			dispatch(gameActions.updatePlayer(tempPlayer, 'player'));
			await botShoot(tempPlayer, tempBot, fieldSize, difficulty);
		}
		dispatch(gameActions.updatePlayer(tempBot, 'bot'));
		dispatch(gameActions.isBlockShoot(false));
	};
};

export const gameReducer = (state: GameStateType = defaultState, action: GameActionType): GameStateType => {
	const { mode, difficulty, isStarted, fieldSize, player } = state;
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
		case 'UPDATE_PLAYER':
			return { ...state, [action.playerType]: action.player }
		case 'IS_BLOCK_SHOOT':
			return { ...state, isBlockShoot: action.value }
		case 'SET_SHIP_LOCATION':
			const shipParams: ShipsParamsType = player?.shipsParams || { ships: {}, locations: {} };
			const shipLocations = { ...shipParams.locations };
			const ships = { ...shipParams.ships };
			const { locations, shipId } = action;
			if (ships[shipId]) delete ships[shipId];

			for (const [ key, value ] of Object.entries(shipLocations)) {
				if (value === shipId) delete shipLocations[key];
			}

			if (shipLocations && locations.length) {
				locations.forEach(location => {
					shipLocations[location] = shipId;
				});
				ships[shipId] = { hits: [], size: 1 };

			}
			return {
				...state,
				player: {
					shipsParams: {
						ships,
						locations: shipLocations
					}
				}
			};
		default:
			return state;
	}
}

const botShoot = async (player: PlayerType, bot: BotType, fieldSize: FieldSizeType, difficulty: DifficultyType) => {
	if (!fieldSize) return;
	const { battleData } = bot;
	if (!battleData) return;
	const { firstHitNotSunkShip, lastShootCoord, possibleShoots, shoots } = battleData;
	if (!possibleShoots || !shoots) return;
	const { shipsParams } = player;
	const { locations, ships } = shipsParams;
	const getShip = (location: string): number | null => {
		return locations[location] !== undefined ? locations[location] : null;
	};
	const isValid = (value: string): boolean => possibleShoots.indexOf(value) !== -1;
	const getNewLocationVariants = (location: string): { top: string, bottom: string, left: string, right: string } => {
		const rowNumber = +location[0];
		const colNumber = +location[1];
		const top = (rowNumber - 1).toString() + `${ colNumber }`;
		const bottom = (rowNumber + 1).toString() + `${ colNumber }`;
		const left = `${ rowNumber }` + (colNumber - 1).toString();
		const right = `${ rowNumber }` + (colNumber + 1).toString();
		return { top, bottom, left, right };
	};
	return new Promise((resolve, reject) => {
		setTimeout(async () => {
			if (!firstHitNotSunkShip) {
				const probability = difficulty ? ProbabilitiesEnum[difficulty] : 0;
				const isForPlayerLocationShoot = Math.random() < probability;
				const dontDamagedShipsLocations = getNotDamagedShipsLocations(locations, possibleShoots);
				const targetLocations = isForPlayerLocationShoot ? dontDamagedShipsLocations : possibleShoots;
				const randomLocation = Math.floor(Math.random() * targetLocations.length);
				const field = targetLocations[randomLocation];
				const ship = getShip(field);
				shoots[field] = ship;
				if (ship !== null) battleData.firstHitNotSunkShip = field;
				await setResultBotShoot(player, bot, ship, battleData, field, fieldSize, difficulty, possibleShoots);
			}
			else {
				const { top, bottom, left, right } = getNewLocationVariants(firstHitNotSunkShip);
				const shipIndex = shoots[firstHitNotSunkShip] as number;
				const targetShip: ShipType = ships[shipIndex];
				const { hits } = targetShip;
				if (firstHitNotSunkShip === lastShootCoord || hits.length === 1) {
					const shootVariants = [];
					if (isValid(top)) shootVariants.push(top);
					if (isValid(bottom)) shootVariants.push(bottom);
					if (isValid(left)) shootVariants.push(left);
					if (isValid(right)) shootVariants.push(right);
					const shootIndex = Math.floor(Math.random() * shootVariants.length);
					const shoot = shootVariants[shootIndex];
					const ship = getShip(shoot);
					shoots[shoot] = ship;
					await setResultBotShoot(player, bot, ship, battleData, shoot, fieldSize, difficulty, possibleShoots);
				}
				else if (lastShootCoord) {
					const isSuccessShoot = shoots[lastShootCoord];
					const different = +firstHitNotSunkShip - (+lastShootCoord);
					const isTop = different >= fieldSize;
					const isBottom = different <= -fieldSize;
					const isLeft = different >= 1 && different < fieldSize;
					const isRight = different <= -1 && different > -fieldSize;
					const locationInDifferentDirection = ((): string | null => {
						if (isTop) return bottom;
						if (isBottom) return top;
						if (isLeft) return right;
						if (isRight) return left;
						return null;
					})();
					if (!isSuccessShoot && locationInDifferentDirection) {
						const ship = getShip(locationInDifferentDirection);
						shoots[locationInDifferentDirection] = ship;
						await setResultBotShoot(player, bot, ship, battleData, locationInDifferentDirection, fieldSize, difficulty, possibleShoots);
					}
					else if (isSuccessShoot) {
						const { top, bottom, left, right } = getNewLocationVariants(lastShootCoord);
						const nextLocation = ((): string | null => {
							if (isTop) return top;
							if (isBottom) return bottom;
							if (isLeft) return left;
							if (isRight) return right;
							return null;
						})();
						const validShoot = (() => {
							if (nextLocation && isValid(nextLocation)) return nextLocation;
							return locationInDifferentDirection;
						})();
						if (validShoot) {
							const ship = getShip(validShoot);
							shoots[validShoot] = ship;
							await setResultBotShoot(player, bot, ship, battleData, validShoot, fieldSize, difficulty, possibleShoots);
						}
					}
				}
			}
			resolve('success');
		}, 500);
	});
};

const setResultBotShoot = async (
	player: PlayerType,
	bot: BotType,
	ship: number | null,
	battleData: BattleDataType,
	shoot: string,
	fieldSize: FieldSizeType,
	difficulty: DifficultyType,
	possibleShoots: Array<string>
) => {
	possibleShoots.splice(possibleShoots.indexOf(shoot), 1);
	const dispatch = store.dispatch;
	if (ship === null) {
		battleData.lastShootCoord = shoot;
		dispatch(gameActions.updatePlayer(bot, 'bot'));
		return;
	}
	const isSunk = hitShip(player, bot, shoot, ship);
	if (isSunk) battleData.firstHitNotSunkShip = null;
	battleData.lastShootCoord = shoot;
	dispatch(gameActions.updatePlayer(bot, 'bot'));
	await botShoot(player, bot, fieldSize, difficulty);
};

const hitShip = (target: PlayerType | BotType, shooter: PlayerType | BotType, field: string, ship: number): boolean => {
	const shipInShips = target.shipsParams.ships[ship];
	const hits = shipInShips.hits;
	hits.push(field);
	const isSunk = hits.length === shipInShips.size;
	if (isSunk) {
		const isVertical = isVerticalShip(hits[0], hits[1]);
		const sortedHits = hits.sort((a, b) => +a - (+b));
		const borders = getBorders(sortedHits, isVertical);
		const isBot = (obj: any): obj is BotType => {
			return obj.hasOwnProperty('battleData');
		};
		borders.forEach(border => {
			if (isBot(shooter) && shooter.battleData && shooter.battleData.shoots) shooter.battleData.shoots[border] = null;
			else if (!isBot(shooter) && shooter.shoots) shooter.shoots[border] = null;

			if (isBot(shooter) && shooter.battleData) {
				const { possibleShoots } = shooter.battleData;
				if (possibleShoots) {
					const index = possibleShoots.indexOf(border);
					if (index !== -1) possibleShoots.splice(index, 1);
				}
			}
		});
	}
	return isSunk;
};

export const isVerticalShip = (firstLocation: string, secondLocation: string): boolean => {

	if (!secondLocation) return false;
	const firstLocationNumber = +firstLocation;
	const secondLocationNumber = +secondLocation;
	return (secondLocationNumber - firstLocationNumber) % 10 === 0;
};

export const getPossibleShips = (fieldSize: FieldSizeType): Array<number> | null => {
	if (fieldSize === 8) return [ 3, 2, 2, 2, 1, 1, 1 ];
	if (fieldSize === 10) return [ 4, 3, 3, 2, 2, 2, 1, 1, 1, 1 ];
	return null;
};

export const getPossibleLocations = (fieldSize: FieldSizeType): Array<string> => {
	const locations: Array<string> = [];
	if (!fieldSize) return locations;
	let rowNumber = 0;
	let colNumber = 0;
	for (let i = 0; i < fieldSize ** 2; i++) {
		const location = `${ rowNumber }${ colNumber }`;
		locations.push(location);
		const nextColNumber = colNumber + 1;
		if (nextColNumber === fieldSize) {
			rowNumber++;
			colNumber = 0;
		}
		else {
			colNumber++;
		}
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
		const shipLocations: Array<string> | null = createShip(possibleShip as ShipSizeType, possibleLocations, fieldSize);
		if (!shipLocations) return createShips(fieldSize);
		const ship: ShipType = {
			hits: [],
			size: possibleShip as ShipSizeType
		};

		shipLocations.forEach(shipLocation => {
			shipsParams.locations[shipLocation] = i;
		});

		shipsParams.ships[i] = ship;
	});
	return shipsParams;
};

const createShip = (shipSize: ShipSizeType, possibleLocations: Array<string>, fieldSize: FieldSizeType) => {
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

export const getBorders = (locationToPlace: Array<string>, isVertical: boolean) => {
	const borders: Array<string> = [];
	const bumperLocations: Array<string> = [];
	const firstLocation = locationToPlace[0];
	const lastLocation = locationToPlace.length > 1 ? locationToPlace[locationToPlace.length - 1] : firstLocation;
	const rowNumber = firstLocation[0];
	const colNumber = firstLocation[1];
	const locations = (() => {
		if (isVertical) return [ `${ (+lastLocation[0] + 1).toString() }${ colNumber }`, `${ (+firstLocation[0] - 1).toString() }${ colNumber }` ];
		else return [ `${ rowNumber }${ (+lastLocation[1] + 1).toString() }`, `${ rowNumber }${ (+firstLocation[1] - 1).toString() }` ];
	})();
	bumperLocations.push(...locations);
	borders.push(...locations);
	const allLocations: Array<string> = [ ...locationToPlace, ...bumperLocations ];
	allLocations.forEach((locationCoordination, i) => {
		const rowNumber = +locationCoordination[0];
		const colNumber = +locationCoordination[1];

		const colNumberLeft = colNumber - 1;
		const colNumberRight = colNumber + 1;
		const rowNumberTop = rowNumber - 1;
		const rowNumberBottom = rowNumber + 1;
		const bordersToPush = (() => {
			if (isVertical) return [ `${ rowNumber }${ colNumberLeft }`, `${ rowNumber }${ colNumberRight }` ];
			else return [ `${ rowNumberTop }${ colNumber }`, `${ rowNumberBottom }${ colNumber }` ];
		})();
		borders.push(...bordersToPush);
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

const getPossibleLocationsToPlaceShip = (shipSize: ShipSizeType, locationsMap: Array<number>): Array<Array<number>> | null => {
	const variants: Array<Array<number>> = [];
	let temp: Array<number> = [];
	let prevValue: number = 0;
	locationsMap.forEach((locationMap, i) => {
		const isLast = i === locationsMap.length - 1;
		prevValue = i;
		temp = [locationMap];
		if (isLast) {
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

const getVariantsToPlaceShip = (locations: LocationsMapType, shipSize: ShipSizeType): VariantsToPlaceShipsType => {
	const variantsToPlaceShips: VariantsToPlaceShipsType = {};
	for (const [ key, value ] of Object.entries(locations)) {
		const variantsToPlace = getPossibleLocationsToPlaceShip(shipSize, value);
		if (variantsToPlace && variantsToPlace.length) variantsToPlaceShips[key] = variantsToPlace;
	}
	return variantsToPlaceShips;
};

const getNotDamagedShipsLocations = (targetShips: ShipsLocationsType, possibleShoots: Array<string>): Array<string> => {
	const locations: Array<string> = [];
	possibleShoots.forEach(possibleShoot => {
		if (targetShips[possibleShoot] !== undefined) locations.push(possibleShoot);
	});
	return locations;
};