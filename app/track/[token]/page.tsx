import TrackTripClient from "./TrackTripClient";

export default async function TrackTripPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <TrackTripClient token={token} />;
}
