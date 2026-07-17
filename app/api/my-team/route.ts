import { auth, clerkClient } from "@clerk/nextjs/server";
import { DEFAULT_TEAM_STATE, type TeamState } from "@/lib/myTeamData";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ myTeamV3: DEFAULT_TEAM_STATE });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const myTeamV3 = (user.unsafeMetadata as { myTeamV3?: TeamState }).myTeamV3 ?? DEFAULT_TEAM_STATE;
  return Response.json({ myTeamV3 });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { myTeamV3 }: { myTeamV3: TeamState } = await req.json();
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, { unsafeMetadata: { myTeamV3 } });
  return Response.json({ ok: true });
}
