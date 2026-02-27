import { eigs } from "https://cdn.jsdelivr.net/npm/mathjs@15.1.1/+esm";
import { findAllBigons } from "./bigons.js";

function matrixNullity(matrix) {
    return eigs(matrix).values.filter(x => Math.abs(x) < 1e-9).length;
}

export function calculateRank(surgery) {
    // return findAllBigons(surgery);
    const matrix = [];
    for (let i = 0; i < surgery.r; i++) {
        matrix.push(Array(surgery.r).fill(0));
    }
    for (const bigon of findAllBigons(surgery)) {
        // use cols instead of rows?
        matrix[bigon.deg0][bigon.deg1] += bigon.sign;
    }
    // return matrix;
    return matrixNullity(matrix);
}
