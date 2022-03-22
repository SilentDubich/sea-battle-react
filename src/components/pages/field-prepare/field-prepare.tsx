import React, {ComponentType, FC, ReactElement} from 'react';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import FieldPrepareCss from './field-prepare.module.css';
import Field from '../../../reusable/components/field/field';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {
	FieldSizeType,
	gameActions,
	getPossibleShips,
	PlayerType, ShipSize,
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
	const placedShips: Array<number> = [];
	if (playerShipsLocations) {
		for (const [key, value] of Object.entries(playerShipsLocations)) {
			const isAlreadyInPlaced = placedShips.find(ship => ship === value);
			if (isAlreadyInPlaced === undefined) placedShips.push(value);
		}
	}
	const possibleShips: Array<number> | null = getPossibleShips(fieldSize);
	const shipEls: Array<ReactElement> = [];
	if (possibleShips) {
		possibleShips.forEach((possibleShip, i) => {
			const isPlaced = placedShips.find(ship => ship === i);
			if (isPlaced === undefined) {
				shipEls.push(<Ship id={i} size={possibleShip as ShipSize} width={60} height={60}/>);
			}
		});
	}
	return (
		<div className={ReusableCss.container}>
			<div className={FieldPrepareCss.field}>
				<Field shipsLocations={playerShipsLocations}/>
			</div>
			<div className={ReusableCss.footer}>
				<div onClick={() => playerShipsLocations && startGame()} className={startGameClasses}>Начать игру</div>
				<div onClick={() => setPlayerShips()} className={buttonClasses}>Сгенерировать случайно</div>
			</div>
			<div className={FieldPrepareCss.ships_container}>
				{ shipEls }
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


