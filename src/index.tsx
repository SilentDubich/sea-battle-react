import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import BackButton from './components/back-button';
import reportWebVitals from './reportWebVitals';
import {Provider} from 'react-redux';
import {store} from './date-base/store';
import App from './components/app';

ReactDOM.render(
	<Provider store={store}>
		<BackButton/>
		<App/>
	</Provider>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
