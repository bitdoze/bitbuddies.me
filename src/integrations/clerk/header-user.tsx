import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

export default function HeaderUser() {
	return (
		<>
			<SignedIn>
				<UserButton />
			</SignedIn>
			<SignedOut>
				<SignInButton mode="modal">
					<Button variant="outline" size="sm">
						Sign In
					</Button>
				</SignInButton>
			</SignedOut>
		</>
	);
}
