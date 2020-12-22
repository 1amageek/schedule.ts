import React from "react"
import { Item, Table } from "@1amageek/timetable"
import { v4 as uuidv4 } from "uuid"

const Component = () => {

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
				initialData={[]}
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
						return (
							<div
								style={{
									padding: "8px",
									// background: "rgba(0,200,255,1)",
									height: "100%",
									width: "100%",
									boxSizing: "border-box"
								}}
							>{data.id}</div>
						)
					}}
				</Item>
			</Table>
		</div>
	)
}

export default Component
