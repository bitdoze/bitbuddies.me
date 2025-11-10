"use client";

import type { ElementType, ReactElement, ReactNode } from "react";
import {
	Children,
	cloneElement,
	isValidElement,
	useEffect,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";

type AnimatedGroupProps<T extends ElementType = "div"> = {
	as?: T;
	className?: string;
	children: ReactNode;
	variants?: {
		container?: {
			visible?: {
				transition?: {
					delayChildren?: number;
					staggerChildren?: number;
				};
			};
		};
	};
};

export function AnimatedGroup<T extends ElementType = "div">({
	as,
	className,
	children,
	variants,
}: AnimatedGroupProps<T>) {
	const Component = (as ?? "div") as ElementType;
	const [isVisible, setIsVisible] = useState(false);

	const delayChildren =
		variants?.container?.visible?.transition?.delayChildren ?? 0;
	const staggerChildren =
		variants?.container?.visible?.transition?.staggerChildren ?? 0.05;

	useEffect(() => {
		const timer = window.setTimeout(
			() => setIsVisible(true),
			delayChildren * 1000,
		);
		return () => window.clearTimeout(timer);
	}, [delayChildren]);

	const items = Children.toArray(children);
	const fallbackKeysRef = useRef<string[]>([]);

	if (fallbackKeysRef.current.length !== items.length) {
		fallbackKeysRef.current = items.map((_, index) => {
			const existing = fallbackKeysRef.current[index];
			if (existing) {
				return existing;
			}
			if (crypto?.randomUUID) {
				return crypto.randomUUID();
			}
			return `animated-${Date.now()}-${index}`;
		});
	}

	return (
		<Component
			className={cn("relative", className)}
			data-visible={isVisible ? "true" : undefined}
		>
			{items.map((child, index) => {
				const transitionDelay = delayChildren + index * staggerChildren;
				const baseClass = cn(
					"transition-all duration-700 ease-out will-change-transform",
					isVisible
						? "opacity-100 translate-y-0 blur-0"
						: "opacity-0 translate-y-4 blur-[3px]",
				);
				const style = { transitionDelay: `${transitionDelay}s` };

				if (isValidElement(child)) {
					return cloneElement(child as ReactElement, {
						className: cn(
							(child as ReactElement<{ className?: string }>).props.className,
							baseClass,
						),
						style: {
							...(child as ReactElement<{ style?: Record<string, unknown> }>)
								.props?.style,
							...style,
						},
					});
				}

				return (
					<span
						key={fallbackKeysRef.current[index]}
						className={baseClass}
						style={style}
					>
						{child}
					</span>
				);
			})}
		</Component>
	);
}
