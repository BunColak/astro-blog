---
tags: ["hooks","typescript","react"]
title: Fetching Data With Custom React Hooks
description: So there I was, bored during 'Great Covid Social Distancing', I have come across a Wes Bos's video about fetching data with React Hooks...
pubDatetime: 2020-03-20
---
So there I was, bored during 'Great Covid Social Distancing', I have come across [Wes Bos's video](https://www.youtube.com/watch?v=B85s0cjlitE) about fetching data with React Hooks. It was something that I had kept seeing but never put into action too much. So naturally, I had tried it with Typescript. Which was successful, but I was not happy with it. There was no type safety of it. No route definitions, no response schemes. I knew that if I was to use it on a larger scale application, type safety would be great help both documentation and prevent random usages within the team.

As a demo, I have used [JSONPlaceholder API](https://jsonplaceholder.typicode.com/). I used the `Posts`, `Users` and `Comments` endpoint. As a start I had defined the fields that I would be using from those resources:

```js
export interface IPost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface IComment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
}
```

And obviously, I would need some filtering, some pagination as well. I have defined possible filtering and pagination parameters as a single interface. The better approach would be to separate them, but ... you know ... laziness and stuff ... I had dishes to wash ...  

```js
interface FilterParams {
  userId?: string;
  postId?: string;
  _page?: number;
  _limit?: number;
}
```

Now the magic: Generic types. Generic types allow you to define a type that can be one of many types. And you can get this type on function call and use it as you will. I have defined my response type as a union type:

```js
type ResponseTypes = IPost | IPost[] | IComment | IComment[] | IUser | IUser[];
```

Then I defined my `useApi` method with this type and casted it to my data state:

```js
const useApi = <T extends ResponseTypes>(path: string, params?: FilterParams) => {
  const [data, setData] = useState<T | null>(null);
      ...
}
```

So what happens here is `T` is a generic type extending ResponseType so we know which types it can inherit. Then this type T is being casted to data as well. So when we use it on a component we know what we will be getting, hence type safety and the great code completion come with it.

Usage in a component is fairly simple as well:

```js
const { data: post, loading } = useApi<IPost>(`/posts/${id}`);
```

With usage like this we know for sure that post is either null, which is before loaded, or `IPost` after being loaded. Neato!

### Further usages

After doing this I have decided to test for some other common use cases when using an API as well.

#### Pagination and filtering

For pagination I have done a small trick with `useEffect`. Simply I have put the filter parameters into dependency array of the useEffect doing the fetch call. Then I have written a small function that changes the filter parameters as well. Rest is easy, call the function returned from the `useApi` and the data will be refreshed automatically. The important part is to wrap the `changeParams` function with `useCallback` to prevent infinite renders:

```js
const changeParams = useCallback((newParams: FilterParams) => {
  setFilterParams(newParams);
}, [])
```

In the component you can safely use it in a `useEffect` call this way:
```js
useEffect(() => {
  changeParams({ _limit: currentCount });
}, [currentCount, changeParams])
```

#### Refetching

Most of the time depending on the actions on the page you'll want to refetch the data. For example, if this was a Twitter kind of feed, you would have wanted to refetch data in every 5 seconds or so. To achieve this, I have up a refetch flag on the `useApi` and put it into useEffect dependencies as well. Then I have returned another memoized function called `refetch` which would toggle the flag I have set, causing refetching. Easy peasy.

```js
const refetch = useCallback(() => {
  setRefetchToggle(r => !r);
}, [])
```

The whole codebase can be found [here](https://github.com/BunColak/fetch-with-hooks). Also the demo, although the UI is not the best or even good, can be found [here](https://fetch-with-hooks.buncolak.now.sh/).  