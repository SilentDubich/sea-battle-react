import React, {forwardRef, ReactElement} from 'react';
import FieldCss from './field.module.css';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import {FieldSizeType, getPossibleLocations, ShipsLocationsType} from '../../../date-base/reducers/game';
import {AppStateType} from '../../../date-base/store';
import {useDispatch, useSelector} from 'react-redux';

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

export const Field = forwardRef<any, PropsType>(({
      fieldTitle,
      shipsLocations,
      fieldItemSize,
      shootCallback,
      shootLocations,
      isPrepare
}, ref) => {
	const dispatch = useDispatch();
	const { fieldSize, isGameEnd, isBlockShoot } = useSelector((state: AppStateType) => {
		const { fieldSize, isBlockShoot, isGameEnd } = state.gameReducer;
		return {
			fieldSize,
			isGameEnd,
			isBlockShoot
		};
	});
	if (!fieldSize) return null;

	const fieldItemEls: Array<ReactElement> = [];
	const maximumWidth = window.screen.availWidth;
	const maximumItemSize = 60;
	const maximumPossibleItemSize = maximumWidth / fieldSize;
	const itemSize = (() => {
		if (!fieldItemSize && maximumPossibleItemSize >= maximumItemSize) return maximumItemSize;
		if (fieldItemSize && maximumPossibleItemSize >= fieldItemSize) return fieldItemSize;
		return maximumPossibleItemSize;
	})();
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
		const isAllowedShoot = !isBlockShoot && !isGameEnd;
		fieldItemEls.push(
			<div
				onClick={() => isAllowedShoot && shootCallback && shootCallback(location)(dispatch)}
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
