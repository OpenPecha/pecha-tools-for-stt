export const calculatePay = (
  groupID,
  reviewedInMin,
  trashedInMin,
  syllableCount,
  reviewedCount,
  transcriberSyllableCount
) => {
  const stt_ab_groups = [1, 2, 7, 24, 26, 31];
  const stt_cs_groups = [3, 4, 6];
  const stt_gr_groups = [32, 33];
  groupID = Number(groupID);
  if (stt_ab_groups.includes(groupID)) {
    return (reviewedInMin * 5 + reviewedCount * 2).toFixed(2);
  } else if (stt_cs_groups.includes(groupID)) {
    return ((reviewedInMin + trashedInMin) * 5 + syllableCount * 0.33).toFixed(
      2
    );
  } else if (stt_gr_groups.includes(groupID)) {
    return (transcriberSyllableCount * 0.5).toFixed(2);
  } else {
    return ((reviewedInMin + trashedInMin) * 5 + syllableCount * 0.35).toFixed(
      2
    );
  }
};
