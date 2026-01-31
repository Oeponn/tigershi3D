import { createBrowserRouter } from "react-router-dom";

import RootLayout from "./routes/_layout";
import Landing from "./routes/landing";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
    ],
  },
]);
