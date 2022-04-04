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
	x?: number,
	y?: number
};


export const Ship = forwardRef<any, PropsType>(({ size, width, height, sizeForDrag, isVertical, x, y}, forwardedRef: any) => {
	const [ currentSize, setCurrentSize ] = useState<ShipSizeType>(size);
	const [ shiftX, setShiftX ] = useState<number>(0);
	const [ shiftY, setShiftY ] = useState<number>(0);
	const [ placeX, setPlaceX ] = useState<number | undefined>(x);
	const [ placeY, setPlaceY ] = useState<number | undefined>(y);
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
		if (placeX !== undefined && placeY !== undefined) {
			const current = ref.current;
			current.style.position = 'absolute';
			current.style.left = `${ placeX }px`;
			current.style.top = `${ placeY }px`;
		}
	});
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
		setCurrentSize(sizeForDrag || size);
		current.style.position = 'absolute';
		window.addEventListener('mousemove', drag);
		window.addEventListener('mouseup', dragEnd);
	};
	const drag = (e: any) => {
		const current = ref.current;
		const { pageX, pageY } = e;
		current.style.left = `${ pageX - shiftX }px`;
		current.style.top = `${ pageY - shiftY }px`;
	};
	const dragEnd = (e: any) => {
		const current = ref.current;
		current.style.pointerEvents = '';
		current.style.zIndex = '';
		window.removeEventListener('mousemove', drag);
		window.removeEventListener('mouseup', dragEnd);
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
			onMouseDown={setShifts}
		>
			{ shipEls }
		</div>
	);
})