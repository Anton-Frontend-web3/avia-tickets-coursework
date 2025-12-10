import { updateCheckInStatus } from '@/lib/actions'
import { memo, useTransition } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { IPassengerCheck } from '@/shared/types/pessenger.type'

interface IPassengerRowProps {
	passenger: IPassengerCheck
	onStatusChange: () => void
}

function PassengerRow({ passenger, onStatusChange }: IPassengerRowProps) {
	const [isPending, startTransition] = useTransition()
	const handleCheckedChange = (isChecked: boolean) => {
		startTransition(async () => {
			await updateCheckInStatus(passenger.booking_id, isChecked)
			onStatusChange()
		})
	}

	return (
		<TableRow key={passenger.booking_id}>
			<TableCell className='text-center'>{passenger.last_name}</TableCell>
			<TableCell className='text-center'>{passenger.first_name}</TableCell>
			<TableCell className='text-center'>
				{passenger.middle_name || '—'}
			</TableCell>
			<TableCell className='text-center'>{passenger.document_number}</TableCell>
			<TableCell className='text-center'>{passenger.seat_number}</TableCell>

			<TableCell>
				<div className='flex items-center justify-center'>
					<Checkbox
						className='h-5 w-5'
						checked={passenger.check_in_status === 'Checked-in'}
						onCheckedChange={handleCheckedChange}
						disabled={isPending}
					/>
				</div>
			</TableCell>
		</TableRow>
	)
}
export default memo(PassengerRow)
