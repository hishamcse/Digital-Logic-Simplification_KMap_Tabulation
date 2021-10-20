import {KMap} from "./KMapBuilder.js";
import {PITermsConstruction} from "./PrimeImplicants.js";
import {EPITermsConstruction} from "./EssentialPrimeImplicants.js";
import {SolutionConstruction} from "./SolutionBuilder.js";

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

const createTerm = (term, inputNames) => {
    let requiredTerm = ""
    for(let i=0;i<inputNames.length;i++) {
        if(term.charAt(i) === '1') {
            requiredTerm += inputNames[i];
        } else if(term.charAt(i) === '0') {
            requiredTerm += (inputNames[i] + `'`)
        }
    }
    return requiredTerm;
}

const createAllTerms = (mapTerms, inputNames) => {
    let requiredTerms = [];
    mapTerms.forEach(mapTerm => {
        requiredTerms.push(createTerm(mapTerm.term, inputNames))
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

const solverFunc = (totalInputVars, inputNames, oneMinterms, dontCares) => {
    let {arrKMap, rowGreyCodes, colGreyCodes} = KMap(totalInputVars, oneMinterms, dontCares);
    let {binOneMinterms, binAllTerms} = binaryTerms(totalInputVars, arrKMap);
    let {PIMaps, QMTableTerms} = PITermsConstruction(totalInputVars, binAllTerms);
    let EPIMaps = EPITermsConstruction(binAllTerms, binOneMinterms, PIMaps);
    let solutionMaps = SolutionConstruction(PIMaps, EPIMaps, binOneMinterms);

    const PITerms = createAllTerms(PIMaps, inputNames);
    const EPITerms = createAllTerms(EPIMaps, inputNames);
    const solutionTerms = createAllTerms(solutionMaps, inputNames);

    const solution = createSolutionSOP(solutionTerms);

    return {
        rowArr: rowGreyCodes,
        colArr: colGreyCodes,
        KMapArr: arrKMap,
        QMArr: QMTableTerms,
        BinPIs: PIMaps.map(mapTerm => mapTerm.term),
        PIs: PITerms,
        EPIs: EPITerms,
        solution
    };
}

export {
    solverFunc, binaryTerms, createTerm
}