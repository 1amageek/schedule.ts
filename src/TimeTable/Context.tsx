import React, { useState, createContext, useLayoutEffect, Dispatch, useMemo, useEffect } from "react"
import { useSize, Size, Point, Rect } from "./Geometory"

const STEP = 12
const NUBMER_OF_STEPS_FOR_SECTION = 4
const NUMBER_OF_SECTIONS = 24
const NUMBER_OF_ROWS = NUBMER_OF_STEPS_FOR_SECTION * NUMBER_OF_SECTIONS
const NUMBER_OF_COLUMNS = 7
const ZINDEX = 100

export interface Item {
	section?: number
	index?: number
	start: {
		section: number
		index: number
	}
	end: {
		section: number
		index: number
	}
	frame?: Rect
}

export type Data = Item[][]

export interface IndexPath {
	section: number
	item: number
}

interface TouchEvent {
	target?: {
		initial: Rect
	}
	section: number
	start: Point
	end: Point
	translation: Point
}

interface Props {
	size: Size
	step: number
	numberOfStepsForSection: number
	numberOfSections: number
	numberOfRows: number
	numberOfColumns: number
	onMouseDownOnTable?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
	onMouseMoveOnTable?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
	onMouseUpOnTable?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
	onMouseDownOnColumn?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, section: number) => void
	onMouseMoveOnColumn?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, section: number) => void
	onMouseUpOnColumn?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, section: number) => void
	onMouseDownOnItem?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, indexPath: IndexPath) => void
	onMouseMoveOnItem?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, indexPath: IndexPath) => void
	onMouseUpOnItem?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, indexPath: IndexPath) => void
	onMouseDownOnItemBottomEdge?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
	onMouseMoveOnItemBottomEdge?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
	onMouseUpOnItemBottomEdge?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void

	currentItem?: Item | undefined
	data: Data

	selectedIndex?: number | undefined
	setSelectedIndex?: Dispatch<number | undefined>
	zIndex: number
}

export const Context = createContext<Props>({
	size: { width: 0, height: 0 },
	step: STEP,
	zIndex: ZINDEX,
	numberOfStepsForSection: NUBMER_OF_STEPS_FOR_SECTION,
	numberOfSections: NUMBER_OF_SECTIONS,
	numberOfRows: NUMBER_OF_ROWS,
	numberOfColumns: NUMBER_OF_COLUMNS,
	data: [[]]
})

