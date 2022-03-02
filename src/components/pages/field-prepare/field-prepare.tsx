import React, {ComponentType, FC} from 'react';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import Field from '../../../reusable/components/field/field';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {gameActions} from '../../../date-base/reducers/game';

type PropsType = {
	setPlayerShips: typeof gameActions.setPlayerShips
};

const FieldPrepare: FC<PropsType> = ({ setPlayerShips }) => {
	const buttonClasses = `${ ReusableCss.button }`;
	return (
		<div className={ReusableCss.container}>
			<Field/>
			<div className={ReusableCss.footer}>
				<div className={buttonClasses}>Начать игру</div>
				<div onClick={() => setPlayerShips()} className={buttonClasses}>Сгенерировать случайно</div>
			</div>
		</div>
	)
};





export default compose<ComponentType>(
	connect(null, { setPlayerShips: gameActions.setPlayerShips })
)(FieldPrepare);


