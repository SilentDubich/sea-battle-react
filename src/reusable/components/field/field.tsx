import React, {
	Component,
	FC,
	forwardRef,
	ReactElement,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState
} from 'react';
import FieldCss from './field.module.css';
import ReusableCss from '../../../reusable/css/reusable.module.css';
import {FieldSizeType, getPossibleLocations, ShipsLocationsType, playerShootThunk} from '../../../date-base/reducers/game';
import {AppStateType} from '../../../date-base/store';
import {useDispatch, useSelector} from 'react-redux';

type PropsType = {
	fieldTitle?: string,
	isBlockShoot?: boolean,
	fieldSize?: FieldSizeType,
	shipsLocations?: ShipsLocationsType | null,
	fieldItemSize?: number,
	shootCallback?: Function,
	disabledBtns?: boolean,
	shootLocations?: {
		[key: string]: number | null
	} | null
};

export const getItemSize = (fieldSize: FieldSizeType | null): { maxFieldWidth: number, itemSize: number } => {
	if (!fieldSize) return { maxFieldWidth: 0, itemSize: 0 };
	const maximumWidth = window.screen.availWidth;
	const maximumItemSize = 60;
	const maximumPossibleItemSize = Math.floor(maximumWidth / fieldSize);
	const itemSize = (() => {
		if (maximumPossibleItemSize >= maximumItemSize) return maximumItemSize;
		return maximumPossibleItemSize;
	})();
	return {
		maxFieldWidth: itemSize * fieldSize,
		itemSize
	};
};

export const Field = forwardRef<any, PropsType>(
	(
		{
			shipsLocations,
			shootLocations,
			disabledBtns= false,
			fieldTitle
		},
		ref
	) => {
	const resizeRef: any = useRef();
	const dispatch = useDispatch();
	const [ fieldItemEls, setFieldItemEls ] = useState<Array<ReactElement>>([]);
	const resizeObserver = useMemo(() => {
		return new ResizeObserver(() => {
			setFieldItemEls(resize());
		});
	}, [resizeRef.current, shipsLocations]);

	useEffect(() => {
		if (resizeRef.current) resizeObserver.observe(resizeRef.current);
		return () => resizeObserver.disconnect();
	}, [resizeRef.current, shipsLocations]);

	useEffect(() => {
		setFieldItemEls(resize());
	}, [shipsLocations, shootLocations]);


	const { fieldSize } = useSelector((state: AppStateType) => {
		const { fieldSize } = state.gameReducer;
		return { fieldSize };
	});
	if (!fieldSize) return null;
	const locations = getPossibleLocations(fieldSize);
	const { maxFieldWidth } = getItemSize(fieldSize);
	const resize = () => {
		const {itemSize} = getItemSize(fieldSize);
		return locations.map(location => {
			const isShip = shipsLocations && shipsLocations[location] !== null && shipsLocations[location] !== undefined;
			const isHit = shootLocations && typeof shootLocations[location] === 'number';
			const isMiss = shootLocations && shootLocations[location] === null;
			const classes: string = (() => {
				let classes = `${ FieldCss.item }`;
				if (isShip) classes += ` ${ FieldCss.ship }`;
				if (isHit) classes += ` ${ FieldCss.hit }`;
				if (isMiss) classes += ` ${ FieldCss.miss }`;
				return classes;
			})();
			const tabindex = isHit || isMiss || isHit ? -1 : 0;
			return (
				<button
					onClick={() => dispatch(playerShootThunk(location))}
					key={location}
					id={location}
					className={classes}
					tabIndex={tabindex}
					disabled={disabledBtns}
					style={{ width: itemSize, height: itemSize, cursor: disabledBtns ? 'default' : 'pointer' }}
				/>
			)
		});
	};
	return (
		<div ref={resizeRef} style={{ width: '100%' }}>
			{ fieldTitle && <div className={ReusableCss.main_title}>{ fieldTitle }</div> }
			<div ref={ref} style={{ width: maxFieldWidth, margin: '0 auto', display: 'flex', flexWrap: 'wrap' }}>
				{ fieldItemEls }
			</div>
		</div>
	)
});


