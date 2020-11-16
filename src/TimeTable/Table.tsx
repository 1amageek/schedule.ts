import React, { useContext, CSSProperties } from "react"
import { Context } from "./Context"
import Card from "./Card"

const Component = ({ numberOfRows = 24 }: { numberOfRows?: number }) => {

	const {
		zIndex,
		step,
		numberOfStepsForSection,
		size,
		items,
		currentItem,
		onMouseDownOnItem,
		onMouseMoveOnItem,
		onMouseUpOnItem,
		onMouseDownOnTable,
		onMouseMoveOnTable,
		onMouseUpOnTable
	} = useContext(Context)

	const columns = [...new Array(numberOfRows).keys()]
	const zIndexOffset = zIndex + 10

	return (
		<>
			<div style={{
				position: "absolute",
				width: `${size.width}px`,
				height: `${size.height}px`,
				margin: 0,
				padding: 0,
				zIndex: zIndex
			}}
				onMouseDown={onMouseDownOnTable}
				onMouseMove={onMouseMoveOnTable}
				onMouseUp={onMouseUpOnTable}
			>
				{currentItem && <Card index={items.length} item={currentItem} isRequiredShadow />}
				{
					items.map((item, index) => {
						return <Card key={index} index={index} item={item} />
					})
				}
			</div>
			{columns.map(index => {
				return <HourBlock
					key={index}
					height={step * numberOfStepsForSection}
					isBorderReauired={numberOfRows - 1 !== index}
				/>
			})}
		</>
	)
}

const HourBlock = ({ height, isBorderReauired }: { height: number, isBorderReauired?: boolean }) => {
	let style: CSSProperties = {
		height: `${height}px`,
		width: "100%",
		boxSizing: "border-box"
	}

	if (!!isBorderReauired) {
		style = {
			...style,
			borderBottom: "0.5px solid #ddd"
		}
	}

	return (
		<div style={style}>
		</div>
	)
}

export default Component