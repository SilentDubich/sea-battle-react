import React, {ComponentType, FC, ReactElement, useEffect, useLayoutEffect, useRef, useState} from 'react';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import FieldPrepareCss from './field-prepare.module.css';
import Field from '../../../reusable/components/field/field';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {
	FieldSizeType,
	gameActions,
	getBorders,
	getPossibleShips,
	isVerticalShip,
	PlayerType,
	ShipSizeType,
	ShipsLocationsType
} from '../../../date-base/reducers/game';
import {AppStateType} from '../../../date-base/store';
import {Ship} from './ship';

type PropsType = {
	setPlayerShips: typeof gameActions.setPlayerShips,
	startGame: typeof gameActions.startGame,
	setShipLocation: typeof gameActions.setShipLocation,
	player: PlayerType | null,
	fieldSize: FieldSizeType
};

const FieldPrepare: FC<PropsType> = ({ setPlayerShips, player, startGame, fieldSize, setShipLocation }) => {
	const buttonClasses = `${ ReusableCss.button }`;
	const possibleShips: Array<number> | null = getPossibleShips(fieldSize);
	let isAllShipsPlaced = false;
	if (player) {
		const { shipsParams } = player;
		const { ships } = shipsParams;
		if (possibleShips && ships && possibleShips.length === Object.keys(ships).length) isAllShipsPlaced = true;
	}
	const startGameClasses = `${ buttonClasses } ${ !isAllShipsPlaced && ReusableCss.disabled }`;
	const playerShipsLocations: ShipsLocationsType | null = player ? player.shipsParams.locations : null;
	const tempPlacedShips: {
		[key: number]: Array<string>
	} = {};
	const [ shipElsState, setShipElsState ] = useState<any>([]);
	const [ refs, setRefs ] = useState<{[key: number]: any}>({});
	const [ placedShips, setPlacedShips ] = useState<{[key: number]: Array<string>}>({});
	let tempRefs: {[key: number]: any} = {};

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
	useLayoutEffect(() => {
		if (possibleShips) {
			possibleShips.forEach((ship, i) => {
				if (!tempRefs[i]) tempRefs[i] = React.createRef();
			});
			setRefs(tempRefs);
		}
	}, []);
	const myRef: any = useRef();
	const [ shootLocations, setShootLocations ] = useState<{[key: string]: number | null} | null>({});
	const getFieldMatches = (shipEls: any, fieldEls: any) => {
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
	};
	const getPresumptiveBorders = (shipEls: any, fieldEls: any, isVertical: boolean, shipRef: any) => {
		const fieldMatchesIds: Array<string> = getFieldMatches(shipEls, fieldEls);
		const borders = getBorders(fieldMatchesIds, isVertical);
		const locations: {[key: string]: number | null} = {};
		borders.forEach(border => {
			const isLocation = fieldMatchesIds.find(fieldMatchesId => fieldMatchesId === border);
			const ship = playerShipsLocations && playerShipsLocations[border] !== undefined ? playerShipsLocations[border] : null;
			if (!isLocation) locations[border] = ship !== null && ship !== +shipRef.id ? ship : null;
		});
		return locations;
	};
	const shipMoveCallback = (shipRef: any, isVertical: boolean) => {
		if (!shipRef) return;
		const shipEls = [ ...shipRef.children ];
		const fieldEl = myRef.current;
		const fieldEls = [ ...fieldEl.children ];
		const locations: {[key: string]: number | null} = getPresumptiveBorders(shipEls, fieldEls, isVertical, shipRef);
		setShootLocations(locations);
	};
	const shipEndMoveCallback = (shipRef: any, isVertical: boolean) => {
		if (!shipRef) return;
		const shipEls = [ ...shipRef.children ];
		const fieldEl = myRef.current;
		const fieldEls = [ ...fieldEl.children ];
		const locations: {[key: string]: number | null} = getPresumptiveBorders(shipEls, fieldEls, isVertical, shipRef);
		let isAllowedSetShip = true;
		for (const [ key, value ] of Object.entries(locations)) {
			if (value) isAllowedSetShip = false;
		}
		setShootLocations(null);
		if (!isAllowedSetShip) return;
		const fieldMatchesIds: Array<string> = getFieldMatches(shipEls, fieldEls);
		setShipLocation(fieldMatchesIds, +shipRef.id);
	}
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
				ref={refs[index]}
				id={index}
				size={size as ShipSizeType}
				width={width}
				height={height}
			/>
		};
		const current = myRef.current;
		const fieldEls = [ ...current.children ];
		if (!playerShipsLocations && possibleShips) {
			setShipElsState(possibleShips.map((possibleShip, i) => createShip(null, null, i, false, possibleShip as ShipSizeType, shipSize, shipSize)));
			return;
		}
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
				<Field isPrepare={true} ref={myRef} shootLocations={shootLocations} shipsLocations={playerShipsLocations}/>
			</div>
			<div className={ReusableCss.footer}>
				<div onClick={() => isAllShipsPlaced && startGame()} className={startGameClasses}>Начать игру</div>
				<div onClick={() => setPlayerShips()} className={buttonClasses}>Сгенерировать случайно</div>
			</div>
			<div className={FieldPrepareCss.ships_container}>
				{ shipElsState }
			</div>
		</div>
	)
};



const mapStateToProps = (state: AppStateType) => {
	return {
		player: state.gameReducer.player || null,
		fieldSize: state.gameReducer.fieldSize
	};
};


export default compose<ComponentType>(
	connect(mapStateToProps, { setPlayerShips: gameActions.setPlayerShips, startGame: gameActions.startGame, setShipLocation: gameActions.setShipLocation })
)(FieldPrepare);


