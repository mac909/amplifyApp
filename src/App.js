import logo from "./logo.svg";
import "@aws-amplify/ui-react/styles.css";
import {
	withAuthenticator,
	Button,
	Heading,
	Image,
	View,
	Card,
} from "@aws-amplify/ui-react";

function App({ signOut }) {
	return (
		<View>
			<Card>
				<Image src={logo} alt="logo" />
				<Heading level={1}>
					Welcome to Your Amplify App with Authentication!
				</Heading>
			</Card>
			<Button onClick={signOut}>Sign out</Button>
		</View>
	);
}

export default withAuthenticator(App);
