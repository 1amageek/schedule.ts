import React, { useState, createContext, useEffect, useContext } from "react"
import IndexPath, { IndexRangeable, isLessThan, isGreaterThan, isEqualTo, sum, substract } from "../util/IndexPath"
import { useSize, Size, Point } from "@1amageek/geometory"
import { CardItem } from "../Layout"
import { Item } from "../Item"

const STEP = 20
const NUBMER_OF_ITEMS = 4
const NUMBER_OF_SECTIONS = 24
const NUMBER_OF_CHAPTERS = 7
const ZINDEX = 100

interface Change {
	before: IndexRangeable
	after?: IndexRangeable
}

interface Event {
	initial: IndexPath
	current: IndexPath
}

interface Operation {
	id: string
	event: Event
	add?: IndexRangeable
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
	onMouseDownOnItem?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: CardItem) => void
	onMouseDownOnItemBottomEdge?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: CardItem) => void
	currentItem?: Item | undefined
	selectedItems: Item[]
	data: Item[]
	operation?: Operation,
	zIndex: number
}

export type ItemHandler = (item: Item, done: (item: Item | null) => void) => void

export const Context = createContext<Props>({
	size: { width: 0, height: 0 },
	step: STEP,
	zIndex: ZINDEX,
	numberOfChapters: NUMBER_OF_CHAPTERS,
	numberOfSections: NUMBER_OF_SECTIONS,
	numberOfItems: NUBMER_OF_ITEMS,
	selectedItems: [],
	data: []
})

export const Provider = ({
	idProvider,
	initialData,
	onCreate,
	onDelete,
	zIndex = ZINDEX,
	step = STEP,
	numberOfItems = NUBMER_OF_ITEMS,
	numberOfSections = NUMBER_OF_SECTIONS,
	numberOfChapters = NUMBER_OF_CHAPTERS,
	children
}: {
	idProvider: () => string,
	initialData: Item[],
	onCreate: ItemHandler,
	onDelete: ItemHandler,
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
	const [data, setData] = useState<Item[]>(initialData)
	const [ref, size] = useSize<HTMLDivElement>()
	const [currentItem, setCurrentItem] = useState<Item | undefined>()
	const [selectedItems, setSelectedItems] = useState<Item[]>([])

	console.log(currentItem)

	window.document.onkeydown = (event: KeyboardEvent) => {
		if (event.key === "Backspace") {
			const selectedIDs = selectedItems.map(item => item.id)
			const _data = data.filter(item => !selectedIDs.includes(item.id))
			setData(_data)
			setSelectedItems([])
		}
	}

	useEffect(() => {
		if (operation?.add) {
			if (!isEqualTo(operation.add.start, operation.add.end)) {
				setCursor("move")
				setCurrentItem({
					id: operation.id,
					...operation.add
				})
			} else {
				setCursor(undefined)
				setCurrentItem(undefined)
			}
		} else if (operation?.move?.after) {
			setCursor("move")
			setCurrentItem({
				id: operation.id,
				...operation.move.after
			})
		} else if (operation?.update?.after) {
			setCursor("row-resize")
			setCurrentItem({
				id: operation.id,
				...operation.update.after
			})
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
			const id = idProvider()
			setOperation({
				id,
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
				id: operation.id,
				event: {
					initial: operation.event.initial,
					current: indexPath
				},
				add
			})
		}

		if (operation?.move) {
			const diffIndexPath: IndexPath = substract(indexPath, operation.event.initial, { numberOfChapters, numberOfSections, numberOfItems })
			const start = sum(operation.move.before.start, diffIndexPath, { numberOfChapters, numberOfSections, numberOfItems })
			const end = sum(operation.move.before.end, diffIndexPath, { numberOfChapters, numberOfSections, numberOfItems })
			const move: Change = {
				before: operation.move.before,
				after: {
					start, end
				}
			}
			setOperation({
				id: operation.id,
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
				id: operation.id,
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
				const item = {
					id: operation.id,
					...operation.add
				}
				setSelectedItems([item])
				onCreate(item, (item) => {
					if (item) {
						setData([...data, item])
					} else {
						setSelectedItems([])
					}
				})
			} else {
				setSelectedItems([])
			}
		}
		if (operation?.move?.after) {
			const index = data.map(item => item.id).indexOf(operation.id)
			data.splice(index, 1)
			const item = {
				id: operation.id,
				...operation.move.after
			}
			setData([...data, item])
			setSelectedItems([item])
		}
		if (operation?.update?.after) {
			const index = data.map(item => item.id).indexOf(operation.id)
			data.splice(index, 1)
			const item = {
				id: operation.id,
				...operation.update.after
			}
			setData([...data, item])
			setSelectedItems([item])
		}
		if (operation) setOperation(undefined)
	}

	const onMouseDownOnItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, cardItem: Item) => {
		event.stopPropagation()
		if (operation?.add || operation?.update) {
			console.log("onMouseDownOnItem")
			return
		}
		const bounds = ref.current?.getBoundingClientRect()
		if (!bounds) return
		const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
		const indexPath = indexPathForPoint(point)
		const item = data.find(item => item.id === cardItem.id)
		if (!item) return
		setOperation({
			id: cardItem.id,
			event: {
				initial: indexPath,
				current: indexPath
			},
			move: {
				before: item
			}
		})
		setSelectedItems([cardItem])
	}

	const onMouseDownOnItemBottomEdge = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, cardItem: Item) => {
		event.stopPropagation()
		if (operation?.add || operation?.move) {
			console.log("onMouseDownOnItemBottomEdge")
			return
		}
		const bounds = ref.current?.getBoundingClientRect()
		if (!bounds) return
		const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
		const indexPath = indexPathForPoint(point)
		const item = data.find(item => item.id === cardItem.id)
		if (!item) return
		setOperation({
			id: cardItem.id,
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
			selectedItems,
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
	items.forEach((item, index) => {
		const startChapter = Math.min(Math.max(item.start.chapter, 0), numberOfChapters - 1)
		const endChapter = Math.min(Math.max(item.end.chapter, 0), numberOfChapters - 1)
		const start = isGreaterThan(item.start, minIndexPath) ? item.start : minIndexPath
		const end = isLessThan(item.end, maxIndexPath) ? item.end : maxIndexPath
		if (startChapter === endChapter) {
			const cardItem: CardItem = {
				id: item.id,
				index,
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
						id: item.id,
						index,
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
						id: item.id,
						index,
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
					id: item.id,
					index,
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
