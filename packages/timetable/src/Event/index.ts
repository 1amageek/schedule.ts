import Identifiable from "../util/Identifiable"
import DateRangeable from "../util/DateRangeable"
import IndexPath from "../util/IndexPath"
import { Data } from "../Data"

export interface CalendarItem extends Identifiable {
	title: string
	timezone?: string
}

export interface Event extends CalendarItem, DateRangeable {
	isAllDay: boolean
}

export const indexPathForDate = (date: Date): IndexPath => {
	return {
		chapter: 0,//date.getDate(),
		section: date.getHours(),
		item: date.getMinutes() / 15
	}
}

export const dateForIndexPath = (indexPath: IndexPath, date: Date): Date => {
	const item = indexPath.item * 15
	const section = indexPath.section
	const chapter = indexPath.chapter
	date.setMinutes(item)
	date.setHours(section)
	date.setDate(chapter)
	return date
}

export const eventToItem = (event: Event): Data => {
	const start = indexPathForDate(event.startDate)
	const end = indexPathForDate(event.endDate)
	return {
		id: event.id,
		start,
		end
	}
}
