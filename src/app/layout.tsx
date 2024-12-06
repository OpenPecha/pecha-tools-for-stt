import { Toaster } from "react-hot-toast";
import { Toaster as TaskToaster } from "sonner";

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pecha Stt Tool",
  description: "Tool by OpenPecha for STT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" reverseOrder={false} />
        <TaskToaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
