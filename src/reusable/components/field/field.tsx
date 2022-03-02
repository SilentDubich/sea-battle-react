import React, {ComponentType, FC, ReactElement} from 'react';
import FieldCss from './field.module.css';
import {FieldSizeType, ShipsLocationsType} from '../../../date-base/reducers/game';
import {AppStateType} from '../../../date-base/store';
import {compose} from 'redux';
import {connect} from 'react-redux';

type PropsType = {
	fieldSize: FieldSizeType,
	shipsLocations: ShipsLocationsType | null
};

const Field: FC<PropsType> = ({ fieldSize, shipsLocations }) => {
	if (!fieldSize) return null;
	const fieldItemEls: Array<ReactElement> = [];
	const itemSize = 60;
	const maxFieldWidth = itemSize * fieldSize;
	for (let i = 0; i < fieldSize ** 2; i++) {
		const id = i < 10 ? `0${ i }` : i.toString();
		const classes: string = (() => {
			let classes = `${ FieldCss.item }`;
			if (shipsLocations && shipsLocations[id]) classes += ` ${ FieldCss.ship }`;
			return classes;
		})();
		fieldItemEls.push(<div key={id} id={id} className={classes}/>);
	}
	return (
		<div className={FieldCss.field_container} style={{ width: maxFieldWidth }}>
			{ fieldItemEls }
		</div>
	)
}


const mapStateToProps = (state: AppStateType) => {
	return {
		fieldSize: state.gameReducer.fieldSize,
		shipsLocations: state.gameReducer.player?.shipsParams.locations || null
	}
}

export default compose<ComponentType>(
	connect(mapStateToProps, null)
)(Field);
