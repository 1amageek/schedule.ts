import { useRef, useState, useEffect, useLayoutEffect, RefObject } from "react"

export const useWindowSize = () => {
	const [size, setSize] = useState([0, 0])
	useEffect(() => {
		const updateSize = () => {
			setSize([window.innerWidth, window.innerHeight])
		}
		window.addEventListener('resize', updateSize)
		updateSize();
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

export const useFrame = <T extends HTMLElement>(): [RefObject<T>, { width: number, height: number }] => {
	const [windowSize] = useWindowSize()
	const ref = useRef<T>(null)
	const [frame, setFrame] = useState({
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
