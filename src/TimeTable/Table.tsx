import React, { useContext, CSSProperties } from "react"
import { Item, IndexPath, Context } from "./Context"
import Card from "./Card"
import { useSize } from "./Geometory"

const Component = ({ numberOfSections, numberOfRows, numberOfColumns }: { numberOfSections: number, numberOfRows: number, numberOfColumns: number }) => {

	const {
		zIndex,
		step,
		numberOfStepsForSection,
		size,
		data,
		currentItem,
		onMouseDownOnTable,
		onMouseMoveOnTable,
		onMouseUpOnTable
	} = useContext(Context)

	const columns = [...new Array(numberOfColumns).keys()]

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
						section={index}
						numberOfRows={numberOfRows}
						items={data[index] ?? []}
					/>
					{numberOfRows - 1 !== index && <Divider direction="vertical" />}
				</>
			})}
		</div>
	)
}

const Column = ({ section, numberOfRows, items }: { section: number, numberOfRows: number, items: Item[] }) => {

	const {
		zIndex,
		step,
		numberOfStepsForSection,
		currentItem,
		onMouseDownOnColumn,
		onMouseMoveOnColumn,
		onMouseUpOnColumn,
	} = useContext(Context)

	const [ref, size] = useSize<HTMLDivElement>()

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
				onMouseDown={(event) => onMouseDownOnColumn!(event, section)}
				onMouseMove={(event) => onMouseMoveOnColumn!(event, section)}
				onMouseUp={(event) => onMouseUpOnColumn!(event, section)}
			>
				{currentItem && currentItem.section === section && <Card indexPath={{ section, item: items.length }} item={currentItem} isRequiredShadow />}
				{
					items.map((item, index) => {
						const indexPath = { section, item: index }
						return <Card key={index} indexPath={indexPath} item={item} />
					})
				}
			</div>
			{rows.map(index => {
				return <>
					<div
						key={index}
						style={{
							height: `${step * numberOfStepsForSection}px`
						}}
					>
					</div>
					{numberOfRows - 1 !== index && <Divider />}
				</>
			})}
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