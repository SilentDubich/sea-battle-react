import {useDispatch, useSelector} from 'react-redux';
import {Field} from '../../../reusable/components/field/field';
import {
	gameActions,
	playerShootThunk
} from '../../../date-base/reducers/game';
import {AppStateType} from '../../../date-base/store';
import BattleCss from './battle.module.css';
import ReusableCss from '../../../reusable/css/reusable.module.css';


export default () => {
	const { player, bot, winner, isBlockShoot } = useSelector((state: AppStateType) => {
		const { player, bot, winner, isBlockShoot } = state.gameReducer;
		return {
			player: player || null,
			bot: bot || null,
			winner,
			isBlockShoot
		};
	});
	const dispatch = useDispatch();
	const title: string = (() => {
		if (winner === 'player') return 'Вы победили';
		if (winner === 'bot') return 'Противник победил';
		return isBlockShoot ? 'Ход противника' : 'Твой ход';
	})();
	return (
		<>
			<div className={ReusableCss.main_title}>{ title }</div>
			{ winner && <button onClick={() => dispatch(gameActions.reset())} className={ReusableCss.button}>Вернуться в меню</button> }
			<div className={`${ BattleCss.container }`}>
				<Field
					fieldTitle={'Поле противника'}
					shootLocations={player?.shoots || null}
					shootCallback={playerShootThunk}
				/>
				<Field
					fieldTitle={'Твоё поле'}
					disabledBtns={true}
					shootLocations={bot?.battleData?.shoots || null}
					shipsLocations={player?.shipsParams?.locations || null}
				/>
			</div>
		</>
	)
};




























