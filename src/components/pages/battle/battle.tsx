import React, {ComponentType, FC} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import Field from '../../../reusable/components/field/field';
import {BotType, playerShootThunk, PlayerType, ShipsLocationsType} from '../../../date-base/reducers/game';
import {AppStateType} from '../../../date-base/store';
import BattleCss from './battle.module.css';
import ReusableCss from '../../../reusable/css/reusable.module.css';

type PropsType = {
	player: PlayerType | null,
	bot: BotType | null,
	playerShootThunk: typeof playerShootThunk
};

const Battle: FC<PropsType> = ({ player, playerShootThunk, bot }) => {
	const playerShipsLocations: ShipsLocationsType | null = player ? player.shipsParams.locations : null;
	const playerShoots = player && player.shoots ? player.shoots : null;
	const botShoots = bot && bot.battleData && bot.battleData.shoots ? bot.battleData.shoots : null;
	return (
		<div className={`${ BattleCss.container } ${ ReusableCss.container }`}>
			<Field fieldTitle={'Поле противника'} shootLocations={playerShoots} shootCallback={playerShootThunk}/>
			<Field fieldTitle={'Твоё поле'} shootLocations={botShoots} shipsLocations={playerShipsLocations} fieldItemSize={45}/>
		</div>
	)
};

const mapStateToProps = (state: AppStateType) => {
	return {
		player: state.gameReducer.player || null,
		bot: state.gameReducer.bot || null,
		isBlockShoot: state.gameReducer.isBlockShoot
	}
}

export default compose<ComponentType> (
	connect(mapStateToProps, { playerShootThunk })
)(Battle);