export const Provider = ({
	initialData,
	onCreate,
	zIndex = ZINDEX,
	step = STEP,
	numberOfStepsForSection = NUBMER_OF_STEPS_FOR_SECTION,
	numberOfSections = NUMBER_OF_SECTIONS,
	numberOfRows = NUMBER_OF_COLUMNS,
	numberOfColumns = NUMBER_OF_COLUMNS,
	children
}: {
	initialData: Data,
	onCreate: (item: Item, done: (item: Item) => void) => void,
	zIndex?: number,
	step?: number,
	numberOfStepsForSection?: number,
	numberOfSections?: number,
	numberOfRows?: number,
	numberOfColumns?: number,
	children: any
}) => {

	const [selectedIndex, setSelectedIndex] = useState<number | undefined>()
	const [tableEvent, setTableEvent] = useState<TouchEvent | undefined>()
	const [columnEvent, setColumnEvent] = useState<TouchEvent | undefined>()
	const [itemEvent, setItemEvent] = useState<TouchEvent | undefined>()
	const [itemBottomEdgeEvent, setItemBottomEdgeEvent] = useState<TouchEvent | undefined>()
	const [data, setData] = useState<Data>(initialData)
	const [ref, size] = useSize<HTMLDivElement>()
	const [currentItem, setCurrentItem] = useState<Item | undefined>()

	useLayoutEffect(() => {
		if (columnEvent) {
			const start = Math.min(columnEvent.end.y, columnEvent.start.y)
			const end = Math.max(columnEvent.end.y, columnEvent.start.y)
			const height = Math.round((end - start) / step) * step
			setCurrentItem({
				section: columnEvent.section,
				frame: {
					origin: {
						x: 0,
						y: start
					},
					size: {
						width: 100,
						height
					}
				}
			})
		}
	}, [JSON.stringify(columnEvent)])

	useLayoutEffect(() => {
		if (itemEvent && currentItem) {
			const initialFrame = itemEvent.target!.initial
			const y = Math.round((initialFrame.origin.y + itemEvent.translation.y) / step) * step
			const height = initialFrame.size.height
			setCurrentItem({
				index: selectedIndex,
				frame: {
					origin: {
						x: 0,
						y
					},
					size: {
						width: 100,
						height
					}
				}
			})
		}
	}, [JSON.stringify(itemEvent)])

	useLayoutEffect(() => {
		if (itemBottomEdgeEvent && currentItem) {
			const initialFrame = itemBottomEdgeEvent.target!.initial
			const y = initialFrame.origin.y
			const height = Math.round((initialFrame.size.height + itemBottomEdgeEvent.translation.y) / step) * step
			setCurrentItem({
				index: selectedIndex,
				frame: {
					origin: {
						x: 0,
						y
					},
					size: {
						width: 100,
						height
					}
				}
			})
		}
	}, [JSON.stringify(itemBottomEdgeEvent)])

	const onMouseDownOnTable = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		// event.stopPropagation()
		// const bounds = ref.current?.getBoundingClientRect()
		// if (bounds) {
		// 	const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
		// 	setTableEvent({ start: point, end: point, translation: { x: 0, y: 0 } })
		// }
	}

	const onMouseMoveOnTable = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		// event.stopPropagation()
		// if (tableEvent) {
		// 	const bounds = ref.current?.getBoundingClientRect()
		// 	if (bounds) {
		// 		const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
		// 		const translation = {
		// 			x: point.x - tableEvent.start.x,
		// 			y: point.y - tableEvent.start.y
		// 		}
		// 		setTableEvent({ start: tableEvent.start, end: point, translation })
		// 	}
		// }
		// if (itemBottomEdgeEvent) {
		// 	const bounds = ref.current?.getBoundingClientRect()
		// 	if (bounds) {
		// 		const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
		// 		const translation = {
		// 			x: point.x - itemBottomEdgeEvent.start.x,
		// 			y: point.y - itemBottomEdgeEvent.start.y
		// 		}
		// 		console.log(translation)
		// 		setItemBottomEdgeEvent({ start: itemBottomEdgeEvent.start, end: point, translation, target: itemBottomEdgeEvent.target })
		// 	}
		// }
	}

	const onMouseUpOnTable = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		// event.stopPropagation()
		// if (tableEvent && currentItem) {
		// 	setTableEvent(undefined)
		// 	// onCreate(currentItem, (item) => {
		// 	// setItems([...items, currentItem])
		// 	setCurrentItem(undefined)
		// 	// })
		// }
	}

	const onMouseDownOnColumn = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, section: number) => {
		event.stopPropagation()
		const bounds = ref.current?.getBoundingClientRect()
		if (bounds) {
			const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
			setColumnEvent({ section, start: point, end: point, translation: { x: 0, y: 0 } })
		}
	}

	const onMouseMoveOnColumn = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, section: number) => {
		event.stopPropagation()
		if (columnEvent) {
			const bounds = ref.current?.getBoundingClientRect()
			if (bounds) {
				const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
				const translation = {
					x: point.x - columnEvent.start.x,
					y: point.y - columnEvent.start.y
				}
				setColumnEvent({ section, start: columnEvent.start, end: point, translation })
			}
		}
	}

	const onMouseUpOnColumn = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, section: number) => {
		event.stopPropagation()
		if (columnEvent && currentItem) {
			setColumnEvent(undefined)
			// onCreate(currentItem, (item) => {
			// setItems([...items, currentItem])
			setCurrentItem(undefined)
			// })
		}
	}

	const onMouseDownOnItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, indexPath: IndexPath) => {
		if (tableEvent) return
		event.stopPropagation()
		const bounds = ref.current?.getBoundingClientRect()
		if (bounds) {
			const target = event.target as HTMLDivElement
			const targetBounds = target.getBoundingClientRect()
			const frame = {
				origin: {
					x: 0,
					y: targetBounds.top - bounds.top
				},
				size: {
					width: 100,
					height: targetBounds.height
				}
			}
			const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
			setItemEvent({
				section: indexPath.section,
				start: point,
				end: point,
				translation: { x: 0, y: 0 },
				target: {
					initial: frame
				}
			})
			setCurrentItem({ frame })
		}
	}

	const onMouseMoveOnItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, indexPath: IndexPath) => {
		if (tableEvent) return
		event.stopPropagation()
		if (itemEvent) {
			const bounds = ref.current?.getBoundingClientRect()
			if (bounds) {
				const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
				const translation = {
					x: point.x - itemEvent.start.x,
					y: point.y - itemEvent.start.y
				}
				setItemEvent({
					section: indexPath.section,
					start: itemEvent.start,
					end: point, translation,
					target: itemEvent.target
				})
			}
		}
	}

	const onMouseUpOnItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, indexPath: IndexPath) => {
		if (tableEvent) return
		event.stopPropagation()
		if (currentItem && itemEvent) {
			// const currentItems = [...items]
			// currentItems.splice(currentItem.index!, 1, currentItem)
			// setItems([
			// 	...currentItems
			// ])
			setItemEvent(undefined)
			setCurrentItem(undefined)
		}
	}

	// const onMouseDownOnItemBottomEdge = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
	// 	if (tableEvent || itemEvent) return
	// 	event.stopPropagation()
	// 	const bounds = ref.current?.getBoundingClientRect()
	// 	if (bounds) {
	// 		const target = event.target as HTMLDivElement
	// 		const targetBounds = target.parentElement!.getBoundingClientRect()
	// 		const frame = {
	// 			origin: {
	// 				x: 0,
	// 				y: targetBounds.top - bounds.top
	// 			},
	// 			size: {
	// 				width: 100,
	// 				height: targetBounds.height
	// 			}
	// 		}
	// 		const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
	// 		setItemBottomEdgeEvent({
	// 			section: indexPath.section,
	// 			start: point,
	// 			end: point,
	// 			translation: { x: 0, y: 0 },
	// 			target: {
	// 				initial: frame
	// 			}
	// 		})
	// 		setCurrentItem({ frame })
	// 	}
	// }

	// const onMouseMoveOnItemBottomEdge = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
	// 	if (tableEvent || itemEvent) return
	// 	event.stopPropagation()
	// 	if (itemBottomEdgeEvent) {
	// 		const bounds = ref.current?.getBoundingClientRect()
	// 		if (bounds) {
	// 			const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
	// 			const translation = {
	// 				x: point.x - itemBottomEdgeEvent.start.x,
	// 				y: point.y - itemBottomEdgeEvent.start.y
	// 			}
	// 			console.log(translation)
	// 			setItemBottomEdgeEvent({ start: itemBottomEdgeEvent.start, end: point, translation, target: itemBottomEdgeEvent.target })
	// 		}
	// 	}
	// }

	// const onMouseUpOnItemBottomEdge = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
	// 	if (tableEvent || itemEvent) return
	// 	event.stopPropagation()
	// 	if (currentItem && itemBottomEdgeEvent) {
	// 		const currentItems = [...items]
	// 		currentItems.splice(currentItem.index!, 1, currentItem)
	// 		setItems([
	// 			...currentItems
	// 		])
	// 		setItemBottomEdgeEvent(undefined)
	// 		setCurrentItem(undefined)
	// 	}
	// }

	return (
		<Context.Provider value={{
			zIndex,
			size,
			step,
			numberOfStepsForSection,
			numberOfSections,
			numberOfRows,
			numberOfColumns,
			onMouseDownOnTable,
			onMouseMoveOnTable,
			onMouseUpOnTable,
			onMouseDownOnColumn,
			onMouseMoveOnColumn,
			onMouseUpOnColumn,
			onMouseDownOnItem,
			onMouseMoveOnItem,
			onMouseUpOnItem,
			// onMouseDownOnItemBottomEdge,
			// onMouseMoveOnItemBottomEdge,
			// onMouseUpOnItemBottomEdge,
			currentItem,
			data,
			selectedIndex,
			setSelectedIndex
		}}>
			<div
				ref={ref}
				style={{
					width: "100%",
					margin: 0,
					padding: 0
				}}
			>
				{children}
			</div>
		</Context.Provider >
	)
}
