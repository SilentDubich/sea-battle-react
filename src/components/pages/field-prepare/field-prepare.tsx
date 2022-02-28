import React, {FC} from 'react';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import Field from '../../../reusable/components/field/field';

export const FieldPrepare: FC<{}> = () => {
	const buttonClasses = `${ ReusableCss.button }`;
	return (
		<div className={ReusableCss.container}>
			<Field/>
			<div className={ReusableCss.footer}>
				<div className={buttonClasses}>Начать игру</div>
				<div className={buttonClasses}>Сгенерировать случайно</div>
			</div>
		</div>

	)
}


