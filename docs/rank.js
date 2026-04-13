import { findAllBigons } from "./bigons.js";

class DSU {
    constructor(n) {
        this.parents = Array.from({ length: n }, (_, i) => i);
        this.numComponents = n;
    }

    find(i) {
        if (this.parents[i] === i) return i;
        return this.parents[i] = this.find(this.parents[i]); // Path compression
    }

    union(i, j) {
        let rootI = this.find(i);
        let rootJ = this.find(j);
        if (rootI !== rootJ) {
            this.parents[rootI] = rootJ;
            this.numComponents--;
        }
    }
}

// assumes that matrix has at most one 1 and at most one -1 in each row
function matrixNullity(matrix) {
    // every row is a constraint of the form xi - xj = 0 or xi = 0
    // can track which variables are equal with disjoint-set union
    // dummy index r represents the constant 0
    const r = matrix[0].length;
    const dsu = new DSU(r + 1);
    for (const row of matrix) {
        let pos = row.indexOf(1);
        let neg = row.indexOf(-1);

        if (pos === -1) pos = r;
        if (neg === -1) neg = r;

        dsu.union(pos, neg);
    }
    return dsu.numComponents - 1;
}

export function calculateRank(surgery) {
    const matrix = [];
    for (let i = 0; i < surgery.r; i++) {
        matrix.push(Array(surgery.r).fill(0));
    }
    for (const bigon of findAllBigons(surgery)) {
        // use cols instead of rows?
        matrix[bigon.deg0][bigon.deg1] += bigon.sign;
    }
    // return matrix;
    // console.log(matrix);
    return matrixNullity(matrix);
}
