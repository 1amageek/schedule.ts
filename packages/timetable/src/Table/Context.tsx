import React, { useState, createContext, useEffect, useContext } from "react"
import IndexPath, { IndexRangeable, isLessThan, isGreaterThan, isEqualTo, sum, substract, isLessThanOrEqualTo } from "../util/IndexPath"
import { useSize, Size, Point } from "@1amageek/geometory"
import { ItemCell } from "../Layout"
import { Data } from "../Data"

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
	onMouseDownOnItem?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: ItemCell) => void
	onMouseDownOnItemBottomEdge?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: ItemCell) => void
	currentItem?: Data | undefined
	selectedItems: Data[]
	data: Data[]
	operation?: Operation,
	zIndex: number
}

export type ItemWillOperationHandler = (item: Data, done: (item: Data | null) => void) => void
export type ItemDidOperationHandler = (item: Data) => void

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
	willAdd,
	didAdd,
	willDelete,
	didDelete,
	zIndex = ZINDEX,
	step = STEP,
	numberOfItems = NUBMER_OF_ITEMS,
	numberOfSections = NUMBER_OF_SECTIONS,
	numberOfChapters = NUMBER_OF_CHAPTERS,
	children
}: {
	idProvider: () => string,
	initialData: Data[],
	willAdd: ItemWillOperationHandler,
	didAdd: ItemDidOperationHandler,
	willDelete: ItemWillOperationHandler,
	didDelete: ItemDidOperationHandler,
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
	const [data, setData] = useState<Data[]>(initialData)
	const [ref, size] = useSize<HTMLDivElement>()
	const [currentItem, setCurrentItem] = useState<Data | undefined>()
	const [selectedItems, setSelectedItems] = useState<Data[]>([])

	console.log(data)

	window.document.onkeydown = (event: KeyboardEvent) => {
		if (event.key === "Backspace") {
			if (selectedItems.length) {
				const item = selectedItems[0]
				willDelete(item, (_item) => {
					if (_item) {
						const selectedIDs = selectedItems.map(item => item.id)
						const _data = data.filter(item => !selectedIDs.includes(item.id))
						setData(_data)
						setSelectedItems([])
						didDelete(_item)
					}
				})
			}
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
			if (isLessThanOrEqualTo(indexPath, operation.update.before.start)) {
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
				willAdd(item, (item) => {
					if (item) {
						setData([...data, item])
						didAdd(item)
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

	const onMouseDownOnItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, itemCell: Data) => {
		event.stopPropagation()
		if (operation?.add || operation?.update) {
			console.log("onMouseDownOnItem")
			return
		}
		const bounds = ref.current?.getBoundingClientRect()
		if (!bounds) return
		const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
		const indexPath = indexPathForPoint(point)
		const item = data.find(item => item.id === itemCell.id)
		if (!item) return
		setOperation({
			id: itemCell.id,
			event: {
				initial: indexPath,
				current: indexPath
			},
			move: {
				before: item
			}
		})
		setSelectedItems([itemCell])
	}

	const onMouseDownOnItemBottomEdge = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, itemCell: Data) => {
		event.stopPropagation()
		if (operation?.add || operation?.move) {
			console.log("onMouseDownOnItemBottomEdge")
			return
		}
		const bounds = ref.current?.getBoundingClientRect()
		if (!bounds) return
		const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
		const indexPath = indexPathForPoint(point)
		const item = data.find(item => item.id === itemCell.id)
		if (!item) return
		setOperation({
			id: itemCell.id,
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

export const useItemCellProvider = (items: Data[]) => {
	const {
		numberOfChapters,
		numberOfSections,
		numberOfItems
	} = useContext(Context)
	const itemCells: ItemCell[] = []
	const minIndexPath: IndexPath = { chapter: 0, section: 0, item: 0 }
	const maxIndexPath: IndexPath = { chapter: numberOfChapters - 1, section: numberOfSections - 1, item: numberOfItems - 1 }
	items.forEach((item, index) => {
		const startChapter = Math.min(Math.max(item.start.chapter, 0), numberOfChapters - 1)
		const endChapter = Math.min(Math.max(item.end.chapter, 0), numberOfChapters - 1)
		const start = isGreaterThan(item.start, minIndexPath) ? item.start : minIndexPath
		const end = isLessThan(item.end, maxIndexPath) ? item.end : maxIndexPath
		if (startChapter === endChapter) {
			const itemCell: ItemCell = {
				id: item.id,
				index,
				start,
				end
			}
			itemCells.push(itemCell)
		} else {
			const chapterDiff = endChapter - startChapter + 1
			const diff = [...new Array(chapterDiff).keys()]
			for (const index of diff) {
				const chapter = startChapter + index
				if (chapter === startChapter) {
					itemCells.push({
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
					itemCells.push({
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
				itemCells.push({
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
	return itemCells
}
