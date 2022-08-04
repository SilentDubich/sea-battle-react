import React from 'react';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import {useDispatch} from 'react-redux';
import {gameActions} from '../../../date-base/reducers/game';


export const Main = () => {
	const dispatch = useDispatch();
	return (
		<div className={ReusableCss.container}>
			<div className={ReusableCss.main_title}>Морской бой</div>
			<div>
				<div onClick={() => dispatch(gameActions.setMode('SINGLE'))} className={ReusableCss.item}>Одиночная игра</div>
				{/*<div onClick={() => setMode('MULTIPLAYER')} className={ReusableCss.item}>Сетевая игра</div>*/}
			</div>
		</div>
	);
};

