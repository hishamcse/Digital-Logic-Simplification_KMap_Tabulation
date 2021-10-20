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
    // const EPIs = EPIMaps.map(mapTerm => mapTerm.term);
    // console.log('EPIs: ', EPIs);
    return findEPIs(PIMaps, binOneMinterms);
}

export {
    EPITermsConstruction
}