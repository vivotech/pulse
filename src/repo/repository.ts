import { ArteryListItem } from "@vivotech/artery/dist/list";

export interface Repository extends ArteryListItem {
  behind?: number;
  url?: string;
  path: string;
  name: string;
}
