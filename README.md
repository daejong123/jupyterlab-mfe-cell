## mfe-cell
```bash
# Install dependencies
npm install # or yarn
# Build Typescript source
npm run build # or yarn build
# Link your development version of the extension with JupyterLab
jupyter labextension link .
# Rebuild Typescript source after making changes
npm run build # or yarn build
```

To rebuild the package and the JupyterLab app:
```bash
npm run build
jupyter lab build
```
