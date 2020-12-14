import React from "react"
import TimeTable from "./TimeTable"
import Card from "./TimeTable/Card"

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
			<TimeTable
				data={[]}
				onCreate={(item, done) => {
					alert("save?")
					done(item)
				}}
			>
				<Card>

				</Card>
			</TimeTable>
		</div>
	)
}


export default Component