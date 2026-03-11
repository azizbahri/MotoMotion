export function calculateSimulatedPath(rawData, settings, profile) {
  if (!rawData || !profile) return [];

  const sensitivity = profile.dampingSensitivity || 0.05;
  const fCompK = 1 + (settings.frontCompClicks - 12) * sensitivity;
  const rCompK = 1 + (settings.rearCompClicks - 12) * sensitivity;
  const fRebK = 1 + (settings.frontReboundClicks - 12) * (sensitivity * 1.6);
  const rRebK = 1 + (settings.rearReboundClicks - 12) * (sensitivity * 1.6);

  return rawData.map((frame, i) => {
    const prevFrame = rawData[i - 1] || frame;
    const velocity = frame.forkTravel - prevFrame.forkTravel;
    const isExtending = velocity < 0;

    const fMod = isExtending ? fRebK : fCompK;
    const rMod = isExtending ? rRebK : rCompK;

    return {
      ...frame,
      forkTravel: frame.forkTravel * fMod,
      shockTravel: frame.shockTravel * rMod,
      isSimulated: true,
    };
  });
}

export function calculateDashboardStats(rawData) {
  const data = rawData || [];
  const avgPitch =
    data.length > 0
      ? data.reduce((acc, curr) => acc + Math.abs(curr.pitchRate), 0) / data.length
      : 0;

  const flatnessValue = Math.max(0, 100 - avgPitch * 10);
  const flatness = flatnessValue.toFixed(0);

  return [
    {
      label: "Chassis Flatness",
      val: `${flatness}%`,
      sub: flatnessValue > 80 ? "Stable" : "High Pitch Rate",
      color: flatnessValue > 80 ? "text-green-500" : "text-amber-500",
    },
    {
      label: "Max Vertical Load",
      val: "3.2 G",
      sub: "Rear Chassis IMU",
      color: "text-cyan-500",
    },
    {
      label: "Stroke Sync",
      val: "94%",
      sub: "Fork/Shock Timing",
      color: "text-cyan-500",
    },
  ];
}

export function generateMockSession(label = "Log Session") {
  const data = [];

  for (let i = 0; i < 100; i += 1) {
    const time = i / 10;
    const impact = i >= 45 && i <= 55 ? Math.sin((i - 45) * 0.35) * 75 : 0;
    const reboundTail =
      i > 55 && i < 80
        ? Math.sin((i - 55) * 0.5) * (10 * (1 - (i - 55) / 25))
        : 0;

    const forkTravel = 50 + Math.sin(time * 2) * 5 + impact + reboundTail;
    const shockTravel =
      35 + Math.sin(time * 1.5) * 3 + impact * 0.6 + reboundTail * 0.4;

    const frontAccelZ = 1 + (impact > 0 ? impact * 0.04 : Math.random() * 0.1);
    const frontAccelX = impact > 0 ? -0.5 : 0.1;
    const frontAccelY = Math.sin(time) * 0.3;

    const rearAccelZ =
      1 + (i > 48 && i < 60 ? Math.sin((i - 48) * 0.35) * 3.2 : Math.random() * 0.1);
    const rearAccelX = impact > 0 ? 0.2 : 0.4;
    const rearAccelY = Math.sin(time) * 0.25;

    const previous = data[i - 1];

    data.push({
      timestamp: time,
      forkTravel,
      shockTravel,
      frontAccelX,
      frontAccelY,
      frontAccelZ,
      rearAccelX,
      rearAccelY,
      rearAccelZ,
      forkVelocity: (forkTravel - (previous?.forkTravel || forkTravel)) * 100,
      shockVelocity: (shockTravel - (previous?.shockTravel || shockTravel)) * 100,
      pitchRate: (frontAccelZ - rearAccelZ) * 8,
    });
  }

  return {
    id: Math.random().toString(36).slice(2, 11),
    name: label,
    date: new Date().toLocaleTimeString(),
    data,
  };
}
