import React, { useState, useContext, CSSProperties } from "react"
import { Item, IndexPath, Context } from "./Context"

const Component = ({ item, indexPath, isRequiredShadow }: { item: Item, indexPath: IndexPath, isRequiredShadow?: boolean }) => {

	const {
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

	const _zIndex = zIndex + 10 + indexPath.item

	let style: CSSProperties = {
		position: "absolute",
		zIndex: _zIndex,
		top: `${item.frame.origin.y}px`,
		width: "98%",
		height: `${item.frame.size.height}px`,
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

	if (selectedIndex === indexPath.item) {
		style = {
			...style,
			opacity: 0.6
		}
	}

	return (
		<div
			style={style}
			onMouseDown={(event) => onMouseDownOnItem!(event, indexPath)}
			onMouseMove={(event) => onMouseMoveOnItem!(event, indexPath)}
			onMouseUp={(event) => onMouseUpOnItem!(event, indexPath)}
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