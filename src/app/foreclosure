import dynamic from 'next/dynamic'
const Foreclosure = dynamic(() => import('../../components/ui/Foreclosure'), {
  ssr: false // Keep SSR disabled like the original
})

export default function Page() {
  return (
    <main>
      <Foreclosure />
    </main>
  )
}
