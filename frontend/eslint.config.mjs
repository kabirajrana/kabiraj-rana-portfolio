const config = [
  {
    ignores: [".next/**", ".next-dev/**", "node_modules/**"],
  },
  ...((await import("eslint-config-next/core-web-vitals")).default ?? []),
  ...((await import("eslint-config-next/typescript")).default ?? []),
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;
