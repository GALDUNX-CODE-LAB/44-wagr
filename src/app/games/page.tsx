// app/games/page.tsx
import { redirect } from 'next/navigation'

export default function GamesIndexPage() {
  redirect('/games/dice')  // Redirect to your default game
}
