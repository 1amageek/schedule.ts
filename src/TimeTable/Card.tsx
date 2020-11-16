import React, { useState, useContext, CSSProperties } from "react"
import { Item, Context } from "./Context"

const Component = ({ item, index, isRequiredShadow }: { item: Item, index: number, isRequiredShadow?: boolean }) => {

	const {
		onMouseDownOnItem,
		onMouseMoveOnItem,
		onMouseUpOnItem,
		setSelectedIndex,
		selectedIndex,
		zIndex
	} = useContext(Context)

	const _zIndex = zIndex + 10 + index

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
		background: "linear-gradient(90deg, rgba(79,0,255,1) 0%, rgba(0,119,255,1) 100%)"
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
			onMouseDown={(event) => {
				setSelectedIndex!(index)
				onMouseDownOnItem!(event)

			}}
			onMouseMove={onMouseMoveOnItem}
			onMouseUp={(event) => {
				onMouseUpOnItem!(event)
				setSelectedIndex!(undefined)
			}}
		>
		</div>
	)
}

export default Component