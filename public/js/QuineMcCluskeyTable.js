import {countOnes, responsibleMinterms} from "./KMapSolver/PrimeImplicants.js"
import {binaryTerms, createSOPTerm} from "./KMapSolver/FinalSolver.js";

const generateQMTable = (QMArr, PIs, inputNames, arrKMap) => {
    let {binAllTerms} = binaryTerms(inputNames.length, arrKMap);
    let QMTable = [];

    QMArr.forEach(arr => {
        let newArr = [];
        for (let i = 0; i <= inputNames.length; i++) {
            let temp = arr.filter(term => countOnes(term) === i);
            if (temp.length === 0) continue;

            let decimalTerms, obj;
            let temp2 = [];
            temp.forEach(term => {
                let responsibleTerms = responsibleMinterms(binAllTerms, term);
                decimalTerms = responsibleTerms.map(t => parseInt(t, 2));
                const pt = createSOPTerm(term, inputNames);
                obj = {
                    term: term,
                    decimalMinterms: decimalTerms.join(', '),
                    IsUsed: !PIs.includes(pt) ? 'Yes' : undefined
                };

                temp2.push(obj);
            });

            newArr.push(temp2);
        }

        QMTable.push(newArr);
    });

    return QMTable;
}

const generateCoverageTable = (PIs, EPIs, BinPIs, inputNames, KMapArr) => {
    let {binOneMinterms} = binaryTerms(inputNames.length, KMapArr);
    binOneMinterms.sort((a, b) => parseInt(a, 2) - parseInt(b, 2))

    let combinedPIs = []
    for (let i = 0; i < PIs.length; i++) {
        let term = BinPIs[i]
        const responsibleTerms = responsibleMinterms(binOneMinterms, term);
        let responsibleFor = [];
        binOneMinterms.forEach(minterm => {
            if (responsibleTerms.includes(minterm)) {
                responsibleFor.push({color: true})
            } else {
                responsibleFor.push({color: undefined})
            }
        });
        combinedPIs.push({
            rowName: PIs[i],
            responsibleFor,
            IsEPI: EPIs.includes(PIs[i]) ? true : undefined
        })
    }
    return combinedPIs;
}

export {
    generateQMTable,
    generateCoverageTable
}