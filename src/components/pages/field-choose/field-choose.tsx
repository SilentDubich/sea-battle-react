import React, {FC} from 'react';
import ReusableCss from '../../../reusable/reusable.module.css';


export const FieldChoose: FC<{}> = () => {
	return (
		<div className={ReusableCss.container}>
			<div className={ReusableCss.main_title}>Выберите размер поля</div>
			<div>
				<div className={ReusableCss.item}>8*8</div>
				<div className={ReusableCss.item}>10*10</div>
			</div>
		</div>
	)
}