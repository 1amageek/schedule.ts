import React, { useContext, CSSProperties, ReactElement, cloneElement } from "react"
import { useItemCellProvider, Context, Provider, ItemHandler } from "./Context"
import { useSize } from "@1amageek/geometory"
import { useLayout } from "../Layout"
import { Data } from "../Data"

interface Props {
	initialData: Data[]
	idProvider: () => string
	onCreate: ItemHandler
	onDelete: ItemHandler
	children: ReactElement
}

export const Table = ({ initialData, idProvider, onCreate, onDelete, children }: Props) => {
	return (
		<Provider
			initialData={initialData}
			idProvider={idProvider}
			onCreate={onCreate}
			onDelete={onDelete}
		>
			<Content>
				{children}
			</Content>
		</Provider>
	)
}

const Content = ({ children }: { children: ReactElement }) => {

	const {
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
				return (
					<Column
						key={index}
						chapter={index}
					>
						{children}
					</Column>
				)
			})}
		</div>
	)
}

const Column = ({ chapter, children }: { chapter: number, children: ReactElement }) => {

	const { zIndex } = useContext(Context)
	const [ref, size] = useSize<HTMLDivElement>()

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
				<Canvas chapter={chapter}>
					{children}
				</Canvas>
			</div>
			<Background chapter={chapter} />
		</div>
	)
}

const Canvas = ({ chapter, children }: { chapter: number, children: ReactElement }) => {
	const {
		currentItem,
		numberOfChapters,
		numberOfSections,
		numberOfItems,
		data
	} = useContext(Context)

	const _items = useItemCellProvider(data).filter(item => item.start.chapter === chapter && item.end.chapter === chapter)
	const _currentItems = useItemCellProvider(currentItem ? [currentItem] : []).filter(item => item.start.chapter === chapter && item.end.chapter === chapter)

	const items = useLayout(_items, {
		numberOfChapters,
		numberOfSections,
		numberOfItems
	})

	const currentItems = useLayout(_currentItems, {
		numberOfChapters,
		numberOfSections,
		numberOfItems
	})

	return (
		<div style={{
			width: "100%",
			height: "100%",
			margin: 0,
			padding: 0
		}}
		>
			<>
				{
					currentItems
						.filter(item => item.start.chapter === chapter)
						.map((layoutAttributes, index) => {
							const newChildren = cloneElement(children, {
								key: `${chapter}-${index}`,
								index: items.length,
								layoutAttributes: layoutAttributes,
								isDragging: true
							})
							return (
								<div key={`${chapter}-${index}`}>{newChildren}</div>
							)
						})
				}
			</>
			<>
				{
					items
						.filter(item => item.start.chapter === chapter)
						.map((layoutAttributes, index) => {
							const newChildren = cloneElement(children, {
								key: `${chapter}-${index}`,
								index: index,
								layoutAttributes: layoutAttributes,
								isDragging: false
							})
							return (
								<div key={`${chapter}-${index}`}>{newChildren}</div>
							)
						})
				}
			</>
		</div>
	)
}

const Background = ({ chapter }: { chapter: number }) => {
	const {
		step,
		numberOfChapters,
		numberOfSections,
		numberOfItems,
	} = useContext(Context)
	const numberOfRows = numberOfSections
	const rows = [...new Array(numberOfRows).keys()]
	return (
		<>
			{
				rows.map(index => {
					const isRequiredBorders = []
					if (numberOfSections - 1 !== index) isRequiredBorders.push("bottom")
					if (numberOfChapters - 1 !== chapter) isRequiredBorders.push("right")
					return <Row
						key={index}
						height={step * numberOfItems}
						isRequiredBorders={isRequiredBorders}
					/>
				})
			}
		</>
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
