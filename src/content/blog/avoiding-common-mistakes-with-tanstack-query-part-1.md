---
title: Avoiding Common Mistakes with TanStack Query Part 1
description: TanStack Query is probably the most popular library for fetching data in React. It is simple and powerful, but there are some common mistakes I see repeated.
pubDatetime: 2024-03-04 00:00:00
tags: ["react", "tanstack-query", "javascript", "web-development", "frontend", "react-query", "mistakes", "common-mistakes", "tanstack"]
---

TanStack Query is undeniably one of the most popular and the most useful library for data fetching. Especially for React, data fetching can get complicated easily. 

Although it is pretty commonly used, I noticed several common mistakes people do while using TanStack Query. I wanted to give some insights on these mistakes and explain why they are problematic. 

**Quick note**: *All of these mistakes can be in your code, they can work and they can be explained by various factors. The best code you can write is the one you can ship. Remember to ship first.*
## 1. Mapping data to Redux/Context

A common mistake is mapping data fetched with TanStack Query to Redux or Context, a carryover from previous practices. I've seen two versions of this over time.

### First example: Dispatch during query

This is unfortunately pretty common mistake to do. I've seen this mostly in codebases that used Redux/Context to store the data and migrated to TanStack afterwards. 

Mostly the reasoning behind this is to call query once and use the existing state in other components in order to prevent fetching multiple times.

```tsx
const useTodos = () => {
	const dispatch = useDispatch()

	return useQuery({
			queryKey: ['todos'],
			queryFn: async () => {
				dispatch(setLoading(true))
				const data = await apiService.getTodos()
				dispatch(setTodos(data))
				dispatch(setLoading(false))
				return data
			}
		})
}


const TodoList = () => {
	useTodos()

	const todos = useSelector(state => state.todos)
  
	return (
		<div>
			{todos.map(todo => (<div key={todo.id}>{todo.title}</div>))}
		</div>
	)
}
```

Several problems:
- **First obvious problem is having two states racing each other for the same information.** TanStack keeps data, loading, error and various other states for the call already. Duplicating this results in two states momentarily being different and manual management of the already maintained data.
- **Not utilizing the query cache**. TanStack Query caches data based on query keys and automatically handles invalidation. Mapping this data manually requires maintaining cache manually as well and may result in different data between cache and displayed.
- **Triggering more renders**. This approach triggers 3 dispatches, which can cause renders where we don't want it to happen.

### Second Example: useEffect

This is not as common as the first example. The reasoning is similar, however the execution in this case is even worse since this can cause even more renders than the previous one. When the data changes, it already causes a render, which causes the dispatch, which causes another render.

```tsx
const useTodos = () => {
    return useQuery({
        queryKey: ['todos'],
        queryFn: async () => {
            return await apiService.getTodos()
        }
    })
}

const TodoList = () => {
    const dispatch = useDispatch()

    const { data } = useTodos()

    const todos = useSelector(state => state.todos)

    useEffect(() => {
        if (data) {
            dispatch({ type: 'SET_TODOS', payload: data })
        }
    }, [data])

    return (
        <div>
            {todos.map(todo => (
                <div key={todo.id}>{todo.title}</div>
            ))}
        </div>
    )
}
```

### Solution

**Just use the TanStack Query results.** If the components using the same query key render at the same time it won't result in an additional request either. If they are not, just adjusting the `staleTime` would solve the issue. TkDodo already has the best resource for this [here](https://tkdodo.eu/blog/react-query-as-a-state-manager).

```tsx
const useTodos = () => {
    return useQuery({
        queryKey: ['todos'],
        queryFn: async () => {
            return await apiService.getTodos()
        },
    })
}


const TodoList = () => {
    const { data, isLoading, isError, ...rest } = useTodos()

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (isError) {
        return <div>Error</div>
    }

    return (
        <div>
            {todos.map(todo => (
                <div key={todo.id}>{todo.title}</div>
            ))}
        </div>
    )
} 
```

## 2. Refetching data

This is another common mistake. I belive one of the reasoning behind this is the `refetch` function that TanStack Query provides. It is a powerful tool, but it is not meant to be used for every case. 

**Refetch function should only be used when the same query is called with exactly the same parameters.** If you are using new parameters *(new filters, pages etc.)*, you should use a new query key. 

```tsx
const useTodos = (page: number) => {
    return useQuery({
        queryKey: ['todos'],
        queryFn: async () => {
            return await apiService.getTodos(page)
        },
    })
}

const TodoList = () => {
    const [page, setPage] = useState(1)
    const {refetch} = useTodos(page)

    const onClick = () => {
        setPage((prev) => prev + 1)
        refetch()
    }

    return (
        <div>
            <button onClick={onClick}>click me!</button>
            ....
        </div>
    )
}

```

### Problems:

- **If your query is dependent on something, that should be part of the query key.** If you are refetching with the same query key, you are not utilizing the cache properly and all of the queries will target the same key in the query client. *That means if you go back and forth between pages, not only you will always refetch the data, it will create a race condition between the requests.* If an old request resolves after a new one, it will override the new one and show the old data.
- Refetch does not necessarily happen after the state is updated. Refetch has a chance happen with the old page parameter.

### Solution:

- Add your parameters to the query key. If you are using a page parameter, add it to the query key. If you are using a filter, add it to the query key. This way, when the parameters change, a new query will be created and the cache will be utilized properly. Data will be automatically fetched as well.
- Bonus point, you can use the query key to get the params in query function as well.

```tsx
const useTodos = (page: number) => {
    return useQuery({
        queryKey: ['todos', page],
        queryFn: async () => {
            // or you can use the query key to get the page
            return await apiService.getTodos(page)
        },
    })
}

const TodoList = () => {
    const [page, setPage] = useState(1)
    const {data, ...rest} = useTodos(page)

    const onClick = () => {
        setPage((prev) => prev + 1)
    }

    return (
        <div>
            <button onClick={onClick}>click me!</button>
            ....
        </div>
    )
}
```

## 3. Transforming data after fetching

Backends rarely return the data frontend exactly needs. It is pretty common to transform the data after fetching. However, I see people doing this in the wrong place.

Not much I can add here because all that needs to be said is said again by TkDodo [here](https://tkdodo.eu/blog/react-query-data-transformations).

I can just provide some examples of the bad ones:

```tsx
  const [page, setPage] = useState(1)
  const {data} = useTodos(page)
  const [todos, setTodos] = useState([])
  
  useEffect(() => {
    if (data) {
      setTodos(filterTodos(data))
    }
  }, [data])

  return (
    <div>
      {todos.map((todo, index) => (
        <div key={index}>{todo}</div>
      ))}
    </div>
  )
```

I hope this helps you to avoid these common mistakes that I encountered. If you have any questions or comments, feel free to reach out to me!