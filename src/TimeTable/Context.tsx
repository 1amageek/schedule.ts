import React, { useState, createContext, useLayoutEffect, Dispatch, useMemo, useEffect } from "react"
import { useSize, Size, Point, Rect } from "./Geometory"

const STEP = 12
const NUBMER_OF_ITEMS = 4
const NUMBER_OF_SECTIONS = 24
const NUMBER_OF_CHAPTERS = 7
const ZINDEX = 100

export interface Item {
	start: IndexPath
	end: IndexPath
}

export type Data = Item[]

export interface IndexPath {
	chapter: number
	section: number
	item: number
}

interface Change {
	before: Item
	after: Item
}

interface Event {
	initial: IndexPath
	current: IndexPath
}

interface Operation {
	event: Event
	add?: Item
	move?: Change
	update?: Change
}

interface Props {
	size: Size
	step: number
	numberOfChapters: number
	numberOfSections: number
	numberOfItems: number
	cursor?: string
	onMouseDownOnTable?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
	onMouseMoveOnTable?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
	onMouseUpOnTable?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
	onMouseDownOnItem?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: Item) => void
	onMouseDownOnItemBottomEdge?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: Item) => void
	currentItem?: Item | undefined
	data: Data
	operation?: Operation,
	zIndex: number
}

export const Context = createContext<Props>({
	size: { width: 0, height: 0 },
	step: STEP,
	zIndex: ZINDEX,
	numberOfChapters: NUMBER_OF_CHAPTERS,
	numberOfSections: NUMBER_OF_SECTIONS,
	numberOfItems: NUBMER_OF_ITEMS,
	data: []
})

