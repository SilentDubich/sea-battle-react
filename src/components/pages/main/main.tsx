import ReusableCss from '../../../reusable/css/reusable.module.css';
import {useDispatch} from 'react-redux';
import {gameActions} from '../../../date-base/reducers/game';


export const Main = () => {
	const dispatch = useDispatch();
	return (
		<>
			<div className={ReusableCss.main_title}>Морской бой</div>
			<button onClick={() => dispatch(gameActions.setMode('SINGLE'))} className={ReusableCss.item}>Одиночная игра</button>
			{/*<div onClick={() => setMode('MULTIPLAYER')} className={ReusableCss.item}>Сетевая игра</div>*/}
		</>
	);
};

