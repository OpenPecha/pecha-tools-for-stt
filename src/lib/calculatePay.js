export const calculatePay = (groupID, reviewedSecs, syllableCount, reviewedCount) => {
    const stt_ab_groups = [1, 2, 7];
    groupID = Number(groupID)
    if (stt_ab_groups.includes(groupID)) {
        return ((reviewedSecs / 60) * 5 + reviewedCount * 2).toFixed(2);
    }
    else {
        return ((reviewedSecs / 60) * 5 + syllableCount * 0.4).toFixed(2);
    }
};