export const Provider = ({
	initialData,
	onCreate,
	zIndex = ZINDEX,
	step = STEP,
	numberOfItems = NUBMER_OF_ITEMS,
	numberOfSections = NUMBER_OF_SECTIONS,
	numberOfChapters = NUMBER_OF_CHAPTERS,
	children
}: {
	initialData: Data,
	onCreate: (item: Item, done: (item: Item) => void) => void,
	zIndex?: number,
	step?: number,
	numberOfItems?: number,
	numberOfSections?: number,
	numberOfRows?: number,
	numberOfChapters?: number,
	children: any
}) => {

	const [cursor, setCursor] = useState<string>()
	const [operation, setOperation] = useState<Operation | undefined>()
	const [data, setData] = useState<Data>(initialData)
	const [ref, size] = useSize<HTMLDivElement>()
	const [currentItem, setCurrentItem] = useState<Item | undefined>()

	useEffect(() => {

		if (operation?.add) {
			setCursor("move")
			setCurrentItem(operation.add)
		} else if (operation?.move) {
			setCursor("move")
			setCurrentItem(operation.move.after)
		} else if (operation?.update) {
			setCursor("row-resize")
			setCurrentItem(operation.update.after)
		} else {
			setCursor(undefined)
			setCurrentItem(undefined)
		}

	}, [JSON.stringify(operation)])


	const indexPathForPoint = (point: Point): IndexPath => {
		const chapter = Math.min(Math.max(Math.floor((point.x / size.width) * numberOfChapters), 0), numberOfChapters - 1)
		const section = Math.min(Math.max(Math.floor((point.y / size.height) * numberOfSections), 0), numberOfSections - 1)
		const heightOfSection = step * numberOfItems
		const item = Math.min(Math.max(Math.floor(((point.y - (section * heightOfSection)) / heightOfSection) * numberOfItems), 0), numberOfItems - 1)
		return { chapter, section, item }
	}

	const onMouseDownOnTable = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.stopPropagation()
		const bounds = ref.current?.getBoundingClientRect()
		if (bounds) {
			const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
			const indexPath = indexPathForPoint(point)
			setOperation({
				event: {
					initial: indexPath,
					current: indexPath
				},
				add: {
					start: indexPath,
					end: indexPath
				}
			})
		}
	}

	const onMouseMoveOnTable = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.stopPropagation()
		if (!operation) return
		const bounds = ref.current?.getBoundingClientRect()
		if (!bounds) return
		const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
		const indexPath = indexPathForPoint(point)

		if (operation?.add) {

			let add = {
				start: operation.event.initial,
				end: indexPath
			}

			// if (operation.event.initial.chapter > operation.event.current.chapter) {
			// 	add = {
			// 		start: indexPath,
			// 		end: operation.event.initial
			// 	}
			// } else if (operation.event.initial.section > operation.event.current.section) {
			// 	add = {
			// 		start: indexPath,
			// 		end: operation.event.initial
			// 	}
			// } else if (operation.event.initial.item > operation.event.current.item) {
			// 	add = {
			// 		start: indexPath,
			// 		end: operation.event.initial
			// 	}
			// }

			setOperation({
				event: {
					initial: operation.event.initial,
					current: indexPath
				},
				add
			})
		}

		if (operation?.move) {
			const chapter = operation.event.current.chapter - operation.event.initial.chapter
			const section = operation.event.current.section - operation.event.initial.section
			const item = operation.event.current.item - operation.event.initial.item
			const move: Change = {
				before: operation.move.before,
				after: {
					start: {
						chapter: operation.move.before.start.chapter + chapter,
						section: operation.move.before.start.section + section,
						item: operation.move.before.start.item + item
					},
					end: {
						chapter: operation.move.before.end.chapter + chapter,
						section: operation.move.before.end.section + section,
						item: operation.move.before.end.item + item
					}
				}
			}
			setOperation({
				event: {
					initial: operation.event.initial,
					current: indexPath
				},
				move
			})
		}

		if (operation?.update) {
			const chapter = operation.event.current.chapter - operation.event.initial.chapter
			const section = operation.event.current.section - operation.event.initial.section
			const item = operation.event.current.item - operation.event.initial.item
			const update: Change = {
				before: operation.update.before,
				after: {
					start: {
						chapter: operation.update.before.start.chapter,
						section: operation.update.before.start.section,
						item: operation.update.before.start.item
					},
					end: {
						chapter: operation.update.before.end.chapter + chapter,
						section: operation.update.before.end.section + section,
						item: operation.update.before.end.item + item
					}
				}
			}
			setOperation({
				event: {
					initial: operation.event.initial,
					current: indexPath
				},
				update
			})
		}
	}

	const onMouseUpOnTable = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.stopPropagation()
		if (operation?.add) {
			setData([...data, operation.add])
		}
		if (operation?.move) {
			const index = data.indexOf(operation.move.before)
			data.splice(index, 1)
			setData([...data, operation.move.after])
		}
		if (operation?.update) {
			const index = data.indexOf(operation.update.before)
			data.splice(index, 1)
			setData([...data, operation.update.after])
		}
		setOperation(undefined)
	}

	const onMouseDownOnItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: Item) => {
		event.stopPropagation()
		const bounds = ref.current?.getBoundingClientRect()
		if (!bounds) return
		const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
		const indexPath = indexPathForPoint(point)
		setOperation({
			event: {
				initial: indexPath,
				current: indexPath
			},
			move: {
				before: item,
				after: item
			}
		})
	}


	const onMouseDownOnItemBottomEdge = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: Item) => {
		event.stopPropagation()
		const bounds = ref.current?.getBoundingClientRect()
		if (!bounds) return
		const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
		const indexPath = indexPathForPoint(point)
		setOperation({
			event: {
				initial: indexPath,
				current: indexPath
			},
			update: {
				before: item,
				after: item
			}
		})
	}

	return (
		<Context.Provider value={{
			zIndex,
			size,
			step,
			numberOfItems,
			numberOfSections,
			numberOfChapters,
			cursor,
			onMouseDownOnTable,
			onMouseMoveOnTable,
			onMouseUpOnTable,
			onMouseDownOnItem,
			onMouseDownOnItemBottomEdge,
			currentItem,
			data,
			operation,
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
