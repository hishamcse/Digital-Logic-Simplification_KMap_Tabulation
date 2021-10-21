const findEPIs = (PIMaps, binOneMinterms) => {
    let EPIs = [];

    binOneMinterms.forEach(minTerm => {
        let count = 0;
        let takenTerm;
        PIMaps.forEach(mapTerm => {
            if (mapTerm.responsibleTerms.includes(minTerm)) {
                count++;
                takenTerm = mapTerm;
            }
        })
        if (count === 1 && !EPIs.includes(takenTerm)) {
            EPIs.push(takenTerm);
        }
    });

    return EPIs;
}

const EPITermsConstruction = (binAllTerms, binOneMinterms, PIMaps) => {
    return findEPIs(PIMaps, binOneMinterms);
}

export {
    EPITermsConstruction
}