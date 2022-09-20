declare module "imgur";

declare module "*.png";
declare module "*.jpg";
declare module "*.svg";
declare module "*.woff";

declare module "ansi-to-html";

declare module "require-without-cache";
declare module "react-transition-group";
declare module "tai-password-strength";

interface Window {
  /**
   * Needed for KeyboardManager conflict resolution
   */
  handlingEnterKey: boolean | undefined;
}
