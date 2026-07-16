import { auth, clerkClient } from "@clerk/nextjs/server";
import { DEFAULT_TEAM_STATE, type TeamState } from "@/lib/myTeamData";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ myTeam: DEFAULT_TEAM_STATE });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const myTeam = (user.unsafeMetadata as { myTeam?: TeamState }).myTeam ?? DEFAULT_TEAM_STATE;
  return Response.json({ myTeam });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { myTeam }: { myTeam: TeamState } = await req.json();
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, { unsafeMetadata: { myTeam } });
  return Response.json({ ok: true });
}
