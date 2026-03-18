import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "../ui/button"

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light")

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setTheme(isDark ? "dark" : "light")
  }, [])

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    localStorage.setItem("color-theme", newTheme)
    
    // Despachar un evento personalizado para que otros componentes (como gráficos) puedan reaccionar
    window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme: newTheme } }))
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      title="Cambiar tema"
      className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {theme === "light" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}