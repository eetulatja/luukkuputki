/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "No circular dependencies allowed",
      from: {},
      to: { circular: true },
    },
    {
      name: "shared-must-not-import-packages",
      severity: "error",
      comment: "shared must not import from any other workspace package",
      from: { path: "^packages/shared/" },
      to: {
        path: "^packages/(?!shared/)",
      },
    },
    {
      name: "producer-only-imports-shared",
      severity: "error",
      comment: "producer may only import from shared",
      from: { path: "^packages/producer/" },
      to: {
        path: "^packages/",
        pathNot: "^packages/shared/",
      },
    },
    {
      name: "processor-only-imports-shared",
      severity: "error",
      comment: "processor may only import from shared",
      from: { path: "^packages/processor/" },
      to: {
        path: "^packages/",
        pathNot: "^packages/shared/",
      },
    },
    {
      name: "serving-only-imports-shared",
      severity: "error",
      comment: "serving may only import from shared",
      from: { path: "^packages/serving/" },
      to: {
        path: "^packages/",
        pathNot: "^packages/shared/",
      },
    },
    {
      name: "api-only-imports-shared",
      severity: "error",
      comment: "api may only import from shared",
      from: { path: "^packages/api/" },
      to: {
        path: "^packages/",
        pathNot: "^packages/shared/",
      },
    },
    {
      name: "web-only-imports-shared",
      severity: "error",
      comment: "web may only import from shared",
      from: { path: "^packages/web/" },
      to: {
        path: "^packages/",
        pathNot: "^packages/shared/",
      },
    },
    {
      name: "orchestrator-only-imports-shared",
      severity: "error",
      comment: "orchestrator may only import from shared",
      from: { path: "^packages/orchestrator/" },
      to: {
        path: "^packages/",
        pathNot: "^packages/shared/",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    moduleSystems: ["es6", "cjs"],
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.json",
    },
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};
