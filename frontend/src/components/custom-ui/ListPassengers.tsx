import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { IPassengerCheck } from "@/shared/types/pessenger.type";
import { memo, useState } from "react";

interface Props {
    passengers:IPassengerCheck[]
}


import  PassengerRow from "./ListPassengerRows";

interface Props {
    passengers: IPassengerCheck[];
    onStatusChange: () => void
}

 function PassengerList({ passengers,onStatusChange }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const checkedInCount = passengers.filter(p => p.check_in_status === 'Checked-in').length;
    
    // 3. ОТФИЛЬТРУЙТЕ пассажиров перед отображением
    const filteredPassengers = passengers.filter(passenger => {
        if (passenger.last_name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) || passenger.document_number.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())  )
        return true;
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-4 gap-3">
                <Input 
                    placeholder="Поиск по фамилии или номеру документа..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <div className="font-bold text-lg">
                    Зарегистрировано: {checkedInCount} / {passengers.length}
                </div>
            </div>
            
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">Фамилия</TableHead>
                        <TableHead className="text-center">Имя</TableHead>
                        <TableHead className="text-center">Отчество</TableHead>
                        <TableHead className="text-center">Номер документа</TableHead>
                        <TableHead className="text-center">Место</TableHead> 
                        <TableHead className="text-center">Статус</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredPassengers.map((passenger) => (
                        <PassengerRow onStatusChange={onStatusChange} key={passenger.booking_id} passenger={passenger} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default memo(PassengerList)
