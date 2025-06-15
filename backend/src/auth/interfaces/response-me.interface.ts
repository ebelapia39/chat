export interface ResponseMe {
  user: {
    id: number;
    nickname: string;
    name: string;
    password?: string;
  };
}
