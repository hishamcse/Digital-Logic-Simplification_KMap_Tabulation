const countInCovering = (mapTerm, covering) => {
    let count = 0;
    mapTerm.responsibleTerms.forEach(term => {
        if (covering.includes(term)) {
            count++;
        }
    })
    return count;
}

const SolutionConstruction = (PIMaps, EPIMaps, binOneMinterms) => {
    let covering = [...binOneMinterms]
    EPIMaps.forEach(epiMapTerm => {
        epiMapTerm.responsibleTerms.forEach(term => {
            if (covering.includes(term)) {
                const id = covering.indexOf(term);
                covering.splice(id, 1);
            }
        });
    });

    PIMaps.sort((mapTerm1, mapTerm2) => countInCovering(mapTerm2, covering) - countInCovering(mapTerm1, covering));

    let otherMapPIs = []
    PIMaps.forEach(mapTerm => {
        if (EPIMaps.includes(mapTerm) || covering.length === 0) return;
        let taken = false;
        for (let j = 0; j < mapTerm.responsibleTerms.length; j++) {
            const term = mapTerm.responsibleTerms[j];
            if (covering.includes(term)) {
                if (!taken) {
                    otherMapPIs.push(mapTerm);
                    taken = true;
                }
                const id = covering.indexOf(term);
                covering.splice(id, 1);
            }
        }
    })

    return [...EPIMaps, ...otherMapPIs];
}

export {
    SolutionConstruction
}