import React, {ComponentType, FC, ReactElement} from 'react';
import FieldCss from './field.module.css';
import {FieldSizeType} from '../../../date-base/reducers/game';
import {AppStateType} from '../../../date-base/store';
import {compose} from 'redux';
import {connect} from 'react-redux';

type PropsType = {
	fieldSize: FieldSizeType
};

const Field: FC<PropsType> = ({ fieldSize }) => {
	if (!fieldSize) return null;
	const fieldItemEls: Array<ReactElement> = [];
	const itemSize = 60;
	const maxFieldWidth = itemSize * fieldSize;
	for (let i = 0; i < fieldSize ** 2; i++) {
		fieldItemEls.push(<div className={FieldCss.item}/>)
	}
	return (
		<div className={FieldCss.field_container} style={{ width: maxFieldWidth }}>
			{ fieldItemEls }
		</div>
	)
}


const mapStateToProps = (state: AppStateType) => {
	return {
		fieldSize: state.gameReducer.fieldSize
	}
}

export default compose<ComponentType>(
	connect(mapStateToProps, null)
)(Field);
