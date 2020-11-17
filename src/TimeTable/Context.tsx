import React, { useState, createContext, useLayoutEffect, Dispatch, useMemo, useEffect } from "react"
import { useSize, Size, Point, Rect } from "./Geometory"

const STEP = 12
const NUBMER_OF_STEPS_FOR_SECTION = 4
const NUMBER_OF_SECTIONS = 24
const ZINDEX = 100

export interface Item {
	index?: number
	frame: Rect
}

interface TouchEvent {
	target?: {
		initial: Rect
	}
	start: Point
	end: Point
	translation: Point
}

interface Props {
	size: Size
	step: number
	numberOfStepsForSection: number
	numberOfSections: number
	onMouseDownOnTable?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
	onMouseMoveOnTable?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
	onMouseUpOnTable?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
	onMouseDownOnItem?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
	onMouseMoveOnItem?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
	onMouseUpOnItem?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void

	currentItem?: Item | undefined
	items: Item[]

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
	items: []
})

export const Provider = ({
	initialItems,
	onCreate,
	zIndex = ZINDEX,
	step = STEP,
	numberOfStepsForSection = NUBMER_OF_STEPS_FOR_SECTION,
	numberOfSections = NUMBER_OF_SECTIONS,
	children
}: {
	initialItems: Item[],
	onCreate: (item: Item, done: (item: Item) => void) => void,
	zIndex?: number,
	step?: number,
	numberOfStepsForSection?: number,
	numberOfSections?: number,
	children: any
}) => {

	const [selectedIndex, setSelectedIndex] = useState<number | undefined>()
	const [tableEvent, setTableEvent] = useState<TouchEvent | undefined>()
	const [itemEvent, setItemEvent] = useState<TouchEvent | undefined>()
	const [items, setItems] = useState<Item[]>(initialItems)
	const [ref, size] = useSize<HTMLDivElement>()
	const [currentItem, setCurrentItem] = useState<Item | undefined>()

	useLayoutEffect(() => {
		if (tableEvent) {
			const start = Math.min(tableEvent.end.y, tableEvent.start.y)
			const end = Math.max(tableEvent.end.y, tableEvent.start.y)
			const height = Math.round((end - start) / step) * step
			setCurrentItem({
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
	}, [JSON.stringify(tableEvent)])

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

	const onMouseDownOnTable = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.stopPropagation()
		const bounds = ref.current?.getBoundingClientRect()
		if (bounds) {
			const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
			setTableEvent({ start: point, end: point, translation: { x: 0, y: 0 } })
		}
	}

	const onMouseMoveOnTable = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.stopPropagation()
		if (tableEvent) {
			const bounds = ref.current?.getBoundingClientRect()
			if (bounds) {
				const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
				const translation = {
					x: point.x - tableEvent.start.x,
					y: point.y - tableEvent.start.y
				}
				setTableEvent({ start: tableEvent.start, end: point, translation })
			}
		}
	}

	const onMouseUpOnTable = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.stopPropagation()
		if (tableEvent && currentItem) {
			setTableEvent(undefined)
			// onCreate(currentItem, (item) => {
			setItems([...items, currentItem])
			setCurrentItem(undefined)
			// })
		}
	}

	const onMouseDownOnItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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

	const onMouseMoveOnItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
				setItemEvent({ start: itemEvent.start, end: point, translation, target: itemEvent.target })
			}
		}
	}

	const onMouseUpOnItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (tableEvent) return
		event.stopPropagation()
		if (currentItem && itemEvent) {
			const currentItems = [...items]
			currentItems.splice(currentItem.index!, 1, currentItem)
			setItems([
				...currentItems
			])
			setItemEvent(undefined)
			setCurrentItem(undefined)
		}
	}

	return (
		<Context.Provider value={{
			zIndex,
			size,
			step,
			numberOfStepsForSection,
			numberOfSections,
			onMouseDownOnTable,
			onMouseMoveOnTable,
			onMouseUpOnTable,
			onMouseDownOnItem,
			onMouseMoveOnItem,
			onMouseUpOnItem,
			currentItem,
			items,
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
