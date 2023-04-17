import ReusableCss from '../../../reusable/css/reusable.module.css';
import {useDispatch} from 'react-redux';
import {FieldSizeType, gameActions} from '../../../date-base/reducers/game';

export const FieldChoose = () => {
	const dispatch = useDispatch();
	const setFieldSize = (size: FieldSizeType) => {
		dispatch(gameActions.setFieldSize(size));
	};
	return (
		<>
			<div className={ReusableCss.main_title}>Выберите размер поля</div>
			<button onClick={() => setFieldSize(8)} className={ReusableCss.item}>8*8</button>
			<button onClick={() => setFieldSize(10)} className={ReusableCss.item}>10*10</button>
		</>
	);
};