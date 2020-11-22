import React, { useContext, CSSProperties } from "react"
import { Item, IndexPath, Context } from "./Context"
import Card from "./Card"
import { useSize } from "./Geometory"

const Component = () => {

	const {
		data,
		cursor,
		numberOfChapters,
		onMouseDownOnTable,
		onMouseMoveOnTable,
		onMouseUpOnTable
	} = useContext(Context)

	const columns = [...new Array(numberOfChapters).keys()]

	return (
		<div
			style={{
				display: "flex",
				width: "100%",
				height: "100%",
				cursor: cursor
			}}
			onMouseDown={onMouseDownOnTable}
			onMouseMove={onMouseMoveOnTable}
			onMouseUp={onMouseUpOnTable}
		>
			{columns.map(index => {
				return <Column
					key={index}
					chapter={index}
					items={data}
				/>
			})}
		</div>
	)
}

const Column = ({ chapter, items }: { chapter: number, items: Item[] }) => {

	const {
		zIndex,
		step,
		numberOfChapters,
		numberOfSections,
		numberOfItems,
		currentItem
	} = useContext(Context)

	const [ref, size] = useSize<HTMLDivElement>()
	const numberOfRows = numberOfSections
	const rows = [...new Array(numberOfRows).keys()]

	return (
		<div
			ref={ref}
			style={{
				width: "100%",
				height: "100%"
			}}
		>
			<div style={{
				position: "absolute",
				width: `${size.width}px`,
				height: `${size.height}px`,
				margin: 0,
				padding: 0,
				zIndex: zIndex
			}}
			>
				{currentItem && currentItem.start.chapter === chapter && <Card index={items.length} item={currentItem} isRequiredShadow />}
				{
					items
						.filter(item => item.start.chapter === chapter)
						.map((item, index) => {
							return <Card key={`${chapter}-${index}`} index={index} item={item} />
						})
				}
			</div>
			{rows.map(index => {
				const isRequiredBorders = []
				if (numberOfSections - 1 !== index) isRequiredBorders.push("bottom")
				if (numberOfChapters - 1 !== chapter) isRequiredBorders.push("right")
				return <Row
					key={index}
					height={step * numberOfItems}
					isRequiredBorders={isRequiredBorders}
				/>
			})}
		</div>
	)
}

const Row = ({ height, isRequiredBorders = [] }: { height: number, isRequiredBorders: string[] }) => {

	const style: CSSProperties = {
		height: `${height}px`,
		width: "100%",
		boxSizing: "border-box"
	}

	if (isRequiredBorders.includes("top")) {
		style["borderTop"] = "0.5px solid #ddd"
	}

	if (isRequiredBorders.includes("bottom")) {
		style["borderBottom"] = "0.5px solid #ddd"
	}

	if (isRequiredBorders.includes("left")) {
		style["borderLeft"] = "0.5px solid #ddd"
	}

	if (isRequiredBorders.includes("right")) {
		style["borderRight"] = "0.5px solid #ddd"
	}

	return (
		<div
			style={style}
		>
		</div>
	)
}

export default Component