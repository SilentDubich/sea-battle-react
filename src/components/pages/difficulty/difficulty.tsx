import React, {FC} from 'react';
import ReusableCss from '../../../reusable/reusable.module.css';

export const Difficulty: FC<{}> = () => {
	return (
		<div className={ReusableCss.container}>
			<div className={ReusableCss.main_title}>Выберите уровень сложности</div>
			<div>
				<div className={ReusableCss.item}>Легкий</div>
				<div className={ReusableCss.item}>Средний</div>
				<div className={ReusableCss.item}>Высокий</div>
				<div className={ReusableCss.item}>Очень высокий</div>
			</div>
		</div>
	)
}