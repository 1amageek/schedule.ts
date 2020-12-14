import React, { useContext, CSSProperties, ReactElement } from "react"
import { Context } from "./Context"
import { LayoutAttributes } from "./Layout"

// const Component = ({ item, index, isRequiredShadow, children }: { item: LayoutAttributes, index: number, isRequiredShadow?: boolean, children?: ReactElement }) => {
const Component = (props: any) => {

	const {
		step,
		numberOfItems,
		onMouseDownOnItem,
		onMouseDownOnItemBottomEdge,
		operation,
		zIndex,
		cursor
	} = useContext(Context)

	const { item, index, isRequiredShadow, children } = props
	const _zIndex = zIndex + 10 + index

	const heightOfSection = step * numberOfItems
	const top = item.start.section * heightOfSection + step * item.start.item
	const bottom = item.end.section * heightOfSection + step * item.end.item
	const height = bottom - top

	let style: CSSProperties = {
		position: "absolute",
		zIndex: _zIndex,
		top: `${top}px`,
		width: `${(100 / item.position.column) * (item.position.end - item.position.start)}%`,
		height: `${height}px`,
		margin: 0,
		padding: 0,
		left: `${(100 / (item.position.column) * item.position.start)}%`,
		borderRadius: "4px",
		border: "solid 1px #FFF",
		background: "linear-gradient(90deg, rgba(79,0,255,1) 0%, rgba(0,119,255,1) 100%)",
		cursor: cursor ?? "pointer",
		boxSizing: "border-box"
	}

	if (!!isRequiredShadow) {
		style = {
			...style,
			boxShadow: "0px 4px 20px -0px rgba(0,0,0,0.4)"
		}
	}

	if (operation?.move?.before === item || operation?.update?.before === item) {
		style = {
			...style,
			opacity: 0.6
		}
	}

	return (
		<div
			style={style}
			onMouseDown={(event) => onMouseDownOnItem!(event, item)}
		>
			<div
				style={{
					width: "100%",
					height: "100%",
					position: "relative"
				}}
			>
				{children}
				{/* <label
					style={{
						color: "#FFF",
						display: "block",
						userSelect: "none"
					}}
				>{`${item.id} - ${item.start.chapter}:${item.start.section}:${item.start.item} - ${item.end.chapter}:${item.end.section}:${item.end.item}`}</label> */}
				<div
					style={{
						position: "absolute",
						bottom: 0,
						width: "100%",
						height: "8px",
						cursor: cursor ?? "row-resize"
					}}
					onMouseDown={(event) => onMouseDownOnItemBottomEdge!(event, item)}
				>
				</div>
			</div>
		</div>
	)
}

export default Component