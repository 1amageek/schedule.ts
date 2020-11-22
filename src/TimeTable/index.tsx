import React, { useState, CSSProperties } from "react"
import { Provider, Data, Item } from "./Context"
import Table from "./Table"

const Component = ({ data, onCreate }: { data: Data, onCreate: (item: Item, done: (item: Item) => void) => void }) => {

	return (
		<Provider
			initialData={data}
			onCreate={onCreate}
		>
			<Table />
		</Provider>
	)
}

export default Component