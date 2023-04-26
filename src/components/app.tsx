import {AppStateType} from '../date-base/store';
import {BackButton} from './back-button';
import {useSelector} from 'react-redux';
import Battle from './pages/battle/battle';
import FieldPrepare from './pages/field-prepare/field-prepare';
import ReusableCss from '../reusable/css/reusable.module.css';
import {Suspense, lazy} from 'react';
import Preloader from '../reusable/components/preloader';

export const App = () => {
	const { difficulty, mode, fieldSize, isStarted } = useSelector((state: AppStateType) => {
		const { difficulty, mode, fieldSize, isStarted } = state.gameReducer;
		return { difficulty, mode, fieldSize, isStarted };
	});
	const ComponentToRender = (() => {
		if (!mode) return lazy(() => import('./pages/main/main'));
		if (!difficulty) return lazy(() => import('./pages/difficulty/difficulty'));
		if (!fieldSize) return lazy(() => import('./pages/field-choose/field-choose'));
		if (!isStarted) return FieldPrepare;
		return Battle;
	})();

	return (
		<>
			<BackButton/>
			<div className={ReusableCss.container}>
				<Suspense fallback={<Preloader></Preloader>}>
					<ComponentToRender/>
				</Suspense>
			</div>
		</>
	);
};
