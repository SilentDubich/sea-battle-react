import React from 'react';
import {Main} from './pages/main/main';
import {Difficulty} from './pages/difficulty/difficulty';
import {FieldChoose} from './pages/field-choose/field-choose';
import {FieldPrepare} from './pages/field-prepare/field-prepare';
import {Battle} from './pages/battle/battle';
import {useSelector} from 'react-redux';
import {AppStateType} from '../date-base/store';
import {BackButton} from './back-button';


export const App = () => {
	const { difficulty, mode, fieldSize, isStarted } = useSelector((state: AppStateType) => {
		const { difficulty, mode, fieldSize, isStarted } = state.gameReducer;
		return { difficulty, mode, fieldSize, isStarted };
	});
	const componentToRender = (() => {
		if (!mode) return <Main/>;
		if (!difficulty) return <Difficulty/>;
		if (!fieldSize) return <FieldChoose/>;
		if (!isStarted) return <FieldPrepare/>;
		return <Battle/>
	})();
	return (
		<>
			<BackButton/>
			{ componentToRender }
		</>
	);
};
