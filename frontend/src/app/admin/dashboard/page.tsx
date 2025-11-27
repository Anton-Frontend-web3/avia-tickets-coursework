import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);

    return (
        <div>
            <h1 className="text-3xl font-bold">Панель Администратора</h1>
            <p className="mt-4">Добро пожаловать, {session?.user?.email}!</p>
            <p>Ваша роль: {session?.user?.role}</p>
            <div className="mt-8 p-6 bg-gray-100 rounded-lg">
                <p>Здесь будет отображаться статистика и ссылки на разделы управления.</p>
            </div>
        </div>
    );
}