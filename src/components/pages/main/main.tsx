import React, {ComponentType, FC} from 'react';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {gameActions} from '../../../date-base/reducers/game';

type PropsType = {
	setMode: typeof gameActions.setMode
}

const Main: FC<PropsType> = ({ setMode }) => {
	return (
		<div className={ReusableCss.container}>
			<div className={ReusableCss.main_title}>Морской бой</div>
			<div>
				<div onClick={() => setMode('SINGLE')} className={ReusableCss.item}>Одиночная игра</div>
				{/*<div onClick={() => setMode('MULTIPLAYER')} className={ReusableCss.item}>Сетевая игра</div>*/}
			</div>
		</div>
	);
};


export default compose<ComponentType>(
	connect(null, { setMode: gameActions.setMode })
)(Main);
