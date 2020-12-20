import React, { useContext, CSSProperties, ReactElement } from "react"
import { Context } from "../Table/Context"
import { LayoutAttributes } from "../Layout"

interface Props {
	normalStyle?: CSSProperties
	activeStyle?: CSSProperties
	children: ReactElement
}

// const Component = ({ item, index, isRequiredShadow, children }: { item: LayoutAttributes, index: number, isRequiredShadow?: boolean, children?: ReactElement }) => {
const Component = (props: Props) => {

	const {
		step,
		numberOfItems,
		onMouseDownOnItem,
		onMouseDownOnItemBottomEdge,
		onClickOnItem,
		operation,
		zIndex,
		cursor
	} = useContext(Context)

	const { normalStyle, activeStyle } = props
	const { layoutAttributes, index, isActive, children } = (props as any)
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
		userSelect: "none"
	}

	const defaultStyle: CSSProperties = {
		...position,
		border: "solid 1px #FFF",
		background: "rgba(0,119,255,0.7)",
		cursor: cursor ?? "pointer",
		boxSizing: "border-box",
		color: "#FFF",
		fontSize: "12px"
	}

	const _normalStyle = normalStyle ?? defaultStyle
	const _activeStyle = activeStyle ?? {
		...defaultStyle,
		boxShadow: `0px 2px 25px 0px ${defaultStyle.background}`
	}

	// if (operation?.move?.before === layoutAttributes || operation?.update?.before === layoutAttributes) {
	// 	provideStyle = {
	// 		...provideStyle,
	// 		opacity: 0.6
	// 	}
	// }

	return (
		<div
			style={isActive ? _activeStyle : _normalStyle}
			onMouseDown={(event) => onMouseDownOnItem!(event, layoutAttributes)}
			onClick={(event) => onClickOnItem!(event, layoutAttributes)}
		>
			<div
				style={{
					width: "100%",
					height: "100%",
					position: "relative"
				}}
			>
				{children}
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

export default Component