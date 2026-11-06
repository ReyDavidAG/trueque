import { useCountUp } from '@/hooks/ui/useCountUp'

export function CountUp({ to, delay }: { to: number; delay?: number }) {
	return <>{useCountUp(to, delay)}</>
}
