// frontend/app/layout.js

import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar"; // <-- Import the new component

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Social Agent Dashboard",
  description: "Full-stack AI Agent MVP.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex">
          <Sidebar /> {/* <-- Render the Sidebar */}
          {/* Main content area needs left padding equal to sidebar width */}
          <main className="flex-grow ml-64 min-h-screen bg-gray-50"> 
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}