import React, {ComponentType, FC} from 'react';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {gameActions} from '../../../date-base/reducers/game';

type PropsType = {
	setDifficulty: typeof gameActions.setDifficulty
};

const Difficulty: FC<PropsType> = ({ setDifficulty }) => {
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


export default compose<ComponentType>(
	connect(null, { setDifficulty: gameActions.setDifficulty })
)(Difficulty);