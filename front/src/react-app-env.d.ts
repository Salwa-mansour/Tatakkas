declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
interface ImportMetaEnv {
  readonly VITE_SANITY_PROJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}