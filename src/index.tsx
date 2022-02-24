import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Main } from './components/pages/main/main';
import { Difficulty } from './components/pages/difficulty/difficulty';
import { BackButton } from './components/back-button';
import { FieldChoose } from './components/pages/field-choose/field-choose';
import { Field } from './components/pages/field/field';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
	<React.StrictMode>
		<BackButton/>
		<Main />
		<Difficulty />
		<FieldChoose/>
		<Field size={8}/>
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
