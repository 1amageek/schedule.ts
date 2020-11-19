import React, { useState, useContext, CSSProperties } from "react"
import { Item, IndexPath, Context } from "./Context"

const Component = ({ item, index, isRequiredShadow }: { item: Item, index: number, isRequiredShadow?: boolean }) => {

	const {
		step,
		numberOfItems,
		onMouseDownOnItem,
		onMouseMoveOnItem,
		onMouseUpOnItem,
		onMouseDownOnItemBottomEdge,
		onMouseMoveOnItemBottomEdge,
		onMouseUpOnItemBottomEdge,
		setSelectedIndex,
		selectedIndex,
		zIndex
	} = useContext(Context)

	const _zIndex = zIndex + 10 + index

	const heightOfSection = step * numberOfItems
	const top = item.start.section * heightOfSection + step * item.start.item
	const bottom = item.end.section * heightOfSection + step * item.end.item
	const height = bottom - top

	// console.log(top, height)

	let style: CSSProperties = {
		position: "absolute",
		zIndex: _zIndex,
		top: `${top}px`,
		width: "98%",
		height: `${height}px`,
		margin: 0,
		padding: 0,
		borderRadius: "8px",
		border: "solid 1px #FFF",
		background: "linear-gradient(90deg, rgba(79,0,255,1) 0%, rgba(0,119,255,1) 100%)",
		cursor: "pointer"
	}

	if (!!isRequiredShadow) {
		style = {
			...style,
			boxShadow: "0px 4px 20px -3px rgba(0,0,0,0.35)"
		}
	}

	if (selectedIndex === index) {
		style = {
			...style,
			opacity: 0.6
		}
	}

	return (
		<div
			style={style}
		// onMouseDown={(event) => onMouseDownOnItem!(event, indexPath)}
		// onMouseMove={(event) => onMouseMoveOnItem!(event, indexPath)}
		// onMouseUp={(event) => onMouseUpOnItem!(event, indexPath)}
		>
			<div
				style={{
					width: "100%",
					height: "100%",
					position: "relative"
				}}
			>
				<div
					style={{
						position: "absolute",
						bottom: 0,
						width: "100%",
						height: "8px",
						cursor: "row-resize"
					}}
					onMouseDown={onMouseDownOnItemBottomEdge}
				// onMouseMove={onMouseMoveOnItemBottomEdge}
				// onMouseUp={onMouseUpOnItemBottomEdge}
				>
				</div>
			</div>
		</div>
	)
}

export default Component