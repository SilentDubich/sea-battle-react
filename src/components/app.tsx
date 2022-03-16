import React, {ComponentType, FC} from 'react';
import Main from './pages/main/main';
import {GameStateType} from '../date-base/reducers/game';
import Difficulty from './pages/difficulty/difficulty';
import FieldChoose from './pages/field-choose/field-choose';
import FieldPrepare from './pages/field-prepare/field-prepare';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {AppStateType} from '../date-base/store';
import BackButton from './back-button';
import Battle from './pages/battle/battle';

type PropsType = {
	gameState: GameStateType
}

const App: FC<PropsType> = ({ gameState }) => {
	const { difficulty, mode, fieldSize, isStarted } = gameState;
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
}

const stateToProps = (state: AppStateType) => {
	return {
		gameState: state.gameReducer
	}
}


export default compose<ComponentType>(
	connect(stateToProps, null)
)(App);
