import React from "react"
import { Table, Card } from "./TimeTable"
import { v4 as uuidv4 } from "uuid"
import ScheduleItem from "./ScheduleItem"

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
						const title = ""
						return (
							<div
								style={{
									padding: "8px"
								}}
							>{title}</div>
						)
					}}
				</Card>
			</Table>
		</div>
	)
}

// const Componet = () => {
// 	return (
// 		<Content>
// 			{() => {
// 				return (
// 					<div></div>
// 				)
// 			}}
// 		</Content>

// 	)
// }

// type DataComponent = () => React.ReactElement

// const Content = ({ children }: { children: DataComponent }) => {
// 	const cntent = children()
// 	return (
// 		<>
// 			{ cntent}
// 		</>
// 	)
// }

export default Component