import React, { useContext, CSSProperties, ReactElement } from "react"
import { Data } from "../Data"
import { Context } from "../Table/Context"

export interface ItemState {
	isSelected: boolean
	isUpdated: boolean
	isDragging: boolean
}

export type ItemForData = (data: Data) => ReactElement

interface Props {
	getCurrentStyle?: (state: ItemState) => CSSProperties
	children: ItemForData
}

const DefaultStyle = (state: ItemState): CSSProperties => {

	const defaultStyle: CSSProperties = {
		border: "solid 1px #FFF",
		background: "rgba(0,122,255,0.8)",
		boxSizing: "border-box",
		color: "#FFF",
		fontSize: "12px"
	}

	if (state.isDragging) {
		return {
			...defaultStyle,
			background: "rgba(0,122,255,1)",
			boxShadow: `0px 2px 25px 0px ${defaultStyle.background}`
		}
	}

	if (state.isSelected) {
		if (state.isUpdated) {
			return {
				...defaultStyle,
				background: "rgba(0,122,255,0.4)",
			}
		}
		return {
			...defaultStyle,
			background: "rgba(0,122,255,1)",
		}
	}
	return defaultStyle
}

export const Item = (props: Props) => {

	const {
		step,
		numberOfItems,
		onMouseDownOnItem,
		onMouseDownOnItemBottomEdge,
		selectedItems,
		zIndex,
		cursor,
		operation,
	} = useContext(Context)

	const { getCurrentStyle } = props
	const { layoutAttributes, index, isDragging, children } = (props as any)
	const _zIndex = zIndex + 10 + index

	const heightOfSection = step * numberOfItems
	const top = layoutAttributes.start.section * heightOfSection + step * layoutAttributes.start.item
	const bottom = layoutAttributes.end.section * heightOfSection + step * layoutAttributes.end.item
	const height = bottom - top

	const position: CSSProperties = {
		position: "absolute",
		zIndex: _zIndex,
		margin: 0,
		padding: 0,
		top: `${top}px`,
		left: `${(100 / (layoutAttributes.position.column) * layoutAttributes.position.start)}%`,
		width: `${(100 / layoutAttributes.position.column) * (layoutAttributes.position.end - layoutAttributes.position.start)}%`,
		height: `${height}px`,
		cursor: cursor ?? "pointer",
		userSelect: "none"
	}

	const getStyle = getCurrentStyle ?? DefaultStyle

	const _style = getStyle({
		isSelected: selectedItems.map(item => item.id).includes(layoutAttributes.id),
		isDragging: isDragging,
		isUpdated: operation?.move?.after !== undefined
	})

	const style = {
		...position,
		..._style
	}

	const content = children(layoutAttributes)

	return (
		<div
			style={style}
			onMouseDown={(event) => onMouseDownOnItem!(event, layoutAttributes)}
		>
			<div
				style={{
					width: "100%",
					height: "100%",
					position: "relative"
				}}
			>
				{content}
				<div
					style={{
						position: "absolute",
						bottom: 0,
						width: "100%",
						height: "8px",
						cursor: cursor ?? "row-resize"
					}}
					onMouseDown={(event) => onMouseDownOnItemBottomEdge!(event, layoutAttributes)}
				>
				</div>
			</div>
		</div>
	)
}
