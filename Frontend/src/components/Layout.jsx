import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import AppleBackground from "./AppleBackground"; // Import the 3D engine

export default function Layout() {
  return (
    <>
      <AppleBackground /> {/* The 3D environment is now the base layer */}
      <Navbar />
      <main className="container" style={{ paddingTop: '40px' }}>
        <Outlet />
      </main>
    </>
  );
}