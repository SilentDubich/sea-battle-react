import React, {FC} from 'react';
import ReusableCss from '../../../reusable/reusable.module.css';

export const Main: FC<{}> = () => {
	return (
		<div className={ReusableCss.container}>
			<div className={ReusableCss.main_title}>Морской бой</div>
			<div>
				<div className={ReusableCss.item}>Одиночная игра</div>
				<div className={ReusableCss.item}>Сетевая игра</div>
			</div>
		</div>
	);
}
