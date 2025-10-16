import { type Registry } from "shadcn/schema"

export const lib: Registry["items"] = [
  {
    name: "utils",
    type: "registry:lib",
    dependencies: ["clsx", "tailwind-merge"],
    files: [
      {
        path: "lib/utils.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "springs",
    type: "registry:lib",
    dependencies: ["motion"],
    files: [
      {
        path: "lib/springs.ts",
        type: "registry:lib",
      },
    ],
  },
]
