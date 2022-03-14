import React, {ComponentType, FC} from 'react';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import FieldPrepareCss from './field-prepare.module.css';
import Field from '../../../reusable/components/field/field';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {gameActions, PlayerType, ShipsLocationsType} from '../../../date-base/reducers/game';
import {AppStateType} from '../../../date-base/store';

type PropsType = {
	setPlayerShips: typeof gameActions.setPlayerShips,
	startGame: typeof gameActions.startGame,
	player: PlayerType | null
};

const FieldPrepare: FC<PropsType> = ({ setPlayerShips, player, startGame }) => {
	const buttonClasses = `${ ReusableCss.button }`;
	const startGameClasses = `${ buttonClasses } ${ !player && ReusableCss.disabled }`;
	const playerShipsLocations: ShipsLocationsType | null = player ? player.shipsParams.locations : null;
	return (
		<div className={ReusableCss.container}>
			<div className={FieldPrepareCss.field}>
				<Field shipsLocations={playerShipsLocations}/>
			</div>
			<div className={ReusableCss.footer}>
				<div onClick={() => playerShipsLocations && startGame()} className={startGameClasses}>Начать игру</div>
				<div onClick={() => setPlayerShips()} className={buttonClasses}>Сгенерировать случайно</div>
			</div>
		</div>
	)
};



const mapStateToProps = (state: AppStateType) => {
	return {
		player: state.gameReducer.player || null
	}
}


export default compose<ComponentType>(
	connect(mapStateToProps, { setPlayerShips: gameActions.setPlayerShips, startGame: gameActions.startGame })
)(FieldPrepare);


