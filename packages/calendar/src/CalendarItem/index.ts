import Identifiable from "../util/Identifiable"
// import IndexPath from "../Protocol/IndexPath"

export interface CalendarItem extends Identifiable {
	title: string
	timezone?: string
}

export interface Event extends CalendarItem {
	startDate: Date
	endDate: Date
	isAllDay: boolean
}

// export const dateToIndexPath = (date: Date): IndexPath => {
// 	return {
// 		chapter: date.getDate(),
// 		section: date.getHours(),
// 		item: date.getMinutes()
// 	}
// }

// export const indexToDate = (indexPath: IndexPath, date: Date): Date => {
// 	const item = indexPath.item * 15
// 	const section = indexPath.section
// 	const chapter = indexPath.chapter
// 	date.setMinutes(item)
// 	date.setHours(section)
// 	date.setDate(chapter)
// 	return date
// }

// export const eventToItem = (event: Event): Item => {
// 	const start = dateToIndexPath(event.startDate)
// 	const end = dateToIndexPath(event.endDate)
// 	return {
// 		id: event.id,
// 		start,
// 		end
// 	}
// }
