import React, {FC} from 'react';
import BackButtonCss from './back-button.module.css';
import ReusableCss from '../reusable/reusable.module.css';


export const BackButton: FC<{}> = () => {
	const classes = `${ BackButtonCss.btn } ${ ReusableCss.button }`;
	return (
		<div className={classes}>Назад</div>
	)
}