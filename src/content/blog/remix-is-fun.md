---
title: Remix is Fun, a somewhat simple app with Google Auth
tags: ["remix", "typescript", "react", "prisma"]
description: Remix is new, but as it turns out it is really fun to develop
pubDatetime: 2022-05-22
---


We have a book club at the office. Each month or two everyone suggests a book and we vote for one to read and discuss together. For voting, we wanted to use [Quadratic Voting](https://en.wikipedia.org/wiki/Quadratic_voting). However, we couldn't decide on a website to use for voting. So I decided to code for one.

Remix, until a couple of months ago was a proprietary framework from the people that brought `react-router` and `testing-library`. Its motto can be summarized as *"Don't reinvent the wheel, use the platform."*. For many things we do on web, over the years we have developed alternative ways to do them which became the normal way of doing things. For example:
```jsx
const onSubmit = (e) => {
	e.preventDefault()
	...
}

<form onSubmit={onSubmit}>
...
</form>

```
For newbies, this `e.preventDefault()` is actually a pretty big question mark. Why prevent default? It is a simple form, isn't it? Why am I overriding the default behavior?

Remix brings back the default behaviors as much as possible. To be honest, it is still in a maturing phase. Docs are not as comprehensive as other libraries and the community is not as large as well. However, since it uses 'web standards' finding help and alternatives is usually straightforward. So let's get down to it.

## What do I need?
Well, I need a couple of pages and really a few functions that's all.

 - Landing Page
 - Create / Join page for polls
 - Poll overview page
 - Voting page

I need a database, I used Heroku PostgreSQL because it is free. I am going to use Prisma as the client.
The app will work anonymously as well, but for people who want to keep track of their votes there will be a Google Login as well. Styling is with TailwindCSS and deployment is to Vercel.

## Implementation
For starters, this code is by no means "clean". I wrote most of it in two evenings and didn't properly test it. I don't want to get into details too much so I will start with Remix basics with routing and give the most important parts. The whole code is available on [GitHub](https://github.com/buncolak/quadratic-vote).

### Routing in Remix
Every file under `app/routes` is a route. By that I don't mean a "view". It is a route which you can use HTTP methods GET/POST. 

In each file you can:

 - Define a view as a React Component with default export. This component will be server-side rendered. 

```jsx
export default function MyPage() {
return <div>Hello There</div>
}
```
 - Define a GET endpoint which can be triggered manually as an API or automatically when this page is reached alongside with the view.
```jsx
export const loader: LoaderFunction = async (params) => {
	return {
		data: "whatever"
	}
}
```
 - Define a POST endpoint.
```jsx
export const action: ActionFunction = async (params) => {
	return {
		data: "whatever but with POST"
	}
}
```

Remix also provides some nifty hooks for the view layer to access the endpoint data: `useLoaderData` and `useActionData` .

## A route with a query
Let's check out the "Poll Page" where one can see the details for a poll, votes etc.
```jsx
export  const  loader: LoaderFunction = async ({
	params,
	request,
}): Promise<PollLoaderData> => {
	...
	...
	const  poll = await  db.poll.findFirst({
		where: { id:  params.pollId },
	});

	if (!poll) {
		throw  new  Response("Poll Not found", { status:  404 });
	}
	....
	....

	return { poll, voters, options, currentUrl:  request.url, myVotePageId };
};

  
const PollDetails = () => {
	const { poll, options, myVotePageId } = useLoaderData<PollLoaderData>();

	return (
		<div  className="container p-4 mx-auto">
		....
		</div>
	)
}

export default PollDetails
```
I like this simplicity and separation of concern. `loader` function is the GET call to this page. `PollDetails` is the view layer. The view layer simply shows the page and handles user interaction whereas the loader is responsible for fetching the data. Whatever `loader` returns we can access it with `useLoaderData`. This makes testing much easier because as a unit test we can test the functions separately and have the whole app logic tested via `cypress` etc.

## A route with a mutation
So let's take a look at the "Create Poll Page":
```jsx
type ActionData = {
	fieldErrors?: {
		[k: string]: string;
	};
	error?: string;
};

export  const  action: ActionFunction = async ({ request }) => {
	const authorId = await  getUserId(request);
	const formData = await  request.formData();

	const formValues = {
		title:  formData.get("title"),
		description:  formData.get("description"),
		initialCredits:  formData.get("initialCredits"),
		questions:  formData.getAll("questions"),
	};
	...
	...
	...
	return { fieldErrors, error }
}

const CreatePoll = () => {
	const actionData = useActionData<ActionData>();
	
	return <Form method="post" action="/create">
		...
		...
		<div className="form-control">
			<label  htmlFor="title"  className="label">
				Title
			</label>
			<input className="input"  type="text"  name="title"  required  />
			<p hidden={!actionData?.fieldErrors?.title}>
					{actionData?.fieldErrors?.title}
			</p>
		</div>
		...
		...
	</Form>
}

export default CreatePoll
``` 

Pretty simple eh? Let's explain a bit further. If a user makes a POST request to `/create`  the `action` function will be triggered. **Surprise, that is how forms work**.  So we just set the method to `post` on our form and the form directly works against the action function. We can also get the values from that function with the `useActionData` hook and it is type-safe. We can also use `useTransition` to handle the `submitting` state etc. as well, but I was a bit lazy that day. Maybe for version 2.

## Wait wait, what about mutations without a redirect etc.
There is a simple way for that as well. `useFetcher`  provides everything you need. Usually, this is required for what I would call *'inline mutations'* like liking a tweet, upvoting a post, etc. where the action is async and does not affect the page history. I am using this to add/remove votes for a poll option.

```jsx
// app/components/Voting.tsx

const  Voting: React.FC<VotingProps> = ({ options, votes, voterId }) => {
	const  fetcher = useFetcher();

	return (
		<div>
			<div hidden={!fetcher?.data}>
				<h2>{fetcher?.data}</h2>
			</div>
			
			<ul>
				...
				<fetcher.Form  action="/vote/decrement"  method="post">
					<input hidden  name="optionId"  value={optionId}  readOnly  />
					<input hidden  name="voterId"  value={voterId}  readOnly  />
					<button
						disabled={fetcher.state === "submitting"}
						type="submit"
					>
						<span>-</span>
					</button>
				</fetcher.Form>
			...
	)
};
export  default  Voting;
```
This works pretty much the same as a normal form, but the data handling and the intermediate states are automatically handled. No more controlled states for inputs :)

## Authentication
I used Google Login, because I didn't want a registration form, and the only point for having it was the name and the unique id.

I have to come clean, I used Kent C. Dodds' example code from the docs for session management. The app uses Google to get an Auth token and `get or create user` against my database. Then sets the session token with the Google oAuth Token id. I am not going deep into the Google login, but just providing the code. Most of the things are just Google's library.

Google Login Button:
```jsx
// app/components/Navbar.tsx

<div
	className="g_id_signin"
	data-type="standard"
	data-shape="pill"
	data-theme="filled_blue"
	data-text="signin_with"
	data-size="large"
	data-logo_alignment="left"
></div>
<div
	id="g_id_onload"
	data-client_id={data.clientId}
	data-context="signin"
	data-ux_mode="popup"
	data-login_uri={data.redirectUri}
	data-auto_prompt="false"
></div>

// app/root.tsx
<script
	src="https://accounts.google.com/gsi/client"
	async
	defer
></script>
```
Login Callback:
```jsx
// app/routes/auth/callback.tsx
export const  action: ActionFunction = async ({ request }) => {
	// validate token
	const formData = await  request.formData();
	const token = formData.get("credential");
	
	if (typeof token !== "string") {
		return  redirect("/");
	}

	// Get or create user
	const user = await getOrCreateUser(token);

	// create session
	return createUserSession(user.oauthId, "/");
};
```
## Conclusions
Final Application: https://quadratic-vote.vercel.app/ (Not very well tested, but feedback is appreciated.)

Remix is pretty fun. I liked using it. Coding was simple and intuitive. Even though my Remix knowledge was limited I didn't feel limited by it. I think I will use it more. Maybe in my next post, I will do the testing for the application and post that as well. Thank you for taking the time to at least skim over it :) 

PS. Also special thanks and shoutout to my beautiful wife for the simple designing the app. 
