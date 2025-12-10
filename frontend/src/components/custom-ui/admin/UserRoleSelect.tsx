'use client'

import { useState } from 'react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'
import { updateUserRole } from '@/lib/actions'
import { Loader2 } from 'lucide-react'

interface Props {
    userId: number
    currentRole: string
}

export function UserRoleSelect({ userId, currentRole }: Props) {
    const [role, setRole] = useState(currentRole)
    const [isPending, setIsPending] = useState(false)

    const handleValueChange = async (newRole: string) => {
        setIsPending(true)
        const oldRole = role
        setRole(newRole) // Оптимистичное обновление

        const result = await updateUserRole(userId, newRole)

        if (result.success) {
            toast.success("Роль обновлена")
        } else {
            toast.error(result.error || "Ошибка")
            setRole(oldRole) // Откат
        }
        setIsPending(false)
    }

    return (
        <div className="flex items-center gap-2 justify-end">
            {isPending && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            <Select value={role} onValueChange={handleValueChange} disabled={isPending}>
                <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}