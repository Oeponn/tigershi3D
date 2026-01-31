import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <>
      {/* Later: nav, global canvas, route transitions */}
      <Outlet />
    </>
  );
}
