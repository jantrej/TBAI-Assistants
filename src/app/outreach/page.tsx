import dynamic from 'next/dynamic'
const Outreach = dynamic(() => import('../../components/ui/Outreach'), {
  ssr: false // Keep SSR disabled like the original
})

export default function Page() {
  return (
    <main>
      <Outreach />
    </main>
  )
}
