import React, {FC, ReactElement} from 'react';
import FieldCss from './field.module.css';
import {FieldSizeType, ShipsLocationsType} from '../../../date-base/reducers/game';
import {AppStateType} from '../../../date-base/store';
import {connect} from 'react-redux';

type PropsType = {
	fieldSize?: FieldSizeType,
	shipsLocations?: ShipsLocationsType | null,
	fieldItemSize?: number,
	shootCallback?: Function,
	shootLocations?: {
		[key: string]: number | null
	} | null
};

const Field: FC<PropsType> = ({ fieldSize, shipsLocations, fieldItemSize, shootCallback, shootLocations }) => {
	if (!fieldSize) return null;
	const fieldItemEls: Array<ReactElement> = [];
	const itemSize = fieldItemSize || 60;
	const maxFieldWidth = itemSize * fieldSize;
	for (let i = 0; i < fieldSize ** 2; i++) {
		const id = i < 10 ? `0${ i }` : i.toString();
		const classes: string = (() => {
			let classes = `${ FieldCss.item }`;
			if (shipsLocations && shipsLocations[id] !== null && shipsLocations[id] !== undefined) classes += ` ${ FieldCss.ship }`;
			if (shootLocations && typeof shootLocations[id] === 'number') classes += ` ${ FieldCss.hit }`;
			if (shootLocations && shootLocations[id] === null) classes += ` ${ FieldCss.miss }`;
			return classes;
		})();
		fieldItemEls.push(<div onClick={() => shootCallback && shootCallback(id)} key={id} id={id} className={classes} style={{ width: itemSize, height: itemSize }}/>);
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

export default connect(mapStateToProps, null)(Field);
