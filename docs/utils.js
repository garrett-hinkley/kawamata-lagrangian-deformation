// assumes inputs are non-negative
export function gcd(x, y) {
    if (x < y) {
        [x, y] = [y, x];
    }
    while (y != 0) {
        [x, y] = [y, x % y];
    }
    return x;
}

// like % but non-negative
export function mod(x, y) {
    const ans = x % y;
    return ans < 0 ? ans + y : ans;
}

// inefficient for large y, but good enough
export function invmod(x, y) {
    for (let z = 0; z < y; z++) {
        if (mod(z*x - 1, y) == 0) return z;
    }
}

export function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((elem, index) => elem === arr2[index]);
}

// lexicographic comparator function for use with Array.sort()
// assumes arr1.length === arr2.length
export function compareArrays(arr1, arr2) {
    for (let i = 0; i < arr1.length; i++) {
        if (i >= arr2.length) return -1;
        if (arr1[i] < arr2[i]) return -1;
        if (arr1[i] > arr2[i]) return 1;
    }
    return 0;
}
