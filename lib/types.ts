export type Song = {
  id: string;
  title: string;
  uri: string;
  duration: number;
  artist: string;
};

export type RepeatMode = "off" | "all" | "one";
