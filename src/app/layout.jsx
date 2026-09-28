import "./globals.css";
import { ThemeProvider } from "@/Context/ThemeContext";
import { StateContextProvider } from "@/Context";

export const metadata = {
  title: "Nexa Weather",
  description: "Weather application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <StateContextProvider>
            {children}
          </StateContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}