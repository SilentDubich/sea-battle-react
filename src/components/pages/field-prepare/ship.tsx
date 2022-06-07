import React, {FC, forwardRef, useEffect, useState} from 'react';
import FieldCss from '../../../reusable/components/field/field.module.css';
import {ShipSizeType} from '../../../date-base/reducers/game';



type PropsType = {
	id: number,
	size: ShipSizeType,
	width: number,
	height: number,
	sizeForDrag?: ShipSizeType,
	isVertical: boolean,
	x?: number | null,
	y?: number | null,
	moveCallback?: any,
	endMoveCallback?: any
};


export const Ship = forwardRef<any, PropsType>(({ id, size, width, height, sizeForDrag, isVertical, x, y, moveCallback, endMoveCallback }, forwardedRef: any) => {
	const [ currentSize, setCurrentSize ] = useState<ShipSizeType>(size);
	const [ shiftX, setShiftX ] = useState<number>(0);
	const [ shiftY, setShiftY ] = useState<number>(0);
	const [ placeX, setPlaceX ] = useState<number | undefined | null>(x);
	const [ placeY, setPlaceY ] = useState<number | undefined | null>(y);
	const [ isVerticalValue, setIsVerticalValue ] = useState<boolean>(isVertical);
	const [ ref, setRef ] = useState<any>(forwardedRef || React.createRef<any>());
	const shipEls: Array<JSX.Element> = [];
	for (let i = 0; i < currentSize; i++) {
		shipEls.push(<div className={FieldCss.ship} style={{ width, height, backgroundColor: 'inherit' }}></div>);
	}
	useEffect(() => {
		setPlaceX(x);
	}, [x]);

	useEffect(() => {
		setPlaceY(y);
	}, [y]);

	useEffect(() => {
		setIsVerticalValue(isVertical);
	}, [isVertical]);

	useEffect(() => {
		setCurrentSize(size);
	}, [size]);

	useEffect(() => {
		const current = ref.current;
		if (placeX && placeY) {
			current.style.position = 'absolute';
			current.style.left = `${ placeX }px`;
			current.style.top = `${ placeY }px`;
			current.style.pointerEvents = 'none';
			current.style.touchAction = 'none';
		}
		else {
			current.style.position = 'static';
			current.style.left = '';
			current.style.top = '';
			current.style.pointerEvents = '';
			current.style.touchAction = '';
		}
	}, [ placeX, placeY ]);
	const calculateShift = (clientCoord: number, shipCoord: number) => {
		return clientCoord - shipCoord;
	};
	const setShifts = (e: any) => {
		const current = ref.current;
		const { x, y } = current.getBoundingClientRect();
		const { pageX, pageY, clientX, clientY } = e;
		const shiftX = calculateShift(clientX, x);
		const shiftY = calculateShift(clientY, y);
		setShiftX(shiftX);
		setShiftY(shiftY);
		current.style.position = 'absolute';
		current.style.pointerEvents = 'none';
		current.style.touchAction = 'none';
		window.addEventListener('pointermove', drag);
		window.addEventListener('pointerup', dragEnd);
		window.addEventListener('wheel', switchIsVertical);
	};
	let tempVertical = isVertical;
	const switchIsVertical = () => {
		const current = ref.current;
		setIsVerticalValue(!tempVertical);
		tempVertical = !tempVertical;
		moveCallback && moveCallback(current, tempVertical, size);
	};
	const drag = (e: any) => {
		const current = ref.current;
		const { pageX, pageY } = e;
		current.style.left = `${ pageX - shiftX }px`;
		current.style.top = `${ pageY - shiftY }px`;
		moveCallback && moveCallback(current, tempVertical, size);
	};
	const dragEnd = (e: any) => {
		const current = ref.current;
		current.style.pointerEvents = '';
		current.style.zIndex = '';
		current.style.touchAction = '';
		window.removeEventListener('pointermove', drag);
		window.removeEventListener('pointerup', dragEnd);
		window.removeEventListener('wheel', switchIsVertical);
		endMoveCallback && endMoveCallback(current, tempVertical);
		if (x && y) {
			current.style.left = `${ x }px`;
			current.style.top = `${ y }px`;
		}
		else {
			current.style.position = 'static';
			setIsVerticalValue(false);
		}
	};
	const classes = `${ isVerticalValue ? FieldCss.vertical_ship : FieldCss.horizontal_ship }`;
	return (
		<div
			className={classes}
			ref={ref}
			onPointerDown={setShifts}
			id={id.toString()}
		>
			{ shipEls }
		</div>
	);
})