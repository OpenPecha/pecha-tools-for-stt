export const calculatePay = (
  groupID,
  reviewedInMin,
  trashedInMin,
  syllableCount,
  reviewedCount
) => {
  const stt_ab_groups = [1, 2, 7, 24, 26];
  const stt_cs_groups = [3, 4, 6];
  groupID = Number(groupID);
  if (stt_ab_groups.includes(groupID)) {
    return (reviewedInMin * 5 + reviewedCount * 2).toFixed(2);
  } else if (stt_cs_groups.includes(groupID)) {
    return ((reviewedInMin + trashedInMin) * 5 + syllableCount * 0.33).toFixed(
      2
    );
  } else {
    return ((reviewedInMin + trashedInMin) * 5 + syllableCount * 0.35).toFixed(
      2
    );
  }
};
