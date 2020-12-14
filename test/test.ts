require('source-map-support').install();

import * as test from 'tape';
import { Container, read, write } from '../';

const SAMPLE = new Uint8Array(10);

test('default', t => {
    const container = read(SAMPLE);
    t.ok(container instanceof Container, 'parses sample');
    t.ok(write(container) instanceof Uint8Array, 'serializes sample');
    t.end();
});