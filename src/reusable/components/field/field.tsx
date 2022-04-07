import React, {FC, forwardRef, ReactElement, useImperativeHandle, useRef} from 'react';
import FieldCss from './field.module.css';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import {FieldSizeType, getPossibleLocations, ShipsLocationsType} from '../../../date-base/reducers/game';
import {AppStateType} from '../../../date-base/store';
import {connect} from 'react-redux';
import {Ship} from '../../../components/pages/field-prepare/ship';

type PropsType = {
	fieldTitle?: string,
	isBlockShoot?: boolean,
	fieldSize?: FieldSizeType,
	isPrepare?: boolean,
	shipsLocations?: ShipsLocationsType | null,
	fieldItemSize?: number,
	shootCallback?: Function,
	shootLocations?: {
		[key: string]: number | null
	} | null
};

const Field = forwardRef<any, PropsType>(({
      fieldTitle,
      isBlockShoot,
      fieldSize,
      shipsLocations,
      fieldItemSize,
      shootCallback,
      shootLocations,
      isPrepare
}, ref) => {
	if (!fieldSize) return null;
	const fieldItemEls: Array<ReactElement> = [];
	const itemSize = fieldItemSize || 60;
	const maxFieldWidth = itemSize * fieldSize;
	const locations = getPossibleLocations(fieldSize);
	locations.forEach(location => {
		const isShip = shipsLocations && shipsLocations[location] !== null && shipsLocations[location] !== undefined;
		const isHit = shootLocations && typeof shootLocations[location] === 'number';
		const isMiss = shootLocations && shootLocations[location] === null;
		const classes: string = (() => {
			let classes = `${ FieldCss.item }`;
			if (isShip && !isPrepare) classes += ` ${ FieldCss.ship }`;
			if (isHit) classes += ` ${ FieldCss.hit }`;
			if (isMiss) classes += ` ${ FieldCss.miss }`;
			return classes;
		})();
		fieldItemEls.push(
			<div
				onClick={() => !isBlockShoot && shootCallback && shootCallback(location)}
				key={location}
				id={location}
				className={classes}
				style={{ width: itemSize, height: itemSize }}
			/>
		);
	});
	return (
		<div>
			{ fieldTitle && <div className={ReusableCss.main_title}>{ fieldTitle }</div> }
			<div ref={ref} className={FieldCss.field_container} style={{ width: maxFieldWidth }}>
				{ fieldItemEls }
			</div>
		</div>
	)
});


const mapStateToProps = (state: AppStateType) => {
	return {
		fieldSize: state.gameReducer.fieldSize,
		isBlockShoot: state.gameReducer.isBlockShoot
	}
};

export default connect(mapStateToProps, null, null, { forwardRef: true })(Field);
