import React, {FC, ReactElement} from 'react';
import FieldCss from './field.module.css';
import ReusableCss from '../../../reusable/reusable.module.css';

type PropsType = {
	size: number
};



export const Field: FC<PropsType> = ({ size }) => {
	const fieldItemEls: Array<ReactElement> = [];
	const itemSize = 60;
	const maxFieldWidth = itemSize * size;
	for (let i = 0; i < size ** 2; i++) {
		fieldItemEls.push(<div className={FieldCss.item}/>)
	}
	const buttonClasses = `${ ReusableCss.button } ${ FieldCss.button }`;
	return (
		<div className={FieldCss.container}>
			<div className={FieldCss.field_container} style={{ width: maxFieldWidth }}>
				{ fieldItemEls }
			</div>
			<div className={FieldCss.footer}>
				<div className={buttonClasses}>Начать игру</div>
				<div className={buttonClasses}>Сгенерировать случайно</div>
			</div>
		</div>

	)
}
