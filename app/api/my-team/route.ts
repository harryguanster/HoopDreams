import { auth, clerkClient } from "@clerk/nextjs/server";
import { EMPTY_TEAM, type SavedTeam } from "@/lib/myTeamData";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ myTeam: EMPTY_TEAM });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const myTeam = (user.unsafeMetadata as { myTeam?: SavedTeam }).myTeam ?? EMPTY_TEAM;
  return Response.json({ myTeam });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { myTeam }: { myTeam: SavedTeam } = await req.json();
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    unsafeMetadata: { myTeam },
  });
  return Response.json({ ok: true });
}
