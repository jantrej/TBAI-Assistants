import dynamic from 'next/dynamic'
const Creative = dynamic(() => import('../../components/ui/Creative'), {
  ssr: false // Keep SSR disabled like the original
})

export default function Page() {
  return (
    <main>
      <Creative />
    </main>
  )
}
