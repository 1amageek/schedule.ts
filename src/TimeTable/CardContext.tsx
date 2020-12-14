import React, { useState, createContext, useEffect, useContext, ReactElement } from "react"

interface Props {

}

export const Context = createContext<Props>({})


export const CardItemProvider = ({ children }: {
	children: ReactElement
}) => {
	return (
		<Context.Provider
			value={{}}>
			{children}
		</Context.Provider>
	)
}

export const useCardItem = () => {
	return useContext(Context)
}