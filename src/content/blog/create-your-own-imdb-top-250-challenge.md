---
tags: ["typescript","react","graphql","automation"]
title: Create your own IMDB Top 250 challenge
description: I swear this pandemic will never end. Thus, I wanted to watch every movie I haven't watched from IMDB Top 250 list...
pubDatetime: 2020-12-28
---
I swear this pandemic will never end. Thus, I wanted to watch every movie I haven't watched from IMDB Top 250 list. Naturally, instead of watching the movies I wanted to write an application to automate my progress. I wasn't going to track my progress on a spreadsheet like a peasant.

So quick game plan: Small backend that will store the movie list and the progress. Everything will work without logging in, it will create a unique list for everyone. Frontend will simply show the list with the given list id.

Let's get to work.

## Backend
I wanted something simple and quick to implement, so NodeJS it is. I've been using Prisma ORM for a while and it works quite well. Since it is 2020 and GraphQL is super hyped, I used GraphQL as well. 

### Models
I have two models: Movie and UserList. 

Movie is, well, for movies. I could've used an API to pull them dynamically, however it is a simple 250 item list and it doesn't change quite often. So I used a crawler to get the items and put them into my db. 

UserList is just an ID for each list and a many-to-many relation to movies, which will hold the watched movies. This way I'll just hold the IDs of the watched movies and the rest will be unwatched obviously.

So here's our final models:

```prisma
model UserList {
  id String @id @default(cuid())
  finishedMovies Movie[] @relation(references: [id])
}

model Movie {
  id Int @id @default(autoincrement())
  title String @unique
  imdbRating Float
  link String
  watchedLists UserList[] @relation(references: [id])
}
```

### API
I am using TypeGraphQL for implementing my API. It is pretty simple to use and works perfectly well with Prisma as well. I am not going to into the details. But simply we define models for our responses and create resolvers for our queries and mutations.

Here I made some tricks to provide UserList. I created another data type that extended Movie, which includede `watched` variable as well. This way when I make a request, I don't need to match watched and unwatched stuff on frontend:
```js
@ObjectType()
export class ListMovie extends Movie {
  @Field()
  watched: boolean
}
```
Resolving this model is also simple with Prisma, basically get finished movies, get all movies, mark finished ones and return all:
```js
@FieldResolver((returns) => [ListMovie])
  async movies(@Root() userList: UserList, @Ctx() ctx: Context) {
    const finishedMovies = (
      await ctx.prisma.userList
        .findFirst({ where: { id: userList.id } })
        .finishedMovies()
    ).map((m) => m.id);

    const movies = await ctx.prisma.movie.findMany();

    return movies.map((movie) => ({
      ...movie,
      watched: finishedMovies.includes(movie.id),
    }));
  }
```

### Server
Just used an Apollo Server:

```js
const startServer = async () => {
  const schema = await buildSchema({
    resolvers: [MovieResolver, UserListResolver],
  })

  new ApolloServer({ schema, context, introspection: true }).listen({ port: PORT }).then(() => {
    console.log('server is running on ' + PORT)
  })
}
```
To deploy, simply used Heroku with Postgres plugin. Well at least initially, then I moved it to a private server.

## Frontend
Well, at this point it was well into the night and I was tired. So I just lazily put some stuff together. Used create-react-app with typescript template to bootstrap the application. Added TailwindCSS for styling and Apollo Client to fetch the data. It is not the prettiest app I have made, but considering I did all of it in around an hour or two, it does the job.

Only 'cool' thing I did there is some optimistic rendering while marking movies as watched. In essence, instead of using `watched` variable in the model, I simply used a local variable that changes when model changes. However, I manually change it when I start the mutation. Therefore, the UI refreshes first, then it re-validates itself when refetch happens after update.
```js
  const [toggleMovie, { loading }] = useMutation(MUTATION)
  const [optimisticWatched, setOptimisticWatched] = useState(movie.watched)
  const history = useHistory()

  useEffect(() => {
    setOptimisticWatched(movie.watched)
  }, [movie])

  const handleToggleMovie = async () => {
    const listId = getListId()
    if (!listId) {
      history.push('/')
    }
    try {
      setOptimisticWatched(r => !r)
      await toggleMovie({ variables: { listId, movieId: movie.id } })
    } catch (e) {
      console.log(e)
    } finally {
      refetch()
    }
```
### Deployment
Simply, simply Vercel :)

## Tl; dr
I made a website to track progress to do IMDB Top 250 challenge. All in all it was a good saturday night. You can access the app here: [https://top250-frontend.vercel.app](https://top250-frontend.vercel.app)

Also you can access the full code from here:
 + Backend: [https://github.com/buncolak/top250-backend/](https://github.com/buncolak/top250-backend/)
 + Frontend: [https://github.com/buncolak/top250-frontend/](https://github.com/buncolak/top250-frontend/)
