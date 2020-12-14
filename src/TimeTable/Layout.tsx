import IndexPath, { substract, isGreaterThan, isLessThan, isGreaterThanOrEqualTo, isLessThanOrEqualTo } from "./IndexPath"

interface DistanceComparable {
	start: IndexPath
	end: IndexPath
}

interface Identifiable {
	id: number
}

export interface CardItem extends DistanceComparable, Identifiable { }

export interface LayoutAttributes extends CardItem {
	position: {
		column: number,
		start: number,
		end: number
	}
	start: IndexPath
	end: IndexPath
}

class LayoutNode implements DistanceComparable {

	id: string
	parents: LayoutNode[] = []
	children: LayoutNode[] = []
	numberOfColumns: number = 0
	startColumn: number = 0
	endColumn: number = 0
	start: IndexPath
	end: IndexPath

	static fromCardItem(cardItem: CardItem, numberOfColumns: number) {
		return new LayoutNode(`${cardItem.id}`, cardItem.start, cardItem.end, numberOfColumns)
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

const isOverlap = <T extends DistanceComparable, U extends DistanceComparable>(l: T, r: U): boolean => {
	return !(isLessThanOrEqualTo(l.end, r.start) || isGreaterThanOrEqualTo(l.start, r.end))
}

export const useLayout = (cardItems: CardItem[], max: { numberOfChapters: number, numberOfSections: number, numberOfItems: number }) => {

	const sortedCardItems: CardItem[] = sortForLayout(cardItems, max)
	const layoutNodes: LayoutNode[] = []

	let currentColumn = 1

	do {
		const targetCardItems = sortedCardItems.filter(cardItem => !layoutNodes.map(layoutNode => layoutNode.id).includes(`${cardItem.id}`))
		for (const cardItem of targetCardItems) {
			const targetLayoutNode: LayoutNode = LayoutNode.fromCardItem(cardItem, currentColumn)
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
	} while (cardItems.length !== layoutNodes.length)


	return layoutNodes.map(layoutNode => {
		return {
			id: Number(layoutNode.id),
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

const sortForLayout = (cardItems: CardItem[], max: { numberOfChapters: number, numberOfSections: number, numberOfItems: number }) => {
	return cardItems
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
