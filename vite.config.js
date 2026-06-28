import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` must match your GitHub Pages project path.
// Site is served at https://wibbles790.github.io/Workout/ so base is "/Workout/".
// If you ever rename the repo, update this to "/<new-repo-name>/".
export default defineConfig({
  base: "/Workout/",
  plugins: [react()],
});
