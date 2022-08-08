import React from 'react';
import BackButtonCss from './back-button.module.css';
import ReusableCss from '../reusable/css/reusable.module.css';
import {gameActions, ModeType} from '../date-base/reducers/game';
import {useDispatch, useSelector} from 'react-redux';
import {AppStateType} from '../date-base/store';

export const BackButton = () => {
	const mode: ModeType = useSelector((state: AppStateType) => state.gameReducer.mode);
	const dispatch = useDispatch();
	const back = () => {
		dispatch(gameActions.back());
	};
	if (!mode) return null;
	const classes = `${ BackButtonCss.btn } ${ ReusableCss.button }`;
	return (
		<div onClick={back} className={classes}>Назад</div>
	);
};