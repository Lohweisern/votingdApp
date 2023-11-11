import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./providers";
import "@rainbow-me/rainbowkit/styles.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Fair & Square",
  description: "Voting DApp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
