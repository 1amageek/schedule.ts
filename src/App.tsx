import React from "react"
import { Item, Table, Event, eventToItem, dateForIndexPath } from "@1amageek/timetable"
import dayjs from "dayjs"
import { v4 as uuidv4 } from "uuid"

const Component = () => {

	const events: Event[] = [
		{
			id: "0",
			title: "NO TITLE",
			startDate: new Date("2020-12-23T11:53:18+09:00"),
			endDate: new Date("2020-12-23T12:53:18+09:00"),
			isAllDay: false
		}
	]

	return (
		<div
			style={{
				position: "relative",
				width: "100%",
				height: "100%",
				margin: 0,
				padding: "8px",
				boxSizing: "border-box"
			}}
		>
			<Table
				initialData={events.map(event => eventToItem(event))}
				idProvider={uuidv4}
				willAdd={(item, done) => {
					alert("save?")
					done(item)
				}}
				didAdd={(item) => {
					console.log("add", item.id)
				}}
				willDelete={(item, done) => {
					alert("delete?")
					done(item)
				}}
				didDelete={(item) => {
					console.log("delete", item.id)
				}}
			>
				<Item>
					{data => {

						const event = events.find(event => event.id === data.id)
						const startDate = dateForIndexPath(data.start, new Date())
						const endDate = dateForIndexPath(data.end, new Date())
						const title = event?.title ?? "NO TITLE"

						return (
							<div
								style={{
									padding: "8px",
									// background: "rgba(0,200,255,1)",
									height: "100%",
									width: "100%",
									boxSizing: "border-box"
								}}
							>
								{title}
								<div>
									<label>{dayjs(startDate).format("H:mm")} - {dayjs(endDate).format("H:mm")}</label>
								</div>
							</div>
						)
					}}
				</Item>
			</Table>
		</div>
	)
}

export default Component
