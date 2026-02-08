// Original hardcoded way to prevent scss export errors
// declare module "*/ProgressBar.module.scss" {
//   const content: Record<string, string>;
//   export default content;
//   export const progressBar: string;
//   export const progressBarContainer: string;
// }

// Have TypeScript prioritize generated SCSS types from src/type
declare module "*.module.scss";
