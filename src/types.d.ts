import { Segment, AuthorizationContext, TwitchContext } from "./typings";

export interface TwitchExtension {
  onAuthorized: (func: (context: AuthorizationContext) => void) => void;
  features: {
    onChanged: (callback: (changes: string[]) => void) => void;
  };
  configuration: {
    global: { version: string; content: string } | undefined;
    developer: { version: string; content: string } | undefined;
    broadcaster: { version: string; content: string } | undefined;
    set: (segment: Segment, version: string, content: string) => void;
    onChanged: (callback: () => void) => void;
  };
  onContext: (
    callback: (ctx: TwitchContext, changes: string[]) => void
  ) => void;
  rig: { log: typeof console.log };
}

declare global {
  interface Window {
    Twitch: {
      ext: TwitchExtension;
    };
  }
}
