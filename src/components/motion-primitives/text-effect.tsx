"use client";

import type { ElementType, ReactNode } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TextEffectProps<T extends ElementType = "div"> = {
	as?: T;
	className?: string;
	children: ReactNode;
	delay?: number;
	speedSegment?: number;
	preset?: "fade-in-blur";
	per?: "line" | "word" | "char";
};

export function TextEffect<T extends ElementType = "div">({
	as,
	className,
	children,
	delay = 0,
	speedSegment = 0.3,
}: TextEffectProps<T>) {
	const Component = (as ?? "div") as ElementType;
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const timer = window.setTimeout(
			() => setIsVisible(true),
			Math.max(delay, 0) * 1000,
		);
		return () => window.clearTimeout(timer);
	}, [delay]);

	return (
		<Component
			className={cn(
				"transition-all ease-out will-change-transform",
				isVisible
					? "opacity-100 translate-y-0 blur-0"
					: "opacity-0 translate-y-6 blur-[3px]",
				className,
			)}
			style={{
				transitionDuration: `${Math.max(speedSegment, 0.2)}s`,
			}}
		>
			{children}
		</Component>
	);
}
