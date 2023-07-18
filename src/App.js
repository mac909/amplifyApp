import logo from "./logo.svg";
import "./App.css";
import { useState, useEffect } from "react";
import "@aws-amplify/ui-react/styles.css";
import { API, Storage } from "aws-amplify";
import {
	withAuthenticator,
	Button,
	Heading,
	Image,
	View,
	Card,
	Text,
	Flex,
	TextField,
} from "@aws-amplify/ui-react";
import { listTodos } from "./graphql/queries";
import {
	createTodo as createTodoMutation,
	deleteTodo as deleteTodoMutation,
} from "./graphql/mutations";

function App({ signOut }) {
	const [todos, setTodos] = useState([]);

	useEffect(() => {
		fetchTodos();
	}, []);

	async function fetchTodos() {
		const apiData = await API.graphql({ query: listTodos });
		const todosFromAPI = apiData.data.listTodos.items;
		await Promise.all(
			todosFromAPI.map(async (todo) => {
				if (todo.image) {
					const url = await Storage.get(todo.name);
					todo.image = url;
				}
				return todo;
			})
		);
		setTodos(todosFromAPI);
	}

	async function createTodo(event) {
		event.preventDefault();
		const form = new FormData(event.target);
		const image = form.get("image");
		const data = {
			name: form.get("name"),
			description: form.get("description"),
			image: image.name,
		};
		await API.graphql({
			query: createTodoMutation,
			variables: { input: data },
		});
		fetchTodos();
		event.target.reset();
	}

	async function deleteTodo({ id, name }) {
		const newTodos = todos.filter((todo) => todo.id !== id);
		setTodos(newTodos);
		await Storage.remove(name);
		await API.graphql({
			query: deleteTodoMutation,
			variables: { input: { id } },
		});
	}

	return (
		<View className="App">
			<Heading level={1}>Amplify Notes</Heading>
			<View as="form" onSubmit={createTodo} margin="3rem 0">
				<Flex direction="row" justifyContent="center">
					<TextField
						name="name"
						placeholder="Note Name"
						label="Note Name"
						labelHidden
						variation="quiet"
						required
					/>
					<TextField
						name="description"
						placeholder="Note Description"
						label="Note Description"
						labelHidden
						variation="quiet"
						required
					/>
					<View
						name="image"
						as="input"
						type="file"
						style={{ alignSelf: "end" }}
					/>
					<Button type="submit" color="primary">
						Create Todo
					</Button>
				</Flex>
			</View>
			<Heading level={3}>My Todos</Heading>
			<View margin="3rem 0">
				{todos.map((todo) => (
					<Flex key={todo.id} direction="row" justifyContent="center">
						<Text as="strong" fontWeight={700}>
							{todo.name}
						</Text>
						<Text as="span">{todo.description}</Text>
						{todo.image && (
							<Image
								src={todo.image}
								alt={`visual aid for ${todo.name}`}
								style={{ width: 400 }}
							/>
						)}
						<Button
							variation="link"
							onClick={() => deleteTodo(todo)}
						>
							Delete Note
						</Button>
					</Flex>
				))}
			</View>
			<Button onClick={signOut}>Sign Out</Button>
		</View>
	);
}

export default withAuthenticator(App);
