import ReusableCss from '../../../reusable/css/reusable.module.css';
import {useDispatch} from 'react-redux';
import {DifficultyType, gameActions} from '../../../date-base/reducers/game';
import {useCallback} from 'react';


export default () => {
	const dispatch = useDispatch();
	const setDifficulty = useCallback((difficulty: DifficultyType) => {
		dispatch(gameActions.setDifficulty(difficulty));
	}, []);
	return (
		<>
			<div className={ReusableCss.main_title}>Выберите уровень сложности</div>
			<button onClick={() => setDifficulty('EASY')} className={ReusableCss.item}>Легкий</button>
			<button onClick={() => setDifficulty('NORMAL')} className={ReusableCss.item}>Средний</button>
			<button onClick={() => setDifficulty('HARD')} className={ReusableCss.item}>Высокий</button>
			<button onClick={() => setDifficulty('VERY_HARD')} className={ReusableCss.item}>Очень высокий</button>
		</>
	);
};