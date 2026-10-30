const fs = require('node:fs/promises');
const path = require('node:path');

const basePath = process.env.SITE_BASE_PATH || '/';
const sourceDirectory = path.resolve('public');
const outputDirectory = path.resolve('dist');
const transformExtensions = new Set(['.html', '.js', '.css']);
const localOnlyPaths = new Set([
  'experiments.html',
  'experiments-product.html',
  path.join('css', 'experiments.css'),
  path.join('css', 'experiment-switcher.css'),
  path.join('js', 'experiments.js'),
  // Local-only preview credentials; ignored by Git and never published.
  path.join('js', 'admin-local-dev.js'),
]);

async function copyAndRewrite(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(directory, entry.name);
    const relativePath = path.relative(sourceDirectory, sourcePath);
    const outputPath = path.join(outputDirectory, relativePath);

    if (localOnlyPaths.has(relativePath)) continue;

    if (entry.isDirectory()) {
      await fs.mkdir(outputPath, { recursive: true });
      await copyAndRewrite(sourcePath);
      continue;
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const extension = path.extname(entry.name).toLowerCase();

    if (!transformExtensions.has(extension)) {
      await fs.copyFile(sourcePath, outputPath);
      continue;
    }

    const contents = await fs.readFile(sourcePath, 'utf8');
    const rewritten = contents
      .replace(/((?:href|src|action)\s*=\s*["'`])\/(?!\/)/gi, `$1${basePath}`)
      .replace(/url\(\s*(["']?)\/(?!\/)/gi, `url($1${basePath}`);
    await fs.writeFile(outputPath, rewritten);
  }
}

fs.rm(outputDirectory, { recursive: true, force: true })
  .then(() => copyAndRewrite(sourceDirectory))
  .then(() => console.log(`Built GitHub Pages site at ${outputDirectory} with base path ${basePath}`))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
