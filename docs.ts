const fs = require('fs');
const path = require('path');

const container = fs.readFileSync(path.join(__dirname, 'docs', 'classes', '_src_container_.ktx2container.md'), 'utf8');
const read = fs.readFileSync(path.join(__dirname, 'docs', 'modules', '_src_read_.md'), 'utf8');
const write = fs.readFileSync(path.join(__dirname, 'docs', 'modules', '_src_write_.md'), 'utf8');

let readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8')
readme = inject(readme, container, 'KTX2Container');
readme = inject(readme, read, 'read');
readme = inject(readme, write, 'write');
fs.writeFileSync(path.join(__dirname, 'README.md'), readme);

function inject(body: string, text: string, id: string): string {
    text = text.replace(/\[(\w+)]\(\.\.\/(?:interfaces|enums|classes)\/[^\)]+\)/g, '`$1`'); // no external links.
    text = text.replace(/# /g, '### '); // increase header levels
    text = removeLines(text, '#### Hierarchy', '#### Properties'); // remove cruft
    text = removeLines(text, '### Module: "src/read"', '##### read', true); // remove cruft
    text = removeLines(text, '### Module: "src/write"', '##### write', true); // remove cruft
    text = removeLines(text, '#### Object literals', 'EOF'); // remove cruft

    return body.replace(
        new RegExp(`<!-- begin:${id} -->\n([^<]+)<!-- end:${id} -->`),
        `
<!-- begin:${id} -->

${ text }
<!-- end:${id} -->
`.trim()
    );
}

function removeLines(text: string, from: string, to: string, inclusive: boolean = false): string {
    const lines = [];
    let isSkipping = false;
    for (const line of text.split('\n')) {
        if (line === to) isSkipping = false;
        if (isSkipping || line === to && inclusive) continue;
        if (line === from) {
            isSkipping = true;
            continue;
        }
        lines.push(line);
    }
    return lines.join('\n');
}
