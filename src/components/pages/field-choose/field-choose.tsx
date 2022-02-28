import React, {ComponentType, FC} from 'react';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {gameActions} from '../../../date-base/reducers/game';

type PropsType = {
	setFieldSize: typeof gameActions.setFieldSize
};

const FieldChoose: FC<PropsType> = ({ setFieldSize }) => {
	return (
		<div className={ReusableCss.container}>
			<div className={ReusableCss.main_title}>Выберите размер поля</div>
			<div>
				<div onClick={() => setFieldSize(8)} className={ReusableCss.item}>8*8</div>
				<div onClick={() => setFieldSize(10)} className={ReusableCss.item}>10*10</div>
			</div>
		</div>
	)
}


export default compose<ComponentType>(
	connect(null, { setFieldSize: gameActions.setFieldSize })
)(FieldChoose);