// export const Field = forwardRef<any, PropsType>(({
//       fieldTitle,
//       shipsLocations,
//       fieldItemSize,
//       shootCallback,
//       shootLocations,
//       isPrepare
// }, ref) => {
// 	// const resizeObserver = useMemo(() => {
// 	// 	return new ResizeObserver(() => {
// 	// 		resize();
// 	// 	});
// 	// 	// @ts-ignore
// 	// }, [ref.current]);
// 	const resizeRef = useRef();
// 	const [ fieldItemEls, setFieldItemEls ] = useState<Array<ReactElement>>([]);
// 	const resizeObserver = useMemo(() => {
// 		return new ResizeObserver(() => {
// 			console.log('ccccccccccccccccccasdada')
// 			setFieldItemEls(resize());
// 		});
// 		// @ts-ignore
// 	}, [resizeRef.current]);
//
//
//
// 	useEffect(() => {
// 		console.log('aaaaaaaaaaa')
// 		// @ts-ignore
// 		if (resizeRef.current) resizeObserver.observe(resizeRef.current);
// 		// @ts-ignore
// 		return () => resizeObserver.disconnect();
// 		// @ts-ignore
// 	}, [resizeRef.current]);
// 	const dispatch = useDispatch();
// 	const { fieldSize, isGameEnd, isBlockShoot } = useSelector((state: AppStateType) => {
// 		const { fieldSize, isBlockShoot, isGameEnd } = state.gameReducer;
// 		return {
// 			fieldSize,
// 			isGameEnd,
// 			isBlockShoot
// 		};
// 	});
//
// 	useEffect(() => {
// 		setFieldItemEls(resize());
// 	}, []);
// 	if (!fieldSize) return null;
// 	const locations = getPossibleLocations(fieldSize);
// 	const resize = () => {
// 		console.log('ccccccccccccccccccc')
// 		const maximumWidth = window.screen.availWidth;
// 		const maximumItemSize = 60;
// 		const maximumPossibleItemSize = maximumWidth / fieldSize;
// 		const itemSize = (() => {
// 			if (!fieldItemSize && maximumPossibleItemSize >= maximumItemSize) return maximumItemSize;
// 			if (fieldItemSize && maximumPossibleItemSize >= fieldItemSize) return fieldItemSize;
// 			return maximumPossibleItemSize;
// 		})();
// 		const maxFieldWidth = itemSize * fieldSize;
// 		return locations.map(location => {
// 			const isShip = shipsLocations && shipsLocations[location] !== null && shipsLocations[location] !== undefined;
// 			const isHit = shootLocations && typeof shootLocations[location] === 'number';
// 			const isMiss = shootLocations && shootLocations[location] === null;
// 			const classes: string = (() => {
// 				let classes = `${ FieldCss.item }`;
// 				if (isShip && !isPrepare) classes += ` ${ FieldCss.ship }`;
// 				if (isHit) classes += ` ${ FieldCss.hit }`;
// 				if (isMiss) classes += ` ${ FieldCss.miss }`;
// 				return classes;
// 			})();
// 			const tabindex = isHit || isMiss || isHit ? -1 : 0;
// 			const isAllowedShoot = !isBlockShoot && !isGameEnd;
// 			return <button
// 						onClick={() => isAllowedShoot && shootCallback?.(location)(dispatch)}
// 						key={location}
// 						id={location}
// 						className={classes}
// 						tabIndex={tabindex}
// 						style={{ width: itemSize, height: itemSize }}
// 					/>
//
// 		});
// 	};
//
//
//
//
//
// 	// @ts-ignore
// 	return (
// 		// @ts-ignore
// 		<div ref={resizeRef} style={{ width: '100%' }}>
// 			{ fieldTitle && <div className={ReusableCss.main_title}>{ fieldTitle }</div> }
// 			<div ref={ref} className={FieldCss.field_container}>
// 				{ fieldItemEls }
// 			</div>
// 		</div>
// 	)
// });
