---
tags: ["typeorm","typescript","backend", "graphql",]
title: GraphQL API with Typescript / TypeORM + TypeGraphQL
description: I like GraphQL, a lot. Especially if I'm doing a small project and don't want to deal with defining endpoints and optimizing them for their usage...
pubDatetime: 2020-03-01
---
I like GraphQL, a lot. Especially if I'm doing a small project and don't want to deal with defining endpoints and optimizing them for their usage. I don't want to make 15 different XHR requests just to show some information. This, of course, can be solved with better API design, but this isn't an ideal world and the sky is not always blue. 

When I'm programming Node backend, I like using Typescript. It is typesafe and feels more organized. I don't want to push Typescript down your throat, I just like it. My opinion. However, whenever I tried to create an API with GraphQL and Typescript, I always had problems with type definitions. Because if you use SDL, you don't get type definitions and I don't like the other options like [code generators](https://graphql-code-generator.com/) or [Nexus](https://github.com/prisma-labs/nexus). If you add ORM type definitions into the equation as well, it gets messy. You have to make type definitions for database, for GraphQL.

This is where TypeORM + TypeGraphQL comes in. Both libraries use experimental decorators to define their types. This is awesome because for one field you can use multiple decorators and they work independently from each other. Neat!

## Experimental decorators

If you worked with Java Spring framework before, decorators will not surprise you too much. They are basically functions to be called upon fields or classes. For example:

```js
@Entity()
class MyAwesomeClass {
    @PrimaryGeneratedColumn()
    id: number;
}
```

This is actually somewhat similar to this:

```js
class MyAwesomeClass {
    constructor() {
        entitiy(this)
        primaryGeneratedColumn(this.id)
    }

    id: number;
}
```

Since both ORM and GraphQL can use the same class independent from each other, we can generate our classes and use them everywhere! For demonstration purposes, I have created an API like Twitter, with lots and lots of functionality missing.

Here is the repository: [GitHub](https://github.com/buncolak/typeorm-graphql-backend)

Here is my User class:

## Type Definitions

```ts
@Entity()
@ObjectType({implements: BaseModel})
export default class User extends BaseModel {
    
    @Column({unique: true})
    @Field()
    username: string;
    
    @Column({select: false})
    @MinLength(6, {message: "Password cannot be shorter than 6"})
    password: string;

    @OneToMany(type => Post, post => post.author)
    @Field(type => [Post])
    posts: Post[];

    @ManyToMany(type => Post, post => post.likedBy)
    liked: Post[]
}
```

There are multiple beauties in this code. Let's start with ORM definitions. `@Entity()` decorator creates the table automatically with Columns defined inside. `@Column()` decorator defines our columns that have no relations. Almost all decorators have their options. E.g. I can make a column `unique` by just passing an option to the decorator. You can also see that I have extended a `BaseModel` as well. That's right, you can use inheritance as well. On my BaseModel, I have defined `id`, `createdAt`, `updatedAt` fields so that I don't have to create them for every class. Defining relations are also done with decorators as well. Just define the type and mapping field.

This class also has the GraphQL definitions as well. `ObjectType({implements: BaseModel})` defines the `type User` and it also inherits the BaseModel as well! `Field()` defines the fields included in this model. You can see that I have not included `password` and `liked` to fields since I don't want API to expose those fields. That way I have them in my class, but API doesn't expose them and I don't need to create 2 classes that basically do the same thing.

## Resolvers

Resolvers are also classes that is similar to services in Angular or Java. Here is the service for the User:

```js
@Resolver(of => User)
export default class UserResolver {
  @InjectRepository(User)
  private userRepository: Repository<User>;

  ...
  ...

  @Authorized()
  @Query(returns => User)
  async user(@Arg("username") username: string) {
    return this.userRepository.findOneOrFail({ where: { username } });
  }

  @Mutation(returns => User)
  async createUser(@Arg("data") { username, password }: CreateUserInput) {
    const hashedPass = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ username, password: hashedPass });
    return this.userRepository.save(user);
  }

  ...
  ...
  ...

  @FieldResolver()
  async posts(@Root() user: User) {
    return this.postRepository.find({ where: { author: { id: user.id } } });
  }
}
```

Yepp, dependency injection, async-await, repository pattern. Nothing much to explain here, to be honest. Here you code your actual API. The nice part is that you only need to use your model definitions here. 

I really liked this stack and I think I will use it more often with my projects.