import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/lib/contexts/ThemeContext';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggole theme">
          <Sun className='h-5 w-5 dark:hidden' />
          <Moon className='hidden h-5 w-5 dark:block' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
          <DropdownMenuRadioItem value='system'>
            <Monitor />
            System
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='dark'>
            <Moon />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='light'>
            <Sun />
            Light
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
