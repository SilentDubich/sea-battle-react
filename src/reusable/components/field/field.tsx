import React, {FC, ReactElement} from 'react';
import FieldCss from './field.module.css';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import {FieldSizeType, getPossibleLocations, ShipsLocationsType} from '../../../date-base/reducers/game';
import {AppStateType} from '../../../date-base/store';
import {connect} from 'react-redux';

type PropsType = {
	fieldTitle?: string,
	isBlockShoot?: boolean,
	fieldSize?: FieldSizeType,
	shipsLocations?: ShipsLocationsType | null,
	fieldItemSize?: number,
	shootCallback?: Function,
	shootLocations?: {
		[key: string]: number | null
	} | null
};

const Field: FC<PropsType> = ({ fieldTitle, isBlockShoot, fieldSize, shipsLocations, fieldItemSize, shootCallback, shootLocations }) => {
	if (!fieldSize) return null;
	const fieldItemEls: Array<ReactElement> = [];
	const itemSize = fieldItemSize || 60;
	const maxFieldWidth = itemSize * fieldSize;
	const locations = getPossibleLocations(fieldSize);
	locations.forEach(location => {
		const classes: string = (() => {
			let classes = `${ FieldCss.item }`;
			if (shipsLocations && shipsLocations[location] !== null && shipsLocations[location] !== undefined) classes += ` ${ FieldCss.ship }`;
			if (shootLocations && typeof shootLocations[location] === 'number') classes += ` ${ FieldCss.hit }`;
			if (shootLocations && shootLocations[location] === null) classes += ` ${ FieldCss.miss }`;
			return classes;
		})();
		fieldItemEls.push(<div onClick={() => !isBlockShoot && shootCallback && shootCallback(location)} key={location} id={location} className={classes} style={{ width: itemSize, height: itemSize }}/>);
	});
	return (
		<div>
			{ fieldTitle && <div className={ReusableCss.main_title}>{ fieldTitle }</div> }
			<div className={FieldCss.field_container} style={{ width: maxFieldWidth }}>
				{ fieldItemEls }
			</div>
		</div>
	)
};


const mapStateToProps = (state: AppStateType) => {
	return {
		fieldSize: state.gameReducer.fieldSize,
		isBlockShoot: state.gameReducer.isBlockShoot
	}
};

export default connect(mapStateToProps, null)(Field);
