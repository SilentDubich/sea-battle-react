import React, {ComponentType, FC} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import Field from '../../../reusable/components/field/field';
import {
	BotType,
	gameActions,
	playerShootThunk,
	PlayerType,
	PlayerTypes,
	ShipsLocationsType
} from '../../../date-base/reducers/game';
import {AppStateType} from '../../../date-base/store';
import BattleCss from './battle.module.css';
import ReusableCss from '../../../reusable/css/reusable.module.css';

type PropsType = {
	player: PlayerType | null,
	bot: BotType | null,
	winner: PlayerTypes,
	reset: Function,
	playerShootThunk: typeof playerShootThunk,
	isBlockShoot: boolean
};

const Battle: FC<PropsType> = ({ player, playerShootThunk, bot, isBlockShoot, winner, reset }) => {
	const playerShipsLocations: ShipsLocationsType | null = player ? player.shipsParams.locations : null;
	const playerShoots = player && player.shoots ? player.shoots : null;
	const botShoots = bot && bot.battleData && bot.battleData.shoots ? bot.battleData.shoots : null;
	const title: string = (() => {
		if (winner === 'player') return 'Вы победили';
		if (winner === 'bot') return 'Противник победил';
		return isBlockShoot ? 'Ход противника' : 'Твой ход';
	})();
	return (
		<div className={`${ ReusableCss.container }`}>
			<div className={ReusableCss.main_title}>{ title }</div>
			{ winner && <div onClick={() => reset()} className={ReusableCss.button}>Вернуться в меню</div> }
			<div className={`${ BattleCss.container }`}>
				<Field fieldTitle={'Поле противника'} shootLocations={playerShoots} shootCallback={playerShootThunk}/>
				<Field fieldTitle={'Твоё поле'} shootLocations={botShoots} shipsLocations={playerShipsLocations} fieldItemSize={45}/>
			</div>
		</div>
	)
};

const mapStateToProps = (state: AppStateType) => {
	const { player, bot, winner, isBlockShoot } = state.gameReducer;
	return {
		player: player || null,
		bot: bot || null,
		winner,
		isBlockShoot
	}
};

export default compose<ComponentType> (
	connect(mapStateToProps, { reset: gameActions.reset, playerShootThunk })
)(Battle);