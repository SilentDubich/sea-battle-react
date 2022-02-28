import React, {ComponentType, FC} from 'react';
import Main from './pages/main/main';
import {GameStateType} from '../date-base/reducers/game';
import Difficulty from './pages/difficulty/difficulty';
import FieldChoose from './pages/field-choose/field-choose';
import {FieldPrepare} from './pages/field-prepare/field-prepare';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {AppStateType} from '../date-base/store';

type PropsType = {
	gameState: GameStateType
}

const App: FC<PropsType> = ({ gameState }) => {
	const { difficulty, mode, fieldSize } = gameState;
	const componentToRender = (() => {
		if (!mode) return <Main />;
		if (!difficulty) return <Difficulty />;
		if (!fieldSize) return <FieldChoose />;
		return <FieldPrepare/>;
	})();
	return (
		<>
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
