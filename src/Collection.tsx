import React from "react"

interface Props {
	children: React.ReactElement
}

const Collection = (props: Props) => {



	return (
		<div>
			{props.children}
		</div>
	)
}

export default Collection