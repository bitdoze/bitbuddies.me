export function Logo({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 280 64"
			className={className}
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-labelledby="bitbuddiesLogoTitle bitbuddiesLogoDesc"
		>
			<title id="bitbuddiesLogoTitle">BitBuddies Logo</title>
			<desc id="bitbuddiesLogoDesc">
				BitBuddies logo with gradient badge and text
			</desc>
			<defs>
				<linearGradient
					id="bitbuddiesGradient"
					x1="5%"
					x2="95%"
					y1="0%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#22d3ee" />
					<stop offset="50%" stopColor="#6366f1" />
					<stop offset="100%" stopColor="#a855f7" />
				</linearGradient>
			</defs>

			{/* Icon */}
			<g>
				<rect width="56" height="56" x="4" y="4" rx="18" fill="url(#bitbuddiesGradient)" />
				<g fill="#f8fafc">
					<circle cx="24" cy="26.5" r="7" />
					<circle cx="40" cy="26.5" r="7" />
				</g>
				<path
					d="M20.5 38.5c3.5 6.5 19.5 6.5 23 0a10.5 10.5 0 0 0-11.5-14.6 10.5 10.5 0 0 0-11.5 14.6Z"
					fill="rgba(15, 23, 42, 0.18)"
				/>
				<path
					d="M20.8 38c3.2 5.2 18.2 5.2 21.6 0"
					fill="none"
					stroke="#f1f5f9"
					strokeLinecap="round"
					strokeWidth="2.2"
				/>
				<circle cx="24" cy="26.5" r="2.2" fill="#0f172a" opacity="0.72" />
				<circle cx="40" cy="26.5" r="2.2" fill="#0f172a" opacity="0.72" />
				<path
					d="M32 17.5a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4Z"
					fill="#f8fafc"
					opacity="0.9"
				/>
				<path
					d="M27.2 48.5c2.2 2.4 7.4 2.4 9.6 0"
					fill="none"
					stroke="#f1f5f9"
					strokeLinecap="round"
					strokeWidth="2"
					opacity="0.65"
				/>
			</g>

			{/* Text */}
			<text
				x="75"
				y="38"
				className="fill-foreground font-bold"
				style={{ fontSize: "28px", fontFamily: "system-ui, sans-serif" }}
			>
				BitBuddies
			</text>
		</svg>
	);
}

export function LogoHeader({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 280 64"
			className={className}
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-labelledby="bitbuddiesLogoHeaderTitle bitbuddiesLogoHeaderDesc"
		>
			<title id="bitbuddiesLogoHeaderTitle">BitBuddies Logo</title>
			<desc id="bitbuddiesLogoHeaderDesc">
				BitBuddies logo with gradient badge and text
			</desc>
			<defs>
				<linearGradient
					id="bitbuddiesGradientHeader"
					x1="5%"
					x2="95%"
					y1="0%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#22d3ee" />
					<stop offset="50%" stopColor="#6366f1" />
					<stop offset="100%" stopColor="#a855f7" />
				</linearGradient>
			</defs>

			{/* Icon */}
			<g>
				<rect width="56" height="56" x="4" y="4" rx="18" fill="url(#bitbuddiesGradientHeader)" />
				<g fill="#f8fafc">
					<circle cx="24" cy="26.5" r="7" />
					<circle cx="40" cy="26.5" r="7" />
				</g>
				<path
					d="M20.5 38.5c3.5 6.5 19.5 6.5 23 0a10.5 10.5 0 0 0-11.5-14.6 10.5 10.5 0 0 0-11.5 14.6Z"
					fill="rgba(15, 23, 42, 0.18)"
				/>
				<path
					d="M20.8 38c3.2 5.2 18.2 5.2 21.6 0"
					fill="none"
					stroke="#f1f5f9"
					strokeLinecap="round"
					strokeWidth="2.2"
				/>
				<circle cx="24" cy="26.5" r="2.2" fill="#0f172a" opacity="0.72" />
				<circle cx="40" cy="26.5" r="2.2" fill="#0f172a" opacity="0.72" />
				<path
					d="M32 17.5a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4Z"
					fill="#f8fafc"
					opacity="0.9"
				/>
				<path
					d="M27.2 48.5c2.2 2.4 7.4 2.4 9.6 0"
					fill="none"
					stroke="#f1f5f9"
					strokeLinecap="round"
					strokeWidth="2"
					opacity="0.65"
				/>
			</g>

			{/* Text - 40% larger */}
			<text
				x="75"
				y="40"
				className="fill-foreground font-bold"
				style={{ fontSize: "39px", fontFamily: "system-ui, sans-serif" }}
			>
				BitBuddies
			</text>
		</svg>
	);
}

export function LogoIcon({ className = "" }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 64 64"
			className={className}
			role="img"
			aria-labelledby="bitbuddiesIconTitle bitbuddiesIconDesc"
		>
			<title id="bitbuddiesIconTitle">BitBuddies icon</title>
			<desc id="bitbuddiesIconDesc">
				A gradient badge with two connected orbits representing collaboration
			</desc>
			<defs>
				<linearGradient
					id="bitbuddiesGradientIcon"
					x1="5%"
					x2="95%"
					y1="0%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#22d3ee" />
					<stop offset="50%" stopColor="#6366f1" />
					<stop offset="100%" stopColor="#a855f7" />
				</linearGradient>
			</defs>
			<rect width="56" height="56" x="4" y="4" rx="18" fill="url(#bitbuddiesGradientIcon)" />
			<g fill="#f8fafc">
				<circle cx="24" cy="26.5" r="7" />
				<circle cx="40" cy="26.5" r="7" />
			</g>
			<path
				d="M20.5 38.5c3.5 6.5 19.5 6.5 23 0a10.5 10.5 0 0 0-11.5-14.6 10.5 10.5 0 0 0-11.5 14.6Z"
				fill="rgba(15, 23, 42, 0.18)"
			/>
			<path
				d="M20.8 38c3.2 5.2 18.2 5.2 21.6 0"
				fill="none"
				stroke="#f1f5f9"
				strokeLinecap="round"
				strokeWidth="2.2"
			/>
			<circle cx="24" cy="26.5" r="2.2" fill="#0f172a" opacity="0.72" />
			<circle cx="40" cy="26.5" r="2.2" fill="#0f172a" opacity="0.72" />
			<path
				d="M32 17.5a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4Z"
				fill="#f8fafc"
				opacity="0.9"
			/>
			<path
				d="M27.2 48.5c2.2 2.4 7.4 2.4 9.6 0"
				fill="none"
				stroke="#f1f5f9"
				strokeLinecap="round"
				strokeWidth="2"
				opacity="0.65"
			/>
		</svg>
	);
}
