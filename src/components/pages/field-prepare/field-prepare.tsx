import React, {ComponentType, FC, ReactElement, useEffect, useLayoutEffect, useRef, useState} from 'react';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import FieldPrepareCss from './field-prepare.module.css';
import Field from '../../../reusable/components/field/field';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {
	FieldSizeType,
	gameActions,
	getPossibleShips, isVerticalShip,
	PlayerType, ShipSizeType,
	ShipsLocationsType
} from '../../../date-base/reducers/game';
import {AppStateType} from '../../../date-base/store';
import {Ship} from './ship';

type PropsType = {
	setPlayerShips: typeof gameActions.setPlayerShips,
	startGame: typeof gameActions.startGame,
	player: PlayerType | null,
	fieldSize: FieldSizeType
};

const FieldPrepare: FC<PropsType> = ({ setPlayerShips, player, startGame, fieldSize }) => {
	const buttonClasses = `${ ReusableCss.button }`;
	const startGameClasses = `${ buttonClasses } ${ !player && ReusableCss.disabled }`;
	const playerShipsLocations: ShipsLocationsType | null = player ? player.shipsParams.locations : null;
	const tempPlacedShips: {
		[key: number]: Array<string>
	} = {};
	const [ shipElsState, setShipElsState ] = useState<any>([]);
	const [ refs, setRefs ] = useState<{[key: number]: any}>({});
	const [ placedShips, setPlacedShips ] = useState<{[key: number]: Array<string>}>({});
	let tempRefs: {[key: number]: any} = {};
	const possibleShips: Array<number> | null = getPossibleShips(fieldSize);
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
	useLayoutEffect(() => {
		const current = myRef.current;
		const fieldEls = [ ...current.children ];
		if (!playerShipsLocations && possibleShips) {
			setShipElsState(possibleShips.map((possibleShip, i) => <Ship isVertical={false} ref={refs[i]} id={i} size={possibleShip as ShipSizeType} width={60} height={60}/>));
			return;
		}
		const els = [];
		for (const [key, value] of Object.entries(placedShips)) {
			const isVertical = isVerticalShip(value[0], value[1]);
			const fieldEl = fieldEls.find(fieldEl => fieldEl.id === value[0]);
			if (fieldEl) {
				const { x, y } = fieldEl.getBoundingClientRect();
				const scrollY = window.scrollY;
				const scrollX = window.scrollX;
				const numberKey = +key;
				els.push(<Ship x={x + scrollX} y={y + scrollY} ref={refs[numberKey]} isVertical={isVertical} id={numberKey} size={value.length as ShipSizeType} width={60} height={60}/>);
			}
		}
		setShipElsState(els);
	}, [placedShips]);
	return (
		<div className={ReusableCss.container}>
			<div className={FieldPrepareCss.field}>
				<Field isPrepare={true} ref={myRef} shipsLocations={playerShipsLocations}/>
			</div>
			<div className={ReusableCss.footer}>
				<div onClick={() => playerShipsLocations && startGame()} className={startGameClasses}>Начать игру</div>
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
	connect(mapStateToProps, { setPlayerShips: gameActions.setPlayerShips, startGame: gameActions.startGame })
)(FieldPrepare);


