import React, { useState, CSSProperties } from "react"
import { Provider, Item } from "./Context"
import Table from "./Table"

const Component = ({ items, onCreate }: { items: Item[], onCreate: (item: Item, done: (item: Item) => void) => void }) => {

	return (
		<Provider
			initialItems={items}
			onCreate={onCreate}
		>
			<Table />
		</Provider>
	)
}

export default Component