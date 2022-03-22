import React, {FC, useState} from 'react';
import FieldCss from '../../../reusable/components/field/field.module.css';
import {ShipSize} from '../../../date-base/reducers/game';



type PropsType = {
	id: number,
	size: ShipSize,
	width: number,
	height: number,
	sizeForDrag?: ShipSize
};


export const Ship: FC<PropsType> = ({ size, width, height, sizeForDrag }) => {
	const [ currentSize, setCurrentSize ] = useState<ShipSize>(size);
	const [ shiftX, setShiftX ] = useState<number>(0);
	const [ shiftY, setShiftY ] = useState<number>(0);
	const [ isVertical, setIsVertical ] = useState<boolean>(false);
	const shipEls: Array<JSX.Element> = [];
	for (let i = 0; i < currentSize; i++) {
		shipEls.push(<div className={FieldCss.ship} style={{ width, height, backgroundColor: 'inherit' }}></div>);
	}
	const ref = React.createRef<any>();
	const calculateShift = (clientCoord: number, shipCoord: number) => {
		return clientCoord - shipCoord;
	};
	const setShifts = (e: any) => {
		const current = ref.current;
		const { x, y } = current.getBoundingClientRect();
		const { clientX, clientY } = e;
		setShiftX(calculateShift(clientX, x));
		setShiftY(calculateShift(clientY, y));
		setCurrentSize(sizeForDrag || size);
	};
	const dragStart = () => {
		const current = ref.current;
		current.style.position = 'absolute';
		current.style.cursor = 'default';
	};
	const drag = (e: any) => {
		const current = ref.current;
		const { pageX, pageY } = e;
		current.style.left = `${ pageX - shiftX }px`;
		current.style.top = `${ pageY - shiftY }px`;
	};
	const dragEnd = () => {
		const current = ref.current;
		current.style.position = 'static';
		current.style.cursor = 'default';
	};
	const classes = `${ isVertical ? FieldCss.vertical_ship : FieldCss.horizontal_ship }`;
	return (
		<div
			className={classes}
			ref={ref}
			onMouseDown={setShifts}
			onDragEnter={dragStart}
			onDragCapture={drag}
			onDragEndCapture={dragEnd}
		>
			{ shipEls }
		</div>
	);
}