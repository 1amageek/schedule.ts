
export default interface IndexPath {
	chapter: number
	section: number
	item: number
}

export interface IndexRangeable {
	start: IndexPath
	end: IndexPath
}

export const zero = {
	chapter: 0,
	section: 0,
	item: 0
}

const flatIndexPath = (indexPath: IndexPath) => {
	const { chapter, section, item } = indexPath
	const c = `${chapter}`.padStart(2, "0")
	const s = `${section}`.padStart(2, "0")
	const i = `${item}`.padStart(2, "0")
	return Number(c + s + i)
}

export const isEqualTo = (l: IndexPath, r: IndexPath) => {
	const lnum = flatIndexPath(l)
	const rnum = flatIndexPath(r)
	return lnum === rnum
}

export const isLessThan = (l: IndexPath, r: IndexPath) => {
	const lnum = flatIndexPath(l)
	const rnum = flatIndexPath(r)
	return lnum < rnum
}

export const isGreaterThan = (l: IndexPath, r: IndexPath) => {
	const lnum = flatIndexPath(l)
	const rnum = flatIndexPath(r)
	return lnum > rnum
}

export const isLessThanOrEqualTo = (l: IndexPath, r: IndexPath) => {
	const lnum = flatIndexPath(l)
	const rnum = flatIndexPath(r)
	return lnum <= rnum
}

export const isGreaterThanOrEqualTo = (l: IndexPath, r: IndexPath) => {
	const lnum = flatIndexPath(l)
	const rnum = flatIndexPath(r)
	return lnum >= rnum
}

export const sum = (l: IndexPath, r: IndexPath, max: { numberOfChapters: number, numberOfSections: number, numberOfItems: number }): IndexPath => {
	const { numberOfSections, numberOfItems } = max
	const c = numberOfSections * numberOfItems
	const s = numberOfItems
	const lnum = l.chapter * c + l.section * s + l.item
	const rnum = r.chapter * c + r.section * s + r.item
	const sum = lnum + rnum
	if (sum === 0) return { chapter: 0, section: 0, item: 0 }
	if (sum < 0) {
		const abs = Math.abs(sum)
		const chapter = -Math.floor(abs / c)
		const section = -Math.floor((abs % c) / s)
		const item = -((abs % c) % s)
		return { chapter, section, item }
	}
	const chapter = Math.floor(sum / c)
	const section = Math.floor((sum % c) / s)
	const item = ((sum % c) % s)
	return { chapter, section, item }
}

export const substract = (l: IndexPath, r: IndexPath, max: { numberOfChapters: number, numberOfSections: number, numberOfItems: number }): IndexPath => {
	const { numberOfSections, numberOfItems } = max
	const c = numberOfSections * numberOfItems
	const s = numberOfItems
	const lnum = l.chapter * c + l.section * s + l.item
	const rnum = r.chapter * c + r.section * s + r.item
	const diff = lnum - rnum
	if (diff === 0) return { chapter: 0, section: 0, item: 0 }
	if (diff < 0) {
		const abs = Math.abs(diff)
		const chapter = -Math.floor(abs / c)
		const section = -Math.floor((abs % c) / s)
		const item = -((abs % c) % s)
		return { chapter, section, item }
	}
	const chapter = Math.floor(diff / c)
	const section = Math.floor((diff % c) / s)
	const item = ((diff % c) % s)
	return { chapter, section, item }
}