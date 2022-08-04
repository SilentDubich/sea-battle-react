import React from 'react';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import {useDispatch} from 'react-redux';
import {DifficultyType, gameActions} from '../../../date-base/reducers/game';


export const Difficulty = () => {
	const dispatch = useDispatch();
	const setDifficulty = (difficulty: DifficultyType) => {
		dispatch(gameActions.setDifficulty(difficulty));
	};
	return (
		<div className={ReusableCss.container}>
			<div className={ReusableCss.main_title}>Выберите уровень сложности</div>
			<div>
				<div onClick={() => setDifficulty('EASY')} className={ReusableCss.item}>Легкий</div>
				<div onClick={() => setDifficulty('NORMAL')} className={ReusableCss.item}>Средний</div>
				<div onClick={() => setDifficulty('HARD')} className={ReusableCss.item}>Высокий</div>
				<div onClick={() => setDifficulty('VERY_HARD')} className={ReusableCss.item}>Очень высокий</div>
			</div>
		</div>
	)
};