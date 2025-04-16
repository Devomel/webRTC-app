import pluginJs from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
   { files: ["**/*.{js,mjs,cjs,ts,jsx}"] },
   { languageOptions: { globals: globals.browser } },
   pluginJs.configs.recommended,
   ...tseslint.configs.recommended,
   pluginReact.configs.flat.recommended,
   {
      plugins: {
         import: importPlugin,
      },
      rules: {
         "react/react-in-jsx-scope": "off",
         "react/jsx-uses-react": "off",

         "import/order": [
            "error",
            {
               "groups": [
                  "builtin",      // Node.js built-in modules
                  "external",     // External libraries like react, redux, etc.
                  "internal",     // Internal modules within the project
                  "parent",       // Parent imports (e.g., ../someModule)
                  "sibling",      // Sibling imports (e.g., ./someModule)
                  "index",        // Index imports (e.g., ./)
                  "object",       // Imports of objects (ES6 imports)
                  "type"          // Type imports (for TypeScript)
               ],

               "alphabetize": { "order": "asc", "caseInsensitive": true }
            }
         ],

      },
   },
];
