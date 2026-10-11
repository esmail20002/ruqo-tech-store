const fs = require('node:fs/promises');
const path = require('node:path');

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/').pop() || 'ruqo-tech-store';
const basePath = `/${repositoryName}/`;
const sourceDirectory = path.resolve('public');
const outputDirectory = path.resolve('dist');
const transformExtensions = new Set(['.html', '.js', '.css']);

async function copyAndRewrite(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(directory, entry.name);
    const relativePath = path.relative(sourceDirectory, sourcePath);
    const outputPath = path.join(outputDirectory, relativePath);

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
