import { getProfiles } from "./actions";
import { buttonVariants } from "@/components/ui/button";
import { CreateProfileDialog } from "@/components/create-profile-dialog";
import Link from "next/link";

export default async function Home() {
    const profiles = await getProfiles();

    return (
        <div className="flex flex-col m-auto">
            <div className="flex flex-row gap-2">
                {profiles.data?.map((profile) => (
                    <Link
                        key={profile.id}
                        href={`/profile/${profile.id}`}
                        className={buttonVariants({
                            variant: "outline",
                            size: "lg",
                            className: "p-8",
                        })}
                    >
                        {profile.name}
                    </Link>
                ))}

                <CreateProfileDialog />
            </div>
        </div>
    );
}
