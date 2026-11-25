import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import Login from "./pages/Login/index.tsx";
import { AuthProvider, RequireAuth } from "./auth/index.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <RequireAuth>
          <App />
        </RequireAuth>
      </AuthProvider>
    ),
    children: [
      {
        index: true,
        lazy: () => import("./pages/Dashboard/index.tsx").then((m) => ({ Component: m.default })),
      },
      {
        path: "test",
        lazy: () => import("./pages/test/index.tsx").then((m) => ({ Component: m.default })),
      },
      {
        path: "posts",
        lazy: () => import("./pages/Posts/index.tsx").then((m) => ({ Component: m.default })),
      },
      {
        path: "categories",
        lazy: () => import("./pages/Categories/index.tsx").then((m) => ({ Component: m.default })),
      },
      {
        path: "posts/new",
        lazy: () => import("./pages/NewPost/index.tsx").then((m) => ({ Component: m.default })),
      },
      {
        path: "posts/:id",
        lazy: () => import("./pages/NewPost/index.tsx").then((m) => ({ Component: m.default })),
      },
      {
        path: "photos",
        lazy: () => import("./pages/Photos/index.tsx").then((m) => ({ Component: m.default })),
      },
      {
        path: "projects",
        lazy: () => import("./pages/Projects/index.tsx").then((m) => ({ Component: m.default })),
      },
      {
        path: "settings",
        lazy: () => import("./pages/Setting/index.tsx").then((m) => ({ Component: m.default })),
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
]);
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
