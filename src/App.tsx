import React from "react"
// import Timeline from "./Timeline"
import TimeTable from "./TimeTable"

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
			/>
		</div>
	)
}


export default Component