import { Outlet } from "react-router-dom";

import SidebarComponent from "./SidebarComponent";
import "./AppLayout.css";

function AppLayout() {
  return (
    <div className="appShell">
      {/* Sidebar is shared across app pages */}
      <SidebarComponent />

      {/* Outlet renders the selected dashboard page */}
      <main className="appShell__main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;