import IndexPath, { IndexRangeable, substract, isGreaterThan, isLessThan, isGreaterThanOrEqualTo, isLessThanOrEqualTo } from "../util/IndexPath"
import Identifiable from "../util/Identifiable"

export interface ItemCell extends IndexRangeable, Identifiable {
	index: number
}

export interface LayoutAttributes extends ItemCell {
	position: {
		column: number,
		start: number,
		end: number
	}
	start: IndexPath
	end: IndexPath
}

const LAYOUT_SAFETY = 100

class LayoutNode implements IndexRangeable {

	id: string
	parents: LayoutNode[] = []
	children: LayoutNode[] = []
	numberOfColumns: number = 0
	startColumn: number = 0
	endColumn: number = 0
	start: IndexPath
	end: IndexPath

	static fromItemCell(itemCell: ItemCell, numberOfColumns: number) {
		return new LayoutNode(`${itemCell.id}`, itemCell.start, itemCell.end, numberOfColumns)
	}

	constructor(id: string, start: IndexPath, end: IndexPath, numberOfColumns: number) {
		this.id = id
		this.numberOfColumns = numberOfColumns
		this.startColumn = numberOfColumns - 1
		this.endColumn = numberOfColumns
		this.start = start
		this.end = end
	}

	setParents(parents: LayoutNode[]) {
		this.parents = parents
		parents.forEach(layoutNode => layoutNode.children.push(this))
	}

	setMaxColumn(numberOfColumns: number) {
		if (this.children) {
			this.endColumn = this.startColumn + 1
		} else {
			this.endColumn = numberOfColumns
		}
		if (this.numberOfColumns === numberOfColumns) return
		this.numberOfColumns = numberOfColumns
		if (this.parents.length) {
			this.parents.forEach(node => node.setMaxColumn(numberOfColumns))
		}
		if (this.children.length) {
			this.children.forEach(node => node.setMaxColumn(numberOfColumns))
		}
	}

}

const isOverlap = <T extends IndexRangeable, U extends IndexRangeable>(l: T, r: U): boolean => {
	return !(isLessThanOrEqualTo(l.end, r.start) || isGreaterThanOrEqualTo(l.start, r.end))
}

export const useLayout = (itemCells: ItemCell[], max: { numberOfChapters: number, numberOfSections: number, numberOfItems: number }) => {

	const sortedItemCells: ItemCell[] = sortForLayout(itemCells, max)
	const layoutNodes: LayoutNode[] = []

	let currentColumn = 1

	do {
		const targetItemCells = sortedItemCells.filter(itemCell => !layoutNodes.map(layoutNode => layoutNode.id).includes(`${itemCell.id}`))
		for (const itemCell of targetItemCells) {
			const targetLayoutNode: LayoutNode = LayoutNode.fromItemCell(itemCell, currentColumn)
			const currentPositionOverlapped: LayoutNode[] = layoutNodes
				.filter(layoutNode => layoutNode.startColumn === (currentColumn - 1))
				.filter(layoutNode => isOverlap(layoutNode, targetLayoutNode))

			const parents: LayoutNode[] = layoutNodes
				.filter(layoutNode => layoutNode.startColumn === (currentColumn - 2))
				.filter(layoutNode => isOverlap(layoutNode, targetLayoutNode))

			if (currentPositionOverlapped.length === 0) {
				targetLayoutNode.setParents(parents)
				layoutNodes.push(targetLayoutNode)
				parents.forEach(parent => parent.setMaxColumn(currentColumn))
			}
		}
		currentColumn += 1
	} while (itemCells.length !== layoutNodes.length && currentColumn < LAYOUT_SAFETY)

	return layoutNodes.map(layoutNode => {
		return {
			id: layoutNode.id,
			position: {
				column: layoutNode.numberOfColumns,
				start: layoutNode.startColumn,
				end: layoutNode.endColumn
			},
			start: layoutNode.start,
			end: layoutNode.end
		}
	}) as LayoutAttributes[]
}

const sortForLayout = (itemCells: ItemCell[], max: { numberOfChapters: number, numberOfSections: number, numberOfItems: number }) => {
	return itemCells
		.sort((l, r) => {
			const lLength: IndexPath = substract(l.end, l.start, max)
			const rLength: IndexPath = substract(r.end, r.start, max)
			if (isGreaterThan(lLength, rLength)) return -1
			if (isLessThan(lLength, rLength)) return 1
			return 0
		})
		.sort((l, r) => {
			if (isGreaterThan(l.start, r.start)) return 1
			if (isLessThan(l.start, r.start)) return -1
			return 0
		})
}
