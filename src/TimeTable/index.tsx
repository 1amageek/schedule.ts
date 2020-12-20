import React, { ReactElement } from "react"
import { Provider, Data, Item } from "./Table/Context"
import Table from "./Table"


const Component = ({ data, onCreate, children }: { data: Data, children: ReactElement, onCreate: (item: Item, done: (item: Item) => void) => void }) => {

	return (
		<Provider
			initialData={data}
			onCreate={onCreate}
		>
			<Table>
				{children}
			</Table>
		</Provider>
	)
}

export default Component