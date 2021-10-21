import {KMap} from "./KMapBuilder.js";
import {PITermsConstruction} from "./PrimeImplicants.js";
import {EPITermsConstruction} from "./EssentialPrimeImplicants.js";
import {SolutionConstruction} from "./SolutionBuilder.js";

const colors = ['primary', 'secondary', 'success', 'danger', 'info', 'warning']

const binaryTerms = (inputVars, arrKMap) => {
    let binOneMinterms = []       // only '1' s
    let binDontCares = []         // only '-' s

    for (let i = 0; i < arrKMap.length; i++) {
        for (let j = 0; j < arrKMap[i].length; j++) {
            if (arrKMap[i][j].value === '1') {
                binOneMinterms.push(arrKMap[i][j].binary)
            } else if (arrKMap[i][j].value === '-') {
                binDontCares.push(arrKMap[i][j].binary)
            }
        }
    }

    return {
        binOneMinterms,
        binAllTerms: binOneMinterms.concat(binDontCares)
    }
}

const createSOPTerm = (term, inputNames) => {
    let requiredTerm = ""
    for (let i = 0; i < inputNames.length; i++) {
        if (term.charAt(i) === '1') {
            requiredTerm += inputNames[i];
        } else if (term.charAt(i) === '0') {
            requiredTerm += (inputNames[i] + `'`)
        }
    }
    return requiredTerm;
}

const createPOSTerm = (term, inputNames) => {
    let requiredTerm = ""
    for (let i = 0; i < inputNames.length; i++) {
        if (term.charAt(i) === '0') {
            requiredTerm += inputNames[i] + ' + ';
        } else if (term.charAt(i) === '1') {
            requiredTerm += (inputNames[i] + `'` + ' + ');
        }
    }
    return requiredTerm.slice(0, requiredTerm.length - 2);
}

const createAllSOPTerms = (mapTerms, inputNames) => {
    let requiredTerms = [];
    mapTerms.forEach(mapTerm => {
        requiredTerms.push(createSOPTerm(mapTerm.term, inputNames))
    })
    return requiredTerms;
}

const createAllPOSTerms = (mapTerms, inputNames) => {
    let requiredTerms = [];
    mapTerms.forEach(mapTerm => {
        requiredTerms.push(createPOSTerm(mapTerm.term, inputNames))
    })
    return requiredTerms;
}

const createSolutionSOP = (solutionTerms) => {
    let solution = ""
    solutionTerms.forEach(term => {
        solution += (term + ' + ')
    })
    return solution.slice(0, solution.length - 2);
}

const createSolutionPOS = (solutionTerms) => {
    let solution = ""
    solutionTerms.forEach(term => {
        solution += '(' + term + ')'
    })
    return solution;
}

const createSolutionColors = (solutionMaps) => {
    let solutionColorArr = [];
    let j = 0;
    solutionMaps.forEach(mapTerm => {
        let arr = [...mapTerm.responsibleTerms];
        arr.forEach(term => {
            solutionColorArr.push({
                binTerm: term,
                color: colors[j]
            })
        });
        if (j === 5) {
            j = 0;
        } else {
            j++;
        }
    });

    return solutionColorArr;
}

const solverFunc = (totalInputVars, inputNames, oneMinterms, dontCares, isSOP) => {
    let oneTerms = [], dontCareTerms;
    if (isSOP) {
        oneTerms = oneMinterms;
        dontCareTerms = dontCares;
    } else {
        for (let i = 0; i < Math.pow(2, inputNames.length); i++) {
            if (!oneMinterms.includes(i) && !dontCares.includes(i)) {
                oneTerms.push(i);
            }
        }
        dontCareTerms = dontCares
    }

    let {arrKMap, rowGreyCodes, colGreyCodes} = KMap(totalInputVars, oneTerms, dontCareTerms);
    let {binOneMinterms, binAllTerms} = binaryTerms(totalInputVars, arrKMap);
    let {PIMaps, QMTableTerms} = PITermsConstruction(totalInputVars, binAllTerms);
    let EPIMaps = EPITermsConstruction(binAllTerms, binOneMinterms, PIMaps);
    let solutionMaps = SolutionConstruction(PIMaps, EPIMaps, binOneMinterms);

    const PITerms = createAllSOPTerms(PIMaps, inputNames);
    const EPITerms = createAllSOPTerms(EPIMaps, inputNames);

    let solutionTerms, solution;
    if (isSOP) {
        solutionTerms = createAllSOPTerms(solutionMaps, inputNames)
        solution = createSolutionSOP(solutionTerms);
    } else {
        solutionTerms = createAllPOSTerms(solutionMaps, inputNames)
        solution = createSolutionPOS(solutionTerms);
    }

    return {
        oneTerms,
        rowArr: rowGreyCodes,
        colArr: colGreyCodes,
        KMapArr: arrKMap,
        QMArr: QMTableTerms,
        BinPIs: PIMaps.map(mapTerm => mapTerm.term),
        PIs: PITerms,
        EPIs: EPITerms,
        solution,
        solutionColorArr: createSolutionColors(solutionMaps)
    };
}

export {
    solverFunc, binaryTerms, createSOPTerm
}