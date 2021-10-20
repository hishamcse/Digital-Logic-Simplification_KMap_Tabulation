const bitDiffAndMerge = (binTerm1, binTerm2) => {
    let diffCount = 0
    let mergedTerm = ""
    for (let i = 0; i < binTerm1.length; i++) {
        if (binTerm1[i] !== binTerm2[i]) {
            diffCount++;
            mergedTerm = mergedTerm.concat('-')
        } else {
            mergedTerm = mergedTerm.concat(binTerm1[i])
        }
    }

    return {
        bitDiff: diffCount,
        mergedTerm: mergedTerm
    }
}

const responsibleMinterms = (binAllTerms, termToMatch) => {
    let terms = []
    let isMatch = false;
    binAllTerms.forEach(term => {
        for (let i = 0; i < term.length; i++) {
            if ((term[i] === '0' && termToMatch[i] === '1') || (term[i] === '1' && termToMatch[i] === '0')) {
                isMatch = false;
                break;
            } else {
                isMatch = true;
            }
        }
        if (isMatch) {
            terms.push(term);
        }
    })

    return terms;
}

const countOnes = (str) => {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
        if (str.charAt(i) === '1') count++;
    }
    return count;
}

const PITermsConstruction = (inputVars, binAllTerms) => {
    let requiredTerms = []
    let PIs = [...binAllTerms]
    let QMTableTerms = [[...binAllTerms.sort((a, b) => countOnes(a) - countOnes(b))]];

    for (let i = 0; i < inputVars; i++) {
        requiredTerms = [...PIs]
        let n = requiredTerms.length;
        for (let j = 0; j < n; j++) {
            let taken = false;
            for (let k = 0; k < n; k++) {
                if (j === k) continue;
                const {bitDiff, mergedTerm} = bitDiffAndMerge(requiredTerms[j], requiredTerms[k]);
                if (bitDiff === 1) {
                    if (!PIs.includes(mergedTerm)) {
                        PIs.push(mergedTerm);
                    }
                    taken = true;
                }
            }

            if (taken && PIs.includes(requiredTerms[j])) {
                let id = PIs.indexOf(requiredTerms[j]);
                PIs.splice(id, 1);
            }
        }

        if (requiredTerms.length !== PIs.length) {
            QMTableTerms.push([...PIs.filter(PI => !requiredTerms.includes(PI))
                .sort((a, b) => countOnes(a) - countOnes(b))])
        }
    }

    let PIMaps = []
    PIs.forEach(term => {
        PIMaps.push({
            term,
            responsibleTerms: responsibleMinterms(binAllTerms, term),
        })
    });

    PIMaps.sort((mapTerm1, mapTerm2) => {
        const diff = mapTerm2.responsibleTerms.length - mapTerm1.responsibleTerms.length;
        if (diff === 0) {
            return PIs.indexOf(mapTerm1.term) - PIs.indexOf(mapTerm2.term);
        }
        return diff;
    })

    return {PIMaps, QMTableTerms};
}

export {
    PITermsConstruction,
    countOnes,
    responsibleMinterms
}