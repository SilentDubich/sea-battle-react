import React, {ReactElement, useCallback, useLayoutEffect, useRef, useState} from 'react';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import FieldPrepareCss from './field-prepare.module.css';
import {Field} from '../../../reusable/components/field/field';
import {useDispatch, useSelector} from 'react-redux';
import {
	gameActions,
	getBorders,
	getPossibleShips,
	isVerticalShip,
	ShipSizeType,
	ShipsLocationsType
} from '../../../date-base/reducers/game';
import {AppStateType} from '../../../date-base/store';
import {Ship} from './ship';

const shipsSelector = (state: AppStateType) => state.gameReducer.player?.shipsParams.ships;
const locationsSelector = (state: AppStateType) => state.gameReducer.player?.shipsParams.locations || null;
const fieldSizeSelector = (state: AppStateType) => state.gameReducer.fieldSize;

export const FieldPrepare = () => {
	const dispatch = useDispatch();
	const setPlayerShips = () => {
		dispatch(gameActions.setPlayerShips());
	};
	const startGame = () => {
		if (!isAllShipsPlaced) return;
		dispatch(gameActions.startGame());
	};
	const setShipLocation = (locations: Array<string>, shipId: number) => {
		dispatch(gameActions.setShipLocation(locations, shipId));
	};

	const fieldSize = useSelector(fieldSizeSelector);
	const ships = useSelector(shipsSelector);
	const playerShipsLocations: ShipsLocationsType | null = useSelector(locationsSelector);

	const buttonClasses = `${ ReusableCss.button }`;
	const possibleShips: Array<number> | null = getPossibleShips(fieldSize);
	let isAllShipsPlaced = false;
	if (ships) {
		if (possibleShips && ships && possibleShips.length === Object.keys(ships).length) isAllShipsPlaced = true;
	}
	const startGameClasses = `${ buttonClasses } ${ !isAllShipsPlaced && ReusableCss.disabled }`;
	const tempPlacedShips: {
		[key: number]: Array<string>
	} = {};
	const [ shipElsState, setShipElsState ] = useState<any>([]);
	const [ placedShips, setPlacedShips ] = useState<{[key: number]: Array<string>}>({});


	useLayoutEffect(() => {
		if (playerShipsLocations) {
			for (const [key, value] of Object.entries(playerShipsLocations)) {
				let locations = tempPlacedShips[value];
				if (!locations) tempPlacedShips[value] = [];
				tempPlacedShips[value].push(key);
				tempPlacedShips[value].sort((a, b) => +a - (+b));
			}
			setPlacedShips(tempPlacedShips);
		}
	}, [playerShipsLocations]);


	const fieldRef: any = useRef();
	type LocationsType = {[key: string]: number | null};
	const [ shootLocations, setShootLocations ] = useState<LocationsType | null>({});


	const getFieldMatches = useCallback((shipEls: any, fieldEls: any) => {
		const fieldMatchesIds: Array<string> = [];
		if (!shipEls || !fieldEls) return fieldMatchesIds;
		shipEls.forEach((shipEl: any) => {
			const { x: shipElX, y: shipElY } = shipEl.getBoundingClientRect();
			fieldEls.forEach((fieldEl: any) => {
				const { x: fieldElX, y: fieldElY, bottom, right } = fieldEl.getBoundingClientRect();
				const isInX = shipElX > fieldElX && shipElX < right;
				const isInY = shipElY > fieldElY && shipElY < bottom;
				if (isInX && isInY) fieldMatchesIds.push(fieldEl.id);
			});
		});
		return fieldMatchesIds;
	}, []);


	const getPresumptiveBorders = useCallback((shipRef: any, fieldRef: any, isVertical: boolean): LocationsType => {
		const shipEls = [ ...shipRef.children ];
		const fieldEl = fieldRef.current;
		const fieldEls = [ ...fieldEl.children ];
		const fieldMatchesIds: Array<string> = getFieldMatches(shipEls, fieldEls);
		const borders = getBorders(fieldMatchesIds, isVertical);
		const locations: LocationsType = {};
		borders.forEach(border => {
			const isLocation = fieldMatchesIds.find(fieldMatchesId => fieldMatchesId === border);
			const ship = playerShipsLocations && playerShipsLocations[border] !== undefined ? playerShipsLocations[border] : null;
			if (!isLocation) locations[border] = ship !== null && ship !== +shipRef.id ? ship : null;
		});

		return locations;
	}, [playerShipsLocations]);


	const shipMoveCallback = (shipRef: any, isVertical: boolean) => {
		if (!shipRef) return;
		const locations: LocationsType = getPresumptiveBorders(shipRef, fieldRef, isVertical);
		setShootLocations(locations);
	};


	const shipEndMoveCallback = (shipRef: any, isVertical: boolean) => {
		if (!shipRef) return;
		const shipEls = [ ...shipRef.children ];
		const fieldEl = fieldRef.current;
		const fieldEls = [ ...fieldEl.children ];
		const locations: LocationsType = getPresumptiveBorders(shipRef, fieldRef, isVertical);
		let isAllowedSetShip = true;
		for (const [ key, value ] of Object.entries(locations)) {
			if (value !== null) isAllowedSetShip = false;
		}
		setShootLocations(null);
		if (!isAllowedSetShip) return;
		const fieldMatchesIds: Array<string> = getFieldMatches(shipEls, fieldEls);
		setShipLocation(fieldMatchesIds, +shipRef.id);
	};

	const maximumWidth = window.screen.availWidth;
	const maximumItemSize = 60;
	const maximumPossibleItemSize = fieldSize ? maximumWidth / fieldSize : maximumItemSize;
	const shipSize = (() => {
		if (maximumPossibleItemSize >= maximumItemSize) return maximumItemSize;
		return maximumPossibleItemSize;
	})();


	useLayoutEffect(() => {
		const createShip = (x: number | null, y: number | null, index: number, isVertical: boolean, size: ShipSizeType, width: number, height: number) => {
			return <Ship
				x={x}
				y={y}
				key={index}
				endMoveCallback={shipEndMoveCallback}
				moveCallback={shipMoveCallback}
				isVertical={isVertical}
				id={index}
				size={size as ShipSizeType}
				width={width}
				height={height}
			/>
		};
		const current = fieldRef.current;
		const fieldEls = [ ...current.children ];
		const els: Array<ReactElement> = [];
		possibleShips?.forEach((possibleShip, i) => {
			const placedShip = placedShips[i];
			const isVertical = placedShip ? isVerticalShip(placedShip[0], placedShip[1]) : false;
			type coordsType = { x: number | null, y: number | null };
			const { x, y }: coordsType = (() => {
				if (placedShip) {
					const fieldEl = fieldEls.find(fieldEl => fieldEl.id === placedShip[0]);

					if (fieldEl) {
						const { x, y } = fieldEl.getBoundingClientRect();
						const scrollY = window.scrollY;
						const scrollX = window.scrollX;
						return { x: x + scrollX, y: y + scrollY };
					}
					return { x: null, y: null };
				}
				return { x: null, y: null };
			})();
			els.push(createShip(x, y, i, isVertical, possibleShip as ShipSizeType, shipSize, shipSize));
		});
		setShipElsState(els);
	}, [placedShips]);


	return (
		<div className={ReusableCss.container}>
			<div className={FieldPrepareCss.field}>
				<Field isPrepare={true} ref={fieldRef} shootLocations={shootLocations} shipsLocations={playerShipsLocations}/>
			</div>
			<div className={ReusableCss.footer}>
				<div onClick={startGame} className={startGameClasses}>Начать игру</div>
				<div onClick={setPlayerShips} className={buttonClasses}>Сгенерировать случайно</div>
			</div>
			<div className={FieldPrepareCss.ships_container}>
				{ shipElsState }
			</div>
		</div>
	)
};



