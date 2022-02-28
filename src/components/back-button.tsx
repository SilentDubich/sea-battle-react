import React, {ComponentType, FC} from 'react';
import BackButtonCss from './back-button.module.css';
import ReusableCss from '../reusable/css/reusable.module.css';
import {gameActions} from '../date-base/reducers/game';
import {compose} from 'redux';
import {connect} from 'react-redux';

type PropsType = {
	back: typeof gameActions.back
}

const BackButton: FC<PropsType> = ({ back }) => {
	const classes = `${ BackButtonCss.btn } ${ ReusableCss.button }`;
	return (
		<div onClick={back} className={classes}>Назад</div>
	)
}


export default compose<ComponentType>(
	connect(null, { back: gameActions.back })
)(BackButton);