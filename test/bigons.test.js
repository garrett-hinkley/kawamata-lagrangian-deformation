import { Bigon, findAllBigons } from "../docs/bigons.js";
import { Surgery } from "../docs/surgery.js";
import { expect } from '@jest/globals';

// test when r = 1? (or just ban it)

test('bigon from intersection point to itself', () => {
    const surgery = new Surgery(2, 1);
    const expected = [
        new Bigon(0, 0, -1),
        new Bigon(0, 0, 1),
        new Bigon(1, 1, -1),
        new Bigon(1, 1, 1),
    ];
    const bigons = findAllBigons(surgery);
    expect(bigons).toEqual(expected);
});

test('bigon with multiple turning points', () => {
    const surgery = new Surgery(4, 1, [true, true, true, false]);
    const bigons = findAllBigons(surgery);
    const expected = [
        new Bigon(0, 1, 1),
        new Bigon(0, 2, -1),
        new Bigon(1, 0, -1),
        new Bigon(1, 2, 1),
        new Bigon(2, 0, 1),
        new Bigon(2, 1, -1),
        new Bigon(3, 3, -1),
        new Bigon(3, 3, 1),
    ];
    expect(bigons).toEqual(expected);
});

test('almost-bigon with turning point at bottom right corner', () => {
    const surgery = new Surgery(3, 1, [true, false, true]);
    const bigons = findAllBigons(surgery);
    const expected = [
        new Bigon(0, 2, -1),
        new Bigon(0, 2, 1),
        new Bigon(2, 0, -1),
        new Bigon(2, 0, 1),
    ];
    expect(bigons).toEqual(expected);
});

test('bigon containing orange dot', () => {
    const surgery = new Surgery(3, 1);
    const bigons = findAllBigons(surgery);
    const expected = [
        new Bigon(0, 0, -1),
        new Bigon(0, 0, 1),
        new Bigon(1, 2, -1),
        new Bigon(2, 1, 1),
    ];
    expect(bigons).toEqual(expected);
});

test('r=7, a=4', () => {
    const surgery = new Surgery(7, 4);
    const bigons = findAllBigons(surgery);
    const expected = [
        new Bigon(0, 0, -1),
        new Bigon(0, 0, 1),
        new Bigon(1, 6, -1),
        new Bigon(2, 5, -1),
        new Bigon(5, 2, 1),
        new Bigon(6, 1, 1),
    ];
    expect(bigons).toEqual(expected);
});
