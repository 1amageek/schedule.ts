import { useRef, useState, useEffect, RefObject } from "react"

export interface Point {
	x: number
	y: number
}

export interface Size {
	width: number
	height: number
}

export interface Rect {
	origin: Point
	size: Size
}

export const useWindowSize = () => {
	const [size, setSize] = useState([0, 0])
	useEffect(() => {
		const updateSize = () => {
			setSize([window.innerWidth, window.innerHeight])
		}
		window.addEventListener('resize', updateSize)
		updateSize()
		return () => window.removeEventListener('resize', updateSize)
	}, []);
	return size;
}

export const useWidth = <T extends HTMLElement>(): [RefObject<T>, number] => {
	const [windowSize] = useWindowSize()
	const ref = useRef<T>(null)
	const [width, setWidth] = useState(0)
	useEffect(() => {
		if (ref.current) {
			const { width } = ref.current.getBoundingClientRect()
			setWidth(width)
		}
	}, [ref.current, JSON.stringify(windowSize)])
	return [ref, width]
}

export const useHeight = <T extends HTMLElement>(): [RefObject<T>, number] => {
	const [windowSize] = useWindowSize()
	const ref = useRef<T>(null)
	const [height, setHeight] = useState(0)
	useEffect(() => {
		if (ref.current) {
			const { height } = ref.current.getBoundingClientRect()
			setHeight(height)
		}
	}, [ref.current, JSON.stringify(windowSize)])
	return [ref, height]
}

export const useSize = <T extends HTMLElement>(): [RefObject<T>, Size] => {
	const [windowSize] = useWindowSize()
	const ref = useRef<T>(null)
	const [frame, setFrame] = useState<Size>({
		width: 0,
		height: 0
	})
	useEffect(() => {
		if (ref.current) {
			const { width, height } = ref.current.getBoundingClientRect()
			setFrame({ width, height })
		}
	}, [ref.current, JSON.stringify(windowSize)])
	return [ref, frame]
}
