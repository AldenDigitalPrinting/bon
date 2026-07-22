import { TranasctionSeederForm } from "./transaction-seeder-form";

export default async function Dev() {
    return (
        <div className="flex flex-col items-center space-y-4 p-4">
            <h1 className="text-xl font-bold">Dev Tools</h1>
            <TranasctionSeederForm />
        </div>
    );
}
