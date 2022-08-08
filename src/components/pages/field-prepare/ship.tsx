import React, {FC, forwardRef, PointerEventHandler, useEffect, useRef, useState} from 'react';
import FieldCss from '../../../reusable/components/field/field.module.css';
import {ShipSizeType} from '../../../date-base/reducers/game';



type PropsType = {
	id: number,
	size: ShipSizeType,
	width: number,
	height: number,
	isVertical: boolean,
	x?: number | null,
	y?: number | null,
	moveCallback?: any,
	endMoveCallback?: any
};


export const Ship: FC<PropsType> = ({ id, size, width, height, isVertical, x, y, moveCallback, endMoveCallback }) => {
	const [ shiftX, setShiftX ] = useState<number>(0);
	const [ shiftY, setShiftY ] = useState<number>(0);
	const [ placeX, setPlaceX ] = useState<number | undefined | null>(x);
	const [ placeY, setPlaceY ] = useState<number | undefined | null>(y);
	const [ isVerticalValue, setIsVerticalValue ] = useState<boolean>(isVertical);
	const ref: any = useRef();
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
		const current = ref.current;
		const isValid = (coord: number | null | undefined) => {
			return coord !== null && coord !== undefined;
		};
		if (isValid(placeX) && isValid(placeY)) {
			current.style.position = 'absolute';
			current.style.left = `${ placeX }px`;
			current.style.top = `${ placeY }px`;
			console.group();
			console.log('placeX', placeX);
			console.log('placeY', placeY);
			console.log('x', x);
			console.log('y', y);
			console.groupEnd();
		}
		else {
			current.style.position = 'static';
			current.style.left = '';
			current.style.top = '';
			current.style.pointerEvents = '';
			current.style.touchAction = '';
			setIsVerticalValue(false);
		}
	}, [ placeX, placeY ]);
	const calculateShift = (clientCoord: number, shipCoord: number) => {
		return clientCoord - shipCoord;
	};
	const getEvents = (pointerType: string): { eventMove: 'pointermove' | 'touchmove', eventEnd: 'pointerup' | 'touchend' } => {
		const isDesktop = pointerType === 'mouse';
		const eventMove = isDesktop ? 'pointermove' : 'touchmove';
		const eventEnd = isDesktop ? 'pointerup' : 'touchend';
		return { eventMove, eventEnd };
	};
	const setShifts = (e: any) => {
		const current = ref.current;
		const { x, y } = current.getBoundingClientRect();
		const { clientX, clientY } = e;
		const shiftX = calculateShift(clientX, x);
		const shiftY = calculateShift(clientY, y);
		setShiftX(shiftX);
		setShiftY(shiftY);
		current.style.position = 'absolute';
		current.style.touchAction = 'none';
		current.style.pointerEvents = 'none';
		const { pointerType } = e;
		const { eventMove, eventEnd } = getEvents(pointerType);
		window.addEventListener(eventMove, drag);
		window.addEventListener(eventEnd, dragEnd);
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
		const touches = e.targetTouches && e.targetTouches[0];
		const { pageX, pageY } = touches || e;
		current.style.left = `${ pageX - shiftX }px`;
		current.style.top = `${ pageY - shiftY }px`;
		moveCallback && moveCallback(current, tempVertical, size);
	};
	const dragEnd = (e: any) => {
		const current = ref.current;
		current.style.pointerEvents = '';
		current.style.zIndex = '';
		current.style.touchAction = 'auto';
		const { pointerType } = e;
		const { eventMove, eventEnd } = getEvents(pointerType);
		window.removeEventListener(eventMove, drag);
		window.removeEventListener(eventEnd, dragEnd);
		endMoveCallback && endMoveCallback(current, tempVertical);
		if (x && y) {
			current.style.left = `${ x }px`;
			current.style.top = `${ y }px`;
			setPlaceX(x);
			setPlaceX(y);
		}
		else {
			current.style.position = 'static';
			setIsVerticalValue(false);
			setPlaceX(null);
			setPlaceX(null);
		}
	};
	const classes = `${ isVerticalValue ? FieldCss.vertical_ship : FieldCss.horizontal_ship }`;
	const shipEls: Array<JSX.Element> = [];
	for (let i = 0; i < size; i++) {
		shipEls.push(<div className={FieldCss.ship} style={{ width, height, backgroundColor: 'inherit' }}></div>);
	}
	return (
		<div
			className={classes}
			ref={ref}
			onPointerDown={setShifts}
			onWheel={switchIsVertical}
			id={id.toString()}
		>
			{ shipEls }
		</div>
	);
};