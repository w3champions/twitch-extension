import { Segment } from "./typings";

export interface AuthorizationContext {
  channelId: string;
}

export interface TwitchExtension {
  onAuthorized: (func: (context: AuthorizationContext) => void) => void;
  configuration: {
    global: { version: string; content: string } | undefined;
    developer: { version: string; content: string } | undefined;
    broadcaster: { version: string; content: string } | undefined;
    set: (segment: Segment, version: string, content: string) => void;
    onChanged: (callback: () => void) => void;
  };
  rig: { log: typeof console.log };
}

declare global {
  interface Window {
    Twitch: {
      ext: TwitchExtension;
    };
  }
}
