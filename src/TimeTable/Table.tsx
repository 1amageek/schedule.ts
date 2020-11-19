import React, { useContext, CSSProperties } from "react"
import { Item, IndexPath, Context } from "./Context"
import Card from "./Card"
import { useSize } from "./Geometory"

const Component = () => {

	const {
		data,
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
				height: "100%"
			}}
			onMouseDown={onMouseDownOnTable}
			onMouseMove={onMouseMoveOnTable}
			onMouseUp={onMouseUpOnTable}
		>
			{columns.map(index => {
				return <>
					<Column
						key={index}
						chapter={index}
						items={data}
					/>
					{numberOfChapters - 1 !== index && <Divider direction="vertical" />}
				</>
			})}
		</div>
	)
}

const Column = ({ chapter, items }: { chapter: number, items: Item[] }) => {

	const {
		zIndex,
		step,
		numberOfSections,
		numberOfItems,
		currentItem,
		onMouseDownOnColumn,
		onMouseMoveOnColumn,
		onMouseUpOnColumn,
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
			// onMouseDown={(event) => onMouseDownOnColumn!(event, section)}
			// onMouseMove={(event) => onMouseMoveOnColumn!(event, section)}
			// onMouseUp={(event) => onMouseUpOnColumn!(event, section)}
			>
				{currentItem && currentItem.start.chapter === chapter && <Card index={items.length} item={currentItem} isRequiredShadow />}
				{
					items
						.filter(item => item.start.chapter === chapter)
						.map((item, index) => {
							return <Card key={index} index={index} item={item} />
						})
				}
			</div>
			{rows.map(index => {
				return <>
					<Row
						key={index}
						height={step * numberOfItems}
					/>
					{numberOfRows - 1 !== index && <Divider />}
				</>
			})}
		</div>
	)
}

const Row = ({ height }: { height: number }) => {

	return (
		<div
			style={{
				height: `${height}px`
			}}
		// onMouseDown={(event) => onMouseDownOnBlock!(event, indexPath)}
		// onMouseMove={(event) => onMouseMoveOnBlock!(event, indexPath)}
		// onMouseUp={(event) => onMouseUpOnBlock!(event, indexPath)}
		>

		</div>
	)
}

const Divider = ({ direction = "horizontal" }: { direction?: "vertical" | "horizontal" }) => {

	const style: CSSProperties = direction == "vertical" ?
		{
			width: "0.5px",
			boxSizing: "border-box",
			borderRight: "0.5px solid #ddd"
		} :
		{
			height: "0.5px",
			boxSizing: "border-box",
			borderBottom: "0.5px solid #ddd"
		}

	return (
		<div style={style}>
		</div>
	)
}

export default Component