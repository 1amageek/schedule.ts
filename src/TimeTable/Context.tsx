import React, { useState, createContext, useEffect, useContext } from "react"
import { useSize, Size, Point } from "./Geometory"

const STEP = 12
const NUBMER_OF_ITEMS = 4
const NUMBER_OF_SECTIONS = 24
const NUMBER_OF_CHAPTERS = 7
const ZINDEX = 100

export interface Item {
	start: IndexPath
	end: IndexPath
}

export interface CardItem {
	id: number
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

const flatIndexPath = (indexPath: IndexPath) => {
	const { chapter, section, item } = indexPath
	const c = `${chapter}`.padStart(2, "0")
	const s = `${section}`.padStart(2, "0")
	const i = `${item}`.padStart(2, "0")
	return Number(c + s + i)
}

const isEqualTo = (l: IndexPath, r: IndexPath) => {
	const lnum = flatIndexPath(l)
	const rnum = flatIndexPath(r)
	return lnum === rnum
}

const isLessThan = (l: IndexPath, r: IndexPath) => {
	const lnum = flatIndexPath(l)
	const rnum = flatIndexPath(r)
	return lnum < rnum
}

const isGreaterThan = (l: IndexPath, r: IndexPath) => {
	const lnum = flatIndexPath(l)
	const rnum = flatIndexPath(r)
	return lnum > rnum
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
	onMouseDownOnItem?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: CardItem) => void
	onMouseDownOnItemBottomEdge?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: CardItem) => void
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
			if (!isEqualTo(operation.add.start, operation.add.end)) {
				setCursor("move")
				setCurrentItem(operation.add)
			} else {
				setCursor(undefined)
				setCurrentItem(undefined)
			}
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

	const sum = (l: IndexPath, r: IndexPath, max: { numberOfChapters: number, numberOfSections: number, numberOfItems: number }) => {
		const c = numberOfSections * numberOfItems
		const s = numberOfItems
		const lnum = l.chapter * c + l.section * s + l.item
		const rnum = r.chapter * c + r.section * s + r.item
		const sum = lnum + rnum
		const chapter = Math.floor(sum / c)
		const section = Math.floor((sum % c) / s)
		const item = ((sum % c) % s)
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
		if (isEqualTo(indexPath, operation.event.current)) return

		if (operation?.add) {
			let add = {
				start: operation.event.initial,
				end: indexPath
			}
			if (isLessThan(indexPath, operation.event.initial)) {
				add = {
					start: indexPath,
					end: operation.event.initial
				}
			}
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
			const diffIndexPath: IndexPath = { chapter, section, item }
			const start = sum(operation.move.before.start, diffIndexPath, { numberOfChapters, numberOfSections, numberOfItems })
			const end = sum(operation.move.before.end, diffIndexPath, { numberOfChapters, numberOfSections, numberOfItems })
			const move: Change = {
				before: operation.move.before,
				after: {
					start, end
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
			let update: Change = {
				before: operation.update.before,
				after: {
					start: operation.update.before.start,
					end: indexPath
				}
			}
			if (isLessThan(indexPath, operation.update.before.start)) {
				update = {
					before: operation.update.before,
					after: {
						start: operation.update.before.start,
						end: {
							chapter: operation.update.before.start.chapter,
							section: operation.update.before.start.section,
							item: operation.update.before.start.item + 1
						}
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
			if (!isEqualTo(operation.add.start, operation.add.end)) {
				setData([...data, operation.add])
			}
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

	const onMouseDownOnItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, cardItem: CardItem) => {
		event.stopPropagation()
		if (operation?.add || operation?.update) {
			console.log("onMouseDownOnItem")
			return
		}
		const bounds = ref.current?.getBoundingClientRect()
		if (!bounds) return
		const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
		const indexPath = indexPathForPoint(point)
		const item = data[cardItem.id]
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

	const onMouseDownOnItemBottomEdge = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, cardItem: CardItem) => {
		event.stopPropagation()
		if (operation?.add || operation?.move) {
			console.log("onMouseDownOnItemBottomEdge")
			return
		}
		const bounds = ref.current?.getBoundingClientRect()
		if (!bounds) return
		const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
		const indexPath = indexPathForPoint(point)
		const item = data[cardItem.id]
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

export const useCardItemProvider = (items: Item[]) => {
	const {
		numberOfChapters,
		numberOfSections,
		numberOfItems
	} = useContext(Context)
	const cardItems: CardItem[] = []
	const minIndexPath: IndexPath = { chapter: 0, section: 0, item: 0 }
	const maxIndexPath: IndexPath = { chapter: numberOfChapters - 1, section: numberOfSections - 1, item: numberOfItems - 1 }
	items.forEach((item, id) => {
		const startChapter = Math.min(Math.max(item.start.chapter, 0), numberOfChapters - 1)
		const endChapter = Math.min(Math.max(item.end.chapter, 0), numberOfChapters - 1)
		const start = isGreaterThan(item.start, minIndexPath) ? item.start : minIndexPath
		const end = isLessThan(item.end, maxIndexPath) ? item.end : maxIndexPath
		if (startChapter === endChapter) {
			const cardItem: CardItem = {
				id,
				start,
				end
			}
			cardItems.push(cardItem)
		} else {
			const chapterDiff = endChapter - startChapter + 1
			const diff = [...new Array(chapterDiff).keys()]
			for (const index of diff) {
				const chapter = startChapter + index
				if (chapter === startChapter) {
					cardItems.push({
						id,
						start,
						end: {
							chapter: startChapter,
							section: numberOfSections - 1,
							item: numberOfItems - 1
						}
					})
					continue
				}
				if (chapter === endChapter) {
					cardItems.push({
						id,
						start: {
							chapter: endChapter,
							section: 0,
							item: 0
						},
						end
					})
					continue
				}
				cardItems.push({
					id,
					start: {
						chapter,
						section: 0,
						item: 0
					},
					end: {
						chapter,
						section: numberOfSections - 1,
						item: numberOfItems - 1
					}
				})
			}
		}
	})
	return cardItems
}