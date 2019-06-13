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

```json
husky 为 prettier 在 pre-commit 加个钩子.
只要你想提交，就必须格式化成 prettier 要求的样子，这样就没有那种因为格式变动出现的无聊的 diff 了
 "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,json,css,md,ts,tsx}": [
      "prettier --write",
      "git add"
    ]
  },
```
