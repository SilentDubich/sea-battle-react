import React, {ComponentType, FC} from 'react';
import BackButtonCss from './back-button.module.css';
import ReusableCss from '../reusable/css/reusable.module.css';
import {gameActions, ModeType} from '../date-base/reducers/game';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {AppStateType} from '../date-base/store';

type PropsType = {
	mode: ModeType,
	back: typeof gameActions.back
}

const BackButton: FC<PropsType> = ({ back, mode }) => {
	if (!mode) return null;
	const classes = `${ BackButtonCss.btn } ${ ReusableCss.button }`;
	return (
		<div onClick={back} className={classes}>Назад</div>
	)
}


const mapStateToProps = (state: AppStateType) => {
	return {
		mode: state.gameReducer.mode
	}
};

export default compose<ComponentType>(
	connect(mapStateToProps, { back: gameActions.back })
)(BackButton);