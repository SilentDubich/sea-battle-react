import React, {FC, forwardRef, PointerEventHandler, useEffect, useRef, useState} from 'react';
import FieldCss from '../../../reusable/components/field/field.module.css';
import {ShipSizeType} from '../../../date-base/reducers/game';
import { getItemSize } from '../../../reusable/components/field/field';
import {useSelector} from 'react-redux';
import {AppStateType} from '../../../date-base/store';



type PropsType = {
	id: number,
	size: ShipSizeType,
	isVertical: boolean,
	x?: number | null,
	y?: number | null,
	moveCallback?: any,
	endMoveCallback?: any
};


export const Ship: FC<PropsType> = ({ id, size, isVertical, x, y, moveCallback, endMoveCallback }) => {
	const [ shiftX, setShiftX ] = useState<number>(0);
	const [ shiftY, setShiftY ] = useState<number>(0);
	const [ width, setWidth ] = useState<number>(0);
	const [ height, setHeight ] = useState<number>(0);
	const [ isVerticalValue, setIsVerticalValue ] = useState<boolean>(isVertical);
	const { fieldSize } = useSelector((state: AppStateType) => {
		const { fieldSize } = state.gameReducer;
		return { fieldSize };
	});
	const ref: any = useRef();

	useEffect(() => {
		setIsVerticalValue(isVertical);
	}, [isVertical]);
	const resizeShip = () => {
		const { itemSize } = getItemSize(fieldSize);
		const width = itemSize * (size ?? 0);
		setWidth(width);
		setHeight(itemSize);
	};
	useEffect(() => {
		window.addEventListener('resize', resizeShip);
		return () => window.removeEventListener('resize', resizeShip);
	}, [ref.current]);
	useEffect(() => {
		resizeShip();
	}, []);

	useEffect(() => {
		const current = ref.current;
		const isValid = (coord: number | null | undefined) => {
			return coord !== null && coord !== undefined;
		};
		if (isValid(x) && isValid(y)) {
			current.style.position = 'absolute';
			current.style.left = `${ x }px`;
			current.style.top = `${ y }px`;
		}
		else {
			current.style.position = 'static';
			current.style.left = '';
			current.style.top = '';
			setIsVerticalValue(false);
		}
	}, [ x, y ]);
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
		const { pointerType } = e;
		const { eventMove, eventEnd } = getEvents(pointerType);
		window.addEventListener(eventMove, drag);
		window.addEventListener(eventEnd, dragEnd);
		current.onWheel = switchIsVertical;
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
		current.style.zIndex = '';
		const { pointerType } = e;
		const { eventMove, eventEnd } = getEvents(pointerType);
		window.removeEventListener(eventMove, drag);
		window.removeEventListener(eventEnd, dragEnd);
		current.onWheel = null;
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
	const shipEls: Array<JSX.Element> = [];
	for (let i = 0; i < size; i++) {
		shipEls.push(<div className={FieldCss.ship} style={{flex: 1, height: '100%'}}></div>);
	}
	return (
		<div
			className={classes}
			ref={ref}
			onPointerDown={setShifts}
			id={id.toString()}
			style={{
				width,
				height
			}}
		>
			{ shipEls }
		</div>
	);
};