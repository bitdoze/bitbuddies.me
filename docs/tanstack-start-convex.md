# TanStack Start with Clerk

Using Clerk with Convex looks like following the
[Clerk TanStack Quickstart](https://clerk.com/docs/quickstarts/tanstack-start)
and adding Convex like the
[Convex TanStack Quickstart](https://docs.convex.dev/quickstart/tanstack-start) shows. Then to make
Clerk identity tokens available everywhere you might make authenticated calls to
Convex in TanStack Start, you'll want to

1. Get an ID token from Clerk in addition to the `getAuth()` call with
`const token = await auth.getToken({ template: "convex" })`.
2. Set the token in beforeLoad with
`ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)` so the token
will be available in loaders.
3. Add `<ConvexProviderWithClerk>` to the root component to keep refreshing
Clerk tokens while the app is in use.

Making these changes looks like modifying `app/router.tsx` like this:

app/router.tsx

```codeBlockLines_qo9c
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { DefaultCatchBoundary } from './components/DefaultCatchBoundary'
import { NotFound } from './components/NotFound'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient } from '@tanstack/react-query'

export function createRouter() {
  const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!
  if (!CONVEX_URL) {
    throw new Error('missing VITE_CONVEX_URL envar')
  }
  const convex = new ConvexReactClient(CONVEX_URL, {
    unsavedChangesWarning: false,
  })
  const convexQueryClient = new ConvexQueryClient(convex)

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  })
  convexQueryClient.connect(queryClient)

  const router = routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      defaultPreload: 'intent',
      defaultErrorComponent: DefaultCatchBoundary,
      defaultNotFoundComponent: () => <NotFound />,
      context: { queryClient, convexClient: convex, convexQueryClient },
      scrollRestoration: true,
      Wrap: ({ children }) => (
        <ConvexProvider client={convexQueryClient.convexClient}>
          {children}
        </ConvexProvider>
      ),
    }),
    queryClient,
  )

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}

```

and modifying `app/routes/__root.tsx` like this:

app/routes/\_\_root.tsx

```codeBlockLines_qo9c
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  useRouteContext,
} from '@tanstack/react-router'
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from '@clerk/tanstack-start'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Meta, Scripts, createServerFn } from '@tanstack/start'
import { QueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { getAuth } from '@clerk/tanstack-start/server'
import { getWebRequest } from 'vinxi/http'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary.js'
import { NotFound } from '~/components/NotFound.js'
import appCss from '~/styles/app.css?url'
import { ConvexQueryClient } from '@convex-dev/react-query'

import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'

const fetchClerkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const auth = await getAuth(getWebRequest())
  const token = await auth.getToken({ template: 'convex' })

  return {
    userId: auth.userId,
    token,
  }
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexClient: ConvexReactClient
  convexQueryClient: ConvexQueryClient
}>()({
  head: () => ({
    meta: [\
      {\
        charSet: 'utf-8',\
      },\
      {\
        name: 'viewport',\
        content: 'width=device-width, initial-scale=1',\
      },\
    ],
    links: [\
      { rel: 'stylesheet', href: appCss },\
      {\
        rel: 'apple-touch-icon',\
        sizes: '180x180',\
        href: '/apple-touch-icon.png',\
      },\
      {\
        rel: 'icon',\
        type: 'image/png',\
        sizes: '32x32',\
        href: '/favicon-32x32.png',\
      },\
      {\
        rel: 'icon',\
        type: 'image/png',\
        sizes: '16x16',\
        href: '/favicon-16x16.png',\
      },\
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },\
      { rel: 'icon', href: '/favicon.ico' },\
    ],
  }),
  beforeLoad: async (ctx) => {
    const auth = await fetchClerkAuth()
    const { userId, token } = auth

    // During SSR only (the only time serverHttpClient exists),
    // set the Clerk auth token to make HTTP queries with.
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
    }

    return {
      userId,
      token,
    }
  },
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  const context = useRouteContext({ from: Route.id })
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={context.convexClient} useAuth={useAuth}>
        <RootDocument>
          <Outlet />
        </RootDocument>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <Meta />
      </head>
      <body>
        <div className="p-2 flex gap-2 text-lg">
          <Link
            to="/"
            activeProps={{
              className: 'font-bold',
            }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>{' '}
          <Link
            to="/posts"
            activeProps={{
              className: 'font-bold',
            }}
          >
            Posts
          </Link>
          <div className="ml-auto">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
          </div>
        </div>
        <hr />
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}

```


# Convex with TanStack Query

[TanStack Query](https://tanstack.com/query/latest) is an excellent, popular
library for managing requests to a server.

The
[`@convex-dev/react-query`](https://www.npmjs.com/package/@convex-dev/react-query)
library provides
[Query Option](https://tanstack.com/query/latest/docs/framework/react/guides/query-options)
functions for use with TanStack Query.

Not all features of the standard [Convex React client](https://docs.convex.dev/client/react) are
available through the TanStack Query APIs but you can use the two alongside each
other, dropping into the standard Convex React hooks as necessary.

The TanStack Query adapter is in beta

The TanStack Query adapteris currently a [beta\\
feature](https://docs.convex.dev/production/state/#beta-features). If you have feedback or feature
requests, [let us know on Discord](https://convex.dev/community)!

This makes subscribing to a Convex query function using the TanStack Query
`useQuery` hook look like this:

```codeBlockLines_qo9c
const { data, isPending, error } = useQuery(convexQuery(api.messages.list, {}));

```

Instead of the typical polling pattern for API endpoints used with TanStack
Query, the code above receives updates for this `api.messages.list` query from
the Convex server reactively. New results for all relevant subscriptions are
pushed to the client where they update at the same time so data is never stale
and there's no need to manually invalidate queries.

Support for other frameworks

Currently only [React\\
Query](https://tanstack.com/query/latest/docs/framework/react/overview) is
supported via
[`@convex-dev/react-query`](https://www.npmjs.com/package/@convex-dev/react-query).
[Let us know](https://convex.dev/community) if you would find support for
vue-query, svelte-query, solid-query, or angular-query helpful.

## Setup [​](https://docs.convex.dev/client/tanstack/tanstack-query/\#setup "Direct link to Setup")

To get live updates in TanStack Query create a `ConvexQueryClient` and connect
it to the TanStack Query
[QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient).
After installing the adapter library with

```codeBlockLines_qo9c
npm i @convex-dev/react-query

```

wire up Convex to TanStack Query like this:

src/main.tsx

```codeBlockLines_qo9c
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});
convexQueryClient.connect(queryClient);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ConvexProvider client={convex}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ConvexProvider>,
);

```

Note that when your create your React tree you should both:

- wrap your app in the TanStack Query
[`QueryClientProvider`](https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider)
so you can use
[TanStack Query hooks](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery)
and
- wrap your app in the [`ConvexProvider`](https://docs.convex.dev/api/modules/react#convexprovider) so
you can also use normal [Convex React](https://docs.convex.dev/client/react) hooks

## Queries [​](https://docs.convex.dev/client/tanstack/tanstack-query/\#queries "Direct link to Queries")

A live-updating subscription to a Convex [query](https://docs.convex.dev/functions/query-functions)
is as simple as calling TanStack
[`useQuery`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery)
with `convexQuery`:

```codeBlockLines_qo9c
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../convex/_generated/api";

export function App() {
  const { data, isPending, error } = useQuery(
    convexQuery(api.functions.myQuery, { id: 123 }),
  );
  return isPending ? "Loading..." : data;
}

```

You can spread the object returned by `convexQuery` into an object specifying
additional
[arguments of `useQuery`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

```codeBlockLines_qo9c
const { data, isPending, error } = useQuery({
  ...convexQuery(api.functions.myQuery, { id: 123 }),
  initialData: [], // use an empty list if no data is available yet
  gcTime: 10000, // stay subscribed for 10 seconds after this component unmounts
});

```

## Mutations [​](https://docs.convex.dev/client/tanstack/tanstack-query/\#mutations "Direct link to Mutations")

Your app can call Convex [mutations](https://docs.convex.dev/functions/mutation-functions) by using
the TanStack
[`useMutation`](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation)
hook, and setting the `mutationFn` property to the result of calling
`useConvexMutation`:

```codeBlockLines_qo9c
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "../convex/_generated/api";

export function App() {
  const { mutate, isPending } = useMutation({
    mutationFn: useConvexMutation(api.functions.doSomething),
  });
  return <button onClick={() => mutate({a: "Hello"})}>Click me</button>;
}

```

`useConvexMutation` is just a re-export of the
[`useMutation`](https://docs.convex.dev/client/react#editing-data) hook from
[Convex React](https://docs.convex.dev/client/react).

## Differences from using `fetch` with TanStack Query [​](https://docs.convex.dev/client/tanstack/tanstack-query/\#differences-from-using-fetch-with-tanstack-query "Direct link to differences-from-using-fetch-with-tanstack-query")

Convex provides stronger guarantees than other methods of fetching data with
React Query, so some options and return value properties are no longer
necessary.

Subscriptions to Convex queries will remain active after the last component
using `useQuery` for a given function unmounts for `gcTime` milliseconds. This
value is 5 minutes by default; if this results in unwanted function activity use
a smaller value.

Data provided by Convex is never stale, so the `isStale` property of the return
value of `useQuery` will always be false. `retry`-related options are ignored,
since Convex provides its own retry mechanism over its WebSocket protocol.
`refetch`-related options are similarly ignored since Convex queries are always
up to date.

## Routing
This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).


## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/people",
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json() as Promise<{
      results: {
        name: string;
      }[];
    }>;
  },
  component: () => {
    const data = peopleRoute.useLoaderData();
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    );
  },
});
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
bun install @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ...

const queryClient = new QueryClient();

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
});
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from "@tanstack/react-query";

import "./App.css";

function App() {
  const { data } = useQuery({
    queryKey: ["people"],
    queryFn: () =>
      fetch("https://swapi.dev/api/people")
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  });

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
bun install @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

function App() {
  const count = useStore(countStore);
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  );
}

export default App;
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store, Derived } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
});
doubledStore.mount();

function App() {
  const count = useStore(countStore);
  const doubledCount = useStore(doubledStore);

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  );
}

export default App;
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).



## Schemas

When designing the schema please see this page on built in System fields and data types available: https://docs.convex.dev/database/types

Here are some specifics that are often mishandled:

### v (https://docs.convex.dev/api/modules/values#v)

The validator builder.

This builder allows you to build validators for Convex values.

Validators can be used in schema definitions and as input validators for Convex functions.

Type declaration
Name	Type
id	<TableName>(tableName: TableName) => VId<GenericId<TableName>, "required">
null	() => VNull<null, "required">
number	() => VFloat64<number, "required">
float64	() => VFloat64<number, "required">
bigint	() => VInt64<bigint, "required">
int64	() => VInt64<bigint, "required">
boolean	() => VBoolean<boolean, "required">
string	() => VString<string, "required">
bytes	() => VBytes<ArrayBuffer, "required">
literal	<T>(literal: T) => VLiteral<T, "required">
array	<T>(element: T) => VArray<T["type"][], T, "required">
object	<T>(fields: T) => VObject<Expand<{ [Property in string | number | symbol]?: Exclude<Infer<T[Property]>, undefined> } & { [Property in string | number | symbol]: Infer<T[Property]> }>, T, "required", { [Property in string | number | symbol]: Property | `${Property & string}.${T[Property]["fieldPaths"]}` }[keyof T] & string>
record	<Key, Value>(keys: Key, values: Value) => VRecord<Record<Infer<Key>, Value["type"]>, Key, Value, "required", string>
union	<T>(...members: T) => VUnion<T[number]["type"], T, "required", T[number]["fieldPaths"]>
any	() => VAny<any, "required", string>
optional	<T>(value: T) => VOptional<T>

### System fields (https://docs.convex.dev/database/types#system-fields)

Every document in Convex has two automatically-generated system fields:

_id: The document ID of the document.
_creationTime: The time this document was created, in milliseconds since the Unix epoch.

You do not need to add indices as these are added automatically.

### Example Schema

This is an example of a well crafted schema.

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    users: defineTable({
      name: v.string(),
    }),

    sessions: defineTable({
      userId: v.id("users"),
      sessionId: v.string(),
    }).index("sessionId", ["sessionId"]),

    threads: defineTable({
      uuid: v.string(),
      summary: v.optional(v.string()),
      summarizer: v.optional(v.id("_scheduled_functions")),
    }).index("uuid", ["uuid"]),

    messages: defineTable({
      message: v.string(),
      threadId: v.id("threads"),
      author: v.union(
        v.object({
          role: v.literal("system"),
        }),
        v.object({
          role: v.literal("assistant"),
          context: v.array(v.id("messages")),
          model: v.optional(v.string()),
        }),
        v.object({
          role: v.literal("user"),
          userId: v.id("users"),
        }),
      ),
    })
      .index("threadId", ["threadId"]),
  },
);
```
