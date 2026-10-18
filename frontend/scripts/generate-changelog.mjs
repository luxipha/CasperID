import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const log = execFileSync('git', ['log', '-30', '--format=- %s (%h)'], { encoding: 'utf8' });
writeFileSync('CHANGELOG.md', '# Changelog\n\n' + log);
