import React from "react"
import { Card, Table } from "@1amageek/timetable"
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
				onCreate={(item, done) => {
					alert("save?")
					done(item)
				}}
				onDelete={(item, done) => {
					alert("delete?")
					done(item)
				}}
			>
				<Card>
					{data => {
						return (
							<div
								style={{
									padding: "8px"
								}}
							>{data.id}</div>
						)
					}}
				</Card>
			</Table>
		</div>
	)
}

export default Component