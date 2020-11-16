import React, { useState, CSSProperties } from "react"
import Event from "./models/Event"
import { useFrame } from "./utils/geometory"

const STEP_FOR_15MINUTES = 12
const STEP_FOR_1HOUR = STEP_FOR_15MINUTES * 4
const TIMELINE_HEIGHT = STEP_FOR_1HOUR * 24

const Component = ({ currentDate = new Date(), numberOfRows = 24 }: { currentDate?: Date, numberOfRows?: number }) => {

	const columns = [...new Array(numberOfRows).keys()]
	const [ref, frame] = useFrame<HTMLDivElement>()

	const startDate = new Date()
	const endDate = new Date()

	const [isPress, setPress] = useState(false)
	const [events, setEvents] = useState<Event[]>([])
	const [currentEvent, setCurrentEvent] = useState<Event | undefined>()
	const calendarEvents = currentEvent ? [currentEvent, ...events] : events
	// console.log(calendarEvents)
	return (
		<>
			<div style={{
				position: "absolute",
				width: `${frame.width}px`,
				height: `${frame.height}px`,
				margin: 0,
				padding: 0
			}}
				onMouseDown={(event) => {
					setPress(true)
					const date = dateToPosition(event.pageY, frame.height, 0, currentDate)
					const calendarEvent = {
						title: "aaa",
						startDate: date,
						endDate: date,
						isAllDay: false
					}
					setCurrentEvent(calendarEvent)
				}}
				onMouseUp={(event) => {
					setPress(false)
					// const date = dateToPosition(event.pageY, frame.height, 0, currentDate)
				}}
				onMouseMove={(event) => {
					if (isPress) {
						if (currentEvent) {
							const date = dateToPosition(event.pageY, frame.height, 0, currentDate)
							const { title, startDate, isAllDay } = currentEvent
							const calendarEvent = {
								title,
								startDate,
								endDate: date,
								isAllDay
							} as Event
							setCurrentEvent(calendarEvent)
						}
					}
				}}
			>
				{calendarEvents.map((event, index) => {
					return <TimelineEvent
						key={index}
						event={event}
					/>
				})}

			</div>
			<div
				ref={ref}
				style={{
					width: "100%",
					margin: 0,
					padding: 0
				}}
			>
				{columns.map(index => {
					return <HourBlock
						key={index}
						isBorderReauired={numberOfRows - 1 !== index}
					/>
				})}

			</div>
		</>
	)
}

const positionToDate = (date: Date, height: number, offsetY: number = 0) => {
	const aDate: Date = new Date(date)
	const hour = aDate.getHours()
	const minutes = aDate.getMinutes()
	const n = Math.floor(minutes / 15)
	const positionY = hour * STEP_FOR_1HOUR + n * STEP_FOR_15MINUTES
	return positionY
}

const dateToPosition = (pageY: number, height: number, offsetY: number = 0, date: Date) => {
	const p = (pageY - offsetY) / height
	const t = p * TIMELINE_HEIGHT
	const n = Math.round(t / STEP_FOR_15MINUTES)
	const aDate: Date = new Date(date)
	aDate.setSeconds(0)
	aDate.setMinutes(0)
	aDate.setHours(0)
	aDate.setMinutes(n * 15)
	return aDate
}

const getPositionForEvent = (event: Event) => {
	const _startPostion = positionToDate(event.startDate, TIMELINE_HEIGHT, 0)
	const _endPostion = positionToDate(event.endDate, TIMELINE_HEIGHT, 0)
	const startPostion = Math.min(_startPostion, _endPostion)
	const endPostion = Math.max(_startPostion, _endPostion)
	const height = endPostion - startPostion
	return { height, originY: startPostion, endPostion }
}

const TimelineEvent = ({ event }: { event: Event }) => {
	const { height, originY } = getPositionForEvent(event)

	const [startLocation, setStartLocation] = useState<number | undefined>()
	const [currentLocation, setCurrentLocation] = useState<number | undefined>()

	const translationY = (startLocation && currentLocation) ? startLocation - currentLocation : 0

	return (
		<div
			style={{
				position: "relative",
				top: `${originY}px`,
				width: "98%",
				height: `${height}px`,
				margin: 0,
				padding: 0,
				backgroundColor: "#E88",
				boxShadow: "0px 8px 20px -8px rgba(0,0,0,0.35)",
				borderRadius: "8px"
			}}
			onMouseDown={(event) => {
				event.stopPropagation()
				setStartLocation(event.pageY)
				setCurrentLocation(event.pageY)
			}}

			onMouseMove={(event) => {
				event.stopPropagation()
				if (startLocation) {
					const translationY = event.pageY - startLocation
				}
			}}
		>
		</div>
	)
}

const HourBlock = ({ height = STEP_FOR_1HOUR, isBorderReauired }: { height?: number, isBorderReauired?: boolean }) => {

	let style: CSSProperties = {
		height: `${height}px`,
		width: "100%",
		boxSizing: "border-box"
	}

	if (!!isBorderReauired) {
		style = {
			...style,
			borderBottom: "0.5px solid #ddd"
		}
	}

	return (
		<div style={style}>
		</div>
	)
}

export default Component