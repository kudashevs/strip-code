import fs from 'fs';
import path from 'path';

function readFixture(file) {
  const extension = path.extname(file) || '.js';
  const filename = path.basename(file, extension);
  const filePath = path.resolve(__dirname, `../fixtures/${filename + extension}`);

  return fs.readFileSync(filePath, 'utf-8');
}

export default readFixture;
